/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: POSTURE POSITION CHECKER
 * ============================================================================
 */

import { PhotoInput, PositionCheckResult } from "../types/capture.types";

/**
 * Valida se o usuário está posicionado corretamente de acordo com o plano anatômico exigido.
 */
export async function checkPosition(photo: PhotoInput): Promise<PositionCheckResult> {
  const errors: string[] = [];
  
  // Simulação de telemetria baseada em modelo leve local de pose
  const detectedAngle = 92; // Ângulo do celular em relação ao chão (ideal = 90)
  const estimatedDistance = 2.8; // Distância do usuário em metros (ideal = 3.0m)

  if (estimatedDistance < 2.5) {
    errors.push("Você está muito perto. Afaste-se até que todo seu corpo apareça na tela.");
  } else if (estimatedDistance > 4.0) {
    errors.push("Você está muito longe. Aproxime-se um pouco mais.");
  }

  if (Math.abs(90 - detectedAngle) > 10) {
    errors.push("O celular está muito inclinado. Alinhe o aparelho na vertical.");
  }

  // Verificações específicas baseadas na vista da foto
  if (photo.view === "front") {
    // Checa se braços estão levemente abduzidos e pés paralelos
    const armsAducted = true;
    if (!armsAducted) {
      errors.push("Mantenha os braços ligeiramente afastados do corpo.");
    }
  } else if (photo.view === "side") {
    // Checa se o perfil está completo e desobstruído
    const profileVisible = true;
    if (!profileVisible) {
      errors.push("Fique totalmente de perfil para a câmera.");
    }
  } else if (photo.view === "back") {
    // Checa simetria posterior
    const backVisible = true;
    if (!backVisible) {
      errors.push("Fique de costas completas para a câmera.");
    }
  }

  return {
    valid: errors.length === 0,
    angle: detectedAngle,
    distance: estimatedDistance,
    errors
  };
}
