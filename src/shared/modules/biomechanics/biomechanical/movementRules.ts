/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.5: BIOMECHANICAL ENGINE - MOVEMENT RULES
 * ============================================================================
 */

export interface MovementRule {
  triggerId: string;
  movement: string;
  consequence: string;
}

export const movementRules: MovementRule[] = [
  {
    triggerId: "SHOULDER_ASYMMETRY",
    movement: "Exercícios de empurrar (Supino, Desenvolvimento)",
    consequence: "Maior estresse articular unilateral e perda de estabilidade."
  },
  {
    triggerId: "PELVIC_ASYMMETRY",
    movement: "Agachamentos pesados e Levantamento Terra",
    consequence: "Sobrecarga assimétrica na coluna lombar e joelhos."
  },
  {
    triggerId: "ANKLE_LIMITATION",
    movement: "Agachamento livre",
    consequence: "Inclinação excessiva do tronco à frente para compensar a falta de mobilidade."
  }
];
