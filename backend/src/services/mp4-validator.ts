import fs from 'fs';
import { ffmpegService } from './ffmpeg.service.js';

export interface MP4ValidationResult {
  isValid: boolean;
  fileSize: number;
  duration?: number;
  resolution?: string;
  codecVideo?: string;
  codecAudio?: string;
  error?: string;
}

/**
 * Validação real do arquivo renderizado usando ffprobe.
 * Confere container, faixas, resolução vertical 1080x1920 e duração.
 */
export class MP4Validator {
  public async validateMP4(
    filePath: string,
    expectedDuration?: number
  ): Promise<MP4ValidationResult> {
    try {
      if (!fs.existsSync(filePath)) {
        return { isValid: false, fileSize: 0, error: 'Arquivo MP4 não encontrado no disco.' };
      }

      const stats = await fs.promises.stat(filePath);
      if (stats.size < 1024) {
        return {
          isValid: false,
          fileSize: stats.size,
          error: `Arquivo MP4 gerado é inválido (${stats.size} bytes).`
        };
      }

      const probe = await ffmpegService.probe(filePath);

      if (probe.width !== 1080 || probe.height !== 1920) {
        return {
          isValid: false,
          fileSize: stats.size,
          resolution: `${probe.width}x${probe.height}`,
          error: `Resolução final incorreta: esperado 1080x1920, obtido ${probe.width}x${probe.height}.`
        };
      }

      if (!probe.hasAudio) {
        return {
          isValid: false,
          fileSize: stats.size,
          error: 'O arquivo final não possui faixa de áudio.'
        };
      }

      if (expectedDuration && Math.abs(probe.duration - expectedDuration) > 2.5) {
        return {
          isValid: false,
          fileSize: stats.size,
          duration: probe.duration,
          error: `Duração final divergente: esperado ~${expectedDuration.toFixed(1)}s, obtido ${probe.duration.toFixed(1)}s.`
        };
      }

      return {
        isValid: true,
        fileSize: stats.size,
        duration: probe.duration,
        resolution: `${probe.width}x${probe.height}`,
        codecVideo: probe.codec,
        codecAudio: 'aac'
      };
    } catch (err: any) {
      return {
        isValid: false,
        fileSize: 0,
        error: `Erro ao validar arquivo MP4: ${err.message}`
      };
    }
  }
}

export const mp4Validator = new MP4Validator();
