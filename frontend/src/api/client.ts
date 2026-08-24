const API_BASE = '/api';

// Get the public base URL from environment or use default
const getPublicBaseUrl = () => {
  return import.meta.env.VITE_BASE_URL || window.location.origin;
};

// Get backend API URL
const getBackendApiUrl = () => {
  // In production, use the Render backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://autoshorts-backend-v2.onrender.com';
  return backendUrl + '/api';
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getBackendApiUrl()}${path}`;
  const response = await fetch(url, {
    headers: {
      ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  return response.json();
}

export interface ApiProject {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  sourceVideos: { id: string; duration: number; filename: string }[];
  clips: ApiClip[];
}

export interface ApiClip {
  id: string;
  projectId: string;
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
  videoUrl: string | null;
  status: string;
  captions: { style: string; highlightedWords: string[] }[];
  metadatas: { platform: string; title: string; description: string; hashtags: string[] }[];
}

export interface ApiJob {
  id: string;
  status: string;
  progress: number;
  error?: string | null;
}

export interface ApiScheduledPost {
  id: string;
  clipId: string;
  scheduledAt: string;
  status: string;
  clip: ApiClip;
  socialAccount: { platform: string; username: string };
}

export interface ApiSocialAccount {
  id: string;
  platform: 'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE';
  username: string;
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  getProjects: () => request<ApiProject[]>('/projects'),

  createProject: (data: { name: string; description?: string }) =>
    request<ApiProject>('/projects', { method: 'POST', body: JSON.stringify(data) }),

  uploadVideo: (projectId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<{ sourceVideo: unknown; jobId: string }>(`/projects/${projectId}/upload`, {
      method: 'POST',
      body: form
    });
  },

  uploadYoutubeUrl: (projectId: string, youtubeUrl: string) => {
    return request<{ sourceVideo: unknown; jobId: string }>(`/projects/${projectId}/youtube`, {
      method: 'POST',
      body: JSON.stringify({ youtubeUrl })
    });
  },

  startDemoProcessing: (projectId: string, data: { name: string; duration: number; maxClips?: number; minClipDuration?: number; maxClipDuration?: number }) =>
    request<{ jobId: string }>(`/projects/${projectId}/demo`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getJob: (jobId: string) => request<ApiJob>(`/jobs/${jobId}`),

  getClips: (projectId?: string) =>
    request<ApiClip[]>(projectId ? `/projects/${projectId}/clips` : '/clips'),

  approveClip: (clipId: string) =>
    request(`/clips/${clipId}/approve`, { method: 'POST' }),

  rejectClip: (clipId: string) =>
    request(`/clips/${clipId}/reject`, { method: 'POST' }),

  schedulePost: (data: {
    clipId: string;
    socialAccountId: string;
    scheduledAt: string;
    timezone?: string;
  }) => request('/posts/schedule', { method: 'POST', body: JSON.stringify(data) }),

  autoSchedule: (data: {
    clipIds: string[];
    postsPerDay: number;
    preferredTimes: string[];
    targetPlatforms: string[];
  }) => request<{ posts: ApiScheduledPost[]; count: number }>('/posts/auto-schedule', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getPosts: () => request<ApiScheduledPost[]>('/posts'),

  publishPost: (postId: string) =>
    request(`/posts/${postId}/publish`, { method: 'POST' }),

  getSocialAccounts: () => request<ApiSocialAccount[]>('/social/accounts'),

  createSocialAccount: (data: {
    platform: string;
    username: string;
    accessToken: string;
    externalAccountId?: string;
    refreshToken?: string;
    scopes?: string[];
  }) => request<ApiSocialAccount>('/social/accounts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  deleteSocialAccount: (id: string) =>
    request(`/social/accounts/${id}`, { method: 'DELETE' }).catch((error) => {
      console.error('Erro ao deletar conta:', error);
      throw error;
    }),

  getTikTokAuthUrl: () =>
    request<{ authUrl: string; state: string }>('/auth/tiktok/authorize'),

  getYouTubeAuthUrl: () =>
    request<{ authUrl: string; state: string }>('/auth/youtube/authorize'),

  getInstagramAuthUrl: () =>
    request<{ authUrl: string; state: string }>('/auth/instagram/authorize'),

  handleTikTokCallback: (code: string, state: string) =>
    request(`/auth/tiktok/callback?code=${code}&state=${state}`),

  handleYouTubeCallback: (code: string, state: string) =>
    request(`/auth/youtube/callback?code=${code}&state=${state}`),

  handleInstagramCallback: (code: string, state: string) =>
    request(`/auth/instagram/callback?code=${code}&state=${state}`),

  getAnalytics: () =>
    request<{
      kpis: Record<string, number>;
      insights: { id: string; type: string; message: string }[];
    }>('/analytics'),

  generateContentSuggestions: (script: string, theme?: string) =>
    request<{ title: string; description: string; hashtags: string[] }>('/content/suggestions', {
      method: 'POST',
      body: JSON.stringify({ script, theme })
    })
};

export function mapClipToStore(clip: ApiClip) {
  const metadata = clip.metadatas?.[0];
  const caption = clip.captions?.[0];
  return {
    id: clip.id,
    projectId: clip.projectId,
    title: metadata?.title || `Corte ${clip.id.substring(0, 6)}`,
    duration: clip.duration,
    score: Math.round(clip.score),
    hookScore: Math.round(clip.hookScore),
    contextScore: Math.round(clip.contextScore),
    coherenceScore: Math.round(clip.coherenceScore),
    emotionScore: Math.round(clip.emotionScore),
    retentionScore: Math.round(clip.retentionScore),
    shareabilityScore: Math.round(clip.shareabilityScore),
    commentabilityScore: Math.round(clip.commentabilityScore),
    durationScore: Math.round(clip.durationScore),
    reason: metadata?.description || '',
    quoteSnippet: metadata?.description || '',
    status: clip.status as any,
    videoUrl: clip.videoUrl || undefined,
    captionStyle: (caption?.style || 'VIRAL') as any,
    captionText: metadata?.description || '',
    targetPlatforms: (clip.metadatas?.map((m) => m.platform) || ['TIKTOK']) as any
  };
}

export function mapProjectToStore(project: ApiProject) {
  const video = project.sourceVideos?.[0];
  const approved = project.clips?.filter((c) => c.status === 'APPROVED').length || 0;
  return {
    id: project.id,
    name: project.name,
    description: project.description || '',
    duration: video ? formatDuration(video.duration) : '—',
    clipsCount: project.clips?.length || 0,
    approvedCount: approved,
    status: (project.clips?.length ? 'PROCESSED' : 'PROCESSING') as any,
    createdAt: new Date(project.createdAt).toLocaleString('pt-BR')
  };
}

export function mapPostToStore(post: ApiScheduledPost) {
  const metadata = post.clip.metadatas?.find((m) => m.platform === post.socialAccount.platform);
  return {
    id: post.id,
    clipId: post.clipId,
    clipTitle: metadata?.title || `Corte ${post.clipId.substring(0, 6)}`,
    platform: post.socialAccount.platform as any,
    scheduledAt: new Date(post.scheduledAt).toLocaleString('pt-BR'),
    status: post.status as any
  };
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export async function pollJob(
  jobId: string,
  onProgress?: (progress: number) => void,
  onStepChange?: (step: number) => void
): Promise<ApiJob> {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const job = await api.getJob(jobId);
        onProgress?.(job.progress);
        
        // Inferir etapa baseada no progresso
        if (onStepChange) {
          if (job.progress < 25) {
            onStepChange(0); // Gerando roteiro
          } else if (job.progress < 50) {
            onStepChange(1); // Sintetizando áudio
          } else if (job.progress < 75) {
            onStepChange(2); // Gerando legendas
          } else {
            onStepChange(3); // Finalizando vídeo
          }
        }
        
        if (job.status === 'COMPLETED') {
          clearInterval(interval);
          resolve(job);
        } else if (job.status === 'FAILED') {
          clearInterval(interval);
          reject(new Error(job.error || 'Processamento falhou'));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 800);
  });
}
