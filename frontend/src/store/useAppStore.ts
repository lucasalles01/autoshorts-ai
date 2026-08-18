import { create } from 'zustand';
import {
  api,
  mapClipToStore,
  mapPostToStore,
  mapProjectToStore
} from '../api/client';

export type NavTab =
  | 'dashboard'
  | 'new_project'
  | 'my_projects'
  | 'library'
  | 'queue'
  | 'calendar'
  | 'analytics'
  | 'social_accounts'
  | 'settings'
  | 'clip_editor';

export interface ClipItem {
  id: string;
  projectId: string;
  title: string;
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
  reason: string;
  quoteSnippet: string;
  status: 'CANDIDATE' | 'APPROVED' | 'REJECTED' | 'RENDERING' | 'COMPLETED' | 'FAILED';
  videoUrl?: string;
  captionStyle: 'VIRAL' | 'MODERN' | 'MINIMAL' | 'PROFESSIONAL';
  captionText: string;
  targetPlatforms: ('TIKTOK' | 'INSTAGRAM' | 'YOUTUBE')[];
  scheduledAt?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  duration: string;
  clipsCount: number;
  approvedCount: number;
  status: 'UPLOADING' | 'PROCESSING' | 'PROCESSED';
  createdAt: string;
}

export interface ScheduledItem {
  id: string;
  clipTitle: string;
  platform: 'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE';
  scheduledAt: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
  clipId: string;
}

interface AppState {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedClip: ClipItem | null;
  setSelectedClip: (clip: ClipItem | null) => void;

  projects: ProjectItem[];
  clips: ClipItem[];
  queuedPosts: ScheduledItem[];
  analytics: Record<string, number> | null;
  isLoading: boolean;
  error: string | null;

  isProcessingWizard: boolean;
  wizardStep: number;
  setWizardStep: (step: number) => void;
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;

  refreshAll: () => Promise<void>;
  approveClip: (clipId: string) => Promise<void>;
  rejectClip: (clipId: string) => Promise<void>;
  updateClipCaption: (clipId: string, text: string, style: ClipItem['captionStyle']) => void;
  addScheduledPost: (post: ScheduledItem) => void;
  publishPost: (postId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedClip: null,
  setSelectedClip: (clip) => set({ selectedClip: clip }),

  isProcessingWizard: false,
  wizardStep: 1,
  setWizardStep: (step) => set({ wizardStep: step }),
  currentProjectId: null,
  setCurrentProjectId: (id) => set({ currentProjectId: id }),

  projects: [],
  clips: [],
  queuedPosts: [],
  analytics: null,
  isLoading: false,
  error: null,

  refreshAll: async () => {
    set({ isLoading: true, error: null });
    try {
      // First check backend health
      try {
        await api.health();
      } catch (healthErr) {
        console.warn('Backend health check failed:', healthErr);
        // Continue anyway, individual endpoints might work
      }

      const [projects, clips, posts, analytics] = await Promise.all([
        api.getProjects().catch(() => []),
        api.getClips().catch(() => []),
        api.getPosts().catch(() => []),
        api.getAnalytics().catch(() => ({ kpis: {} }))
      ]);

      set({
        projects: projects.map(mapProjectToStore),
        clips: clips.map(mapClipToStore),
        queuedPosts: posts.map(mapPostToStore),
        analytics: analytics.kpis,
        isLoading: false
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Erro ao carregar dados' });
    }
  },

  approveClip: async (clipId) => {
    await api.approveClip(clipId);
    set((state) => ({
      clips: state.clips.map((c) => (c.id === clipId ? { ...c, status: 'APPROVED' } : c))
    }));
  },

  rejectClip: async (clipId) => {
    await api.rejectClip(clipId);
    set((state) => ({
      clips: state.clips.map((c) => (c.id === clipId ? { ...c, status: 'REJECTED' } : c))
    }));
  },

  updateClipCaption: (clipId, text, style) =>
    set((state) => ({
      clips: state.clips.map((c) => (c.id === clipId ? { ...c, captionText: text, captionStyle: style } : c))
    })),

  addScheduledPost: (post) =>
    set((state) => ({
      queuedPosts: [...state.queuedPosts, post]
    })),

  publishPost: async (postId) => {
    await api.publishPost(postId);
    await get().refreshAll();
  }
}));
