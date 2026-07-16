/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: RECOMMENDATION CORE ENGINE
 * ============================================================================
 */

import { BodyAnalysisOutput } from "../types/body-analysis.types";
import { BiomechanicalFinding } from "../types/biomechanical.types";
import { BiomechanicalScore } from "../types/score.types";
import { RecommendationEngineOutput } from "../types/recommendation.types";
import { calculatePriorities } from "./priorityEngine";
import { generateMobilityRecommendations } from "./mobilityRecommendation";
import { generateStabilityRecommendations } from "./stabilityRecommendation";
import { generateTrainingAdjustments } from "./trainingAdjustment";
import { generateExerciseConsiderations } from "./exerciseConsideration";
import { generateEducationalFeedback } from "./educationalRecommendation";

/**
 * Orquestrador principal do Recommendation Engine.
 * Consolida todas as vertentes corretivas, estabilizadoras e pedagógicas em um output estruturado para prescrição.
 */
export async function runRecommendationEngine(
  findings: BiomechanicalFinding[],
  score: BiomechanicalScore,
  bodyAnalysis: BodyAnalysisOutput
): Promise<RecommendationEngineOutput> {
  
  // 1. Calcula a lista ordenada de prioridades de intervenção
  const priorities = calculatePriorities(findings);

  // 2. Extrai propostas de mobilidade dinâmica e flexibilidade articular
  const mobilityRecommendations = generateMobilityRecommendations(findings);

  // 3. Define propostas de ativação, core e estabilidade corporal
  const stabilityRecommendations = generateStabilityRecommendations(findings);

  // 4. Compila ajustes de programação técnica de força (Musculação aplicada)
  const trainingAdjustments = generateTrainingAdjustments(findings);

  // 5. Gera as diretivas e restrições específicas ligadas a exercícios específicos
  const exerciseConsiderations = generateExerciseConsiderations(findings);

  // 6. Traduz análises em insights de comunicação (Aluno e Treinador)
  const educationalNotes = generateEducationalFeedback(findings, score);

  return {
    priorities,
    mobilityRecommendations,
    stabilityRecommendations,
    trainingAdjustments,
    exerciseConsiderations,
    educationalNotes
  };
}
