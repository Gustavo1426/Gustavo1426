/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: IMAGE QUALITY ANALYZER
 * ============================================================================
 */

import { PhotoInput, QualityAnalysisResult } from "../types/capture.types";

/**
 * Analisa aspectos de nitidez, contraste, iluminação e resolução da imagem.
 */
export async function analyzeImageQuality(photo: PhotoInput): Promise<QualityAnalysisResult> {
  // Simulando processamento de imagem de entrada
  const sharpness = 85; // Métrica de nitidez (0 a 100)
  const lighting = 78;    // Métrica de iluminação (0 a 100)
  
  // Verificação de resolução mínima (Requisito: 720x1280)
  const resolution = {
    width: 1080,
    height: 1920,
    valid: true
  };

  const errors: string[] = [];
  const warnings: string[] = [];

  if (sharpness < 70) {
    errors.push("Imagem muito borrada. Evite mover o celular ao tirar a foto.");
  }
  if (lighting < 50) {
    errors.push("Ambiente muito escuro. Vá para um local mais iluminado.");
  } else if (lighting < 70) {
    warnings.push("Iluminação moderada. Sombras fortes podem afetar levemente a precisão.");
  }

  if (resolution.width < 720 || resolution.height < 1280) {
    errors.push("Resolução da imagem é inferior a 720x1280.");
    resolution.valid = false;
  }

  // Média ponderada da qualidade
  const score = Math.round((sharpness * 0.6) + (lighting * 0.4));

  return {
    score,
    sharpness,
    lighting,
    resolution,
    errors,
    warnings
  };
}
