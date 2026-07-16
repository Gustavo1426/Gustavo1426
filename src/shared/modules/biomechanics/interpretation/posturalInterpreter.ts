/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: CORE INTERPRETATION ENGINE
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { InterpretationResult } from "../types/interpretation.types";
import { getStudentGeneralOverview } from "./studentExplanation";
import { translateFinding } from "./findingTranslator";
import { generateEducationalContent } from "./educationalContent";
import { getSeverityExplanation } from "./severityExplanation";
import { generatePossibleImpacts } from "./impactGenerator";
import { generateProfessionalNotes } from "./professionalReport";

/**
 * Orquestrador central do Interpretation Engine.
 * Traduz a lista de achados biomecânicos frios em um relatório inteligente e dual-channel (Aluno e Professor).
 */
export function runInterpretationEngine(
  findings: BiomechanicalFinding[],
  overallScore: number
): {
  studentOverview: string;
  interpretations: InterpretationResult[];
} {
  
  // 1. Gera a introdução para o Aluno baseada em seu IGB atual
  const studentOverview = getStudentGeneralOverview(overallScore);

  // 2. Processa e traduz cada achado biomecânico
  const interpretations = findings.map((finding): InterpretationResult => {
    const title = translateFinding(finding.id, "professional");
    const technicalExplanation = finding.description;
    const studentExplanation = generateEducationalContent(finding.id);
    const severityDescription = getSeverityExplanation(finding.severity);
    const possibleImpacts = generatePossibleImpacts(finding.id);
    const professionalNotes = generateProfessionalNotes(finding);

    return {
      findingId: finding.id,
      title,
      category: finding.category,
      severity: finding.severity,
      severityDescription,
      technicalExplanation,
      studentExplanation,
      professionalNotes,
      possibleImpacts
    };
  });

  return {
    studentOverview,
    interpretations
  };
}
