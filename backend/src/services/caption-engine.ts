// Local type definitions
enum CaptionStyle {
  VIRAL = "VIRAL",
  PROFESSIONAL = "PROFESSIONAL",
  MINIMAL = "MINIMAL",
  NEON = "NEON",
  BOLD = "BOLD",
  ELEGANT = "ELEGANT"
}

interface CaptionConfiguration {
  style: string;
  font: string;
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  secondaryColor: string;
  outlineColor?: string;
  position: string;
  animation: string;
  animationStyle?: string;
  highlightedWords: string[];
  duration?: number;
  maxLineLength?: number;
  wordsPerLine?: number;
  uppercase?: boolean;
}

export class CaptionEngine {
  public getDefaultConfiguration(style: CaptionStyle): CaptionConfiguration {
    switch (style) {
      case CaptionStyle.VIRAL:
        return {
          fontFamily: 'Outfit',
          fontSize: 54,
          primaryColor: '#FFFFFF',
          secondaryColor: '#FACC15', // Neon Yellow
          outlineColor: '#000000',
          position: 'CENTER_BOTTOM',
          animationStyle: 'WORD_HIGHLIGHT'
        };
      case CaptionStyle.MINIMAL:
        return {
          fontFamily: 'Roboto',
          fontSize: 40,
          primaryColor: '#F3F4F6',
          secondaryColor: '#10B981', // Emerald
          outlineColor: '#1F2937',
          position: 'CENTER_BOTTOM',
          animationStyle: 'FADE_IN'
        };
      case CaptionStyle.PROFESSIONAL:
        return {
          fontFamily: 'Outfit',
          fontSize: 44,
          primaryColor: '#FFFFFF',
          secondaryColor: '#8B5CF6', // Purple
          outlineColor: '#000000',
          position: 'CENTER_BOTTOM',
          animationStyle: 'CLEAN_SLIDE'
        };
      case CaptionStyle.BOLD:
        return {
          fontFamily: 'Impact',
          fontSize: 56,
          primaryColor: '#FFFFFF',
          secondaryColor: '#FF0000', // Red
          outlineColor: '#000000',
          position: 'CENTER_BOTTOM',
          animationStyle: 'WORD_HIGHLIGHT'
        };
      case CaptionStyle.ELEGANT:
        return {
          fontFamily: 'Georgia',
          fontSize: 42,
          primaryColor: '#FFFFFF',
          secondaryColor: '#FFD700', // Gold
          outlineColor: '#000000',
          position: 'CENTER_BOTTOM',
          animationStyle: 'FADE_IN'
        };
      case CaptionStyle.NEON:
        return {
          fontFamily: 'Outfit',
          fontSize: 50,
          primaryColor: '#FFFFFF',
          secondaryColor: '#06B6D4', // Neon Cyan
          outlineColor: '#000000',
          position: 'CENTER_BOTTOM',
          animationStyle: 'POP_UP'
        };
      default:
        return {
          fontFamily: 'Outfit',
          fontSize: 44,
          primaryColor: '#FFFFFF',
          secondaryColor: '#8B5CF6', // Purple
          outlineColor: '#000000',
          position: 'CENTER_BOTTOM',
          animationStyle: 'CLEAN_SLIDE'
        };
    }
  }

  public extractHighlightedWords(transcriptSnippet: string): string[] {
    const words = transcriptSnippet
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4);

    // Retorna até 5 palavras chave com tamanho relevante para destacar
    return Array.from(new Set(words)).slice(0, 5);
  }
}

export const captionEngine = new CaptionEngine();
