/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: MUSCLE BALANCE ANALYZER
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";

/**
 * Compila uma lista holística de agrupamentos musculares hiperativos (alongar) e inibidos (fortalecer).
 */
export function analyzeMuscleBalances(findings: BiomechanicalFinding[]): { areasToStrengthen: string[]; areasToRelease: string[] } {
  const strengthenSet = new Set<string>();
  const releaseSet = new Set<string>();

  findings.forEach(f => {
    f.suggestedMusclesToTarget.strengthen.forEach(m => strengthenSet.add(m));
    f.suggestedMusclesToTarget.release.forEach(m => releaseSet.add(m));
  });

  return {
    areasToStrengthen: Array.from(strengthenSet),
    areasToRelease: Array.from(releaseSet)
  };
}
