/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: TWIN HEALTH SCORE ENGINE
 * ============================================================================
 */

import { DigitalTwin, CompositeHealthScore } from "../types/digitalTwin.types";

/**
 * Calcula o Health Score Composto, mesclando dados estruturais e comportamentais.
 * Pesos sugeridos: Biomecânica(20%), Adesão(20%), Performance(20%), Recuperação(15%), Constância(15%), Composição(10%).
 */
export function calculateHealthScore(twin: DigitalTwin): CompositeHealthScore {
  // 1. Biomecânica (0-100 direto do IGB)
  const biomechanicsScore = twin.biomechanics.igb;

  // 2. Adesão (0-100 direto do percentual)
  const adherenceScore = twin.training.adherencePercentage;

  // 3. Performance (Baseado na taxa de progressão, capado em 100)
  // Ex: 5% de progressão ao mês = nota máxima.
  const performanceScore = Math.min(100, Math.max(0, twin.performance.strengthProgressionRate * 20));

  // 4. Recuperação (Prontidão alta e fadiga baixa = nota alta)
  const recoveryScore = Math.min(100, (twin.recovery.readinessScore + (100 - twin.recovery.fatigueLevel)) / 2);

  // 5. Constância (0-100)
  const consistencyScore = twin.training.consistencyScore;

  // 6. Composição Corporal (Métrica simplificada: penaliza extremos de gordura corporal, se disponível)
  let bodyCompScore = 75; // Baseline se não houver bioimpedância
  if (twin.body.bodyFatPercentage) {
    const bf = twin.body.bodyFatPercentage;
    const isMale = twin.identity.gender === "male";
    // Faixas ideais fictícias para pontuação máxima
    const idealBf = isMale ? 15 : 22;
    const deviation = Math.abs(bf - idealBf);
    bodyCompScore = Math.max(0, 100 - (deviation * 3));
  }

  // Média Ponderada
  const finalScore = Math.round(
    (biomechanicsScore * 0.20) +
    (adherenceScore * 0.20) +
    (performanceScore * 0.20) +
    (recoveryScore * 0.15) +
    (consistencyScore * 0.15) +
    (bodyCompScore * 0.10)
  );

  return {
    score: finalScore,
    breakdown: {
      biomechanics: biomechanicsScore,
      adherence: adherenceScore,
      performance: performanceScore,
      recovery: recoveryScore,
      consistency: consistencyScore,
      bodyComp: bodyCompScore
    }
  };
}
