/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: IMPACT GENERATOR
 * ============================================================================
 */

/**
 * Mapeia os desvios anatômicos para impactos práticos de movimento em musculação.
 */
export function generatePossibleImpacts(findingId: string): string[] {
  switch (findingId) {
    case "shoulder_anteriorization":
      return [
        "redução da eficiência do controle escapular",
        "alteração na mecânica de movimentos empurrar e acima da cabeça",
        "necessidade de atenção ao equilíbrio muscular entre peito e costas"
      ];
    case "anterior_pelvic_tilt":
      return [
        "diferença na distribuição de cargas sobre a coluna lombar",
        "alteração do controle e ativação dos glúteos e abdômen nos agachamentos"
      ];
    case "knee_valgus_tendency":
      return [
        "estresse acentuado na parte interna e patelar dos joelhos",
        "perda de força de empurre em exercícios unilaterais (afundos/passadas)"
      ];
    default:
      return [
        "potencial alteração de controle motor local",
        "necessidade de ajuste de carga para preservar a integridade articular"
      ];
  }
}
