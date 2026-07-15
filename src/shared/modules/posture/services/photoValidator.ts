/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PoseLandmark } from "./posturalEngine";

export interface ValidationResult {
  valid: boolean;
  confidence: number;
  errors: string[];
  warnings: string[];
  reason?: string; // For backwards-compatibility
  bodyRotation?: number; // For backwards-compatibility
}

/**
 * Calculates the average brightness of an image element or canvas.
 */
export function calcularBrilhoImagem(imagem: any): number | null {
  if (!imagem) return null;
  try {
    if (typeof window !== "undefined") {
      let canvas: HTMLCanvasElement;
      if (imagem instanceof HTMLImageElement) {
        canvas = document.createElement("canvas");
        canvas.width = 50;
        canvas.height = 50;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(imagem, 0, 0, 50, 50);
          const imgData = ctx.getImageData(0, 0, 50, 50);
          let sum = 0;
          for (let i = 0; i < imgData.data.length; i += 4) {
            const r = imgData.data[i];
            const g = imgData.data[i + 1];
            const b = imgData.data[i + 2];
            sum += 0.299 * r + 0.587 * g + 0.114 * b;
          }
          return sum / (imgData.data.length / 4);
        }
      } else if (imagem instanceof HTMLCanvasElement) {
        canvas = imagem;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const imgData = ctx.getImageData(0, 0, Math.min(canvas.width, 50), Math.min(canvas.height, 50));
          let sum = 0;
          for (let i = 0; i < imgData.data.length; i += 4) {
            const r = imgData.data[i];
            const g = imgData.data[i + 1];
            const b = imgData.data[i + 2];
            sum += 0.299 * r + 0.587 * g + 0.114 * b;
          }
          return sum / (imgData.data.length / 4);
        }
      }
    }
  } catch (e) {
    console.error("Erro ao calcular brilho da imagem:", e);
  }
  return null;
}

/**
 * Validates postural photos before executing biomechanical analysis.
 * Verifies full-body visibility, key points confidence, rotation angle, and lighting.
 * 
 * Supports signature with landmarks only or full signature (imagem, landmarks, metadados).
 */
export function validarCaptura(
  imagemOrLandmarks: any,
  landmarksParam?: PoseLandmark[],
  metadados?: any
): ValidationResult {
  // Gracefully handle overloaded arguments
  let landmarks: PoseLandmark[] = [];
  let imagem: any = null;

  if (Array.isArray(imagemOrLandmarks)) {
    landmarks = imagemOrLandmarks;
    // If the first argument is already the array of landmarks
    if (Array.isArray(landmarksParam)) {
      // If landmarks is passed as second argument by mistake
      landmarks = landmarksParam;
    }
  } else {
    imagem = imagemOrLandmarks;
    landmarks = landmarksParam || [];
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if landmarks exist and have the required size
  if (!landmarks || landmarks.length < 33) {
    return {
      valid: false,
      confidence: 0,
      errors: [
        "Corpo parcialmente fora da imagem",
        "Cabeça não detectada corretamente",
        "Pés não detectados"
      ],
      warnings: [],
      reason: "Corpo parcialmente fora da imagem. Refaça a foto para maior precisão.",
      bodyRotation: 0
    };
  }

  // 1. Corpo inteiro visível (nariz (0), tornozelo esquerdo (27), tornozelo direito (28))
  const nose = landmarks[0];
  const lAnkle = landmarks[27];
  const rAnkle = landmarks[28];

  const noseVisible = nose && (nose.visibility !== undefined ? nose.visibility : 0) >= 0.5;
  const lAnkleVisible = lAnkle && (lAnkle.visibility !== undefined ? lAnkle.visibility : 0) >= 0.5;
  const rAnkleVisible = rAnkle && (rAnkle.visibility !== undefined ? rAnkle.visibility : 0) >= 0.5;

  if (!noseVisible || !lAnkleVisible || !rAnkleVisible) {
    warnings.push("Corpo parcialmente fora da imagem ou visibilidade reduzida");
  }

  // 2. Cabeça detectada (nariz (0), orelha esquerda (7), orelha direita (8))
  const lEar = landmarks[7];
  const rEar = landmarks[8];
  
  const lEarVisible = lEar && (lEar.visibility !== undefined ? lEar.visibility : 0) >= 0.5;
  const rEarVisible = rEar && (rEar.visibility !== undefined ? rEar.visibility : 0) >= 0.5;

  if (!noseVisible || !lEarVisible || !rEarVisible) {
    warnings.push("Cabeça ou orelhas com detecção parcial");
  }

  // 3. Pés detectados (tornozelo esquerdo (27), tornozelo direito (28))
  if (!lAnkleVisible || !rAnkleVisible) {
    warnings.push("Pés ou tornozelos com detecção parcial");
  }

  // 4. Confiança dos landmarks (visibility)
  const confidence = landmarks.reduce((sum, p) => sum + (p.visibility !== undefined ? p.visibility : 0), 0) / landmarks.length;

  if (confidence < 0.60) {
    warnings.push("Baixa confiança geral de detecção dos pontos anatômicos");
  } else if (confidence >= 0.60 && confidence < 0.85) {
    warnings.push("Confiança de detecção intermediária");
  }

  // 5. Rotação corporal (ombro esquerdo (11), ombro direito (12), quadril esquerdo (23), quadril direito (24))
  const lShoulder = landmarks[11];
  const rShoulder = landmarks[12];
  const lHip = landmarks[23];
  const rHip = landmarks[24];

  let bodyRotationDeg = 0;

  if (lShoulder && rShoulder && lHip && rHip) {
    // Check if both shoulders and hips are spaced apart (frontal/back view)
    const shoulderDistX = Math.abs(lShoulder.x - rShoulder.x);
    if (shoulderDistX > 0.15) {
      const zShoulderDiff = Math.abs(lShoulder.z - rShoulder.z);
      const zHipDiff = Math.abs(lHip.z - rHip.z);
      const avgZDiff = (zShoulderDiff + zHipDiff) / 2;

      // Z coordinates are used by MediaPipe to approximate depth
      bodyRotationDeg = avgZDiff * 90; // Approximate degrees

      if (avgZDiff > 0.16) {
        warnings.push("Corpo levemente rotacionado ou em perfil. Recomenda-se alinhar de frente.");
      } else if (avgZDiff > 0.10) {
        warnings.push("Corpo levemente rotacionado. Tente alinhar de frente.");
      }
    }
  }

  // 6. Distância (proporção alturaCorpo = tornozelo.y - cabeca.y)
  if (nose && lAnkle && rAnkle) {
    const avgAnkleY = (lAnkle.y + rAnkle.y) / 2;
    const headY = nose.y;
    const alturaCorpo = avgAnkleY - headY;

    if (alturaCorpo < 0.45) {
      warnings.push("Aluno muito distante da câmera");
    } else if (alturaCorpo > 0.92) {
      warnings.push("Aluno muito próximo da câmera");
    }
  }

  // 7. Iluminação (brilho médio)
  let brightness = metadados?.brightness ?? null;
  if (brightness === null && imagem) {
    brightness = calcularBrilhoImagem(imagem);
  }

  if (brightness !== null) {
    if (brightness < 60) {
      warnings.push("Iluminação baixa");
    } else if (brightness > 220) {
      warnings.push("Iluminação alta");
    }
  }

  // Deduplicate errors and warnings
  const uniqueErrors = Array.from(new Set(errors));
  const uniqueWarnings = Array.from(new Set(warnings));

  const valid = uniqueErrors.length === 0;

  return {
    valid,
    confidence: parseFloat(confidence.toFixed(2)),
    errors: uniqueErrors,
    warnings: uniqueWarnings,
    reason: uniqueErrors.length > 0 ? uniqueErrors.join(". ") : undefined,
    bodyRotation: parseFloat(bodyRotationDeg.toFixed(1))
  };
}
