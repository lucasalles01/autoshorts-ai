import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { BarChart3, TrendingUp, Sparkles, CheckCircle2, RefreshCw, Eye, ThumbsUp, MessageSquare, Share2, Video, Clock, Calendar } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { setActiveTab } = useAppStore();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dados mockados caso a API não retorne dados
  const mockData = {
    kpis: {
      totalVideos: 127,
      totalMinutesProcessed: 8540,
      completedPublications: 98,
      avgEngagementRate: 12.5
    },
    monthlyStats: [
      { month: 'Jan', videos: 12, minutes: 420, publications: 10 },
      { month: 'Fev', videos: 18, minutes: 680, publications: 15 },
      { month: 'Mar', videos: 25, minutes: 950, publications: 22 },
      { month: 'Abr', videos: 32, minutes: 1240, publications: 28 },
      { month: 'Mai', videos: 28, minutes: 1100, publications: 25 },
      { month: 'Jun', videos: 35, minutes: 1350, publications: 32 }
    ]
  };

  const data = analyticsData || mockData;

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
            <Video className="w-4 h-4 text-violet-400" />
            Vídeos Gerados
          </span>
          <p className="text-3xl font-extrabold text-white">{data.kpis.totalVideos}</p>
          <span className="text-[11px] font-semibold text-emerald-400">Total processado</span>
        </div>

        <div className="p-5 rounded-xl glass-panel border border-cyber-border space-y-2">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Minutos Processados
          </span>
          <p className="text-3xl font-extrabold text-white">{Math.round(data.kpis.totalMinutesProcessed)} min</p>
          <span className="text-[11px] font-semibold text-emerald-400">Tempo total</span>
        </div>

        <div className="p-5 rounded-xl glass-panel border border-cyber-border space-y-2">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Publicações Concluídas
          </span>
          <p className="text-3xl font-extrabold text-white">{data.kpis.completedPublications}</p>
          <span className="text-[11px] font-semibold text-emerald-400">Sucesso total</span>
        </div>

        <div className="p-5 rounded-xl glass-panel border border-cyber-border space-y-2">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Taxa de Engajamento
          </span>
          <p className="text-3xl font-extrabold text-white">{data.kpis.avgEngagementRate}%</p>
          <span className="text-[11px] font-semibold text-emerald-400">Média geral</span>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Histórico de Publicações</h3>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : 'Ano'}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl glass-panel border border-cyber-border space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-violet-400" />
            Vídeos por Mês
          </h4>
          <div className="h-48 flex items-end justify-between gap-2">
            {data.monthlyStats.map((stat: any, index: number) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-violet-600 to-cyan-400 rounded-t"
                  style={{ height: `${(stat.videos / 40) * 100}%` }}
                />
                <span className="text-xs text-gray-400">{stat.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl glass-panel border border-cyber-border space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Minutos Processados por Mês
          </h4>
          <div className="h-48 flex items-end justify-between gap-2">
            {data.monthlyStats.map((stat: any, index: number) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-emerald-400 rounded-t"
                  style={{ height: `${(stat.minutes / 1500) * 100}%` }}
                />
                <span className="text-xs text-gray-400">{stat.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Publications History */}
      <div className="p-6 rounded-xl glass-panel border border-cyber-border space-y-4">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Histórico de Publicações
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-cyber-border">
                <th className="pb-3">Mês</th>
                <th className="pb-3">Vídeos</th>
                <th className="pb-3">Minutos</th>
                <th className="pb-3">Publicações</th>
                <th className="pb-3">Taxa de Sucesso</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlyStats.map((stat: any, index: number) => (
                <tr key={index} className="border-b border-cyber-border/50">
                  <td className="py-3 text-white">{stat.month}</td>
                  <td className="py-3 text-gray-300">{stat.videos}</td>
                  <td className="py-3 text-gray-300">{stat.minutes} min</td>
                  <td className="py-3 text-gray-300">{stat.publications}</td>
                  <td className="py-3 text-emerald-400">
                    {Math.round((stat.publications / stat.videos) * 100)}%
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
