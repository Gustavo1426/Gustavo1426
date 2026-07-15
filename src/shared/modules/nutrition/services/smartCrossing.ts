/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StudentProfile {
  nome?: string;
  idade?: number;
  sexo?: string;
  peso?: number;
  altura?: number;
  objetivo?: string;
  dorAtual?: string;
  localDor?: string;
  nivelTreino?: string;
  tempoSentado?: number;
}

export interface CrossingReport {
  criticalPatterns: string[];
  sedentaryRiskScore: number; // 0-100
  injuryRiskScore: number; // 0-100
  biomechanicalInsights: string[];
}

/**
 * Crosses raw biomechanical metrics with the student's physiological and lifestyle profile.
 * Identifies compensations, patterns, and dynamic musculoskeletal strain.
 */
export function cruzarMetricasComEstiloDeVida(
  cervicalAngle: number,
  pelvicAngle: number,
  hasSideData: boolean,
  profile: StudentProfile
): CrossingReport {
  const criticalPatterns: string[] = [];
  const biomechanicalInsights: string[] = [];
  
  // 1. Sitting hours correlation (Sedentary risk score)
  const sittingHours = profile.tempoSentado || 0;
  let sedentaryRiskScore = Math.min(100, sittingHours * 10);
  if (sittingHours > 6) {
    criticalPatterns.push("Padrão Sentado Prolongado (Risco de Amnésia Glútea e Encurtamento de Flexores)");
    biomechanicalInsights.push("O alto tempo diário sentado reduz a ativação espontânea de glúteos, intensificando a rotação pélvica sagital.");
  }

  // 2. Cervical & Profile correlation
  if (hasSideData && cervicalAngle > 10) {
    if (sittingHours > 5) {
      criticalPatterns.push("Síndrome Cruzada Superior (Cervical anteriorizada associada a tempo de tela)");
      biomechanicalInsights.push("Correlação forte entre anteriorização cervical acentuada e longos períodos sentados em frente ao computador.");
    }
    if (profile.localDor?.toLowerCase().includes("pescoço") || profile.localDor?.toLowerCase().includes("cervical")) {
      criticalPatterns.push("Anteriorização Cervical Tensional Sintomática");
      biomechanicalInsights.push("A anteriorização cervical de " + cervicalAngle.toFixed(1) + "° coincide diretamente com a queixa álgica relatada.");
    }
  }

  // 3. Pelvis & lumbar pain correlation
  if (pelvicAngle > 5) {
    if (profile.localDor?.toLowerCase().includes("lombar") || profile.localDor?.toLowerCase().includes("costas")) {
      criticalPatterns.push("Sobrecarga Lombo-Pélvica Mecânica");
      biomechanicalInsights.push("Desvio sagital/lateral de pelve de " + pelvicAngle.toFixed(1) + "° tensionando excessivamente a transição lombar.");
    }
  }

  // 4. Calculate Injury Risk Score based on factors
  let injuryRiskScore = 15;
  if (profile.dorAtual === "Sim") injuryRiskScore += 30;
  if (cervicalAngle > 12) injuryRiskScore += 15;
  if (pelvicAngle > 6) injuryRiskScore += 15;
  if (sittingHours > 8) injuryRiskScore += 15;
  if (profile.nivelTreino === "Iniciante") injuryRiskScore += 10;

  injuryRiskScore = Math.min(100, Math.max(0, injuryRiskScore));

  return {
    criticalPatterns,
    sedentaryRiskScore,
    injuryRiskScore,
    biomechanicalInsights
  };
}
