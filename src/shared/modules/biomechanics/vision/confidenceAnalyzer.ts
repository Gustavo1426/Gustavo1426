/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: CONFIDENCE ANALYZER
 * ============================================================================
 */

import { Landmark, LandmarkName } from "../types/landmark.types";

/**
 * Avalia se a leitura das articulações é de confiança estatística suficiente para análise clínica.
 * Rejeita processamentos com alta probabilidade de oclusão (ex: braço escondido atrás do corpo).
 */
export function analyzeLandmarksConfidence(
  landmarks: Landmark[], 
  minThreshold: number = 0.70
): { valid: boolean; overallConfidence: number; lowConfidenceJoints: LandmarkName[] } {
  
  const lowConfidenceJoints: LandmarkName[] = [];
  let confidenceSum = 0;

  landmarks.forEach(l => {
    confidenceSum += l.confidence;
    if (l.confidence < minThreshold) {
      lowConfidenceJoints.push(l.name);
    }
  });

  const overallConfidence = landmarks.length > 0 
    ? Math.round((confidenceSum / landmarks.length) * 100) 
    : 0;

  // O pipeline é considerado inválido se mais de 3 pontos articulares chave estiverem oclusos
  const valid = lowConfidenceJoints.length <= 3 && overallConfidence >= (minThreshold * 100);

  return {
    valid,
    overallConfidence,
    lowConfidenceJoints
  };
}
