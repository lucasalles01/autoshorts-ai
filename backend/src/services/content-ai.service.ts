import { env } from '../config/env.js';

interface ContentSuggestion {
  title: string;
  description: string;
  hashtags: string[];
}

export class ContentAIService {
  async generateContentSuggestions(script: string, theme?: string): Promise<ContentSuggestion> {
    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.length < 20) {
      // Fallback se não tiver API key
      return this.generateFallbackSuggestions(script, theme);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em criar conteúdo viral para redes sociais como TikTok, Instagram Reels e YouTube Shorts.'
            },
            {
              role: 'user',
              content: `Com base no seguinte roteiro de vídeo${theme ? ` e tema "${theme}"` : ''}, gere:
1. Um título chamativo e viral (máximo 100 caracteres)
2. Uma descrição envolvente (máximo 200 caracteres)
3. 5-8 hashtags relevantes e populares

Roteiro: ${script.substring(0, 500)}

Responda em formato JSON com campos: title, description, hashtags (array)`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API error');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON response
      const parsed = JSON.parse(content);
      
      return {
        title: parsed.title || this.generateFallbackTitle(script),
        description: parsed.description || this.generateFallbackDescription(script),
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : this.generateFallbackHashtags(theme)
      };
    } catch (error) {
      console.error('Error generating AI content:', error);
      return this.generateFallbackSuggestions(script, theme);
    }
  }

  private generateFallbackSuggestions(script: string, theme?: string): ContentSuggestion {
    return {
      title: this.generateFallbackTitle(script),
      description: this.generateFallbackDescription(script),
      hashtags: this.generateFallbackHashtags(theme)
    };
  }

  private generateFallbackTitle(script: string): string {
    const words = script.split(' ').slice(0, 5).join(' ');
    return `🔥 ${words.substring(0, 50)}... #viral`;
  }

  private generateFallbackDescription(script: string): string {
    return `Confira este momento incrível! ${script.substring(0, 100)}...`;
  }

  private generateFallbackHashtags(theme?: string): string[] {
    const baseHashtags = ['#viral', '#fyp', '#trending', '#shorts'];
    const themeHashtags = theme ? [`#${theme.replace(/\s+/g, '')}`, `#${theme.replace(/\s+/g, '')}life`] : ['#content', '#creator'];
    return [...baseHashtags, ...themeHashtags].slice(0, 8);
  }
}

export const contentAIService = new ContentAIService();