import { ffmpegService } from './ffmpeg.service.js';
import { aiCutEngine, RawCandidate, ScoredCandidate } from './ai-cut-engine.js';

export interface SpeechRegion {
  start: number;
  end: number;
}

export interface CutDetectionOptions {
  minDuration?: number;
  maxDuration?: number;
  maxCandidates?: number;
}

/**
 * Detector de cortes baseado em sinais reais do arquivo de vídeo:
 * - silencedetect do FFmpeg para achar pausas naturais da fala
 * - volumedetect por janela para medir dinâmica/intensidade do áudio
 *
 * Nenhuma pontuação é aleatória: todas derivam de medições do próprio vídeo.
 */
export class CutDetector {
  public buildSpeechRegions(
    silences: { start: number; end: number }[],
    duration: number
  ): SpeechRegion[] {
    const regions: SpeechRegion[] = [];
    let cursor = 0;

    for (const silence of silences) {
      if (silence.start > cursor + 0.2) {
        regions.push({ start: cursor, end: Math.min(silence.start, duration) });
      }
      cursor = Math.max(cursor, silence.end);
    }

    if (cursor < duration - 0.2) {
      regions.push({ start: cursor, end: duration });
    }

    return regions.filter((r) => r.end - r.start >= 0.3);
  }

  private buildFallbackWindows(
    duration: number,
    minDuration: number,
    maxDuration: number,
    maxCandidates: number
  ): SpeechRegion[] {
    // Vídeo sem áudio ou sem fala detectável: janelas uniformes reais do vídeo
    const windowLength = Math.min(maxDuration, Math.max(minDuration, 35));
    const windows: SpeechRegion[] = [];
    let cursor = 0;

    while (cursor + minDuration <= duration && windows.length < maxCandidates) {
      windows.push({ start: cursor, end: Math.min(duration, cursor + windowLength) });
      cursor += windowLength;
    }

    return windows;
  }

  /**
   * Agrupa regiões de fala em janelas que começam e terminam em pausas reais.
   */
  private buildWindows(
    regions: SpeechRegion[],
    minDuration: number,
    maxDuration: number,
    maxCandidates: number
  ): SpeechRegion[] {
    const windows: SpeechRegion[] = [];
    let index = 0;

    while (index < regions.length && windows.length < maxCandidates) {
      const start = regions[index].start;
      let end = regions[index].end;
      let cursor = index;

      while (cursor + 1 < regions.length && regions[cursor + 1].end - start <= maxDuration) {
        cursor++;
        end = regions[cursor].end;
      }

      const length = end - start;
      if (length >= minDuration) {
        windows.push({ start, end });
        index = cursor + 1;
      } else if (cursor + 1 < regions.length) {
        // Janela curta: força a inclusão do próximo trecho para atingir a duração mínima
        cursor++;
        end = Math.min(regions[cursor].end, start + maxDuration);
        if (end - start >= minDuration) {
          windows.push({ start, end });
        }
        index = cursor + 1;
      } else {
        index = cursor + 1;
      }
    }

    return windows;
  }

  private scoreFromSignals(params: {
    speechRatio: number;
    hookSpeechRatio: number;
    cleanStart: boolean;
    cleanEnd: boolean;
    internalPauses: number;
    longPauses: number;
    dynamicRange: number;
    meanVolume: number;
  }): Omit<RawCandidate, 'startTime' | 'endTime' | 'transcriptSnippet'> {
    const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

    // Dinâmica típica de fala: 6 dB (monótono) a 25 dB (muito expressivo)
    const dynamicNorm = Math.max(0, Math.min(1, (params.dynamicRange - 6) / 19));
    // Nível médio saudável entre -30 dB e -12 dB
    const levelNorm = Math.max(0, Math.min(1, (params.meanVolume + 30) / 18));

    // Algoritmo melhorado para seleção de cortes mais inteligentes
    return {
      hookScore: clamp(60 + params.hookSpeechRatio * 35 + (params.cleanStart ? 15 : 0) + dynamicNorm * 10),
      contextScore: clamp(70 + (params.cleanStart ? 20 : 0) + (params.cleanEnd ? 20 : 0) + params.speechRatio * 10),
      coherenceScore: clamp(95 - params.longPauses * 10 - (params.internalPauses > 8 ? 15 : 0)),
      emotionScore: clamp(55 + dynamicNorm * 45 + levelNorm * 15 + params.speechRatio * 10),
      retentionScore: clamp(50 + params.speechRatio * 45 + dynamicNorm * 10 + (params.cleanStart ? 10 : 0)),
      shareabilityScore: clamp(55 + params.speechRatio * 35 + dynamicNorm * 25 + (params.cleanEnd ? 10 : 0)),
      commentabilityScore: clamp(
        55 + Math.min(params.internalPauses, 5) * 5 + dynamicNorm * 25 + params.speechRatio * 10
      )
    };
  }

  public async detectCandidates(
    filePath: string,
    duration: number,
    hasAudio: boolean,
    options: CutDetectionOptions = {}
  ): Promise<ScoredCandidate[]> {
    const minDuration = options.minDuration ?? 20;
    const maxDuration = options.maxDuration ?? 58;
    const maxCandidates = options.maxCandidates ?? 12;

    if (duration <= minDuration) {
      // Vídeo menor que a duração mínima: o corte é o próprio vídeo
      const single = await this.buildCandidate(
        filePath,
        { start: 0, end: duration },
        [],
        duration,
        hasAudio
      );
      return [single];
    }

    let silences: { start: number; end: number }[] = [];
    let windows: SpeechRegion[] = [];

    if (hasAudio) {
      silences = await ffmpegService.detectSilences(filePath);
      const regions = this.buildSpeechRegions(silences, duration);
      windows = this.buildWindows(regions, minDuration, maxDuration, maxCandidates);
    }

    if (windows.length === 0) {
      windows = this.buildFallbackWindows(duration, minDuration, maxDuration, maxCandidates);
    }

    const candidates: ScoredCandidate[] = [];
    for (const window of windows) {
      candidates.push(await this.buildCandidate(filePath, window, silences, duration, hasAudio));
    }

    return candidates.sort((a, b) => b.finalScore - a.finalScore);
  }

  private async buildCandidate(
    filePath: string,
    window: SpeechRegion,
    silences: { start: number; end: number }[],
    videoDuration: number,
    hasAudio: boolean
  ): Promise<ScoredCandidate> {
    const startTime = Math.max(0, window.start);
    const endTime = Math.min(videoDuration, window.end);
    const windowDuration = Math.max(1, endTime - startTime);

    const inside = silences.filter((s) => s.end > startTime && s.start < endTime);
    const silenceInside = inside.reduce(
      (total, s) => total + (Math.min(s.end, endTime) - Math.max(s.start, startTime)),
      0
    );

    const speechRatio = Math.max(0, Math.min(1, 1 - silenceInside / windowDuration));
    const hookEnd = Math.min(endTime, startTime + 4);
    const hookSilence = inside.reduce(
      (total, s) => total + Math.max(0, Math.min(s.end, hookEnd) - Math.max(s.start, startTime)),
      0
    );
    const hookSpeechRatio = Math.max(0, Math.min(1, 1 - hookSilence / Math.max(1, hookEnd - startTime)));

    const cleanStart = silences.some((s) => Math.abs(s.end - startTime) < 0.75);
    const cleanEnd = silences.some((s) => Math.abs(s.start - endTime) < 0.75);
    const longPauses = inside.filter((s) => s.end - s.start >= 1.5).length;

    let meanVolume = -22;
    let maxVolume = -6;
    if (hasAudio) {
      try {
        const measured = await ffmpegService.measureVolume(filePath, startTime, windowDuration);
        meanVolume = measured.meanVolume;
        maxVolume = measured.maxVolume;
      } catch {
        // mantém valores neutros se a medição falhar
      }
    }

    const raw: RawCandidate = {
      startTime: Math.round(startTime * 100) / 100,
      endTime: Math.round(endTime * 100) / 100,
      transcriptSnippet: '',
      ...this.scoreFromSignals({
        speechRatio,
        hookSpeechRatio,
        cleanStart,
        cleanEnd,
        internalPauses: inside.length,
        longPauses,
        dynamicRange: maxVolume - meanVolume,
        meanVolume
      })
    };

    return aiCutEngine.calculateWeightedFinalScore(raw, Math.round(windowDuration * 100) / 100);
  }
}

export const cutDetector = new CutDetector();
