import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from './config/env.js';
import { prisma } from './database/client.js';
import {
  toJsonColumn,
  presentClip,
  presentProject,
  presentScheduledPost,
  presentSocialAccount
} from './database/serializers.js';
import { storageService } from './storage/storage.service.js';
import { processVideoPipeline, generateDemoSourceVideo } from './workers/video.worker.js';
import { ffmpegService } from './services/ffmpeg.service.js';
import { transcriptionService } from './services/transcription.service.js';
import { socialPublisherService } from './services/social-publisher.js';
import { startScheduler } from './scheduler.js';

// Local schemas (removed @autoshorts/shared dependency)
const registerUserSchema = {
  email: "string",
  password: "string",
  name: "string",
  timezone: "string"
};

const loginUserSchema = {
  email: "string",
  password: "string"
};

const createProjectSchema = {
  name: "string",
  description: "string"
};

const updateClipSchema = {
  startTime: "number",
  endTime: "number",
  score: "number",
  framingData: "object"
};

const schedulePostSchema = {
  clipId: "string",
  socialAccountId: "string",
  scheduledAt: "string",
  timezone: "string"
};

const autoScheduleBatchSchema = {
  clipIds: "array",
  postsPerDay: "number",
  preferredTimes: "array",
  targetPlatforms: "array"
};

// Enums
enum ClipStatus {
  CANDIDATE = "CANDIDATE",
  SELECTED = "SELECTED",
  RENDERING = "RENDERING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

enum ScheduledPostStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  PUBLISHING = "PUBLISHING",
  PUBLISHED = "PUBLISHED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

enum SocialPlatform {
  TIKTOK = "TIKTOK",
  YOUTUBE = "YOUTUBE",
  INSTAGRAM = "INSTAGRAM"
}

// PKCE Utilities for TikTok OAuth2
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.randomFillSync(array);
  return base64UrlEncode(array);
}

function base64UrlEncode(buffer: Uint8Array): string {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64UrlEncode(hash);
}

// Store code_verifiers temporarily (in production, use Redis)
const codeVerifiers = new Map<string, { verifier: string; platform: string; expiresAt: number }>();

const fastify = Fastify({ logger: { level: 'info' } });

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.avi', '.webm', '.m4v'];

async function ensureDemoUser() {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@autoshorts.ai',
          name: 'Usuário Pro',
          passwordHash: await bcrypt.hash('demo123', 10),
          credits: 1000
        }
      });
    }
    return user;
  } catch (error) {
    fastify.log.error({ err: error }, 'Database initialization error');
    // Return a fallback user object if database fails
    return {
      id: 'demo-fallback',
      email: 'demo@autoshorts.ai',
      name: 'Usuário Pro',
      credits: 1000
    } as any;
  }
}

async function startProcessingJob(projectId: string, sourceVideoId: string, userId: string, maxClips?: number, minClipDuration?: number, maxClipDuration?: number) {
  const job = await prisma.job.create({
    data: {
      type: 'VIDEO_PROCESSING',
      status: 'QUEUED',
      userId,
      projectId,
      sourceVideoId,
      progress: 0,
      stage: 'Na fila'
    }
  });

  // Executa fora do ciclo da requisição; o frontend acompanha via GET /api/jobs/:id
  void processVideoPipeline({ jobId: job.id, sourceVideoId, userId, projectId, maxClips, minClipDuration, maxClipDuration });

  return job;
}

async function bootstrap() {
  // CORS configuration for production
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3000',
    env.PUBLIC_BASE_URL || 'http://localhost:3000',
    'https://autoshorts-ai.vercel.app', // Vercel frontend
    'https://*.vercel.app' // Allow any Vercel domain for flexibility
  ].filter(Boolean);

  await fastify.register(cors, { 
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // Allow localhost in development
      if (origin.includes('localhost')) return callback(null, true);
      
      // Allow configured production URL
      if (allowedOrigins.includes(origin)) return callback(null, true);
      
      // Allow same origin
      if (origin === env.PUBLIC_BASE_URL) return callback(null, true);
      
      callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true
  });
  
  await fastify.register(jwt, { secret: env.JWT_SECRET });
  await fastify.register(multipart, { limits: { fileSize: MAX_UPLOAD_BYTES } });
  await fastify.register(fastifyStatic, {
    root: storageService.root,
    prefix: '/api/files/',
    decorateReply: false
  });

  await ensureDemoUser();

  fastify.addHook('preSerialization', async (_request, _reply, payload) => {
    return JSON.parse(
      JSON.stringify(payload, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))
    );
  });

  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);
    const status = (error as any).statusCode && (error as any).statusCode >= 400 ? (error as any).statusCode : 500;
    return reply.status(status).send({ error: (error as Error).message || 'Erro interno do servidor' });
  });

  // ---------------------------------------------------------------- Health
  const healthPayload = async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ffmpeg: await ffmpegService.isAvailable(),
    transcription: transcriptionService.providerName
  });

  fastify.get('/health', healthPayload);
  fastify.get('/api/health', healthPayload);

  // ---------------------------------------------------------------- Auth
  fastify.post('/api/auth/register', async (request, reply) => {
    const body = request.body as any;
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return reply.status(400).send({ error: 'E-mail já cadastrado' });

    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name || body.email.split('@')[0],
        passwordHash: await bcrypt.hash(body.password, 10),
        timezone: body.timezone
      }
    });

    return {
      token: fastify.jwt.sign({ id: user.id, email: user.email }),
      user: { id: user.id, email: user.email, name: user.name, timezone: user.timezone }
    };
  });

  fastify.post('/api/auth/login', async (request, reply) => {
    const body = request.body as any;
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return reply.status(401).send({ error: 'Credenciais inválidas' });

    const isValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!isValid) return reply.status(401).send({ error: 'Credenciais inválidas' });

    return {
      token: fastify.jwt.sign({ id: user.id, email: user.email }),
      user: { id: user.id, email: user.email, name: user.name, timezone: user.timezone }
    };
  });

  // ---------------------------------------------------------------- Projects
  fastify.post('/api/projects', async (request) => {
    const body = request.body as any;
    const user = await ensureDemoUser();
    return prisma.project.create({
      data: { userId: user.id, name: body.name, description: body.description }
    });
  });

  fastify.get('/api/projects', async () => {
    const projects = await prisma.project.findMany({
      include: { sourceVideos: true, clips: true },
      orderBy: { createdAt: 'desc' }
    });
    return projects.map(presentProject);
  });

  fastify.get('/api/projects/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { sourceVideos: true, clips: { include: { captions: true, metadatas: true } } }
    });
    if (!project) return reply.status(404).send({ error: 'Projeto não encontrado' });
    return presentProject(project);
  });

  fastify.delete('/api/projects/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { clips: true, sourceVideos: true }
    });
    if (!project) return reply.status(404).send({ error: 'Projeto não encontrado' });

    for (const clip of project.clips) {
      if (clip.storageKey) await storageService.deleteFile(storageService.resolveKey(clip.storageKey));
      if (clip.thumbnailKey) await storageService.deleteFile(storageService.resolveKey(clip.thumbnailKey));
    }
    for (const video of project.sourceVideos) {
      await storageService.deleteFile(storageService.resolveKey(video.storageKey));
    }

    await prisma.project.delete({ where: { id: projectId } });
    return { deleted: true };
  });

  // ---------------------------------------------------------------- Upload
  fastify.post('/api/projects/:projectId/upload', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return reply.status(404).send({ error: 'Projeto não encontrado' });

    const data = await request.file();
    if (!data) return reply.status(400).send({ error: 'Nenhum arquivo enviado' });

    const extension = path.extname(data.filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return reply.status(400).send({
        error: `Formato não suportado (${extension || 'desconhecido'}). Use: ${ALLOWED_EXTENSIONS.join(', ')}`
      });
    }

    const safeName = `video_${Date.now()}_${data.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const targetPath = storageService.getStoragePath('originals', safeName);

    // Gravação em stream: suporta arquivos grandes sem carregar tudo na memória
    await new Promise<void>((resolve, reject) => {
      const writeStream = fs.createWriteStream(targetPath);
      data.file.pipe(writeStream);
      data.file.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('finish', () => resolve());
    });

    if ((data.file as any).truncated) {
      await storageService.deleteFile(targetPath);
      return reply.status(413).send({ error: 'Arquivo excede o limite de 2 GB' });
    }

    // Análise real do arquivo com ffprobe
    let probe;
    try {
      probe = await ffmpegService.probe(targetPath);
    } catch (err: any) {
      await storageService.deleteFile(targetPath);
      return reply.status(400).send({
        error: `Não foi possível ler este vídeo: ${err.message}`
      });
    }

    const stats = await fs.promises.stat(targetPath);

    const sourceVideo = await prisma.sourceVideo.create({
      data: {
        projectId,
        filename: data.filename,
        duration: probe.duration,
        size: BigInt(stats.size),
        resolution: `${probe.width}x${probe.height}`,
        width: probe.width,
        height: probe.height,
        fps: probe.fps,
        codec: probe.codec,
        hasAudio: probe.hasAudio,
        mimeType: data.mimetype || 'video/mp4',
        storageKey: `originals/${safeName}`,
        status: 'UPLOADED'
      }
    });

    const job = await startProcessingJob(projectId, sourceVideo.id, project.userId);
    return { sourceVideo, jobId: job.id };
  });

  // Gera um vídeo de teste REAL (barras de cor + tom) e processa o pipeline completo
  fastify.post('/api/projects/:projectId/demo', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const body = (request.body as { name?: string; duration?: number; maxClips?: number; minClipDuration?: number; maxClipDuration?: number }) || {};
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return reply.status(404).send({ error: 'Projeto não encontrado' });

    // Limita a 3 minutos para o teste não demorar
    const duration = Math.min(180, Math.max(30, body.duration ?? 120));
    const filename = `demo_${Date.now()}.mp4`;
    const filePath = storageService.getStoragePath('originals', filename);

    try {
      await generateDemoSourceVideo(filePath, duration);
    } catch (err: any) {
      return reply.status(500).send({ error: `Falha ao gerar vídeo de teste: ${err.message}` });
    }

    const probe = await ffmpegService.probe(filePath);
    const stats = await fs.promises.stat(filePath);

    const sourceVideo = await prisma.sourceVideo.create({
      data: {
        projectId,
        filename: body.name ? `${body.name}.mp4` : 'video_demo.mp4',
        duration: probe.duration,
        size: BigInt(stats.size),
        resolution: `${probe.width}x${probe.height}`,
        width: probe.width,
        height: probe.height,
        fps: probe.fps,
        codec: probe.codec,
        hasAudio: probe.hasAudio,
        storageKey: `originals/${filename}`,
        status: 'UPLOADED'
      }
    });

    // Usa configurações do corpo da requisição ou padrão
    const maxClips = body.maxClips || env.MAX_CLIPS_PER_VIDEO;
    const minClipDuration = body.minClipDuration || env.CLIP_MIN_DURATION;
    const maxClipDuration = body.maxClipDuration || env.CLIP_MAX_DURATION;
    
    const job = await startProcessingJob(projectId, sourceVideo.id, project.userId, maxClips, minClipDuration, maxClipDuration);
    return { sourceVideo, jobId: job.id };
  });

  // ---------------------------------------------------------------- Clips
  fastify.get('/api/projects/:projectId/clips', async (request) => {
    const { projectId } = request.params as { projectId: string };
    const clips = await prisma.clip.findMany({
      where: { projectId },
      include: { captions: true, metadatas: true },
      orderBy: { score: 'desc' }
    });
    return clips.map(presentClip);
  });

  fastify.get('/api/clips', async () => {
    const clips = await prisma.clip.findMany({
      include: { captions: true, metadatas: true, project: true },
      orderBy: { score: 'desc' }
    });
    return clips.map(presentClip);
  });

  fastify.patch('/api/clips/:id', async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const data: Record<string, unknown> = { ...body };
    if (body.framingData) data.framingData = toJsonColumn(body.framingData);
    if (body.startTime !== undefined && body.endTime !== undefined) {
      data.duration = Math.max(0, body.endTime - body.startTime);
    }
    const clip = await prisma.clip.update({ where: { id }, data });
    return presentClip(clip);
  });

  fastify.post('/api/clips/:id/approve', async (request) => {
    const { id } = request.params as { id: string };
    return presentClip(
      await prisma.clip.update({ where: { id }, data: { status: ClipStatus.APPROVED } })
    );
  });

  fastify.post('/api/clips/:id/reject', async (request) => {
    const { id } = request.params as { id: string };
    return presentClip(
      await prisma.clip.update({ where: { id }, data: { status: ClipStatus.REJECTED } })
    );
  });

  // Download direto do corte renderizado
  fastify.get('/api/clips/:id/download', async (request, reply) => {
    const { id } = request.params as { id: string };
    const clip = await prisma.clip.findUnique({ where: { id } });
    if (!clip?.storageKey) return reply.status(404).send({ error: 'Corte ainda não renderizado' });

    const filePath = storageService.resolveKey(clip.storageKey);
    if (!fs.existsSync(filePath)) {
      return reply.status(404).send({ error: 'Arquivo do corte não encontrado no disco' });
    }

    reply.header('Content-Type', 'video/mp4');
    reply.header('Content-Disposition', `attachment; filename="${path.basename(clip.storageKey)}"`);
    return reply.send(fs.createReadStream(filePath));
  });

  // ---------------------------------------------------------------- Posts
  fastify.post('/api/posts/schedule', async (request, reply) => {
    const body = request.body as any;
    const clip = await prisma.clip.findUnique({ where: { id: body.clipId } });
    if (!clip) return reply.status(404).send({ error: 'Corte não encontrado' });
    if (!clip.storageKey) {
      return reply.status(400).send({ error: 'Este corte não possui arquivo renderizado' });
    }

    const scheduledAt = new Date(body.scheduledAt);
    const idempotencyKey = `schedule_${body.clipId}_${body.socialAccountId}_${scheduledAt.getTime()}`;

    const existing = await prisma.scheduledPost.findUnique({ where: { idempotencyKey } });
    if (existing) return presentScheduledPost(existing);

    const post = await prisma.scheduledPost.create({
      data: {
        clipId: body.clipId,
        socialAccountId: body.socialAccountId,
        scheduledAt,
        timezone: body.timezone,
        status: ScheduledPostStatus.SCHEDULED,
        idempotencyKey
      },
      include: { clip: { include: { metadatas: true } }, socialAccount: true }
    });

    return presentScheduledPost(post);
  });

  fastify.post('/api/posts/auto-schedule', async (request, reply) => {
    const body = request.body as any;
    const user = await ensureDemoUser();
    const accounts = await prisma.socialAccount.findMany({ where: { userId: user.id } });
    const accountByPlatform = new Map(accounts.map((a) => [a.platform, a]));

    const missing = body.targetPlatforms.filter((p) => !accountByPlatform.has(p));
    if (missing.length === body.targetPlatforms.length) {
      return reply.status(400).send({
        error: `Nenhuma conta conectada para: ${missing.join(', ')}. Conecte em "Contas Sociais".`
      });
    }

    const times = body.preferredTimes.length ? body.preferredTimes : ['12:00', '19:00'];
    const posts = [];
    let dayOffset = 0;
    let slotIndex = 0;

    for (const clipId of body.clipIds) {
      const clip = await prisma.clip.findUnique({ where: { id: clipId } });
      if (!clip?.storageKey) continue;

      await prisma.clip.update({ where: { id: clipId }, data: { status: ClipStatus.APPROVED } });

      for (const platform of body.targetPlatforms) {
        const account = accountByPlatform.get(platform);
        if (!account) continue;

        const [hours, minutes] = times[slotIndex % times.length].split(':').map(Number);
        const scheduledAt = new Date();
        scheduledAt.setDate(scheduledAt.getDate() + dayOffset);
        scheduledAt.setHours(hours, minutes, 0, 0);
        if (scheduledAt <= new Date()) {
          scheduledAt.setDate(scheduledAt.getDate() + 1);
        }

        const idempotencyKey = `batch_${clipId}_${account.id}_${scheduledAt.getTime()}`;
        const already = await prisma.scheduledPost.findUnique({ where: { idempotencyKey } });
        if (already) continue;

        posts.push(
          await prisma.scheduledPost.create({
            data: {
              clipId,
              socialAccountId: account.id,
              scheduledAt,
              timezone: 'America/Sao_Paulo',
              status: ScheduledPostStatus.SCHEDULED,
              idempotencyKey
            },
            include: { clip: { include: { metadatas: true } }, socialAccount: true }
          })
        );

        slotIndex++;
        if (slotIndex % Math.max(1, body.postsPerDay) === 0) dayOffset++;
      }
    }

    return { posts: posts.map(presentScheduledPost), count: posts.length };
  });

  fastify.get('/api/posts', async () => {
    const posts = await prisma.scheduledPost.findMany({
      include: {
        clip: { include: { metadatas: true, captions: true } },
        socialAccount: true
      },
      orderBy: { scheduledAt: 'asc' }
    });
    return posts.map(presentScheduledPost);
  });

  fastify.delete('/api/posts/:id', async (request) => {
    const { id } = request.params as { id: string };
    await prisma.scheduledPost.update({
      where: { id },
      data: { status: ScheduledPostStatus.CANCELLED }
    });
    return { cancelled: true };
  });

  fastify.post('/api/posts/:id/publish', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    // Verificar se o post existe antes de tentar publicar
    const post = await prisma.scheduledPost.findUnique({
      where: { id },
      include: { clip: true, socialAccount: true }
    });
    
    if (!post) {
      return reply.status(404).send({ error: 'Agendamento não encontrado' });
    }
    
    // Verificar se a conta está conectada e não é mock
    if (post.socialAccount.isMock) {
      return reply.status(400).send({ 
        error: 'Esta conta está configurada como modo de teste. Conecte uma conta real em "Minhas Contas" para publicar de verdade.' 
      });
    }
    
    if (!post.clip.storageKey) {
      return reply.status(400).send({ error: 'Este corte não possui arquivo renderizado.' });
    }
    
    const result = await socialPublisherService.publishScheduledPost(id);
    if (!result.success) {
      return reply.status(422).send({ error: result.error });
    }
    
    const updatedPost = await prisma.scheduledPost.findUnique({
      where: { id },
      include: { clip: true, socialAccount: true }
    });
    return presentScheduledPost(updatedPost);
  });

  // ---------------------------------------------------------------- Social accounts
  
  // TikTok OAuth2 Authorization endpoint with PKCE
  fastify.get('/api/auth/tiktok/authorize', async (request, reply) => {
    const clientKey = env.TIKTOK_CLIENT_KEY;
    
    // Se não tiver credenciais, usar modo mock
    if (!clientKey) {
      const state = Math.random().toString(36).substring(7);
      const mockUrl = `${env.PUBLIC_BASE_URL || 'http://localhost:3000'}/oauth/callback?platform=TIKTOK&state=${state}&code=mock_code_tiktok`;
      return { authUrl: mockUrl, state, isMock: true };
    }
    
    const redirectUri = encodeURIComponent(`${env.PUBLIC_BASE_URL || 'http://localhost:3000'}/oauth/callback`);
    const scope = encodeURIComponent('user.info.basic,video.upload,video.publish');
    const state = Math.random().toString(36).substring(7);
    
    // Generate PKCE code_verifier and code_challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    
    // Store code_verifier with state for later use in callback
    codeVerifiers.set(state, {
      verifier: codeVerifier,
      platform: 'TIKTOK',
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });
    
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    
    return { authUrl, state, isMock: false };
  });

  // TikTok OAuth2 Callback endpoint with PKCE
  fastify.get('/api/auth/tiktok/callback', async (request, reply) => {
    const { code, state, error } = request.query as { code?: string; state?: string; error?: string };
    
    if (error) {
      return reply.status(400).send({ error: `Erro de autorização: ${error}` });
    }
    
    if (!code) {
      return reply.status(400).send({ error: 'Código de autorização não fornecido' });
    }

    // Modo mock: criar conta mock
    if (code === 'mock_code_tiktok' || !env.TIKTOK_CLIENT_KEY) {
      const user = await ensureDemoUser();
      
      const account = await prisma.socialAccount.upsert({
        where: {
          userId_platform_externalAccountId: {
            userId: user.id,
            platform: 'TIKTOK',
            externalAccountId: 'mock_tiktok_user'
          }
        },
        update: {
          username: 'Mock TikTok User',
          accessTokenEncrypted: socialPublisherService.encryptToken('mock_access_token'),
          refreshTokenEncrypted: socialPublisherService.encryptToken('mock_refresh_token'),
          status: 'CONNECTED',
          isMock: true,
          tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
        },
        create: {
          userId: user.id,
          platform: 'TIKTOK',
          externalAccountId: 'mock_tiktok_user',
          username: 'Mock TikTok User',
          accessTokenEncrypted: socialPublisherService.encryptToken('mock_access_token'),
          refreshTokenEncrypted: socialPublisherService.encryptToken('mock_refresh_token'),
          status: 'CONNECTED',
          isMock: true,
          tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      return { 
        success: true, 
        accountId: account.id,
        username: 'Mock TikTok User',
        message: 'Conta do TikTok conectada com sucesso (modo mock)!',
        isMock: true
      };
    }

    if (!state) {
      return reply.status(400).send({ error: 'State não fornecido' });
    }

    // Retrieve code_verifier from storage
    const storedData = codeVerifiers.get(state);
    if (!storedData || storedData.expiresAt < Date.now()) {
      return reply.status(400).send({ error: 'Code verifier expirado ou inválido' });
    }

    const codeVerifier = storedData.verifier;
    
    // Clean up the stored verifier
    codeVerifiers.delete(state);

    const user = await ensureDemoUser();
    const clientKey = env.TIKTOK_CLIENT_KEY;
    const clientSecret = env.TIKTOK_CLIENT_SECRET;
    const redirectUri = `${env.PUBLIC_BASE_URL || 'http://localhost:3000'}/oauth/callback`;

    try {
      // Trocar o código por access token real na API do TikTok usando PKCE
      const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code_verifier: codeVerifier, // PKCE code_verifier
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error) {
        return reply.status(400).send({ 
          error: 'Erro ao trocar código por token',
          details: tokenData.error_description || tokenData.error
        });
      }

      // Obter informações do usuário
      const userInfoResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const userInfo = await userInfoResponse.json();

      if (!userInfoResponse.ok || userInfo.error) {
        console.error('Erro ao obter informações do usuário:', userInfo);
      }

      const openId = userInfo.data?.user?.open_id || 'unknown';
      const displayName = userInfo.data?.user?.display_name || 'Usuário TikTok';

      // Salvar tokens no banco de dados
      const account = await prisma.socialAccount.upsert({
        where: {
          userId_platform_externalAccountId: {
            userId: user.id,
            platform: 'TIKTOK',
            externalAccountId: openId
          }
        },
        update: {
          username: displayName,
          accessTokenEncrypted: socialPublisherService.encryptToken(tokenData.access_token),
          refreshTokenEncrypted: tokenData.refresh_token 
            ? socialPublisherService.encryptToken(tokenData.refresh_token)
            : null,
          status: 'CONNECTED',
          isMock: false,
          tokenExpiresAt: tokenData.expires_in 
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null
        },
        create: {
          userId: user.id,
          platform: 'TIKTOK',
          externalAccountId: openId,
          username: displayName,
          accessTokenEncrypted: socialPublisherService.encryptToken(tokenData.access_token),
          refreshTokenEncrypted: tokenData.refresh_token 
            ? socialPublisherService.encryptToken(tokenData.refresh_token)
            : null,
          status: 'CONNECTED',
          isMock: false,
          tokenExpiresAt: tokenData.expires_in 
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null
        }
      });

      return { 
        success: true, 
        accountId: account.id,
        username: displayName,
        message: 'Conta do TikTok conectada com sucesso!'
      };
    } catch (error: any) {
      console.error('Erro no callback TikTok:', error);
      return reply.status(500).send({ 
        error: 'Erro ao processar callback',
        details: error.message
      });
    }
  });

  // YouTube OAuth2 Authorization endpoint
  fastify.get('/api/auth/youtube/authorize', async (request, reply) => {
    const clientId = env.GOOGLE_CLIENT_ID;
    
    // Se não tiver credenciais, usar modo mock
    if (!clientId) {
      const state = Math.random().toString(36).substring(7);
      const mockUrl = `${env.PUBLIC_BASE_URL || 'http://localhost:3000'}/oauth/callback?platform=YOUTUBE&state=${state}&code=mock_code_youtube`;
      return { authUrl: mockUrl, state, isMock: true };
    }
    
    const redirectUri = encodeURIComponent(`${env.PUBLIC_BASE_URL || 'http://localhost:3000'}/oauth/callback`);
    const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.upload');
    const state = Math.random().toString(36).substring(7);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline&state=${state}`;
    
    return { authUrl, state, isMock: false };
  });

  // YouTube OAuth2 Callback endpoint
  fastify.get('/api/auth/youtube/callback', async (request, reply) => {
    const { code, state, error } = request.query as { code?: string; state?: string; error?: string };
    
    if (error) {
      return reply.status(400).send({ error: `Erro de autorização: ${error}` });
    }
    
    if (!code) {
      return reply.status(400).send({ error: 'Código de autorização não fornecido' });
    }

    // Modo mock: criar conta mock
    if (code === 'mock_code_youtube' || !env.GOOGLE_CLIENT_ID) {
      const user = await ensureDemoUser();
      
      const account = await prisma.socialAccount.upsert({
        where: {
          userId_platform_externalAccountId: {
            userId: user.id,
            platform: 'YOUTUBE',
            externalAccountId: 'mock_youtube_user'
          }
        },
        update: {
          username: 'Mock YouTube User',
          accessTokenEncrypted: socialPublisherService.encryptToken('mock_access_token'),
          refreshTokenEncrypted: socialPublisherService.encryptToken('mock_refresh_token'),
          status: 'CONNECTED',
          isMock: true,
          tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        create: {
          userId: user.id,
          platform: 'YOUTUBE',
          externalAccountId: 'mock_youtube_user',
          username: 'Mock YouTube User',
          accessTokenEncrypted: socialPublisherService.encryptToken('mock_access_token'),
          refreshTokenEncrypted: socialPublisherService.encryptToken('mock_refresh_token'),
          status: 'CONNECTED',
          isMock: true,
          tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      return { 
        success: true, 
        accountId: account.id,
        username: 'Mock YouTube User',
        message: 'Conta do YouTube conectada com sucesso (modo mock)!',
        isMock: true
      };
    }

    const user = await ensureDemoUser();
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${env.PUBLIC_BASE_URL || 'http://localhost:3000'}/oauth/callback`;

    try {
      // Trocar o código por access token real na API do Google
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error) {
        return reply.status(400).send({ 
          error: 'Erro ao trocar código por token',
          details: tokenData.error_description || tokenData.error
        });
      }

      // Obter informações do usuário
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const userInfo = await userInfoResponse.json();

      const googleId = userInfo.sub || 'unknown';
      const displayName = userInfo.name || 'Usuário YouTube';

      // Salvar tokens no banco de dados
      const account = await prisma.socialAccount.upsert({
        where: {
          userId_platform_externalAccountId: {
            userId: user.id,
            platform: 'YOUTUBE',
            externalAccountId: googleId
          }
        },
        update: {
          username: displayName,
          accessTokenEncrypted: socialPublisherService.encryptToken(tokenData.access_token),
          refreshTokenEncrypted: tokenData.refresh_token 
            ? socialPublisherService.encryptToken(tokenData.refresh_token)
            : null,
          status: 'CONNECTED',
          isMock: false,
          tokenExpiresAt: tokenData.expires_in 
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null
        },
        create: {
          userId: user.id,
          platform: 'YOUTUBE',
          externalAccountId: googleId,
          username: displayName,
          accessTokenEncrypted: socialPublisherService.encryptToken(tokenData.access_token),
          refreshTokenEncrypted: tokenData.refresh_token 
            ? socialPublisherService.encryptToken(tokenData.refresh_token)
            : null,
          status: 'CONNECTED',
          isMock: false,
          tokenExpiresAt: tokenData.expires_in 
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null
        }
      });

      return { 
        success: true, 
        accountId: account.id,
        username: displayName,
        message: 'Conta do YouTube conectada com sucesso!'
      };
    } catch (error: any) {
      console.error('Erro no callback YouTube:', error);
      return reply.status(500).send({ 
        error: 'Erro ao processar callback',
        details: error.message
      });
    }
  });

  // Instagram OAuth2 Authorization endpoint (Meta/Facebook)
  fastify.get('/api/auth/instagram/authorize', async (request, reply) => {
    const clientId = env.INSTAGRAM_APP_ID;
    
    // Se não tiver credenciais, usar modo mock
    if (!clientId) {
      const state = Math.random().toString(36).substring(7);
      const mockUrl = `${env.PUBLIC_BASE_URL || 'http://localhost:3000'}/oauth/callback?platform=INSTAGRAM&state=${state}&code=mock_code_instagram`;
      return { authUrl: mockUrl, state, isMock: true };
    }
    
    const redirectUri = encodeURIComponent(`${env.PUBLIC_BASE_URL || 'http://localhost:3000'}/oauth/callback`);
    const scope = encodeURIComponent('instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement');
    const state = Math.random().toString(36).substring(7);
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;
    
    return { authUrl, state, isMock: false };
  });

  // Instagram OAuth2 Callback endpoint
  fastify.get('/api/auth/instagram/callback', async (request, reply) => {
    const { code, state, error } = request.query as { code?: string; state?: string; error?: string };
    
    if (error) {
      return reply.status(400).send({ error: `Erro de autorização: ${error}` });
    }
    
    if (!code) {
      return reply.status(400).send({ error: 'Código de autorização não fornecido' });
    }

    // Modo mock: criar conta mock
    if (code === 'mock_code_instagram' || !env.INSTAGRAM_APP_ID) {
      const user = await ensureDemoUser();
      
      const account = await prisma.socialAccount.upsert({
        where: {
          userId_platform_externalAccountId: {
            userId: user.id,
            platform: 'INSTAGRAM',
            externalAccountId: 'mock_instagram_user'
          }
        },
        update: {
          username: 'Mock Instagram User',
          accessTokenEncrypted: socialPublisherService.encryptToken('mock_access_token'),
          refreshTokenEncrypted: null,
          status: 'CONNECTED',
          isMock: true,
          tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        create: {
          userId: user.id,
          platform: 'INSTAGRAM',
          externalAccountId: 'mock_instagram_user',
          username: 'Mock Instagram User',
          accessTokenEncrypted: socialPublisherService.encryptToken('mock_access_token'),
          refreshTokenEncrypted: null,
          status: 'CONNECTED',
          isMock: true,
          tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      return { 
        success: true, 
        accountId: account.id,
        username: 'Mock Instagram User',
        message: 'Conta do Instagram conectada com sucesso (modo mock)!',
        isMock: true
      };
    }

    const user = await ensureDemoUser();
    const clientId = env.INSTAGRAM_APP_ID;
    const clientSecret = env.INSTAGRAM_APP_SECRET;
    const redirectUri = `${env.PUBLIC_BASE_URL || 'http://localhost:3000'}/oauth/callback`;

    try {
      // Trocar o código por access token real na API do Facebook/Instagram
      const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}`, {
        method: 'GET',
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error) {
        return reply.status(400).send({ 
          error: 'Erro ao trocar código por token',
          details: tokenData.error?.message || tokenData.error
        });
      }

      const shortLivedToken = tokenData.access_token;

      // Obter informações do usuário (Instagram Basic Display)
      const userInfoResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${shortLivedToken}`);
      const userInfo = await userInfoResponse.json();

      if (!userInfoResponse.ok || userInfo.error) {
        console.error('Erro ao obter informações do usuário:', userInfo);
      }

      const facebookId = userInfo.id || 'unknown';
      const displayName = userInfo.name || 'Usuário Instagram';

      // Trocar por long-lived token
      const longLivedTokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`);
      const longLivedTokenData = await longLivedTokenResponse.json();

      // Salvar tokens no banco de dados
      const account = await prisma.socialAccount.upsert({
        where: {
          userId_platform_externalAccountId: {
            userId: user.id,
            platform: 'INSTAGRAM',
            externalAccountId: facebookId
          }
        },
        update: {
          username: displayName,
          accessTokenEncrypted: socialPublisherService.encryptToken(longLivedTokenData.access_token || shortLivedToken),
          refreshTokenEncrypted: null, // Instagram não usa refresh token da mesma forma
          status: 'CONNECTED',
          isMock: false,
          tokenExpiresAt: longLivedTokenData.expires_in 
            ? new Date(Date.now() + longLivedTokenData.expires_in * 1000)
            : null
        },
        create: {
          userId: user.id,
          platform: 'INSTAGRAM',
          externalAccountId: facebookId,
          username: displayName,
          accessTokenEncrypted: socialPublisherService.encryptToken(longLivedTokenData.access_token || shortLivedToken),
          refreshTokenEncrypted: null,
          status: 'CONNECTED',
          isMock: false,
          tokenExpiresAt: longLivedTokenData.expires_in 
            ? new Date(Date.now() + longLivedTokenData.expires_in * 1000)
            : null
        }
      });

      return { 
        success: true, 
        accountId: account.id,
        username: displayName,
        message: 'Conta do Instagram conectada com sucesso!'
      };
    } catch (error: any) {
      console.error('Erro no callback Instagram:', error);
      return reply.status(500).send({ 
        error: 'Erro ao processar callback',
        details: error.message
      });
    }
  });

  fastify.get('/api/social/accounts', async () => {
    const user = await ensureDemoUser();
    const accounts = await prisma.socialAccount.findMany({ where: { userId: user.id } });
    return accounts.map(presentSocialAccount);
  });

  fastify.post('/api/social/accounts', async (request, reply) => {
    const user = await ensureDemoUser();
    const body = request.body as {
      platform?: string;
      username?: string;
      externalAccountId?: string;
      accessToken?: string;
      refreshToken?: string;
      scopes?: string[];
    };

    if (!body.platform || !['TIKTOK', 'INSTAGRAM', 'YOUTUBE'].includes(body.platform)) {
      return reply.status(400).send({ error: 'Plataforma inválida' });
    }
    if (!body.accessToken) {
      return reply.status(400).send({ error: 'accessToken ou senha é obrigatório para conectar a conta' });
    }

    // Marcar como mock se parecer uma senha simples (não token OAuth2)
    const isLikelyPassword = body.accessToken.length < 50 && !body.accessToken.includes('.');
    const isMock = isLikelyPassword; // Contas com senha são tratadas como mock por segurança

    const account = await prisma.socialAccount.upsert({
      where: {
        userId_platform_externalAccountId: {
          userId: user.id,
          platform: body.platform,
          externalAccountId: body.externalAccountId || body.username || body.platform.toLowerCase()
        }
      },
      update: {
        username: body.username || body.platform,
        accessTokenEncrypted: socialPublisherService.encryptToken(body.accessToken),
        refreshTokenEncrypted: body.refreshToken
          ? socialPublisherService.encryptToken(body.refreshToken)
          : null,
        scopes: toJsonColumn(body.scopes || []),
        status: 'CONNECTED',
        isMock
      },
      create: {
        userId: user.id,
        platform: body.platform,
        externalAccountId: body.externalAccountId || body.username || body.platform.toLowerCase(),
        username: body.username || body.platform,
        accessTokenEncrypted: socialPublisherService.encryptToken(body.accessToken),
        refreshTokenEncrypted: body.refreshToken
          ? socialPublisherService.encryptToken(body.refreshToken)
          : null,
        scopes: toJsonColumn(body.scopes || []),
        status: 'CONNECTED',
        isMock
      }
    });

    return presentSocialAccount(account);
  });

  fastify.delete('/api/social/accounts/:id', async (request) => {
    const { id } = request.params as { id: string };
    await prisma.socialAccount.delete({ where: { id } });
    return { deleted: true };
  });

  // ---------------------------------------------------------------- Analytics
  fastify.get('/api/analytics', async () => {
    const user = await ensureDemoUser();
    
    // Primeiro pegar os IDs dos projetos do usuário
    const userProjects = await prisma.project.findMany({
      where: { userId: user.id },
      select: { id: true }
    });
    
    const projectIds = userProjects.map(p => p.id);
    
    const [videosProcessed, clips, renderedClips, scheduled, published, failed] = await Promise.all([
      prisma.sourceVideo.count({ 
        where: { 
          status: 'PROCESSED',
          projectId: { in: projectIds }
        }
      }),
      prisma.clip.count({ 
        where: { projectId: { in: projectIds } }
      }),
      prisma.clip.count({ 
        where: { 
          NOT: { storageKey: null },
          projectId: { in: projectIds }
        }
      }),
      prisma.scheduledPost.count({ 
        where: { 
          status: ScheduledPostStatus.SCHEDULED,
          clip: { projectId: { in: projectIds } }
        }
      }),
      prisma.scheduledPost.count({ 
        where: { 
          status: ScheduledPostStatus.PUBLISHED,
          clip: { projectId: { in: projectIds } }
        }
      }),
      prisma.scheduledPost.count({ 
        where: { 
          status: ScheduledPostStatus.FAILED,
          clip: { projectId: { in: projectIds } }
        }
      })
    ]);

    const aggregate = await prisma.analytics.aggregate({
      _sum: { views: true, likes: true, comments: true, shares: true },
      _avg: { retentionRate: true }
    });

    const avgScore = await prisma.clip.aggregate({ 
      _avg: { score: true },
      where: { projectId: { in: projectIds } }
    });

    return {
      kpis: {
        videosProcessed,
        clipsCreated: clips,
        clipsRendered: renderedClips,
        scheduledPosts: scheduled,
        publishedPosts: published,
        failedPosts: failed,
        totalViews: aggregate._sum.views || 0,
        totalLikes: aggregate._sum.likes || 0,
        avgRetention: Math.round((aggregate._avg.retentionRate || 0) * 10) / 10,
        avgClipScore: Math.round((avgScore._avg.score || 0) * 10) / 10
      },
      insights: []
    };
  });

  fastify.get('/api/jobs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return reply.status(404).send({ error: 'Job não encontrado' });
    return job;
  });

  fastify.get('/api/jobs', async () => {
    return prisma.job.findMany({ orderBy: { createdAt: 'desc' }, take: 30 });
  });

  // ---------------------------------------------------------------- Boot
  const ffmpegOk = await ffmpegService.isAvailable();

  await fastify.listen({ port: env.PORT, host: '0.0.0.0' });

  startScheduler();

  console.log(`\n  AutoShorts API   http://localhost:${env.PORT}`);
  console.log(`  FFmpeg           ${ffmpegOk ? 'OK' : 'INDISPONÍVEL — rode npm install no backend'}`);
  console.log(`  Transcrição      ${transcriptionService.providerName}`);
  console.log(`  Storage          ${storageService.root}\n`);
}

bootstrap().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
