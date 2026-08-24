import React, { useState } from 'react';
import { Type, Palette, Layout, Save } from 'lucide-react';

interface CaptionStyleProps {
  currentStyle?: string;
  onSave?: (style: CaptionStyleData) => void;
}

interface CaptionStyleData {
  fontSize: number;
  fontColor: string;
  highlightColor: string;
  position: 'top' | 'middle' | 'bottom';
  backgroundColor: string;
  backgroundOpacity: number;
}

export const CaptionStyleEditor: React.FC<CaptionStyleProps> = ({
  currentStyle = 'VIRAL',
  onSave
}) => {
  const [style, setStyle] = useState<CaptionStyleData>({
    fontSize: 24,
    fontColor: '#FFFFFF',
    highlightColor: '#FF6B6B',
    position: 'bottom',
    backgroundColor: '#000000',
    backgroundOpacity: 0.7
  });

  const presetStyles = {
    VIRAL: {
      fontSize: 24,
      fontColor: '#FFFFFF',
      highlightColor: '#FF6B6B',
      position: 'bottom' as const,
      backgroundColor: '#000000',
      backgroundOpacity: 0.7
    },
    CLEAN: {
      fontSize: 20,
      fontColor: '#FFFFFF',
      highlightColor: '#4ECDC4',
      position: 'middle' as const,
      backgroundColor: '#000000',
      backgroundOpacity: 0.5
    },
    BOLD: {
      fontSize: 28,
      fontColor: '#FFFFFF',
      highlightColor: '#FFE66D',
      position: 'bottom' as const,
      backgroundColor: '#000000',
      backgroundOpacity: 0.8
    },
    MINIMAL: {
      fontSize: 18,
      fontColor: '#FFFFFF',
      highlightColor: '#FFFFFF',
      position: 'top' as const,
      backgroundColor: '#000000',
      backgroundOpacity: 0.3
    }
  };

  const applyPreset = (preset: keyof typeof presetStyles) => {
    setStyle(presetStyles[preset]);
  };

  const handleSave = () => {
    onSave?.(style);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Estilo de Legendas</h3>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          Salvar
        </button>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Estilos Predefinidos</label>
        <div className="grid grid-cols-4 gap-2">
          {Object.keys(presetStyles).map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset as keyof typeof presetStyles)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStyle === preset
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Tamanho da Fonte */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Tamanho da Fonte: {style.fontSize}px
        </label>
        <input
          type="range"
          min="12"
          max="36"
          value={style.fontSize}
          onChange={(e) => setStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
          className="w-full"
        />
      </div>

      {/* Cores */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Cores
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Cor do Texto</label>
            <input
              type="color"
              value={style.fontColor}
              onChange={(e) => setStyle(prev => ({ ...prev, fontColor: e.target.value }))}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Cor de Destaque</label>
            <input
              type="color"
              value={style.highlightColor}
              onChange={(e) => setStyle(prev => ({ ...prev, highlightColor: e.target.value }))}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Posição */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Layout className="w-4 h-4" />
          Posição
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['top', 'middle', 'bottom'] as const).map((position) => (
            <button
              key={position}
              onClick={() => setStyle(prev => ({ ...prev, position }))}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                style.position === position
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {position === 'top' ? 'Superior' : position === 'middle' ? 'Central' : 'Inferior'}
            </button>
          ))}
        </div>
      </div>

      {/* Background */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Cor de Fundo</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Cor</label>
            <input
              type="color"
              value={style.backgroundColor}
              onChange={(e) => setStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Opacidade: {Math.round(style.backgroundOpacity * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={style.backgroundOpacity}
              onChange={(e) => setStyle(prev => ({ ...prev, backgroundOpacity: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 bg-gray-100 rounded-lg">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Preview</label>
        <div
          className="relative p-4 rounded min-h-[100px] flex items-center justify-center"
          style={{
            backgroundColor: style.backgroundColor,
            opacity: style.backgroundOpacity,
            color: style.fontColor,
            fontSize: `${style.fontSize}px`,
            display: 'flex',
            alignItems: style.position === 'top' ? 'flex-start' : style.position === 'middle' ? 'center' : 'flex-end'
          }}
        >
          <span className="text-center">
            Exemplo de <span style={{ color: style.highlightColor }}>legenda</span> com estilo personalizado
          </span>
        </div>
      </div>
    </div>
  );
};