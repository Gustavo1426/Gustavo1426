/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SEVERITY EXPLANATION
 * ============================================================================
 */

/**
 * Retorna uma tradução conceitual e amigável da gravidade identificada.
 */
export function getSeverityExplanation(severity: "low" | "medium" | "high"): string {
  switch (severity) {
    case "low":
      return "Alteração discreta, sem grande impacto aparente na avaliação atual.";
    case "medium":
      return "Padrão consistente que merece atenção e acompanhamento durante o processo de treinamento.";
    case "high":
      return "Padrão importante que necessita maior cuidado na prescrição e execução dos exercícios.";
  }
}
