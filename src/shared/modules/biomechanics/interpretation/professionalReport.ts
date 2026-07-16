/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PROFESSIONAL REPORT GENERATOR
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { translateFinding } from "./findingTranslator";

/**
 * Gera as notas exclusivas para visualização do Treinador/Personal.
 */
export function generateProfessionalNotes(finding: BiomechanicalFinding): {
  analysis: string;
  considerations: string[];
} {
  const nameProf = translateFinding(finding.id, "professional");
  
  return {
    analysis: `Padrão compatível com alteração no posicionamento e dinâmica da região: ${nameProf}.`,
    considerations: [
      `Acompanhar com atenção redobrada a técnica em exercícios multiarticulares de carga livre.`,
      `Observar o controle motor nas fases excêntricas do movimento.`,
      `Avaliar a evolução cinemática deste padrão nas próximas reavaliações estruturais.`
    ]
  };
}
