/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: BIOMECHANICAL CORE ENGINE
 * ============================================================================
 */

import { BodyAnalysisOutput as OldBodyAnalysisOutput } from "../types/body-analysis.types";
import { BiomechanicalFinding as OldBiomechanicalFinding, CompensationPattern } from "../types/biomechanical.types";
import { BiomechanicalRulesDatabase } from "./postureRules";
import { classifySeverity } from "./severityClassifier";
import { detectCompensations } from "./compensationDetector";
import { inferMobilityRestrictions } from "./mobilityInference";
import { analyzeMuscleBalances } from "./muscleBalanceAnalyzer";
import { analyzeMovementRisks } from "./movementRiskAnalyzer";

import { BodyAnalysisOutput as Phase14BodyAnalysisOutput } from "../body-analysis/bodyAnalysisService";
import { anatomicalRules, RiskLevel } from "./anatomicalRules";
import { analyzeRisk } from "./riskAnalyzer";
import { analyzeTrainingImpact, TrainingImpact } from "./impactAnalyzer";

/**
 * Orquestrador central do Biomechanical Engine (Legado).
 * Converte as medições quantitativas do corpo em achados qualitativos aplicados à saúde e musculação.
 */
export async function runBiomechanicalEngine(
  bodyAnalysis: OldBodyAnalysisOutput
): Promise<{
  findings: OldBiomechanicalFinding[];
  compensations: CompensationPattern[];
  mobilityInferences: { joint: string; restrictionProbability: number }[];
  muscleBalances: { areasToStrengthen: string[]; areasToRelease: string[] };
  generalRisks: { movement: string; attention: string }[];
}> {
  
  const findings: OldBiomechanicalFinding[] = [];

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

// ==========================================
// PHASE 1.5: NEW BIOMECHANICAL ENGINE
// ==========================================

export interface BiomechanicalFinding {
  ruleId: string;
  interpretation: string;
  severity: RiskLevel;
}

export interface BiomechanicalReport {
  overallRisk: RiskLevel;
  findings: BiomechanicalFinding[];
  trainingImpacts: TrainingImpact[];
  rawAnalysisCount: number; // Métrica para telemetria
}

/**
 * Motor central da Fase 1.5. Recebe o mapa corporal (Fase 1.4) 
 * e traduz para linguagem clínica e de treinamento.
 */
export function runBiomechanicsEngine(analysis: Phase14BodyAnalysisOutput): BiomechanicalReport {
  // 1. Filtra quais regras anatômicas foram ativadas pelos dados do aluno
  const triggeredRules = anatomicalRules.filter(rule => rule.condition(analysis));

  // 2. Mapeia as regras ativadas para o formato de Achados (Findings)
  const findings: BiomechanicalFinding[] = triggeredRules.map(rule => ({
    ruleId: rule.id,
    interpretation: rule.interpretation,
    severity: rule.severity
  }));

  // 3. Calcula o Nível de Risco Global
  const overallRisk = analyzeRisk(triggeredRules);

  // 4. Gera os Impactos Práticos no Treinamento
  const trainingImpacts = analyzeTrainingImpact(triggeredRules);

  return {
    overallRisk,
    findings,
    trainingImpacts,
    rawAnalysisCount: triggeredRules.length
  };
}
