/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: MOBILITY ANALYZER
 * ============================================================================
 */

import { BodyLandmarks } from "../types";

export interface MobilityResult {
  joint: string;
  estimatedRange: number;
  restriction: "none" | "moderate" | "high";
}

/**
 * Estima restrições de mobilidade com base em ângulos de compensação.
 */
export function analyzeMobility(landmarks: BodyLandmarks): MobilityResult[] {
  // Lógica mockada: Em produção, isso dependeria de fotos de perfil (side view) 
  // durante movimentos específicos (ex: teste de Lunge para tornozelo).
  return [
    {
      joint: "ankle",
      estimatedRange: 20, // Graus de dorsiflexão estimados
      restriction: "moderate"
    }
  ];
}
