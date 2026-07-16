/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SYMMETRY SCORE
 * ============================================================================
 */

import { BodyAnalysisOutput } from "../types/body-analysis.types";
import { BiomechanicalFinding } from "../types/biomechanical.types";
import { getSeverityPenalty } from "./penaltySystem";

export interface SymmetryData { bodyPart: string; difference: number; }

/**
 * Calcula a nota de Simetria (25% do IGB), integrando os desvios bilaterais calculados.
 * Suporta tanto o formato legado (BodyAnalysisOutput, BiomechanicalFinding[]) quanto o formato Fase 1.7 (SymmetryData[]).
 */
export function calculateSymmetryScore(symmetry: SymmetryData[]): number;
export function calculateSymmetryScore(analysis: BodyAnalysisOutput, findings: BiomechanicalFinding[]): number;
export function calculateSymmetryScore(arg1: any, arg2?: any): number {
  // Se for o formato de SymmetryData[] da Fase 1.7
  if (Array.isArray(arg1) && (arg1.length === 0 || "difference" in arg1[0])) {
    let score = 100;
    arg1.forEach(item => {
      score -= item.difference * 2;
    });
    return Math.max(score, 0);
  }

  // Formato legado
  const analysis = arg1 as BodyAnalysisOutput;
  const findings = arg2 as BiomechanicalFinding[];
  
  // Começamos com a média de simetria geométrica gerada no mapeamento corporal
  const geometricSymmetry = (analysis.symmetry.upperBodyScore + analysis.symmetry.lowerBodyScore) / 2;
  
  // Penaliza se houverem achados explícitos de assimetria clínica do motor biomecânico
  let penalty = 0;
  findings.forEach(finding => {
    if (finding.category === "symmetry") {
      penalty += getSeverityPenalty(finding);
    }
  });

  return Math.max(0, Math.round(geometricSymmetry - penalty));
}

