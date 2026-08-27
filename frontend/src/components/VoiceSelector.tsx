import React, { useState, useEffect } from 'react';
import { Play, Volume2, Music, Loader2, CheckCircle2 } from 'lucide-react';

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  language: string;
  accent: string;
  style: 'dynamic' | 'narrator' | 'calm' | 'energetic';
  provider: 'openai' | 'elevenlabs';
}

interface VoiceSelectorProps {
  onVoiceSelected?: (voiceId: string) => void;
  currentVoiceId?: string;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  onVoiceSelected,
  currentVoiceId
}) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(currentVoiceId || null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tts/voices');
      if (response.ok) {
        const data = await response.json();
        setVoices(data);
      }
    } catch (error) {
      console.error('Erro ao carregar vozes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    onVoiceSelected?.(voiceId);
  };

  const handlePreview = async (voiceId: string) => {
    setPreviewLoading(true);
    setPreviewUrl(null);

    try {
      const response = await fetch('/api/tts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceId })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error('Erro ao fazer preview:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male':
        return '👨';
      case 'female':
        return '👩';
      default:
        return '🎭';
    }
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'dynamic':
        return 'bg-purple-100 text-purple-700';
      case 'narrator':
        return 'bg-blue-100 text-blue-700';
      case 'calm':
        return 'bg-green-100 text-green-700';
      case 'energetic':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'OpenAI';
      case 'elevenlabs':
        return 'ElevenLabs';
      default:
        return provider;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Seleção de Voz IA</h3>
        </div>
        <button
          onClick={() => loadVoices()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <Volume2 className="w-4 h-4" />
          Recarregar Vozes
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <span className="ml-3 text-gray-500">Carregando vozes...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Audio Preview */}
          {previewUrl && (
            <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-4">
              <button
                onClick={() => {
                  const audio = new Audio(previewUrl);
                  audio.play();
                }}
                className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
              >
                <Play className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Preview da Voz Selecionada</p>
                <p className="text-xs text-gray-500">Clique para ouvir o exemplo</p>
              </div>
              <button
                onClick={() => {
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          )}

          {/* Voice Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voices.map((voice) => {
              const isSelected = selectedVoice === voice.id;
              
              return (
                <div
                  key={voice.id}
                  onClick={() => handleVoiceSelect(voice.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getGenderIcon(voice.gender)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{voice.name}</h4>
                        <p className="text-xs text-gray-500">{voice.language.toUpperCase()}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStyleColor(voice.style)}`}>
                      {voice.style}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {voice.accent}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{getProviderBadge(voice.provider)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(voice.id);
                      }}
                      disabled={previewLoading}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Preview"
                    >
                      {previewLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {voices.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma voz disponível. Configure OPENAI_API_KEY ou ELEVENLABS_API_KEY.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};