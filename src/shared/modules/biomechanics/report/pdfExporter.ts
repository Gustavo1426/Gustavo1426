/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PDF EXPORTER CONFIG
 * ============================================================================
 */

import { FullBiomechanicalReport } from "../types/report.types";

/**
 * Interface estática de mapeamento para sistemas de geração de PDF (como pdfmake ou puppeteer).
 */
export function compileReportMetadata(report: FullBiomechanicalReport): any {
  return {
    documentTitle: `LAUDO_BIOMECANICO_${report.studentName.toUpperCase()}_${report.date.replace(/\//g, "-")}`,
    pageSetup: {
      pageSize: "A4",
      margins: [40, 60, 40, 60]
    },
    sections: {
      page1_summary: {
        title: "Resumo Biomecânico do Aluno",
        elements: ["scoreCard", "classificationTag", "headline"]
      },
      page2_bodyMap: {
        title: "Mapeamento Biomecânico e Anotações Visuais",
        elements: ["photoOverlayWithPins", "asymmetryTable"]
      },
      page3_analysis: {
        title: "Análise Técnica (Uso Exclusivo do Professor)",
        elements: ["findingsList", "confidenceIndicators", "coachingProtocols"]
      },
      page4_evolution: {
        title: "Linha de Evolução Histórica",
        elements: ["evolutionGraph", "progressSummary"]
      },
      page5_prescription: {
        title: "Estratégia Corretiva e Exercícios de Atenção",
        elements: ["mobilityProtocol", "stabilityProtocol", "exerciseTags"]
      }
    }
  };
}
