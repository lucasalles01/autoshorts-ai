import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Library as LibraryIcon, Search, Filter, FileVideo, Scissors, CheckCircle2, Download, Trash2 } from 'lucide-react';

export const LibraryPage: React.FC = () => {
  const { clips, setSelectedClip, setActiveTab } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LibraryIcon className="w-6 h-6 text-violet-400" />
          <h2 className="text-xl font-extrabold text-white">Biblioteca de Conteúdo</h2>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'ALL', label: 'Todos os Arquivos' },
            { id: 'ORIGINALS', label: 'Vídeos Originais' },
            { id: 'APPROVED', label: 'Cortes Aprovados' },
            { id: 'PUBLISHED', label: 'Publicados' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeCategory === cat.id
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'glass-panel text-gray-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Assets */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {clips.map((clip) => (
          <div key={clip.id} className="p-4 rounded-2xl glass-card border border-cyber-border space-y-3 group hover:border-violet-500/50 transition-all">
            <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden flex items-center justify-center">
              <video src={clip.videoUrl} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-violet-600 text-white font-extrabold text-[10px]">
                {clip.score}/100
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-xs text-white line-clamp-1">{clip.title}</h4>
              <p className="text-[11px] text-gray-400 font-mono">{clip.duration}s • Renderizado MP4</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-cyber-border/60">
              <button
                onClick={() => {
                  setSelectedClip(clip);
                  setActiveTab('clip_editor');
                }}
                className="text-xs font-bold text-violet-400 hover:text-violet-300"
              >
                Editar / Reagendar
              </button>
              <button className="text-gray-400 hover:text-white p-1">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
