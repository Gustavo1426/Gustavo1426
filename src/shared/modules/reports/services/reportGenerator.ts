/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PoseLandmark } from "../../posture/services/posturalEngine";
import { 
  calcularCervical, 
  calcularOmbros, 
  calcularEscapulas, 
  calcularPelve, 
  calcularJoelhos, 
  calcularEscolioseVisual, 
  calcularSimetria, 
  calcularMobilidade, 
  calcularEstabilidade 
} from "../../posture/services/biomechanicsEngine";
import { classificarAngulo, MetricClassification } from "../../posture/services/posturalInterpreter";
import { cruzarMetricasComEstiloDeVida, StudentProfile, CrossingReport } from "../../nutrition/services/smartCrossing";
import { gerarKPI, IndexResult } from "../../training/services/workoutIndex";
import { determinarPrioridades, PriorityItem, getPrioritiesLabels } from "../../training/services/priorityEngine";
import { recomendarExercicios, CorrectiveExercise } from "../../posture/services/exerciseRecommendation";

export interface CompletePosturalReport {
  cervical: {
    angle: number;
    anteriorizationCm: number;
    classification: MetricClassification;
  };
  ombros: {
    angle: number;
    asymmetryPercentage: number;
    classification: MetricClassification;
  };
  escapulas: {
    angle: number;
    asymmetryPercentage: number;
    classification: MetricClassification;
  };
  pelve: {
    angle: number;
    tiltDegrees: number;
    classification: MetricClassification;
  };
  joelhos: {
    angleRight: number;
    angleLeft: number;
    valgoVaroTendency: "Valgo" | "Varo" | "Neutro";
    classification: MetricClassification;
  };
  escolioseVisual: {
    maxDeviationAngle: number;
    lateralShiftCm: number;
    classification: MetricClassification;
  };
  simetria: number;
  mobilidade: number;
  estabilidade: number;
  scoreFinal: number;
  riscoCompensatorio: "Baixo" | "Médio" | "Alto";
  observacoes: string[];
  prioridades: string[];
  sugestoesTreino: string[];
  exerciciosCorretivos: CorrectiveExercise[];
  crossing: CrossingReport;
}

/**
 * Compiles a full, professionally structured postural biomechanics evaluation.
 */
export function compilarRelatorioCompleto(
  landmarks: PoseLandmark[],
  view: "front" | "back" | "right" | "left",
  profile: StudentProfile
): CompletePosturalReport {
  // 1. Core measurements
  const cervicalRaw = calcularCervical(landmarks, view);
  const ombrosRaw = calcularOmbros(landmarks, view);
  const escapulasRaw = calcularEscapulas(landmarks, view);
  const pelveRaw = calcularPelve(landmarks, view);
  const joelhosRaw = calcularJoelhos(landmarks, view);
  const escolioseRaw = calcularEscolioseVisual(landmarks, view);

  // 2. Classifications
  const cervicalClass = classificarAngulo(cervicalRaw.angle, "Cervical");
  const ombrosClass = classificarAngulo(ombrosRaw.angle, "Desnível de Ombros");
  const escapulasClass = classificarAngulo(escapulasRaw.angle, "Sinergia Escapular");
  const pelveClass = classificarAngulo(pelveRaw.angle, "Báscula Pélvica");
  const joelhosClass = classificarAngulo(joelhosRaw.devAngle, `Desalinhamento de Joelhos (${joelhosRaw.valgoVaroTendency})`);
  const escolioseClass = classificarAngulo(escolioseRaw.maxDeviationAngle, "Escoliose Lateral");

  // 3. Dynamic scores
  const simetria = calcularSimetria(landmarks, view);
  const mobilidade = calcularMobilidade(landmarks, view, profile);
  const estabilidade = calcularEstabilidade(landmarks, view);

  // 4. Workout Score KPI Index
  const kpi = gerarKPI({
    cervicalAngle: cervicalRaw.angle,
    scapularAngle: escapulasRaw.angle,
    pelvicAngle: pelveRaw.angle,
    simetria,
    estabilidade,
    mobilidade
  });

  // 5. Intelligent Lifestyle Crossing
  const hasSideData = view === "right" || view === "left";
  const crossing = cruzarMetricasComEstiloDeVida(cervicalRaw.angle, pelveRaw.angle, hasSideData, profile);

  // 6. Action priorities
  const prioritiesList = determinarPrioridades({
    cervicalAngle: cervicalRaw.angle,
    shoulderAngle: ombrosRaw.angle,
    pelvicAngle: pelveRaw.angle,
    kneeAngle: joelhosRaw.devAngle,
    scolioticAngle: escolioseRaw.maxDeviationAngle
  });
  const prioridades = getPrioritiesLabels(prioritiesList);

  // 7. Dynamic Corrective Exercise Recommendations
  const exerciciosCorretivos = recomendarExercicios({
    cervicalAngle: cervicalRaw.angle,
    shoulderAngle: ombrosRaw.angle,
    pelvicAngle: pelveRaw.angle,
    kneeValgusVaro: joelhosRaw.valgoVaroTendency,
    scolioticAngle: escolioseRaw.maxDeviationAngle
  });

  // 8. General narrative observations
  const observacoes: string[] = [];
  if (view === "front" || view === "back") {
    if (ombrosClass.severity !== "normal") {
      observacoes.push(`Ombros: Desnível lateral de ${ombrosRaw.angle}° detectado.`);
    }
    if (pelveClass.severity !== "normal") {
      observacoes.push(`Pelve: báscula pélvica lateral de ${pelveRaw.angle}° detectada.`);
    }
    if (joelhosRaw.valgoVaroTendency !== "Neutro") {
      observacoes.push(`Joelhos: Tendência a desalinhamento do tipo ${joelhosRaw.valgoVaroTendency.toLowerCase()}.`);
    }
  } else {
    if (cervicalRaw.anteriorizationCm > 1.0) {
      observacoes.push(`Cervical: Anteriorização da cabeça estimada em ${cervicalRaw.anteriorizationCm} cm.`);
    }
    if (pelveRaw.angle > 4.0) {
      observacoes.push(`Pelve: Desvio sagital/tilt pélvico de ${pelveRaw.angle}° medido.`);
    }
  }

  // Crossing findings added to observations
  crossing.biomechanicalInsights.forEach(insight => observacoes.push(insight));
  crossing.criticalPatterns.forEach(pattern => observacoes.push(`Padrão observado: ${pattern}`));

  if (observacoes.length === 0) {
    observacoes.push("Nenhuma assimetria ou desalinhamento biomecânico relevante identificado visualmente.");
  }

  // Goal-driven suggestions
  const sugestoesTreino: string[] = [];
  const objetivo = (profile.objetivo || "").toLowerCase();
  if (objetivo.includes("hipertrofia")) {
    sugestoesTreino.push("Garantir perfeita amplitude de movimento antes do acréscimo de sobrecargas bilaterais.");
    sugestoesTreino.push("Dar preferência a exercícios de força livres e simétricos para nivelamento pélvico e escapular.");
  } else if (objetivo.includes("emagrecimento") || objetivo.includes("defini")) {
    sugestoesTreino.push("Utilizar dinâmicas funcionais que forcem estabilidade do core anterior e cintura pélvica.");
    sugestoesTreino.push("Foco na integridade postural sob fadiga metabólica moderada.");
  } else {
    sugestoesTreino.push("Sessões de flexibilidade estática ou liberação miofascial antes de exercícios multiarticulares de força.");
    sugestoesTreino.push("Foco primário no controle de estabilidade proximal de coluna e cintura escapular.");
  }

  return {
    cervical: {
      angle: cervicalRaw.angle,
      anteriorizationCm: cervicalRaw.anteriorizationCm,
      classification: cervicalClass
    },
    ombros: {
      angle: ombrosRaw.angle,
      asymmetryPercentage: ombrosRaw.asymmetryPercentage,
      classification: ombrosClass
    },
    escapulas: {
      angle: escapulasRaw.angle,
      asymmetryPercentage: escapulasRaw.asymmetryPercentage,
      classification: escapulasClass
    },
    pelve: {
      angle: pelveRaw.angle,
      tiltDegrees: pelveRaw.tiltDegrees,
      classification: pelveClass
    },
    joelhos: {
      angleRight: joelhosRaw.angleRight,
      angleLeft: joelhosRaw.angleLeft,
      valgoVaroTendency: joelhosRaw.valgoVaroTendency,
      classification: joelhosClass
    },
    escolioseVisual: {
      maxDeviationAngle: escolioseRaw.maxDeviationAngle,
      lateralShiftCm: escolioseRaw.lateralShiftCm,
      classification: escolioseClass
    },
    simetria,
    mobilidade,
    estabilidade,
    scoreFinal: kpi.scoreFinal,
    riscoCompensatorio: kpi.riscoCompensatorio,
    observacoes,
    prioridades,
    sugestoesTreino,
    exerciciosCorretivos,
    crossing
  };
}
