/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PRIORITY ENGINE
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { PriorityItem, RecommendationPriority } from "../types/recommendation.types";

/**
 * Ordena e define quais desvios corporais merecem intervenção corretiva primária.
 * Fórmula de prioridade ponderada: (Severidade [1-3] * 0.5) + (Confiança [0-1] * 0.3) + (Nº de Impactos * 0.2)
 */
export function calculatePriorities(findings: BiomechanicalFinding[]): PriorityItem[] {
  const items: PriorityItem[] = findings.map(finding => {
    // Converte severidade em nota numérica
    const severityWeight = finding.severity === "high" ? 3 : finding.severity === "medium" ? 2 : 1;
    const confidenceFactor = finding.confidence / 100;
    const impactCount = finding.possibleImpacts.length;

    // Cálculo do score matemático de prioridade
    const score = (severityWeight * 5) + (confidenceFactor * 3) + (impactCount * 2);

    let level: RecommendationPriority = "low";
    if (score >= 18) level = "high";
    else if (score >= 12) level = "medium";

    // Extrai a área anatômica baseada no nome ou categoria do achado
    let area = "Geral";
    const nameLower = finding.name.toLowerCase();
    if (nameLower.includes("ombro") || nameLower.includes("escapular")) area = "Ombro";
    else if (nameLower.includes("pelve") || nameLower.includes("quadril")) area = "Pelve";
    else if (nameLower.includes("joelho") || nameLower.includes("valgo") || nameLower.includes("varo")) area = "Joelho";
    else if (nameLower.includes("cervical") || nameLower.includes("cabeça")) area = "Cervical";
    else if (nameLower.includes("torácica") || nameLower.includes("cifose") || nameLower.includes("lombar")) area = "Coluna";

    return {
      area,
      level,
      score: Math.round(score * 10) / 10
    };
  });

  // Ordena da maior prioridade para a menor
  return items.sort((a, b) => b.score - a.score);
}
