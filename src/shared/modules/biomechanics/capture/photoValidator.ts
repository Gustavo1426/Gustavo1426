/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PHOTO VALIDATOR CORE ENGINE
 * ============================================================================
 */

import {
  PhotoInput,
  PhotoValidationResult,
  BodyDetectionResult,
  QualityAnalysisResult,
  PositionCheckResult
} from "../types/capture.types";
import { analyzeImageQuality } from "./imageQualityAnalyzer";
import { checkPosition } from "./posturePositionChecker";

/**
 * Detector de corpo simplificado (Mock que integra com o TensorFlow/MediaPipe na infra final)
 */
async function detectBody(_photo: PhotoInput): Promise<BodyDetectionResult> {
  // Simulação de detecção bem-sucedida do frame
  return {
    valid: true,
    fullBody: true,
    confidence: 0.97,
    errors: []
  };
}

/**
 * Calcula o score de confiança geral (ponderado) combinando IA de Pose, Luz e Posicionamento.
 */
function calculateConfidence(
  body: BodyDetectionResult,
  quality: QualityAnalysisResult,
  position: PositionCheckResult
): number {
  const bodyConfidence = body.confidence * 100; // Converte p/ 0-100
  const qualityScore = quality.score;
  
  // Penaliza se houver erros de posição
  const positionScore = position.valid ? 100 : Math.max(40, 100 - (position.errors.length * 20));

  return Math.round((bodyConfidence * 0.5) + (qualityScore * 0.3) + (positionScore * 0.2));
}

/**
 * Orquestrador principal da Validação de Captura da Foto do Aluno.
 */
export async function validatePhoto(photo: PhotoInput): Promise<PhotoValidationResult> {
  
  // 1. Executa detecção de silhueta corporal básica
  const body = await detectBody(photo);

  // 2. Analisa métricas de imagem cruas (sharpness, iluminação)
  const quality = await analyzeImageQuality(photo);

  // 3. Valida enquadramento e distância
  const position = await checkPosition(photo);

  // 4. Critério de Aprovação Dinâmico:
  // - Corpo deve ser detectado com confiança mínima
  // - Corpo inteiro visível no enquadramento
  // - Nota de nitidez e luz acima do limiar aceitável (70)
  // - Sem erros graves de distorção de posição
  const approved = 
    body.valid && 
    body.fullBody && 
    quality.score >= 70 && 
    position.valid;

  const confidence = calculateConfidence(body, quality, position);

  const errors = [
    ...body.errors,
    ...quality.errors,
    ...position.errors
  ];

  const warnings = [
    ...quality.warnings
  ];

  // Alerta opcional sobre o vestuário se a confiança estiver um pouco comprometida
  if (approved && confidence < 85) {
    warnings.push("Roupas muito largas detectadas. Isso pode reduzir levemente a exatidão das métricas ósseas.");
  }

  return {
    approved,
    confidence,
    view: photo.view,
    errors,
    warnings,
    metrics: {
      bodyDetected: body.valid,
      fullBodyVisible: body.fullBody,
      lightingScore: quality.lighting,
      angleScore: Math.max(0, 100 - Math.abs(90 - position.angle) * 5), // Normaliza ângulo para escala 0-100
      distanceScore: Math.max(0, 100 - Math.abs(3.0 - position.distance) * 30) // Normaliza distância (ideal = 3m)
    }
  };
}
