/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MetricClassification {
  status: "Alinhado" | "Alteração Leve" | "Alteração Moderada" | "Alteração Acentuada";
  severity: "normal" | "warning" | "error";
  label: string;
  description: string;
}

/**
 * Classifies calculated biomechanical angle deviations into 4 levels:
 * - 0° to 2° = Alinhado
 * - 2° to 5° = Alteração Leve
 * - 5° to 8° = Alteração Moderada
 * - > 8°     = Alteração Acentuada
 */
export function classificarAngulo(angulo: number, metricType: string): MetricClassification {
  const absAng = Math.abs(angulo);
  
  if (absAng <= 2.0) {
    return {
      status: "Alinhado",
      severity: "normal",
      label: "Excelente",
      description: `${metricType} dentro dos parâmetros ideais de alinhamento anatômico.`
    };
  } else if (absAng <= 5.0) {
    return {
      status: "Alteração Leve",
      severity: "warning",
      label: "Leve desvio",
      description: `Discreto desalinhamento em ${metricType}. Indicado monitoramento e exercícios de fortalecimento sinérgico.`
    };
  } else if (absAng <= 8.0) {
    return {
      status: "Alteração Moderada",
      severity: "warning",
      label: "Desvio moderado",
      description: `Desvio perceptível em ${metricType}. Recomenda-se inclusão ativa de exercícios corretivos e liberação miofascial.`
    };
  } else {
    return {
      status: "Alteração Acentuada",
      severity: "error",
      label: "Desvio acentuado",
      description: `Assimetria acentuada em ${metricType}. Risco aumentado de sobrecarga mecânica compensatória. Requer atenção especial no plano de treino.`
    };
  }
}
