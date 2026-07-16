/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: CAPTURE SERVICE
 * ============================================================================
 */

import { BiomechanicalImage } from "../types";
import { validatePhoto } from "./photoValidator";
import { normalizeImage, NormalizedImage } from "./imageNormalizer";

export interface CaptureServiceResponse {
  image: NormalizedImage;
  quality: number;
  warnings: string[];
}

export async function processCapture(image: BiomechanicalImage): Promise<CaptureServiceResponse> {
  // 1. Roda a validação
  const validation = validatePhoto(image);

  // 2. Se houver erros críticos, trava o fluxo
  if (!validation.valid) {
    throw new Error(`Imagem rejeitada:\n${validation.errors.join("\n")}`);
  }

  // 3. Normaliza a imagem para a IA
  const normalized = normalizeImage(image);

  return {
    image: normalized,
    quality: validation.score,
    warnings: validation.warnings
  };
}
