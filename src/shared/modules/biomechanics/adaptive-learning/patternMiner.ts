/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PATTERN MINER
 * ============================================================================
 */

import { LearningOutcome, StrategyEffectiveness } from "../types/adaptiveLearning.types";

/**
 * Analisa um lote histórico de resultados e minera padrões estatísticos.
 */
export function mineStrategyEffectiveness(outcomes: LearningOutcome[]): StrategyEffectiveness[] {
  const effectivenessMap = new Map<string, { successes: number; total: number; igbSum: number }>();

  outcomes.forEach(o => {
    const key = `${o.cohortId}|${o.strategyApplied}`;
    const current = effectivenessMap.get(key) || { successes: 0, total: 0, igbSum: 0 };
    
    effectivenessMap.set(key, {
      successes: current.successes + (o.actualResult === "positive" ? 1 : 0),
      total: current.total + 1,
      igbSum: current.igbSum + o.metrics.igbDelta
    });
  });

  const results: StrategyEffectiveness[] = [];
  effectivenessMap.forEach((data, key) => {
    const [cohortId, strategyName] = key.split("|");
    if (data.total >= 50) { // Limite mínimo estatístico para minerar o padrão (ex: 50 ocorrências)
      results.push({
        strategyName,
        cohortId,
        sampleSize: data.total,
        successRate: Math.round((data.successes / data.total) * 100),
        averageIgbEvolution: parseFloat((data.igbSum / data.total).toFixed(1))
      });
    }
  });

  return results;
}
