import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

function resolveBinary(envVar: string, moduleName: string): string {
  const fromEnv = process.env[envVar];
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;

  try {
    const resolved = require(moduleName);
    const binPath = typeof resolved === 'string' ? resolved : resolved?.path;
    if (binPath && fs.existsSync(binPath)) return binPath;
  } catch {
    // módulo não instalado — cai no PATH do sistema
  }

  return moduleName === 'ffprobe-static' ? 'ffprobe' : 'ffmpeg';
}

export const FFMPEG_PATH = resolveBinary('FFMPEG_PATH', 'ffmpeg-static');
export const FFPROBE_PATH = resolveBinary('FFPROBE_PATH', 'ffprobe-static');

export interface VideoProbeResult {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  hasAudio: boolean;
  size: number;
  bitrate: number;
}

export interface RenderClipOptions {
  inputPath: string;
  outputPath: string;
  startTime: number;
  duration: number;
  sourceWidth: number;
  sourceHeight: number;
  cropX?: number;
  cropY?: number;
  hasAudio: boolean;
  subtitlePath?: string;
  onProgress?: (percent: number) => void;
}

export class FfmpegService {
  private toEven(value: number): number {
    const rounded = Math.round(value);
    return rounded % 2 === 0 ? rounded : rounded - 1;
  }

  private clamp(value: number, min: number, max: number): number {
    if (max < min) return min;
    return Math.max(min, Math.min(value, max));
  }

  private run(binary: string, args: string[], onStderr?: (chunk: string) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(binary, args, { windowsHide: true });
      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (d) => {
        stdout += d.toString();
      });
      child.stderr?.on('data', (d) => {
        const chunk = d.toString();
        stderr += chunk;
        onStderr?.(chunk);
      });

      child.on('error', (err) =>
        reject(new Error(`Falha ao executar ${path.basename(binary)}: ${err.message}`))
      );

      child.on('close', (code) => {
        if (code === 0) return resolve(stdout || stderr);
        const tail = stderr.split('\n').filter(Boolean).slice(-8).join('\n');
        reject(new Error(`${path.basename(binary)} terminou com código ${code}. Detalhes:\n${tail}`));
      });
    });
  }

  public async isAvailable(): Promise<boolean> {
    try {
      await this.run(FFMPEG_PATH, ['-hide_banner', '-version']);
      await this.run(FFPROBE_PATH, ['-hide_banner', '-version']);
      return true;
    } catch {
      return false;
    }
  }

  public async probe(filePath: string): Promise<VideoProbeResult> {
    const raw = await this.run(FFPROBE_PATH, [
      '-v',
      'error',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      filePath
    ]);

    const parsed = JSON.parse(raw);
    const streams: any[] = parsed.streams || [];
    const videoStream = streams.find((s) => s.codec_type === 'video');
    const audioStream = streams.find((s) => s.codec_type === 'audio');

    if (!videoStream) {
      throw new Error('O arquivo enviado não contém nenhuma faixa de vídeo válida.');
    }

    let fps = 30;
    if (typeof videoStream.r_frame_rate === 'string' && videoStream.r_frame_rate.includes('/')) {
      const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
      if (num > 0 && den > 0) fps = num / den;
    }

    const duration =
      Number(parsed.format?.duration) ||
      Number(videoStream.duration) ||
      0;

    if (!duration || duration <= 0) {
      throw new Error('Não foi possível determinar a duração do vídeo enviado.');
    }

    return {
      duration,
      width: Number(videoStream.width) || 0,
      height: Number(videoStream.height) || 0,
      fps: Math.round(fps * 100) / 100,
      codec: videoStream.codec_name || 'unknown',
      hasAudio: Boolean(audioStream),
      size: Number(parsed.format?.size) || 0,
      bitrate: Number(parsed.format?.bit_rate) || 0
    };
  }

  /**
   * Detecta os trechos de silêncio reais do áudio para que os cortes
   * comecem e terminem em pausas naturais da fala.
   */
  public async detectSilences(
    filePath: string,
    noiseDb = -32,
    minSilenceDuration = 0.45
  ): Promise<{ start: number; end: number }[]> {
    const silences: { start: number; end: number }[] = [];
    let pendingStart: number | null = null;

    const output = await this.run(FFMPEG_PATH, [
      '-hide_banner',
      '-nostats',
      '-i',
      filePath,
      '-af',
      `silencedetect=noise=${noiseDb}dB:d=${minSilenceDuration}`,
      '-f',
      'null',
      '-'
    ]);

    for (const line of output.split('\n')) {
      const startMatch = line.match(/silence_start:\s*(-?[\d.]+)/);
      if (startMatch) {
        pendingStart = Math.max(0, parseFloat(startMatch[1]));
        continue;
      }
      const endMatch = line.match(/silence_end:\s*([\d.]+)/);
      if (endMatch && pendingStart !== null) {
        silences.push({ start: pendingStart, end: parseFloat(endMatch[1]) });
        pendingStart = null;
      }
    }

    return silences;
  }

  /**
   * Mede volume médio e de pico de um trecho — usado para estimar
   * intensidade emocional e dinâmica real do áudio.
   */
  public async measureVolume(
    filePath: string,
    startTime: number,
    duration: number
  ): Promise<{ meanVolume: number; maxVolume: number }> {
    const output = await this.run(FFMPEG_PATH, [
      '-hide_banner',
      '-nostats',
      '-nostdin',
      '-ss',
      startTime.toFixed(3),
      '-t',
      duration.toFixed(3),
      '-i',
      filePath,
      '-vn',
      '-af',
      'volumedetect',
      '-f',
      'null',
      '-'
    ]);

    const mean = output.match(/mean_volume:\s*(-?[\d.]+) dB/);
    const max = output.match(/max_volume:\s*(-?[\d.]+) dB/);

    return {
      meanVolume: mean ? parseFloat(mean[1]) : -30,
      maxVolume: max ? parseFloat(max[1]) : -10
    };
  }

  /**
   * Calcula o filtro de recorte para 9:16 preservando o máximo de imagem possível.
   * Vídeo horizontal -> recorte lateral. Vídeo já vertical -> recorte/ajuste de altura.
   */
  public buildCropFilter(
    sourceWidth: number,
    sourceHeight: number,
    cropX?: number,
    cropY?: number
  ): { filter: string; cropWidth: number; cropHeight: number; x: number; y: number } {
    const targetRatio = 9 / 16;
    const sourceRatio = sourceWidth / sourceHeight;

    let cropWidth: number;
    let cropHeight: number;
    let x: number;
    let y: number;

    if (sourceRatio > targetRatio) {
      cropHeight = this.toEven(sourceHeight);
      cropWidth = this.toEven(sourceHeight * targetRatio);
      const defaultX = (sourceWidth - cropWidth) / 2;
      x = this.toEven(this.clamp(cropX ?? defaultX, 0, sourceWidth - cropWidth));
      y = 0;
    } else {
      cropWidth = this.toEven(sourceWidth);
      cropHeight = this.toEven(sourceWidth / targetRatio);
      if (cropHeight > sourceHeight) cropHeight = this.toEven(sourceHeight);
      const defaultY = (sourceHeight - cropHeight) / 2;
      x = 0;
      y = this.toEven(this.clamp(cropY ?? defaultY, 0, sourceHeight - cropHeight));
    }

    const filter = `crop=${cropWidth}:${cropHeight}:${x}:${y},scale=1080:1920:flags=lanczos,setsar=1`;
    return { filter, cropWidth, cropHeight, x, y };
  }

  private escapeFilterPath(filePath: string): string {
    // O filtro subtitles exige escape de "\", ":" e "'" no Windows
    return filePath.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
  }

  /**
   * Renderiza o corte final: recorte vertical 1080x1920, normalização de áudio
   * a -16 LUFS e legendas queimadas (quando houver arquivo .ass).
   */
  public async renderVerticalClip(options: RenderClipOptions): Promise<void> {
    const {
      inputPath,
      outputPath,
      startTime,
      duration,
      sourceWidth,
      sourceHeight,
      cropX,
      cropY,
      hasAudio,
      subtitlePath,
      onProgress
    } = options;

    const crop = this.buildCropFilter(sourceWidth, sourceHeight, cropX, cropY);
    let videoFilter = crop.filter;
    if (subtitlePath && fs.existsSync(subtitlePath)) {
      videoFilter += `,subtitles='${this.escapeFilterPath(subtitlePath)}'`;
    }

    const args: string[] = ['-hide_banner', '-nostdin', '-y', '-ss', startTime.toFixed(3)];

    if (!hasAudio) {
      args.push('-f', 'lavfi', '-t', duration.toFixed(3), '-i', 'anullsrc=r=44100:cl=stereo');
    }

    args.push('-t', duration.toFixed(3), '-i', inputPath);

    if (hasAudio) {
      args.push('-map', '0:v:0', '-map', '0:a:0?');
    } else {
      args.push('-map', '1:v:0', '-map', '0:a:0');
    }

    args.push(
      '-vf',
      videoFilter,
      '-af',
      'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '20',
      '-profile:v',
      'high',
      '-pix_fmt',
      'yuv420p',
      '-r',
      '30',
      '-g',
      '60',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-shortest',
      '-movflags',
      '+faststart',
      '-progress',
      'pipe:2',
      outputPath
    );

    await this.run(FFMPEG_PATH, args, (chunk) => {
      if (!onProgress) return;
      const match = chunk.match(/out_time_ms=(\d+)/);
      if (match) {
        const seconds = Number(match[1]) / 1_000_000;
        onProgress(Math.min(100, Math.round((seconds / duration) * 100)));
      }
    });

    if (!fs.existsSync(outputPath)) {
      throw new Error('O FFmpeg finalizou mas o arquivo de saída não foi criado.');
    }
  }

  public async extractThumbnail(
    inputPath: string,
    outputPath: string,
    atSecond: number
  ): Promise<void> {
    await this.run(FFMPEG_PATH, [
      '-hide_banner',
      '-nostdin',
      '-y',
      '-ss',
      Math.max(0, atSecond).toFixed(3),
      '-i',
      inputPath,
      '-frames:v',
      '1',
      '-vf',
      'scale=540:960:force_original_aspect_ratio=increase,crop=540:960',
      '-q:v',
      '3',
      outputPath
    ]);
  }

  public async extractAudioForTranscription(
    inputPath: string,
    outputPath: string,
    startTime?: number,
    duration?: number
  ): Promise<void> {
    const args = ['-hide_banner', '-nostdin', '-y'];
    if (startTime !== undefined) args.push('-ss', startTime.toFixed(3));
    if (duration !== undefined) args.push('-t', duration.toFixed(3));
    args.push('-i', inputPath, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'libmp3lame', '-b:a', '64k', outputPath);
    await this.run(FFMPEG_PATH, args);
  }
}

export const ffmpegService = new FfmpegService();
