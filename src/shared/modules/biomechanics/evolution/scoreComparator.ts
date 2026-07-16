/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.8: EVOLUTION ENGINE (V2) - SCORE COMPARATOR
 * ============================================================================
 */

import { ScoreHistory } from "./types";

export interface ScoreComparison {
  metric: "globalScore" | "postureScore" | "mobilityScore" | "symmetryScore";
  before: number;
  after: number;
  delta: number;
  status: "improved" | "stable" | "worse";
}

/**
 * Compara as notas principais entre o estado anterior e atual.
 */
export function compareMainScores(before: ScoreHistory, after: ScoreHistory): ScoreComparison[] {
  const metrics: ("globalScore" | "postureScore" | "mobilityScore" | "symmetryScore")[] = [
    "globalScore",
    "postureScore",
    "mobilityScore",
    "symmetryScore"
  ];

  return metrics.map(metric => {
    const valBefore = before[metric];
    const valAfter = after[metric];
    const delta = valAfter - valBefore;

    let status: "improved" | "stable" | "worse" = "stable";
    if (delta >= 3) status = "improved";
    else if (delta <= -3) status = "worse";

    return {
      metric,
      before: valBefore,
      after: valAfter,
      delta,
      status
    };
  });
}
