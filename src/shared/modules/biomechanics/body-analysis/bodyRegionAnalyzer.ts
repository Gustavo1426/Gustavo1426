/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: BODY ANALYSIS CORE ENGINE
 * ============================================================================
 */

import { Landmark } from "../types/landmark.types";
import { BodyAnalysisOutput } from "../types/body-analysis.types";
import { calculatePostureMetrics } from "./postureMetrics";
import { analyzeSymmetry } from "./symmetryAnalyzer";
import { analyzeAlignment } from "./alignmentAnalyzer";
import { calculatePhysicalMeasurements } from "./measurementEngine";

/**
 * Orquestrador central do Body Analysis Engine.
 * Executa toda a modelagem matemática e estrutural de simetria sobre os landmarks corporais.
 */
export async function runBodyAnalysisEngine(
  landmarks: Landmark[],
  view: "front" | "side" | "back"
): Promise<BodyAnalysisOutput> {
  
  if (!landmarks || landmarks.length === 0) {
    throw new Error("Não foi possível realizar o mapeamento corporal: lista de landmarks vazia.");
  }

  // 1. Extrai as métricas e ângulos articulares específicos
  const bodyMap = calculatePostureMetrics(landmarks, view);

  // 2. Processa o balanço de simetria bilateral
  const symmetry = analyzeSymmetry(landmarks);

  // 3. Avalia o alinhamento das linhas de força corporal de gravidade
  const alignment = analyzeAlignment(landmarks, view);

  // 4. Calcula distâncias e larguras estruturais do frame humano
  const measurements = calculatePhysicalMeasurements(landmarks);

  return {
    bodyMap,
    symmetry,
    alignment,
    measurements
  };
}
