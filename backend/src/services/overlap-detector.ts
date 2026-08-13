import { ScoredCandidate } from './ai-cut-engine.js';

export class OverlapDetector {
  /**
   * Remove candidatos duplicados ou com forte sobreposição temporal/semântica,
   * garantindo que apenas o candidato de maior score final seja mantido.
   */
  public filterOverlappingCandidates(candidates: ScoredCandidate[], maxOverlapRatio = 0.4): ScoredCandidate[] {
    // Ordenar primeiro por finalScore decrescente para priorizar os melhores cortes
    const sorted = [...candidates].sort((a, b) => b.finalScore - a.finalScore);
    const filtered: ScoredCandidate[] = [];

    for (const candidate of sorted) {
      let isOverlap = false;

      for (const accepted of filtered) {
        // Calcular sobreposição de tempo
        const overlapStart = Math.max(candidate.startTime, accepted.startTime);
        const overlapEnd = Math.min(candidate.endTime, accepted.endTime);
        const overlapDuration = Math.max(0, overlapEnd - overlapStart);

        const minDuration = Math.min(candidate.duration, accepted.duration);
        const overlapRatio = overlapDuration / minDuration;

        if (overlapRatio > maxOverlapRatio) {
          isOverlap = true;
          break; // Descarta este candidato pois já temos um com score superior na mesma janela
        }
      }

      if (!isOverlap) {
        filtered.push(candidate);
      }
    }

    // Retorna ordenado cronologicamente pelo startTime original para facilitar a visualização
    return filtered.sort((a, b) => a.startTime - b.startTime);
  }
}

export const overlapDetector = new OverlapDetector();
