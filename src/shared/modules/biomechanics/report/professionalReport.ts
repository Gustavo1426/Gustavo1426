/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PROFESSIONAL REPORT GENERATOR
 * ============================================================================
 */

import { BodyAnalysisOutput } from "../types/body-analysis.types";
import { BiomechanicalFinding } from "../types/biomechanical.types";
import { RecommendationEngineOutput } from "../types/recommendation.types";
import { ProfessionalReport } from "../types/report.types";

/**
 * Produz a versão de nível profissional, com diagnósticos precisos e guias de supervisão para o treinador.
 */
export function createProfessionalReport(
  findings: BiomechanicalFinding[],
  analysis: BodyAnalysisOutput,
  recommendations: RecommendationEngineOutput
): ProfessionalReport {
  
  const technicalFindings = findings.map(finding => {
    return {
      findingName: finding.name,
      confidence: finding.confidence,
      severity: finding.severity.toUpperCase(),
      technicalDescription: finding.description,
      coachingGuidelines: [
        ...finding.possibleImpacts,
        ...recommendations.trainingAdjustments.attentionPoints
      ]
    };
  });

  const structuralAsymmetries: string[] = [];
  if (analysis.symmetry.shoulderAsymmetryMm > 5) {
    structuralAsymmetries.push(`Assimetria escapular/ombro estimada em: ${analysis.symmetry.shoulderAsymmetryMm}mm.`);
  }
  if (analysis.symmetry.pelvicAsymmetryMm > 5) {
    structuralAsymmetries.push(`Diferença no nivelamento da linha pélvica estimada em: ${analysis.symmetry.pelvicAsymmetryMm}mm.`);
  }

  return {
    technicalFindings,
    structuralAsymmetries
  };
}
