/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.7: SCORING ENGINE - BIOMECHANICAL SCORE ENGINE
 * ============================================================================
 */

import { AlignmentData, calculatePostureScore } from "./postureScore";
import { MobilityData, calculateMobilityScore } from "./mobilityScore";
import { SymmetryData, calculateSymmetryScore } from "./symmetryScore";
import { MovementData, calculateMovementScore } from "./movementScore";
import { calculateRiskLevel, RiskLevel } from "./riskScore";

export interface ScoringAnalysisInput {
  alignment: AlignmentData[];
  mobility: MobilityData[];
  symmetry: SymmetryData[];
  movements: MovementData[]; // Adicionado para suportar testes funcionais (agachar, empurrar)
}

export interface BiomechanicalScoreResult {
  globalScore: number; // O IGB Oficial
  postureScore: number;
  mobilityScore: number;
  symmetryScore: number;
  movementScore: number;
  riskLevel: RiskLevel;
}

/**
 * Orquestrador do Scoring Engine.
 * Aplica os pesos oficiais (Postura 30%, Mobilidade 25%, Simetria 25%, Movimento 20%)
 * para gerar o Índice Global Biomecânico (IGB).
 */
export function calculateBiomechanicalScore(analysis: ScoringAnalysisInput): BiomechanicalScoreResult {
  
  // 1. Calcula os scores individuais baseados nas deduções
  const posture = calculatePostureScore(analysis.alignment);
  const mobility = calculateMobilityScore(analysis.mobility);
  const symmetry = calculateSymmetryScore(analysis.symmetry);
  const movement = calculateMovementScore(analysis.movements);

  // 2. Aplica a média ponderada para calcular o IGB geral
  const global = Math.round(
    (posture * 0.30) +
    (mobility * 0.25) +
    (symmetry * 0.25) +
    (movement * 0.20)
  );

  return {
    globalScore: global,
    postureScore: posture,
    mobilityScore: mobility,
    symmetryScore: symmetry,
    movementScore: movement,
    riskLevel: calculateRiskLevel(global)
  };
}
