/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PREDICTIVE CORE ORCHESTRATOR
 * ============================================================================
 */

import { PredictionContext, PredictiveEngineOutput, PredictionResult, TimelinePrediction } from "../types/prediction.types";
import { predictRisks } from "./riskPredictor";
import { predictProgression } from "./progressionPredictor";
import { predictFatigue } from "./fatiguePredictor";
import { predictBiomechanics } from "./biomechanicsPredictor";
import { predictMesocycleTransition } from "./mesocyclePredictor";
import { generatePredictiveRecommendations } from "./recommendationPredictor";
import { logPrediction } from "./predictionAudit";
import { calculatePredictionConfidence } from "./confidenceCalculator";

/**
 * Motor Central Preditivo.
 * Avalia o Gêmeo Digital e projeta múltiplos futuros possíveis para apoiar a tomada de decisão.
 */
export async function runPredictiveEngine(context: PredictionContext): Promise<PredictiveEngineOutput> {
  console.log("[Predictive Engine] Iniciando projeções de futuro...");

  // 1. Gera projeções de base
  const risks = predictRisks(context);
  const progression = predictProgression(context);
  const fatigue = predictFatigue(context);
  const biomechanics = predictBiomechanics(context);
  
  // 2. Gera projeções complexas dependentes (Mesociclo depende dos Riscos previstos)
  const mesocycle = predictMesocycleTransition(context, risks.prediction);

  // 3. Projeção de Linha do Tempo (Timeline)
  const timelineProb = (context.digitalTwin.training.adherencePercentage * 0.8) + (context.digitalTwin.healthScore.score * 0.2);
  const timeline: PredictionResult<TimelinePrediction> = {
    prediction: {
      goalCompletionProbability: Math.round(timelineProb),
      estimatedDate: "2026-11-20" // Simulação de cálculo de datas
    },
    confidence: calculatePredictionConfidence(context.workoutHistory.length, 0.5),
    modelUsed: "linear_regression"
  };

  // 4. Converte previsões em recomendações acionáveis
  const recommendations = generatePredictiveRecommendations(risks.prediction, mesocycle.prediction);

  // 5. Audita as previsões (Machine Learning Feedback Loop)
  logPrediction("risks", risks.confidence, risks.prediction);
  logPrediction("progression", progression.confidence, progression.prediction);

  return {
    risks,
    progression,
    fatigue,
    biomechanics,
    mesocycle,
    timeline,
    recommendations
  };
}
