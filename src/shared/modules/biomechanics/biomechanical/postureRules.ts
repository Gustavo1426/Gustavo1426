/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: POSTURE RULES DATABASE
 * ============================================================================
 */

import { BodyAnalysisOutput } from "../types/body-analysis.types";
import { PostureRule } from "../types/biomechanical.types";

export const BiomechanicalRulesDatabase: PostureRule[] = [
  // --- DATABASE/SHOULDERPATTERNS.TS ---
  {
    id: "shoulder_anteriorization",
    name: "Anteriorização de ombros",
    category: "posture",
    description: "Ombros posicionados à frente da linha de gravidade com provável rotação interna acentuada.",
    conditions: (analysis: BodyAnalysisOutput) => {
      const protraction = analysis.bodyMap.shoulders.protractionAngle;
      const forwardHead = analysis.bodyMap.head.forwardHeadDetected;
      
      let confidence = 0;
      if (protraction >= 15) confidence += 60;
      if (forwardHead) confidence += 27;

      return {
        triggered: protraction >= 15,
        confidence: Math.min(100, confidence)
      };
    },
    impacts: [
      "redução do espaço subacromial (risco de pinçamento)",
      "menor eficiência escapular",
      "sobrecarga do deltoide anterior e peitoral menor"
    ],
    strengthen: ["romboides", "trapézio médio e inferior", "infraespinhal"],
    release: ["peitoral maior e menor", "deltoide anterior", "subescapular"],
    riskyMovements: [
      { movement: "desenvolvimento com barra", reason: "Falta de mobilidade de extensão e rotação externa pode pinçar o ombro." },
      { movement: "supino reto pesado", reason: "Escápulas sem ancoragem estável sobrecarregam a articulação glenoumeral anterior." }
    ]
  },
  
  // --- DATABASE/SPINEPATTERNS.TS ---
  {
    id: "thoracic_kyphosis",
    name: "Aumento da curvatura torácica aparente",
    category: "posture",
    description: "Aumento do ângulo de cifose na região torácica da coluna vertebral.",
    conditions: (analysis: BodyAnalysisOutput) => {
      const kyphosisAngle = analysis.bodyMap.spine.thoracicCurveAngle;
      let confidence = 0;
      if (kyphosisAngle > 40) {
        confidence = Math.min(100, 50 + (kyphosisAngle - 40) * 3);
      }
      return {
        triggered: kyphosisAngle > 40,
        confidence
      };
    },
    impacts: [
      "restrição na extensão torácica",
      "limitação da elevação dos braços acima da cabeça",
      "padrão compensatório na coluna lombar"
    ],
    strengthen: ["eretores da espinha torácica", "romboides"],
    release: ["reto abdominal", "peitoral maior"],
    riskyMovements: [
      { movement: "desenvolvimento acima da cabeça", reason: "A falta de extensão torácica força uma hiperlordose lombar compensatória." }
    ]
  },

  // --- DATABASE/PELVISPATTERNS.TS ---
  {
    id: "anterior_pelvic_tilt",
    name: "Anteversão pélvica provável",
    category: "posture",
    description: "Pelve inclinada anteriormente, acentuando a lordose lombar (famoso bumbum empinado).",
    conditions: (analysis: BodyAnalysisOutput) => {
      const tilt = analysis.bodyMap.pelvis.tiltAngle;
      return {
        triggered: tilt >= 10,
        confidence: tilt >= 10 ? Math.min(100, 50 + (tilt - 10) * 5) : 0
      };
    },
    impacts: [
      "hiperlordose lombar compensatória",
      "inibição glútea e abdominal (síndrome cruzada inferior)",
      "tensão excessiva nos eretores da espinha"
    ],
    strengthen: ["glúteo máximo", "reto abdominal", "isquiotibiais"],
    release: ["reto femoral", "psoas maior", "eretores da espinha"],
    riskyMovements: [
      { movement: "levantamento terra", reason: "Risco de cisalhamento lombar se a pelve desabar em anteversão sob carga." }
    ]
  },

  // --- DATABASE/KNEEPATTERNS.TS ---
  {
    id: "knee_valgus_tendency",
    name: "Tendência ao valgo dinâmico/estático",
    category: "alignment",
    description: "Desvio medial da articulação do joelho para dentro em relação à linha quadril-tornozelo.",
    conditions: (analysis: BodyAnalysisOutput) => {
      const devL = analysis.bodyMap.legs.leftKneeDeviationAngle;
      const devR = analysis.bodyMap.legs.rightKneeDeviationAngle;
      const valgusDetected = devL < 175 || devR < 175; // Ângulo interno menor que 175 indica joelho para dentro

      return {
        triggered: valgusDetected,
        confidence: valgusDetected ? 85 : 0
      };
    },
    impacts: [
      "sobrecarga no ligamento colateral medial",
      "estresse patelofemoral lateral",
      "colapso do arco plantar medial associado"
    ],
    strengthen: ["glúteo médio (abdutores de quadril)", "vasto medial do quadríceps"],
    release: ["adutores de coxa", "tensor da fáscia lata"],
    riskyMovements: [
      { movement: "agachamento livre", reason: "Aproximação interna dos joelhos coloca estresse cisalhante severo na patela e meniscos." },
      { movement: "afundo", reason: "Dificuldade de controle dinâmico de valgo estressa o joelho dianteiro." }
    ]
  }
];
