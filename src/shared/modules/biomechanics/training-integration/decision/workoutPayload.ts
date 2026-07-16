/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.1: ADAPTIVE DECISION ENGINE (V3) - WORKOUT PAYLOAD
 * ============================================================================
 */

import { DailyDirective, WorkoutModificationPayload } from "./types";

/**
 * Traduz a Diretriz em multiplicadores matemáticos para o Workout Engine.
 */
export function generateWorkoutPayload(
  directive: DailyDirective,
  biomechanicsFocus: string[]
): WorkoutModificationPayload {
  const payload: WorkoutModificationPayload = {
    volumeMultiplier: 1.0,
    intensityMultiplier: 1.0,
    rirTarget: 2, // RIR Padrão (2 repetições na reserva)
    exerciseRestrictions: [],
    priorityFocus: biomechanicsFocus
  };

  switch (directive) {
    case "PUSH":
      payload.volumeMultiplier = 1.1; // +10% de volume se houver lastro
      payload.intensityMultiplier = 1.05; // +5% de carga
      payload.rirTarget = 1; // Mais próximo da falha
      break;
    
    case "DELOAD":
      payload.volumeMultiplier = 0.7; // Corta 30% das séries
      payload.intensityMultiplier = 0.85; // Reduz carga em 15%
      payload.rirTarget = 4; // Longe da falha
      payload.exerciseRestrictions = ["heavy_compound", "spinal_loading"];
      break;
    
    case "RECOVERY_ONLY":
      payload.volumeMultiplier = 0.0;
      payload.intensityMultiplier = 0.0;
      payload.rirTarget = 10;
      payload.exerciseRestrictions = ["all_hypertrophy"];
      payload.priorityFocus = ["mobility", "release", "blood_flow"];
      break;
      
    case "MAINTAIN":
    case "REQUIRE_HUMAN_REVIEW":
    default:
      // Mantém os multiplicadores em 1.0 (Treino original intocado)
      break;
  }

  return payload;
}
