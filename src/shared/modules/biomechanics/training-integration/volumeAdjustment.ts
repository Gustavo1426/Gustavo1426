/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: VOLUME ADJUSTMENT ENGINE
 * ============================================================================
 */

import { WorkoutConstraint } from "../types/biomechanical-training.types";

/**
 * Redistribui o volume do treino (séries) para corrigir padrões de desequilíbrio muscular de longo prazo.
 */
export function adjustVolume(baseSets: number, exerciseTags: string[], constraints: WorkoutConstraint[]): number {
  let volumeMultiplier = 1.0;

  constraints.forEach(constraint => {
    if (constraint.action === "increase_posterior_chain") {
      // Aumenta o volume de puxar (costas/posterior)
      if (exerciseTags.includes("horizontal_pull") || exerciseTags.includes("vertical_pull")) {
        volumeMultiplier = 1.2; 
      }
      // Reduz levemente o volume de empurrar (peito/anterior)
      if (exerciseTags.includes("horizontal_push") || exerciseTags.includes("vertical_push")) {
        volumeMultiplier = 0.8;
      }
    }
  });

  // Arredonda para o número inteiro de séries mais próximo (ex: 3 * 1.2 = 3.6 => 4 séries)
  return Math.max(1, Math.round(baseSets * volumeMultiplier));
}
