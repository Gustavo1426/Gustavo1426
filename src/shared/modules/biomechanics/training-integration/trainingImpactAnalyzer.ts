/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: TRAINING IMPACT ANALYZER
 * ============================================================================
 */

import { BiomechanicalProfile, TrainingImpact } from "../types/biomechanical-training.types";

/**
 * Mapeia as áreas de atenção para categorias reais de movimento (tags de exercícios).
 */
export function analyzeTrainingImpacts(profile: BiomechanicalProfile): TrainingImpact[] {
  const impacts: TrainingImpact[] = [];

  if (profile.attentionAreas.includes("scapular_control")) {
    impacts.push({
      affectedMovementTags: ["horizontal_push", "vertical_push"],
      recommendedAction: "monitor",
      reason: "Padrão de ombro anteriorizado exige cuidado extra na retração escapular."
    });
  }

  if (profile.restrictions.includes("avoid_heavy_bilateral_squats")) {
    impacts.push({
      affectedMovementTags: ["heavy_squat", "bilateral_leg_press"],
      recommendedAction: "avoid",
      reason: "O valgo dinâmico sugere estresse patelofemoral excessivo sob carga bilateral pesada."
    });
  }

  if (profile.priorities.includes("controle_unilateral_membros_inferiores")) {
    impacts.push({
      affectedMovementTags: ["lower_body_compound"],
      recommendedAction: "require_unilateral",
      reason: "Assimetria identificada. Priorizar halteres e execução unilateral para equilibrar forças."
    });
  }

  return impacts;
}
