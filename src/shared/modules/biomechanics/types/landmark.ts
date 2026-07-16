export interface LandmarkPoint {
  name: string;
  x: number;
  y: number;
  z?: number;
  confidence: number;
}

export interface BodyLandmarks {
  points: LandmarkPoint[];
  modelVersion: string;
  confidence: number;
}
