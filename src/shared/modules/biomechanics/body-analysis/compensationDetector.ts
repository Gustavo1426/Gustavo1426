/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: COMPENSATION DETECTOR
 * ============================================================================
 */

import { BiomechanicalAlignmentResult } from "./alignmentAnalyzer";
import { MobilityResult } from "./mobilityAnalyzer";

export interface Compensation {
  movement: string;
  finding: string;
  possibleCause: string;
}

/**
 * Cruza dados de alinhamento e mobilidade para gerar insights clínicos.
 */
export function detectBodyCompensations(
  alignment: BiomechanicalAlignmentResult[],
  mobility: MobilityResult[]
): Compensation[] {
  const compensations: Compensation[] = [];

  // Exemplo de regra clínica da base de conhecimento
  const ankleMobility = mobility.find(m => m.joint === "ankle");
  
  if (ankleMobility && (ankleMobility.restriction === "high" || ankleMobility.restriction === "moderate")) {
    compensations.push({
      movement: "squat",
      finding: "Inclinação excessiva do tronco à frente ou elevação do calcanhar",
      possibleCause: "Limitação na dorsiflexão do tornozelo"
    });
  }

  const shoulderAlignment = alignment.find(a => a.region === "shoulders");
  if (shoulderAlignment && shoulderAlignment.status !== "normal") {
    compensations.push({
      movement: "upper_body_push_pull",
      finding: "Assimetria na ativação da cintura escapular",
      possibleCause: "Desnível dos ombros (possível encurtamento de trapézio superior unilateral)"
    });
  }

  return compensations;
}
