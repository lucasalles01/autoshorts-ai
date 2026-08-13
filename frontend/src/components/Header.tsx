import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Search, Bell, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  const titleMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Visão Geral & Dashboard', subtitle: 'Acompanhe a produção automática e métricas em tempo real.' },
    new_project: { title: 'Novo Projeto de Corte IA', subtitle: 'Envie um vídeo bruto para escaneamento e geração automática de shorts.' },
    my_projects: { title: 'Meus Projetos', subtitle: 'Gerencie seus vídeos longos e históricos de análise.' },
    library: { title: 'Biblioteca de Conteúdo', subtitle: 'Repositório organizado de cortes finais, rascunhos e vídeos originais.' },
    queue: { title: 'Fila de Publicação', subtitle: 'Conteúdos agendados aguardando postagem nas redes sociais.' },
    calendar: { title: 'Calendário de Conteúdo', subtitle: 'Distribuição visual por dias e horários de maior engajamento.' },
    analytics: { title: 'Analytics & IA Feedback Loop', subtitle: 'Inteligência aprendendo com os resultados reais das suas contas.' },
    social_accounts: { title: 'Minhas Contas Sociais', subtitle: 'Conexões de APIs oficiais para TikTok, Reels e YouTube Shorts.' },
    settings: { title: 'Configurações do Sistema', subtitle: 'Ajuste pesos de IA, concorrência de workers e presets de legendas.' },
    clip_editor: { title: 'Editor Manual & Preview 9:16', subtitle: 'Revisão detalhada, enquadramento inteligente e legendas animadas.' }
  };

  const currentInfo = titleMap[activeTab] || titleMap.dashboard;

  return (
    <header className="h-20 bg-cyber-dark/80 backdrop-blur-md border-b border-cyber-border px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{currentInfo.title}</h2>
        <p className="text-xs text-gray-400 font-normal">{currentInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-5">
        {/* Global Search input */}
        <div className="relative w-64 hidden lg:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Pesquisar projetos ou cortes..."
            className="w-full glass-input text-xs rounded-xl pl-9 pr-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* Engine status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>FFmpeg Worker Ativo</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl glass-panel text-gray-400 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-violet-500 absolute top-2 right-2 ring-2 ring-cyber-dark" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-cyber-border">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-violet-500/40">
            US
          </div>
          <div className="hidden sm:block">
            <h4 className="text-xs font-bold text-white">Usuário Pro</h4>
            <p className="text-[10px] text-violet-400 font-semibold">Plano Enterprise</p>
          </div>
        </div>
      </div>
    </header>
  );
};
