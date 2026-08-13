import { z } from 'zod';
import { CaptionStyle, SocialPlatform, ScheduledPostStatus } from '../enums/index.js';

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  timezone: z.string().default('America/Sao_Paulo')
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

export const videoUploadOptionsSchema = z.object({
  targetClipCount: z.union([z.number().min(1).max(50), z.literal('AUTO')]).default('AUTO'),
  desiredDuration: z.enum(['15s', '30s', '45s', '60s', '90s', 'AUTO']).default('AUTO'),
  captionStyle: z.nativeEnum(CaptionStyle).default(CaptionStyle.VIRAL),
  removeSilences: z.enum(['OFF', 'LIGHT', 'MEDIUM', 'AGGRESSIVE']).default('MEDIUM'),
  targetPlatforms: z.array(z.nativeEnum(SocialPlatform)).default([
    SocialPlatform.TIKTOK,
    SocialPlatform.INSTAGRAM,
    SocialPlatform.YOUTUBE
  ])
});

export const updateClipSchema = z.object({
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  score: z.number().optional(),
  framingData: z.record(z.unknown()).optional()
});

export const updateCaptionSchema = z.object({
  style: z.nativeEnum(CaptionStyle).optional(),
  font: z.string().optional(),
  fontSize: z.number().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  position: z.string().optional(),
  animation: z.string().optional(),
  highlightedWords: z.array(z.string()).optional()
});

export const updateMetadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  hashtags: z.array(z.string()).optional()
});

export const schedulePostSchema = z.object({
  clipId: z.string().uuid(),
  socialAccountId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  timezone: z.string().default('America/Sao_Paulo')
});

export const autoScheduleBatchSchema = z.object({
  clipIds: z.array(z.string().uuid()),
  postsPerDay: z.number().min(1).max(10).default(2),
  preferredTimes: z.array(z.string()).default(['12:00', '19:00']),
  targetPlatforms: z.array(z.nativeEnum(SocialPlatform))
});
