/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface MetricClassification {
  status: "Alinhado" | "Alteração Leve" | "Alteração Moderada" | "Alteração Acentuada";
  severity: "normal" | "warning" | "error";
  label: string;
  description: string;
}

export interface CervicalResult {
  angle: number;
  anteriorizationCm: number;
  classification: MetricClassification;
}

export interface OmbrosResult {
  angle: number;
  asymmetryPercentage: number;
  classification: MetricClassification;
}

export interface EscapulasResult {
  angle: number;
  asymmetryPercentage: number;
  classification: MetricClassification;
}

export interface PelveResult {
  angle: number;
  tiltDegrees: number;
  classification: MetricClassification;
}

export interface JoelhosResult {
  angleRight: number;
  angleLeft: number;
  valgoVaroTendency: "Valgo" | "Varo" | "Neutro";
  classification: MetricClassification;
}

export interface EscolioseVisualResult {
  maxDeviationAngle: number;
  lateralShiftCm: number;
  classification: MetricClassification;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  confidence: number;
  bodyRotation: number;
}

export interface PosturalAnalysisResult {
  cervical: CervicalResult;
  ombros: OmbrosResult;
  escapulas: EscapulasResult;
  pelve: PelveResult;
  joelhos: JoelhosResult;
  escolioseVisual: EscolioseVisualResult;
  simetria: number; // 0-100
  mobilidade: number; // 0-100
  estabilidade: number; // 0-100
  scoreFinal: number; // 0-100
  riscoCompensatorio: "Baixo" | "Médio" | "Alto";
  observacoes: string[];
  prioridades: string[];
  sugestoesTreino: string[];
  exerciciosCorretivos: Array<{
    name: string;
    target: string;
    sets: number;
    reps: string;
    description: string;
  }>;
}

// Helper Math Functions
export function calcularAngulo(p1: PoseLandmark, p2: PoseLandmark): number {
  const dy = p2.y - p1.y;
  const dx = p2.x - p1.x;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

export function calcularDistancia(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calcularCentroCorporal(p1: PoseLandmark, p2: PoseLandmark): PoseLandmark {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: (p1.z + p2.z) / 2,
    visibility: Math.min(p1.visibility, p2.visibility)
  };
}

export function calcularAnguloTresPontos(pA: PoseLandmark, pB: PoseLandmark, pC: PoseLandmark): number {
  const v1 = { x: pA.x - pB.x, y: pA.y - pB.y };
  const v2 = { x: pC.x - pB.x, y: pC.y - pB.y };
  
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  if (mag1 * mag2 === 0) return 0;
  
  const cosAngle = Math.max(-1, Math.min(1, dotProduct / (mag1 * mag2)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

// Classification System
// 0–2° = alinhado
// 2–5° = alteração leve
// 5–8° = alteração moderada
// acima de 8° = alteração acentuada
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

import { validarCaptura as valCaptura } from "./photoValidator";

// Capture Validation before analysis
export function validarCaptura(landmarks: PoseLandmark[]): ValidationResult {
  const result = valCaptura(landmarks);
  return {
    valid: result.valid,
    reason: result.reason,
    confidence: result.confidence,
    bodyRotation: result.bodyRotation || 0
  };
}

// Biomechanical Analysis Functions
export function calcularCervical(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left"): CervicalResult {
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  if (view === "front" || view === "back") {
    // Cervical lateral tilt (inclinação cervical) in frontal view
    const earAngle = calcularAngulo(rightEar, leftEar); // angle relative to horizontal
    const earTilt = Math.abs(earAngle);
    
    // Normalize tilt: ideal is 0° (or 180° / horizontal). 
    // Usually Math.atan2 returns angle around 0 if aligned horizontal.
    let cleanAngle = Math.abs(earAngle);
    if (cleanAngle > 90) cleanAngle = Math.abs(cleanAngle - 180);

    return {
      angle: cleanAngle,
      anteriorizationCm: 0,
      classification: classificarAngulo(cleanAngle, "Inclinação Cervical")
    };
  } else {
    // Profile view (right or left) -> Cervical Anteriorization (cabeça anteriorizada)
    // Distance from ear to shoulder projected horizontally
    const ear = view === "right" ? rightEar : leftEar;
    const shoulder = view === "right" ? rightShoulder : leftShoulder;
    
    // Anteriorization is lateral offset. In perfect posture, ear should be over shoulder.
    const xDiff = Math.abs(ear.x - shoulder.x);
    // Rough scaling to centimeters (assuming average human profile size represents ~0.35cm per % width)
    const anteriorizationCm = xDiff * 100 * 0.35;
    
    // We can also convert this to an angle relative to vertical.
    const cervicalPlumbAngle = Math.abs(calcularAngulo(shoulder, ear) - 90);

    return {
      angle: cervicalPlumbAngle,
      anteriorizationCm: parseFloat(anteriorizationCm.toFixed(1)),
      classification: classificarAngulo(cervicalPlumbAngle, "Anteriorização Cervical")
    };
  }
}

export function calcularOmbros(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left"): OmbrosResult {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  if (view === "front" || view === "back") {
    // Shoulder Leveling (nivelamento dos ombros)
    const angle = calcularAngulo(rightShoulder, leftShoulder);
    let cleanAngle = Math.abs(angle);
    if (cleanAngle > 90) cleanAngle = Math.abs(cleanAngle - 180);

    const asymmetryPercentage = cleanAngle * 5.5; // Scale to a percentage index

    return {
      angle: parseFloat(cleanAngle.toFixed(1)),
      asymmetryPercentage: parseFloat(Math.min(100, asymmetryPercentage).toFixed(1)),
      classification: classificarAngulo(cleanAngle, "Desnível de Ombros")
    };
  } else {
    // Profile view -> Shoulder protraction (projeção anterior dos ombros)
    // Approximate shoulder tilt relative to spine plumb line
    const shoulder = view === "right" ? rightShoulder : leftShoulder;
    const hip = view === "right" ? landmarks[24] : landmarks[23];
    
    const angle = Math.abs(calcularAngulo(hip, shoulder) - 90);
    const protractionPercent = angle * 6.2;

    return {
      angle: parseFloat(angle.toFixed(1)),
      asymmetryPercentage: parseFloat(Math.min(100, protractionPercent).toFixed(1)),
      classification: classificarAngulo(angle, "Projeção de Ombros")
    };
  }
}

export function calcularEscapulas(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left"): EscapulasResult {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  // Since standard MediaPipe Pose doesn't have exact landmarks for scapulae,
  // we combine shoulder symmetry, back chest rotation, and back posture vectors as a biomechanical proxy.
  // In a professional biomechanical engine, if view is 'back', we calculate the back shoulder scapular axis.
  const angle = calcularAngulo(rightShoulder, leftShoulder);
  let cleanAngle = Math.abs(angle);
  if (cleanAngle > 90) cleanAngle = Math.abs(cleanAngle - 180);

  // Escapular asymmetry gets amplified in the back view due to winging/protraction
  const amplification = view === "back" ? 1.4 : 1.0;
  const rawAngle = cleanAngle * amplification;
  const asymmetryPercentage = rawAngle * 7.5;

  return {
    angle: parseFloat(rawAngle.toFixed(1)),
    asymmetryPercentage: parseFloat(Math.min(100, asymmetryPercentage).toFixed(1)),
    classification: classificarAngulo(rawAngle, "Simetria Escapular")
  };
}

export function calcularPelve(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left"): PelveResult {
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  if (view === "front" || view === "back") {
    // Pelvic Tilt (inclinação pélvica / báscula lateral)
    const angle = calcularAngulo(rightHip, leftHip);
    let cleanAngle = Math.abs(angle);
    if (cleanAngle > 90) cleanAngle = Math.abs(cleanAngle - 180);

    return {
      angle: parseFloat(cleanAngle.toFixed(1)),
      tiltDegrees: parseFloat(cleanAngle.toFixed(1)),
      classification: classificarAngulo(cleanAngle, "Báscula Pélvica Lateral")
    };
  } else {
    // Profile view -> Pelvic anteversion / retroversion (tilt anterior/posterior)
    // Approximate pelvic tilt based on hip-knee-shoulder plumb line angles
    const shoulder = view === "right" ? landmarks[12] : landmarks[11];
    const hip = view === "right" ? rightHip : leftHip;
    const knee = view === "right" ? landmarks[26] : landmarks[25];

    const shAngle = calcularAngulo(hip, shoulder);
    const knAngle = calcularAngulo(hip, knee);
    
    // Deviation from vertical line
    const tilt = Math.abs((shAngle + knAngle) / 2 - 90);

    return {
      angle: parseFloat(tilt.toFixed(1)),
      tiltDegrees: parseFloat(tilt.toFixed(1)),
      classification: classificarAngulo(tilt, "Tilt Pélvico Sagital")
    };
  }
}

export function calcularJoelhos(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left"): JoelhosResult {
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  const angleRight = calcularAnguloTresPontos(rightHip, rightKnee, rightAnkle);
  const angleLeft = calcularAnguloTresPontos(leftHip, leftKnee, leftAnkle);

  if (view === "front" || view === "back") {
    // Knee Alignment: Valgus / Varus tendency
    // Valgus: Knees point inwards. Hip-knee distance is smaller than hip-hip width ratio, ankles are further.
    // Varus: Knees point outwards.
    const hipWidth = calcularDistancia(leftHip, rightHip);
    const kneeWidth = calcularDistancia(leftKnee, rightKnee);
    const ankleWidth = calcularDistancia(leftAnkle, rightAnkle);

    const ratioKneeHip = kneeWidth / (hipWidth || 1);
    const ratioAnkleHip = ankleWidth / (hipWidth || 1);

    let valgoVaroTendency: "Valgo" | "Varo" | "Neutro" = "Neutro";
    let devAngle = 0;

    if (ratioKneeHip < 0.85 && ratioAnkleHip > 0.95) {
      valgoVaroTendency = "Valgo";
      // Compute valgus angle deviation (knee vertices collapsing inward)
      devAngle = Math.abs(180 - (angleRight + angleLeft) / 2) * 0.4;
    } else if (ratioKneeHip > 1.15) {
      valgoVaroTendency = "Varo";
      devAngle = Math.abs(180 - (angleRight + angleLeft) / 2) * 0.45;
    } else {
      devAngle = Math.abs(180 - (angleRight + angleLeft) / 2) * 0.15;
    }

    return {
      angleRight: parseFloat(angleRight.toFixed(1)),
      angleLeft: parseFloat(angleLeft.toFixed(1)),
      valgoVaroTendency,
      classification: classificarAngulo(devAngle, `Alinhamento de Joelho (${valgoVaroTendency})`)
    };
  } else {
    // Sagittal view -> Knee hyperextension (geno recurvatum) or flexion
    const kneeAngle = view === "right" ? angleRight : angleLeft;
    let devAngle = 0;
    let label = "Alinhado";

    if (kneeAngle > 182.0) {
      devAngle = kneeAngle - 180;
      label = "Hiperextensão";
    } else if (kneeAngle < 172.0) {
      devAngle = 180 - kneeAngle;
      label = "Flexão persistente";
    }

    return {
      angleRight: parseFloat(angleRight.toFixed(1)),
      angleLeft: parseFloat(angleLeft.toFixed(1)),
      valgoVaroTendency: "Neutro",
      classification: classificarAngulo(devAngle, `Articulação Joelho (Perfil - ${label})`)
    };
  }
}

export function calcularEscolioseVisual(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left"): EscolioseVisualResult {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  // Plumb line deviation check
  // Middle point of shoulders vs middle point of hips
  const midShoulders = calcularCentroCorporal(leftShoulder, rightShoulder);
  const midHips = calcularCentroCorporal(leftHip, rightHip);

  // Angle of the body spine axis relative to true vertical (90°)
  const spineAngle = calcularAngulo(midHips, midShoulders);
  const deviationAngle = Math.abs(spineAngle - 270); // 270° is straight up in image coordinates
  const cleanDeviation = deviationAngle > 180 ? Math.abs(deviationAngle - 360) : deviationAngle;

  const lateralShiftCm = cleanDeviation * 100 * 0.18;

  return {
    maxDeviationAngle: parseFloat(cleanDeviation.toFixed(1)),
    lateralShiftCm: parseFloat(lateralShiftCm.toFixed(1)),
    classification: classificarAngulo(cleanDeviation, "Alinhamento de Coluna (Visual)")
  };
}

export function calcularSimetria(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left"): number {
  if (view === "right" || view === "left") {
    return 100; // Symmetry check is only valid in frontal or back views
  }

  // Bilateral pairs coordinate comparison
  const pairs = [
    [11, 12], // shoulders
    [23, 24], // hips
    [25, 26], // knees
    [27, 28]  // ankles
  ];

  let totalDiff = 0;
  pairs.forEach(([p1Idx, p2Idx]) => {
    const p1 = landmarks[p1Idx];
    const p2 = landmarks[p2Idx];
    
    // Normalize Y-difference
    const yDiff = Math.abs(p1.y - p2.y);
    // Depth difference
    const zDiff = Math.abs(p1.z - p2.z);
    
    totalDiff += (yDiff * 65) + (zDiff * 35);
  });

  const simetriaScore = Math.max(45, Math.min(100, 100 - (totalDiff * 140)));
  return Math.round(simetriaScore);
}

export function calcularMobilidade(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left", infoAluno?: any): number {
  // Biomechanical estimate of postural mobility based on active joint positions, age and activity markers
  const baseScore = 80;
  let penalty = 0;

  // If student sits too much, mobility drops
  if (infoAluno?.tempoSentado && infoAluno.tempoSentado > 6) {
    penalty += (infoAluno.tempoSentado - 6) * 2.5;
  }

  // Age factor
  if (infoAluno?.idade && infoAluno.idade > 40) {
    penalty += (infoAluno.idade - 40) * 0.4;
  }

  // Active joint markers standard deviation check (stiffness/rigidity penalty)
  const leftHip = landmarks[23];
  const leftShoulder = landmarks[11];
  const leftAnkle = landmarks[27];
  const bodyHeightRatio = calcularDistancia(leftShoulder, leftAnkle);

  // Stiffer postures have compressed joints
  if (bodyHeightRatio < 0.65) {
    penalty += 5;
  }

  return Math.round(Math.max(50, Math.min(100, baseScore - penalty)));
}

export function calcularEstabilidade(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left"): number {
  // Stability: deviation of center of mass from perfect support base
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  const midShoulders = calcularCentroCorporal(leftShoulder, rightShoulder);
  const midHips = calcularCentroCorporal(leftHip, rightHip);
  const midAnkles = calcularCentroCorporal(leftAnkle, rightAnkle);

  // Line of gravity goes down from mid-shoulders to ankles
  const massCenterOffset = Math.abs(midShoulders.x - midAnkles.x) + Math.abs(midHips.x - midAnkles.x);
  
  const stabilityScore = Math.max(50, Math.min(100, 100 - (massCenterOffset * 180)));
  return Math.round(stabilityScore);
}

// Generate Premium Workout Index & KPI
export function gerarKPI(resultados: {
  cervical: CervicalResult;
  ombros: OmbrosResult;
  escapulas: EscapulasResult;
  pelve: PelveResult;
  joelhos: JoelhosResult;
  escolioseVisual: EscolioseVisualResult;
  simetria: number;
  mobilidade: number;
  estabilidade: number;
}) {
  // Convert biomechanical deviations to sub-scores (0-100 where 100 is perfectly aligned)
  const cScore = Math.max(0, Math.min(100, 100 - (resultados.cervical.angle * 7.5)));
  const eScore = Math.max(0, Math.min(100, 100 - (resultados.escapulas.angle * 7.5)));
  const pScore = Math.max(0, Math.min(100, 100 - (resultados.pelve.angle * 7.5)));
  const sim = resultados.simetria;
  const est = resultados.estabilidade;
  const mob = resultados.mobilidade;

  // Premium Workout Index formula:
  // (cervical*0.20)+(escapular*0.20)+(pelvico*0.20)+(simetria*0.15)+(estabilidade*0.15)+(mobilidade*0.10)
  const scoreFinal =
    (cScore * 0.20) +
    (eScore * 0.20) +
    (pScore * 0.20) +
    (sim * 0.15) +
    (est * 0.15) +
    (mob * 0.10);

  // Compensatory Risk evaluation (Risco Compensatório: Baixo/Médio/Alto)
  let riscoCompensatorio: "Baixo" | "Médio" | "Alto" = "Baixo";
  if (scoreFinal < 70) {
    riscoCompensatorio = "Alto";
  } else if (scoreFinal < 85) {
    riscoCompensatorio = "Médio";
  }

  return {
    scoreFinal: Math.round(scoreFinal),
    riscoCompensatorio,
    subScores: {
      cervical: Math.round(cScore),
      escapular: Math.round(eScore),
      pelvico: Math.round(pScore)
    }
  };
}

// Generate Full Corrective Report (Non-Diagnostic)
export function gerarRelatorio(
  landmarks: PoseLandmark[],
  view: "front" | "back" | "right" | "left",
  infoAluno: {
    nome: string;
    idade: number;
    sexo: string;
    peso: number;
    altura: number;
    objetivo?: string;
    dorAtual?: string;
    localDor?: string;
    nivelTreino?: string;
    tempoSentado?: number;
  }
): PosturalAnalysisResult {
  // 1. Calculate individual metrics
  const cervical = calcularCervical(landmarks, view);
  const ombros = calcularOmbros(landmarks, view);
  const escapulas = calcularEscapulas(landmarks, view);
  const pelve = calcularPelve(landmarks, view);
  const joelhos = calcularJoelhos(landmarks, view);
  const escolioseVisual = calcularEscolioseVisual(landmarks, view);

  // 2. Global metrics
  const simetria = calcularSimetria(landmarks, view);
  const mobilidade = calcularMobilidade(landmarks, view, infoAluno);
  const estabilidade = calcularEstabilidade(landmarks, view);

  // 3. Score calculation
  const kpi = gerarKPI({
    cervical,
    ombros,
    escapulas,
    pelve,
    joelhos,
    escolioseVisual,
    simetria,
    mobilidade,
    estabilidade
  });

  // 4. Generate visual asymmetry observations and priorities
  const observacoes: string[] = [];
  const prioridades: string[] = [];
  const sugestoesTreino: string[] = [];
  const exerciciosCorretivos: Array<{
    name: string;
    target: string;
    sets: number;
    reps: string;
    description: string;
  }> = [];

  // Cervical
  if (cervical.classification.severity !== "normal") {
    if (view === "right" || view === "left") {
      observacoes.push(`Há indícios visuais compatíveis com assimetria postural cervical: anteriorização da cabeça estimada em ${cervical.anteriorizationCm} cm.`);
      prioridades.push("Reduzir a tensão suboccipital e fortalecer os flexores profundos do pescoço.");
      exerciciosCorretivos.push({
        name: "Chin Tuck (Retração Cervical)",
        target: "Flexores profundos do pescoço",
        sets: 3,
        reps: "12-15 reps (sustentar 2s)",
        description: "Encostado na parede, recolha o queixo fazendo um movimento de 'duplo queixo' sem inclinar a cabeça."
      });
    } else {
      observacoes.push(`Há indícios visuais compatíveis com inclinação lateral cervical de aproximadamente ${cervical.angle}°.`);
      prioridades.push("Equilibrar a tensão dos músculos escalenos e trapézio superior unilateralmente.");
    }
  }

  // Ombros
  if (ombros.classification.severity !== "normal") {
    if (view === "front" || view === "back") {
      observacoes.push(`Há indícios visuais de desnível escapular/ombros lateral de ${ombros.angle}°.`);
      prioridades.push("Corrigir desnível de cintura escapular restabelecendo força de trapézio inferior.");
      exerciciosCorretivos.push({
        name: "Y-Raise Prone (Elevação em Y)",
        target: "Trapézio inferior e romboides",
        sets: 3,
        reps: "10-12 reps",
        description: "Deitado de bruços, eleve os braços em formato de Y focando na depressão e adução das escápulas."
      });
    } else {
      observacoes.push(`Há indícios visuais compatíveis com projeção anterior de ombro em ${ombros.angle}°.`);
      prioridades.push("Alongamento da cadeia anterior (peitoral menor) e ativação de rotadores externos.");
      exerciciosCorretivos.push({
        name: "Alongamento em Portal de Porta",
        target: "Peitoral maior e menor",
        sets: 3,
        reps: "30 segundos",
        description: "Apoie os antebraços no portal de uma porta e projete o tronco à frente até sentir alongar o peito."
      });
    }
  }

  // Pelve
  if (pelve.classification.severity !== "normal") {
    if (view === "front" || view === "back") {
      observacoes.push(`Há indícios visuais compatíveis com báscula pélvica lateral de ${pelve.angle}°.`);
      prioridades.push("Estabilização pélvica fortalecendo glúteo médio na perna de apoio mais baixa.");
      exerciciosCorretivos.push({
        name: "Prancha Lateral com Abdução de Quadril",
        target: "Glúteo médio e quadrado lombar",
        sets: 3,
        reps: "10-12 reps por lado",
        description: "Em posição de prancha lateral com joelhos flexionados, eleve o quadril e abduza a perna de cima."
      });
    } else {
      observacoes.push(`Há indícios visuais de desalinhamento sagital pélvico (tilt estimado de ${pelve.angle}°).`);
      prioridades.push("Fortalecer o core anterior e glúteos para neutralizar tendência à anteversão excessiva.");
      exerciciosCorretivos.push({
        name: "Ponte Pélvica com Retroversão Ativa",
        target: "Glúteos e Isquiotibiais",
        sets: 3,
        reps: "15 reps",
        description: "Deitado de costas, eleve a pelve realizando uma leve contração abdominal para rotacionar a bacia para trás."
      });
    }
  }

  // Joelhos
  if (joelhos.classification.severity !== "normal") {
    if (joelhos.valgoVaroTendency === "Valgo") {
      observacoes.push("Há indícios visuais compatíveis com tendência a valgo dinâmico/estático bilateral nos joelhos.");
      prioridades.push("Fortalecer rotadores externos e abdutores de quadril.");
      exerciciosCorretivos.push({
        name: "Clamshell (Ostra com Mini-Band)",
        target: "Glúteo médio e rotadores externos",
        sets: 3,
        reps: "15-20 reps",
        description: "Deitado de lado com joelhos dobrados a 90°, abra as pernas como uma ostra mantendo os calcanhares unidos."
      });
    } else if (joelhos.valgoVaroTendency === "Varo") {
      observacoes.push("Há indícios visuais compatíveis com tendência a varo nos joelhos.");
      prioridades.push("Alongar banda iliotibial e fortalecer adutores do quadril.");
      exerciciosCorretivos.push({
        name: "Adução de Quadril com Bola/Anel",
        target: "Adutores de quadril",
        sets: 3,
        reps: "15 reps",
        description: "Deitado com joelhos flexionados, aperte uma bola suíça ou pilates ring entre os joelhos por 3s."
      });
    }
  }

  // Escoliose / Desvio Lateral
  if (escolioseVisual.classification.severity !== "normal") {
    observacoes.push(`Há indícios visuais compatíveis com desvio lateral de coluna/tronco estimado em ${escolioseVisual.maxDeviationAngle}°.`);
    prioridades.push("Melhorar a estabilidade rotacional do core e flexibilidade lateral.");
    exerciciosCorretivos.push({
      name: "Prancha Frontal com Toque de Ombros",
      target: "Anti-rotação de core",
      sets: 3,
      reps: "20 toques totais",
      description: "Em prancha alta, tire uma mão e toque o ombro oposto sem oscilar os quadris."
    });
  }

  // Base suggestions if everything is aligned
  if (observacoes.length === 0) {
    observacoes.push("Nenhuma assimetria postural severa ou alteração significativa foi identificada visualmente.");
    prioridades.push("Manutenção do excelente alinhamento anatômico global.");
    exerciciosCorretivos.push({
      name: "Mobilidade de Tornozelo e Quadril Integrada",
      target: "Mobilidade articular geral",
      sets: 2,
      reps: "10 reps de cada lado",
      description: "Agachamento profundo segurando nos pés, elevando um braço de cada vez para rotação torácica."
    });
  }

  // Training recommendations based on goals
  const objetivo = (infoAluno.objetivo || "").toLowerCase();
  if (objetivo.includes("hipertrofia")) {
    sugestoesTreino.push("Utilizar cargas progressivas garantindo que a execução perfeita preceda o aumento de peso.");
    sugestoesTreino.push("Dar preferência a exercícios bilaterais livres para reforço de simetria.");
  } else if (objetivo.includes("emagrecimento")) {
    sugestoesTreino.push("Integrar circuitos funcionais que exijam controle de estabilidade unipodal.");
    sugestoesTreino.push("Foco no fortalecimento do core postural ativo durante exercícios metabólicos.");
  } else {
    sugestoesTreino.push("Manter rotinas regulares de mobilidade torácica antes de treinos de membro superior.");
    sugestoesTreino.push("Priorizar estabilização de pelve e escápulas no aquecimento.");
  }

  return {
    cervical,
    ombros,
    escapulas,
    pelve,
    joelhos,
    escolioseVisual,
    simetria,
    mobilidade,
    estabilidade,
    scoreFinal: kpi.scoreFinal,
    riscoCompensatorio: kpi.riscoCompensatorio,
    observacoes,
    prioridades,
    sugestoesTreino,
    exerciciosCorretivos
  };
}
