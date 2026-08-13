import fs from 'fs';
import { env } from '../config/env.js';
import { prisma } from '../database/client.js';
import { toJsonColumn } from '../database/serializers.js';
import { cutDetector } from '../services/cut-detector.js';
import { overlapDetector } from '../services/overlap-detector.js';
import { smartFramingEngine } from '../services/smart-framing-engine.js';
import { captionEngine } from '../services/caption-engine.js';
import { mp4Validator } from '../services/mp4-validator.js';
import { ffmpegService } from '../services/ffmpeg.service.js';
import { transcriptionService, TranscriptionResult } from '../services/transcription.service.js';
import { subtitleBuilder } from '../services/subtitle-builder.js';
import { storageService } from '../storage/storage.service.js';

// Local enums
enum JobStatus {
  QUEUED = "QUEUED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

enum ClipStatus {
  CANDIDATE = "CANDIDATE",
  SELECTED = "SELECTED",
  RENDERING = "RENDERING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

enum CaptionStyle {
  VIRAL = "VIRAL",
  PROFESSIONAL = "PROFESSIONAL",
  MINIMAL = "MINIMAL",
  NEON = "NEON"
}

enum SocialPlatform {
  TIKTOK = "TIKTOK",
  YOUTUBE = "YOUTUBE",
  INSTAGRAM = "INSTAGRAM"
}

const STOPWORDS = new Set([
  'para','com','uma','que','dos','das','por','como','não','você','vocês','isso','esse','essa',
  'mais','mas','muito','então','porque','quando','onde','também','está','estão','pela','pelo',
  'sobre','entre','tudo','todos','toda','todas','aqui','agora','sempre','nunca','ainda','vamos',
  'the','and','you','that','this','with','for','are','was','have','from'
]);

function buildTitle(clipText: string, projectName: string, index: number): string {
  const sentence = clipText
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s/)
    .map((s) => s.trim())
    .find((s) => s.length >= 15);

  const base = (sentence || clipText || projectName).replace(/\s+/g, ' ').trim();
  if (!base) return `Corte ${String(index + 1).padStart(2, '0')}`;

  const truncated = base.length > 80 ? `${base.substring(0, 77).trim()}...` : base;
  return truncated;
}

function buildHashtags(clipText: string, platform: SocialPlatform): string[] {
  const keywords = clipText
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOPWORDS.has(w));

  const unique = Array.from(new Set(keywords)).slice(0, 4);

  const platformTags: Record<SocialPlatform, string[]> = {
    [SocialPlatform.TIKTOK]: ['fyp', 'viral', 'cortes'],
    [SocialPlatform.INSTAGRAM]: ['reels', 'reelsinstagram', 'cortes'],
    [SocialPlatform.YOUTUBE]: ['shorts', 'ytshorts', 'cortes']
  };

  return [...platformTags[platform], ...unique];
}

async function setProgress(jobId: string, progress: number, stage?: string) {
  await prisma.job.update({
    where: { id: jobId },
    data: { progress: Math.max(0, Math.min(100, Math.round(progress))), ...(stage ? { stage } : {}) }
  });
}

export async function processVideoPipeline(jobData: {
  jobId: string;
  sourceVideoId: string;
  userId: string;
  projectId: string;
  maxClips?: number;
  minClipDuration?: number;
  maxClipDuration?: number;
}) {
  const { jobId, sourceVideoId, projectId, maxClips, minClipDuration, maxClipDuration } = jobData;

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.PROCESSING,
      startedAt: new Date(),
      progress: 5,
      stage: 'Preparando',
      error: null
    }
  });

  try {
    const sourceVideo = await prisma.sourceVideo.findUnique({ where: { id: sourceVideoId } });
    if (!sourceVideo) throw new Error('Vídeo original não encontrado no banco de dados.');

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    const inputPath = storageService.resolveKey(sourceVideo.storageKey);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Arquivo de vídeo não encontrado no storage: ${sourceVideo.storageKey}`);
    }

    if (!(await ffmpegService.isAvailable())) {
      throw new Error(
        'FFmpeg/FFprobe não disponíveis. Rode "npm install" no backend ou configure FFMPEG_PATH e FFPROBE_PATH.'
      );
    }

    await prisma.sourceVideo.update({
      where: { id: sourceVideoId },
      data: { status: 'PROCESSING' }
    });

    // ---------- 1. Transcrição (opcional, apenas se houver OPENAI_API_KEY) ----------
    let transcription: TranscriptionResult | null = null;
    const existing = await prisma.transcript.findFirst({ where: { sourceVideoId } });

    if (existing && existing.provider !== 'NONE') {
      transcription = {
        provider: existing.provider,
        language: existing.language,
        fullText: existing.fullText,
        segments: JSON.parse(existing.segments || '[]'),
        words: JSON.parse(existing.words || '[]')
      };
      await setProgress(jobId, 40, 'Transcrição reaproveitada');
    } else if (transcriptionService.isEnabled() && sourceVideo.hasAudio) {
      await setProgress(jobId, 10, 'Transcrevendo áudio');
      transcription = await transcriptionService.transcribe(
        inputPath,
        storageService.getStoragePath('tmp', ''),
        sourceVideo.duration,
        (percent) => {
          void setProgress(jobId, 10 + percent * 0.3, 'Transcrevendo áudio');
        }
      );

      if (transcription) {
        await prisma.transcript.create({
          data: {
            sourceVideoId,
            language: transcription.language,
            provider: transcription.provider,
            fullText: transcription.fullText,
            segments: toJsonColumn(transcription.segments),
            words: toJsonColumn(transcription.words)
          }
        });
      }
    } else {
      await setProgress(jobId, 30, 'Transcrição desativada');
    }

    // ---------- 2. Detecção real de cortes ----------
    await setProgress(jobId, 45, 'Analisando áudio e detectando cortes');
    const rawCandidates = await cutDetector.detectCandidates(
      inputPath,
      sourceVideo.duration,
      sourceVideo.hasAudio,
      {
        minDuration: minClipDuration || env.CLIP_MIN_DURATION,
        maxDuration: maxClipDuration || env.CLIP_MAX_DURATION,
        maxCandidates: maxClips || env.MAX_CLIPS_PER_VIDEO
      }
    );

    if (rawCandidates.length === 0) {
      throw new Error('Nenhum trecho válido foi encontrado neste vídeo.');
    }

    await setProgress(jobId, 55, 'Selecionando melhores cortes');
    const unique = overlapDetector
      .filterOverlappingCandidates(rawCandidates)
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, env.MAX_CLIPS_PER_VIDEO);

    // ---------- 3. Renderização real de cada corte ----------
    const framing = smartFramingEngine.calculateFraming(sourceVideo.width, sourceVideo.height);
    const isHorizontal = sourceVideo.width / sourceVideo.height > 9 / 16;
    const captionConfig = captionEngine.getDefaultConfiguration(CaptionStyle.VIRAL);
    const createdClips = [];

    for (let index = 0; index < unique.length; index++) {
      const candidate = unique[index];
      const baseProgress = 60 + (index / unique.length) * 35;
      await setProgress(jobId, baseProgress, `Renderizando corte ${index + 1}/${unique.length}`);

      const stamp = `${Date.now()}_${index}`;
      const clipFileName = `clip_${stamp}.mp4`;
      const clipFilePath = storageService.getStoragePath('clips', clipFileName);
      const thumbFileName = `clip_${stamp}.jpg`;
      const thumbFilePath = storageService.getStoragePath('thumbnails', thumbFileName);

      const clipText = transcription
        ? transcriptionService.sliceTextForClip(
            transcription.segments,
            candidate.startTime,
            candidate.endTime
          )
        : '';

      // Legendas queimadas somente quando existe transcrição com palavras
      let subtitlePath: string | undefined;
      if (transcription && transcription.words.length > 0) {
        const words = transcriptionService.sliceWordsForClip(
          transcription.words,
          candidate.startTime,
          candidate.endTime
        );
        const ass = subtitleBuilder.build(words, captionConfig);
        if (ass) {
          subtitlePath = storageService.getStoragePath('subtitles', `clip_${stamp}.ass`);
          await fs.promises.writeFile(subtitlePath, ass, 'utf8');
        }
      }

      try {
        await ffmpegService.renderVerticalClip({
          inputPath,
          outputPath: clipFilePath,
          startTime: candidate.startTime,
          duration: candidate.duration,
          sourceWidth: sourceVideo.width,
          sourceHeight: sourceVideo.height,
          cropX: isHorizontal ? framing.clampedX : undefined,
          hasAudio: sourceVideo.hasAudio,
          subtitlePath
        });

        const validation = await mp4Validator.validateMP4(clipFilePath, candidate.duration);
        if (!validation.isValid) {
          throw new Error(validation.error || 'Arquivo final inválido.');
        }

        await ffmpegService.extractThumbnail(
          clipFilePath,
          thumbFilePath,
          Math.min(1.5, candidate.duration / 2)
        );

        const clip = await prisma.clip.create({
          data: {
            projectId,
            sourceVideoId,
            startTime: candidate.startTime,
            endTime: candidate.endTime,
            duration: validation.duration ?? candidate.duration,
            score: candidate.finalScore,
            hookScore: candidate.hookScore,
            contextScore: candidate.contextScore,
            coherenceScore: candidate.coherenceScore,
            emotionScore: candidate.emotionScore,
            retentionScore: candidate.retentionScore,
            shareabilityScore: candidate.shareabilityScore,
            commentabilityScore: candidate.commentabilityScore,
            durationScore: candidate.durationScore,
            framingData: toJsonColumn({
              ...framing,
              appliedCropX: isHorizontal ? framing.clampedX : 0,
              sourceWidth: sourceVideo.width,
              sourceHeight: sourceVideo.height
            }),
            videoUrl: storageService.getPublicUrl('clips', clipFileName),
            storageKey: `clips/${clipFileName}`,
            thumbnailUrl: fs.existsSync(thumbFilePath)
              ? storageService.getPublicUrl('thumbnails', thumbFileName)
              : null,
            thumbnailKey: fs.existsSync(thumbFilePath) ? `thumbnails/${thumbFileName}` : null,
            fileSize: BigInt(validation.fileSize),
            status: ClipStatus.CANDIDATE
          }
        });

        await prisma.caption.create({
          data: {
            clipId: clip.id,
            style: CaptionStyle.VIRAL,
            font: captionConfig.fontFamily,
            fontSize: captionConfig.fontSize,
            primaryColor: captionConfig.primaryColor,
            secondaryColor: captionConfig.secondaryColor,
            position: 'CENTER_BOTTOM',
            animation: subtitlePath ? captionConfig.animationStyle : 'NONE',
            highlightedWords: toJsonColumn(
              clipText ? captionEngine.extractHighlightedWords(clipText) : []
            ),
            configuration: toJsonColumn({ ...captionConfig, burnedIn: Boolean(subtitlePath) })
          }
        });

        const title = buildTitle(clipText, project?.name || 'AutoShorts', index);
        const description = clipText
          ? clipText.substring(0, 400)
          : `${candidate.reason}. Corte de ${Math.round(candidate.duration)}s extraído de ${sourceVideo.filename}.`;

        for (const platform of [
          SocialPlatform.TIKTOK,
          SocialPlatform.INSTAGRAM,
          SocialPlatform.YOUTUBE
        ]) {
          await prisma.metadata.create({
            data: {
              clipId: clip.id,
              platform,
              title,
              description,
              hashtags: toJsonColumn(buildHashtags(clipText || title, platform))
            }
          });
        }

        createdClips.push(clip);
      } catch (renderError: any) {
        console.error(`[VideoWorker] Falha ao renderizar corte ${index + 1}:`, renderError.message);
        await prisma.clip.create({
          data: {
            projectId,
            sourceVideoId,
            startTime: candidate.startTime,
            endTime: candidate.endTime,
            duration: candidate.duration,
            score: candidate.finalScore,
            hookScore: candidate.hookScore,
            contextScore: candidate.contextScore,
            coherenceScore: candidate.coherenceScore,
            emotionScore: candidate.emotionScore,
            retentionScore: candidate.retentionScore,
            shareabilityScore: candidate.shareabilityScore,
            commentabilityScore: candidate.commentabilityScore,
            durationScore: candidate.durationScore,
            framingData: toJsonColumn(framing),
            status: ClipStatus.FAILED,
            renderError: renderError.message
          }
        });
        await storageService.deleteFile(clipFilePath);
      } finally {
        if (subtitlePath) await storageService.deleteFile(subtitlePath);
      }
    }

    if (createdClips.length === 0) {
      throw new Error('Nenhum corte pôde ser renderizado. Verifique o log do backend.');
    }

    await prisma.sourceVideo.update({
      where: { id: sourceVideoId },
      data: { status: 'PROCESSED' }
    });

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        progress: 100,
        stage: 'Concluído',
        completedAt: new Date()
      }
    });

    console.log(
      `[VideoWorker] Job ${jobId} concluído: ${createdClips.length} cortes reais renderizados em 1080x1920.`
    );
  } catch (err: any) {
    console.error(`[VideoWorker] Erro no Job ${jobId}:`, err);
    await prisma.job
      .update({
        where: { id: jobId },
        data: { status: JobStatus.FAILED, stage: 'Falhou', error: err.message }
      })
      .catch(() => undefined);
    await prisma.sourceVideo
      .update({ where: { id: sourceVideoId }, data: { status: 'ERROR' } })
      .catch(() => undefined);
  }
}

/** Gera um vídeo de teste real (barras + tom) para validar o pipeline sem upload. */
export async function generateDemoSourceVideo(
  outputPath: string,
  durationSeconds: number
): Promise<void> {
  const { spawn } = await import('child_process');
  const { FFMPEG_PATH } = await import('../services/ffmpeg.service.js');

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      FFMPEG_PATH,
      [
        '-hide_banner',
        '-nostdin',
        '-y',
        '-f',
        'lavfi',
        '-i',
        `testsrc2=size=1920x1080:rate=30:duration=${durationSeconds}`,
        '-f',
        'lavfi',
        '-i',
        `sine=frequency=320:sample_rate=44100:duration=${durationSeconds}`,
        '-af',
        'volume=0.6,tremolo=f=0.15:d=0.9',
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        '-crf',
        '30',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        '96k',
        '-movflags',
        '+faststart',
        outputPath
      ],
      { windowsHide: true }
    );

    let stderr = '';
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`Falha ao gerar vídeo de teste: ${stderr.split('\n').slice(-5).join('\n')}`))
    );
  });

  if (!fs.existsSync(outputPath)) {
    throw new Error('Vídeo de teste não foi criado.');
  }
}
