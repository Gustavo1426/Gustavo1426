/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EXERCISE CONSIDERATION ENGINE
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { ExerciseTagBlock } from "../types/recommendation.types";

/**
 * Cria conexões diretas entre exercícios de força específicos e as restrições biomecânicas (tags).
 */
export function generateExerciseConsiderations(findings: BiomechanicalFinding[]): ExerciseTagBlock[] {
  const considerationBlocks: ExerciseTagBlock[] = [];

  findings.forEach(finding => {
    if (finding.id === "shoulder_anteriorization") {
      considerationBlocks.push({
        affectedExercises: ["Supino Reto com Barra", "Desenvolvimento Halteres", "Elevação Frontal"],
        tags: ["push", "anterior_chain", "shoulder_demand"],
        monitoringDirectives: [
          "Evitar a extensão completa do cotovelo para não perder o encaixe escapular.",
          "Reduzir amplitude final de descida se houver desconforto na parte anterior do ombro."
        ]
      });
    }

    if (finding.id === "knee_valgus_tendency") {
      considerationBlocks.push({
        affectedExercises: ["Agachamento Livre", "Afundo com Halteres", "Leg Press 45°"],
        tags: ["quads_dominant", "knee_shear", "lower_body"],
        monitoringDirectives: [
          "Acompanhar visualmente a trajetória patelar para impedir o desalinhamento medial.",
          "Utilizar uma mini-band acima dos joelhos no agachamento como feedback tátil corretivo."
        ]
      });
    }
  });

  return considerationBlocks;
}
