/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: STABILITY RECOMMENDATION
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { BiomechanicalRecommendation } from "../types/recommendation.types";

/**
 * Traduz achados em exercícios de estabilização segmentar e ativação neuromuscular (ativações).
 */
export function generateStabilityRecommendations(findings: BiomechanicalFinding[]): BiomechanicalRecommendation[] {
  const recommendations: BiomechanicalRecommendation[] = [];
  const activeIds = new Set(findings.map(f => f.id));

  if (activeIds.has("shoulder_anteriorization")) {
    recommendations.push({
      priority: "high",
      category: "stability",
      title: "Ativação e Controle Escapular Posterior",
      description: "Realize exercícios de ativação (YTWL, manguito rotador externo e depressão escapular na polia) com cargas leves antes de iniciar os exercícios multiarticulares de empurrar."
    });
  }

  if (activeIds.has("knee_valgus_tendency")) {
    recommendations.push({
      priority: "high",
      category: "stability",
      title: "Fortalecimento e Controle dos Abdutores de Quadril",
      description: "Incorpore exercícios com mini-band (Clamshell, passos laterais) focando na ativação e recrutamento do glúteo médio para mitigar o colapso interno dos joelhos."
    });
  }

  return recommendations;
}
