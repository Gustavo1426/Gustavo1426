/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.5.1: DECISION MEMORY ENGINE - FEEDBACK
 * ============================================================================
 */

export interface PerformanceSnapshot {
  performanceScore: number;
  fatigueLevel: number;
  igbScore: number;
}

/**
 * Roda periodicamente (ex: 14 dias após a decisão) para auditar 
 * se o que a IA mandou fazer realmente funcionou.
 */
export function evaluateDecisionResult(before: PerformanceSnapshot, after: PerformanceSnapshot): "success" | "neutral" | "failure" {
  // Evoluiu em performance E dissipou fadiga = Sucesso Absoluto
  if (after.performanceScore > before.performanceScore && after.fatigueLevel < before.fatigueLevel) {
    return "success";
  }
  
  // Piorou performance E aumentou fadiga = Falha na Prescrição
  if (after.performanceScore < before.performanceScore && after.fatigueLevel > before.fatigueLevel) {
    return "failure";
  }

  return "neutral";
}
