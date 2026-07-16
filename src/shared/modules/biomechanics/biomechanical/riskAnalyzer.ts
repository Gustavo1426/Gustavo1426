/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.5: BIOMECHANICAL ENGINE - RISK ANALYZER
 * ============================================================================
 */

import { AnatomicalRule, RiskLevel } from "./anatomicalRules";

/**
 * Calcula o risco geral do aluno baseado no acúmulo de disfunções encontradas.
 */
export function analyzeRisk(triggeredRules: AnatomicalRule[]): RiskLevel {
  let riskScore = 0;

  triggeredRules.forEach(rule => {
    if (rule.severity === "high") riskScore += 3;
    else if (rule.severity === "medium") riskScore += 2;
    else riskScore += 1;
  });

  if (riskScore >= 5) return "high";
  if (riskScore >= 2) return "medium";
  return "low";
}
