/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: RESPONSE CLASSIFICATION
 * ============================================================================
 */

import { AdaptationSignature } from "../types/adaptation.types";

/**
 * Constrói e atualiza a "Adaptation Signature" (A assinatura fisiológica única do aluno).
 */
export function updateAdaptationSignature(
  historicalProgress: number, // Taxa de evolução
  historicalFatigue: number,  // Fadiga média
  currentSignature: AdaptationSignature
): AdaptationSignature {
  
  const newSignature = { ...currentSignature };

  // Lógica heurística: Se o aluno evolui muito, mas tem fadiga crônica, ele tem alta sensibilidade.
  if (historicalFatigue > 80 && historicalProgress < 0) {
    newSignature.fatigueSensitivity = "high";
    newSignature.volumeResponse = "low"; // Reduzimos o teto dele
  } else if (historicalFatigue < 40 && historicalProgress > 5) {
    newSignature.volumeResponse = "high"; // Ele aguenta mais estímulo
  }

  return newSignature;
}
