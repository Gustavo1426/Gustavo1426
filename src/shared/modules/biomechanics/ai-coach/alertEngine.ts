/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: ALERT ENGINE
 * ============================================================================
 */

import { CoachContext, CoachAlert } from "../types/aiCoach.types";

/**
 * Processa regras de negócio críticas e aciona a moderação humana (o Professor Real) 
 * ou sugere redirecionamentos de rota (como uma nova reavaliação).
 */
export function processAlertsAndRecommendations(context: CoachContext): { alerts: CoachAlert[]; recommendations: string[] } {
  const alerts: CoachAlert[] = [];
  const recommendations: string[] = [];

  // Regra 1: Abandono de Treino (Churn Risk)
  if (context.adherence.adherencePercentage < 60) {
    alerts.push({
      type: "low_adherence",
      priority: "high",
      messageToProfessor: `ALERTA DE RETENÇÃO: Aluno ${context.studentName} com adesão de apenas ${context.adherence.adherencePercentage}%. Possível risco de evasão. Recomendado contato humanizado.`
    });
  }

  // Regra 2: Vencimento da Avaliação Biomecânica
  if (context.daysSinceLastAssessment >= 120) {
    alerts.push({
      type: "assessment_due",
      priority: "medium",
      messageToProfessor: `Reavaliação biomecânica vencida (120 dias). Solicitar novas fotos no aplicativo.`
    });
    recommendations.push("Já faz um tempo desde a nossa última análise postural! Tire novas fotos na aba de Avaliação do App para ajustarmos a sua rota de evolução.");
  }

  // Regra 3: Queda de Performance aliada à piora do IGB
  if (context.workout.fatigueLevel === "high" && context.assessment.evolutionDelta < 0) {
    alerts.push({
      type: "performance_drop",
      priority: "high",
      messageToProfessor: `ALERTA TÉCNICO: Aluno reportando fadiga alta com queda recente de IGB. Recomendado realizar deload (semana regenerativa) imediato.`
    });
    recommendations.push("Notei que o seu desgaste está mais alto que o normal. Vou sugerir ao seu professor uma semana regenerativa (Deload) para o seu corpo recuperar a performance com segurança.");
  }

  // Fallback positivo se tudo estiver bem
  if (recommendations.length === 0) {
    recommendations.push("Continuar executando a estratégia de treino atual. Os indicadores estão dentro da zona de excelência.");
  }

  return { alerts, recommendations };
}
