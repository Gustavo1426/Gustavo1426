/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: ADAPTIVE CAPACITY
 * ============================================================================
 */

import { AdaptiveCapacity, AdaptationSignature } from "../types/adaptation.types";

/**
 * Modela a capacidade de absorção de volume de treino do aluno.
 */
export function calculateAdaptiveCapacity(currentVolume: number, signature: AdaptationSignature): AdaptiveCapacity {
  // O teto de volume muda dependendo se o aluno responde bem a alto volume ou não
  let maxCapacity = 15; // baseline
  if (signature.volumeResponse === "high") maxCapacity = 25;
  if (signature.volumeResponse === "low") maxCapacity = 12;

  return {
    weeklyCapacitySets: maxCapacity,
    currentLoadSets: currentVolume,
    remainingCapacity: Math.max(0, maxCapacity - currentVolume)
  };
}
