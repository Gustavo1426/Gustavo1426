/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FormulaExplanation {
  title: string;
  formula: string;
  exampleValues: string;
  description: string;
}

export const EXPLAIN_FORMULAS: Record<string, FormulaExplanation> = {
  quality: {
    title: "Qualidade do Treino (Workout Quality)",
    formula: "Qualidade = (100 - Penalidade_Fadiga - Desvio_Volume) * Multiplicador_Equilíbrio * Coerência_Experiência",
    exampleValues: "(100 - 4.5 - 3.2) * 1.0 * 0.98 = 91%",
    description: "Mede o quão alinhado o plano de treino está com as melhores práticas de hipertrofia. Penaliza volumes excessivos fora da faixa do MAV (Volume de Adaptação Máxima) e fadiga sistêmica extrema, enquanto premia o equilíbrio agonista/antagonista."
  },
  adherence: {
    title: "Índice de Aderência (Adherence Score)",
    formula: "Score = 100 - (Faltas * 12) - (Incompletos * 6) - (Atrasos * 0.5) - (Exercícios_Ignorados * 4)",
    exampleValues: "100 - (1 * 12) - (1 * 6) - (15 * 0.5) - (2 * 4) = 66%",
    description: "Mede a consistência real do aluno na execução do plano. Subtrai pontos de acordo com a gravidade das quebras de protocolo (faltas completas têm peso máximo, enquanto pequenos atrasos ou exercícios pulados têm impacto menor)."
  },
  biomechanical_score: {
    title: "Score Biomecânico (Biomechanical Alignment)",
    formula: "Score = 100 - Penalidade_Redundância - Desvios_Razões_Antagonistas - Desajuste_Planos",
    exampleValues: "100 - (2 * 5) - (0.15 * 20) - 4 = 83%",
    description: "Determina a harmonia cinética e o balanceamento postural do treino. Diminui com sobreposição de exercícios redundantes de mesma angulação (redundância mecânica) ou discrepância grave nas proporções de empurrar/puxar e joelho/quadril."
  },
  systemic_fatigue: {
    title: "Fadiga Sistêmica (Systemic Fatigue)",
    formula: "Fadiga = Soma(Fadiga_Local * Coeficiente_Massa_Muscular) * Multiplicador_Frequência_Semanal",
    exampleValues: "Soma(Peitoral: 5.6 * 1.1, Quadríceps: 2.6 * 1.5) * 1.2 = 95.4 UA (Unidades Arbitrárias)",
    description: "Calcula a sobrecarga geral sobre o Sistema Nervoso Central (SNC) e sistema neuroendócrino. Grupamentos de maior massa muscular (Ex: Quadríceps, Costas) geram maior impacto sistêmico do que pequenos (Ex: Bíceps, Ombros)."
  },
  recovery_probability: {
    title: "Probabilidade de Recuperação Completa",
    formula: "Recuperação % = 100 - (Fadiga_Sistêmica * 0.35) - (Semana_Meso_Multiplicador * 5) - (Fator_Dor_Articular * 4)",
    exampleValues: "100 - (95.4 * 0.35) - (2 * 5) - (3 * 4) = 44.6%",
    description: "Estima a chance estatística do tecido muscular se regenerar completamente e sofrer supercompensação antes do próximo estímulo, considerando o acúmulo semanal e dor relatada."
  },
  clinical_risk: {
    title: "Score de Risco Clínico-Ortopédico",
    formula: "Risco % = Média_Ponderada(Compressão_Espinal, Cisalhamento_Patelar, Excesso_Empurrar, Redundância)",
    exampleValues: "Compressão(50) + Joelho(33) + Empurrar(45) + Redundância(50) = 45% (Risco Moderado)",
    description: "Avalia a probabilidade de estresse articular nocivo acumulado nas principais estruturas de sustentação (coluna, joelhos, ombros), prevenindo tendinopatias e lesões por esforço repetitivo."
  },
  volume_efetivo: {
    title: "Volume Semanal Efetivo",
    formula: "Volume Efetivo = Séries Diretas + (Séries Indiretas * Coeficiente de Sinergia) + Equivalência de Intensificadores",
    exampleValues: "12 séries de Peito + (8 séries de Supino Indireto de Tríceps * 0.5) = 16 séries efetivas",
    description: "Ajusta o volume de treino real somando o trabalho direto ao estímulo indireto gerado por exercícios compostos sinergistas (Ex: Supino recruta Tríceps/Ombro Anterior), além de pontuar séries com técnicas avançadas."
  }
};
