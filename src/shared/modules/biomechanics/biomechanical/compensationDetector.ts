/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: COMPENSATION DETECTOR
 * ============================================================================
 */

import { BiomechanicalFinding, CompensationPattern } from "../types/biomechanical.types";

/**
 * Analisa o corpo como um sistema conectado. Detecta síndromes cruzadas ou compensações em cadeia.
 */
export function detectCompensations(findings: BiomechanicalFinding[]): CompensationPattern[] {
  const compensations: CompensationPattern[] = [];
  const activeIds = new Set(findings.map(f => f.id));

  // Exemplo: Síndrome Cruzada Superior (Upper Crossed Syndrome)
  // Cabeça anteriorizada + Ombros anteriorizados + Cifose Torácica
  if (activeIds.has("shoulder_anteriorization") && activeIds.has("thoracic_kyphosis")) {
    compensations.push({
      name: "Síndrome Cruzada Superior (Compensação Global)",
      relatedAreas: ["cervical", "ombros", "coluna torácica"],
      confidence: 90,
      globalImpact: "Provoca encurtamento da musculatura anterior e inibição profunda dos flexores do pescoço e estabilizadores escapulares posteriores."
    });
  }

  // Exemplo: Descompensação Ascendente de Quadril/Joelho
  if (activeIds.has("anterior_pelvic_tilt") && activeIds.has("knee_valgus_tendency")) {
    compensations.push({
      name: "Disfunção do Complexo Quadril-Joelho-Pé",
      relatedAreas: ["pelve", "joelhos"],
      confidence: 82,
      globalImpact: "A rotação interna de fêmur gerada pela anteversão pélvica empurra os joelhos para o padrão valgo."
    });
  }

  return compensations;
}
