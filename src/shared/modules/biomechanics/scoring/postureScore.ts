/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: POSTURE SCORE
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { getSeverityPenalty } from "./penaltySystem";

export interface AlignmentData { region: string; status: "normal" | "attention" | "critical"; }

/**
 * Calcula a nota de Postura (30% do IGB), subtraindo penalidades por desvios estáticos.
 * Suporta tanto o formato legado (BiomechanicalFinding[]) quanto o formato Fase 1.7 (AlignmentData[]).
 */
export function calculatePostureScore(findings: BiomechanicalFinding[]): number;
export function calculatePostureScore(alignment: AlignmentData[]): number;
export function calculatePostureScore(arg: any[] = []): number {
  if (arg.length === 0) return 100;

  // Se for o formato de AlignmentData[] da Fase 1.7
  if ("status" in arg[0]) {
    let score = 100;
    arg.forEach(item => {
      if (item.status === "attention") score -= 8;
      if (item.status === "critical") score -= 15;
    });
    return Math.max(score, 0);
  }

  // Formato legado
  let penalty = 0;
  arg.forEach(finding => {
    if (finding.category === "posture") {
      penalty += getSeverityPenalty(finding);
    }
  });

  return Math.max(0, 100 - penalty);
}

