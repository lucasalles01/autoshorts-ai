export interface AICutWeightConfig {
  hookWeight: number;
  contextWeight: number;
  coherenceWeight: number;
  emotionWeight: number;
  retentionWeight: number;
  shareabilityWeight: number;
  commentabilityWeight: number;
  durationWeight: number;
}

export const defaultWeights: AICutWeightConfig = {
  hookWeight: 1.5,
  contextWeight: 1.2,
  coherenceWeight: 1.1,
  emotionWeight: 1.0,
  retentionWeight: 1.4,
  shareabilityWeight: 1.3,
  commentabilityWeight: 1.1,
  durationWeight: 1.2
};

export interface RawCandidate {
  startTime: number;
  endTime: number;
  transcriptSnippet: string;
  hookScore: number;
  contextScore: number;
  coherenceScore: number;
  emotionScore: number;
  retentionScore: number;
  shareabilityScore: number;
  commentabilityScore: number;
}

export interface ScoredCandidate extends RawCandidate {
  duration: number;
  durationScore: number;
  finalScore: number;
  reason: string;
}

export class AICutEngine {
  private weights: AICutWeightConfig;

  constructor(customWeights?: Partial<AICutWeightConfig>) {
    this.weights = { ...defaultWeights, ...customWeights };
  }

  public calculateDurationScore(durationSeconds: number): number {
    // Duração ideal entre 25s e 45s para Shorts/Reels/TikTok
    if (durationSeconds >= 25 && durationSeconds <= 45) {
      return 98;
    } else if (durationSeconds >= 15 && durationSeconds < 25) {
      return 88;
    } else if (durationSeconds > 45 && durationSeconds <= 60) {
      return 85;
    } else if (durationSeconds > 60 && durationSeconds <= 90) {
      return 72;
    } else {
      // Muito curto (<15s) ou muito longo (>90s)
      return 50;
    }
  }

  public calculateWeightedFinalScore(candidate: RawCandidate, durationSeconds: number): ScoredCandidate {
    const durationScore = this.calculateDurationScore(durationSeconds);

    const weightedSum =
      candidate.hookScore * this.weights.hookWeight +
      candidate.contextScore * this.weights.contextWeight +
      candidate.coherenceScore * this.weights.coherenceWeight +
      candidate.emotionScore * this.weights.emotionWeight +
      candidate.retentionScore * this.weights.retentionWeight +
      candidate.shareabilityScore * this.weights.shareabilityWeight +
      candidate.commentabilityScore * this.weights.commentabilityWeight +
      durationScore * this.weights.durationWeight;

    const sumWeights =
      this.weights.hookWeight +
      this.weights.contextWeight +
      this.weights.coherenceWeight +
      this.weights.emotionWeight +
      this.weights.retentionWeight +
      this.weights.shareabilityWeight +
      this.weights.commentabilityWeight +
      this.weights.durationWeight;

    const finalScore = Math.round((weightedSum / sumWeights) * 10) / 10;

    let reason = 'Trecho com fala contínua e boa dinâmica de áudio';
    if (candidate.hookScore > 90) {
      reason = 'Abertura forte: começa logo após uma pausa, com fala densa nos primeiros segundos';
    } else if (candidate.emotionScore > 88) {
      reason = 'Alta variação de intensidade no áudio, indicando momento expressivo';
    } else if (candidate.commentabilityScore > 88) {
      reason = 'Ritmo com pausas marcadas, formato que costuma gerar comentários';
    } else if (candidate.retentionScore > 88) {
      reason = 'Densidade de fala elevada do início ao fim, com pouco tempo morto';
    }

    return {
      ...candidate,
      duration: durationSeconds,
      durationScore,
      finalScore,
      reason
    };
  }
}

export const aiCutEngine = new AICutEngine();
