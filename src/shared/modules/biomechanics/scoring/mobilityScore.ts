/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: MOBILITY SCORE
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { getSeverityPenalty } from "./penaltySystem";

export interface MobilityData { joint: string; restriction: "none" | "moderate" | "high"; }

/**
 * Calcula a nota estimada de Mobilidade (15% do IGB) correlacionando as restrições prováveis.
 * Suporta tanto o formato legado (BiomechanicalFinding[]) quanto o formato Fase 1.7 (MobilityData[]).
 */
export function calculateMobilityScore(findings: BiomechanicalFinding[]): number;
export function calculateMobilityScore(mobility: MobilityData[]): number;
export function calculateMobilityScore(arg: any[] = []): number {
  if (arg.length === 0) return 100;

  // Se for o formato de MobilityData[] da Fase 1.7
  if ("restriction" in arg[0]) {
    let score = 100;
    arg.forEach(joint => {
      if (joint.restriction === "moderate") score -= 10;
      if (joint.restriction === "high") score -= 20;
    });
    return Math.max(score, 0);
  }

  // Formato legado
  let penalty = 0;
  arg.forEach(finding => {
    if (finding.category === "mobility") {
      penalty += getSeverityPenalty(finding);
    }
  });

  // Penaliza de forma indireta desvios posturais graves que sabidamente reduzem mobilidade
  const highRiskPostureFindings = arg.filter(f => f.category === "posture" && f.severity === "high");
  penalty += highRiskPostureFindings.length * 5;

  return Math.max(0, 100 - penalty);
}

