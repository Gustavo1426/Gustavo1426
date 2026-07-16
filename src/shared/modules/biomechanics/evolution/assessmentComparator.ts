/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: ASSESSMENT COMPARATOR
 * ============================================================================
 */

import { HistoricalAssessment, BiomechanicalChange, ChangeStatus } from "../types/evolution.types";

/**
 * Executa a comparação quantitativa entre duas avaliações temporais do aluno.
 */
export function compareAssessments(
  previous: HistoricalAssessment,
  current: HistoricalAssessment
): BiomechanicalChange[] {
  const changes: BiomechanicalChange[] = [];

  // Helper para comparar métricas onde MENOS é MELHOR (Desvios e Assimetrias)
  const compareLowerIsBetter = (name: string, before: number, after: number) => {
    const difference = Math.round((after - before) * 10) / 10;
    let status: ChangeStatus = "stable";
    
    if (difference < -1.5) status = "improved"; // Reduziu o desvio
    else if (difference > 1.5) status = "worse";   // Aumentou o desvio

    changes.push({ metricName: name, before, after, difference, status });
  };

  // 1. Comparar assimetria de ombro
  compareLowerIsBetter(
    "Assimetria de Ombro",
    previous.bodyAnalysis.symmetry.shoulderAsymmetryMm,
    current.bodyAnalysis.symmetry.shoulderAsymmetryMm
  );

  // 2. Comparar assimetria pélvica
  compareLowerIsBetter(
    "Assimetria Pélvica",
    previous.bodyAnalysis.symmetry.pelvicAsymmetryMm,
    current.bodyAnalysis.symmetry.pelvicAsymmetryMm
  );

  // 3. Comparar desvio patelar do joelho esquerdo
  compareLowerIsBetter(
    "Desvio do Joelho Esquerdo",
    Math.abs(180 - previous.bodyAnalysis.bodyMap.legs.leftKneeDeviationAngle),
    Math.abs(180 - current.bodyAnalysis.bodyMap.legs.leftKneeDeviationAngle)
  );

  return changes;
}
