/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: WORKOUT CONSTRAINT ENGINE
 * ============================================================================
 */

import { BiomechanicalProfile, WorkoutConstraint } from "../types/biomechanical-training.types";

/**
 * Motor de regras baseadas em restrições físicas para proteção articular do aluno.
 */
export function generateConstraints(profile: BiomechanicalProfile): WorkoutConstraint[] {
  const constraints: WorkoutConstraint[] = [];

  if (profile.priorities.includes("controle_unilateral_membros_inferiores")) {
    constraints.push({
      condition: "high_asymmetry",
      action: "require_unilateral_control",
      description: "Substituir exercícios bilaterais de perna por passadas, afundos ou búlgaro."
    });
  }

  if (profile.attentionAreas.includes("scapular_control")) {
    constraints.push({
      condition: "anterior_chain_dominance",
      action: "increase_posterior_chain",
      description: "Garantir proporção de 2:1 entre exercícios de puxar (remadas) vs empurrar (supinos)."
    });
  }

  return constraints;
}
