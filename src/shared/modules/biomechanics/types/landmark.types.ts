/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: LANDMARK TYPES
 * ============================================================================
 */

export type LandmarkName =
  | "nose" | "left_eye" | "right_eye" | "left_ear" | "right_ear"
  | "left_shoulder" | "right_shoulder" | "left_elbow" | "right_elbow" | "left_wrist" | "right_wrist"
  | "left_hip" | "right_hip" | "left_knee" | "right_knee"
  | "left_ankle" | "right_ankle" | "left_heel" | "right_heel" | "left_foot" | "right_foot";

export interface RawLandmark {
  name: string; // Nome bruto vindo da SDK (MediaPipe)
  x: number;    // Pixel absoluto ou float relativo [0, 1]
  y: number;
  z?: number;
  visibility?: number;
}

export interface Landmark {
  id: string;
  name: LandmarkName;
  x: number;          // Coordenada Normalizada (0 a 100)
  y: number;          // Coordenada Normalizada (0 a 100)
  z: number;          // Profundidade estimada em escala espacial
  visibility: number; // Visibilidade do ponto (0.0 a 1.0)
  confidence: number; // Confiança do detector (0.0 a 1.0)
}
