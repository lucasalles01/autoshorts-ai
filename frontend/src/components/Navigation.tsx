import React from 'react';
import { useAppStore, NavTab } from '../store/useAppStore';
import {
  LayoutDashboard,
  PlusCircle,
  FileVideo,
  Library,
  ListOrdered,
  Calendar,
  BarChart3,
  Share2,
  Settings,
  Sparkles,
  Zap
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  const menuItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new_project', label: 'Novo Projeto', icon: PlusCircle, badge: 'IA Pipeline' },
    { id: 'my_projects', label: 'Meus Projetos', icon: FileVideo },
    { id: 'library', label: 'Biblioteca', icon: Library },
    { id: 'queue', label: 'Fila de Publicação', icon: ListOrdered },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'analytics', label: 'Analytics & IA', icon: BarChart3 },
    { id: 'social_accounts', label: 'Minhas Contas', icon: Share2 },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  return (
    <aside className="w-64 h-screen bg-cyber-dark border-r border-cyber-border flex flex-col justify-between p-4 sticky top-0 select-none z-30">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center neon-glow-violet">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              AutoShorts <span className="text-violet-400 text-xs font-semibold px-1.5 py-0.5 rounded bg-violet-950/80 border border-violet-500/30">AI</span>
            </h1>
            <p className="text-[11px] text-gray-400 font-medium">CortesIA Studio v2.5</p>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={() => setActiveTab('new_project')}
          className="w-full mb-6 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/30 flex items-center justify-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Criar Novo Projeto</span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-violet-950/60 text-violet-300 border border-violet-500/40 shadow-inner'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-cyber-card/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status & Usage Meter */}
      <div className="p-3.5 rounded-xl glass-panel space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-gray-300 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Créditos IA</span>
          </div>
          <span className="font-bold text-violet-400">840 / 1000 min</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full w-[84%]" />
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-800">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            Workers Online
          </span>
          <span className="font-semibold text-gray-300">Fastify + S3</span>
        </div>
      </div>
    </aside>
  );
};
