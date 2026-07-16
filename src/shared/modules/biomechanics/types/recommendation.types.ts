/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: RECOMMENDATION TYPES
 * ============================================================================
 */

export type RecommendationPriority = "high" | "medium" | "low";
export type RecommendationCategory = "mobility" | "stability" | "movement" | "education";

export interface BiomechanicalRecommendation {
  priority: RecommendationPriority;
  category: RecommendationCategory;
  title: string;
  description: string;
}

export interface PriorityItem {
  area: string;
  level: RecommendationPriority;
  score: number; // Score de prioridade calculado internamente (ponderado)
}

export interface TrainingAdjustment {
  attentionPoints: string[];
  volumeAdjustments: string[];
  executionTips: string[];
}

export interface ExerciseTagBlock {
  affectedExercises: string[];
  tags: string[];
  monitoringDirectives: string[];
}

export interface RecommendationEngineOutput {
  priorities: PriorityItem[];
  mobilityRecommendations: BiomechanicalRecommendation[];
  stabilityRecommendations: BiomechanicalRecommendation[];
  trainingAdjustments: TrainingAdjustment;
  exerciseConsiderations: ExerciseTagBlock[];
  educationalNotes: {
    studentMessage: string;
    coachMessage: string;
  };
}
