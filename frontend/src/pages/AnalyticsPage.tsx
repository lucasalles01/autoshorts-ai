import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { BarChart3, TrendingUp, Sparkles, CheckCircle2, RefreshCw, Eye, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { setActiveTab } = useAppStore();

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Feedback Loop Banner */}
      <div className="p-8 rounded-2xl glass-panel border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-cyber-card to-cyber-dark space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-violet-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">AI Feedback Loop Engine</h2>
            <p className="text-xs text-gray-400">A IA analisa continuamente os dados das suas postagens para aperfeiçoar futuros cortes.</p>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="p-4 rounded-xl bg-cyber-dark border border-violet-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Insight da IA #104: Padrão de Alta Retenção Identificado
            </span>
            <button className="py-1 px-3 rounded bg-violet-600 text-white font-bold text-[10px]">
              Aplicar nos Próximos Cortes
            </button>
          </div>
          <p className="text-xs text-gray-300">
            "Cortes com duração entre <strong>30 e 45 segundos</strong> que começam com uma pergunta polêmica apresentaram <strong>38% mais retenção final</strong> e <strong>42% mais compartilhamentos</strong> nas últimas 30 postagens."
          </p>
        </div>
      </div>

      {/* Analytics KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl glass-panel border border-cyber-border space-y-2">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-2">
            <Eye className="w-4 h-4 text-violet-400" />
            Visualizações Acumuladas
          </span>
          <p className="text-3xl font-extrabold text-white">1.485.000</p>
          <span className="text-[11px] font-semibold text-emerald-400">+24% vs. mês anterior</span>
        </div>

        <div className="p-5 rounded-xl glass-panel border border-cyber-border space-y-2">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-cyan-400" />
            Curtidas Totais
          </span>
          <p className="text-3xl font-extrabold text-white">142.800</p>
          <span className="text-[11px] font-semibold text-emerald-400">+18% vs. mês anterior</span>
        </div>

        <div className="p-5 rounded-xl glass-panel border border-cyber-border space-y-2">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            Comentários Gerados
          </span>
          <p className="text-3xl font-extrabold text-white">18.420</p>
          <span className="text-[11px] font-semibold text-emerald-400">+31% vs. mês anterior</span>
        </div>

        <div className="p-5 rounded-xl glass-panel border border-cyber-border space-y-2">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Retenção Média Final
          </span>
          <p className="text-3xl font-extrabold text-white">86.4%</p>
          <span className="text-[11px] font-semibold text-emerald-400">Excelente (Top 5%)</span>
        </div>
      </div>

      {/* Top Performing Content Reuse Trigger */}
      <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Reutilizar Conteúdo de Alto Desempenho</h3>
            <p className="text-xs text-gray-400">Cortes com desempenho 80%+ acima da média que podem ser reagendados com novas legendas ou ganchos.</p>
          </div>
          <button
            onClick={() => setActiveTab('new_project')}
            className="py-2.5 px-5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reagendar Melhor Vídeo</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 bg-black rounded-lg border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-400">
              9:16
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">ELE NÃO ESPERAVA ESSA RESPOSTA 😳</h4>
              <p className="text-[11px] text-gray-400">Publicado no TikTok & Reels • 485K visualizações • 42K curtidas</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 font-extrabold text-xs border border-emerald-500/30">
            Desempenho +94% Superior
          </span>
        </div>
      </div>
    </div>
  );
};
