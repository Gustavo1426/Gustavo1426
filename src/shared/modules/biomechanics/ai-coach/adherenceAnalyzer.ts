/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: ADHERENCE ANALYZER
 * ============================================================================
 */

import { AdherenceMetrics } from "../types/aiCoach.types";

/**
 * Calcula a taxa de adesão do aluno e identifica tendências de abandono (Churn).
 */
export function analyzeAdherence(planned: number, completed: number): AdherenceMetrics {
  const percentage = planned > 0 ? Math.round((completed / planned) * 100) : 0;
  
  let trend: "improving" | "stable" | "dropping" = "stable";
  if (percentage < 60) trend = "dropping";
  else if (percentage >= 85) trend = "improving";

  return {
    plannedWorkouts: planned,
    completedWorkouts: completed,
    adherencePercentage: percentage,
    trend
  };
}
