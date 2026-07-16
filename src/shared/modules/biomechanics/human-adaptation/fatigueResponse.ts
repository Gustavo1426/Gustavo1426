/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: FATIGUE RESPONSE
 * ============================================================================
 */

import { FatigueState, StimulusProfile } from "../types/adaptation.types";

/**
 * Fragmenta a fadiga em Local (Músculo), Sistêmica e Neural.
 */
export function calculateFatigue(stimulus: StimulusProfile, previousFatigue: FatigueState): FatigueState {
  // A fadiga decai naturalmente com o tempo, mas aqui somamos o novo estímulo
  const newSystemic = Math.min(100, previousFatigue.systemicFatigue * 0.5 + (stimulus.systemicStress * 0.4));
  const newNeural = Math.min(100, previousFatigue.neuralFatigue * 0.4 + (stimulus.neuromuscularDemand * 0.5));

  return {
    localFatigue: previousFatigue.localFatigue, // Seria populado cruzando o EID (Activation Coefficients)
    systemicFatigue: Math.round(newSystemic),
    neuralFatigue: Math.round(newNeural)
  };
}
