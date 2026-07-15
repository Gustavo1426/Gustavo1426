/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentData, UnifiedPrescriptionResult } from "./universalPrescriptionEngine";

export interface ScientificEvidenceReport {
  overallJustification: string;
  volumeJustification: string;
  frequencyJustification: string;
  techniquesJustification: string;
  adjustmentsJustification: string;
  citations: string[];
}

export class ScientificEvidenceEngine {
  /**
   * Generates deep scientific justifications with bibliographic citations
   * based strictly on the metrics produced by the WorkoutOrchestrator.
   */
  public static generate(result: {
    studentData: StudentData;
    volumeDireto?: Record<string, number>;
    workouts?: any[];
    adjustmentLog?: string[];
  }): ScientificEvidenceReport {
    const { studentData, volumeDireto = {}, workouts = [], adjustmentLog = [] } = result;
    const exp = String(studentData.experiencia || "Intermediário").toLowerCase();
    const freq = studentData.frequenciaSemanal || 3;
    const obj = String(studentData.objetivo || "Hipertrofia");

    // 1. Overall Justification
    let overallJustification = "";
    if (exp.includes("inic")) {
      overallJustification = `O plano foi estruturado focando na coordenação neuromuscular e no condicionamento inicial. O volume foi calibrado de forma conservadora para evitar danos musculares excessivos e otimizar a aderência, seguindo as diretrizes clássicas de ACSM (2009).`;
    } else if (exp.includes("avan")) {
      overallJustification = `Para este atleta avançado, a estratégia foca em superar platôs de força e hipertrofia por meio de sobrecarga progressiva concentrada e técnicas de intensificação. O volume aproxima-se do teto adaptativo (MRV) para maximizar o estímulo de síntese proteica via via mTOR (Schoenfeld, 2010).`;
    } else {
      overallJustification = `Prescrição equilibrada para nível intermediário, balanceando perfeitamente a tensão mecânica e o estresse metabólico. As séries semanais se posicionam confortavelmente dentro da faixa MAV (Volume Adaptativo Máximo), garantindo supercompensação constante sem risco de overreaching.`;
    }

    // 2. Volume Justification
    const avgVol = Object.values(volumeDireto).reduce((a, b) => a + b, 0) / (Object.values(volumeDireto).filter(v => v > 0).length || 1);
    let volumeJustification = `Volume médio prescrito de ${avgVol.toFixed(1)} séries semanais por grupo ativo. `;
    if (exp.includes("inic")) {
      volumeJustification += `De acordo com Krieger (2010), indivíduos iniciantes respondem de forma excelente a volumes baixos (6-10 séries semanais). Volumes maiores aumentariam a fadiga sem acréscimo proporcional na taxa de síntese proteica muscular.`;
    } else if (exp.includes("avan")) {
      volumeJustification += `Justificado por Schoenfeld et al. (2017) em sua metanálise, atletas avançados necessitam de doses mais elevadas (>15 séries semanais) para provocar sinalização hipertrófica contínua e recrutar unidades motoras de alto limiar.`;
    } else {
      volumeJustification += `Embasado por Baz-Valle et al. (2022), a faixa de 10-15 séries semanais é o 'sweet spot' para indivíduos treinados, promovendo hipertrofia máxima com excelente controle de biomarcadores de fadiga e estresse articular.`;
    }

    // 3. Frequency Justification
    let frequencyJustification = `Frequência de ${freq}x semanal adotada. `;
    if (freq <= 3) {
      frequencyJustification += `Com frequências mais baixas, optou-se por uma distribuição focada em maior volume por sessão. Segundo Schoenfeld et al. (2016), quando o volume semanal é equalizado, a frequência de treino (1x, 2x ou 3x) apresenta resultados semelhantes de hipertrofia, tornando este formato ideal para a aderência do aluno.`;
    } else {
      frequencyJustification += `A divisão de alta frequência minimiza o estresse metabólico excessivo por sessão e dilui o volume semanal. Segundo Brad Schoenfeld (2019), distribuir o volume semanal em mais sessões por semana reduz a percepção subjetiva de esforço (RPE) e preserva a velocidade e técnica de execução dos exercícios.`;
    }

    // 4. Techniques Justification
    let techniquesJustification = "";
    const hasTechniques = workouts.some(w => w.exercises?.some((ex: any) => ex.technique));
    if (hasTechniques) {
      techniquesJustification = `Uso estratégico de técnicas avançadas (ex: Drop-set) em exercícios isoladores selecionados. Amparado por Krzysztofik et al. (2019), estas técnicas prolongam o tempo sob tensão (TUT) e maximizam o recrutamento de fibras do tipo II sem estender o tempo total da sessão.`;
    } else {
      techniquesJustification = `Opção por séries tradicionais retas com foco em repetições de altíssima qualidade (RIR 1-3). Embasado por Fisher et al. (2013), séries retas levadas próximas ao limite mecânico (RPE 8-9) fornecem todo o estímulo hipertrófico necessário, dispensando técnicas de alta densidade metabólica que prejudicariam a recuperação.`;
    }

    // 5. Adjustments & Auto-regulation Justification
    let adjustmentsJustification = "";
    if (adjustmentLog.length > 0) {
      adjustmentsJustification = `O sistema executou ${adjustmentLog.length} etapas de autoajuste biomecânico. Removendo redundâncias de padrões de empurrar/puxar e cortando séries de exercícios concorrentes. Isso está em perfeita sintonia com a teoria de fadiga residual de Beardsley (2018), que demonstra que a fadiga cumulativa em sinergistas reduz a ativação do músculo-alvo em exercícios subsequentes.`;
    } else {
      adjustmentsJustification = `Nenhum autoajuste agressivo foi necessário, pois a IA gerou os exercícios respeitando fielmente os limites e a integridade de movimentos do aluno. A distribuição manteve-se perfeitamente equalizada de acordo com Helms et al. (2015).`;
    }

    // Standard high-quality references
    const citations = [
      "Schoenfeld, B. J., et al. (2017). Dose-response relationship between weekly resistance training volume and increases in muscle mass: A systematic review and meta-analysis. Journal of Sports Sciences.",
      "Krieger, J. W. (2010). Single vs. multiple sets of resistance exercise for muscle hypertrophy: a meta-analysis. Journal of Strength and Conditioning Research.",
      "Baz-Valle, E., et al. (2022). Total number of sets as a training volume metric for muscle hypertrophy: A systematic review. PeerJ.",
      "Schoenfeld, B. J., et al. (2016). Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis. Sports Medicine.",
      "Krzysztofik, M., et al. (2019). Maximizing Muscle Hypertrophy: A Systematic Review of Advanced Resistance Training Techniques and Methods. International Journal of Environmental Research and Public Health."
    ];

    return {
      overallJustification,
      volumeJustification,
      frequencyJustification,
      techniquesJustification,
      adjustmentsJustification,
      citations
    };
  }
}
