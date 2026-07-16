/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: VISION TYPES
 * ============================================================================
 */

import { Landmark, RawLandmark, LandmarkName } from "./landmark.types";

export interface SkeletonJointRelation {
  from: LandmarkName;
  to: LandmarkName;
  distance: number; // Distância euclidiana normalizada entre as duas articulações
}

export interface SkeletonSegment {
  name: string;
  joints: LandmarkName[];
  relations: SkeletonJointRelation[];
}

export interface BodySkeleton {
  head: SkeletonSegment;
  upperBody: SkeletonSegment;
  lowerBody: SkeletonSegment;
  shoulderLine: {
    angle: number; // Inclinação da linha dos ombros em relação à horizontal
  };
  pelvisLine: {
    angle: number; // Inclinação da linha da pelve em relação à horizontal
  };
}

export interface PoseInput {
  imageUrl: string;
  view: "front" | "side" | "back";
}

export interface PoseDetectionResult {
  detected: boolean;
  landmarks: RawLandmark[];
  confidence: number;
}

export interface SegmentationMask {
  width: number;
  height: number;
  data: Float32Array; // Máscara de pixels contendo a silhueta (1 para corpo, 0 para fundo)
}

export interface VisionAnalysis {
  photoId: string;
  poseDetected: boolean;
  overallConfidence: number;
  landmarks: Landmark[];
  skeleton: BodySkeleton;
}
