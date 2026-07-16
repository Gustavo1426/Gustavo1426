/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: RISK SCORE
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";

/**
 * Calcula a nota de Risco de Lesão (10%. Oposto do risco: 100 = sem risco, 0 = risco crítico).
 */
export function calculateRiskScore(findings: BiomechanicalFinding[]): number {
  let penalty = 0;

  findings.forEach(finding => {
    // Todos os achados no corpo aumentam o risco, especialmente os severos
    if (finding.severity === "high") {
      penalty += 12;
    } else if (finding.severity === "medium") {
      penalty += 6;
    } else {
      penalty += 3;
    }
  });

  return Math.max(0, 100 - penalty);
}
