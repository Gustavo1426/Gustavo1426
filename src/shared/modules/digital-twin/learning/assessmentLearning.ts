/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.3: DIGITAL TWIN ENGINE (V3) - ASSESSMENT LEARNING
 * ============================================================================
 */

import { DigitalTwin } from "../types";

/**
 * Processa a evolução estrutural quando há uma nova foto/laudo.
 */
export function updateTwinFromAssessment(
  twin: DigitalTwin, 
  newIgb: number,
  movementScore: number, 
  newRestrictions: string[]
): DigitalTwin {
  
  const updatedTwin: DigitalTwin = {
    ...twin,
    biomechanics: { ...twin.biomechanics }
  };
  
  updatedTwin.lastUpdated = new Date().toISOString();

  // Histórico e Tendência
  const oldIgb = twin.biomechanics.currentIgb;
  // Make sure igbHistory is copied to prevent mutations of the original
  updatedTwin.biomechanics.igbHistory = [...twin.biomechanics.igbHistory, newIgb];
  updatedTwin.biomechanics.currentIgb = newIgb;
  updatedTwin.biomechanics.movementQualityScore = movementScore;

  if (newIgb > oldIgb + 2) {
    updatedTwin.biomechanics.mobilityTrend = "improving";
  } else if (newIgb < oldIgb - 2) {
    updatedTwin.biomechanics.mobilityTrend = "declining";
  } else {
    updatedTwin.biomechanics.mobilityTrend = "stable";
  }
  
  // Atualiza Restrições
  const oldRestrictions = twin.biomechanics.persistentRestrictions;
  const resolved = oldRestrictions.filter(r => !newRestrictions.includes(r));
  updatedTwin.biomechanics.persistentRestrictions = newRestrictions;
  updatedTwin.biomechanics.resolvedRestrictions = [...twin.biomechanics.resolvedRestrictions, ...resolved];

  return updatedTwin;
}
