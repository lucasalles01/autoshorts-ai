import React from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

interface RenderProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const RenderProgress: React.FC<RenderProgressProps> = ({
  currentStep,
  totalSteps,
  steps
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl glass-panel border border-cyan-500/30 text-center space-y-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">Processando Vídeo</h3>
          <span className="text-sm text-cyan-400 font-mono">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden p-0.5 border border-cyber-border">
          <div
            className="bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div key={index} className="flex items-center space-x-3">
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              ) : (
                <Circle className="w-5 h-5 text-gray-600" />
              )}
              <span
                className={`text-sm ${
                  isCompleted
                    ? 'text-emerald-400 font-medium'
                    : isCurrent
                    ? 'text-cyan-400 font-medium'
                    : 'text-gray-500'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};