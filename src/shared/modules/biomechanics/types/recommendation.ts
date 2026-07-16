export interface BiomechanicalRecommendation {
  type:
    | "exercise"
    | "mobility"
    | "warmup"
    | "restriction";

  title: string;
  description: string;
  priority:
    | "low"
    | "medium"
    | "high";

  relatedExercises: string[];
}
