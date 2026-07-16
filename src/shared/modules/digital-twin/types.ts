/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.3: DIGITAL TWIN ENGINE (FINAL ARCHITECTURE) - TYPES
 * ============================================================================
 */

export interface BiomechanicalProfile {
  currentIgb: number;
  igbHistory: number[];
  movementQualityScore: number;                 // NOVO: Nota de execução técnica
  mobilityTrend: "improving" | "stable" | "declining"; // NOVO: Tendência de evolução
  persistentRestrictions: string[];
  resolvedRestrictions: string[];
  lastAssessmentDate: string;
}

export interface ExerciseResponse {
  exercise: string;
  response: "excellent" | "good" | "poor";
  painResponse: number;                         // 0 (Sem dor) a 10 (Dor aguda)
  performanceGain: number;                      // Taxa de evolução no exercício
}

export interface PerformanceProfile {
  volumeTolerance: "low" | "medium" | "high";
  estimatedMRV: number;                         // Maximum Recoverable Volume
  strengthTrend: "improving" | "plateau" | "declining";
  preferredRepRange: string;
  historyOfPlateaus: number;
  exerciseResponses: Record<string, ExerciseResponse>; // NOVO: Mapeamento por exercício
}

export interface RecoveryProfile {
  chronicFatigue: number;
  baselineSleepQuality: number;
  fatigueDecayRate: number;                     // Quão rápido ele recupera
  averageRecoveryDays: number;                  // NOVO: Dias médios para curar DOMS
  sleepSensitivity: number;                     // NOVO: 0 a 10 (Impacto de dormir mal)
  stressSensitivity: number;                    // NOVO: 0 a 10 (Impacto do estresse)
  injuryRiskScore: number;
}

export interface BehavioralProfile {
  adherenceScore: number;
  feedbackSentiment: number;
  preferredExerciseTags: string[];
  dislikedExerciseTags: string[];
  engagementPhase: "onboarding" | "engaged" | "at_risk" | "churned";
  communicationPreference: "whatsapp" | "app" | "in_person"; // NOVO: CXM Direcionado
  motivationTrigger: "performance" | "health" | "appearance" | "challenge"; // NOVO: Gatilho AI Coach
}

export interface TwinReliability {
  trainingSessionsAnalyzed: number;             // NOVO: Maturidade de dados
  monthsTracked: number;
  confidenceScore: number;                      // 0 a 100 (O quanto a IA "conhece" o aluno)
}

export interface DigitalTwin {
  studentId: string;
  lastUpdated: string;
  reliability: TwinReliability;                 // NOVO: Motor de Confiança
  biomechanics: BiomechanicalProfile;
  performance: PerformanceProfile;
  recovery: RecoveryProfile;
  behavior: BehavioralProfile;
}

export interface WorkoutResultPayload {
  effectiveVolume: number;                      // NOVO: Cruzamento de Séries x Tensão
  averageRpe: number;                           // Rate of Perceived Exertion
  averageRir: number;                           // NOVO: Repetições na Reserva Médias
  mechanicalTension: number;                    // NOVO: Carga Real Absoluta
  metabolicStress: number;                      // NOVO: Baseado em tempo sob tensão/reps
  skippedExercises: string[];
  feedbackFeeling: "better" | "same" | "worse";
}

export interface TwinInsight {
  category: "warning" | "opportunity" | "achievement";
  message: string;
}
