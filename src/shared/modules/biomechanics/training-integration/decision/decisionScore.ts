/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.1: ADAPTIVE DECISION ENGINE (V3) - DECISION SCORE
 * ============================================================================
 */

import { SystemEnginesContext, TrainingDecisionScore } from "./types";

/**
 * Consolida as três principais dimensões do aluno em uma nota única de decisão.
 */
export function calculateTrainingDecisionScore(context: SystemEnginesContext): TrainingDecisionScore {
  const finalScore = Math.round(
    (context.readinessScore * 0.40) +
    (context.biomechanicalScore * 0.30) +
    (context.performanceScore * 0.30)
  );

  return {
    readinessScore: context.readinessScore,
    biomechanicalScore: context.biomechanicalScore,
    performanceScore: context.performanceScore,
    finalScore
  };
}
