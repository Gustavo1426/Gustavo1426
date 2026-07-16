/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.4: PREDICTIVE ANALYTICS ENGINE - TYPES
 * ============================================================================
 */

import { DigitalTwin } from "../digital-twin/types";

// We can use the actual DigitalTwin instead of a mock, but we also support the mock shape
export interface DigitalTwinMock {
  recovery: { chronicFatigue: number; fatigueDecayRate: number };
  performance: { estimatedMRV: number; historyOfPlateaus: number; strengthTrend: string };
  behavior: { adherenceScore: number; engagementPhase: string };
}

export interface FatigueForecast {
  predictedFatigueIn7Days: number;
  predictedFatigueIn14Days: number;
  timeToCriticalFatigueDays: number | null; // Nulo se a tendência for de queda
}

export interface PlateauPrediction {
  plateauProbability: number; // 0.0 a 1.0
  estimatedWeeksUntilPlateau: number;
  primaryRiskFactor: string;
}

export interface VolumeResponseSimulation {
  proposedDeltaSets: number;
  predictedBenefit: "high" | "marginal" | "negative";
  predictedFatigueSpike: number;
}

export interface ChurnPrediction {
  churnRiskScore: number; // 0 a 100
  riskCategory: "safe" | "monitor" | "critical";
  cxmActionRecommended: string;
}

export interface MesocycleTransition {
  action: "continue_current" | "initiate_deload" | "transition_phase";
  recommendedNextPhase: "hypertrophy" | "strength" | "metabolic" | "resensitization" | null;
  justification: string;
}

export interface PredictiveReport {
  timestamp: string;
  fatigueForecast: FatigueForecast;
  plateauPrediction: PlateauPrediction;
  retentionPrediction: ChurnPrediction;
  mesocycleDecision: MesocycleTransition;
}
