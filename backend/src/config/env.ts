import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number).default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  STORAGE_ENDPOINT: z.string().default('http://localhost:3001'),
  STORAGE_ACCESS_KEY: z.string().default('minioadmin'),
  STORAGE_SECRET_KEY: z.string().default('minioadmin'),
  STORAGE_BUCKET: z.string().default('autoshorts-storage'),
  JWT_SECRET: z.string().default('super-secret-jwt-key-change-in-production-32bytes'),
  ENCRYPTION_KEY: z.string().default('0123456789abcdef0123456789abcdef'), // 32 chars hex key for AES-256-GCM
  OPENAI_API_KEY: z.string().optional(),
  TRANSCRIPTION_LANGUAGE: z.string().default('pt'),
  MAX_CLIPS_PER_VIDEO: z.string().transform(Number).default('5'),
  CLIP_MIN_DURATION: z.string().transform(Number).default('20'),
  CLIP_MAX_DURATION: z.string().transform(Number).default('58'),
  FFMPEG_PATH: z.string().optional(),
  FFPROBE_PATH: z.string().optional(),
  PUBLIC_BASE_URL: z.string().default('http://localhost:3000'),
  YOUTUBE_PRIVACY_STATUS: z.enum(['public', 'private', 'unlisted']).default('private'),
  TIKTOK_PRIVACY_LEVEL: z
    .enum(['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY', 'FOLLOWER_OF_CREATOR'])
    .default('SELF_ONLY'),
  INSTAGRAM_API_VERSION: z.string().default('v21.0'),
  VIDEO_WORKER_CONCURRENCY: z.string().transform(Number).default('2'),
  AI_WORKER_CONCURRENCY: z.string().transform(Number).default('3'),
  PUBLISHING_WORKER_CONCURRENCY: z.string().transform(Number).default('5'),
  ANALYTICS_WORKER_CONCURRENCY: z.string().transform(Number).default('3'),
  STORAGE_WORKER_CONCURRENCY: z.string().transform(Number).default('2'),
  // OAuth2 Credentials
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  INSTAGRAM_APP_ID: z.string().optional(),
  INSTAGRAM_APP_SECRET: z.string().optional()
});

export const env = envSchema.parse(process.env);
