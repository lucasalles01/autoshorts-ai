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
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Processando Vídeo</h3>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
              <span
                className={`text-sm ${
                  isCompleted
                    ? 'text-green-600 font-medium'
                    : isCurrent
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-400'
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