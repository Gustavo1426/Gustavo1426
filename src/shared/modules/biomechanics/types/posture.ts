export interface Asymmetry {
  region:
    | "shoulder"
    | "hip"
    | "knee"
    | "foot"
    | "spine";

  side:
    | "left"
    | "right"
    | "bilateral";

  severity:
    | "low"
    | "medium"
    | "high";

  confidence: number;
}

export interface PosturalAnalysis {
  shoulderAlignment: number;
  pelvicAlignment: number;
  spinalAlignment: number;
  kneeAlignment: number;
  footAlignment: number;

  asymmetries: Asymmetry[];
  observations: string[];
}
