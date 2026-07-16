/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PRIORITY INTEGRATION
 * ============================================================================
 */

import { BiomechanicalProfile } from "../types/biomechanical-training.types";

/**
 * Gera os blocos de ativação (Pré-Treino) injetados diretamente na ficha do aluno.
 */
export function generatePreWorkoutActivation(profile: BiomechanicalProfile): string[] {
  const warmupRoutine: string[] = [];

  if (profile.attentionAreas.includes("scapular_control")) {
    warmupRoutine.push("YTWL com elástico leve (2x15)");
    warmupRoutine.push("Liberação miofascial: Peitoral Menor e Grande Dorsal");
  }

  if (profile.attentionAreas.includes("knee_tracking")) {
    warmupRoutine.push("Clamshells / Ostra com mini-band (2x15 cada lado)");
    warmupRoutine.push("Elevação pélvica unilateral peso corporal (2x12)");
  }

  return warmupRoutine.length > 0 ? warmupRoutine : ["Aquecimento articular padrão (5 min)"];
}
