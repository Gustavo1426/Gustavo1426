/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: BIOMECHANICAL ADAPTER
 * ============================================================================
 */

import { BiomechanicalProfile, RawFinding } from "../types/biomechanical-training.types";

/**
 * Converte achados clínicos em um Perfil de Treino compreensível para o algoritmo de hipertrofia/força.
 */
export function buildBiomechanicalProfile(findings: RawFinding[]): BiomechanicalProfile {
  const profile: BiomechanicalProfile = {
    priorities: [],
    restrictions: [],
    attentionAreas: [],
    movementConsiderations: []
  };

  const activeIds = new Set(findings.map(f => f.id));

  if (activeIds.has("shoulder_anteriorization")) {
    profile.attentionAreas.push("scapular_control", "posterior_chain_balance");
    profile.priorities.push("aumentar_volume_costas_remadas");
    profile.movementConsiderations.push("monitorar exercícios de empurrar horizontal");
  }

  if (activeIds.has("knee_valgus_tendency")) {
    profile.attentionAreas.push("knee_tracking", "glute_med_activation");
    profile.restrictions.push("avoid_heavy_bilateral_squats");
    profile.priorities.push("fortalecimento_abdutores");
  }

  if (activeIds.has("pelvic_asymmetry")) {
    profile.priorities.push("controle_unilateral_membros_inferiores");
  }

  return profile;
}
