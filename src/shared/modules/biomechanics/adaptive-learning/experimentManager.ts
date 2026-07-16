/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EXPERIMENT MANAGER
 * ============================================================================
 */

import { StrategyEffectiveness, RuleHypothesis, AuditLogEntry } from "../types/adaptiveLearning.types";

export class AdaptivePipelineManager {
  private auditLogs: AuditLogEntry[] = [];
  private activeHypotheses: RuleHypothesis[] = [];

  /**
   * NÍVEL 1: Observação
   * Cria uma hipótese baseada em um padrão minerado de alta eficácia.
   */
  generateHypothesis(evidence: StrategyEffectiveness): void {
    if (evidence.successRate > 80 && evidence.sampleSize >= 100) {
      const hypothesis: RuleHypothesis = {
        id: `hyp_${Date.now()}`,
        strategyName: evidence.strategyName,
        targetCohortId: evidence.cohortId,
        suggestedConfidenceAdjustment: +5,
        status: "L1_OBSERVATION",
        evidence,
        createdAt: new Date().toISOString()
      };
      this.activeHypotheses.push(hypothesis);
      this.logAction("HYPOTHESIS_GENERATED", hypothesis.id, "Padrão de alta eficácia minerado via Cohort.");
    }
  }

  /**
   * NÍVEL 2: Validação
   * Promove a hipótese para testes A/B limitados em background (Shadow Mode).
   */
  promoteToValidation(hypothesisId: string): void {
    const index = this.activeHypotheses.findIndex(h => h.id === hypothesisId);
    if (index > -1 && this.activeHypotheses[index].status === "L1_OBSERVATION") {
      this.activeHypotheses[index].status = "L2_VALIDATION";
    }
  }

  /**
   * NÍVEL 3: Aprovação (Human-in-the-Loop)
   * O administrador da plataforma (Você) revisa e aprova a mudança para o Decision Engine.
   */
  approveToProduction(hypothesisId: string, adminSignature: string): void {
    const index = this.activeHypotheses.findIndex(h => h.id === hypothesisId);
    if (index > -1 && this.activeHypotheses[index].status === "L2_VALIDATION") {
      // Regra de segurança: Apenas usuários com claim de Admin podem rodar este método
      if (!adminSignature.includes("admin_cax_cxm")) throw new Error("Acesso Negado.");
      
      this.activeHypotheses[index].status = "L3_APPROVED";
      this.logAction("APPROVAL", hypothesisId, `Aprovado manualmente por ${adminSignature}`);
      
      // TODO: Disparar evento para atualizar os pesos e confianças lá no Knowledge Graph
    }
  }

  /**
   * ROLLBACK ENGINE: Reversão de segurança.
   */
  executeRollback(hypothesisId: string, reason: string): void {
    const index = this.activeHypotheses.findIndex(h => h.id === hypothesisId);
    if (index > -1) {
      this.activeHypotheses[index].status = "REJECTED";
      this.logAction("ROLLBACK", hypothesisId, `Rollback Acionado: ${reason}`);
      // TODO: Disparar evento para restaurar os pesos originais no Knowledge Graph
    }
  }

  public getActiveHypotheses(): RuleHypothesis[] {
    return this.activeHypotheses;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  private logAction(action: AuditLogEntry["action"], hypothesisId: string, reason: string) {
    this.auditLogs.push({ action, hypothesisId, reason, timestamp: new Date().toISOString() });
    console.log(`[Adaptive Learning Audit] ${action} - ${reason}`);
  }
}
