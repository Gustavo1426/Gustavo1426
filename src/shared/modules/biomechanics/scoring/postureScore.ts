/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: POSTURE SCORE
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { getSeverityPenalty } from "./penaltySystem";

/**
 * Calcula a nota de Postura (30% do IGB), subtraindo penalidades por desvios estáticos.
 */
export function calculatePostureScore(findings: BiomechanicalFinding[]): number {
  let penalty = 0;

  findings.forEach(finding => {
    if (finding.category === "posture") {
      penalty += getSeverityPenalty(finding);
    }
  });

  return Math.max(0, 100 - penalty);
}
