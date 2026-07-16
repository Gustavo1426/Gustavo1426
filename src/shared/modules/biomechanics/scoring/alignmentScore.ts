/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: ALIGNMENT SCORE
 * ============================================================================
 */

import { BodyAnalysisOutput } from "../types/body-analysis.types";
import { BiomechanicalFinding } from "../types/biomechanical.types";
import { getSeverityPenalty } from "./penaltySystem";

/**
 * Calcula a nota de Alinhamento (20% do IGB), baseando-se na proximidade da Plumb Line central.
 */
export function calculateAlignmentScore(
  analysis: BodyAnalysisOutput,
  findings: BiomechanicalFinding[]
): number {
  // Média simples do score central frontal e de perfil
  const baseAlignment = (analysis.alignment.frontalAlignmentScore + analysis.alignment.lateralAlignmentScore) / 2;

  let penalty = 0;
  findings.forEach(finding => {
    if (finding.category === "alignment") {
      penalty += getSeverityPenalty(finding);
    }
  });

  return Math.max(0, Math.round(baseAlignment - penalty));
}
