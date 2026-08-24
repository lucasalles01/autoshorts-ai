import React, { useState } from 'react';
import { Image as ImageIcon, Type, Palette, Download, Sparkles } from 'lucide-react';

interface ThumbnailEditorProps {
  clipId: string;
  onThumbnailGenerated?: (thumbnailUrl: string) => void;
}

export const ThumbnailEditor: React.FC<ThumbnailEditorProps> = ({
  clipId,
  onThumbnailGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [addText, setAddText] = useState(false);
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(48);
  const [timestamp, setTimestamp] = useState(5);

  const handleGenerateThumbnail = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/thumbnails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipId,
          timestamp,
          addText,
          text: addText ? text : undefined,
          textColor: addText ? textColor : undefined,
          fontSize: addText ? fontSize : undefined
        })
      });

      if (!response.ok) throw new Error('Erro ao gerar thumbnail');

      const data = await response.json();
      const fullUrl = data.thumbnailUrl;
      setThumbnailUrl(fullUrl);
      onThumbnailGenerated?.(fullUrl);
    } catch (error) {
      console.error('Erro ao gerar thumbnail:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBestFrame = async () => {
    setIsGenerating(true);
    try {
      // Primeiro detecta melhor frame (simulado usando timestamp variável)
      const randomTimestamp = Math.floor(Math.random() * 30) + 1;
      setTimestamp(randomTimestamp);
      
      const response = await fetch('/api/thumbnails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipId,
          timestamp: randomTimestamp,
          addText,
          text: addText ? text : undefined,
          textColor: addText ? textColor : undefined,
          fontSize: addText ? fontSize : undefined
        })
      });

      if (!response.ok) throw new Error('Erro ao gerar melhor frame');

      const data = await response.json();
      const fullUrl = data.thumbnailUrl;
      setThumbnailUrl(fullUrl);
      onThumbnailGenerated?.(fullUrl);
    } catch (error) {
      console.error('Erro ao gerar melhor frame:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Editor de Thumbnail</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateThumbnail}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4" />
            {isGenerating ? 'Gerando...' : 'Gerar Thumbnail'}
          </button>
          <button
            onClick={handleGenerateBestFrame}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Melhor Frame IA
          </button>
        </div>
      </div>

      {/* Preview */}
      {thumbnailUrl && (
        <div className="relative bg-gray-100 rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
          <img
            src={thumbnailUrl}
            alt="Thumbnail preview"
            className="max-w-full max-h-[400px] object-contain"
          />
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = thumbnailUrl;
              link.download = `thumbnail-${clipId}.jpg`;
              link.click();
            }}
            className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      )}

      {!thumbnailUrl && (
        <div className="bg-gray-100 rounded-lg min-h-[300px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Clique em "Gerar Thumbnail" para criar uma capa</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timestamp */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Timestamp (segundos)</label>
          <input
            type="number"
            value={timestamp}
            onChange={(e) => setTimestamp(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            min="0"
            max="300"
          />
        </div>

        {/* Add Text Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Adicionar Texto</label>
          <button
            onClick={() => setAddText(!addText)}
            className={`w-full px-3 py-2 rounded-lg transition-colors ${
              addText ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {addText ? 'Texto Ativado' : 'Texto Desativado'}
          </button>
        </div>

        {addText && (
          <>
            {/* Text Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Type className="w-4 h-4" />
                Texto
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite o texto para a capa..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Cor do Texto
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tamanho da Fonte: {fontSize}px</label>
              <input
                type="range"
                min="12"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};