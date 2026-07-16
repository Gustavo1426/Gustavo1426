/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: RISK SCORE
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";

export type RiskLevel = "low" | "medium" | "high";

/**
 * Traduz a nota numérica global em uma faixa de risco clínico/operacional.
 */
export function calculateRiskLevel(score: number): RiskLevel {
  if (score >= 85) return "low";
  if (score >= 70) return "medium";
  return "high";
}

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
