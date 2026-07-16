/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: TWIN EVENT UPDATER
 * ============================================================================
 */

import { DigitalTwin } from "../types/digitalTwin.types";
import { calculateHealthScore } from "./twinHealth";
import { updatePredictions } from "./twinPrediction";

export type TwinEvent = 
  | { type: "WORKOUT_COMPLETED"; payload: { volumeSets: number; averageRIR: number; perceivedExertion: number } }
  | { type: "NEW_ASSESSMENT"; payload: { newIgb: number; activeFindings: string[] } }
  | { type: "BIOIMPEDANCE_UPDATED"; payload: { weightKg: number; bodyFat: number } };

/**
 * Mutador de estado principal. Atualiza o Gêmeo Digital baseado em eventos do mundo real.
 */
export function applyEventToTwin(currentTwin: DigitalTwin, event: TwinEvent): DigitalTwin {
  const updatedTwin = JSON.parse(JSON.stringify(currentTwin)) as DigitalTwin;

  switch (event.type) {
    case "WORKOUT_COMPLETED":
      // Atualiza fadiga, prontidão e performance temporária
      updatedTwin.recovery.fatigueLevel = Math.min(100, updatedTwin.recovery.fatigueLevel + (event.payload.perceivedExertion * 2));
      updatedTwin.recovery.readinessScore = Math.max(0, updatedTwin.recovery.readinessScore - 5);
      updatedTwin.performance.averageRIR = event.payload.averageRIR;
      break;

    case "NEW_ASSESSMENT":
      updatedTwin.biomechanics.igb = event.payload.newIgb;
      updatedTwin.biomechanics.activeFindings = event.payload.activeFindings;
      updatedTwin.biomechanics.lastAssessmentDate = new Date().toISOString();
      break;

    case "BIOIMPEDANCE_UPDATED":
      updatedTwin.body.weightKg = event.payload.weightKg;
      updatedTwin.body.bodyFatPercentage = event.payload.bodyFat;
      updatedTwin.body.lastBioimpedanceDate = new Date().toISOString();
      break;
  }

  // Sempre que o Twin sofre mutação, recalculamos a saúde e predições derivadas
  updatedTwin.healthScore = calculateHealthScore(updatedTwin);
  updatedTwin.prediction = updatePredictions(updatedTwin);
  updatedTwin.version += 1;
  updatedTwin.lastUpdatedAt = new Date().toISOString();

  return updatedTwin;
}
