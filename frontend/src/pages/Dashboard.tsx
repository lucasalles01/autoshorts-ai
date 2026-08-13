import React from 'react';
import { useAppStore, ClipItem } from '../store/useAppStore';
import {
  Video,
  Scissors,
  CalendarCheck,
  Send,
  Eye,
  TrendingUp,
  Sparkles,
  Play,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  BarChart2
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { projects, clips, setActiveTab, setSelectedClip, analytics } = useAppStore();

  const kpis = [
    { label: 'Vídeos Processados', value: String(analytics?.videosProcessed ?? projects.length), icon: Video, color: 'text-violet-400', bg: 'bg-violet-950/40 border-violet-500/30' },
    { label: 'Cortes Criados', value: String(analytics?.clipsCreated ?? clips.length), icon: Scissors, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-500/30' },
    { label: 'Agendados', value: String(analytics?.scheduledPosts ?? 0), icon: CalendarCheck, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/30' },
    { label: 'Publicados', value: String(analytics?.publishedPosts ?? 0), icon: Send, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-500/30' },
    { label: 'Visualizações Totais', value: analytics?.totalViews ? `${(analytics.totalViews / 1000).toFixed(0)}K` : '0', icon: Eye, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-500/30' },
    { label: 'Retenção Média', value: `${analytics?.avgRetention ?? 0}%`, icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-500/30' }
  ];

  const handleEditClip = (clip: ClipItem) => {
    setSelectedClip(clip);
    setActiveTab('clip_editor');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-900/60 via-indigo-900/40 to-cyber-card border border-violet-500/30 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/40 text-violet-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span>Motor de Edição Automática Ativo</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Transforme 1 Vídeo Longo em Dezenas de Cortes Prontos para Viralizar
          </h1>
          <p className="text-sm text-gray-300 font-normal leading-relaxed">
            A Inteligência Artificial analisa a retenção, enquadra em 9:16 com detecção facial, adiciona legendas animadas e agenda publicações automáticas no TikTok, Reels e Shorts.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <button
              onClick={() => setActiveTab('new_project')}
              className="py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/40 flex items-center gap-2 transition-transform transform hover:-translate-y-0.5"
            >
              <span>Enviar Vídeo Bruto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className="py-3 px-5 rounded-xl font-semibold text-sm glass-panel text-gray-200 hover:text-white hover:bg-cyber-card transition-colors"
            >
              Ver Calendário
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl border glass-panel ${kpi.bg} transition-all hover:scale-[1.02]`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-extrabold text-white">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* AI Insights & Feedback Loop Widget */}
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-cyber-card to-cyber-dark">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Recomendações da IA (Feedback Loop)</h3>
              <p className="text-xs text-gray-400">Apontamentos baseados no desempenho real dos seus vídeos publicados</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('analytics')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Ver Relatório de Desempenho</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-200">Duração Ideal Identificada: 30s - 45s</h4>
              <p className="text-xs text-gray-400 mt-1">
                Vídeos dentro desse intervalo apresentaram <strong className="text-emerald-400">+38% de retenção</strong> média nas últimas 20 postagens.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-200">Estilo de Legenda Viral + Amarelo Neon</h4>
              <p className="text-xs text-gray-400 mt-1">
                Legendas com fonte grande e destaques em amarelo aumentaram o engajamento em <strong className="text-violet-400">+42% no Instagram Reels</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Generated Clips Leaderboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Melhores Cortes Gerados pela IA</h3>
            <p className="text-xs text-gray-400">Pontuação holística baseada no gancho, retenção, contexto e duração</p>
          </div>
          <button
            onClick={() => setActiveTab('library')}
            className="text-xs font-semibold text-violet-400 hover:text-violet-300"
          >
            Ver Todos os Cortes ({clips.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="rounded-2xl glass-card border border-cyber-border overflow-hidden group hover:border-violet-500/50 transition-all duration-200 shadow-lg"
            >
              {/* Card Thumbnail / Preview */}
              <div className="relative aspect-[9/16] max-h-72 bg-black flex items-center justify-center overflow-hidden">
                <video src={clip.videoUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-transparent to-black/40" />

                {/* Score Badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-violet-600/90 text-white font-extrabold text-xs shadow-lg backdrop-blur-md border border-violet-400/40">
                  {clip.score}/100 Score
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 text-gray-200 font-mono text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{clip.duration}s</span>
                </div>

                {/* Quick Play/Edit Overlay Button */}
                <button
                  onClick={() => handleEditClip(clip)}
                  className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100 shadow-xl"
                >
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </button>
              </div>

              {/* Card Meta details */}
              <div className="p-4 space-y-3">
                <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-violet-300 transition-colors">
                  {clip.title}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2 italic">
                  "{clip.quoteSnippet}"
                </p>

                {/* Action Footer */}
                <div className="pt-2 border-t border-cyber-border/60 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    ✓ Renderizado 9:16
                  </span>
                  <button
                    onClick={() => handleEditClip(clip)}
                    className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                  >
                    <span>Editar & Publicar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Projetos Recentes</h3>
        <div className="rounded-2xl glass-panel border border-cyber-border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cyber-card/60 text-xs font-semibold text-gray-400 border-b border-cyber-border">
                <th className="py-3.5 px-6">Nome do Projeto</th>
                <th className="py-3.5 px-4">Duração Bruta</th>
                <th className="py-3.5 px-4">Cortes Encontrados</th>
                <th className="py-3.5 px-4">Cortes Aprovados</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60 text-xs">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-cyber-card/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">
                    {proj.name}
                    <p className="text-[11px] font-normal text-gray-400">{proj.description}</p>
                  </td>
                  <td className="py-4 px-4 font-mono text-gray-300">{proj.duration}</td>
                  <td className="py-4 px-4 font-bold text-cyan-400">{proj.clipsCount} cortes</td>
                  <td className="py-4 px-4 font-bold text-emerald-400">{proj.approvedCount} aprovados</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      ✓ Processado
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setActiveTab('my_projects')}
                      className="px-3 py-1.5 rounded-lg glass-panel text-violet-400 hover:text-white font-semibold"
                    >
                      Abrir Projeto
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
