/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: CAPTURE GUIDE
 * ============================================================================
 */

import { BodyView, CaptureInstruction } from "../types/capture.types";

/**
 * Fornece instruções e correções dinâmicas de UX/UI em tempo real na tela do usuário.
 */
export function getCaptureInstructions(
  view: BodyView, 
  currentDistance: number, 
  deviceAngle: number
): CaptureInstruction {
  
  if (Math.abs(90 - deviceAngle) > 8) {
    return {
      status: "adjust",
      message: "Deixe o celular em pé, perfeitamente reto a 90°.",
      action: "ALIGN_CAMERA"
    };
  }

  if (currentDistance < 2.8) {
    const diff = Math.round((3.0 - currentDistance) * 100);
    return {
      status: "adjust",
      message: `Afaste-se aproximadamente ${diff} centímetros da câmera.`,
      action: "STEP_BACK"
    };
  }

  const instructionsMap: Record<BodyView, string> = {
    front: "Fique de frente, pés paralelos, braços levemente afastados e relaxados.",
    side: "Fique de perfil completo, braços relaxados ao lado do corpo, olhando para frente.",
    back: "Fique de costas para a câmera, com calcanhares visíveis e braços relaxados."
  };

  return {
    status: "correct",
    message: instructionsMap[view],
    action: "READY_TO_SHOOT"
  };
}
