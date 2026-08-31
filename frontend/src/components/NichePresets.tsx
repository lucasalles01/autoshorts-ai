import React from 'react';
import { Podcast, Flame, Briefcase, Zap } from 'lucide-react';

export interface NichePreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  config: {
    captionStyle: 'VIRAL' | 'MODERN' | 'MINIMAL' | 'PROFESSIONAL';
    primaryColor: string;
    highlightColor: string;
    fontSize: number;
    captionPosition: 'CENTER_BOTTOM' | 'CENTER' | 'TOP';
    framingMode: 'FACE_TRACKING' | 'SUBJECT_TRACKING' | 'CENTER_CROP';
    silenceRemoval: string;
    voiceId?: string;
  };
}

const nichePresets: NichePreset[] = [
  {
    id: 'podcast',
    name: 'Podcast',
    icon: <Podcast className="w-5 h-5" />,
    description: 'Legenda centralizada, voz neutra, corte rápido',
    config: {
      captionStyle: 'MINIMAL',
      primaryColor: '#FFFFFF',
      highlightColor: '#FACC15',
      fontSize: 22,
      captionPosition: 'CENTER',
      framingMode: 'FACE_TRACKING',
      silenceRemoval: 'MEDIUM',
      voiceId: 'shimmer' // Female voice
    }
  },
  {
    id: 'stories',
    name: 'Stories & Curiosidades',
    icon: <Flame className="w-5 h-5" />,
    description: 'Estilo MrBeast, voz narradora, fundo dinâmico',
    config: {
      captionStyle: 'VIRAL',
      primaryColor: '#FFFFFF',
      highlightColor: '#FF6B6B',
      fontSize: 28,
      captionPosition: 'CENTER_BOTTOM',
      framingMode: 'SUBJECT_TRACKING',
      silenceRemoval: 'AGGRESSIVE',
      voiceId: 'onyx' // Male voice
    }
  },
  {
    id: 'motivational',
    name: 'Motivacional / Negócios',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'Legenda minimalista, tom de voz sério',
    config: {
      captionStyle: 'PROFESSIONAL',
      primaryColor: '#FFFFFF',
      highlightColor: '#8B5CF6',
      fontSize: 20,
      captionPosition: 'CENTER_BOTTOM',
      framingMode: 'CENTER_CROP',
      silenceRemoval: 'LIGHT',
      voiceId: 'echo' // Female voice
    }
  },
  {
    id: 'fast',
    name: 'Fast/Viral',
    icon: <Zap className="w-5 h-5" />,
    description: 'Ritmo acelerado, cortes dinâmicos',
    config: {
      captionStyle: 'MODERN',
      primaryColor: '#06B6D4',
      highlightColor: '#FACC15',
      fontSize: 26,
      captionPosition: 'CENTER_BOTTOM',
      framingMode: 'SUBJECT_TRACKING',
      silenceRemoval: 'AGGRESSIVE',
      voiceId: 'alloy' // Neutral voice
    }
  }
];

interface NichePresetsProps {
  onApplyPreset: (preset: NichePreset) => void;
  disabled?: boolean;
}

export const NichePresets: React.FC<NichePresetsProps> = ({ onApplyPreset, disabled = false }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="text-sm font-bold text-white">Presets por Nicho</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {nichePresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => !disabled && onApplyPreset(preset)}
            disabled={disabled}
            className={`p-4 rounded-xl border text-left transition-all group ${
              disabled
                ? 'opacity-50 cursor-not-allowed border-cyber-border'
                : 'border-cyber-border hover:border-violet-500 hover:bg-violet-950/20 cursor-pointer'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                {preset.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white mb-1">{preset.name}</h4>
                <p className="text-[10px] text-gray-400 line-clamp-2">{preset.description}</p>
              </div>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="px-2 py-0.5 rounded-full bg-cyber-card text-[9px] text-gray-300">
                {preset.config.captionStyle}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyber-card text-[9px] text-gray-300">
                {preset.config.silenceRemoval}
              </span>
            </div>
          </button>
        ))}
      </div>
      
      <p className="text-[10px] text-gray-500 text-center">
        Clique em um preset para aplicar configurações otimizadas automaticamente
      </p>
    </div>
  );
};