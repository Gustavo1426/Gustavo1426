/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: MOBILITY RECOMMENDATION
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { BiomechanicalRecommendation } from "../types/recommendation.types";

/**
 * Traduz achados do motor biomecânico em rotinas de liberação e mobilidade articular.
 */
export function generateMobilityRecommendations(findings: BiomechanicalFinding[]): BiomechanicalRecommendation[] {
  const recommendations: BiomechanicalRecommendation[] = [];
  const activeIds = new Set(findings.map(f => f.id));

  if (activeIds.has("shoulder_anteriorization") || activeIds.has("thoracic_kyphosis")) {
    recommendations.push({
      priority: "high",
      category: "mobility",
      title: "Melhorar a Extensão e Mobilidade Torácica",
      description: "Utilize rolos de liberação miofascial e alongamentos dinâmicos focados no peitoral e na coluna torácica antes de treinar membros superiores."
    });
  }

  if (activeIds.has("anterior_pelvic_tilt")) {
    recommendations.push({
      priority: "medium",
      category: "mobility",
      title: "Mobilização de Flexores de Quadril",
      description: "Foco no alongamento dinâmico e liberação do psoas maior e do reto femoral, diminuindo a tração anterior sobre a pelve."
    });
  }

  return recommendations;
}
