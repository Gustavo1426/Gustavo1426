import { BiomechanicalImage } from "./image";
import { BodyLandmarks } from "./landmark";
import { PosturalAnalysis } from "./posture";
import { MovementAnalysis } from "./movement";
import { BiomechanicalScore } from "./scoring";
import { BiomechanicalRecommendation } from "./recommendation";

export interface BiomechanicalAssessment {
  id: string;
  studentId: string;
  images: BiomechanicalImage[];
  landmarks: BodyLandmarks;
  posture: PosturalAnalysis;
  movements: MovementAnalysis[];
  score: BiomechanicalScore;
  recommendations: BiomechanicalRecommendation[];
  aiConfidence: number;
  createdAt: Date;
  version: string;
}
