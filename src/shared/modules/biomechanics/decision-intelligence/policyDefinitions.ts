/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: POLICY DEFINITIONS
 * ============================================================================
 */

import { GoalPolicyType, TrainingPolicy } from "../types/decision.types";

export const Policies: Record<GoalPolicyType, TrainingPolicy> = {
  HypertrophyPolicy: {
    id: "HypertrophyPolicy",
    maxFatigueTolerance: 80, // Tolera mais fadiga para gerar adaptação
    minAdherenceRequiredForProgression: 80,
    reassessmentFrequencyDays: 90,
    priorityHierarchy: ["safety", "recovery", "biomechanics", "hypertrophy", "performance"]
  },
  RehabilitationPolicy: {
    id: "RehabilitationPolicy",
    maxFatigueTolerance: 40, // Baixa tolerância à fadiga para proteger articulações
    minAdherenceRequiredForProgression: 90,
    reassessmentFrequencyDays: 30,
    priorityHierarchy: ["safety", "biomechanics", "recovery", "performance", "hypertrophy"]
  },
  FatLossPolicy: {
    id: "FatLossPolicy",
    maxFatigueTolerance: 75,
    minAdherenceRequiredForProgression: 75,
    reassessmentFrequencyDays: 60,
    priorityHierarchy: ["safety", "recovery", "performance", "biomechanics", "hypertrophy"]
  },
  BeginnerPolicy: {
    id: "BeginnerPolicy",
    maxFatigueTolerance: 50,
    minAdherenceRequiredForProgression: 70,
    reassessmentFrequencyDays: 45,
    priorityHierarchy: ["safety", "biomechanics", "hypertrophy", "performance", "recovery"]
  }
};
