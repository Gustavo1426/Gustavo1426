/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PROGRESS ANALYZER
 * ============================================================================
 */

import { BiomechanicalChange, AreaProgress } from "../types/evolution.types";

/**
 * Analisa qualitativamente a evolução por segmento ou região anatômica do corpo.
 */
export function analyzeRegionProgress(metricChanges: BiomechanicalChange[]): AreaProgress[] {
  return metricChanges.map(change => {
    let area = "Geral";
    const nameLower = change.metricName.toLowerCase();

    if (nameLower.includes("ombro")) area = "Membros Superiores (Ombro)";
    else if (nameLower.includes("pelve") || nameLower.includes("quadril")) area = "Pelve e Quadril";
    else if (nameLower.includes("joelho")) area = "Membros Inferiores (Joelho)";

    let description = "";
    if (change.status === "improved") {
      description = `Apresentou excelente redução de desalinhamento de ${Math.abs(change.difference)} unidades.`;
    } else if (change.status === "worse") {
      description = `Houve aumento de desalinhamento de ${change.difference} unidades. Atenção e monitoramento necessários.`;
    } else {
      description = "Manteve-se em níveis estáveis desde o último mapeamento.";
    }

    return {
      area,
      description,
      status: change.status
    };
  });
}
