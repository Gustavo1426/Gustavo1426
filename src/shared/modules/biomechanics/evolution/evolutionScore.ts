/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EVOLUTION SCORE CALCULATOR
 * ============================================================================
 */

import { HistoricalAssessment, EvolutionScore, EvolutionClassification } from "../types/evolution.types";

/**
 * Calcula o Evolution Score ponderando o ganho líquido de pontos do IGB entre as avaliações.
 */
export function calculateEvolutionScore(
  previous: HistoricalAssessment,
  current: HistoricalAssessment
): EvolutionScore {
  const initial = previous.score.overall;
  const currentIgb = current.score.overall;
  const difference = currentIgb - initial;

  // Percentual de variação em relação ao inicial
  const percentageChange = initial > 0 
    ? Math.round((difference / initial) * 100 * 10) / 10 
    : 0;

  let classification: EvolutionClassification = "stable";
  if (difference >= 10) {
    classification = "excellent";
  } else if (difference > 2) {
    classification = "positive";
  } else if (difference < -2) {
    classification = "attention";
  }

  return {
    initial,
    current: currentIgb,
    difference,
    percentageChange,
    classification
  };
}
