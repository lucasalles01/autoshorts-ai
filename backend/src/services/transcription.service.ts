import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import { ffmpegService } from './ffmpeg.service.js';

export interface TranscriptSegmentResult {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface TranscriptWordResult {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptionResult {
  provider: string;
  language: string;
  fullText: string;
  segments: TranscriptSegmentResult[];
  words: TranscriptWordResult[];
}

const CHUNK_SECONDS = 600; // 10 min por requisição (limite de 25 MB da API)

/**
 * Transcrição real via API Whisper da OpenAI.
 * Se OPENAI_API_KEY não estiver configurada o serviço fica desativado e o
 * pipeline segue sem legendas, em vez de inventar uma transcrição falsa.
 */
export class TranscriptionService {
  public isEnabled(): boolean {
    return Boolean(env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 20);
  }

  public get providerName(): string {
    return this.isEnabled() ? 'OPENAI_WHISPER' : 'NONE';
  }

  private async transcribeChunk(
    audioPath: string,
    offsetSeconds: number
  ): Promise<{ text: string; segments: TranscriptSegmentResult[]; words: TranscriptWordResult[]; language: string }> {
    const buffer = await fs.promises.readFile(audioPath);
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: 'audio/mpeg' }), path.basename(audioPath));
    form.append('model', 'whisper-1');
    form.append('response_format', 'verbose_json');
    form.append('timestamp_granularities[]', 'word');
    form.append('timestamp_granularities[]', 'segment');
    if (env.TRANSCRIPTION_LANGUAGE) form.append('language', env.TRANSCRIPTION_LANGUAGE);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: form
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Whisper API retornou ${response.status}: ${detail.substring(0, 300)}`);
    }

    const data: any = await response.json();

    const segments: TranscriptSegmentResult[] = (data.segments || []).map((s: any, i: number) => ({
      id: i,
      start: Number(s.start) + offsetSeconds,
      end: Number(s.end) + offsetSeconds,
      text: String(s.text || '').trim()
    }));

    const words: TranscriptWordResult[] = (data.words || []).map((w: any) => ({
      word: String(w.word || '').trim(),
      start: Number(w.start) + offsetSeconds,
      end: Number(w.end) + offsetSeconds
    }));

    return {
      text: String(data.text || '').trim(),
      segments,
      words,
      language: data.language || env.TRANSCRIPTION_LANGUAGE || 'pt'
    };
  }

  public async transcribe(
    videoPath: string,
    tmpDir: string,
    totalDuration: number,
    onProgress?: (percent: number) => void
  ): Promise<TranscriptionResult | null> {
    if (!this.isEnabled()) return null;

    await fs.promises.mkdir(tmpDir, { recursive: true });

    const chunkCount = Math.max(1, Math.ceil(totalDuration / CHUNK_SECONDS));
    const allSegments: TranscriptSegmentResult[] = [];
    const allWords: TranscriptWordResult[] = [];
    const texts: string[] = [];
    let language = env.TRANSCRIPTION_LANGUAGE || 'pt';

    for (let index = 0; index < chunkCount; index++) {
      const offset = index * CHUNK_SECONDS;
      const chunkDuration = Math.min(CHUNK_SECONDS, totalDuration - offset);
      if (chunkDuration <= 0.5) break;

      const audioPath = path.join(tmpDir, `chunk_${index}_${Date.now()}.mp3`);

      try {
        await ffmpegService.extractAudioForTranscription(videoPath, audioPath, offset, chunkDuration);
        const result = await this.transcribeChunk(audioPath, offset);
        texts.push(result.text);
        allSegments.push(...result.segments);
        allWords.push(...result.words);
        language = result.language;
      } finally {
        await fs.promises.unlink(audioPath).catch(() => undefined);
      }

      onProgress?.(Math.round(((index + 1) / chunkCount) * 100));
    }

    if (texts.length === 0) return null;

    return {
      provider: this.providerName,
      language,
      fullText: texts.join(' ').trim(),
      segments: allSegments.map((s, i) => ({ ...s, id: i })),
      words: allWords
    };
  }

  /** Recorta as palavras que pertencem ao intervalo do corte, em tempo relativo. */
  public sliceWordsForClip(
    words: TranscriptWordResult[],
    startTime: number,
    endTime: number
  ): TranscriptWordResult[] {
    return words
      .filter((w) => w.end > startTime && w.start < endTime)
      .map((w) => ({
        word: w.word,
        start: Math.max(0, w.start - startTime),
        end: Math.max(0.1, Math.min(endTime, w.end) - startTime)
      }));
  }

  public sliceTextForClip(
    segments: TranscriptSegmentResult[],
    startTime: number,
    endTime: number
  ): string {
    return segments
      .filter((s) => s.end > startTime && s.start < endTime)
      .map((s) => s.text)
      .join(' ')
      .trim();
  }
}

export const transcriptionService = new TranscriptionService();
