/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: CAMERA CALIBRATION
 * ============================================================================
 */

import { PhotoInput, CameraCalibrationData } from "../types/capture.types";

/**
 * Corrige as distorções de perspectiva espacial causadas por variações na altura/ângulo da câmera.
 */
export function calibrateCameraGeometry(
  photo: PhotoInput,
  detectedAngle: number,
  estimatedDistance: number
): CameraCalibrationData {
  
  // Matriz de transformação identidade por padrão (sem correção necessária)
  let matrix = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];

  // Se o celular estiver inclinado, aplica-se uma matriz de correção homográfica
  if (Math.abs(90 - detectedAngle) > 3) {
    const correctionFactor = Math.cos((90 - detectedAngle) * (Math.PI / 180));
    matrix = [
      [1, 0, 0],
      [0, correctionFactor, 0],
      [0, 0, 1]
    ];
  }

  return {
    verticalAngle: detectedAngle,
    distance: estimatedDistance,
    perspectiveCorrectionMatrix: matrix
  };
}
