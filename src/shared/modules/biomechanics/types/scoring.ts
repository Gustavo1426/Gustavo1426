export interface BiomechanicalScore {
  globalScore: number;
  postureScore: number;
  mobilityScore: number;
  symmetryScore: number;
  movementScore: number;
  riskLevel:
    | "low"
    | "medium"
    | "high";
}
