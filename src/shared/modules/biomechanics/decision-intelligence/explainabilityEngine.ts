/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EXPLAINABILITY ENGINE
 * ============================================================================
 */

import { DecisionContext, ProposedAction } from "../types/decision.types";

export function calculateConfidence(proposalsCount: number, conflicts: number): number {
  // Se muitos motores concordam e há 0 conflitos, a confiança é 99%.
  let confidence = 95 - (conflicts * 15);
  return Math.max(10, Math.min(99, confidence));
}

export function generateExplanations(action: ProposedAction, context: DecisionContext): { coach: string, student: string } {
  let student = "";
  let coach = "";

  switch (action.actionType) {
    case "IncreaseVolume":
      student = "Seu treino foi ajustado para um novo nível! Sua execução evoluiu, seu Índice Biomecânico está ótimo e sua recuperação respondeu bem. Seu corpo está pronto para progredir.";
      coach = `Decisão: Progressão de Volume autorizada. Razão: Adesão (${context.workoutHistory.adherence}%) e IGB (${context.biomechanics.igb}) atendem aos critérios da ${context.goalPolicy.id}. Fadiga sob controle.`;
      break;
    case "DecreaseVolume":
    case "Deload":
      student = "Ajustamos o seu treino desta semana para focar na sua recuperação. Identificamos sinais de cansaço acumulado e queremos garantir que você continue evoluindo sem se machucar.";
      coach = `Decisão: Semana de Deload/Regressão aplicada. Razão: Restrições biomecânicas ou fadiga ultrapassaram o teto seguro da política atual. Foco em recuperação articular.`;
      break;
    case "Maintain":
      student = "Sua estratégia de treino atual está trazendo ótimos resultados consistentes. Vamos manter esta estrutura por mais alguns treinos para solidificar seus ganhos.";
      coach = `Decisão: Manutenção. Razão: Aluno ainda extraindo adaptações do bloco atual. Gatilhos de progressão não foram totalmente preenchidos.`;
      break;
    default:
      student = "Seu treino foi atualizado baseando-se nas suas respostas recentes de performance.";
      coach = `Decisão: ${action.actionType}. Ação recomendada pelos motores periféricos.`;
  }

  return { student, coach };
}
