/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EVALUATION TYPES
 * ============================================================================
 */

import { EvaluationPhoto } from "./posture.types";
import { BodyMap, BiomechanicalFinding } from "./biomechanics.types";
import { BiomechanicalScore } from "./score.types";
import { BiomechanicalRecommendation } from "./recommendation.types";

export interface BiomechanicalEvaluation {
  id: string;
  userId: string;
  createdAt: string;
  status: "processing" | "completed" | "failed";
  photos: EvaluationPhoto[];
  bodyMap: BodyMap;
  findings: BiomechanicalFinding[];
  score: BiomechanicalScore;
  recommendations: BiomechanicalRecommendation[];
  reportId?: string;
}

export interface AssessmentInput {
  userId: string;
  photos: {
    front: string; // Base64 ou URL pública temporária
    side: string;
    back: string;
  };
}

export interface AssessmentResult {
  evaluationId: string;
  score: BiomechanicalScore;
  findings: BiomechanicalFinding[];
  recommendations: BiomechanicalRecommendation[];
  report: string; // Markdown, HTML ou URL do PDF gerado
}
