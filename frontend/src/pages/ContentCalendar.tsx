import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Calendar as CalendarIcon, Sparkles, ChevronLeft, ChevronRight, Clock, Plus, Trash2, Eye, X } from 'lucide-react';

export const ContentCalendar: React.FC = () => {
  const { queuedPosts, refreshAll, setActiveTab } = useAppStore();
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Agrupar posts por dia
  const postsByDay = queuedPosts.reduce((acc, post) => {
    const postDate = new Date(post.scheduledAt);
    if (postDate.getMonth() === currentMonth && postDate.getFullYear() === currentYear) {
      const day = postDate.getDate();
      if (!acc[day]) acc[day] = [];
      acc[day].push(post);
    }
    return acc;
  }, {} as Record<number, any[]>);

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    
    try {
      await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      await refreshAll();
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      alert('Erro ao cancelar agendamento');
    }
  };

  const handlePreview = (post: any) => {
    setSelectedPost(post);
    setShowPreview(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-violet-400" />
          <div>
            <h2 className="text-xl font-extrabold text-white">Calendário de Conteúdo</h2>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Smart Scheduling Button */}
          <button 
            onClick={() => setActiveTab('new_project')}
            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 text-white shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>

          {/* View selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl glass-panel text-xs font-semibold">
            {(['month', 'week', 'day'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  viewMode === m ? 'bg-violet-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'month' ? 'Mês' : m === 'week' ? 'Semana' : 'Dia'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-4">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 pb-2 border-b border-cyber-border">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const dayPosts = postsByDay[day] || [];
            const hasPost = dayPosts.length > 0;
            
            return (
              <div
                key={day}
                className={`min-h-[120px] p-2 rounded-xl border glass-card flex flex-col justify-between transition-all ${
                  hasPost ? 'border-violet-500/50 bg-violet-950/20' : 'border-cyber-border/60 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                  <span>{day}</span>
                  {hasPost && <span className="w-2 h-2 rounded-full bg-violet-500" />}
                </div>

                {hasPost && (
                  <div className="space-y-1 flex-1 overflow-y-auto">
                    {dayPosts.map((post) => (
                      <div 
                        key={post.id}
                        className="p-1.5 rounded bg-violet-950/80 border border-violet-500/40 text-[10px] font-bold text-white line-clamp-1 flex items-center justify-between group"
                      >
                        <span className="flex-1 truncate">
                          {new Date(post.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — {post.platform}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handlePreview(post)}
                            className="text-cyan-400 hover:text-cyan-300"
                            title="Ver prévia"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Cancelar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setActiveTab('new_project')}
                  className="opacity-0 hover:opacity-100 text-[10px] font-semibold text-gray-400 hover:text-violet-400 flex items-center justify-center gap-1 pt-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedPost && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cyber-card border border-cyber-border rounded-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Prévia do Agendamento</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-950 text-violet-300 border border-violet-500/30">
                  {selectedPost.platform}
                </span>
                <span className="text-xs text-gray-400">ID: {selectedPost.id}</span>
              </div>
              
              <div>
                <h4 className="font-bold text-sm text-white">{selectedPost.clipTitle}</h4>
                <p className="text-xs text-gray-400">
                  Agendado para: <strong className="text-white ml-1">
                    {new Date(selectedPost.scheduledAt).toLocaleString('pt-BR')}
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedPost.status === 'SCHEDULED' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' :
                  selectedPost.status === 'PUBLISHED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                  'bg-red-950 text-red-400 border border-red-500/30'
                }`}>
                  {selectedPost.status === 'SCHEDULED' ? 'Agendado' : 
                   selectedPost.status === 'PUBLISHED' ? 'Publicado' : 'Erro'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-cyber-border">
              <button
                onClick={() => setShowPreview(false)}
                className="py-2 px-4 rounded-xl font-semibold text-sm glass-panel text-gray-300"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleDeletePost(selectedPost.id);
                }}
                className="py-2 px-4 rounded-xl font-bold text-sm bg-red-950 hover:bg-red-900 text-red-400 border border-red-500/30"
              >
                Cancelar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
