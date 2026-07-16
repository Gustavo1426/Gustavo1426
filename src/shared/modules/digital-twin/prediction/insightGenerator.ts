/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.3: DIGITAL TWIN ENGINE (V3) - INSIGHT GENERATOR
 * ============================================================================
 */

import { DigitalTwin, TwinInsight } from "../types";

/**
 * Vasculha o Gêmeo Digital para alertar o sistema ou o Professor.
 */
export function generateTwinInsights(twin: DigitalTwin): TwinInsight[] {
  const insights: TwinInsight[] = [];

  // A IA só gera alertas críticos se tiver confiança suficiente nos dados
  if (twin.reliability.confidenceScore > 60) {
    // Alerta de Evasão (Adesão baixa + Fase de Engajamento alta)
    if (twin.behavior.adherenceScore < 60 && twin.behavior.engagementPhase === "engaged") {
      insights.push({
        category: "warning",
        message: `Queda de adesão detectada. Sugerido acionar canal preferencial: ${twin.behavior.communicationPreference.toUpperCase()}.`
      });
    }

    // Alerta Corrigido: Estado de Fadiga Acumulada
    if (twin.recovery.chronicFatigue > 85 && twin.performance.strengthTrend === "declining") {
      insights.push({
        category: "warning",
        message: "Estado de fadiga acumulada elevado. Necessário ajuste de carga ou programação de Deload."
      });
    }

    // Oportunidade: Janela Anabólica / Progressão
    if (
      twin.recovery.chronicFatigue < 40 && 
      twin.performance.strengthTrend === "improving" && 
      twin.biomechanics.mobilityTrend === "improving"
    ) {
      insights.push({
        category: "opportunity",
        message: "Excelente adaptação global. Capacidade ótima para suportar bloco de choque (alta intensidade)."
      });
    }
  }

  return insights;
}
