/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.8: EVOLUTION ENGINE (V2) - FINDING TRACKER
 * ============================================================================
 */

import { FindingHistory, ClinicalEvolution } from "./types";

/**
 * Rastrea a evolução clínica comparando achados antigos com novos.
 */
export function trackClinicalFindings(
  oldFindings: FindingHistory[],
  newFindings: FindingHistory[]
): ClinicalEvolution {
  const oldIds = oldFindings.map(f => f.ruleId);
  const newIds = newFindings.map(f => f.ruleId);

  return {
    resolvedIssues: oldFindings.filter(f => !newIds.includes(f.ruleId)),
    newIssues: newFindings.filter(f => !oldIds.includes(f.ruleId)),
    persistentIssues: newFindings.filter(f => oldIds.includes(f.ruleId))
  };
}
