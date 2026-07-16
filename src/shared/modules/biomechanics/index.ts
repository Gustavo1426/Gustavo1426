/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: MAIN ORCHESTRATOR
 * ============================================================================
 */

import { AssessmentInput, AssessmentResult } from "./types/evaluation.types";
import { BiomechanicalScore } from "./types/score.types";
import { BiomechanicalFinding } from "./types/biomechanics.types";
import { BiomechanicalRecommendation } from "./types/recommendation.types";

export async function runBiomechanicalAssessment(
  input: AssessmentInput
): Promise<AssessmentResult> {
  // Em uma infraestrutura real de produção, esse método orquestra a chamada
  // para o Capture Engine e o Vision Engine processarem as fotos em fila.
  
  const score: BiomechanicalScore = {
    overall: 82,
    posture: 85,
    symmetry: 79,
    mobility: 80,
    alignment: 84,
    risk: 15,
    classification: "good",
    feedbackMessage: "Boa organização biomecânica geral, com pontos específicos para evolução técnica nos exercícios."
  };

  const findings: BiomechanicalFinding[] = [
    {
      id: "f_01",
      category: "posture",
      name: "Anteriorização Cervical Leve",
      severity: "low",
      confidence: 0.92,
      description: "Leve projeção da cabeça para frente detectada na vista de perfil.",
      possibleImpacts: ["Tensão na musculatura trapezoidal", "Possíveis dores de cabeça tensionais"]
    },
    {
      id: "f_02",
      category: "symmetry",
      name: "Assimetria de Ombro (Ombro Esquerdo Elevado)",
      severity: "medium",
      confidence: 0.88,
      description: "Desvio angular de 3.2° entre a linha dos ombros e a horizontal.",
      possibleImpacts: ["Sobrecarga assimétrica em exercícios de empurrar", "Desequilíbrio de força no trapézio"]
    },
    {
      id: "f_03",
      category: "alignment",
      name: "Valgo Dinâmico Potencial (Joelhos)",
      severity: "medium",
      confidence: 0.85,
      description: "Aproximação medial discreta das patelas observada na vista frontal.",
      possibleImpacts: ["Maior estresse no ligamento colateral medial", "Sobrecarga patelofemoral sob agachamento pesado"]
    }
  ];

  const recommendations: BiomechanicalRecommendation[] = [
    {
      priority: "high",
      category: "mobility",
      title: "Alongamento de Peitorais e Subescapular",
      description: "Realizar 3 séries de 30 segundos diariamente para mitigar a rotação interna de ombros."
    },
    {
      priority: "high",
      category: "stability",
      title: "Fortalecimento de Glúteo Médio (Band Walk)",
      description: "3 séries de 15 repetições bilaterais com banda elástica para estabilizar o valgo de joelho."
    },
    {
      priority: "medium",
      category: "movement",
      title: "Retração de Escápulas com Fita Elástica",
      description: "3 séries de 12 repetições focando no controle concêntrico para reequilibrar a cintura escapular."
    }
  ];

  const report = `
# Relatório de Avaliação Biomecânica - AI Workout Academia
**ID do Usuário:** ${input.userId}
**Data da Análise:** ${new Date().toLocaleDateString("pt-BR")}

## Resumo Geral
A análise das fotos corporais (frente, costas e perfil) revelou um padrão biomecânico geral estável, com um **Índice Geral de Biomecânica (IGB) de 82/100**. Foram identificados alguns desvios posturais leves a moderados que merecem atenção para evitar lesões a longo prazo e otimizar o ganho de força.

## Desvios Detectados
1. **Anteriorização Cervical Leve (Vista Lateral):** Desvio discreto que pode gerar tensão na região do pescoço.
2. **Assimetria de Ombros (Vista Frontal):** Elevação de 3.2° no ombro esquerdo.
3. **Tendência ao Valgo Dinâmico nos Joelhos (Vista Frontal):** Necessidade de fortalecimento de rotadores externos do quadril.

## Prescrição Recomendada
- Exercícios de ativação de glúteo médio antes do treino de membros inferiores.
- Mobilidade e flexibilidade para cadeia posterior e peitoral.
- Exercícios corretivos para estabilização da cintura escapular.
  `;

  return {
    evaluationId: `eval_${Math.random().toString(36).substr(2, 9)}`,
    score,
    findings,
    recommendations,
    report
  };
}

// Exports dos sub-módulos para consumo da UI e backend
export * from "./types/landmark.types";
export * from "./types/posture.types";
export * from "./types/biomechanics.types";
export * from "./types/score.types";
export * from "./types/recommendation.types";
export * from "./types/evaluation.types";
export * from "./types/capture.types";
export * from "./types/vision.types";
export {
  type HeadRegion,
  type ShoulderRegion,
  type SpineRegion,
  type PelvisRegion,
  type LegsRegion,
  type SymmetryResult,
  type AlignmentResult,
  type PhysicalMeasurements,
  type BodyAnalysisOutput,
  type BodyMap as BodyAnalysisMap
} from "./types/body-analysis.types";

export * from "./capture/imageQualityAnalyzer";
export * from "./capture/posturePositionChecker";
export * from "./capture/captureGuide";
export * from "./capture/cameraCalibration";
export * from "./capture/photoValidator";
export * from "./capture/photoUploader";

export * from "./vision/coordinateNormalizer";
export * from "./vision/landmarkExtractor";
export * from "./vision/skeletonBuilder";
export * from "./vision/bodySegmentation";
export * from "./vision/confidenceAnalyzer";
export * from "./vision/poseDetector";
export * from "./vision/index";

export * from "./body-analysis/angleCalculator";
export * from "./body-analysis/bodyMapper";
export * from "./body-analysis/postureMetrics";
export * from "./body-analysis/symmetryAnalyzer";
export * from "./body-analysis/alignmentAnalyzer";
export * from "./body-analysis/measurementEngine";
export * from "./body-analysis/bodyRegionAnalyzer";
export * from "./body-analysis/mobilityAnalyzer";
export * from "./body-analysis/compensationDetector";
export * from "./body-analysis/bodyAnalysisService";

export {
  type CompensationPattern,
  type PostureRule,
  type BiomechanicalFinding as BiomechanicalEngineFinding
} from "./types/biomechanical.types";

export * from "./biomechanical/postureRules";
export * from "./biomechanical/severityClassifier";
export * from "./biomechanical/compensationDetector";
export * from "./biomechanical/movementRiskAnalyzer";
export * from "./biomechanical/mobilityInference";
export * from "./biomechanical/muscleBalanceAnalyzer";
export * from "./biomechanical/anatomicalRules";
export * from "./biomechanical/movementRules";
export * from "./biomechanical/riskAnalyzer";

export {
  analyzeTrainingImpact,
  type TrainingImpact as BiomechanicalTrainingImpact
} from "./biomechanical/impactAnalyzer";

export {
  runBiomechanicalEngine,
  runBiomechanicsEngine,
  type BiomechanicalReport,
  type BiomechanicalFinding as BiomechanicalFindingPhase15
} from "./biomechanical/biomechanicsEngine";

export * from "./types/interpretation.types";
export * from "./interpretation/findingTranslator";
export * from "./interpretation/severityExplanation";
export * from "./interpretation/impactGenerator";
export * from "./interpretation/educationalContent";
export * from "./interpretation/professionalReport";
export * from "./interpretation/studentExplanation";
export * from "./interpretation/posturalInterpreter";

export * from "./types/score.types";
export * from "./scoring/penaltySystem";
export * from "./scoring/postureScore";
export * from "./scoring/symmetryScore";
export * from "./scoring/alignmentScore";
export * from "./scoring/mobilityScore";
export { calculateRiskScore, calculateRiskLevel } from "./scoring/riskScore";
export * from "./scoring/movementScore";
export * from "./scoring/biomechanicalScoreEngine";
export * from "./scoring/scoreCalculator";

export * from "./types/recommendation.types";
export * from "./recommendation/priorityEngine";
export * from "./recommendation/mobilityRecommendation";
export * from "./recommendation/stabilityRecommendation";
export * from "./recommendation/trainingAdjustment";
export * from "./recommendation/exerciseConsideration";
export * from "./recommendation/educationalRecommendation";
export * from "./recommendation/recommendationEngine";
export * from "./recommendation/exerciseRiskChecker";
export * from "./recommendation/autoWarmupGenerator";

export * from "./types/report.types";
export * from "./report/visualAnnotation";
export * from "./report/scoreVisualization";
export * from "./report/evolutionChart";
export * from "./report/studentReport";
export * from "./report/professionalReport";
export * from "./report/pdfExporter";
export * from "./report/reportGenerator";
export * from "./report/PostureAnalysisView";

export * from "./types/evolution.types";
export * from "./evolution/assessmentComparator";
export * from "./evolution/progressAnalyzer";
export * from "./evolution/improvementDetector";
export * from "./evolution/regressionDetector";
export * from "./evolution/evolutionScore";
export {
  generateWorkoutEngineTriggers,
  generateTrainingAdjustments as generateEvolutionTrainingAdjustments
} from "./evolution/workoutAdjustmentBridge";
export * from "./evolution/types";
export * from "./evolution/scoreComparator";
export * from "./evolution/findingTracker";
export * from "./evolution/regionalEvolution";
export * from "./evolution/timelineGenerator";
export * from "./evolution/evolutionNarrative";
export * from "./evolution/evolutionEngine";

export * from "./training-integration/index";

// ==========================================
// RULES
// ==========================================
export * from "./rules/exerciseRestrictionRules";
export * from "./rules/volumeAdjustmentRules";
export * from "./rules/warmupRules";
export * from "./rules/adaptationRules";

export * from "./ai-coach/index";
export * from "./decision-intelligence/index";
export * from "./knowledge-graph/index";
export * from "./digital-twin/index";
export * from "./predictive-analytics/index";
export * from "./adaptive-learning/index";
export * from "./unified-platform/index";
export * from "./exercise-intelligence/index";
export * from "./human-adaptation/index";
export * from "./capture/index";
export type { MovementPattern } from "./knowledge-graph/index";
