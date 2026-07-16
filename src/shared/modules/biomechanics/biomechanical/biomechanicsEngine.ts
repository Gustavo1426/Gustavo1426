/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: BIOMECHANICAL CORE ENGINE
 * ============================================================================
 */

import { BodyAnalysisOutput } from "../types/body-analysis.types";
import { BiomechanicalFinding, CompensationPattern } from "../types/biomechanical.types";
import { BiomechanicalRulesDatabase } from "./postureRules";
import { classifySeverity } from "./severityClassifier";
import { detectCompensations } from "./compensationDetector";
import { inferMobilityRestrictions } from "./mobilityInference";
import { analyzeMuscleBalances } from "./muscleBalanceAnalyzer";
import { analyzeMovementRisks } from "./movementRiskAnalyzer";

/**
 * Orquestrador central do Biomechanical Engine.
 * Converte as medições quantitativas do corpo em achados qualitativos aplicados à saúde e musculação.
 */
export async function runBiomechanicalEngine(
  bodyAnalysis: BodyAnalysisOutput
): Promise<{
  findings: BiomechanicalFinding[];
  compensations: CompensationPattern[];
  mobilityInferences: { joint: string; restrictionProbability: number }[];
  muscleBalances: { areasToStrengthen: string[]; areasToRelease: string[] };
  generalRisks: { movement: string; attention: string }[];
}> {
  
  const findings: BiomechanicalFinding[] = [];

  // 1. Varre o banco de regras estáticas e dispara os achados baseados nos limites
  BiomechanicalRulesDatabase.forEach(rule => {
    const { triggered, confidence } = rule.conditions(bodyAnalysis);

    if (triggered) {
      findings.push({
        id: rule.id,
        name: rule.name,
        category: rule.category,
        severity: classifySeverity(confidence),
        confidence,
        description: rule.description,
        possibleImpacts: rule.impacts,
        suggestedMusclesToTarget: {
          strengthen: rule.strengthen,
          release: rule.release
        },
        riskyMovements: rule.riskyMovements
      });
    }
  });

  // 2. Detecta compensações de cadeias sinérgicas cruzadas
  const compensations = detectCompensations(findings);

  // 3. Executa inferência de rigidez / mobilidade provável
  const mobilityInferences = inferMobilityRestrictions(bodyAnalysis.bodyMap);

  // 4. Consolida desequilíbrios cinéticos musculares globais
  const muscleBalances = analyzeMuscleBalances(findings);

  // 5. Compila os exercícios de musculação de maior risco técnico para o aluno
  const generalRisks = analyzeMovementRisks(findings);

  return {
    findings,
    compensations,
    mobilityInferences,
    muscleBalances,
    generalRisks
  };
}
