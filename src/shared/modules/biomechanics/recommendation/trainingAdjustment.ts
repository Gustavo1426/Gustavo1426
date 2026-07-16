/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: TRAINING ADJUSTMENT ENGINE
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { TrainingAdjustment } from "../types/recommendation.types";

/**
 * Fornece regras gerais de programação e formatação física do treino para apoiar o professor.
 */
export function generateTrainingAdjustments(findings: BiomechanicalFinding[]): TrainingAdjustment {
  const attentionPoints: string[] = [];
  const volumeAdjustments: string[] = [];
  const executionTips: string[] = [];

  const activeIds = new Set(findings.map(f => f.id));

  if (activeIds.has("shoulder_anteriorization")) {
    attentionPoints.push("Monitorar fadiga excessiva em movimentos de empurrar acima da cabeça.");
    volumeAdjustments.push("Garantir proporção de volume de treino de 2:1 (puxar vs. empurrar) para equilibrar a cintura escapular.");
    executionTips.push("Enfatizar a retração e depressão escapular ativa durante a fase concêntrica e excêntrica dos supinos.");
  }

  if (activeIds.has("knee_valgus_tendency")) {
    attentionPoints.push("Atenção à perda de alinhamento joelho-pé durante agachamentos e afundos sob carga.");
    volumeAdjustments.push("Substituir temporariamente agachamentos pesados com barra livre por Leg Press ou agachamento com caixa (Box Squat) se o valgo dinâmico persistir.");
    executionTips.push("Instruir o aluno a 'empurrar o chão para fora com os pés' para ativar a cadeia lateral de glúteos.");
  }

  // Ajustes de fallback caso o aluno não tenha desvios significativos registrados
  if (attentionPoints.length === 0) {
    attentionPoints.push("Manter o padrão de execução simétrico e progressão gradual de carga.");
    volumeAdjustments.push("Manter distribuição equilibrada entre grupos agonistas e antagonistas.");
    executionTips.push("Foco no controle cadenciado em fases excêntricas para manter a integridade articular.");
  }

  return {
    attentionPoints,
    volumeAdjustments,
    executionTips
  };
}
