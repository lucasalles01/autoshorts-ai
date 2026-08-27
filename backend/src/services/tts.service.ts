import { env } from '../config/env.js';

export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  language: string;
  accent: string;
  style: 'dynamic' | 'narrator' | 'calm' | 'energetic';
  provider: 'openai' | 'elevenlabs';
  sampleRate?: number;
}

export interface TTSRequest {
  text: string;
  voiceId: string;
  outputFormat?: 'mp3' | 'wav';
}

export class TTSService {
  private openAIKey: string;
  private elevenLabsKey: string;

  constructor() {
    this.openAIKey = env.OPENAI_API_KEY || '';
    this.elevenLabsKey = env.ELEVENLABS_API_KEY || '';
  }

  getAvailableVoices(): Voice[] {
    // Vozes pré-definidas (OpenAI TTS)
    const openAIVoices: Voice[] = [
      {
        id: 'alloy',
        name: 'Alloy (Inglês)',
        gender: 'neutral',
        language: 'en',
        accent: 'american',
        style: 'dynamic',
        provider: 'openai'
      },
      {
        id: 'echo',
        name: 'Echo (Inglês)',
        gender: 'female',
        language: 'en',
        accent: 'american',
        style: 'narrator',
        provider: 'openai'
      },
      {
        id: 'fable',
        name: 'Fable (Inglês)',
        gender: 'male',
        language: 'en',
        accent: 'british',
        style: 'dynamic',
        provider: 'openai'
      },
      {
        id: 'onyx',
        name: 'Onyx (Inglês)',
        gender: 'male',
        language: 'en',
        accent: 'american',
        style: 'narrator',
        provider: 'openai'
      },
      {
        id: 'nova',
        name: 'Nova (Inglês)',
        gender: 'female',
        language: 'en',
        accent: 'american',
        style: 'dynamic',
        provider: 'openai'
      },
      {
        id: 'shimmer',
        name: 'Shimmer (Inglês)',
        gender: 'female',
        language: 'en',
        accent: 'american',
        style: 'dynamic',
        provider: 'openai'
      }
    ];

    // Vozes adicionais simuladas para PT-BR (usando ElevenLabs no futuro)
    const portugueseVoices: Voice[] = [
      {
        id: 'pt-br-male-1',
        name: 'Português Masculino (Narrador)',
        gender: 'male',
        language: 'pt',
        accent: 'brazilian',
        style: 'narrator',
        provider: 'elevenlabs'
      },
      {
        id: 'pt-br-female-1',
        name: 'Português Feminino (Dinâmico)',
        gender: 'female',
        language: 'pt',
        accent: 'brazilian',
        style: 'dynamic',
        provider: 'elevenlabs'
      },
      {
        id: 'pt-br-male-2',
        name: 'Português Masculino (Energético)',
        gender: 'male',
        language: 'pt',
        accent: 'brazilian',
        style: 'energetic',
        provider: 'elevenlabs'
      }
    ];

    return [...openAIVoices, ...portugueseVoices];
  }

  async generateSpeech(request: TTSRequest): Promise<Buffer> {
    const voice = this.getAvailableVoices().find(v => v.id === request.voiceId);
    
    if (!voice) {
      throw new Error('Voice not found');
    }

    if (voice.provider === 'openai' && this.openAIKey) {
      return await this.generateOpenAISpeech(request);
    } else if (voice.provider === 'elevenlabs' && this.elevenLabsKey) {
      return await this.generateElevenLabsSpeech(request);
    } else {
      throw new Error('No API key available for this voice provider');
    }
  }

  private async generateOpenAISpeech(request: TTSRequest): Promise<Buffer> {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: request.text,
          voice: request.voiceId,
          response_format: request.outputFormat || 'mp3'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI TTS error: ${error}`);
      }

      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error('Error generating OpenAI speech:', error);
      throw error;
    }
  }

  private async generateElevenLabsSpeech(request: TTSRequest): Promise<Buffer> {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + request.voiceId, {
        method: 'POST',
        headers: {
          'xi-api-key': this.elevenLabsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: request.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs TTS error: ${error}`);
      }

      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error('Error generating ElevenLabs speech:', error);
      throw error;
    }
  }

  async previewVoice(voiceId: string, sampleText: string = 'Olá, este é um exemplo da voz selecionada.'): Promise<Buffer> {
    return await this.generateSpeech({
      text: sampleText,
      voiceId,
      outputFormat: 'mp3'
    });
  }

  async generateNarration(
    transcript: string,
    voiceId: string,
    segments: Array<{ start: number; end: number; text: string }>
  ): Promise<Map<string, Buffer>> {
    const audioSegments = new Map<string, Buffer>();

    for (const segment of segments) {
      try {
        const audio = await this.generateSpeech({
          text: segment.text,
          voiceId,
          outputFormat: 'mp3'
        });
        audioSegments.set(segment.text.substring(0, 20), audio);
      } catch (error) {
        console.error(`Error generating speech for segment: ${segment.text}`, error);
      }
    }

    return audioSegments;
  }
}

export const ttsService = new TTSService();