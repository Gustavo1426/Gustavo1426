/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: HUMAN ADAPTATION ENGINE
 * ============================================================================
 */

import { AdaptationState, SessionData } from "../types/adaptation.types";
import { analyzeStimulus } from "./stimulusAnalyzer";
import { calculateFatigue } from "./fatigueResponse";
import { estimateRecovery } from "./recoveryResponse";
import { updateAdaptationSignature } from "./responseClassification";
import { calculateAdaptiveCapacity } from "./adaptiveCapacity";
import { evaluateMotorLearning } from "./motorLearningModel";

export interface AdaptationInput {
  session: SessionData;
  currentState: AdaptationState;
  historicalData: { igbDelta: number; consistencyScore: number; historicalProgress: number; historicalFatigue: number };
}

/**
 * O Motor Central de Adaptação Humana.
 * Recebe o treino que acabou de acontecer e projeta a mutação fisiológica do aluno.
 */
export function runHumanAdaptationEngine(input: AdaptationInput): AdaptationState {
  console.log("[Human Adaptation Engine] Modelando resposta fisiológica à sessão...");

  // 1. Calcula o estímulo da sessão
  const stimulus = analyzeStimulus(input.session);

  // 2. Calcula a fadiga gerada pelo estímulo
  const fatigue = calculateFatigue(stimulus, input.currentState.fatigue);

  // 3. Estima o tempo e a taxa de recuperação (Readiness)
  const recovery = estimateRecovery(fatigue);

  // 4. Atualiza a assinatura fisiológica única com base no histórico recente
  const signature = updateAdaptationSignature(
    input.historicalData.historicalProgress,
    input.historicalData.historicalFatigue,
    input.currentState.signature
  );

  // 5. Calcula o "tanque de combustível" restante na semana
  const capacity = calculateAdaptiveCapacity(input.currentState.capacity.currentLoadSets + input.session.exercises.length, signature);

  // 6. Avalia a eficiência de movimento baseada na biomecânica
  const learning = evaluateMotorLearning(input.historicalData.igbDelta, input.historicalData.consistencyScore);

  return {
    stimulus,
    fatigue,
    recovery,
    capacity,
    learning,
    signature,
    lastUpdated: new Date().toISOString()
  };
}
