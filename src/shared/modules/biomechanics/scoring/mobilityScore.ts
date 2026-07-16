/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: MOBILITY SCORE
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { getSeverityPenalty } from "./penaltySystem";

/**
 * Calcula a nota estimada de Mobilidade (15% do IGB) correlacionando as restrições prováveis.
 */
export function calculateMobilityScore(findings: BiomechanicalFinding[]): number {
  let penalty = 0;

  findings.forEach(finding => {
    if (finding.category === "mobility") {
      penalty += getSeverityPenalty(finding);
    }
  });

  // Penaliza de forma indireta desvios posturais graves que sabidamente reduzem mobilidade
  const highRiskPostureFindings = findings.filter(f => f.category === "posture" && f.severity === "high");
  penalty += highRiskPostureFindings.length * 5;

  return Math.max(0, 100 - penalty);
}
