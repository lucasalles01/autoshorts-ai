import { env } from '../config/env.js';
import { ffmpegService } from './ffmpeg.service.js';

interface ThumbnailOptions {
  timestamp?: number;
  width?: number;
  height?: number;
  quality?: number;
  addText?: boolean;
  text?: string;
  textColor?: string;
  fontSize?: number;
}

export class ThumbnailService {
  async generateThumbnail(
    videoPath: string,
    outputPath: string,
    options: ThumbnailOptions = {}
  ): Promise<string> {
    const {
      timestamp = 5, // Pega frame aos 5 segundos por padrão
      width = 1280,
      height = 720,
      quality = 85,
      addText = false,
      text = '',
      textColor = '#FFFFFF',
      fontSize = 48
    } = options;

    try {
      // Verificar se FFmpeg está disponível
      if (!await ffmpegService.isAvailable()) {
        throw new Error('FFmpeg não está disponível');
      }

      // Gerar thumbnail com FFmpeg
      const command = [
        '-ss', timestamp.toString(),
        '-i', videoPath,
        '-vframes', '1',
        '-vf', `scale=${width}:${height}`,
        '-q:v', quality.toString(),
        '-y', // Sobrescrever arquivo existente
        outputPath
      ];

      await ffmpegService.runFFmpeg(command);

      // Adicionar texto se solicitado
      if (addText && text) {
        await this.addTextToThumbnail(outputPath, outputPath, text, textColor, fontSize);
      }

      return outputPath;
    } catch (error) {
      console.error('Erro ao gerar thumbnail:', error);
      throw new Error('Falha ao gerar thumbnail');
    }
  }

  async generateBestFrame(
    videoPath: string,
    outputPath: string,
    options: ThumbnailOptions = {}
  ): Promise<string> {
    try {
      // Análise de "scene detection" para encontrar o melhor frame
      // Por enquanto, usa heurística simples: 25% do vídeo
      const duration = await this.getVideoDuration(videoPath);
      const bestTimestamp = duration * 0.25; // 25% do vídeo

      return await this.generateThumbnail(videoPath, outputPath, {
        ...options,
        timestamp: bestTimestamp
      });
    } catch (error) {
      console.error('Erro ao gerar melhor frame:', error);
      // Fallback para timestamp padrão
      return await this.generateThumbnail(videoPath, outputPath, options);
    }
  }

  async addTextToThumbnail(
    inputPath: string,
    outputPath: string,
    text: string,
    textColor: string = '#FFFFFF',
    fontSize: number = 48
  ): Promise<void> {
    try {
      const command = [
        '-i', inputPath,
        '-vf', `drawtext=text='${text}':fontcolor=${textColor}:fontsize=${fontSize}:x=(w-text_w)/2:y=(h-text_h)/2`,
        '-y',
        outputPath
      ];

      await ffmpegService.runFFmpeg(command);
    } catch (error) {
      console.error('Erro ao adicionar texto ao thumbnail:', error);
      throw new Error('Falha ao adicionar texto ao thumbnail');
    }
  }

  async generateAIEnhancedThumbnail(
    videoPath: string,
    outputPath: string,
    title: string,
    options: ThumbnailOptions = {}
  ): Promise<string> {
    try {
      // Se tiver OpenAI API, poderia usar DALL-E para gerar thumbnail
      // Por enquanto, usa método tradicional com título
      return await this.generateThumbnail(videoPath, outputPath, {
        ...options,
        addText: true,
        text: title,
        textColor: '#FFFFFF',
        fontSize: 36
      });
    } catch (error) {
      console.error('Erro ao gerar thumbnail IA:', error);
      throw new Error('Falha ao gerar thumbnail IA');
    }
  }

  private async getVideoDuration(videoPath: string): Promise<number> {
    try {
      const command = [
        '-i', videoPath,
        '-f', 'null',
        '-'
      ];

      const output = await ffmpegService.runFFmpeg(command, true);
      
      // Parse duration do output do FFmpeg
      const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
      if (durationMatch) {
        const hours = parseInt(durationMatch[1]);
        const minutes = parseInt(durationMatch[2]);
        const seconds = parseFloat(durationMatch[3]);
        return hours * 3600 + minutes * 60 + seconds;
      }

      return 60; // Fallback para 60 segundos
    } catch (error) {
      console.error('Erro ao obter duração do vídeo:', error);
      return 60; // Fallback
    }
  }
}

export const thumbnailService = new ThumbnailService();