/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.5.1: DECISION MEMORY ENGINE - TYPES
 * ============================================================================
 */

export type DecisionAction = 
  | "INCREASE_VOLUME" 
  | "DECREASE_VOLUME" 
  | "MAINTAIN" 
  | "DELOAD" 
  | "CHANGE_EXERCISES" 
  | "REQUEST_ASSESSMENT" 
  | string;

export type DecisionCategory = 
  | "safety" 
  | "biomechanics" 
  | "recovery" 
  | "performance" 
  | "hypertrophy" 
  | string;

export interface IntelligenceDecision {
  action: DecisionAction;
  confidence: number;
  reason: string;
  category: DecisionCategory;
}
