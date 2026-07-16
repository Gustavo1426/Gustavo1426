/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SYMMETRY SCORE
 * ============================================================================
 */

import { BodyAnalysisOutput } from "../types/body-analysis.types";
import { BiomechanicalFinding } from "../types/biomechanical.types";
import { getSeverityPenalty } from "./penaltySystem";

/**
 * Calcula a nota de Simetria (25% do IGB), integrando os desvios bilaterais calculados.
 */
export function calculateSymmetryScore(
  analysis: BodyAnalysisOutput, 
  findings: BiomechanicalFinding[]
): number {
  // Começamos com a média de simetria geométrica gerada no mapeamento corporal
  const geometricSymmetry = (analysis.symmetry.upperBodyScore + analysis.symmetry.lowerBodyScore) / 2;
  
  // Penaliza se houverem achados explícitos de assimetria clínica do motor biomecânico
  let penalty = 0;
  findings.forEach(finding => {
    if (finding.category === "symmetry") {
      penalty += getSeverityPenalty(finding);
    }
  });

  return Math.max(0, Math.round(geometricSymmetry - penalty));
}
