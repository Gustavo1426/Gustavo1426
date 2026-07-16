/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PENALTY SYSTEM
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";

/**
 * Retorna o valor de penalidade baseado na severidade de um achado.
 */
export function getSeverityPenalty(finding: BiomechanicalFinding): number {
  switch (finding.severity) {
    case "high": return 15;
    case "medium": return 8;
    case "low": return 4;
    default: return 0;
  }
}
