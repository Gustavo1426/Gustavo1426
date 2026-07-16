/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: VISUAL ANNOTATION ENGINE
 * ============================================================================
 */

import { BodyAnalysisOutput } from "../types/body-analysis.types";
import { BiomechanicalFinding } from "../types/biomechanical.types";
import { BodyAnnotation } from "../types/report.types";

/**
 * Mapeia os desvios encontrados para coordenadas normalizadas da tela.
 * Permite ao app desenhar círculos laranja/vermelho sobre a foto do aluno.
 */
export function generateVisualAnnotations(
  findings: BiomechanicalFinding[],
  _analysis: BodyAnalysisOutput
): BodyAnnotation[] {
  const annotations: BodyAnnotation[] = [];

  findings.forEach(finding => {
    // Definindo a região e aproximando as coordenadas para renderizar o Pin
    if (finding.id === "shoulder_anteriorization") {
      annotations.push({
        region: "shoulder",
        position: { x: 50, y: 32 }, // Centralizado sobre a linha dos ombros
        label: "Anteriorização de Ombros",
        severity: finding.severity
      });
    }

    if (finding.id === "thoracic_kyphosis") {
      annotations.push({
        region: "spine",
        position: { x: 50, y: 40 },
        label: "Cifose Torácica Acentuada",
        severity: finding.severity
      });
    }

    if (finding.id === "anterior_pelvic_tilt") {
      annotations.push({
        region: "pelvis",
        position: { x: 50, y: 55 },
        label: "Anteversão Pélvica Provável",
        severity: finding.severity
      });
    }

    if (finding.id === "knee_valgus_tendency") {
      annotations.push({
        region: "knee",
        position: { x: 45, y: 72 }, // Pin no joelho esquerdo/centro
        label: "Valgo Dinâmico Lateral",
        severity: finding.severity
      });
    }
  });

  return annotations;
}
