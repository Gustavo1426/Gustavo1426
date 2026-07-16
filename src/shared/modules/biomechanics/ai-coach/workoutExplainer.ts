/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: WORKOUT EXPLAINER
 * ============================================================================
 */

import { CoachContext } from "../types/aiCoach.types";

/**
 * Justifica alterações de volume, intensidade e seleção de exercícios usando dados da biomecânica e fadiga.
 */
export function explainWorkoutDecision(question: string, context: CoachContext): string {
  const q = question.toLowerCase();

  if (q.includes("remada") || q.includes("puxar") || q.includes("costas")) {
    const hasShoulderIssue = context.assessment.findings.some(f => f.id === "shoulder_anteriorization");
    if (hasShoulderIssue) {
      return "Sua avaliação mostrou necessidade de melhorar o equilíbrio entre os músculos da parte anterior e posterior do tronco. Por isso, há maior prioridade para exercícios de puxar (como remadas) nesta fase do treinamento, garantindo que seus ombros voltem para o alinhamento ideal.";
    }
  }

  if (q.includes("volume") || q.includes("séries") || q.includes("reduziu")) {
    if (context.workout.recentVolumeChange === "decreased" && context.workout.fatigueLevel === "high") {
      return "Nas últimas semanas identificamos um acúmulo importante de carga e sinais de fadiga (RIR alto). O sistema reduziu temporariamente o seu volume de séries para favorecer a recuperação do seu sistema nervoso central e garantir a continuidade da sua evolução sem risco de lesão.";
    }
  }

  if (q.includes("carga") || q.includes("aumentar") || q.includes("peso")) {
    if (context.assessment.evolutionDelta > 0 && context.workout.fatigueLevel !== "high") {
      return "Sua execução permanece consistente e sua evolução biomecânica recente foi muito positiva. Se você conseguir manter a técnica adequada e atingir as repetições planejadas sem falhar precocemente, a próxima progressão de carga está liberada!";
    } else {
      return "No momento, nosso foco prioritário é estabilizar a sua técnica de execução e controle motor. Recomendo mantermos a carga atual por mais esta semana para consolidar a sua adaptação neuromuscular.";
    }
  }

  return "Seu treino foi desenhado cruzando o seu objetivo de hipertrofia com as métricas exatas do seu último mapeamento corporal, garantindo o máximo de eficiência com o menor desgaste articular possível.";
}
