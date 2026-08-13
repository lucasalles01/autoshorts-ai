import {
  UserRole,
  ProjectStatus,
  SourceVideoStatus,
  ClipStatus,
  CaptionStyle,
  SocialPlatform,
  ScheduledPostStatus,
  JobStatus,
  JobType,
  UsageType,
  SnapshotWindow,
  FramingMode
} from '../enums/index.js';

export interface User {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  timezone: string;
  role: UserRole;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SourceVideo {
  id: string;
  projectId: string;
  filename: string;
  duration: number;
  size: number;
  resolution: string;
  fps: number;
  codec: string;
  mimeType: string;
  storageKey: string;
  status: SourceVideoStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface WordSegment {
  word: string;
  start: number; // segundos
  end: number;
  confidence?: number;
}

export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  words?: WordSegment[];
}

export interface Transcript {
  id: string;
  sourceVideoId: string;
  language: string;
  fullText: string;
  segments: TranscriptSegment[];
  words?: WordSegment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FramingData {
  mode: FramingMode;
  xCenter: number; // 0.0 to 1.0 (percentual da largura original)
  cropWidth: number; // ex: 1080
  cropHeight: number; // ex: 1920
  clampedX: number; // posição X calculada após o clamp
  zoomLevel: number; // ex: 1.0 a 1.5
  hasFaceDetected: boolean;
}

export interface AICutScoreBreakdown {
  hookScore: number;
  contextScore: number;
  coherenceScore: number;
  emotionScore: number;
  retentionScore: number;
  shareabilityScore: number;
  commentabilityScore: number;
  durationScore: number;
  finalScore: number;
  reason: string;
}

export interface CandidateClip {
  id: string;
  projectId: string;
  sourceVideoId: string;
  startTime: number;
  endTime: number;
  duration: number;
  scores: AICutScoreBreakdown;
  transcriptSnippet: string;
  reason: string;
}

export interface Clip {
  id: string;
  projectId: string;
  sourceVideoId: string;
  startTime: number;
  endTime: number;
  duration: number;
  score: number;
  hookScore: number;
  contextScore: number;
  coherenceScore: number;
  emotionScore: number;
  retentionScore: number;
  shareabilityScore: number;
  commentabilityScore: number;
  durationScore: number;
  framingData: FramingData;
  videoUrl?: string;
  storageKey?: string;
  status: ClipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaptionConfiguration {
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  secondaryColor: string; // highlight color
  outlineColor: string;
  positionY: number; // % da tela do topo
  animationStyle: string; // ex: 'bounce', 'fade', 'word-by-word'
  uppercase: boolean;
}

export interface Caption {
  id: string;
  clipId: string;
  style: CaptionStyle;
  font: string;
  fontSize: number;
  primaryColor: string;
  secondaryColor: string;
  position: string;
  animation: string;
  highlightedWords: string[];
  configuration: CaptionConfiguration;
  createdAt: Date;
  updatedAt: Date;
}

export interface Metadata {
  id: string;
  clipId: string;
  platform: SocialPlatform;
  title: string;
  description: string;
  hashtags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialAccount {
  id: string;
  userId: string;
  platform: SocialPlatform;
  externalAccountId: string;
  username: string;
  accessTokenEncrypted: string;
  refreshTokenEncrypted?: string;
  tokenExpiresAt?: Date;
  scopes: string[];
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED';
  lastSyncAt?: Date;
  platformMetadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledPost {
  id: string;
  clipId: string;
  socialAccountId: string;
  scheduledAt: Date;
  timezone: string;
  status: ScheduledPostStatus;
  idempotencyKey: string;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  publishedAt?: Date;
  externalPostId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsSnapshot {
  id: string;
  scheduledPostId: string;
  platform: SocialPlatform;
  snapshotWindow: SnapshotWindow;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  retentionRate: number; // 0.0 to 100.0
  engagementRate: number;
  collectedAt: Date;
}

export interface AIInsight {
  id: string;
  userId: string;
  type: string;
  message: string;
  contextualData?: Record<string, unknown>;
  createdAt: Date;
}

export interface UsageRecord {
  id: string;
  userId: string;
  type: UsageType;
  quantity: number;
  unit: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  userId: string;
  projectId?: string;
  sourceVideoId?: string;
  clipId?: string;
  progress: number; // 0 a 100
  attempts: number;
  maxAttempts: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface AICutWeightConfig {
  hookWeight: number;
  contextWeight: number;
  coherenceWeight: number;
  emotionWeight: number;
  retentionWeight: number;
  shareabilityWeight: number;
  commentabilityWeight: number;
  durationWeight: number;
}
