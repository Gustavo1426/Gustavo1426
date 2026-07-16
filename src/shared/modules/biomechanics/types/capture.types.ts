/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: CAPTURE TYPES
 * ============================================================================
 */

export type BodyView = "front" | "side" | "back";

export interface PhotoInput {
  id: string;
  userId: string;
  imageUrl: string; // Base64 ou URL local/remota
  view: BodyView;
  createdAt: string;
}

export interface PhotoValidationResult {
  approved: boolean;
  confidence: number;
  view: BodyView;
  errors: string[];
  warnings: string[];
  metrics: {
    bodyDetected: boolean;
    fullBodyVisible: boolean;
    lightingScore: number;
    angleScore: number;
    distanceScore: number;
  };
}

export interface BodyDetectionResult {
  valid: boolean;
  fullBody: boolean;
  confidence: number;
  errors: string[];
}

export interface QualityAnalysisResult {
  score: number;
  sharpness: number;
  lighting: number;
  resolution: {
    width: number;
    height: number;
    valid: boolean;
  };
  errors: string[];
  warnings: string[];
}

export interface PositionCheckResult {
  valid: boolean;
  angle: number;
  distance: number;
  errors: string[];
}

export interface CaptureInstruction {
  message: string;
  status: "correct" | "adjust";
  action?: string;
}

export interface CameraCalibrationData {
  verticalAngle: number;
  distance: number;
  perspectiveCorrectionMatrix: number[][]; // Matriz 3x3 para homografia/correção de perspectiva
}
