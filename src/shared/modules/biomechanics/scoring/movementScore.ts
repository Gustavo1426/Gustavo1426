/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.7: SCORING ENGINE - MOVEMENT SCORE
 * ============================================================================
 */

export interface MovementData { name: string; qualityScore: number; }

/**
 * Avalia a qualidade dos padrões motores fundamentais (Squat, Push, Pull, Hinge).
 * Retorna a média da qualidade de movimento.
 */
export function calculateMovementScore(movements: MovementData[] = []): number {
  if (!movements || movements.length === 0) return 100; // Baseline caso ainda não haja vídeo de movimento

  let total = 0;
  movements.forEach(movement => {
    total += movement.qualityScore;
  });

  return Math.round(total / movements.length);
}
