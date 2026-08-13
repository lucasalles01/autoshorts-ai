import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Cpu, Save, ShieldCheck, Database } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [weights, setWeights] = useState({
    hookWeight: 1.5,
    contextWeight: 1.2,
    coherenceWeight: 1.1,
    emotionWeight: 1.0,
    retentionWeight: 1.4,
    shareabilityWeight: 1.3,
    commentabilityWeight: 1.1,
    durationWeight: 1.2
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-violet-400" />
        <h2 className="text-xl font-extrabold text-white">Configurações Técnicas & Parâmetros da IA</h2>
      </div>

      {/* AI Weights Configuration Section */}
      <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Pesos da Fórmula do AI Cut Score</h3>
            <p className="text-xs text-gray-400">Ajuste a relevância de cada fator para o cálculo da nota média ponderada (0 a 100).</p>
          </div>
          <button className="py-2 px-4 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Salvar Pesos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(weights).map(([key, val]) => (
            <div key={key} className="space-y-2 p-3 rounded-xl bg-cyber-card border border-cyber-border">
              <label className="text-xs font-bold text-gray-300 capitalize">{key.replace('Weight', ' Weight')}:</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={val}
                  onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })}
                  className="w-full accent-violet-600"
                />
                <span className="text-xs font-mono font-bold text-violet-400 w-8">{val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worker Concurrency & Infrastructure status */}
      <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-4">
        <h3 className="text-base font-bold text-white">Concorrência de Workers do Backend (BullMQ / Redis)</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border space-y-1">
            <span className="text-gray-400">VIDEO_WORKER_CONCURRENCY:</span>
            <p className="text-lg font-bold text-cyan-400">2 Workers FFmpeg</p>
          </div>
          <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border space-y-1">
            <span className="text-gray-400">AI_WORKER_CONCURRENCY:</span>
            <p className="text-lg font-bold text-violet-400">3 Workers Whisper/Gemini</p>
          </div>
          <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border space-y-1">
            <span className="text-gray-400">PUBLISHING_WORKER_CONCURRENCY:</span>
            <p className="text-lg font-bold text-emerald-400">5 Workers Social APIs</p>
          </div>
        </div>
      </div>
    </div>
  );
};
