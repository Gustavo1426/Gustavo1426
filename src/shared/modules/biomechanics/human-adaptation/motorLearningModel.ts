/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: MOTOR LEARNING MODEL
 * ============================================================================
 */

import { MotorLearning } from "../types/adaptation.types";

/**
 * Modela o aprendizado técnico com base na evolução do IGB e consistência.
 */
export function evaluateMotorLearning(igbDelta: number, consistencyScore: number): MotorLearning {
  let learningScore = 50 + (consistencyScore * 0.3) + (igbDelta * 2);
  
  return {
    movementLearningScore: Math.min(100, Math.max(0, Math.round(learningScore))),
    movementEfficiency: Math.min(100, Math.max(0, 60 + (igbDelta * 1.5)))
  };
}
