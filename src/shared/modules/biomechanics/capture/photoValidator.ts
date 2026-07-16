/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PHOTO VALIDATOR
 * ============================================================================
 */

import { BiomechanicalImage } from "../types";
import { ImageQualityRules, defaultQualityRules } from "./qualityRules";

export interface ValidationResult {
  valid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
}

export function validatePhoto(
  image: BiomechanicalImage,
  rules: ImageQualityRules = defaultQualityRules
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validação Crítica (Rejeita a foto)
  if (image.width < rules.minWidth) {
    errors.push(`Resolução insuficiente. A largura mínima é ${rules.minWidth}px.`);
  }
  if (image.height < rules.minHeight) {
    errors.push(`Altura insuficiente. A altura mínima é ${rules.minHeight}px.`);
  }

  // Validação Leve (Aprova com ressalvas)
  if (image.qualityScore < rules.minQualityScore) {
    warnings.push("Qualidade da imagem baixa (possível desfoque ou pouca luz). A análise pode ter menor precisão.");
  }

  return {
    valid: errors.length === 0,
    score: image.qualityScore,
    errors,
    warnings
  };
}
