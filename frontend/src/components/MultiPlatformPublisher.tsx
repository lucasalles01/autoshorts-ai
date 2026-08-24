import React, { useState } from 'react';
import { Youtube, Instagram, Share2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface MultiPlatformPublisherProps {
  clipId: string;
  onPublishComplete?: (results: any[]) => void;
}

export const MultiPlatformPublisher: React.FC<MultiPlatformPublisherProps> = ({
  clipId,
  onPublishComplete
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    hashtags: ''
  });

  const platforms = [
    { id: 'TIKTOK', name: 'TikTok', icon: Share2, color: 'bg-black' },
    { id: 'YOUTUBE', name: 'YouTube Shorts', icon: Youtube, color: 'bg-red-600' },
    { id: 'INSTAGRAM', name: 'Instagram Reels', icon: Instagram, color: 'bg-gradient-to-br from-purple-600 to-pink-600' }
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      alert('Selecione pelo menos uma plataforma');
      return;
    }

    setIsPublishing(true);
    setResults([]);

    try {
      const response = await fetch('/api/posts/multi-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipId,
          platforms: selectedPlatforms,
          metadata: {
            title: metadata.title || undefined,
            description: metadata.description || undefined,
            hashtags: metadata.hashtags ? metadata.hashtags.split(',').map(h => h.trim()) : undefined
          }
        })
      });

      if (!response.ok) throw new Error('Erro ao publicar');

      const data = await response.json();
      setResults(data.results);
      onPublishComplete?.(data.results);
    } catch (error) {
      console.error('Erro ao publicar:', error);
      alert('Erro ao publicar em múltiplas plataformas');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Publicação Multi-plataforma</h3>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Selecione as Plataformas</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const isSelected = selectedPlatforms.includes(platform.id);
            
            return (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{platform.name}</p>
                    <p className="text-xs text-gray-500">
                      {isSelected ? 'Selecionado' : 'Clique para selecionar'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700">Metadados da Publicação (Opcional)</label>
        
        <div className="space-y-2">
          <label className="text-xs text-gray-500">Título</label>
          <input
            type="text"
            value={metadata.title}
            onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Título do vídeo..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-500">Descrição</label>
          <textarea
            value={metadata.description}
            onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição do vídeo..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-500">Hashtags (separadas por vírgula)</label>
          <input
            type="text"
            value={metadata.hashtags}
            onChange={(e) => setMetadata(prev => ({ ...prev, hashtags: e.target.value }))}
            placeholder="#viral, #shorts, #fyp"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Publish Button */}
      <button
        onClick={handlePublish}
        disabled={isPublishing || selectedPlatforms.length === 0}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPublishing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Publicando...
          </>
        ) : (
          <>
            <Share2 className="w-5 h-5" />
            Publicar em {selectedPlatforms.length} Plataforma{selectedPlatforms.length !== 1 ? 's' : ''}
          </>
        )}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Resultados da Publicação</label>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{result.platform}</p>
                  {result.error && (
                    <p className="text-sm text-red-600">{result.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};