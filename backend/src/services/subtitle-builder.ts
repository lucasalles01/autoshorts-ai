// Local type definition
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
}

export interface SubtitleWord {
  word: string;
  start: number;
  end: number;
}

/**
 * Gera legendas no formato ASS com destaque palavra-por-palavra,
 * prontas para serem queimadas pelo filtro `subtitles` do FFmpeg (libass).
 */
export class SubtitleBuilder {
  /** #RRGGBB -> &H00BBGGRR (ASS usa BGR) */
  private toAssColor(hex: string): string {
    const clean = (hex || '#FFFFFF').replace('#', '').padEnd(6, 'F');
    const r = clean.substring(0, 2);
    const g = clean.substring(2, 4);
    const b = clean.substring(4, 6);
    return `&H00${b}${g}${r}`.toUpperCase();
  }

  /** Fontes garantidas no Windows para que o libass nunca renderize vazio. */
  private safeFont(fontFamily: string): string {
    const available: Record<string, string> = {
      Outfit: 'Arial Black',
      Inter: 'Segoe UI',
      Roboto: 'Segoe UI',
      Impact: 'Impact'
    };
    return available[fontFamily] || 'Arial Black';
  }

  private escapeText(text: string): string {
    return text.replace(/\{/g, '(').replace(/\}/g, ')').replace(/\r?\n/g, ' ');
  }

  private formatTime(seconds: number): string {
    const total = Math.max(0, seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = Math.floor(total % 60);
    const cs = Math.floor((total - Math.floor(total)) * 100);
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }

  public build(
    words: SubtitleWord[],
    config: CaptionConfiguration,
    wordsPerLine = 4
  ): string | null {
    const usable = words
      .filter((w) => w.word && w.end > w.start)
      .sort((a, b) => a.start - b.start);

    if (usable.length === 0) return null;

    const font = this.safeFont(config.fontFamily);
    const primary = this.toAssColor(config.primaryColor);
    const highlight = this.toAssColor(config.secondaryColor);
    const outline = config.outlineColor ? this.toAssColor(config.outlineColor) : "&H00000000";
    const secondary = config.secondaryColor ? this.toAssColor(config.secondaryColor) : primary;
    const marginV = Math.max(60, Math.round(1920 * 0.25));

    const header = [
      '[Script Info]',
      'ScriptType: v4.00+',
      'PlayResX: 1080',
      'PlayResY: 1920',
      'WrapStyle: 2',
      'ScaledBorderAndShadow: yes',
      '',
      '[V4+ Styles]',
      'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
      `Style: Viral,${font},${String(config.fontSize * 2)},${primary},${secondary},${outline},&H80000000,-1,0,0,0,100,100,0,0,1,6,2,2,80,80,${marginV},1`,
      '',
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'
    ].join('\n');

    const events: string[] = [];

    for (let i = 0; i < usable.length; i += wordsPerLine) {
      const group = usable.slice(i, i + wordsPerLine);

      group.forEach((current, indexInGroup) => {
        const start = current.start;
        const next = group[indexInGroup + 1];
        const end = next ? Math.max(next.start, current.end) : current.end;
        if (end <= start) return;

        const line = group
          .map((w, idx) => {
            const text = this.escapeText(config.uppercase ? w.word.toUpperCase() : w.word);
            return idx === indexInGroup
              ? `{\\c${highlight}\\fscx112\\fscy112}${text}{\\c${primary}\\fscx100\\fscy100}`
              : text;
          })
          .join(' ');

        events.push(
          `Dialogue: 0,${this.formatTime(start)},${this.formatTime(end)},Viral,,0,0,0,,${line}`
        );
      });
    }

    if (events.length === 0) return null;
    return `${header}\n${events.join('\n')}\n`;
  }
}

export const subtitleBuilder = new SubtitleBuilder();
