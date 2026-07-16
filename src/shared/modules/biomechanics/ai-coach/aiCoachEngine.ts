/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: AI COACH ENGINE ORCHESTRATOR
 * ============================================================================
 */

import { ConversationMemoryEntry, AIResponse } from "../types/aiCoach.types";
import { buildCoachContext } from "./contextBuilder";
import { explainWorkoutDecision } from "./workoutExplainer";
import { explainBiomechanics } from "./biomechanicsExplainer";
import { generateDataDrivenMotivation } from "./motivationEngine";
import { processAlertsAndRecommendations } from "./alertEngine";

/**
 * Orquestrador principal do AI Coach Engine.
 * Recebe a pergunta do aluno, levanta o contexto completo e processa uma resposta sistêmica integrada.
 * 
 * @param studentId ID do aluno que está enviando a mensagem
 * @param question Pergunta em linguagem natural digitada pelo aluno
 * @param memory O histórico recente do chat para manter contexto (Opcional)
 */
export async function processStudentQuery(
  studentId: string,
  question: string,
  memory?: ConversationMemoryEntry[]
): Promise<AIResponse> {
  
  // 1. Constroi o "Cérebro" de contexto unindo todos os motores (Biomecânica, Treino, Evolução)
  const context = await buildCoachContext(studentId);

  // 2. Triage da Pergunta (Determina qual "Explainer" deve atuar)
  let answer = "";
  const qLowerCase = question.toLowerCase();

  if (
    qLowerCase.includes("treino") || 
    qLowerCase.includes("carga") || 
    qLowerCase.includes("volume") || 
    qLowerCase.includes("remada") ||
    qLowerCase.includes("puxar") ||
    qLowerCase.includes("costas") ||
    qLowerCase.includes("séries") ||
    qLowerCase.includes("reduziu") ||
    qLowerCase.includes("peso") ||
    qLowerCase.includes("aumentar")
  ) {
    answer = explainWorkoutDecision(question, context);
  } else if (
    qLowerCase.includes("ombro") || 
    qLowerCase.includes("postura") || 
    qLowerCase.includes("torto") || 
    qLowerCase.includes("significa") ||
    qLowerCase.includes("desalinhado") ||
    qLowerCase.includes("assimetria")
  ) {
    answer = explainBiomechanics(question, context);
  } else {
    // Resposta genérica humanizada usando os dados da IA
    answer = `Estou analisando seu perfil. Atualmente, seu IGB é ${context.assessment.igb}/100 e nossa prioridade no treino é equilibrar sua força muscular. Como posso te ajudar especificamente hoje?`;
  }

  // 3. Gera a camada de motivação orientada por dados
  const dataDrivenMotivation = generateDataDrivenMotivation(context);

  // 4. Analisa a situação macro e aciona os alertas de retenção/saúde para o professor
  const { alerts, recommendations } = processAlertsAndRecommendations(context);

  return {
    answer,
    dataDrivenMotivation,
    recommendations,
    backgroundAlerts: alerts
  };
}
