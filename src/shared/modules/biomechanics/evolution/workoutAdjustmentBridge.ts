/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SISTER SYSTEM BRIDGE
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";

/**
 * Cria a conexão inteligente enviando triggers de adaptação automática para o gerador de treinos.
 */
export function generateWorkoutEngineTriggers(
  improvements: string[],
  currentFindings: BiomechanicalFinding[]
): { canUnlockExercises: string[]; shouldKeepRestrictions: string[] } {
  
  const canUnlockExercises: string[] = [];
  const shouldKeepRestrictions: string[] = [];
  const activeIds = new Set(currentFindings.map(f => f.id));

  // Exemplo: Destrava o Supino Reto tradicional se o controle escapular estabilizou
  const improvedEscapular = improvements.some(imp => imp.toLowerCase().includes("ombro") || imp.toLowerCase().includes("escapular"));
  if (improvedEscapular && !activeIds.has("shoulder_anteriorization")) {
    canUnlockExercises.push("supino_reto_barra", "desenvolvimento_halteres_vertical");
  } else {
    shouldKeepRestrictions.push("supino_reto_barra");
  }

  // Exemplo: Libera agachamento pesado se a patela estabilizou
  const improvedKnee = improvements.some(imp => imp.toLowerCase().includes("joelho") || imp.toLowerCase().includes("valgo"));
  if (improvedKnee && !activeIds.has("knee_valgus_tendency")) {
    canUnlockExercises.push("agachamento_livre_pesado", "afundo_passada_haltere");
  } else {
    shouldKeepRestrictions.push("agachamento_livre_pesado");
  }

  return {
    canUnlockExercises,
    shouldKeepRestrictions
  };
}
