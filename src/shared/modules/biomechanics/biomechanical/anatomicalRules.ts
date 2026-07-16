/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.5: BIOMECHANICAL ENGINE - ANATOMICAL RULES
 * ============================================================================
 */

import { BodyAnalysisOutput } from "../body-analysis/bodyAnalysisService";

export type RiskLevel = "low" | "medium" | "high";

export interface AnatomicalRule {
  id: string;
  // Função que avalia os dados da Fase 1.4 e retorna true se a regra for ativada
  condition: (analysis: BodyAnalysisOutput) => boolean;
  interpretation: string;
  severity: RiskLevel;
}

export const anatomicalRules: AnatomicalRule[] = [
  {
    id: "SHOULDER_ASYMMETRY",
    condition: (analysis) => analysis.alignment.some(a => a.region === "shoulders" && a.status !== "normal"),
    interpretation: "Possível alteração no alinhamento e ritmo escapular.",
    severity: "medium"
  },
  {
    id: "PELVIC_ASYMMETRY",
    condition: (analysis) => analysis.symmetry.some(s => s.bodyPart === "pelvis" && s.severity !== "low"),
    interpretation: "Desnível pélvico detectado. Possível desequilíbrio na distribuição de carga.",
    severity: "high"
  },
  {
    id: "ANKLE_LIMITATION",
    condition: (analysis) => analysis.mobility.some(m => m.joint === "ankle" && m.restriction !== "none"),
    interpretation: "Limitação de dorsiflexão pode afetar a profundidade e segurança de padrões de agachamento.",
    severity: "medium"
  }
];
