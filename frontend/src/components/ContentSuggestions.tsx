import React, { useState } from 'react';
import { Copy, Edit2, Check, Sparkles } from 'lucide-react';

interface ContentSuggestionsProps {
  script?: string;
  theme?: string;
  onGenerate?: () => void;
}

interface ContentData {
  title: string;
  description: string;
  hashtags: string[];
}

export const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({
  script,
  theme,
  onGenerate
}) => {
  const [content, setContent] = useState<ContentData>({
    title: '',
    description: '',
    hashtags: []
  });
  const [editing, setEditing] = useState<'title' | 'description' | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleEdit = (field: 'title' | 'description', value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
    setEditing(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Sugestões de Conteúdo</h3>
        </div>
        {onGenerate && (
          <button
            onClick={onGenerate}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Gerar Novas
          </button>
        )}
      </div>

      {/* Título */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Título</label>
        <div className="flex gap-2">
          {editing === 'title' ? (
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              onBlur={() => handleEdit('title', content.title)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
          ) : (
            <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              {content.title || 'Clique em "Gerar Novas" para criar sugestões'}
            </div>
          )}
          <button
            onClick={() => handleCopy(content.title, 'title')}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Copiar"
          >
            {copied === 'title' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setEditing('title')}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Descrição</label>
        <div className="flex gap-2">
          {editing === 'description' ? (
            <textarea
              value={content.description}
              onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
              onBlur={() => handleEdit('description', content.description)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              autoFocus
            />
          ) : (
            <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[80px]">
              {content.description || 'Clique em "Gerar Novas" para criar sugestões'}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleCopy(content.description, 'description')}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Copiar"
            >
              {copied === 'description' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setEditing('description')}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hashtags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Hashtags</label>
        <div className="flex flex-wrap gap-2">
          {content.hashtags.map((tag, index) => (
            <div
              key={index}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                onClick={() => {
                  setContent(prev => ({
                    ...prev,
                    hashtags: prev.hashtags.filter((_, i) => i !== index)
                  }));
                }}
                className="text-purple-500 hover:text-purple-700"
              >
                ×
              </button>
            </div>
          ))}
          {content.hashtags.length === 0 && (
            <span className="text-gray-400 text-sm">Clique em "Gerar Novas" para criar sugestões</span>
          )}
        </div>
        <button
          onClick={() => handleCopy(content.hashtags.join(' '), 'hashtags')}
          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
        >
          {copied === 'hashtags' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          Copiar todas as hashtags
        </button>
      </div>
    </div>
  );
};