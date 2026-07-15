/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PriorityItem {
  region: "cervical" | "ombros" | "pelve" | "joelhos" | "coluna";
  priorityLevel: "Alta" | "Média" | "Baixa";
  action: string;
  description: string;
}

/**
 * Reviews all calculated postural deviation values to sort and highlight priority areas for corrective work.
 */
export function determinarPrioridades(metrics: {
  cervicalAngle: number;
  shoulderAngle: number;
  pelvicAngle: number;
  kneeAngle: number;
  scolioticAngle: number;
}): PriorityItem[] {
  const list: PriorityItem[] = [];

  // Cervical
  if (metrics.cervicalAngle > 8.0) {
    list.push({
      region: "cervical",
      priorityLevel: "Alta",
      action: "Reduzir a tensão suboccipital e fortalecer os flexores profundos do pescoço",
      description: "Desvio cervical acentuado de " + metrics.cervicalAngle.toFixed(1) + "°. Alto estresse mecânico cervical anterior."
    });
  } else if (metrics.cervicalAngle > 2.0) {
    list.push({
      region: "cervical",
      priorityLevel: "Média",
      action: "Monitorar e fortalecer a musculatura cervical profunda e alongar peitorais",
      description: "Desvio cervical leve/moderado de " + metrics.cervicalAngle.toFixed(1) + "°."
    });
  }

  // Ombros
  if (metrics.shoulderAngle > 5.0) {
    list.push({
      region: "ombros",
      priorityLevel: "Alta",
      action: "Equilibrar a cintura escapular através da ativação ativa do trapézio inferior",
      description: "Desnível acentuado de ombros (" + metrics.shoulderAngle.toFixed(1) + "°)."
    });
  } else if (metrics.shoulderAngle > 2.0) {
    list.push({
      region: "ombros",
      priorityLevel: "Média",
      action: "Promover alongamento peitoral bilateral e ativação de romboides",
      description: "Discreto desalinhamento de ombros."
    });
  }

  // Pelve
  if (metrics.pelvicAngle > 5.0) {
    list.push({
      region: "pelve",
      priorityLevel: "Alta",
      action: "Realizar fortalecimento do glúteo médio e quadrado lombar para reequilíbrio pélvico",
      description: "Assimetria lateral ou inclinação sagital de pelve superior a " + metrics.pelvicAngle.toFixed(1) + "°."
    });
  } else if (metrics.pelvicAngle > 2.0) {
    list.push({
      region: "pelve",
      priorityLevel: "Média",
      action: "Fortalecer estabilizadores pélvicos gerais e core profundo",
      description: "Discreto desvio na báscula pélvica lateral ou sagital."
    });
  }

  // Joelhos
  if (metrics.kneeAngle > 4.0) {
    list.push({
      region: "joelhos",
      priorityLevel: "Média",
      action: "Exercícios corretivos para estabilização fêmoro-patelar e ativação de rotadores de quadril",
      description: "Assimetria de movimento ou flexão persistente de joelho."
    });
  }

  // Spine / Scoliosis
  if (metrics.scolioticAngle > 5.0) {
    list.push({
      region: "coluna",
      priorityLevel: "Alta",
      action: "Reforçar a estabilidade rotacional profunda de tronco (músculo multífidos)",
      description: "Desvio lateral de coluna/tronco estimado em " + metrics.scolioticAngle.toFixed(1) + "°."
    });
  }

  // Sort: Alta -> Média -> Baixa
  return list.sort((a, b) => {
    const map = { Alta: 3, Média: 2, Baixa: 1 };
    return map[b.priorityLevel] - map[a.priorityLevel];
  });
}
export function getPrioritiesLabels(priorities: PriorityItem[]): string[] {
  if (priorities.length === 0) {
    return ["Manutenção preventiva de simetria e alinhamento global"];
  }
  return priorities.map(p => `[Prioridade ${p.priorityLevel}] ${p.action}`);
}
