/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PREDICTION TYPES
 * ============================================================================
 */

import { DigitalTwin } from "./digitalTwin.types";

export interface PredictionContext {
  digitalTwin: DigitalTwin; // Instância do Gêmeo Digital (Etapa 15)
  workoutHistory: any[]; // Últimos 30 treinos
  performanceHistory: { date: string; prs: Record<string, number>; volume: number }[];
  adherenceHistory: { date: string; adherence: number }[];
}

export interface PredictionResult<T> {
  prediction: T;
  confidence: number; // 0 a 100
  modelUsed: "heuristic" | "linear_regression" | "ensemble";
}

export interface RiskPrediction {
  injuryAttention: number; // 0 a 100%
  dropout: number;
  overtraining: number;
  plateau: number;
}

export interface ProgressionPrediction {
  expectedPrs30Days: Record<string, number>;
  expectedPrs60Days: Record<string, number>;
}

export interface FatiguePrediction {
  fatigueNextWeek: number; // 0 a 100
  readinessTomorrow: number; // 0 a 100
}

export interface MesocyclePrediction {
  recommendTransition: boolean;
  reason: string;
}

export interface TimelinePrediction {
  goalCompletionProbability: number;
  estimatedDate: string;
}

export interface RecommendationPrediction {
  action: string;
  trigger: string;
}

export interface PredictionAuditLog {
  date: string;
  predictionType: string;
  confidence: number;
  result: any;
  status: "pending" | "confirmed" | "failed";
}

export interface PredictiveEngineOutput {
  risks: PredictionResult<RiskPrediction>;
  progression: PredictionResult<ProgressionPrediction>;
  fatigue: PredictionResult<FatiguePrediction>;
  biomechanics: PredictionResult<{ expectedIGB: number }>;
  mesocycle: PredictionResult<MesocyclePrediction>;
  timeline: PredictionResult<TimelinePrediction>;
  recommendations: RecommendationPrediction[];
}
