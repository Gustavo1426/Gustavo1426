/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.8: EVOLUTION ENGINE (V2) - REGIONAL EVOLUTION
 * ============================================================================
 */

import { RegionalScore, RegionalEvolution } from "./types";

/**
 * Compara scores regionais isolados e retorna a evolução com deltas e classificações.
 */
export function compareRegionalScores(
  oldRegional: RegionalScore,
  newRegional: RegionalScore
): RegionalEvolution[] {
  const regions: (keyof RegionalScore)[] = ["shoulder", "spine", "hip", "knee", "ankle"];
  return regions.map(region => {
    const before = oldRegional[region] ?? 100;
    const after = newRegional[region] ?? 100;
    const delta = after - before;
    
    let status: RegionalEvolution["status"] = "stable";
    if (delta >= 5) status = "improved";
    else if (delta <= -5) status = "worse";

    return { region, before, after, delta, status };
  });
}
