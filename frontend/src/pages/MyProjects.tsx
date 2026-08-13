import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { FileVideo, Search, Play, FileText, Scissors, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export const MyProjects: React.FC = () => {
  const { projects, clips, setActiveTab, setSelectedClip } = useAppStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Search & Filter */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Pesquisar projetos antigos..."
            className="w-full glass-input text-xs rounded-xl pl-9 pr-4 py-2.5 text-gray-200"
          />
        </div>

        <button
          onClick={() => setActiveTab('new_project')}
          className="py-2.5 px-4 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md flex items-center gap-2"
        >
          <span>+ Novo Projeto</span>
        </button>
      </div>

      {/* Main Grid: Projects List + Selected Project Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left List of Projects */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Todos os Projetos ({projects.length})</h3>
          <div className="space-y-3">
            {projects.map((proj) => {
              const isSelected = proj.id === selectedProjectId;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-4 rounded-xl border glass-card cursor-pointer transition-all ${
                    isSelected ? 'border-violet-500 bg-violet-950/30 ring-1 ring-violet-500/40' : 'border-cyber-border hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <FileVideo className={`w-5 h-5 ${isSelected ? 'text-violet-400' : 'text-gray-400'}`} />
                      <h4 className="text-xs font-bold text-white line-clamp-1">{proj.name}</h4>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 line-clamp-2">{proj.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 mt-2 border-t border-cyber-border/60">
                    <span className="font-mono">{proj.duration}</span>
                    <span className="font-bold text-cyan-400">{proj.clipsCount} cortes</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane */}
        {activeProject && (
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    ✓ Análise & Processamento Concluídos
                  </span>
                  <h2 className="text-xl font-extrabold text-white mt-2">{activeProject.name}</h2>
                  <p className="text-xs text-gray-400 mt-1">{activeProject.description}</p>
                </div>
                <div className="text-right text-xs font-mono text-gray-400">
                  <p>Criado em: {activeProject.createdAt}</p>
                  <p className="text-violet-400 font-semibold mt-1">Duração: {activeProject.duration}</p>
                </div>
              </div>

              {/* Source Transcript Preview Box */}
              <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                  <FileText className="w-4 h-4 text-violet-400" />
                  <span>Transcrição Completa do Vídeo Bruto (Whisper AI)</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-mono bg-black/40 p-3 rounded-lg border border-cyber-border max-h-36 overflow-y-auto">
                  [00:00:12] "Essa foi a melhor decisão que já tomei na minha vida inteira. Quando percebemos que poderíamos transformar todo o conteúdo longo em dezenas de shorts automáticos, nosso alcance triplicou..."
                </p>
              </div>
            </div>

            {/* Approved Clips in this project */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Cortes Aprovados para Publicação ({clips.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clips.map((clip) => (
                  <div key={clip.id} className="p-4 rounded-xl glass-card border border-cyber-border space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xs text-white line-clamp-1">{clip.title}</h4>
                      <span className="px-2 py-0.5 rounded bg-violet-600 text-white font-bold text-[10px]">
                        {clip.score}/100
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 italic line-clamp-2">"{clip.quoteSnippet}"</p>
                    <div className="flex items-center justify-between pt-2 border-t border-cyber-border/60">
                      <span className="text-[10px] text-gray-400 font-mono">{clip.duration}s</span>
                      <button
                        onClick={() => {
                          setSelectedClip(clip);
                          setActiveTab('clip_editor');
                        }}
                        className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                      >
                        <span>Abrir no Editor 9:16</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
