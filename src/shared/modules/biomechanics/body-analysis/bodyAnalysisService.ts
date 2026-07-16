/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: BODY ANALYSIS SERVICE
 * ============================================================================
 */

import { BodyLandmarks } from "../types";
import { analyzeAlignment, BiomechanicalAlignmentResult } from "./alignmentAnalyzer";
import { analyzeSymmetry, BiomechanicalSymmetryResult } from "./symmetryAnalyzer";
import { analyzeMobility, MobilityResult } from "./mobilityAnalyzer";
import { detectBodyCompensations, Compensation } from "./compensationDetector";

export interface BodyAnalysisOutput {
  alignment: BiomechanicalAlignmentResult[];
  symmetry: BiomechanicalSymmetryResult[];
  mobility: MobilityResult[];
  compensations: Compensation[];
}

/**
 * O Motor Central da Fase 1.4. Recebe os landmarks do Vision Engine
 * e cospe o mapeamento biomecânico completo.
 */
export function analyzeBody(landmarks: BodyLandmarks): BodyAnalysisOutput {
  if (!landmarks || !landmarks.points || landmarks.points.length === 0) {
    throw new Error("Landmarks inválidos ou ausentes para análise.");
  }

  const alignment = analyzeAlignment(landmarks);
  const symmetry = analyzeSymmetry(landmarks);
  const mobility = analyzeMobility(landmarks);
  const compensations = detectBodyCompensations(alignment, mobility);

  return {
    alignment,
    symmetry,
    mobility,
    compensations
  };
}
