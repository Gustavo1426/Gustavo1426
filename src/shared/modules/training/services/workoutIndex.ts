/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IndexInput {
  cervicalAngle: number;
  scapularAngle: number;
  pelvicAngle: number;
  simetria: number;
  estabilidade: number;
  mobilidade: number;
}

export interface IndexResult {
  scoreFinal: number;
  riscoCompensatorio: "Baixo" | "Médio" | "Alto";
  subScores: {
    cervical: number;
    escapular: number;
    pelvico: number;
  };
}

/**
 * Calculates the Premium Workout Index Score (0-100) using a professional biomechanical formula:
 * (cervical * 0.20) + (scapular * 0.20) + (pelvic * 0.20) + (symmetry * 0.15) + (stability * 0.15) + (mobility * 0.10)
 */
export function gerarKPI(input: IndexInput): IndexResult {
  // Convert biomechanical deviations into normalized 0-100 sub-scores (where 100 is perfectly aligned)
  const cScore = Math.max(0, Math.min(100, 100 - (input.cervicalAngle * 7.5)));
  const eScore = Math.max(0, Math.min(100, 100 - (input.scapularAngle * 7.5)));
  const pScore = Math.max(0, Math.min(100, 100 - (input.pelvicAngle * 7.5)));
  
  const sim = input.simetria;
  const est = input.estabilidade;
  const mob = input.mobilidade;

  // Weighted formula
  const scoreFinal =
    (cScore * 0.20) +
    (eScore * 0.20) +
    (pScore * 0.20) +
    (sim * 0.15) +
    (est * 0.15) +
    (mob * 0.10);

  // Compensatory Risk category
  let riscoCompensatorio: "Baixo" | "Médio" | "Alto" = "Baixo";
  if (scoreFinal < 70) {
    riscoCompensatorio = "Alto";
  } else if (scoreFinal < 85) {
    riscoCompensatorio = "Médio";
  }

  return {
    scoreFinal: Math.round(scoreFinal),
    riscoCompensatorio,
    subScores: {
      cervical: Math.round(cScore),
      escapular: Math.round(eScore),
      pelvico: Math.round(pScore)
    }
  };
}
