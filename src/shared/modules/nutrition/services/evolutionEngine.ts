/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HistoricalEvaluation {
  id: string;
  data: string;
  geralScore: number;
  simetriaScore: number;
  cervicalScore?: number | null;
  escapularScore?: number | null;
  pelvicScore?: number | null;
}

export interface ProgressionTrend {
  scoreChange: number; // Positive is improvement, negative is decline
  symmetryChange: number;
  overallTrend: "Melhora expressiva" | "Estabilidade" | "Piora sutil" | "Melhora leve";
  recommendation: string;
}

/**
 * Evaluates the chronological progress trend across student evaluations.
 */
export function analisarEvolucao(history: HistoricalEvaluation[]): ProgressionTrend {
  if (history.length < 2) {
    return {
      scoreChange: 0,
      symmetryChange: 0,
      overallTrend: "Estabilidade",
      recommendation: "Continue realizando treinos corretivos para construir sua linha de base."
    };
  }

  // Sort history chronologically (oldest first, newest last)
  const sorted = [...history].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];

  const scoreChange = newest.geralScore - oldest.geralScore;
  const symmetryChange = newest.simetriaScore - oldest.simetriaScore;

  let overallTrend: "Melhora expressiva" | "Estabilidade" | "Piora sutil" | "Melhora leve" = "Estabilidade";
  let recommendation = "Os índices permanecem estáveis. Garanta adesão rigorosa aos exercícios corretivos semanais.";

  if (scoreChange >= 8.0) {
    overallTrend = "Melhora expressiva";
    recommendation = "Evolução postural excelente! O alinhamento funcional geral está subindo. Mantenha a periodização de treino atual.";
  } else if (scoreChange > 2.0) {
    overallTrend = "Melhora leve";
    recommendation = "Melhora gradual observada. Ótimo progresso na simetria corporal. Continue o foco nos estabilizadores de core e quadril.";
  } else if (scoreChange < -2.0) {
    overallTrend = "Piora sutil";
    recommendation = "Pequena oscilação negativa. Revise o tempo sentado ou o nível de fadiga acumulada antes da captura da foto.";
  }

  return {
    scoreChange,
    symmetryChange,
    overallTrend,
    recommendation
  };
}
