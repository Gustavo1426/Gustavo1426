/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.4: PREDICTIVE ANALYTICS ENGINE - VOLUME RESPONSE SIMULATION
 * ============================================================================
 */

import { DigitalTwinMock, VolumeResponseSimulation } from "../types";

/**
 * Um simulador "What-If" (E se?). Testa se aumentar o volume vai gerar hipertrofia ou overreaching.
 */
export function simulateVolumeResponse(twin: DigitalTwinMock, currentSets: number, addedSets: number): VolumeResponseSimulation {
  const newVolume = currentSets + addedSets;
  const roomToGrow = twin.performance.estimatedMRV - currentSets;
  
  let benefit: VolumeResponseSimulation["predictedBenefit"] = "high";
  let fatigueSpike = addedSets * 1.5;

  if (newVolume > twin.performance.estimatedMRV) {
    benefit = "negative";
    fatigueSpike = addedSets * 4; // Spike massivo por ultrapassar o teto
  } else if (addedSets > roomToGrow * 0.8) {
    benefit = "marginal"; // Retorno decrescente (Junk Volume)
    fatigueSpike = addedSets * 2.5;
  }

  return {
    proposedDeltaSets: addedSets,
    predictedBenefit: benefit,
    predictedFatigueSpike: fatigueSpike
  };
}
