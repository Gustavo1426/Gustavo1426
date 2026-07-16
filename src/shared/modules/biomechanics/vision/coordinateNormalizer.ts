/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: COORDINATE NORMALIZER
 * ============================================================================
 */

/**
 * Traduz coordenadas de tela absoluta de qualquer dispositivo para um sistema padrão de 0-100.
 * Isso isola distorções de tamanho de tela, resolução e variações de proporção do sensor.
 */
export function normalizeCoordinates(
  rawX: number,
  rawY: number,
  rawZ: number = 0,
  screenWidth: number,
  screenHeight: number
): { x: number; y: number; z: number } {
  
  // Se o modelo de pose (como MediaPipe) já retorna coordenadas relativas [0, 1],
  // nós apenas escalamos diretamente para [0, 100].
  const isRelative = rawX <= 1.0 && rawY <= 1.0 && rawX >= 0 && rawY >= 0;

  const normalizedX = isRelative 
    ? rawX * 100 
    : (rawX / screenWidth) * 100;

  const normalizedY = isRelative 
    ? rawY * 100 
    : (rawY / screenHeight) * 100;

  // Garante limite de precisão matemática com uma casa decimal (ex: 78.1)
  return {
    x: Math.round(normalizedX * 10) / 10,
    y: Math.round(normalizedY * 10) / 10,
    z: Math.round(rawZ * 100 * 10) / 10 // Multiplicador de escala espacial para Z
  };
}
