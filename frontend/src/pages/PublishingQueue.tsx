import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ListOrdered, Clock, CheckCircle2, AlertCircle, RefreshCw, Send, Calendar, Filter, Trash2 } from 'lucide-react';

export const PublishingQueue: React.FC = () => {
  const { queuedPosts, publishPost, refreshAll } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredPosts = statusFilter === 'ALL'
    ? queuedPosts
    : queuedPosts.filter((p) => p.status === statusFilter);

  const handlePublish = async (postId: string) => {
    setError(null);
    setPublishingId(postId);
    try {
      await publishPost(postId);
      await refreshAll();
    } catch (err: any) {
      setError(err.message || 'Erro ao publicar');
      console.error('Erro ao publicar:', err);
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    
    try {
      await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      await refreshAll();
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar agendamento');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
        </div>
      )}

      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-5 h-5 text-violet-400" />
          <h2 className="text-xl font-extrabold text-white">Fila de Publicação Automática</h2>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 text-xs font-semibold">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'SCHEDULED', label: 'Agendados' },
            { id: 'PUBLISHING', label: 'Publicando' },
            { id: 'PUBLISHED', label: 'Publicados' },
            { id: 'FAILED', label: 'Erros' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                statusFilter === f.id
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'glass-panel text-gray-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Items Table / Cards */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-2xl space-y-3">
            <Clock className="w-10 h-10 text-gray-600 mx-auto" />
            <h3 className="text-sm font-bold text-gray-300">Nenhum vídeo nesta fila de publicação</h3>
            <p className="text-xs text-gray-500">Acesse o Novo Projeto ou o Editor para agendar vídeos.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-2xl glass-panel border border-cyber-border flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-violet-500/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-24 bg-black rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-cyber-border">
                  <span className="text-[10px] font-bold text-violet-400">9:16 MP4</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-950 text-violet-300 border border-violet-500/30">
                      {post.platform}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">ID: {post.id}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{post.clipTitle}</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      Programado para: <strong className="text-white ml-1">{post.scheduledAt}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-cyber-border">
                {post.status === 'SCHEDULED' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Agendado
                  </span>
                )}
                {post.status === 'PUBLISHING' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Publicando...
                  </span>
                )}
                {post.status === 'PUBLISHED' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Publicado
                  </span>
                )}
                {post.status === 'FAILED' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-950 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Erro
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {post.status !== 'PUBLISHED' && post.status !== 'PUBLISHING' && (
                    <button
                      onClick={() => handlePublish(post.id)}
                      disabled={publishingId === post.id}
                      className="py-2 px-4 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{publishingId === post.id ? 'Publicando...' : 'Publicar Agora'}</span>
                    </button>
                  )}
                  
                  {post.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-red-950 hover:bg-red-900 text-red-400 border border-red-500/30 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
