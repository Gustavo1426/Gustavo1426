/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: MOVEMENT RISK ANALYZER
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";

/**
 * Mapeia quais exercícios de musculação tradicionais exigem atenção redobrada com base nos desvios.
 */
export function analyzeMovementRisks(findings: BiomechanicalFinding[]): { movement: string; attention: string }[] {
  const risksMap = new Map<string, string>();

  findings.forEach(finding => {
    finding.riskyMovements.forEach(rm => {
      risksMap.set(rm.movement, rm.reason);
    });
  });

  return Array.from(risksMap.entries()).map(([movement, attention]) => ({
    movement,
    attention
  }));
}
