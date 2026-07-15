import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  FilesetResolver,
  PoseLandmarker
} from "@mediapipe/tasks-vision";
import { 
  Activity, 
  Sparkles, 
  Camera, 
  Plus, 
  CheckCircle, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  Zap, 
  TrendingUp, 
  FileText, 
  Trash2, 
  Grid3X3, 
  Eye, 
  EyeOff, 
  Loader2, 
  Dumbbell, 
  Heart,
  ChevronDown,
  Check,
  Lock,
  Unlock,
  Printer,
  Maximize2,
  Minimize2,
  BookOpen,
  HelpCircle,
  Compass
} from "lucide-react";
import { Student } from "../../../types";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import ConfirmModal from "../../../shared/presentation/components/ConfirmModal";
import { salvarAvaliacao } from "../../../shared/modules/nutrition/services/avaliacaoService";
import EvolucaoPostural from "./EvolucaoPostural";
import { 
  validarCaptura, 
  gerarRelatorio, 
  calcularCervical,
  calcularOmbros,
  calcularEscapulas,
  calcularPelve,
  calcularJoelhos,
  calcularEscolioseVisual,
  calcularSimetria,
  calcularMobilidade,
  calcularEstabilidade,
  gerarKPI,
  PoseLandmark 
} from "../../../shared/modules/posture/services/posturalEngine";

const DEFAULT_STUDENT_AGE = 28;
const DEFAULT_STUDENT_WEIGHT = 78;
const DEFAULT_STUDENT_HEIGHT = 178;

interface AnalisePosturalViewProps {
  students: Student[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string) => void;
  isEmbedded?: boolean;
  onSaveAndAdvance?: () => void;
}

export interface PosturalEvaluation {
  id: string;
  studentId: string;
  date: string;
  timestamp: number;
  
  // Questionnaire data
  answers: {
    dorAtual: string;
    localDor: string;
    lesoesHistorico: string;
    tempoSentado: number;
    nivelTreino: string;
    nome: string;
    idade: number;
    sexo: string;
    peso: number;
    altura: number;
    objetivo: string;
  };

  // Photos (base64 or URL)
  photos: {
    front: string | null;
    back: string | null;
    right: string | null;
    left: string | null;
  };

  // Coordinates of anatomical markers (percentage 0-100)
  markers: {
    front: Array<{ id: string; label: string; x: number; y: number; type: "normal" | "warning" | "error" }>;
    back: Array<{ id: string; label: string; x: number; y: number; type: "normal" | "warning" | "error" }>;
    right: Array<{ id: string; label: string; x: number; y: number; type: "normal" | "warning" | "error" }>;
    left: Array<{ id: string; label: string; x: number; y: number; type: "normal" | "warning" | "error" }>;
  };

  // Computed posture scores (0-100)
  kpis: {
    cervical: number;
    escapular: number;
    pelvico: number;
    simetria: number;
    estabilidade: number;
    mobilidade: number;
    geral: number;
    compensacaoRisco: "Baixo" | "Médio" | "Alto";
  };

  // Deviations detail text
  deviations: {
    cervical: string;
    ombros: string;
    pelve: string;
    joelhos: string;
    geral: string;
  };

  observations: string[];
  suggestions: Array<{ name: string; description: string; target: string; sets: number; reps: string; notes: string }>;
  aiReport?: string;
}

interface MarkerInstruction {
  subtitle: string;
  description: string;
}

const getMarkerInstruction = (label: string): MarkerInstruction => {
  const norm = label.toLowerCase();
  
  if (norm.includes("orelha direita") || norm.includes("orelha esquerda") || norm === "orelha") {
    return {
      subtitle: "Alinhamento e Inclinação da Cabeça",
      description: "Posicione rigorosamente sobre o trago (canal auditivo) nas vistas de perfil ou no lóbulo da orelha nas vistas frontal. Fundamental para avaliar a projeção anterior da cabeça ou inclinação lateral."
    };
  }
  if (norm.includes("ombro direito") || norm.includes("ombro esquerdo") || norm === "ombro") {
    return {
      subtitle: "Nivelamento e Báscula Escapular",
      description: "Posicione no centro da articulação acromioclavicular (ponto mais alto do osso do ombro). Crucial para identificar elevação/depressão dos ombros ou projeção anterior crônica."
    };
  }
  if (norm.includes("escápula direita") || norm.includes("escápula esquerda")) {
    return {
      subtitle: "Estabilidade de Omoplata",
      description: "Posicione no ângulo inferior da escápula. Essencial para identificar assimetrias de rotação interna/externa ou escápula alada/instável."
    };
  }
  if (norm.includes("coluna torácica")) {
    return {
      subtitle: "Desvio Lateral de Tronco",
      description: "Posicione sobre o processo espinhoso da vértebra T12 (meio das costas, final das costelas). Referência para identificar escoliose torácica ou desvios de prumo."
    };
  }
  if (norm.includes("coluna lombar")) {
    return {
      subtitle: "Curvatura e Rotação Lombar",
      description: "Posicione sobre o processo espinhoso da vértebra L4/L5 (altura das cristas ilíacas, linha da cintura). Mede o alinhamento da lombar em relação ao centro gravitacional."
    };
  }
  if (norm.includes("quadril direito") || norm.includes("quadril esquerdo") || norm === "quadril") {
    return {
      subtitle: "Nivelamento e Rotação de Pelve",
      description: "Posicione sobre a espinha ilíaca ântero-superior (crista ilíaca, o osso saltado da bacia na frente) ou no grande trocânter do fêmur no perfil. Determina báscula e inclinações de bacia."
    };
  }
  if (norm.includes("joelho direito") || norm.includes("joelho esquerdo") || norm === "joelho") {
    return {
      subtitle: "Eixo e Simetria de Joelhos",
      description: "Posicione exatamente no centro da patela (frente) ou no côndilo lateral (perfil). Auxilia no diagnóstico visual de geno valgo (para dentro), varo (para fora) ou hiperextensão."
    };
  }
  if (norm.includes("tornozelo direito") || norm.includes("tornozelo esquerdo") || norm === "tornozelo") {
    return {
      subtitle: "Base Biomecânica e Apoio",
      description: "Posicione sobre o maléolo lateral (perfil) ou no centro do tendão de calcâneo (costas). É a base do fio de prumo postural e indica pronação/supinação plantar."
    };
  }
  
  return {
    subtitle: "Ponto Anatômico de Referência",
    description: "Arraste este marcador para o ponto ósseo correspondente indicado para obter a calibração perfeita dos eixos esqueléticos."
  };
};

// Helper function to scale and offset skeleton coordinates
const applySkeletonAdjustment = (
  markers: Array<{ id: string; label: string; x: number; y: number; type: "normal" | "warning" | "error" }>,
  scaleX: number,
  scaleY: number,
  offsetX: number,
  offsetY: number
) => {
  if (!markers || markers.length === 0) return [];

  const minX = Math.min(...markers.map(m => m.x));
  const maxX = Math.max(...markers.map(m => m.x));
  const minY = Math.min(...markers.map(m => m.y));
  const maxY = Math.max(...markers.map(m => m.y));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return markers.map(m => {
    const dx = m.x - centerX;
    const dy = m.y - centerY;
    
    // Scale from center and add offset (clamp coordinates between 0.5% and 99.5%)
    const newX = Math.max(0.5, Math.min(99.5, centerX + dx * scaleX + offsetX));
    const newY = Math.max(0.5, Math.min(99.5, centerY + dy * scaleY + offsetY));

    return {
      ...m,
      x: newX,
      y: newY
    };
  });
};

// Default anatomic references for standard 4-view skeleton placement
const DEFAULT_COORDINATES = {
  front: [
    { id: "front-orelha-d", label: "Orelha Direita", x: 42, y: 15, type: "normal" as const },
    { id: "front-orelha-e", label: "Orelha Esquerda", x: 58, y: 15, type: "normal" as const },
    { id: "front-ombro-d", label: "Ombro Direito", x: 33, y: 28, type: "normal" as const },
    { id: "front-ombro-e", label: "Ombro Esquerdo", x: 67, y: 28, type: "normal" as const },
    { id: "front-quad-d", label: "Quadril Direito", x: 36, y: 55, type: "normal" as const },
    { id: "front-quad-e", label: "Quadril Esquerdo", x: 64, y: 55, type: "normal" as const },
    { id: "front-joe-d", label: "Joelho Direito", x: 37, y: 76, type: "normal" as const },
    { id: "front-joe-e", label: "Joelho Esquerdo", x: 63, y: 76, type: "normal" as const },
    { id: "front-tor-d", label: "Tornozelo Direito", x: 38, y: 92, type: "normal" as const },
    { id: "front-tor-e", label: "Tornozelo Esquerdo", x: 62, y: 92, type: "normal" as const },
  ],
  back: [
    { id: "back-ombro-d", label: "Ombro Direito", x: 33, y: 28, type: "normal" as const },
    { id: "back-ombro-e", label: "Ombro Esquerdo", x: 67, y: 28, type: "normal" as const },
    { id: "back-esc-d", label: "Escápula Direita", x: 36, y: 34, type: "normal" as const },
    { id: "back-esc-e", label: "Escápula Esquerda", x: 64, y: 34, type: "normal" as const },
    { id: "back-col-t", label: "Coluna Torácica", x: 50, y: 40, type: "normal" as const },
    { id: "back-col-l", label: "Coluna Lombar", x: 50, y: 58, type: "normal" as const },
    { id: "back-quad-d", label: "Quadril Direito", x: 36, y: 55, type: "normal" as const },
    { id: "back-quad-e", label: "Quadril Esquerdo", x: 64, y: 55, type: "normal" as const },
    { id: "back-tor-d", label: "Tornozelo Direito", x: 38, y: 92, type: "normal" as const },
    { id: "back-tor-e", label: "Tornozelo Esquerdo", x: 62, y: 92, type: "normal" as const },
  ],
  right: [
    { id: "right-orelha", label: "Orelha", x: 44, y: 15, type: "normal" as const },
    { id: "right-ombro", label: "Ombro", x: 52, y: 28, type: "normal" as const },
    { id: "right-quad", label: "Quadril", x: 49, y: 55, type: "normal" as const },
    { id: "right-joe", label: "Joelho", x: 47, y: 76, type: "normal" as const },
    { id: "right-tor", label: "Tornozelo", x: 49, y: 92, type: "normal" as const },
  ],
  left: [
    { id: "left-orelha", label: "Orelha", x: 56, y: 15, type: "normal" as const },
    { id: "left-ombro", label: "Ombro", x: 48, y: 28, type: "normal" as const },
    { id: "left-quad", label: "Quadril", x: 51, y: 55, type: "normal" as const },
    { id: "left-joe", label: "Joelho", x: 53, y: 76, type: "normal" as const },
    { id: "left-tor", label: "Tornozelo", x: 51, y: 92, type: "normal" as const },
  ],
};

// Realistic mock images for demonstration (all with transparent background/clean fitness silhouettes)
const MOCK_PHOTOS = {
  front: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
  back: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400",
  right: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&q=80&w=400",
  left: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400",
};

// Polished SVG Human Silhouette Posture Guide Overlay
function PostureSilhouetteGuide({ 
  studentHeight, 
  scalePercent = 100, 
  shiftPercent = 0 
}: { 
  studentHeight?: number; 
  scalePercent?: number; 
  shiftPercent?: number;
}) {
  let height = studentHeight || DEFAULT_STUDENT_HEIGHT;
  // Handle meter representations (e.g., 1.75 -> 175)
  if (height < 3) {
    height = Math.round(height * 100);
  }

  // Calculate dynamic scale factor
  const scaleFactor = scalePercent / 100;

  // The floor (0 cm) is at exactly Y = 90%.
  // The top of the head is at exactly Y = 15% (when scalePercent is 100).
  // Thus, the person's height of `height` cm spans 75% of the container height at 100% scale.
  const getY = (cmValue: number) => {
    return 90 - (cmValue / height) * (75 * scaleFactor);
  };

  const getX = (baselineX: number) => {
    return 50 + (baselineX - 50) * scaleFactor;
  };

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center transition-all duration-75"
      style={{
        transform: `translateY(${shiftPercent}px)`
      }}
    >
      <svg className="w-full h-full opacity-35 animate-pulse select-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Head/Cranial Guide */}
        <ellipse 
          cx="50" 
          cy={getY(0.915 * height)} 
          rx={5.5 * scaleFactor} 
          ry={6.375 * scaleFactor} 
          fill="none" 
          stroke="#00f2ff" 
          strokeWidth="0.8" 
          strokeDasharray="2,2" 
        />
        <line 
          x1="50" 
          y1={getY(height)} 
          x2="50" 
          y2={getY(0.83 * height)} 
          stroke="#00f2ff" 
          strokeWidth="0.5" 
        />
        
        {/* Cervical & Spine Axis line */}
        <line 
          x1="50" 
          y1={getY(0.83 * height)} 
          x2="50" 
          y2={getY(0.446 * height)} 
          stroke="#00f2ff" 
          strokeWidth="0.8" 
          strokeDasharray="3,3" 
        />
        
        {/* Shoulders Guide */}
        <line 
          x1={getX(33)} 
          y1={getY(0.771 * height)} 
          x2={getX(67)} 
          y2={getY(0.771 * height)} 
          stroke="#ccff00" 
          strokeWidth="0.8" 
          strokeDasharray="2,2" 
        />
        <circle cx={getX(33)} cy={getY(0.771 * height)} r={scaleFactor} fill="#ccff00" />
        <circle cx={getX(67)} cy={getY(0.771 * height)} r={scaleFactor} fill="#ccff00" />
        
        {/* Thoracic / Core box */}
        <rect 
          x={getX(36)} 
          y={getY(0.771 * height)} 
          width={28 * scaleFactor} 
          height={24.375 * scaleFactor} 
          fill="none" 
          stroke="#00f2ff" 
          strokeWidth="0.5" 
          strokeDasharray="1,2" 
        />
        
        {/* Pelvic Belt / Hip line */}
        <line 
          x1={getX(36)} 
          y1={getY(0.446 * height)} 
          x2={getX(64)} 
          y2={getY(0.446 * height)} 
          stroke="#e0a0ff" 
          strokeWidth="0.8" 
          strokeDasharray="2,2" 
        />
        <circle cx={getX(36)} cy={getY(0.446 * height)} r={scaleFactor} fill="#e0a0ff" />
        <circle cx={getX(64)} cy={getY(0.446 * height)} r={scaleFactor} fill="#e0a0ff" />
        
        {/* Knees alignment */}
        <line 
          x1={getX(37)} 
          y1={getY(0.193 * height)} 
          x2={getX(63)} 
          y2={getY(0.193 * height)} 
          stroke="#3b82f6" 
          strokeWidth="0.5" 
          strokeDasharray="1,1" 
        />
        <circle cx={getX(37)} cy={getY(0.193 * height)} r={0.8 * scaleFactor} fill="#3b82f6" />
        <circle cx={getX(63)} cy={getY(0.193 * height)} r={0.8 * scaleFactor} fill="#3b82f6" />
        
        {/* Legs axis */}
        <line 
          x1={getX(36)} 
          y1={getY(0.446 * height)} 
          x2={getX(38)} 
          y2={getY(0)} 
          stroke="#00f2ff" 
          strokeWidth="0.5" 
          strokeDasharray="2,2" 
        />
        <line 
          x1={getX(64)} 
          y1={getY(0.446 * height)} 
          x2={getX(62)} 
          y2={getY(0)} 
          stroke="#00f2ff" 
          strokeWidth="0.5" 
          strokeDasharray="2,2" 
        />
        
        {/* Feet / Ground reference */}
        <line 
          x1={getX(25)} 
          y1={getY(0)} 
          x2={getX(75)} 
          y2={getY(0)} 
          stroke="#10b981" 
          strokeWidth="1" 
          strokeDasharray="3,3" 
        />
        <circle cx={getX(38)} cy={getY(0)} r={1.2 * scaleFactor} fill="#10b981" />
        <circle cx={getX(62)} cy={getY(0)} r={1.2 * scaleFactor} fill="#10b981" />
        
         {/* Centimeter ticks on the alignment guide for high precision matching */}
        {/* Head Top */}
        <line x1="20" y1={getY(height)} x2="80" y2={getY(height)} stroke="#00f2ff" strokeWidth="0.15" strokeDasharray="1,1" />
        <text x="18" y={getY(height) + 1} textAnchor="end" fill="#00f2ff" fontSize="2" fontFamily="monospace" fontWeight="bold">{height}cm</text>
        <text x="82" y={getY(height) + 1} textAnchor="start" fill="#00f2ff" fontSize="2" fontFamily="monospace" fontWeight="bold">{height}cm</text>

        {/* Shoulders */}
        <line x1="20" y1={getY(0.771 * height)} x2="80" y2={getY(0.771 * height)} stroke="#ccff00" strokeWidth="0.15" strokeDasharray="1,1" />
        <text x="18" y={getY(0.771 * height) + 1} textAnchor="end" fill="#ccff00" fontSize="2" fontFamily="monospace" fontWeight="bold">{Math.round(0.771 * height)}cm</text>
        <text x="82" y={getY(0.771 * height) + 1} textAnchor="start" fill="#ccff00" fontSize="2" fontFamily="monospace" fontWeight="bold">{Math.round(0.771 * height)}cm</text>

        {/* Pelvis */}
        <line x1="20" y1={getY(0.446 * height)} x2="80" y2={getY(0.446 * height)} stroke="#e0a0ff" strokeWidth="0.15" strokeDasharray="1,1" />
        <text x="18" y={getY(0.446 * height) + 1} textAnchor="end" fill="#e0a0ff" fontSize="2" fontFamily="monospace" fontWeight="bold">{Math.round(0.446 * height)}cm</text>
        <text x="82" y={getY(0.446 * height) + 1} textAnchor="start" fill="#e0a0ff" fontSize="2" fontFamily="monospace" fontWeight="bold">{Math.round(0.446 * height)}cm</text>

        {/* Knees */}
        <line x1="20" y1={getY(0.193 * height)} x2="80" y2={getY(0.193 * height)} stroke="#3b82f6" strokeWidth="0.15" strokeDasharray="1,1" />
        <text x="18" y={getY(0.193 * height) + 1} textAnchor="end" fill="#3b82f6" fontSize="2" fontFamily="monospace" fontWeight="bold">{Math.round(0.193 * height)}cm</text>
        <text x="82" y={getY(0.193 * height) + 1} textAnchor="start" fill="#3b82f6" fontSize="2" fontFamily="monospace" fontWeight="bold">{Math.round(0.193 * height)}cm</text>

        {/* Feet/Ground */}
        <line x1="20" y1={getY(0)} x2="80" y2={getY(0)} stroke="#10b981" strokeWidth="0.15" strokeDasharray="1,1" />
        <text x="18" y={getY(0) + 1} textAnchor="end" fill="#10b981" fontSize="2" fontFamily="monospace" fontWeight="bold">0cm</text>
        <text x="82" y={getY(0) + 1} textAnchor="start" fill="#10b981" fontSize="2" fontFamily="monospace" fontWeight="bold">0cm</text>

        {/* Grid labels with dynamic height text */}
        <text 
          x="50" 
          y={Math.max(6, getY(height) - 5)} 
          textAnchor="middle" 
          fill="#00f2ff" 
          fontSize="3" 
          fontFamily="monospace" 
          fontWeight="bold"
        >
          GUIA DE ALINHAMENTO ({height}cm)
        </text>
        <text 
          x="50" 
          y={Math.min(98, getY(0) + 4)} 
          textAnchor="middle" 
          fill="#10b981" 
          fontSize="2.5" 
          fontFamily="monospace"
        >
          LIMITADOR DOS PÉS
        </text>
      </svg>
    </div>
  );
}

// Sub-component to render image and bones adjusted to actual letterboxed image size
interface PostureImageWithBonesProps {
  src: string;
  alt: string;
  view: "front" | "back" | "right" | "left";
  markers: any[];
  isLightTheme: boolean;
  className?: string;
  renderSVGBones: (
    view: "front" | "back" | "right" | "left",
    markersList: any[],
    offsetX: number,
    offsetY: number,
    renderW: number,
    renderH: number
  ) => React.ReactNode;
}

const getMarkerColorLocal = (type: string) => {
  switch (type) {
    case "normal": return "bg-green-500 border-white";
    case "warning": return "bg-yellow-500 border-white";
    case "error": return "bg-red-500 border-white";
    default: return "bg-cyan-500 border-white";
  }
};

const PostureImageWithBones = ({
  src,
  alt,
  view,
  markers,
  isLightTheme,
  className = "relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-800 bg-black",
  renderSVGBones
}: PostureImageWithBonesProps) => {
  const [dimensions, setDimensions] = React.useState<{
    offsetX: number;
    offsetY: number;
    renderW: number;
    renderH: number;
  } | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    if (!imgWidth || !imgHeight || !containerWidth || !containerHeight) return;

    const imgRatio = imgWidth / imgHeight;
    const containerRatio = containerWidth / containerHeight;

    let renderW = containerWidth;
    let renderH = containerHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > containerRatio) {
      renderH = containerWidth / imgRatio;
      offsetY = (containerHeight - renderH) / 2;
    } else {
      renderW = containerHeight * imgRatio;
      offsetX = (containerWidth - renderW) / 2;
    }

    // Convert to percentages relative to container
    const offsetXPercent = (offsetX / containerWidth) * 100;
    const offsetYPercent = (offsetY / containerHeight) * 100;
    const renderWPercent = (renderW / containerWidth) * 100;
    const renderHPercent = (renderH / containerHeight) * 100;

    setDimensions({
      offsetX: offsetXPercent,
      offsetY: offsetYPercent,
      renderW: renderWPercent,
      renderH: renderHPercent
    });
  };

  // Recalculate on container resize
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const img = container.querySelector("img");
      if (img && img.naturalWidth) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        const imgRatio = imgWidth / imgHeight;
        const containerRatio = containerWidth / containerHeight;

        let renderW = containerWidth;
        let renderH = containerHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > containerRatio) {
          renderH = containerWidth / imgRatio;
          offsetY = (containerHeight - renderH) / 2;
        } else {
          renderW = containerHeight * imgRatio;
          offsetX = (containerWidth - renderW) / 2;
        }

        setDimensions({
          offsetX: (offsetX / containerWidth) * 100,
          offsetY: (offsetY / containerHeight) * 100,
          renderW: (renderW / containerWidth) * 100,
          renderH: (renderH / containerHeight) * 100
        });
      }
    };

    const observer = new ResizeObserver(() => {
      handleResize();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <img
        referrerPolicy="no-referrer"
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        className="w-full h-full object-contain bg-[#0e0f11]"
      />
      {dimensions && (
        <>
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {renderSVGBones(view, markers, dimensions.offsetX, dimensions.offsetY, dimensions.renderW, dimensions.renderH)}
          </svg>
          {markers.map((m, idx) => {
            const adjustedX = dimensions.offsetX + (m.x / 100) * dimensions.renderW;
            const adjustedY = dimensions.offsetY + (m.y / 100) * dimensions.renderH;
            return (
              <div
                key={`hist-marker-${idx}`}
                className={`absolute w-1.5 h-1.5 rounded-full ${getMarkerColorLocal(m.type)} border border-white pointer-events-none z-20`}
                style={{
                  left: `${adjustedX}%`,
                  top: `${adjustedY}%`,
                  transform: "translate(-50%, -50%)"
                }}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

export default function AnalisePosturalView({
  students,
  selectedStudentId,
  onSelectStudent,
  isEmbedded = false,
  onSaveAndAdvance
}: AnalisePosturalViewProps) {
  const activeStudentId = selectedStudentId || (students[0]?.id ?? "");

  const currentStudent = useMemo(() => {
    return students.find(s => s.id === activeStudentId) || students[0] || null;
  }, [students, activeStudentId]);

  const studentHeightCm = useMemo(() => {
    if (!currentStudent || !currentStudent.height) return DEFAULT_STUDENT_HEIGHT;
    let h = currentStudent.height;
    if (h < 3) {
      h = Math.round(h * 100);
    }
    return h;
  }, [currentStudent]);

  const renderLeftRuler = () => {
    const heightCm = studentHeightCm;
    
    const scaleFactor = rulerScalePercent / 100;
    // Top of container (0%) represents (90 / 75) * heightCm at scaleFactor = 1.0, 
    // which is 1.2 * heightCm. For arbitrary scaleFactor, the max displayed height is:
    const maxVal = Math.ceil((1.2 / scaleFactor) * heightCm);
    // Round to next 5cm
    const roundedMax = Math.ceil(maxVal / 5) * 5;
    
    const ticks: number[] = [];
    const step = 5; // Display ticks every 5cm for high clinical detail
    
    // Generate tick values from roundedMax down to 0
    for (let val = roundedMax; val >= 0; val -= step) {
      ticks.push(val);
    }
    
    const isLight = isLightTheme;
    
    return (
      <div 
        className={`absolute left-0 inset-y-0 w-11 flex flex-col justify-between py-0 px-1 z-20 font-mono select-none border-r backdrop-blur-md transition-all duration-75 shadow-lg ${
          isLight 
            ? "bg-white/95 text-black border-gray-300" 
            : "bg-black/85 text-[#00f2ff]/90 border-gray-850"
        }`}
        style={{
          transform: `translateY(${rulerShiftPercent}px)`
        }}
      >
        <div className="h-full relative overflow-hidden">
          {ticks.map((val, idx) => {
            const percentage = 90 - (val / heightCm) * (75 * scaleFactor);
            if (percentage < 0 || percentage > 100) return null;
            const isMajor = val % 20 === 0;
            const isMedium = val % 10 === 0;
            
            return (
              <div 
                key={idx} 
                className="absolute left-0 right-0 flex items-center h-0"
                style={{ top: `${percentage}%` }}
              >
                {/* Label for major/medium ticks */}
                {(isMajor || isMedium) && (
                  <span className={`text-[6.5px] font-bold absolute left-0.5 scale-90 ${
                    isLight ? "text-black" : "text-[#00f2ff]"
                  }`}>
                    {val}
                  </span>
                )}
                
                {/* Tick mark */}
                <div className={`absolute right-0 border-t ${
                  isMajor 
                    ? `w-4.5 ${isLight ? "border-black" : "border-[#00f2ff]"}` 
                    : isMedium
                      ? `w-3 ${isLight ? "border-gray-900" : "border-[#00f2ff]/70"}`
                      : `w-1.5 ${isLight ? "border-gray-600" : "border-gray-600/50"}`
                }`} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // View mode: "new" (perform evaluation) or "history" (view database)
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [showEvolucaoPosturalView, setShowEvolucaoPosturalView] = useState(false);

  // MediaPipe Pose Detector States
  const [poseDetector, setPoseDetector] = useState<PoseLandmarker | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);

  useEffect(() => {
    let active = true;
    let detectorRef: PoseLandmarker | null = null;

    async function initializeMediaPipe() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        const detector = await PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task"
            },
            runningMode: "IMAGE",
            numPoses: 1
          }
        );

        if (active) {
          detectorRef = detector;
          setPoseDetector(detector);
          setIsModelReady(true);
          console.log("MediaPipe PoseLandmarker loaded successfully");
        } else {
          detector.close();
        }
      } catch (err) {
        console.error("Erro carregando MediaPipe:", err);
      }
    }

    initializeMediaPipe();
    return () => {
      active = false;
      detectorRef?.close();
    };
  }, []);

  // Step wizard for new evaluation: 1 (Questionnaire), 2 (Photos & Guidelines), 3 (Interactive Mapping / Results)
  const [newEvalStep, setNewEvalStep] = useState<1 | 2 | 3>(1);

  // Loading and animation states
  const [isScanning, setIsScanning] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [activePhotoView, setActivePhotoView] = useState<"front" | "back" | "right" | "left">("front");
  const [draggingId, setDraggingId] = useState<{ view: string; id: string } | null>(null);

  // Focus-mode state additions for locking points & custom photo guides / scale / offsets
  const [isEditingUnlocked, setIsEditingUnlocked] = useState(false);
  const [photoFitMode, setPhotoFitMode] = useState<"contain" | "cover">("contain");
  const [photoScales, setPhotoScales] = useState<Record<string, number>>({
    front: 100,
    back: 100,
    right: 100,
    left: 100
  });
  const [photoOffsets, setPhotoOffsets] = useState<Record<string, { x: number; y: number }>>({
    front: { x: 0, y: 0 },
    back: { x: 0, y: 0 },
    right: { x: 0, y: 0 },
    left: { x: 0, y: 0 }
  });

  const [photoDimensions, setPhotoDimensions] = useState<Record<string, { width: number; height: number }>>({
    front: { width: 300, height: 400 },
    back: { width: 300, height: 400 },
    right: { width: 300, height: 400 },
    left: { width: 300, height: 400 }
  });

  const handleActiveImageLoad = (view: "front" | "back" | "right" | "left") => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setPhotoDimensions(prev => ({
        ...prev,
        [view]: { width: img.naturalWidth, height: img.naturalHeight }
      }));
    }
  };

  // Form Questionnaire States
  const [painCurrent, setPainCurrent] = useState("Não");
  const [painLocation, setPainLocation] = useState("Nenhum");
  const [lesionsHistory, setLesionsHistory] = useState("");
  const [hoursSitting, setHoursSitting] = useState(6);
  const [trainingLevel, setTrainingLevel] = useState("Intermediário");

  // Captured Photos States
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [rightPhoto, setRightPhoto] = useState<string | null>(null);
  const [leftPhoto, setLeftPhoto] = useState<string | null>(null);

  const uploadedPhotosCount = useMemo(() => {
    return [frontPhoto, backPhoto, rightPhoto, leftPhoto].filter(Boolean).length;
  }, [frontPhoto, backPhoto, rightPhoto, leftPhoto]);

  // Markers coordinate lists
  const [frontMarkers, setFrontMarkers] = useState(DEFAULT_COORDINATES.front);
  const [backMarkers, setBackMarkers] = useState(DEFAULT_COORDINATES.back);
  const [rightMarkers, setRightMarkers] = useState(DEFAULT_COORDINATES.right);
  const [leftMarkers, setLeftMarkers] = useState(DEFAULT_COORDINATES.left);

  // Manual Skeleton Scaling & Offset States
  const [skeletonScaleX, setSkeletonScaleX] = useState(100);
  const [skeletonScaleY, setSkeletonScaleY] = useState(100);
  const [skeletonOffsetX, setSkeletonOffsetX] = useState(0);
  const [skeletonOffsetY, setSkeletonOffsetY] = useState(0);
  
  const [baseMarkersForScaling, setBaseMarkersForScaling] = useState<Record<string, any[]>>({
    front: DEFAULT_COORDINATES.front,
    back: DEFAULT_COORDINATES.back,
    right: DEFAULT_COORDINATES.right,
    left: DEFAULT_COORDINATES.left,
  });

  // Keep baseMarkersForScaling synced with latest markers when sliders are at neutral (100, 100, 0, 0)
  useEffect(() => {
    if (
      skeletonScaleX === 100 &&
      skeletonScaleY === 100 &&
      skeletonOffsetX === 0 &&
      skeletonOffsetY === 0
    ) {
      setBaseMarkersForScaling({
        front: frontMarkers,
        back: backMarkers,
        right: rightMarkers,
        left: leftMarkers
      });
    }
  }, [frontMarkers, backMarkers, rightMarkers, leftMarkers]);

  // Reset sliders when active view changes
  useEffect(() => {
    setSkeletonScaleX(100);
    setSkeletonScaleY(100);
    setSkeletonOffsetX(0);
    setSkeletonOffsetY(0);
  }, [activePhotoView]);

  // Commit current skeleton adjustments to the baseline markers permanently
  const commitSkeletonToBase = (view: "front" | "back" | "right" | "left") => {
    if (
      skeletonScaleX === 100 &&
      skeletonScaleY === 100 &&
      skeletonOffsetX === 0 &&
      skeletonOffsetY === 0
    ) {
      return; // already neutral
    }

    let currentScaled: any[] = [];
    if (view === "front") currentScaled = frontMarkers;
    else if (view === "back") currentScaled = backMarkers;
    else if (view === "right") currentScaled = rightMarkers;
    else if (view === "left") currentScaled = leftMarkers;

    setBaseMarkersForScaling(prev => ({
      ...prev,
      [view]: currentScaled
    }));

    setSkeletonScaleX(100);
    setSkeletonScaleY(100);
    setSkeletonOffsetX(0);
    setSkeletonOffsetY(0);
  };

  // Handle manual proportional skeleton adjustments with support for multi-field adjustments
  const handleSkeletonAdjust = (
    view: "front" | "back" | "right" | "left",
    type: "scaleX" | "scaleY" | "offsetX" | "offsetY" | "all",
    value: number,
    multiValues?: { scaleX?: number; scaleY?: number; offsetX?: number; offsetY?: number }
  ) => {
    let newScaleX = skeletonScaleX;
    let newScaleY = skeletonScaleY;
    let newOffsetX = skeletonOffsetX;
    let newOffsetY = skeletonOffsetY;

    if (type === "all" && multiValues) {
      if (multiValues.scaleX !== undefined) {
        newScaleX = multiValues.scaleX;
        setSkeletonScaleX(multiValues.scaleX);
      }
      if (multiValues.scaleY !== undefined) {
        newScaleY = multiValues.scaleY;
        setSkeletonScaleY(multiValues.scaleY);
      }
      if (multiValues.offsetX !== undefined) {
        newOffsetX = multiValues.offsetX;
        setSkeletonOffsetX(multiValues.offsetX);
      }
      if (multiValues.offsetY !== undefined) {
        newOffsetY = multiValues.offsetY;
        setSkeletonOffsetY(multiValues.offsetY);
      }
    } else {
      if (type === "scaleX") {
        newScaleX = value;
        setSkeletonScaleX(value);
      } else if (type === "scaleY") {
        newScaleY = value;
        setSkeletonScaleY(value);
      } else if (type === "offsetX") {
        newOffsetX = value;
        setSkeletonOffsetX(value);
      } else if (type === "offsetY") {
        newOffsetY = value;
        setSkeletonOffsetY(value);
      }
    }

    const base = baseMarkersForScaling[view] || [];
    if (base.length === 0) return;

    const updated = applySkeletonAdjustment(
      base,
      newScaleX / 100,
      newScaleY / 100,
      newOffsetX,
      newOffsetY
    );

    if (view === "front") setFrontMarkers(updated);
    else if (view === "back") setBackMarkers(updated);
    else if (view === "right") setRightMarkers(updated);
    else if (view === "left") setLeftMarkers(updated);
  };

  // History list
  const [history, setHistory] = useState<PosturalEvaluation[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Comparison State
  const [compareEvalA, setCompareEvalA] = useState<string | null>(null);
  const [compareEvalB, setCompareEvalB] = useState<string | null>(null);
  const [showCompareMode, setShowCompareMode] = useState(false);

  // Delete Confirmation States
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [evalToDeleteId, setEvalToDeleteId] = useState<string | null>(null);

  // Unlock Confirmation States
  const [isUnlockConfirmOpen, setIsUnlockConfirmOpen] = useState(false);
  const [pendingDrag, setPendingDrag] = useState<{ view: "front" | "back" | "right" | "left"; id: string } | null>(null);

  // AI Posture Diagnosis (Biomechanical / Textual via Gemini)
  const [postureAiDiagnosis, setPostureAiDiagnosis] = useState<string | null>(null);
  const [isGeneratingDiagnosis, setIsGeneratingDiagnosis] = useState(false);

  // High Precision Adjustments, Rulers and Guides
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [selectedPointForGuide, setSelectedPointForGuide] = useState<string | null>(null);
  const [showRuler, setShowRuler] = useState(true);

  // Dynamic theme detection
  const [isLightTheme, setIsLightTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("treinopro_theme");
      if (saved) return saved === "light";
      return document.querySelector(".light-theme") !== null;
    }
    return false;
  });

  useEffect(() => {
    const checkTheme = () => {
      const saved = localStorage.getItem("treinopro_theme");
      setIsLightTheme(saved ? saved === "light" : document.querySelector(".light-theme") !== null);
    };
    checkTheme();
    const interval = setInterval(checkTheme, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ruler Calibration States
  const [rulerScalePercent, setRulerScalePercent] = useState(100);
  const [rulerShiftPercent, setRulerShiftPercent] = useState(0);

  // Refs for interactive drag
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Sync data whenever active student shifts
  useEffect(() => {
    if (currentStudent) {
      // Load saved evaluations from localStorage
      const key = `treinopro_postural_evaluations_${currentStudent.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as PosturalEvaluation[];
          // Filter out existing fictitious mock/seeded entries
          const realOnly = parsed.filter(
            e => !e.id.includes("-current") && !e.id.includes("-30days") && !e.id.includes("-90days")
          );
          setHistory(realOnly);
          if (realOnly.length > 0) {
            setCompareEvalA(realOnly[0].id);
            if (realOnly.length > 1) {
              setCompareEvalB(realOnly[1].id);
            } else {
              setCompareEvalB(null);
            }
          } else {
            setCompareEvalA(null);
            setCompareEvalB(null);
          }
        } catch (e) {
          console.error("Error loading postural history", e);
        }
      } else {
        // Start completely clean - do not seed fictitious evaluations
        setHistory([]);
        setCompareEvalA(null);
        setCompareEvalB(null);
      }
      setHistoryLoaded(true);

      // Reset form fields
      setPainCurrent("Não");
      setPainLocation("Nenhum");
      setLesionsHistory("");
      setHoursSitting(6);
      setTrainingLevel("Intermediário");

      // Reset photo fields
      setFrontPhoto(null);
      setBackPhoto(null);
      setRightPhoto(null);
      setLeftPhoto(null);

      // Reset photo adjustments & lock states
      setPhotoFitMode("contain");
      setPhotoScales({ front: 100, back: 100, right: 100, left: 100 });
      setPhotoOffsets({
        front: { x: 0, y: 0 },
        back: { x: 0, y: 0 },
        right: { x: 0, y: 0 },
        left: { x: 0, y: 0 }
      });
      setIsEditingUnlocked(false);

      // Reset markers
      setFrontMarkers(JSON.parse(JSON.stringify(DEFAULT_COORDINATES.front)));
      setBackMarkers(JSON.parse(JSON.stringify(DEFAULT_COORDINATES.back)));
      setRightMarkers(JSON.parse(JSON.stringify(DEFAULT_COORDINATES.right)));
      setLeftMarkers(JSON.parse(JSON.stringify(DEFAULT_COORDINATES.left)));

      setPostureAiDiagnosis(null);
      setNewEvalStep(1);
    }
  }, [currentStudent?.id]);

  // Mock sample generator for physical evaluation history
  function getSeededPosturalHistory(student: Student): PosturalEvaluation[] {
    return [];
  }

  // Live real-time calculations from point coordinates
  const computedMetrics = useMemo(() => {
    // Helper to map UI markers to standard PoseLandmark coordinates for posturalEngine
    const mapMarkersToLandmarks = (markers: any[]): PoseLandmark[] => {
      const landmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
        x: 0,
        y: 0,
        z: 0,
        visibility: 0.95
      }));

      markers.forEach(m => {
        const label = m.label.toLowerCase();
        const xVal = m.x / 100;
        const yVal = m.y / 100;

        if (label.includes("orelha direita") || label === "orelha") {
          landmarks[8] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
        }
        if (label.includes("orelha esquerda")) {
          landmarks[7] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
        }
        if (label.includes("ombro direito") || label === "ombro") {
          landmarks[12] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
        }
        if (label.includes("ombro esquerdo")) {
          landmarks[11] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
        }
        if (label.includes("quadril direito") || label === "quadril") {
          landmarks[24] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
        }
        if (label.includes("quadril esquerdo")) {
          landmarks[23] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
        }
        if (label.includes("joelho direito") || label === "joelho") {
          landmarks[26] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
        }
        if (label.includes("joelho esquerdo")) {
          landmarks[25] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
        }
        if (label.includes("tornozelo direito") || label === "tornozelo") {
          landmarks[28] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
        }
        if (label.includes("tornozelo esquerdo")) {
          landmarks[27] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
        }
      });

      return landmarks;
    };

    const hasSideData = Boolean(rightPhoto) || Boolean(leftPhoto);
    const sideMarkers = rightPhoto ? rightMarkers : (leftPhoto ? leftMarkers : []);

    const frontLms = mapMarkersToLandmarks(frontMarkers);
    const backLms = mapMarkersToLandmarks(backMarkers.length > 0 ? backMarkers : frontMarkers);
    const sideLms = mapMarkersToLandmarks(sideMarkers);

    // Call biomechanical engine modules
    const cervicalResult = hasSideData 
      ? calcularCervical(sideLms, "right") 
      : calcularCervical(frontLms, "front");

    const ombrosResult = calcularOmbros(frontLms, "front");
    const escapulasResult = calcularEscapulas(backLms, "back");
    const pelveResult = calcularPelve(frontLms, "front");
    const joelhosResult = calcularJoelhos(frontLms, "front");
    const escolioseResult = calcularEscolioseVisual(backLms, "back");

    const simetriaScore = calcularSimetria(frontLms, "front");
    const mobilidadeScore = calcularMobilidade(
      hasSideData ? sideLms : frontLms, 
      hasSideData ? "right" : "front",
      {
        nome: currentStudent?.name,
        idade: currentStudent?.age || DEFAULT_STUDENT_AGE,
        sexo: currentStudent?.gender || "Masculino",
        peso: currentStudent?.weight || DEFAULT_STUDENT_WEIGHT,
        altura: currentStudent?.height || DEFAULT_STUDENT_HEIGHT,
        tempoSentado: hoursSitting,
        nivelTreino: trainingLevel
      }
    );
    const estabilidadeScore = calcularEstabilidade(hasSideData ? sideLms : frontLms, hasSideData ? "right" : "front");

    // Call gerarKPI
    const kpi = gerarKPI({
      cervical: cervicalResult,
      ombros: ombrosResult,
      escapulas: escapulasResult,
      pelve: pelveResult,
      joelhos: joelhosResult,
      escolioseVisual: escolioseResult,
      simetria: simetriaScore,
      mobilidade: mobilidadeScore,
      estabilidade: estabilidadeScore
    });

    // Sub-scores mapping
    const cervicalDisplay = hasSideData ? kpi.subScores.cervical : null;
    const stabilityDisplay = hasSideData ? estabilidadeScore : null;

    // Generate descriptive labels
    const cervicalText = !hasSideData
      ? "Cabeça: Foto lateral não enviada — índice não avaliado"
      : cervicalResult.classification.severity === "normal"
      ? "Cabeça: Alinhamento cervical excelente"
      : `Cabeça: +${cervicalResult.anteriorizationCm.toFixed(1)} cm anteriorizada (desvio de ${cervicalResult.angle.toFixed(1)}°)`;

    const shoulderText = ombrosResult.classification.severity === "normal"
      ? "Ombros: Alinhamento bilateral harmonioso"
      : `Ombros: Desnível de ombros estimado de ${ombrosResult.angle.toFixed(1)}°`;

    const pelvicText = !hasSideData
      ? "Pelve: Inclinação sagital não avaliada (sem foto lateral)"
      : pelveResult.classification.severity === "normal"
      ? "Pelve: Alinhamento e inclinação normais"
      : `Pelve: Inclinação estimada de ${pelveResult.angle.toFixed(1)}°`;

    const kneeText = joelhosResult.valgoVaroTendency === "Neutro"
      ? "Joelhos: Alinhamento fêmoro-patelar simétrico"
      : `Joelhos: Tendência sutil a ${joelhosResult.valgoVaroTendency.toLowerCase()} detectada`;

    // Compose observations and recommendations
    const observations: string[] = [];
    if (!hasSideData) {
      observations.push("Nenhuma foto de perfil (lateral) foi enviada. Os índices Cervical, Estabilidade e Inclinação Pélvica não puderam ser calculados com precisão.");
    }
    
    // Add postural observations based on severities
    if (cervicalResult.classification.severity !== "normal" && hasSideData) {
      observations.push(`Há indícios visuais compatíveis com assimetria postural cervical: anteriorização da cabeça estimada em ${cervicalResult.anteriorizationCm} cm.`);
    }
    if (ombrosResult.classification.severity !== "normal") {
      observations.push(`Há indícios de desnível escapular/ombros lateral de ${ombrosResult.angle.toFixed(1)}°.`);
    }
    if (pelveResult.classification.severity !== "normal") {
      observations.push(`Há indícios visuais compatíveis com desalinhamento ou báscula pélvica de ${pelveResult.angle.toFixed(1)}°.`);
    }
    if (joelhosResult.classification.severity !== "normal" && joelhosResult.valgoVaroTendency !== "Neutro") {
      observations.push(`Há indícios visuais compatíveis com tendência a desvio patelar do tipo ${joelhosResult.valgoVaroTendency.toLowerCase()}.`);
    }
    if (hoursSitting > 7) {
      observations.push("Há indícios de encurtamento de flexores de quadril em virtude da alta permanência em posição sentada.");
    }
    if (observations.length === 0) {
      observations.push("Alinhamento estrutural excelente. Sem tendências de assimetria ou desvios expressivos observados.");
    }

    // Corrective suggestions exercises from standard report
    const fullReport = gerarRelatorio(hasSideData ? sideLms : frontLms, hasSideData ? "right" : "front", {
      nome: currentStudent?.name || "Aluno",
      idade: currentStudent?.age || DEFAULT_STUDENT_AGE,
      sexo: currentStudent?.gender || "Masculino",
      peso: currentStudent?.weight || DEFAULT_STUDENT_WEIGHT,
      altura: currentStudent?.height || DEFAULT_STUDENT_HEIGHT,
      tempoSentado: hoursSitting,
      nivelTreino: trainingLevel,
      objetivo: currentStudent?.currentPhase || "Hipertrofia"
    });

    const suggestions = fullReport.exerciciosCorretivos.map(ex => ({
      name: ex.name,
      description: ex.description,
      target: ex.target,
      sets: ex.sets,
      reps: ex.reps,
      notes: "Realizar com controle motor e foco no alinhamento"
    }));

    return {
      hasSideData,
      cervicalScore: cervicalDisplay,
      scapularScore: kpi.subScores.escapular,
      pelvicScore: kpi.subScores.pelvico,
      simetriaScore,
      estabilidadeScore: stabilityDisplay,
      mobilidadeScore,
      geralScore: kpi.scoreFinal,
      risk: kpi.riscoCompensatorio,
      cervicalText,
      shoulderText,
      pelvicText,
      kneeText,
      observations,
      suggestions
    };
  }, [frontMarkers, backMarkers, rightMarkers, leftMarkers, rightPhoto, leftPhoto, hoursSitting, trainingLevel, currentStudent]);

  // Handle Dragging Anatomic Markers
  const handleMarkerMouseDown = (view: "front" | "back" | "right" | "left", labelOrId: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedPointForGuide(labelOrId);
    if (!isEditingUnlocked) {
      setPendingDrag({ view, id: labelOrId });
      setIsUnlockConfirmOpen(true);
      return;
    }
    commitSkeletonToBase(view);
    setDraggingId({ view, id: labelOrId });
  };

  const handleMarkerTouchStart = (view: "front" | "back" | "right" | "left", labelOrId: string) => (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault(); // evita que o scroll da página "roube" o gesto de arrastar
    setSelectedPointForGuide(labelOrId);
    if (!isEditingUnlocked) {
      setPendingDrag({ view, id: labelOrId });
      setIsUnlockConfirmOpen(true);
      return;
    }
    commitSkeletonToBase(view);
    setDraggingId({ view, id: labelOrId });
  };

  useEffect(() => {
    if (!draggingId) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (!imageContainerRef.current) return;
      const rect = imageContainerRef.current.getBoundingClientRect();
      
      let x = ((clientX - rect.left) / rect.width) * 100;
      let y = ((clientY - rect.top) / rect.height) * 100;

      x = Math.max(0.5, Math.min(99.5, x));
      y = Math.max(0.5, Math.min(99.5, y));

      const updateMarkerList = (list: typeof frontMarkers) => {
        return list.map(m => {
          const mId = m.id || m.label;
          return mId === draggingId.id ? { ...m, x, y } : m;
        });
      };

      if (draggingId.view === "front") setFrontMarkers(updateMarkerList);
      else if (draggingId.view === "back") setBackMarkers(updateMarkerList);
      else if (draggingId.view === "right") setRightMarkers(updateMarkerList);
      else if (draggingId.view === "left") setLeftMarkers(updateMarkerList);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleEnd = () => {
      setDraggingId(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [draggingId]);

  // Simulate Instant Load Mock Photos for demo/testing
  const handleLoadMockPhotos = () => {
    setFrontPhoto(MOCK_PHOTOS.front);
    setBackPhoto(MOCK_PHOTOS.back);
    setRightPhoto(MOCK_PHOTOS.right);
    setLeftPhoto(MOCK_PHOTOS.left);
  };

  // Detect body points using MediaPipe PoseLandmarker
  async function detectBodyPoints(
    imageUrl: string,
    view: "front" | "back" | "right" | "left"
  ): Promise<void> {
    if (!poseDetector) {
      console.warn("Pose detector not initialized");
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      img.onload = () => {
        try {
          const result = poseDetector.detect(img);

          if (!result.landmarks || result.landmarks.length === 0) {
            console.warn(`Nenhum corpo detectado para a vista ${view}. Utilizando coordenadas padrão.`);
            resolve();
            return;
          }

          const p = result.landmarks[0] as PoseLandmark[];
          
          // Pre-analysis posture photo validation
          const validation = validarCaptura(p);
          if (!validation.valid) {
            reject(new Error(validation.reason));
            return;
          }
          
          if (view === "front") {
            const mappedMarkers = [
              {
                id: "front-orelha-d",
                label: "Orelha Direita",
                x: p[8] ? p[8].x * 100 : 42,
                y: p[8] ? p[8].y * 100 : 15,
                type: "normal" as const
              },
              {
                id: "front-orelha-e",
                label: "Orelha Esquerda",
                x: p[7] ? p[7].x * 100 : 58,
                y: p[7] ? p[7].y * 100 : 15,
                type: "normal" as const
              },
              {
                id: "front-ombro-d",
                label: "Ombro Direito",
                x: p[12] ? p[12].x * 100 : 33,
                y: p[12] ? p[12].y * 100 : 28,
                type: "normal" as const
              },
              {
                id: "front-ombro-e",
                label: "Ombro Esquerdo",
                x: p[11] ? p[11].x * 100 : 67,
                y: p[11] ? p[11].y * 100 : 28,
                type: "normal" as const
              },
              {
                id: "front-quad-d",
                label: "Quadril Direito",
                x: p[24] ? p[24].x * 100 : 36,
                y: p[24] ? p[24].y * 100 : 55,
                type: "normal" as const
              },
              {
                id: "front-quad-e",
                label: "Quadril Esquerdo",
                x: p[23] ? p[23].x * 100 : 64,
                y: p[23] ? p[23].y * 100 : 55,
                type: "normal" as const
              },
              {
                id: "front-joe-d",
                label: "Joelho Direito",
                x: p[26] ? p[26].x * 100 : 37,
                y: p[26] ? p[26].y * 100 : 76,
                type: "normal" as const
              },
              {
                id: "front-joe-e",
                label: "Joelho Esquerdo",
                x: p[25] ? p[25].x * 100 : 63,
                y: p[25] ? p[25].y * 100 : 76,
                type: "normal" as const
              },
              {
                id: "front-tor-d",
                label: "Tornozelo Direito",
                x: p[28] ? p[28].x * 100 : 38,
                y: p[28] ? p[28].y * 100 : 92,
                type: "normal" as const
              },
              {
                id: "front-tor-e",
                label: "Tornozelo Esquerdo",
                x: p[27] ? p[27].x * 100 : 62,
                y: p[27] ? p[27].y * 100 : 92,
                type: "normal" as const
              }
            ];
            setFrontMarkers(mappedMarkers);
          } else if (view === "back") {
            const shR_x = p[12] ? p[12].x * 100 : 33;
            const shR_y = p[12] ? p[12].y * 100 : 28;
            const shL_x = p[11] ? p[11].x * 100 : 67;
            const shL_y = p[11] ? p[11].y * 100 : 28;

            const hipR_x = p[24] ? p[24].x * 100 : 36;
            const hipR_y = p[24] ? p[24].y * 100 : 55;
            const hipL_x = p[23] ? p[23].x * 100 : 64;
            const hipL_y = p[23] ? p[23].y * 100 : 55;

            const mappedMarkers = [
              {
                id: "back-ombro-d",
                label: "Ombro Direito",
                x: shR_x,
                y: shR_y,
                type: "normal" as const
              },
              {
                id: "back-ombro-e",
                label: "Ombro Esquerdo",
                x: shL_x,
                y: shL_y,
                type: "normal" as const
              },
              {
                id: "back-esc-d",
                label: "Escápula Direita",
                x: shR_x + 3,
                y: shR_y + 6,
                type: "normal" as const
              },
              {
                id: "back-esc-e",
                label: "Escápula Esquerda",
                x: shL_x - 3,
                y: shL_y + 6,
                type: "normal" as const
              },
              {
                id: "back-col-t",
                label: "Coluna Torácica",
                x: (shR_x + shL_x) / 2,
                y: (shR_y + shL_y) / 2 + 12,
                type: "normal" as const
              },
              {
                id: "back-col-l",
                label: "Coluna Lombar",
                x: (hipR_x + hipL_x) / 2,
                y: (hipR_y + hipL_y) / 2 - 10,
                type: "normal" as const
              },
              {
                id: "back-quad-d",
                label: "Quadril Direito",
                x: hipR_x,
                y: hipR_y,
                type: "normal" as const
              },
              {
                id: "back-quad-e",
                label: "Quadril Esquerdo",
                x: hipL_x,
                y: hipL_y,
                type: "normal" as const
              },
              {
                id: "back-tor-d",
                label: "Tornozelo Direito",
                x: p[28] ? p[28].x * 100 : 38,
                y: p[28] ? p[28].y * 100 : 92,
                type: "normal" as const
              },
              {
                id: "back-tor-e",
                label: "Tornozelo Esquerdo",
                x: p[27] ? p[27].x * 100 : 62,
                y: p[27] ? p[27].y * 100 : 92,
                type: "normal" as const
              }
            ];
            setBackMarkers(mappedMarkers);
          } else if (view === "right") {
            const mappedMarkers = [
              {
                id: "right-orelha",
                label: "Orelha",
                x: p[8] ? p[8].x * 100 : 44,
                y: p[8] ? p[8].y * 100 : 15,
                type: "normal" as const
              },
              {
                id: "right-ombro",
                label: "Ombro",
                x: p[12] ? p[12].x * 100 : 52,
                y: p[12] ? p[12].y * 100 : 28,
                type: "normal" as const
              },
              {
                id: "right-quad",
                label: "Quadril",
                x: p[24] ? p[24].x * 100 : 49,
                y: p[24] ? p[24].y * 100 : 55,
                type: "normal" as const
              },
              {
                id: "right-joe",
                label: "Joelho",
                x: p[26] ? p[26].x * 100 : 47,
                y: p[26] ? p[26].y * 100 : 76,
                type: "normal" as const
              },
              {
                id: "right-tor",
                label: "Tornozelo",
                x: p[28] ? p[28].x * 100 : 49,
                y: p[28] ? p[28].y * 100 : 92,
                type: "normal" as const
              }
            ];
            setRightMarkers(mappedMarkers);
          } else if (view === "left") {
            const mappedMarkers = [
              {
                id: "left-orelha",
                label: "Orelha",
                x: p[7] ? p[7].x * 100 : 56,
                y: p[7] ? p[7].y * 100 : 15,
                type: "normal" as const
              },
              {
                id: "left-ombro",
                label: "Ombro",
                x: p[11] ? p[11].x * 100 : 48,
                y: p[11] ? p[11].y * 100 : 28,
                type: "normal" as const
              },
              {
                id: "left-quad",
                label: "Quadril",
                x: p[23] ? p[23].x * 100 : 51,
                y: p[23] ? p[23].y * 100 : 55,
                type: "normal" as const
              },
              {
                id: "left-joe",
                label: "Joelho",
                x: p[25] ? p[25].x * 100 : 53,
                y: p[25] ? p[25].y * 100 : 76,
                type: "normal" as const
              },
              {
                id: "left-tor",
                label: "Tornozelo",
                x: p[27] ? p[27].x * 100 : 51,
                y: p[27] ? p[27].y * 100 : 92,
                type: "normal" as const
              }
            ];
            setLeftMarkers(mappedMarkers);
          }
          resolve();
        } catch (err) {
          console.error(`Erro ao analisar landmarks para vista ${view}:`, err);
          resolve();
        }
      };

      img.onerror = () => {
        console.error(`Erro no carregamento da imagem para detecção de pose: ${view}`);
        resolve();
      };
    });
  }

  // Run AI Skeleton Processing with MediaPipe AI Scan
  const handleTriggerAIScan = async () => {
    const uploadedPhotos = [frontPhoto, backPhoto, rightPhoto, leftPhoto].filter(Boolean);
    if (uploadedPhotos.length < 2) {
      alert("Erro de Validação:\nPelo menos 2 fotos posturais são obrigatórias para realizar o esqueleto fotostático digital (ex: Frente e Costas, ou Frente e Lateral).");
      return;
    }

    // Photo quality validation
    const tooSmall = uploadedPhotos.some(
      photo => photo && photo.startsWith("data:") && photo.length < 500
    );
    if (tooSmall) {
      alert("Erro de Qualidade da Imagem:\nUma ou mais imagens fornecidas possuem resolução insuficiente ou dados corrompidos. Por favor, envie fotos nítidas.");
      return;
    }

    setIsScanning(true);

    try {
      if (isModelReady && poseDetector) {
        if (frontPhoto) await detectBodyPoints(frontPhoto, "front");
        if (backPhoto) await detectBodyPoints(backPhoto, "back");
        if (rightPhoto) await detectBodyPoints(rightPhoto, "right");
        if (leftPhoto) await detectBodyPoints(leftPhoto, "left");
      } else {
        console.log("MediaPipe não está carregado. Usando pontos predefinidos para simulação.");
      }

      // Transition smoothly to next screen
      setTimeout(() => {
        setIsScanning(false);
        // Find first available photo view and set it active
        const firstAvailable = (["front", "back", "right", "left"] as const).find(
          key => {
            if (key === "front") return !!frontPhoto;
            if (key === "back") return !!backPhoto;
            if (key === "right") return !!rightPhoto;
            return !!leftPhoto;
          }
        );
        if (firstAvailable) {
          setActivePhotoView(firstAvailable);
        }
        setNewEvalStep(3); // advance to interactive visualization
      }, 1500);
    } catch (err: any) {
      console.error("Erro durante o escaneamento por MediaPipe:", err);
      setIsScanning(false);
      alert(err.message || "Refaça a foto para maior precisão.");
    }
  };

  // Run posture diagnosis call to Gemini AI
  const handleRunPostureAiDiagnosis = async () => {
    if (!currentStudent) return;
    setIsGeneratingDiagnosis(true);
    setPostureAiDiagnosis(null);

    try {
      const previousRecord = history.length > 0 ? history[0] : null;
      const previousAnalysis = previousRecord ? previousRecord.aiReport : undefined;

      let aiProvider = "gemini";
      try {
        const savedSettings = localStorage.getItem("treinopro_settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.aiProvider) {
            aiProvider = parsed.aiProvider;
          }
        }
      } catch (e) {
        console.error(e);
      }

      const response = await fetch("/api/analyze-body", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontPhoto,
          sidePhoto: rightPhoto || leftPhoto || "",
          backPhoto,
          previousAnalysis,
          studentName: currentStudent.name,
          gender: currentStudent.gender || "Masculino",
          age: currentStudent.age || DEFAULT_STUDENT_AGE,
          weight: currentStudent.weight || DEFAULT_STUDENT_WEIGHT,
          height: currentStudent.height || DEFAULT_STUDENT_HEIGHT,
          aiProvider
        })
      });

      const data = await response.json();
      if (data.analysis) {
        setPostureAiDiagnosis(data.analysis);
      } else {
        alert("Ocorreu um erro ao gerar o laudo de Inteligência Artificial.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro de conexão ao processar as imagens: " + err.message);
    } finally {
      setIsGeneratingDiagnosis(false);
    }
  };

  // Save Postural evaluation record
  const handleSavePosturalRecord = () => {
    if (!currentStudent) return;

    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();

    const newEval: PosturalEvaluation = {
      id: `postural-${currentStudent.id}-${Date.now()}`,
      studentId: currentStudent.id,
      date: `${mm}/${yyyy}`,
      timestamp: Date.now(),
      answers: {
        dorAtual: painCurrent,
        localDor: painLocation,
        lesoesHistorico: lesionsHistory,
        tempoSentado: hoursSitting,
        nivelTreino: trainingLevel,
        nome: currentStudent.name,
        idade: currentStudent.age || DEFAULT_STUDENT_AGE,
        sexo: currentStudent.gender || "Masculino",
        peso: currentStudent.weight || DEFAULT_STUDENT_WEIGHT,
        altura: currentStudent.height || DEFAULT_STUDENT_HEIGHT,
        objetivo: currentStudent.currentPhase || "Hipertrofia"
      },
      photos: {
        front: frontPhoto,
        back: backPhoto,
        right: rightPhoto,
        left: leftPhoto
      },
      markers: {
        front: frontMarkers,
        back: backMarkers,
        right: rightMarkers,
        left: leftMarkers
      },
      kpis: {
        cervical: computedMetrics.cervicalScore,
        escapular: computedMetrics.scapularScore,
        pelvico: computedMetrics.pelvicScore,
        simetria: computedMetrics.simetriaScore,
        estabilidade: computedMetrics.estabilidadeScore,
        mobilidade: computedMetrics.mobilidadeScore,
        geral: computedMetrics.geralScore,
        compensacaoRisco: computedMetrics.risk
      },
      deviations: {
        cervical: computedMetrics.cervicalText,
        ombros: computedMetrics.shoulderText,
        pelve: computedMetrics.pelvicText,
        joelhos: computedMetrics.kneeText,
        geral: `Simetria torácica calculada em ${computedMetrics.simetriaScore}%. Risco de compensação muscular em nível ${computedMetrics.risk}.`
      },
      observations: computedMetrics.observations,
      suggestions: computedMetrics.suggestions,
      aiReport: postureAiDiagnosis || undefined
    };

    const updatedHistory = [newEval, ...history];
    
    try {
      localStorage.setItem(`treinopro_postural_evaluations_${currentStudent.id}`, JSON.stringify(updatedHistory));
    } catch (err: any) {
      console.warn("Storage quota exceeded for student evaluation history. Attempting self-healing by pruning older photos...", err);
      if (err.name === "QuotaExceededError" || err.code === 22) {
        try {
          // Keep photos only for the 3 newest evaluations, strip photos for older ones
          const optimized = updatedHistory.map((item: any, idx: number) => {
            if (idx >= 3) {
              return {
                ...item,
                photos: {}
              };
            }
            return item;
          });
          localStorage.setItem(`treinopro_postural_evaluations_${currentStudent.id}`, JSON.stringify(optimized));
          setHistory(optimized);
        } catch (retryErr) {
          console.error("Erro ao salvar avaliação postural mesmo após remoção de fotos antigas:", retryErr);
          alert(
            "Não foi possível salvar a avaliação: o armazenamento local (localStorage) está sem espaço.\n\n" +
            "Por favor, exclua avaliações antigas do histórico antes de tentar salvar novamente."
          );
          return;
        }
      } else {
        alert("Erro ao salvar avaliação postural.");
        return;
      }
    }

    setHistory(updatedHistory);
    
    // Save to the mock SQL database table "avaliacoes_posturais" in localStorage to fulfill the DB persistence requirement
    try {
      const dbStr = localStorage.getItem("treinopro_avaliacoes_posturais_db") || "[]";
      const db = JSON.parse(dbStr);
      
      const newDbRecord = {
        id: newEval.id,
        aluno_id: currentStudent.id,
        avaliacao_fisica_id: `fisica-eval-fk-${Date.now()}`, // mock FK or null
        data_avaliacao: newEval.date,
        fotos_urls: JSON.stringify(newEval.photos),
        analise_ia: JSON.stringify(newEval.kpis),
        desvios_posturais: JSON.stringify(newEval.deviations),
        testes_especificos: JSON.stringify([
          { nome: "Overhead Squat Test", resultado: "Déficit funcional pélvico leve" },
          { nome: "Thomas Test", resultado: "Encurtamento leve flexor de quadril" }
        ]),
        risco_lesao: newEval.kpis.compensacaoRisco.toLowerCase(),
        regioes_risco: JSON.stringify((newEval.kpis.geral ?? 0) < 80 ? ["Cintura Escapular", "Lombar"] : ["Cervical", "Torácica"]),
        recomendacoes: JSON.stringify(newEval.suggestions),
        laudo_narrativo: newEval.aiReport || "Sem laudo narrativo disponível.",
        observacoes: JSON.stringify(newEval.observations),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Update or insert
      const existingIdx = db.findIndex((r: any) => r.id === newEval.id);
      if (existingIdx >= 0) {
        db[existingIdx] = newDbRecord;
      } else {
        db.push(newDbRecord);
      }
      
      try {
        localStorage.setItem("treinopro_avaliacoes_posturais_db", JSON.stringify(db));
      } catch (dbErr: any) {
        if (dbErr.name === "QuotaExceededError" || dbErr.code === 22) {
          console.warn("Storage quota exceeded in treinopro_avaliacoes_posturais_db. Pruning older photos in general db...");
          const optimizedDb = db.map((record: any, idx: number) => {
            // Keep photos only for the 5 newest records across all students in the general db
            if (idx < db.length - 5) {
              return {
                ...record,
                fotos_urls: JSON.stringify({})
              };
            }
            return record;
          });
          localStorage.setItem("treinopro_avaliacoes_posturais_db", JSON.stringify(optimizedDb));
        } else {
          throw dbErr;
        }
      }
      console.log("Postural analysis database record saved successfully:", newDbRecord);
    } catch (e) {
      console.error("Error writing to postural db table", e);
    }

    // Also save via the new avaliacaoService to keep databases synced
    try {
      salvarAvaliacao({
        id: newEval.id,
        alunoId: currentStudent.id,
        data: new Date().toISOString(),
        fotos: {
          frente: frontPhoto || undefined,
          costas: backPhoto || undefined,
          ladoDireito: rightPhoto || undefined,
          ladoEsquerdo: leftPhoto || undefined
        },
        marcadores: frontMarkers,
        metricas: {
          simetria: computedMetrics.simetriaScore,
          ombro: computedMetrics.scapularScore,
          pelve: computedMetrics.pelvicScore,
          cabeca: computedMetrics.cervicalScore ?? 0,
          risco: computedMetrics.risk === "Baixo" ? 10 : computedMetrics.risk === "Médio" ? 50 : 90
        },
        observacoes: computedMetrics.observations
      });
    } catch (err) {
      console.error("Error saving through avaliacaoService:", err);
    }

    // Set active values for comparisons
    setCompareEvalA(newEval.id);
    if (updatedHistory.length > 1) {
      setCompareEvalB(updatedHistory[1].id);
    }

    setActiveTab("history");
    alert("Avaliação Postural com IA salva com sucesso no histórico!");

    // Sync with Firestore so student mobile app receives it immediately
    import("../../../shared/infrastructure/sync/SyncManager").then(({ SyncManager }) => {
      SyncManager.getInstance().sync();
    }).catch(err => console.error("Error triggering sync on save:", err));
  };

  // Delete postural evaluation record
  const handleDeleteEvalClick = (id: string) => {
    setEvalToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteEval = () => {
    if (evalToDeleteId && currentStudent) {
      const updated = history.filter(item => item.id !== evalToDeleteId);
      setHistory(updated);
      try {
        localStorage.setItem(`treinopro_postural_evaluations_${currentStudent.id}`, JSON.stringify(updated));
        
        // Also clean up from mock db in localStorage to keep them completely synchronized
        const dbStr = localStorage.getItem("treinopro_avaliacoes_posturais_db") || "[]";
        const db = JSON.parse(dbStr);
        const filteredDb = db.filter((r: any) => r.id !== evalToDeleteId);
        localStorage.setItem("treinopro_avaliacoes_posturais_db", JSON.stringify(filteredDb));

        // Sync with Firestore
        import("../../../shared/infrastructure/sync/SyncManager").then(({ SyncManager }) => {
          SyncManager.getInstance().sync();
        }).catch(err => console.error("Error triggering sync on delete:", err));
      } catch (err) {
        console.error("Erro ao excluir do localStorage:", err);
      }
    }
    setIsDeleteConfirmOpen(false);
    setEvalToDeleteId(null);
  };

  const [isExportingImage, setIsExportingImage] = useState(false);

  const handlePrintLaudo = () => {
    window.print();
  };

  const handleExportComparisonImage = async () => {
    if (!evalAData || !evalBData || !currentStudent) {
      alert("Selecione duas avaliações para comparar antes de exportar.");
      return;
    }
    setIsExportingImage(true);

    try {
      // Helper function to load images
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = src;
        });
      };

      // Helper to fit image inside destination rectangle
      const drawContainedImage = (
        ctx: CanvasRenderingContext2D,
        img: HTMLImageElement,
        dx: number,
        dy: number,
        dWidth: number,
        dHeight: number
      ) => {
        const imgRatio = img.width / img.height;
        const panelRatio = dWidth / dHeight;
        let sWidth = dWidth;
        let sHeight = dHeight;
        let sx = dx;
        let sy = dy;
        if (imgRatio > panelRatio) {
          sHeight = dWidth / imgRatio;
          sy = dy + (dHeight - sHeight) / 2;
        } else {
          sWidth = dHeight * imgRatio;
          sx = dx + (dWidth - sWidth) / 2;
        }
        ctx.drawImage(img, sx, sy, sWidth, sHeight);
        return { x: sx, y: sy, width: sWidth, height: sHeight };
      };

      // Helper to draw skeleton/bones on canvas
      const drawBonesOnCanvas = (
        ctx: CanvasRenderingContext2D,
        view: "front" | "back" | "right" | "left",
        markersList: any[],
        xOffset: number,
        yOffset: number,
        width: number,
        height: number
      ) => {
        const getM = (lbl: string) => markersList.find(m => m.label === lbl);
        const drawLine = (p1: any, p2: any, color: string, lineWidth: number, dashArray?: number[]) => {
          if (!p1 || !p2) return;
          const x1 = xOffset + (p1.x / 100) * width;
          const y1 = yOffset + (p1.y / 100) * height;
          const x2 = xOffset + (p2.x / 100) * width;
          const y2 = yOffset + (p2.y / 100) * height;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          if (dashArray) {
            ctx.setLineDash(dashArray);
          } else {
            ctx.setLineDash([]);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        };

        const drawPoint = (p: any, color: string, radius: number) => {
          if (!p) return;
          const x = xOffset + (p.x / 100) * width;
          const y = yOffset + (p.y / 100) * height;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.stroke();
        };

        if (view === "front") {
          const orelhaD = getM("Orelha Direita");
          const orelhaE = getM("Orelha Esquerda");
          const ombroD = getM("Ombro Direito");
          const ombroE = getM("Ombro Esquerdo");
          const quadD = getM("Quadril Direito");
          const quadE = getM("Quadril Esquerdo");
          const joeD = getM("Joelho Direito");
          const joeE = getM("Joelho Esquerdo");
          const torD = getM("Tornozelo Direito");
          const torE = getM("Tornozelo Esquerdo");

          drawLine(orelhaD, orelhaE, "#00f2ff", 2, [3, 3]);
          drawLine(ombroD, ombroE, "#ccff00", 3);
          drawLine(quadD, quadE, "#e0a0ff", 3);
          drawLine(ombroD, quadD, "rgba(255,255,255,0.45)", 1.5);
          drawLine(ombroE, quadE, "rgba(255,255,255,0.45)", 1.5);
          drawLine(quadD, joeD, "#3b82f6", 2);
          drawLine(quadE, joeE, "#3b82f6", 2);
          drawLine(joeD, torD, "#10b981", 2);
          drawLine(joeE, torE, "#10b981", 2);

          [orelhaD, orelhaE, ombroD, ombroE, quadD, quadE, joeD, joeE, torD, torE].forEach(pt => {
            if (pt) drawPoint(pt, "#00f2ff", 5);
          });
        } else if (view === "back") {
          const ombroD = getM("Ombro Direito");
          const ombroE = getM("Ombro Esquerdo");
          const escD = getM("Escápula Direita");
          const escE = getM("Escápula Esquerda");
          const colT = getM("Coluna Torácica");
          const colL = getM("Coluna Lombar");
          const quadD = getM("Quadril Direito");
          const quadE = getM("Quadril Esquerdo");
          const torD = getM("Tornozelo Direito");
          const torE = getM("Tornozelo Esquerdo");

          const shoulderMidX = ombroD && ombroE ? (ombroD.x + ombroE.x) / 2 : 50;
          const shoulderMidY = ombroD && ombroE ? (ombroD.y + ombroE.y) / 2 : 28;
          const hipMidX = quadD && quadE ? (quadD.x + quadE.x) / 2 : 50;
          const hipMidY = quadD && quadE ? (quadD.y + quadE.y) / 2 : 55;

          const shoulderMid = { x: shoulderMidX, y: shoulderMidY };
          const hipMid = { x: hipMidX, y: hipMidY };

          drawLine(ombroD, ombroE, "#ccff00", 2.5);
          drawLine(escD, escE, "#00f2ff", 2.5, [2, 2]);
          drawLine(shoulderMid, colT, "#ef4444", 2.5);
          drawLine(colT, colL, "#ef4444", 2.5);
          drawLine(colL, hipMid, "#ef4444", 2.5);
          drawLine(quadD, quadE, "#e0a0ff", 2.5);
          drawLine(quadD, torD, "#3b82f6", 1.5);
          drawLine(quadE, torE, "#3b82f6", 1.5);

          [ombroD, ombroE, escD, escE, colT, colL, quadD, quadE, torD, torE].forEach(pt => {
            if (pt) drawPoint(pt, "#00f2ff", 5);
          });
        } else if (view === "right" || view === "left") {
          const orelha = getM("Orelha");
          const ombro = getM("Ombro");
          const quad = getM("Quadril");
          const joelho = getM("Joelho");
          const tornozelo = getM("Tornozelo");

          drawLine(orelha, ombro, "#ccff00", 2.5);
          drawLine(ombro, quad, "#00f2ff", 2.5);
          drawLine(quad, joelho, "#3b82f6", 2.5);
          drawLine(joelho, tornozelo, "#10b981", 2.5);

          [orelha, ombro, quad, joelho, tornozelo].forEach(pt => {
            if (pt) drawPoint(pt, "#00f2ff", 5);
          });
        }
      };

      // 1. Create a canvas
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2D context");

      // 2. Draw background (Sleek professional dark gray)
      ctx.fillStyle = "#0d0e10";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid or lines on the background for posture scanning look
      ctx.strokeStyle = "rgba(0, 242, 255, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw a sleek colored glowing bar at the top
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#00f2ff");
      gradient.addColorStop(0.5, "#ebb2ff");
      gradient.addColorStop(1, "#ccff00");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, 8);

      // 3. Draw Header text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px monospace";
      ctx.fillText("LAUDO COMPARATIVO DE EVOLUÇÃO POSTURAL", 50, 48);

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "14px sans-serif";
      ctx.fillText(`Mapeamento Postural TreinoPro | Diagnóstico Métrico de Cadeias Lesivas`, 50, 72);

      // Student Info Panel on the top right
      ctx.fillStyle = "#161719";
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.fillRect(canvas.width - 450, 20, 400, 70);
      ctx.strokeRect(canvas.width - 450, 20, 400, 70);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px monospace";
      ctx.fillText(`ALUNO: ${currentStudent.name.toUpperCase()}`, canvas.width - 430, 42);
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "11px monospace";
      ctx.fillText(`Idade: ${evalAData.answers.idade} anos | Peso: ${evalAData.answers.peso} kg`, canvas.width - 430, 58);
      ctx.fillText(`Nível: ${evalAData.answers.nivelTreino} | Sit: ${evalAData.answers.tempoSentado}h sent.`, canvas.width - 430, 74);

      // 4. Panel coordinates
      const panelY = 120;
      const panelWidth = 700;
      const panelHeight = 650;
      const padding = 50;

      // Left Panel: Eval B (Older)
      const leftX = padding;
      ctx.fillStyle = "#121315";
      ctx.fillRect(leftX, panelY, panelWidth, panelHeight);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.strokeRect(leftX, panelY, panelWidth, panelHeight);

      // Right Panel: Eval A (Newer)
      const rightX = canvas.width - panelWidth - padding;
      ctx.fillStyle = "#121315";
      ctx.fillRect(rightX, panelY, panelWidth, panelHeight);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.strokeRect(rightX, panelY, panelWidth, panelHeight);

      // 5. Draw images + bones
      // Let's draw Eval B image
      if (evalBData.photos.front) {
        try {
          const imgB = await loadImage(evalBData.photos.front);
          const drawnB = drawContainedImage(ctx, imgB, leftX + 15, panelY + 50, panelWidth - 30, panelHeight - 110);
          drawBonesOnCanvas(ctx, "front", evalBData.markers.front, drawnB.x, drawnB.y, drawnB.width, drawnB.height);
        } catch (e) {
          console.error("Failed to load older photo", e);
          ctx.fillStyle = "#ef4444";
          ctx.font = "bold 14px monospace";
          ctx.fillText("IMAGEM INDISPONÍVEL", leftX + panelWidth / 2 - 80, panelY + panelHeight / 2);
        }
      }

      // Draw Eval A image
      if (evalAData.photos.front) {
        try {
          const imgA = await loadImage(evalAData.photos.front);
          const drawnA = drawContainedImage(ctx, imgA, rightX + 15, panelY + 50, panelWidth - 30, panelHeight - 110);
          drawBonesOnCanvas(ctx, "front", evalAData.markers.front, drawnA.x, drawnA.y, drawnA.width, drawnA.height);
        } catch (e) {
          console.error("Failed to load newer photo", e);
          ctx.fillStyle = "#ef4444";
          ctx.font = "bold 14px monospace";
          ctx.fillText("IMAGEM INDISPONÍVEL", rightX + panelWidth / 2 - 80, panelY + panelHeight / 2);
        }
      }

      // Draw Titles on top of panels
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 13px monospace";
      ctx.fillText(`AVALIAÇÃO DE REFERÊNCIA - ANTERIOR (${evalBData.date})`, leftX + 20, panelY + 30);
      ctx.fillText(`AVALIAÇÃO DE EVOLUÇÃO - ATUAL (${evalAData.date})`, rightX + 20, panelY + 30);

      // 6. Stats cards below photos (inside panels or underneath them)
      const drawKpisBelow = (x: number, data: typeof evalAData) => {
        const itemY = panelY + panelHeight - 50;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(x + 15, itemY, panelWidth - 30, 40);
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.strokeRect(x + 15, itemY, panelWidth - 30, 40);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.fillText(`GERAL: ${data.kpis.geral}%`, x + 25, itemY + 24);
        ctx.fillStyle = "#ccff00";
        ctx.fillText(`SIMETRIA: ${data.kpis.simetria}%`, x + 155, itemY + 24);
        ctx.fillStyle = "#00f2ff";
        ctx.fillText(`CERVICAL: ${data.kpis.cervical}%`, x + 305, itemY + 24);
        ctx.fillStyle = "#e0a0ff";
        ctx.fillText(`ESCAPULAR: ${data.kpis.escapular}%`, x + 455, itemY + 24);
        ctx.fillStyle = "#ffb900";
        ctx.fillText(`PÉLVICO: ${data.kpis.pelvico}%`, x + 605, itemY + 24);
      };

      drawKpisBelow(leftX, evalBData);
      drawKpisBelow(rightX, evalAData);

      // 7. Comparative evolution indicator at the bottom center
      const footerY = 800;
      const footerWidth = canvas.width - 2 * padding;
      ctx.fillStyle = "#121315";
      ctx.fillRect(padding, footerY, footerWidth, 130);
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.strokeRect(padding, footerY, footerWidth, 130);

      const scoreDiff = evalAData.kpis.geral - evalBData.kpis.geral;
      const symmDiff = evalAData.kpis.simetria - evalBData.kpis.simetria;

      // Big comparative badge
      ctx.fillStyle = scoreDiff >= 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)";
      ctx.fillRect(padding + 20, footerY + 20, 320, 90);
      ctx.strokeStyle = scoreDiff >= 0 ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)";
      ctx.strokeRect(padding + 20, footerY + 20, 320, 90);

      ctx.fillStyle = scoreDiff >= 0 ? "#10b981" : "#ef4444";
      ctx.font = "bold 32px monospace";
      const diffText = scoreDiff >= 0 ? `+${scoreDiff}%` : `${scoreDiff}%`;
      ctx.fillText(diffText, padding + 40, footerY + 70);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("EVOLUÇÃO POSTURAL GERAL", padding + 160, footerY + 50);
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "11px sans-serif";
      ctx.fillText(scoreDiff >= 0 ? "Melhoria funcional positiva detectada" : "Déficit postural em relação à referência", padding + 160, footerY + 70);

      // Diagnostic comparison lines on the right side of the footer card
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px monospace";
      ctx.fillText("METAS DE CORREÇÃO BIOMECÂNICA ALCANÇADAS:", padding + 380, footerY + 40);

      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#a1a1aa";
      ctx.fillText(`• Evolução de Simetria Lateral: `, padding + 380, footerY + 65);
      ctx.fillStyle = symmDiff >= 0 ? "#ccff00" : "#ef4444";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`${symmDiff >= 0 ? "+" : ""}${symmDiff}% no índice escapular/pélvico`, padding + 590, footerY + 65);

      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#a1a1aa";
      ctx.fillText(`• Nível de Risco de Compensação Estimado: `, padding + 380, footerY + 90);
      ctx.fillStyle = evalAData.kpis.compensacaoRisco === "Baixo" ? "#10b981" : evalAData.kpis.compensacaoRisco === "Médio" ? "#eab308" : "#ef4444";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`${evalAData.kpis.compensacaoRisco.toUpperCase()}`, padding + 670, footerY + 90);

      // Signature & copyright
      ctx.fillStyle = "#52525b";
      ctx.font = "italic 11px sans-serif";
      ctx.fillText("TreinoPro Clinical Biomechanics © 2026", padding + 1150, footerY + 110);

      // 8. Export to PNG
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `comparativo_postural_${currentStudent.name.replace(/\s+/g, "_").toLowerCase()}_${evalBData.date.replace(/\//g, "-")}_vs_${evalAData.date.replace(/\//g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert("Erro ao exportar a imagem comparativa. Por favor, tente novamente.");
    } finally {
      setIsExportingImage(false);
    }
  };

  // Dropdown list mapping of historical elements
  const selectedEvaluationForView = useMemo(() => {
    if (!compareEvalA) return history[0] || null;
    return history.find(e => e.id === compareEvalA) || history[0] || null;
  }, [compareEvalA, history]);

  // Comparison evaluation maps
  const evalAData = useMemo(() => {
    return history.find(e => e.id === compareEvalA) || null;
  }, [compareEvalA, history]);

  const evalBData = useMemo(() => {
    return history.find(e => e.id === compareEvalB) || null;
  }, [compareEvalB, history]);

  // Recharts Evolution Data mapping
  const evolutionChartData = useMemo(() => {
    return [...history]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(item => ({
        date: item.date,
        "Postura Geral": item.kpis.geral,
        "Simetria": item.kpis.simetria,
        "Cervical": item.kpis.cervical,
        "Escapular": item.kpis.escapular,
        "Pélvico": item.kpis.pelvico
      }));
  }, [history]);

  // Helper method to draw SVG bone joints
  const renderSVGBones = (
    view: "front" | "back" | "right" | "left",
    markersList: typeof frontMarkers,
    offsetX: number = 0,
    offsetY: number = 0,
    renderW: number = 100,
    renderH: number = 100
  ) => {
    const adjustedMarkers = markersList.map(m => ({
      ...m,
      x: offsetX + (m.x / 100) * renderW,
      y: offsetY + (m.y / 100) * renderH
    }));
    const getM = (lbl: string) => adjustedMarkers.find(m => m.label === lbl);

    if (view === "front") {
      const orelhaD = getM("Orelha Direita");
      const orelhaE = getM("Orelha Esquerda");
      const ombroD = getM("Ombro Direito");
      const ombroE = getM("Ombro Esquerdo");
      const quadD = getM("Quadril Direito");
      const quadE = getM("Quadril Esquerdo");
      const joeD = getM("Joelho Direito");
      const joeE = getM("Joelho Esquerdo");
      const torD = getM("Tornozelo Direito");
      const torE = getM("Tornozelo Esquerdo");

      return (
        <>
          {/* Eyes/Ears line */}
          {orelhaD && orelhaE && (
            <line x1={`${orelhaD.x}%`} y1={`${orelhaD.y}%`} x2={`${orelhaE.x}%`} y2={`${orelhaE.y}%`} stroke="#00f2ff" strokeWidth="2" strokeDasharray="3" />
          )}
          {/* Shoulder line */}
          {ombroD && ombroE && (
            <line x1={`${ombroD.x}%`} y1={`${ombroD.y}%`} x2={`${ombroE.x}%`} y2={`${ombroE.y}%`} stroke="#ccff00" strokeWidth="2.5" />
          )}
          {/* Hip line */}
          {quadD && quadE && (
            <line x1={`${quadD.x}%`} y1={`${quadD.y}%`} x2={`${quadE.x}%`} y2={`${quadE.y}%`} stroke="#e0a0ff" strokeWidth="2.5" />
          )}
          {/* Right trunk lateral */}
          {ombroD && quadD && (
            <line x1={`${ombroD.x}%`} y1={`${ombroD.y}%`} x2={`${quadD.x}%`} y2={`${quadD.y}%`} stroke="#ffffff40" strokeWidth="1.5" />
          )}
          {/* Left trunk lateral */}
          {ombroE && quadE && (
            <line x1={`${ombroE.x}%`} y1={`${ombroE.y}%`} x2={`${quadE.x}%`} y2={`${quadE.y}%`} stroke="#ffffff40" strokeWidth="1.5" />
          )}
          {/* Right Leg */}
          {quadD && joeD && (
            <line x1={`${quadD.x}%`} y1={`${quadD.y}%`} x2={`${joeD.x}%`} y2={`${joeD.y}%`} stroke="#3b82f6" strokeWidth="2" />
          )}
          {/* Left Leg */}
          {quadE && joeE && (
            <line x1={`${quadE.x}%`} y1={`${quadE.y}%`} x2={`${joeE.x}%`} y2={`${joeE.y}%`} stroke="#3b82f6" strokeWidth="2" />
          )}
          {/* Right Shin */}
          {joeD && torD && (
            <line x1={`${joeD.x}%`} y1={`${joeD.y}%`} x2={`${torD.x}%`} y2={`${torD.y}%`} stroke="#10b981" strokeWidth="2" />
          )}
          {/* Left Shin */}
          {joeE && torE && (
            <line x1={`${joeE.x}%`} y1={`${joeE.y}%`} x2={`${torE.x}%`} y2={`${torE.y}%`} stroke="#10b981" strokeWidth="2" />
          )}
        </>
      );
    }

    if (view === "back") {
      const ombroD = getM("Ombro Direito");
      const ombroE = getM("Ombro Esquerdo");
      const escD = getM("Escápula Direita");
      const escE = getM("Escápula Esquerda");
      const colT = getM("Coluna Torácica");
      const colL = getM("Coluna Lombar");
      const quadD = getM("Quadril Direito");
      const quadE = getM("Quadril Esquerdo");
      const torD = getM("Tornozelo Direito");
      const torE = getM("Tornozelo Esquerdo");

      // Midpoints
      const shoulderMidX = ombroD && ombroE ? (ombroD.x + ombroE.x) / 2 : 50;
      const shoulderMidY = ombroD && ombroE ? (ombroD.y + ombroE.y) / 2 : 28;
      const hipMidX = quadD && quadE ? (quadD.x + quadE.x) / 2 : 50;
      const hipMidY = quadD && quadE ? (quadD.y + quadE.y) / 2 : 55;

      return (
        <>
          {/* Shoulder line */}
          {ombroD && ombroE && (
            <line x1={`${ombroD.x}%`} y1={`${ombroD.y}%`} x2={`${ombroE.x}%`} y2={`${ombroE.y}%`} stroke="#ccff00" strokeWidth="2" />
          )}
          {/* Scapulas line */}
          {escD && escE && (
            <line x1={`${escD.x}%`} y1={`${escD.y}%`} x2={`${escE.x}%`} y2={`${escE.y}%`} stroke="#00f2ff" strokeWidth="2.5" strokeDasharray="2" />
          )}
          {/* Spine vertical axis */}
          {colT && (
            <line x1={`${shoulderMidX}%`} y1={`${shoulderMidY}%`} x2={`${colT.x}%`} y2={`${colT.y}%`} stroke="#ef4444" strokeWidth="2.5" />
          )}
          {colT && colL && (
            <line x1={`${colT.x}%`} y1={`${colT.y}%`} x2={`${colL.x}%`} y2={`${colL.y}%`} stroke="#ef4444" strokeWidth="2.5" />
          )}
          {colL && (
            <line x1={`${colL.x}%`} y1={`${colL.y}%`} x2={`${hipMidX}%`} y2={`${hipMidY}%`} stroke="#ef4444" strokeWidth="2.5" />
          )}
          {/* Hip line */}
          {quadD && quadE && (
            <line x1={`${quadD.x}%`} y1={`${quadD.y}%`} x2={`${quadE.x}%`} y2={`${quadE.y}%`} stroke="#e0a0ff" strokeWidth="2.5" />
          )}
          {/* Right Leg */}
          {quadD && torD && (
            <line x1={`${quadD.x}%`} y1={`${quadD.y}%`} x2={`${torD.x}%`} y2={`${torD.y}%`} stroke="#3b82f6" strokeWidth="1.5" />
          )}
          {/* Left Leg */}
          {quadE && torE && (
            <line x1={`${quadE.x}%`} y1={`${quadE.y}%`} x2={`${torE.x}%`} y2={`${torE.y}%`} stroke="#3b82f6" strokeWidth="1.5" />
          )}
        </>
      );
    }

    if (view === "right" || view === "left") {
      const orelha = getM("Orelha");
      const ombro = getM("Ombro");
      const quad = getM("Quadril");
      const joelho = getM("Joelho");
      const tornozelo = getM("Tornozelo");

      return (
        <>
          {orelha && ombro && (
            <line x1={`${orelha.x}%`} y1={`${orelha.y}%`} x2={`${ombro.x}%`} y2={`${ombro.y}%`} stroke="#ccff00" strokeWidth="2.5" />
          )}
          {ombro && quad && (
            <line x1={`${ombro.x}%`} y1={`${ombro.y}%`} x2={`${quad.x}%`} y2={`${quad.y}%`} stroke="#00f2ff" strokeWidth="2.5" />
          )}
          {quad && joelho && (
            <line x1={`${quad.x}%`} y1={`${quad.y}%`} x2={`${joelho.x}%`} y2={`${joelho.y}%`} stroke="#3b82f6" strokeWidth="2.5" />
          )}
          {joelho && tornozelo && (
            <line x1={`${joelho.x}%`} y1={`${joelho.y}%`} x2={`${tornozelo.x}%`} y2={`${tornozelo.y}%`} stroke="#10b981" strokeWidth="2.5" />
          )}
        </>
      );
    }

    return null;
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "normal": return "bg-green-500 border-white";
      case "warning": return "bg-yellow-500 border-white";
      case "error": return "bg-red-500 border-white";
      default: return "bg-cyan-500 border-white";
    }
  };

  const activePhotoState = useMemo(() => {
    if (activePhotoView === "front") return frontPhoto;
    if (activePhotoView === "back") return backPhoto;
    if (activePhotoView === "right") return rightPhoto;
    return leftPhoto;
  }, [activePhotoView, frontPhoto, backPhoto, rightPhoto, leftPhoto]);

  const activeMarkersList = useMemo(() => {
    if (activePhotoView === "front") return frontMarkers;
    if (activePhotoView === "back") return backMarkers;
    if (activePhotoView === "right") return rightMarkers;
    return leftMarkers;
  }, [activePhotoView, frontMarkers, backMarkers, rightMarkers, leftMarkers]);

  const activeLayout = useMemo(() => {
    const nat = photoDimensions[activePhotoView] || { width: 300, height: 400 };
    const imgRatio = nat.width / nat.height;
    const containerRatio = 3 / 4; // aspect-[3/4]

    let renderW = 100;
    let renderH = 100;
    let offsetX = 0;
    let offsetY = 0;

    if (photoFitMode === "contain") {
      if (imgRatio > containerRatio) {
        renderH = (containerRatio / imgRatio) * 100;
        offsetY = (100 - renderH) / 2;
      } else {
        renderW = (imgRatio / containerRatio) * 100;
        offsetX = (100 - renderW) / 2;
      }
    } else {
      // cover
      if (imgRatio > containerRatio) {
        renderW = (imgRatio / containerRatio) * 100;
        offsetX = (100 - renderW) / 2;
      } else {
        renderH = (containerRatio / imgRatio) * 100;
        offsetY = (100 - renderH) / 2;
      }
    }

    return { offsetX, offsetY, renderW, renderH };
  }, [activePhotoView, photoDimensions, photoFitMode]);

  // Keyboard fine-tuning (Arrows to nudge selected marker, WASD to adjust whole skeleton, +/- to scale skeleton)
  useEffect(() => {
    if (newEvalStep !== 3) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs or textareas
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
      const wasdKeys = ["w", "a", "s", "d", "W", "A", "S", "D"];
      const scaleKeys = ["+", "=", "-", "_"];

      if (!arrowKeys.includes(e.key) && !wasdKeys.includes(e.key) && !scaleKeys.includes(e.key)) {
        return;
      }

      // Prevent window scrolling/shortcuts
      e.preventDefault();

      // Case 1: Dragging active marker via ARROW keys
      if (arrowKeys.includes(e.key)) {
        const activeLabel = selectedPointForGuide || (activeMarkersList[0]?.id || activeMarkersList[0]?.label);
        if (!activeLabel) return;

        let direction: "left" | "right" | "up" | "down" = "up";
        if (e.key === "ArrowUp") direction = "up";
        else if (e.key === "ArrowDown") direction = "down";
        else if (e.key === "ArrowLeft") direction = "left";
        else if (e.key === "ArrowRight") direction = "right";

        const amount = e.shiftKey ? 1.0 : 0.25; // Shift key for bigger steps

        const updateList = (list: typeof frontMarkers) => {
          return list.map(m => {
            const mId = m.id || m.label;
            if (mId === activeLabel) {
              let newX = m.x;
              let newY = m.y;
              if (direction === "left") newX = Math.max(0.1, m.x - amount);
              else if (direction === "right") newX = Math.min(99.9, m.x + amount);
              else if (direction === "up") newY = Math.max(0.1, m.y - amount);
              else if (direction === "down") newY = Math.min(99.9, m.y + amount);
              return { ...m, x: newX, y: newY };
            }
            return m;
          });
        };

        if (activePhotoView === "front") setFrontMarkers(updateList);
        else if (activePhotoView === "back") setBackMarkers(updateList);
        else if (activePhotoView === "right") setRightMarkers(updateList);
        else if (activePhotoView === "left") setLeftMarkers(updateList);
      }

      // Case 2: WASD keys to nudge entire skeleton position
      if (wasdKeys.includes(e.key)) {
        const keyLower = e.key.toLowerCase();
        let diffX = 0;
        let diffY = 0;
        const amount = e.shiftKey ? 1.5 : 0.5;

        if (keyLower === "w") diffY = -amount;
        else if (keyLower === "s") diffY = amount;
        else if (keyLower === "a") diffX = -amount;
        else if (keyLower === "d") diffX = amount;

        const nextOffsetX = Math.max(-30, Math.min(30, skeletonOffsetX + diffX));
        const nextOffsetY = Math.max(-30, Math.min(30, skeletonOffsetY + diffY));

        handleSkeletonAdjust(
          activePhotoView,
          "all",
          0,
          { offsetX: nextOffsetX, offsetY: nextOffsetY }
        );
      }

      // Case 3: +/- keys to scale entire skeleton size
      if (scaleKeys.includes(e.key)) {
        const isGrow = e.key === "+" || e.key === "=";
        const amount = e.shiftKey ? 4 : 2;
        const diff = isGrow ? amount : -amount;

        const nextScaleX = Math.max(50, Math.min(150, skeletonScaleX + diff));
        const nextScaleY = Math.max(50, Math.min(150, skeletonScaleY + diff));

        handleSkeletonAdjust(
          activePhotoView,
          "all",
          0,
          { scaleX: nextScaleX, scaleY: nextScaleY }
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    newEvalStep,
    selectedPointForGuide,
    activePhotoView,
    activeMarkersList,
    frontMarkers,
    backMarkers,
    rightMarkers,
    leftMarkers,
    skeletonOffsetX,
    skeletonOffsetY,
    skeletonScaleX,
    skeletonScaleY
  ]);

  // Helper to compress uploaded images to prevent localStorage QuotaExceededError
  const compressImage = (base64Str: string, maxWidth = 500, maxHeight = 500, quality = 0.5): Promise<string> => {
    return new Promise((resolve) => {
      if (!base64Str || !base64Str.startsWith("data:image")) {
        resolve(base64Str);
        return;
      }
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedBase64);
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  // Handle local file changes
  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>, view: "front" | "back" | "right" | "left") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          compressImage(base64).then((compressed) => {
            if (view === "front") setFrontPhoto(compressed);
            else if (view === "back") setBackPhoto(compressed);
            else if (view === "right") setRightPhoto(compressed);
            else if (view === "left") setLeftPhoto(compressed);
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!currentStudent) {
    return (
      <div className="glass-panel p-8 text-center rounded-xl bg-[#1f2022]/40 border border-[#3a494b]/10">
        <Activity className="w-12 h-12 text-[#3a494b] mx-auto mb-3 animate-pulse" />
        <h3 className="text-white font-bold font-mono uppercase text-sm tracking-wider">Nenhum Aluno Selecionado</h3>
        <p className="text-gray-400 text-xs mt-1">Por favor, cadastre um aluno ou selecione um para iniciar a análise postural.</p>
      </div>
    );
  }

  return (
    <>
      <div id="analise-postural-view" className="space-y-6 print:hidden">
      
      {/* Upper selector panel */}
      <div className={`glass-panel p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1f2022]/40 border border-[#3a494b]/10 shadow-lg ${isEmbedded ? "md:justify-end" : ""}`}>
        {!isEmbedded && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Activity className="w-5 h-5 text-[#ccff00]" />
            <span className="font-mono text-xs font-semibold text-[#e3e2e4] uppercase tracking-wider">
              Aluno Ativo:
            </span>
            <select
              value={activeStudentId}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="bg-[#121315] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-1.5 rounded-lg text-xs font-mono outline-none transition-all cursor-pointer max-w-xs"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.currentPhase})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* View toggles */}
        <div className={`flex bg-[#121315] p-1 rounded-lg border border-[#3a494b]/30 ${isEmbedded ? "w-full md:w-auto justify-center" : ""}`}>
          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "new" 
                ? "bg-cyan-500 text-black shadow-md" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Nova Análise
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "history" 
                ? "bg-cyan-500 text-black shadow-md" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Histórico & Comparação ({history.length})
          </button>
        </div>
      </div>

      {activeTab === "new" ? (
        <div className="space-y-6">
          
          {/* STEPPER WIZARD HEADERS */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: 1, label: "1. Ficha & Hábitos", icon: FileText, color: "text-amber-400" },
              { step: 2, label: "2. Fotos & Orientações", icon: Camera, color: "text-cyan-400" },
              { step: 3, label: "3. Laboratório Biomecânico", icon: Sparkles, color: "text-[#ccff00]" }
            ].map(s => (
              <button
                key={s.step}
                disabled={s.step > newEvalStep}
                onClick={() => setNewEvalStep(s.step as 1 | 2 | 3)}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl border transition-all text-xs font-mono font-bold uppercase ${
                  newEvalStep === s.step
                    ? isLightTheme
                      ? "bg-white text-gray-950 border-cyan-500/50 shadow-[0_0_12px_rgba(0,242,255,0.15)]"
                      : "bg-[#121315] text-white border-cyan-500/30 shadow-[0_0_12px_rgba(0,242,255,0.1)]"
                    : s.step < newEvalStep
                    ? "bg-cyan-500/5 text-cyan-400 border-cyan-500/10 hover:bg-cyan-500/10 cursor-pointer"
                    : isLightTheme
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-[#121315]/30 text-gray-600 border-gray-900/40 cursor-not-allowed"
                }`}
              >
                <s.icon className={`w-4 h-4 ${newEvalStep === s.step ? s.color : "text-gray-500"}`} />
                <span className="hidden md:inline">{s.label}</span>
                <span className="md:hidden">{s.step}</span>
              </button>
            ))}
          </div>

          {/* STEP 1: QUESTIONNAIRE */}
          {newEvalStep === 1 && (
            <div className={`glass-panel p-6 rounded-2xl ${isLightTheme ? "bg-white border-gray-200" : "bg-[#121315]/50 border border-gray-850"} space-y-6`}>
              <div className={`border-b ${isLightTheme ? "border-gray-200" : "border-gray-900"} pb-3`}>
                <h3 className={`text-lg font-bold font-mono uppercase tracking-wider ${isLightTheme ? "text-gray-950" : "text-white"} flex items-center gap-2`}>
                  <FileText className="w-5 h-5 text-amber-400" /> Ficha Anamnética Postural
                </h3>
                <p className={`${isLightTheme ? "text-gray-600" : "text-gray-400"} text-xs font-mono mt-1`}>Preencha o perfil tensional e hábitos corporais do aluno antes de capturar as imagens.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Prefilled Fields Read-Only Card */}
                <div className={`border rounded-xl p-4 space-y-3.5 ${isLightTheme ? "bg-gray-50 border-gray-200" : "bg-black/40 border border-gray-900"}`}>
                  <span className="text-[10px] font-mono font-bold text-[#ccff00] uppercase tracking-wider bg-[#ccff00]/10 px-2.5 py-1 rounded border border-[#ccff00]/20">Informações Biométricas</span>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1.5 text-xs font-mono">
                    <div>
                      <span className="text-gray-500 block">Nome do Aluno</span>
                      <span className={`font-bold ${isLightTheme ? "text-gray-900" : "text-gray-200"}`}>{currentStudent.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Gênero Biológico</span>
                      <span className={`font-bold ${isLightTheme ? "text-gray-900" : "text-gray-200"}`}>{currentStudent.gender || "Masculino"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Idade</span>
                      <span className={`${isLightTheme ? "text-gray-900" : "text-gray-200"} font-bold`}>{currentStudent.age || 28} anos</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Dimensões</span>
                      <span className={`${isLightTheme ? "text-gray-900" : "text-gray-200"} font-bold`}>{currentStudent.weight || 78} kg / {studentHeightCm} cm</span>
                    </div>
                    <div className={`col-span-2 border-t pt-2 mt-1 ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                      <span className="text-gray-500 block">Objetivo no Treino</span>
                      <span className={`${isLightTheme ? "text-cyan-700 font-extrabold" : "text-[#00f2ff] font-bold"}`}>{currentStudent.currentPhase || "Hipertrofia de Alta Performance"}</span>
                    </div>
                  </div>
                </div>

                {/* Questionary Interactive Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>Dor ou Desconforto Atualmente?</label>
                      <select
                        value={painCurrent}
                        onChange={(e) => setPainCurrent(e.target.value)}
                        className={`w-full text-xs font-mono px-3 py-2 rounded-lg outline-none focus:border-cyan-500 ${
                          isLightTheme
                            ? "bg-white border-gray-300 text-gray-950 focus:ring-1 focus:ring-cyan-500/20"
                            : "bg-[#121315] border-gray-800 text-white"
                        }`}
                      >
                        <option value="Não">Não</option>
                        <option value="Sim">Sim, recorrente</option>
                        <option value="Sutil">Sutil / Apenas pós-treino</option>
                      </select>
                    </div>

                    <div>
                      <label className={`text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>Local Primário da Dor (se houver)</label>
                      <select
                        value={painLocation}
                        onChange={(e) => setPainLocation(e.target.value)}
                        className={`w-full text-xs font-mono px-3 py-2 rounded-lg outline-none focus:border-cyan-500 ${
                          isLightTheme
                            ? "bg-white border-gray-300 text-gray-950 focus:ring-1 focus:ring-cyan-500/20"
                            : "bg-[#121315] border-gray-800 text-white"
                        }`}
                      >
                        <option value="Nenhum">Nenhum / Ausente</option>
                        <option value="Cervical">Região Cervical (Pescoço)</option>
                        <option value="Ombros">Cintura Escapular (Ombros)</option>
                        <option value="Toracica">Coluna Torácica (Meio das Costas)</option>
                        <option value="Lombar">Coluna Lombar (Fundo das Costas)</option>
                        <option value="Joelhos">Articulação dos Joelhos</option>
                        <option value="Tornozelos">Tornozelos / Pés</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>Histórico de Lesões, Cirurgias ou Patologias (opcional)</label>
                    <textarea
                      placeholder="Ex: Entorse antiga no tornozelo esquerdo, luxação de ombro em 2024..."
                      value={lesionsHistory}
                      onChange={(e) => setLesionsHistory(e.target.value)}
                      className={`w-full h-16 text-xs font-mono px-3 py-2 rounded-lg outline-none focus:border-cyan-500 resize-none ${
                        isLightTheme
                          ? "bg-white border-gray-300 text-gray-950 focus:ring-1 focus:ring-cyan-500/20"
                          : "bg-[#121315] border-gray-800 text-white"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>Tempo Médio Sentado por Dia (Horas)</label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={hoursSitting}
                        onChange={(e) => setHoursSitting(Number(e.target.value))}
                        className={`w-full text-xs font-mono px-3 py-2 rounded-lg outline-none focus:border-cyan-500 ${
                          isLightTheme
                            ? "bg-white border-gray-300 text-gray-950 focus:ring-1 focus:ring-cyan-500/20"
                            : "bg-[#121315] border-gray-800 text-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>Nível de Treinamento Técnico</label>
                      <select
                        value={trainingLevel}
                        onChange={(e) => setTrainingLevel(e.target.value)}
                        className={`w-full text-xs font-mono px-3 py-2 rounded-lg outline-none focus:border-cyan-500 ${
                          isLightTheme
                            ? "bg-white border-gray-300 text-gray-950 focus:ring-1 focus:ring-cyan-500/20"
                            : "bg-[#121315] border-gray-800 text-white"
                        }`}
                      >
                        <option value="Iniciante">Iniciante (Sedentário ou Recém-iniciado)</option>
                        <option value="Intermediário">Intermediário (Treina constantemente)</option>
                        <option value="Avançado">Avançado (Atleta experiente)</option>
                      </select>
                    </div>
                  </div>

                </div>

              </div>

              <div className="flex justify-end pt-4 border-t border-gray-900">
                <button
                  type="button"
                  onClick={() => setNewEvalStep(2)}
                  className="bg-cyan-500 hover:bg-cyan-600 text-black text-xs font-mono font-bold uppercase px-6 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,242,255,0.15)] cursor-pointer"
                >
                  Ir para Fotos <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: PHOTOS & GUIDELINES */}
          {newEvalStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Capture Photos Panel (2/3 columns) */}
              <div className={`lg:col-span-2 glass-panel p-6 rounded-2xl border space-y-6 ${
                isLightTheme ? "bg-white border-gray-200" : "bg-[#121315]/50 border-gray-850"
              }`}>
                <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 gap-3 ${
                  isLightTheme ? "border-gray-200" : "border-gray-900"
                }`}>
                  <div>
                    <h3 className={`text-lg font-bold font-mono uppercase tracking-wider flex items-center gap-2 ${
                      isLightTheme ? "text-gray-950" : "text-white"
                    }`}>
                      <Camera className="w-5 h-5 text-cyan-500" /> Registro Fotográfico Estático
                    </h3>
                    <p className={`text-xs font-mono mt-1 ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>Carregue ou capture as 4 imagens solicitadas para processamento dos eixos mecânicos.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Toggle Fit Mode */}
                    <div className={`flex items-center p-1 rounded-lg gap-1 border ${
                      isLightTheme ? "bg-gray-100 border-gray-200" : "bg-black/60 border-gray-800"
                    }`}>
                      <button
                        type="button"
                        onClick={() => setPhotoFitMode("contain")}
                        className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-all cursor-pointer ${
                          photoFitMode === "contain"
                            ? isLightTheme
                              ? "bg-cyan-100 text-cyan-800 border border-cyan-200"
                              : "bg-cyan-950 text-cyan-400 border border-cyan-800/30"
                            : isLightTheme
                            ? "text-gray-400 hover:text-gray-800"
                            : "text-gray-500 hover:text-white"
                        }`}
                        title="Ver a foto original inteira sem cortes (Evita cortar cabeça e pés)"
                      >
                        Ajustar Inteira
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoFitMode("cover")}
                        className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-all cursor-pointer ${
                          photoFitMode === "cover"
                            ? isLightTheme
                              ? "bg-cyan-100 text-cyan-800 border border-cyan-200"
                              : "bg-cyan-950 text-cyan-400 border border-cyan-800/30"
                            : isLightTheme
                            ? "text-gray-400 hover:text-gray-800"
                            : "text-gray-500 hover:text-white"
                        }`}
                        title="Preencher todo o quadrado da tela"
                      >
                        Preencher Todo
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleLoadMockPhotos}
                      className={`text-[10px] px-3 py-1.5 rounded-lg font-mono font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                        isLightTheme
                          ? "bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border-cyan-200"
                          : "bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border-cyan-800/30"
                      }`}
                      title="Carregar fotos de simulação biomecânica perfeitas"
                    >
                      <Zap className="w-3.5 h-3.5" /> Amostras
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "front", label: "Vista Frente (Frontal)", state: frontPhoto, set: setFrontPhoto },
                    { key: "back", label: "Vista Costas (Posterior)", state: backPhoto, set: setBackPhoto },
                    { key: "right", label: "Perfil Direito (Lateral D)", state: rightPhoto, set: setRightPhoto },
                    { key: "left", label: "Perfil Esquerdo (Lateral E)", state: leftPhoto, set: setLeftPhoto }
                  ].map(slot => (
                    <div key={slot.key} className="space-y-1.5">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wide block ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>{slot.label}</span>
                      
                      {slot.state ? (
                        <div className="space-y-2">
                          <div className={`relative aspect-square rounded-xl overflow-hidden border bg-black group ${isLightTheme ? "border-gray-200" : "border-gray-800"}`}>
                            <img
                              referrerPolicy="no-referrer"
                              src={slot.state}
                              alt={slot.label}
                              className={`w-full h-full pointer-events-none ${photoFitMode === "contain" ? "object-contain bg-[#0e0f11]" : "object-cover"}`}
                              style={{
                                transform: `scale(${photoScales[slot.key] / 100}) translate(${photoOffsets[slot.key].x}px, ${photoOffsets[slot.key].y}px)`,
                                transition: "transform 0.1s ease-out"
                              }}
                            />
                            
                            {/* Live Alignment Silhouette Guide Overlay */}
                            <PostureSilhouetteGuide studentHeight={studentHeightCm} scalePercent={100} shiftPercent={0} />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                              <button
                                type="button"
                                onClick={() => slot.set(null)}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full cursor-pointer transition-transform hover:scale-105"
                                title="Remover Foto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Foto Scale and Pan Alignment Controls */}
                          <div className={`p-2.5 border rounded-xl space-y-2 text-[9px] font-mono ${
                            isLightTheme ? "bg-gray-50 border-gray-200" : "bg-black/60 border-gray-900"
                          }`}>
                            <div className="flex justify-between items-center">
                              <span className={`font-bold ${isLightTheme ? "text-cyan-700" : "text-[#00f2ff]"}`}>Zoom: {photoScales[slot.key]}%</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPhotoScales(prev => ({ ...prev, [slot.key]: 100 }));
                                  setPhotoOffsets(prev => ({ ...prev, [slot.key]: { x: 0, y: 0 } }));
                                }}
                                className={`text-[8px] uppercase font-bold ${
                                  isLightTheme ? "text-gray-400 hover:text-gray-700" : "text-gray-500 hover:text-white"
                                }`}
                              >
                                Resetar
                              </button>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="250"
                              value={photoScales[slot.key]}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPhotoScales(prev => ({ ...prev, [slot.key]: val }));
                              }}
                              className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                                isLightTheme ? "bg-gray-200 accent-cyan-600" : "bg-gray-900 accent-cyan-400"
                              }`}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className={`block mb-0.5 ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>Mover X: {photoOffsets[slot.key].x}px</span>
                                <input
                                  type="range"
                                  min="-100"
                                  max="100"
                                  value={photoOffsets[slot.key].x}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setPhotoOffsets(prev => ({ ...prev, [slot.key]: { ...prev[slot.key], x: val } }));
                                  }}
                                  className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                                    isLightTheme ? "bg-gray-200 accent-cyan-600" : "bg-gray-900 accent-cyan-400"
                                  }`}
                                />
                              </div>
                              <div>
                                <span className={`block mb-0.5 ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>Mover Y: {photoOffsets[slot.key].y}px</span>
                                <input
                                  type="range"
                                  min="-100"
                                  max="100"
                                  value={photoOffsets[slot.key].y}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setPhotoOffsets(prev => ({ ...prev, [slot.key]: { ...prev[slot.key], y: val } }));
                                  }}
                                  className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                                    isLightTheme ? "bg-gray-200 accent-cyan-600" : "bg-gray-900 accent-cyan-400"
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className={`relative aspect-square rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer group transition-all p-3 text-center ${
                          isLightTheme 
                            ? "border-gray-300 hover:border-cyan-500/50 bg-gray-50" 
                            : "border-gray-850 hover:border-cyan-500/30 bg-black/25"
                        }`}>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleLocalFileChange(e, slot.key as any)}
                          />
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border group-hover:border-cyan-500/20 group-hover:bg-cyan-500/5 transition-colors ${
                            isLightTheme ? "bg-white border-gray-200" : "bg-gray-950 border-gray-900"
                          }`}>
                            <Camera className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                          </div>
                          <div className="space-y-0.5">
                            <span className={`text-[10px] font-mono font-semibold block transition-colors ${
                              isLightTheme ? "text-gray-700 group-hover:text-cyan-600" : "text-gray-300 group-hover:text-white"
                            }`}>Carregar Arquivo</span>
                            <span className={`text-[9px] font-mono block ${isLightTheme ? "text-gray-400" : "text-gray-500"}`}>PNG, JPG ou arrastar aqui</span>
                          </div>
                        </label>
                      )}
                    </div>
                  ))}
                </div>

                <div className={`flex justify-between items-center pt-4 border-t ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                  <button
                    type="button"
                    onClick={() => setNewEvalStep(1)}
                    className={`text-xs font-mono font-bold uppercase px-4 py-2.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer border ${
                      isLightTheme
                        ? "border-gray-200 hover:bg-gray-100 text-gray-700"
                        : "border-gray-880 hover:bg-gray-900 text-gray-300"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Voltar
                  </button>

                  <button
                    type="button"
                    disabled={uploadedPhotosCount < 2 || isScanning}
                    onClick={handleTriggerAIScan}
                    className={`text-xs font-mono font-bold uppercase px-6 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,242,255,0.15)] cursor-pointer ${
                      uploadedPhotosCount >= 2
                        ? "bg-[#ccff00] text-black hover:bg-[#b5e000]"
                        : isLightTheme
                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                        : "bg-gray-900 text-gray-600 border border-gray-850 cursor-not-allowed"
                    }`}
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Mapeando Postura...
                      </>
                    ) : (
                      <>
                        Mapear Pontos Articulares <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Guidelines / Rules Sidebar (1/3 columns) */}
              <div className={`glass-panel p-5 rounded-2xl border space-y-4 font-mono ${
                isLightTheme ? "bg-white border-gray-200" : "bg-[#121315]/50 border-gray-850"
              }`}>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">Protocolo de Captura</span>
                
                <h4 className={`text-sm font-bold uppercase tracking-wide ${isLightTheme ? "text-gray-950" : "text-white"}`}>Regras Críticas para Captura:</h4>
                
                <ul className={`space-y-3.5 text-[10px] list-none pl-0 ${isLightTheme ? "text-gray-600 font-medium" : "text-gray-400"}`}>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span><b>Fundo Neutro:</b> Posicione o aluno contra uma parede limpa e contrastante para evitar ruídos de processamento visual.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span><b>Pés Descalços:</b> Garanta que o aluno esteja totalmente sem calçados para leitura fidedigna da estabilidade plantar e de tornozelo.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span><b>Braços Relaxados:</b> Postura natural anatômica estática. Não flexione ou eleve voluntariamente os cotovelos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span><b>Altura da Câmera:</b> O aparelho deve ser posicionado rigorosamente na altura do umbigo do aluno, de forma perpendicular.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span><b>Guia de Silhueta:</b> O aluno deve enquadrar todo o corpo dentro da área útil da câmera (pés e cabeça totalmente visíveis).</span>
                  </li>
                </ul>

                <div className={`border p-3.5 rounded-xl space-y-1 ${isLightTheme ? "bg-amber-500/5 border-amber-500/10" : "bg-yellow-500/5 border-yellow-500/10"}`}>
                  <span className={`text-[9px] font-bold uppercase block ${isLightTheme ? "text-amber-600" : "text-yellow-500"}`}>AVISO LEGAL & ESCOPO</span>
                  <p className={`text-[9px] leading-normal ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>
                    Este laudo biomecânico inteligente é uma ferramenta de suporte postural e periodização física. Ele não constitui, substitui ou pretende ser um diagnóstico médico ou ortopédico clínico.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: RESULTS & INTERACTIVE LAB */}
          {newEvalStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* BIOMECHANICAL CALIBRATION WORKSPACE (8/12 columns) */}
              <div className="lg:col-span-8 space-y-4">
                <div className={`glass-panel p-4 rounded-xl flex flex-col gap-4 border ${
                  isLightTheme ? "bg-white border-gray-200" : "bg-[#121315]/50 border-gray-850"
                }`}>
                  
                  {/* Header */}
                  <div className={`flex items-center justify-between border-b pb-2.5 ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse" />
                      <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isLightTheme ? "text-gray-950" : "text-white"}`}>
                        Laboratório Biomecânico de Alta Precisão
                      </span>
                    </div>
                    <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border tracking-wider ${
                      isLightTheme 
                        ? "bg-cyan-50 text-cyan-800 border-cyan-200" 
                        : "bg-cyan-950/40 text-cyan-400 border-cyan-800/30"
                    }`}>
                      MODO CALIBRAÇÃO ATIVO
                    </span>
                  </div>

                  {/* TWO SIDE-BY-SIDE PANELS (Left: Photo Canvas, Right: Sliders & Instructions) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    
                    {/* Left Panel (7/12): Interactive Canvas */}
                    <div className="md:col-span-7 flex flex-col gap-3">
                      
                      {/* View Selector Tabs */}
                      <div className="grid grid-cols-4 gap-1.5 font-mono text-[9px] font-bold uppercase">
                        {[
                          { key: "front", label: "Frente" },
                          { key: "back", label: "Costas" },
                          { key: "right", label: "Perf. Dir" },
                          { key: "left", label: "Perf. Esq" }
                        ].map(v => (
                          <button
                            key={v.key}
                            type="button"
                            onClick={() => setActivePhotoView(v.key as any)}
                            className={`py-2 rounded-lg text-center border cursor-pointer transition-all ${
                              activePhotoView === v.key
                                ? isLightTheme
                                  ? "bg-cyan-100 text-cyan-800 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)]"
                                  : "bg-[#00f2ff]/10 text-[#00f2ff] border-[#00f2ff]/40 shadow-[0_0_8px_rgba(0,242,255,0.1)]"
                                : isLightTheme
                                ? "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 hover:text-gray-900"
                                : "bg-[#121315] text-gray-400 border-gray-900 hover:text-white"
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>

                      {/* Interactive Canvas */}
                      <div 
                        className={`relative aspect-[3/4] bg-black rounded-xl overflow-hidden select-none border shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] ${
                          isLightTheme ? "border-gray-300" : "border-gray-800"
                        }`}
                      >
                        {activePhotoState && (
                          <div
                            ref={isZoomModalOpen ? null : imageContainerRef}
                            className="absolute"
                            style={{
                              left: `${activeLayout.offsetX}%`,
                              top: `${activeLayout.offsetY}%`,
                              width: `${activeLayout.renderW}%`,
                              height: `${activeLayout.renderH}%`,
                              transform: `scale(${photoScales[activePhotoView] / 100}) translate(${photoOffsets[activePhotoView].x}px, ${photoOffsets[activePhotoView].y}px)`,
                              transformOrigin: "center center",
                              transition: "transform 0.1s ease-out"
                            }}
                          >
                            <img
                              referrerPolicy="no-referrer"
                              src={activePhotoState}
                              alt={`Postura ${activePhotoView}`}
                              onLoad={handleActiveImageLoad(activePhotoView)}
                              className="w-full h-full object-fill pointer-events-none"
                              draggable="false"
                            />

                            {/* SVG overlay bones drawing */}
                            {showSkeleton && (
                              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                                {renderSVGBones(activePhotoView, activeMarkersList, 0, 0, 100, 100)}
                              </svg>
                            )}

                            {/* Draggable markers */}
                            {activeMarkersList.map((m, idx) => {
                              const mId = m.id || m.label || `marker-${idx}`;
                              const isSelected = (m.id || m.label) === (selectedPointForGuide || activeMarkersList[0]?.id || activeMarkersList[0]?.label);
                              return (
                                <div
                                  key={mId}
                                  className="absolute select-none cursor-grab active:cursor-grabbing z-20 group"
                                  style={{
                                    left: `${m.x}%`,
                                    top: `${m.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    touchAction: "none"
                                  }}
                                  onMouseDown={handleMarkerMouseDown(activePhotoView, m.id || m.label)}
                                  onTouchStart={handleMarkerTouchStart(activePhotoView, m.id || m.label)}
                                >
                                  <div className="relative flex flex-col items-center">
                                    {/* Pulse animation for active/selected marker */}
                                    {isSelected && (
                                      <div className="absolute -inset-1.5 bg-[#00f2ff]/40 rounded-full animate-ping z-0 pointer-events-none" />
                                    )}
                                    <div className={`w-3.5 h-3.5 rounded-full ${getMarkerColor(m.type)} border-2 shadow-lg flex items-center justify-center transition-all group-hover:scale-125 z-10 ${isSelected ? "border-[#00f2ff] scale-110" : ""}`}>
                                      <div className="w-1 h-1 rounded-full bg-white" />
                                    </div>
                                    
                                    {/* Marker Tooltip label - Only appears on click or hover */}
                                    <div className={`absolute top-4 bg-black/95 text-white text-[8px] font-mono px-1.5 py-0.5 rounded border border-gray-850 shadow-md whitespace-nowrap flex items-center gap-1 pointer-events-none z-20 transition-all duration-150 origin-top ${
                                      isSelected 
                                        ? "opacity-100 scale-100 translate-y-0" 
                                        : "opacity-0 scale-95 -translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                                    }`}>
                                      <span>{m.label}</span>
                                      <span className="text-gray-500 text-[7px]">({Math.round(m.x)}, {Math.round(m.y)})</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Height Ruler Overlay */}
                        {showRuler && renderLeftRuler()}

                        {/* Live Alignment Silhouette Guide Overlay */}
                        <PostureSilhouetteGuide studentHeight={studentHeightCm} scalePercent={rulerScalePercent} shiftPercent={rulerShiftPercent} />

                        {/* Laser grid/alignment overlay */}
                        {showGrid && (
                          <div className="absolute inset-0 pointer-events-none z-10">
                            {/* Vertical subdivisions */}
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div
                                key={`v-grid-${i}`}
                                className={`absolute top-0 bottom-0 border-r ${
                                  i === 4 ? "border-transparent" : "border-cyan-500/10"
                                }`}
                                style={{ left: `${(i + 1) * 10}%` }}
                              />
                            ))}
                            {/* Horizontal subdivisions */}
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div
                                key={`h-grid-${i}`}
                                className={`absolute left-0 right-0 border-b ${
                                  i === 4 ? "border-transparent" : "border-cyan-500/10"
                                }`}
                                style={{ top: `${(i + 1) * 10}%` }}
                              />
                            ))}

                            {/* Plumb Line (dashed vertical axis) */}
                            <div className="absolute top-0 bottom-0 left-1/2 border-r-2 border-dashed border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                            {/* Horizontal hip line symmetry */}
                            <div className="absolute left-0 right-0 top-1/2 border-b-2 border-dashed border-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.3)]" />
                          </div>
                        )}
                      </div>

                      {/* Canvas Utility Quick Toggles */}
                      <div className="grid grid-cols-4 gap-1.5 text-[8px] font-mono font-bold uppercase">
                        <button
                          type="button"
                          onClick={() => setShowSkeleton(!showSkeleton)}
                          className={`py-1.5 rounded-lg border transition-all cursor-pointer text-center ${
                            showSkeleton
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/25 shadow-[0_0_6px_rgba(168,85,247,0.1)]"
                              : isLightTheme
                              ? "bg-gray-100 text-gray-400 border-gray-200 hover:text-gray-800 hover:bg-gray-200"
                              : "bg-gray-950 text-gray-500 border-gray-900 hover:text-gray-400"
                          }`}
                        >
                          {showSkeleton ? "Linhas: ON" : "Linhas: OFF"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowGrid(!showGrid)}
                          className={`py-1.5 rounded-lg border transition-all cursor-pointer text-center ${
                            showGrid
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/25 shadow-[0_0_6px_rgba(6,182,212,0.1)]"
                              : isLightTheme
                              ? "bg-gray-100 text-gray-400 border-gray-200 hover:text-gray-800 hover:bg-gray-200"
                              : "bg-gray-950 text-gray-500 border-gray-900 hover:text-gray-400"
                          }`}
                        >
                          {showGrid ? "Grade: ON" : "Grade: OFF"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRuler(!showRuler)}
                          className={`py-1.5 rounded-lg border transition-all cursor-pointer text-center ${
                            showRuler
                              ? "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/25 shadow-[0_0_6px_rgba(204,255,0,0.1)]"
                              : isLightTheme
                              ? "bg-gray-100 text-gray-400 border-gray-200 hover:text-gray-800 hover:bg-gray-200"
                              : "bg-gray-950 text-gray-500 border-gray-900 hover:text-gray-400"
                          }`}
                        >
                          {showRuler ? "Régua: ON" : "Régua: OFF"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingUnlocked(!isEditingUnlocked)}
                          className={`py-1.5 px-0.5 rounded-lg border transition-all cursor-pointer text-center flex items-center justify-center gap-0.5 ${
                            isEditingUnlocked
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.1)]"
                              : "bg-red-500/10 text-red-400 border-red-500/25"
                          }`}
                          title={isEditingUnlocked ? "Clique para bloquear o ajuste manual dos pontos" : "Clique para autorizar o ajuste manual dos pontos"}
                        >
                          {isEditingUnlocked ? (
                            <>
                              <Unlock className="w-2.5 h-2.5 text-emerald-400" /> Ajuste: ON
                            </>
                          ) : (
                            <>
                              <Lock className="w-2.5 h-2.5 text-red-400" /> Ajuste: LOCK
                            </>
                          )}
                        </button>
                      </div>

                      {/* Fullscreen Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsZoomModalOpen(true);
                          if (!selectedPointForGuide && activeMarkersList.length > 0) {
                            setSelectedPointForGuide(activeMarkersList[0].id || activeMarkersList[0].label);
                          }
                        }}
                        className={`w-full py-2 border rounded-xl text-center font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,242,255,0.05)] ${
                          isLightTheme
                            ? "bg-cyan-100/50 hover:bg-cyan-100 text-cyan-800 border-cyan-300"
                            : "bg-[#00f2ff]/10 hover:bg-[#00f2ff]/25 text-[#00f2ff] border-cyan-500/20 hover:border-[#00f2ff]/40"
                        }`}
                      >
                        <Maximize2 className="w-3.5 h-3.5" /> Ajustar em Tela Cheia (Alta Precisão) 🔍
                      </button>

                    </div>

                    {/* Right Panel (5/12): Calibration Controls side-by-side with photo */}
                    <div className="md:col-span-5 flex flex-col gap-3.5 h-full justify-between">
                      
                      {/* Selected Point Info Guide */}
                      {(() => {
                        const activeLabel = selectedPointForGuide || (activeMarkersList[0]?.id || activeMarkersList[0]?.label);
                        const currentMarker = activeMarkersList.find(m => (m.id || m.label) === activeLabel) || activeMarkersList[0];
                        if (!currentMarker) return null;
                        const instruction = getMarkerInstruction(currentMarker.label);
                        return (
                          <div className={`p-3 rounded-xl shadow-md font-mono border ${
                            isLightTheme ? "bg-white border-cyan-300" : "bg-[#121315]/85 border-cyan-500/25"
                          }`}>
                            <span className="text-[7px] text-cyan-400 font-extrabold uppercase tracking-wider block">PONTO ANATÔMICO ATIVO:</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              <span className={`text-[11px] font-bold uppercase tracking-wide ${isLightTheme ? "text-gray-950" : "text-white"}`}>{currentMarker.label}</span>
                            </div>
                            <span className={`font-semibold block mt-1 text-[8px] uppercase ${isLightTheme ? "text-cyan-800" : "text-gray-400"}`}>
                              🎯 {instruction.subtitle}
                            </span>
                            <p className={`text-[8px] leading-relaxed mt-1 border-t pt-1 ${
                              isLightTheme ? "text-gray-600 border-gray-100" : "text-gray-500 border-gray-900"
                            }`}>
                              {instruction.description}
                            </p>
                          </div>
                        );
                      })()}

                      {/* Ajuste Ágil & Calibração Rápida Panel */}
                      <div className={`p-3 rounded-xl shadow-md font-mono space-y-2 border ${
                        isLightTheme ? "bg-white border-gray-200" : "bg-[#121315]/85 border-gray-900"
                      }`}>
                        <div className={`flex justify-between items-center border-b pb-1.5 ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                          <span className={`font-extrabold uppercase tracking-wide text-[9px] flex items-center gap-1 ${isLightTheme ? "text-cyan-700" : "text-[#00f2ff]"}`}>
                            🎮 Ajuste Ágil (Controle Milimétrico)
                          </span>
                        </div>
                        
                        <div className={`grid grid-cols-2 gap-2 text-[8px] leading-normal ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className={`font-bold px-1 rounded ${isLightTheme ? "text-cyan-850 bg-cyan-100/50" : "text-cyan-400 bg-cyan-950"}`}>↑ ↓ ← →</span>
                              <span>Ponto ativo</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className={`font-bold px-1 rounded ${isLightTheme ? "text-cyan-850 bg-cyan-100/50" : "text-cyan-400 bg-cyan-950"}`}>W A S D</span>
                              <span>Mover esqueleto</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className={`font-bold px-1 rounded ${isLightTheme ? "text-cyan-850 bg-cyan-100/50" : "text-cyan-400 bg-cyan-950"}`}>+ / -</span>
                              <span>Escala esqueleto</span>
                            </div>
                          </div>

                          {/* Visual Nudge Pad */}
                          <div className={`border-l pl-2 space-y-1 ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                            <span className={`font-bold block uppercase text-[7px] mb-0.5 ${isLightTheme ? "text-gray-800" : "text-white"}`}>Clique / Toque Rápido:</span>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[7px]">Esqueleto:</span>
                              <div className="grid grid-cols-3 gap-0.5">
                                <div />
                                <button
                                  type="button"
                                  onClick={() => handleSkeletonAdjust(activePhotoView, "offsetY", skeletonOffsetY - 0.5)}
                                  className={`w-4 h-4 border rounded flex items-center justify-center text-[9px] font-bold cursor-pointer transition-all animate-fade-in ${
                                    isLightTheme ? "bg-gray-100 hover:bg-cyan-500 hover:text-white border-gray-200" : "bg-gray-900 hover:bg-cyan-500 hover:text-black border-gray-800"
                                  }`}
                                  title="Mover para cima (W)"
                                >
                                  ▲
                                </button>
                                <div />

                                <button
                                  type="button"
                                  onClick={() => handleSkeletonAdjust(activePhotoView, "offsetX", skeletonOffsetX - 0.5)}
                                  className={`w-4 h-4 border rounded flex items-center justify-center text-[9px] font-bold cursor-pointer transition-all animate-fade-in ${
                                    isLightTheme ? "bg-gray-100 hover:bg-cyan-500 hover:text-white border-gray-200" : "bg-gray-900 hover:bg-cyan-500 hover:text-black border-gray-800"
                                  }`}
                                  title="Mover para esquerda (A)"
                                >
                                  ◀
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSkeletonAdjust(activePhotoView, "offsetY", skeletonOffsetY + 0.5)}
                                  className={`w-4 h-4 border rounded flex items-center justify-center text-[9px] font-bold cursor-pointer transition-all animate-fade-in ${
                                    isLightTheme ? "bg-gray-100 hover:bg-cyan-500 hover:text-white border-gray-200" : "bg-gray-900 hover:bg-cyan-500 hover:text-black border-gray-800"
                                  }`}
                                  title="Mover para baixo (S)"
                                >
                                  ▼
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSkeletonAdjust(activePhotoView, "offsetX", skeletonOffsetX + 0.5)}
                                  className={`w-4 h-4 border rounded flex items-center justify-center text-[9px] font-bold cursor-pointer transition-all animate-fade-in ${
                                    isLightTheme ? "bg-gray-100 hover:bg-cyan-500 hover:text-white border-gray-200" : "bg-gray-900 hover:bg-cyan-500 hover:text-black border-gray-800"
                                  }`}
                                  title="Mover para direita (D)"
                                >
                                  ▶
                                </button>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[7px] pt-1">
                              <span>Escala:</span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextScaleX = Math.max(50, Math.min(150, skeletonScaleX - 2));
                                    const nextScaleY = Math.max(50, Math.min(150, skeletonScaleY - 2));
                                    handleSkeletonAdjust(activePhotoView, "all", 0, { scaleX: nextScaleX, scaleY: nextScaleY });
                                  }}
                                  className={`px-1.5 py-0.5 border rounded text-[8px] font-bold cursor-pointer transition-colors ${
                                    isLightTheme ? "bg-gray-100 hover:bg-cyan-500 hover:text-white border-gray-200 text-gray-700" : "bg-gray-900 hover:bg-cyan-500 hover:text-black border-gray-800"
                                  }`}
                                  title="Diminuir (-)"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextScaleX = Math.max(50, Math.min(150, skeletonScaleX + 2));
                                    const nextScaleY = Math.max(50, Math.min(150, skeletonScaleY + 2));
                                    handleSkeletonAdjust(activePhotoView, "all", 0, { scaleX: nextScaleX, scaleY: nextScaleY });
                                  }}
                                  className={`px-1.5 py-0.5 border rounded text-[8px] font-bold cursor-pointer transition-colors ${
                                    isLightTheme ? "bg-gray-100 hover:bg-cyan-500 hover:text-white border-gray-200 text-gray-700" : "bg-gray-900 hover:bg-cyan-500 hover:text-black border-gray-800"
                                  }`}
                                  title="Aumentar (+)"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Photo Zoom and Offset controls */}
                      <div className={`p-3 border rounded-xl space-y-2 text-[9px] font-mono ${
                        isLightTheme ? "bg-white border-gray-200 shadow-sm" : "bg-black/40 border-gray-900"
                      }`}>
                        <div className={`flex justify-between items-center border-b pb-1.5 ${isLightTheme ? "border-gray-200 text-gray-700" : "border-gray-900 text-gray-400"}`}>
                          <span className={`font-bold uppercase tracking-wide ${isLightTheme ? "text-gray-950" : "text-gray-300"}`}>📐 Ajuste da Imagem ({activePhotoView.toUpperCase()}):</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoScales(prev => ({ ...prev, [activePhotoView]: 100 }));
                              setPhotoOffsets(prev => ({ ...prev, [activePhotoView]: { x: 0, y: 0 } }));
                            }}
                            className={`text-[8px] font-bold hover:underline ${isLightTheme ? "text-cyan-700" : "text-cyan-400"}`}
                          >
                            REDEFINIR
                          </button>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div>
                            <div className="flex justify-between text-gray-500 mb-0.5">
                              <span>Zoom da Foto:</span>
                              <span className={`font-bold ${isLightTheme ? "text-cyan-700" : "text-cyan-400"}`}>{photoScales[activePhotoView]}%</span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="250"
                              value={photoScales[activePhotoView]}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPhotoScales(prev => ({ ...prev, [activePhotoView]: val }));
                              }}
                              className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                                isLightTheme ? "bg-gray-200 accent-cyan-600" : "bg-gray-900 accent-cyan-400"
                              }`}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="flex justify-between text-gray-500 mb-0.5">
                                <span>Arrastar X:</span>
                                <span className={`font-bold ${isLightTheme ? "text-cyan-700" : "text-cyan-400"}`}>{photoOffsets[activePhotoView].x}px</span>
                              </div>
                              <input
                                type="range"
                                min="-100"
                                max="100"
                                value={photoOffsets[activePhotoView].x}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setPhotoOffsets(prev => ({ ...prev, [activePhotoView]: { ...prev[activePhotoView], x: val } }));
                                }}
                                className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                                  isLightTheme ? "bg-gray-200 accent-cyan-600" : "bg-gray-900 accent-cyan-400"
                                }`}
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-gray-500 mb-0.5">
                                <span>Arrastar Y:</span>
                                <span className={`font-bold ${isLightTheme ? "text-cyan-700" : "text-cyan-400"}`}>{photoOffsets[activePhotoView].y}px</span>
                              </div>
                              <input
                                type="range"
                                min="-100"
                                max="100"
                                value={photoOffsets[activePhotoView].y}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setPhotoOffsets(prev => ({ ...prev, [activePhotoView]: { ...prev[activePhotoView], y: val } }));
                                }}
                                className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                                  isLightTheme ? "bg-gray-200 accent-cyan-600" : "bg-gray-900 accent-cyan-400"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Skeleton Scaling Controls */}
                      <div className={`p-3 border rounded-xl space-y-2 text-[9px] font-mono ${
                        isLightTheme 
                          ? "bg-gray-50 border-gray-200" 
                          : "bg-gradient-to-r from-gray-950 to-black/40 border-gray-900"
                      }`}>
                        <div className={`flex justify-between items-center border-b pb-1.5 ${
                          isLightTheme ? "border-gray-200 text-gray-700" : "border-gray-900 text-gray-400"
                        }`}>
                          <span className={`${isLightTheme ? "text-cyan-700" : "text-[#00f2ff]"} font-bold flex items-center gap-1 uppercase tracking-wider`}>
                            🧬 Escala Global do Esqueleto:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSkeletonScaleX(100);
                              setSkeletonScaleY(100);
                              setSkeletonOffsetX(0);
                              setSkeletonOffsetY(0);
                              const base = baseMarkersForScaling[activePhotoView] || [];
                              if (base.length > 0) {
                                if (activePhotoView === "front") setFrontMarkers(base);
                                else if (activePhotoView === "back") setBackMarkers(base);
                                else if (activePhotoView === "right") setRightMarkers(base);
                                else if (activePhotoView === "left") setLeftMarkers(base);
                              }
                            }}
                            className="text-[8px] text-yellow-600 hover:underline font-bold"
                          >
                            RESTAURAR
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex justify-between text-gray-500 mb-0.5">
                              <span>Altura (Y):</span>
                              <span className={`${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"} font-bold`}>{skeletonScaleY}%</span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="150"
                              value={skeletonScaleY}
                              onChange={(e) => {
                                handleSkeletonAdjust(activePhotoView, "scaleY", Number(e.target.value));
                              }}
                              className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                                isLightTheme ? "bg-gray-300 accent-cyan-600" : "bg-gray-900 accent-[#00f2ff]"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-gray-500 mb-0.5">
                              <span>Largura (X):</span>
                              <span className={`${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"} font-bold`}>{skeletonScaleX}%</span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="150"
                              value={skeletonScaleX}
                              onChange={(e) => {
                                handleSkeletonAdjust(activePhotoView, "scaleX", Number(e.target.value));
                              }}
                              className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                                isLightTheme ? "bg-gray-300 accent-cyan-600" : "bg-gray-900 accent-[#00f2ff]"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-gray-500 mb-0.5">
                              <span>Posição X:</span>
                              <span className={`${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"} font-bold`}>{skeletonOffsetX > 0 ? `+${skeletonOffsetX}` : skeletonOffsetX}%</span>
                            </div>
                            <input
                              type="range"
                              min="-30"
                              max="30"
                              step="0.5"
                              value={skeletonOffsetX}
                              onChange={(e) => {
                                handleSkeletonAdjust(activePhotoView, "offsetX", Number(e.target.value));
                              }}
                              className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                                isLightTheme ? "bg-gray-300 accent-cyan-600" : "bg-gray-900 accent-[#00f2ff]"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-gray-500 mb-0.5">
                              <span>Posição Y:</span>
                              <span className={`${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"} font-bold`}>{skeletonOffsetY > 0 ? `+${skeletonOffsetY}` : skeletonOffsetY}%</span>
                            </div>
                            <input
                              type="range"
                              min="-30"
                              max="30"
                              step="0.5"
                              value={skeletonOffsetY}
                              onChange={(e) => {
                                handleSkeletonAdjust(activePhotoView, "offsetY", Number(e.target.value));
                              }}
                              className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                                isLightTheme ? "bg-gray-300 accent-cyan-600" : "bg-gray-900 accent-[#00f2ff]"
                              }`}
                            />
                          </div>
                        </div>

                        {(skeletonScaleX !== 100 || skeletonScaleY !== 100 || skeletonOffsetX !== 0 || skeletonOffsetY !== 0) && (
                          <div className={`pt-1 flex justify-between items-center p-1.5 rounded-lg border ${
                            isLightTheme ? "bg-yellow-50 border-yellow-200" : "bg-[#121315]/40 border-gray-900"
                          }`}>
                            <span className="text-[7px] text-yellow-600 font-bold uppercase animate-pulse">Ajustes pendentes</span>
                            <button
                              type="button"
                              onClick={() => {
                                commitSkeletonToBase(activePhotoView);
                              }}
                              className="px-2 py-0.5 bg-[#ccff00] hover:bg-[#b5e000] text-black rounded text-[8px] font-bold uppercase transition-all cursor-pointer"
                            >
                              Confirmar Dimensões ✓
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Active View Deviations */}
                      <div className={`p-3 rounded-xl border space-y-1.5 font-mono text-[9px] ${
                        isLightTheme ? "bg-gray-50 border-gray-200" : "bg-black/40 border-gray-900"
                      }`}>
                        <span className={`text-[8px] font-bold uppercase tracking-wider block border-b pb-1 ${
                          isLightTheme ? "text-gray-700 border-gray-200" : "text-gray-400 border-gray-900"
                        }`}>Desvios Estimados (Eixo Ativo)</span>
                        <div className={`grid grid-cols-2 gap-2 ${isLightTheme ? "text-gray-800" : "text-gray-300"}`}>
                          <div className={`flex justify-between border-r pr-2 ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                            <span className="text-gray-500">Cervical:</span>
                            <span className={`font-bold ${isLightTheme ? "text-cyan-700" : "text-[#00f2ff]"}`}>{computedMetrics.cervicalText}</span>
                          </div>
                          <div className="flex justify-between pl-1">
                            <span className="text-gray-500">Ombros:</span>
                            <span className="font-bold text-yellow-600">{computedMetrics.shoulderText}</span>
                          </div>
                          <div className={`flex justify-between border-r pr-2 ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                            <span className="text-gray-500">Quadril/Pelve:</span>
                            <span className="font-bold text-purple-600">{computedMetrics.pelvicText}</span>
                          </div>
                          <div className="flex justify-between pl-1">
                            <span className="text-gray-500">Joelhos:</span>
                            <span className="font-bold text-green-600">{computedMetrics.kneeText}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs & Analysis Results Dashboard (4/12 columns) - Sticky Sidebar */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Score indicators Grid (Compact 2x2 inside Sidebar) */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "Índice Cervical", value: computedMetrics.cervicalScore, color: isLightTheme ? "text-cyan-600" : "text-[#00f2ff]" },
                    { label: "Índice Escapular", value: computedMetrics.scapularScore, color: "text-yellow-600" },
                    { label: "Índice Pélvico", value: computedMetrics.pelvicScore, color: "text-[#e0a0ff]" },
                    { label: "Índice Simetria", value: computedMetrics.simetriaScore, color: "text-green-600" }
                  ].map(k => (
                    <div key={k.label} className={`border rounded-xl p-2.5 text-center space-y-1 font-mono shadow-sm ${
                      isLightTheme ? "bg-white border-gray-200" : "bg-[#121315]/80 border-gray-850"
                    }`}>
                      <span className="text-[7px] font-bold text-gray-500 uppercase tracking-wider block truncate">{k.label}</span>
                      <span className={`text-xl font-black ${k.color} block`}>{k.value === null ? "—" : `${k.value}%`}</span>
                      <div className={`w-full h-1 rounded-full overflow-hidden ${isLightTheme ? "bg-gray-100" : "bg-gray-950"}`}>
                        <div 
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ 
                            width: `${k.value ?? 0}%`, 
                            backgroundColor: k.value === null ? "#1f2937" : k.value > 85 ? "#10b981" : k.value > 70 ? "#eab308" : "#ef4444" 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: "Estabilidade", value: computedMetrics.estabilidadeScore },
                      { label: "Mobilidade", value: computedMetrics.mobilidadeScore },
                    ].map(k => (
                      <div key={k.label} className={`border rounded-xl p-2.5 flex flex-col justify-center space-y-0.5 font-mono shadow-sm ${
                        isLightTheme ? "bg-white border-gray-200" : "bg-[#121315]/80 border-gray-850"
                      }`}>
                        <span className="text-[7px] font-bold text-gray-500 uppercase tracking-wider block">{k.label}</span>
                        <span className={`text-sm font-extrabold block ${isLightTheme ? "text-gray-900" : "text-white"}`}>{k.value === null ? "—" : `${k.value}/100`}</span>
                      </div>
                    ))}
                  </div>

                  {/* Risco de compensação card */}
                  <div className={`border rounded-xl p-2.5 flex items-center justify-between font-mono shadow-sm ${
                    isLightTheme ? "bg-white border-gray-200" : "bg-[#121315]/80 border-gray-850"
                  }`}>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Risco Compensação</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                      computedMetrics.risk === "Baixo"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : computedMetrics.risk === "Médio"
                        ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20"
                    }`}>
                      {computedMetrics.risk}
                    </span>
                  </div>
                </div>

                {/* Overall Score Circle Gauge (More Compact) */}
                <div className={`glass-panel p-3.5 rounded-xl border flex items-center gap-4 shadow-sm ${
                  isLightTheme ? "bg-white border-gray-200" : "bg-[#121315]/50 border-gray-850"
                }`}>
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke={isLightTheme ? "#e5e7eb" : "#121315"} strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        stroke="#00f2ff" 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - computedMetrics.geralScore / 100)}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.5s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                      <span className={`text-sm font-black ${isLightTheme ? "text-gray-900" : "text-white"}`}>{computedMetrics.geralScore}</span>
                      <span className="text-[5px] text-gray-500 uppercase font-bold tracking-wider">Geral</span>
                    </div>
                  </div>

                  <div className="space-y-0.5 font-mono text-[9px] leading-tight">
                    <h4 className={`text-[10px] font-bold uppercase tracking-wide ${isLightTheme ? "text-gray-900" : "text-gray-200"}`}>Parecer Biomecânico</h4>
                    <p className={`${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>
                      Índice functional geral de <b className="text-cyan-600 dark:text-[#ccff00]">{computedMetrics.geralScore}%</b>. Ajustes recomendados de força e amplitude.
                    </p>
                  </div>
                </div>

                {/* AI integration analysis call */}
                <div className={`glass-panel p-3.5 rounded-xl border space-y-2.5 font-mono shadow-sm ${
                  isLightTheme ? "bg-white border-gray-200" : "bg-[#121315]/50 border-gray-850"
                }`}>
                  <div className={`flex items-center justify-between border-b pb-1.5 ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isLightTheme ? "text-gray-900" : "text-gray-200"}`}>
                      <Sparkles className={`w-3 h-3 ${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"}`} /> Diagnóstico I.A.
                    </span>
                    <span className={`text-[7px] px-1 py-0.5 rounded border font-bold uppercase ${
                      isLightTheme ? "bg-cyan-50 text-cyan-700 border-cyan-200" : "bg-cyan-950 text-[#00f2ff] border-cyan-800/30"
                    }`}>Mapeamento</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunPostureAiDiagnosis}
                    disabled={isGeneratingDiagnosis}
                    className={`w-full py-2 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      isLightTheme 
                        ? "bg-cyan-50 hover:bg-cyan-600 text-cyan-700 hover:text-white border-cyan-200" 
                        : "bg-cyan-950 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-800/30"
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    {isGeneratingDiagnosis ? "Mapeando eixos de força..." : "📸 Obter Parecer com I.A."}
                  </button>

                  <div className={`p-2.5 rounded-lg border min-h-[80px] flex flex-col justify-center ${
                    isLightTheme ? "bg-gray-50 border-gray-200" : "bg-[#121315]/70 border-gray-800"
                  }`}>
                    {isGeneratingDiagnosis ? (
                      <div className="text-center py-2 space-y-1">
                        <div className={`inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-t-transparent mb-1 ${
                          isLightTheme ? "border-cyan-600" : "border-cyan-400"
                        }`}></div>
                        <p className={`text-[8px] animate-pulse ${isLightTheme ? "text-cyan-700" : "text-cyan-400"}`}>Lendo padrões articulares e desvios angulares...</p>
                      </div>
                    ) : postureAiDiagnosis ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Laudo Postural Inteligente</span>
                        </div>
                        <pre className={`text-[8px] whitespace-pre-wrap leading-relaxed font-mono p-2 rounded border max-h-[140px] overflow-y-auto ${
                          isLightTheme ? "text-gray-850 bg-gray-100 border-gray-200" : "text-gray-300 bg-gray-950 border-gray-900"
                        }`}>
                          {postureAiDiagnosis}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-1 space-y-0.5">
                        <span className="text-gray-650 font-bold block uppercase text-[8px]">Aguardando Leitura</span>
                        <p className="text-[8px] leading-relaxed px-2 text-gray-500">
                          Clique no botão acima para realizar a avaliação postural inteligente.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Observations */}
                <div className={`glass-panel p-3.5 rounded-xl border space-y-2 font-mono shadow-sm ${
                  isLightTheme ? "bg-white border-gray-200" : "bg-[#121315]/50 border-gray-850"
                }`}>
                  <div className={`flex items-center gap-1.5 border-b pb-1.5 ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                    <CheckCircle className={`w-3.5 h-3.5 ${isLightTheme ? "text-cyan-600" : "text-cyan-400"}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${isLightTheme ? "text-gray-900" : "text-white"}`}>Observações Clínicas</span>
                  </div>
                  <ul className={`space-y-1 text-[9px] list-disc pl-4 leading-relaxed ${isLightTheme ? "text-gray-750" : "text-gray-400"}`}>
                    {computedMetrics.observations.map((obs, idx) => (
                      <li key={idx} className="marker:text-cyan-500">
                        {obs}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended corrective exercises */}
                <div className={`glass-panel p-3.5 rounded-xl border space-y-2.5 font-mono shadow-sm ${
                  isLightTheme ? "bg-white border-gray-200" : "bg-[#121315]/50 border-gray-850"
                }`}>
                  <div className={`flex items-center gap-1.5 border-b pb-1.5 ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                    <Dumbbell className="w-3.5 h-3.5 text-[#ccff00]" />
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${isLightTheme ? "text-gray-900" : "text-white"}`}>Exercícios Corretivos</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-0.5">
                    {computedMetrics.suggestions.map((ex, idx) => (
                      <div key={idx} className={`border rounded-lg p-2.5 space-y-1 ${
                        isLightTheme ? "bg-gray-50 border-gray-200" : "bg-black/40 border-gray-900"
                      }`}>
                        <div className="flex justify-between items-baseline gap-1">
                          <h5 className="text-[10px] font-extrabold text-cyan-600 dark:text-[#ccff00] uppercase truncate">{ex.name}</h5>
                          <span className="text-[7px] shrink-0 bg-[#ccff00]/10 text-[#ccff00] px-1 py-0.5 rounded uppercase font-bold border border-[#ccff00]/20">{ex.target}</span>
                        </div>
                        <p className={`text-[8px] leading-normal ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>{ex.description}</p>
                        <div className={`flex items-center justify-between text-[7px] pt-1 border-t ${isLightTheme ? "text-gray-400 border-gray-200" : "text-gray-500 border-gray-950"}`}>
                          <span>Séries: <b>{ex.sets}</b> | Reps: <b>{ex.reps}</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Actions buttons to save */}
                <div className={`space-y-2 pt-3 border-t font-mono ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                  {onSaveAndAdvance && (
                    <button
                      type="button"
                      onClick={() => {
                        const draftEval = {
                          id: `postural-${currentStudent.id}-draft`,
                          studentId: currentStudent.id,
                          date: new Date().toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" }),
                          timestamp: Date.now(),
                          answers: {
                            dorAtual: painCurrent,
                            localDor: painLocation,
                            lesoesHistorico: lesionsHistory,
                            tempoSentado: hoursSitting,
                            nivelTreino: trainingLevel,
                            nome: currentStudent.name,
                            idade: currentStudent.age || DEFAULT_STUDENT_AGE,
                            sexo: currentStudent.gender || "Masculino",
                            peso: currentStudent.weight || DEFAULT_STUDENT_WEIGHT,
                            altura: currentStudent.height || DEFAULT_STUDENT_HEIGHT,
                            objetivo: currentStudent.currentPhase || "Hipertrofia"
                          },
                          photos: {
                            front: frontPhoto,
                            back: backPhoto,
                            right: rightPhoto,
                            left: leftPhoto
                          },
                          markers: {
                            front: frontMarkers,
                            back: backMarkers,
                            right: rightMarkers,
                            left: leftMarkers
                          },
                          kpis: {
                            cervical: computedMetrics.cervicalScore,
                            escapular: computedMetrics.scapularScore,
                            pelvico: computedMetrics.pelvicScore,
                            simetria: computedMetrics.simetriaScore,
                            estabilidade: computedMetrics.estabilidadeScore,
                            mobilidade: computedMetrics.mobilidadeScore,
                            geral: computedMetrics.geralScore,
                            compensacaoRisco: computedMetrics.risk
                          },
                          deviations: {
                            cervical: computedMetrics.cervicalText,
                            ombros: computedMetrics.shoulderText,
                            pelve: computedMetrics.pelvicText,
                            joelhos: computedMetrics.kneeText,
                            geral: `Simetria torácica calculada em ${computedMetrics.simetriaScore}%. Risco de compensação muscular em nível ${computedMetrics.risk}.`
                          },
                          observations: computedMetrics.observations,
                          suggestions: computedMetrics.suggestions,
                          aiReport: postureAiDiagnosis || undefined
                        };
                        try {
                          localStorage.setItem(`treinopro_draft_postural_eval_${currentStudent.id}`, JSON.stringify(draftEval));
                        } catch (e) {
                          console.error("Failed to save postural draft:", e);
                        }
                        onSaveAndAdvance();
                      }}
                      className="w-full bg-[#ccff00] hover:bg-[#b5e000] text-black text-xs font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] cursor-pointer mb-2"
                    >
                      Ir para Dieta & Flexibilidade <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSavePosturalRecord}
                    className="w-full bg-green-500 hover:bg-green-600 text-black text-xs font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
                  >
                    Salvar no Histórico <Check className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewEvalStep(2)}
                      className={`border text-[10px] font-bold uppercase py-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        isLightTheme ? "border-gray-300 hover:bg-gray-100 text-gray-750" : "border-gray-800 hover:bg-gray-900 text-gray-300"
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Voltar
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintLaudo}
                      className="bg-cyan-500 hover:bg-cyan-600 text-black text-[10px] font-bold uppercase py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                    >
                      <Printer className="w-3.5 h-3.5" /> Imprimir
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      ) : (
        /* HISTORIC & COMPARISON TABS */
        <div className="space-y-6">
          
          {history.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-xl bg-[#1f2022]/40 border border-[#3a494b]/10 font-mono">
              <Info className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">Este aluno ainda não possui avaliações posturais salvas.</p>
              <button
                type="button"
                onClick={() => setActiveTab("new")}
                className="mt-3 text-[10px] bg-cyan-500 text-black font-bold uppercase px-4 py-2 rounded-xl"
              >
                Registrar Primeira Análise
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* SUB-TABS TO SELECT STANDARD VS EVOLUCAO POSTURAL */}
              <div className="flex gap-2 border-b border-gray-900 pb-3">
                <button
                  type="button"
                  onClick={() => setShowEvolucaoPosturalView(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                    !showEvolucaoPosturalView
                      ? "bg-[#121315] text-[#00f2ff] border border-cyan-500/30 shadow-[0_0_8px_rgba(0,242,255,0.08)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Métricas & Laboratório de Comparação
                </button>
                <button
                  type="button"
                  onClick={() => setShowEvolucaoPosturalView(true)}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                    showEvolucaoPosturalView
                      ? "bg-[#121315] text-[#ccff00] border border-[#ccff00]/30 shadow-[0_0_8px_rgba(204,255,0,0.08)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Laudo de Evolução Postural (IA)
                </button>
              </div>

              {showEvolucaoPosturalView ? (
                <EvolucaoPostural alunoId={currentStudent.id} />
              ) : (
                <>
                  {/* COMPARISON BAR & EVOLUTION CHART */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Evolution Chart (7/12 columns) */}
                <div className={`lg:col-span-7 glass-panel p-5 rounded-2xl border ${isLightTheme ? "bg-white/80 border-gray-200" : "bg-[#121315]/50 border-gray-850"} space-y-4`}>
                  <div className={`flex justify-between items-center border-b pb-2 font-mono ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                    <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${isLightTheme ? "text-gray-900" : "text-white"}`}>
                      <TrendingUp className="w-4 h-4 text-cyan-500" /> Curva de Progresso Postural
                    </span>
                    <span className={`text-[9px] ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>Histórico de Alinhamento (0-100)</span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolutionChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isLightTheme ? "#000000" : "#ffffff10"} />
                        <XAxis dataKey="date" stroke={isLightTheme ? "#000000" : "#ffffff50"} fontSize={10} fontStyle="mono" />
                        <YAxis stroke={isLightTheme ? "#000000" : "#ffffff50"} domain={[40, 100]} fontSize={10} fontStyle="mono" />
                        <Tooltip contentStyle={{ 
                          backgroundColor: isLightTheme ? "#ffffff" : "#121315", 
                          borderColor: isLightTheme ? "#e2e8f0" : "#1f2022", 
                          color: isLightTheme ? "#000000" : "#ffffff", 
                          fontSize: 10, 
                          fontFamily: "monospace" 
                        }} />
                        <Legend wrapperStyle={{ fontSize: 9, fontFamily: "monospace", paddingTop: 10 }} />
                        <Line type="monotone" dataKey="Postura Geral" stroke="#00f2ff" strokeWidth={2.5} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Simetria" stroke="#ccff00" strokeWidth={1.5} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="Cervical" stroke="#ffb900" strokeWidth={1.5} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Compare Picker Sidebar (5/12 columns) */}
                <div className={`lg:col-span-5 glass-panel p-5 rounded-2xl border ${isLightTheme ? "bg-white/80 border-gray-200" : "bg-[#121315]/50 border-gray-850"} space-y-4 font-mono text-xs`}>
                  <div className={`border-b pb-2 ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isLightTheme ? "text-gray-900" : "text-white"}`}>Laboratório de Comparação Lado-a-Lado</span>
                    <p className={`text-[10px] mt-1 ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>Escolha duas datas para avaliar os índices posturais e a evolução fotográfica.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className={`text-[10px] font-bold uppercase block ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>Avaliação A (Mais Recente)</span>
                      <select
                        value={compareEvalA || ""}
                        onChange={(e) => setCompareEvalA(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg outline-none border ${isLightTheme ? "bg-white border-gray-200 text-gray-950" : "bg-[#121315] border-gray-800 text-white"}`}
                      >
                        {history.map(item => (
                          <option key={item.id} value={item.id} className={isLightTheme ? "text-gray-950" : ""}>{item.date} - Postura Geral: {item.kpis.geral}%</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className={`text-[10px] font-bold uppercase block ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>Avaliação B (Anterior / Referência)</span>
                      <select
                        value={compareEvalB || ""}
                        onChange={(e) => setCompareEvalB(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg outline-none border ${isLightTheme ? "bg-white border-gray-200 text-gray-950" : "bg-[#121315] border-gray-800 text-white"}`}
                      >
                        <option value="" className={isLightTheme ? "text-gray-950" : ""}>-- Selecione uma data --</option>
                        {history.map(item => (
                          <option key={item.id} value={item.id} className={isLightTheme ? "text-gray-950" : ""}>{item.date} - Postura Geral: {item.kpis.geral}%</option>
                        ))}
                      </select>
                    </div>

                    {evalAData && evalBData && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setShowCompareMode(!showCompareMode)}
                          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold uppercase py-2.5 rounded-xl transition-all cursor-pointer text-center"
                        >
                          {showCompareMode ? "Ocultar Lado-a-Lado" : "Comparar Fotos Lado-a-Lado"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* SIDE-BY-SIDE PHOTOS COMPARISON VIEW */}
              {showCompareMode && evalAData && evalBData && (
                <div className={`glass-panel p-5 rounded-2xl border ${isLightTheme ? "bg-white/80 border-gray-200 text-gray-900" : "bg-[#121315]/50 border-gray-850"} space-y-4 font-mono`}>
                  <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2 ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                    <span className={`text-xs font-bold uppercase tracking-wider font-mono ${isLightTheme ? "text-gray-900" : "text-white"}`}>Evolução de Simetria e Eixos Posturais</span>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded border border-cyan-500/20 font-bold uppercase font-mono">Esquerda: {evalBData.date}</span>
                      <span className="text-[9px] bg-[#ccff00]/10 text-[#ccff00] px-2.5 py-0.5 rounded border border-[#ccff00]/20 font-bold uppercase font-mono">Direita: {evalAData.date}</span>
                      <button
                        type="button"
                        disabled={isExportingImage}
                        onClick={handleExportComparisonImage}
                        className="bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 hover:text-white border border-purple-500/30 px-3 py-1 rounded text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-all shrink-0 font-mono"
                      >
                        {isExportingImage ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-purple-400" /> Gerando...
                          </>
                        ) : (
                          <>
                            <Camera className="w-3 h-3 text-purple-300" /> Exportar Imagem Comparativa
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Older Evaluation B */}
                    <div className={`space-y-2 p-3 rounded-xl text-center border ${isLightTheme ? "bg-gray-50 border-gray-200" : "bg-black/40 border-gray-900"}`}>
                      <span className={`text-[10px] font-bold block uppercase ${isLightTheme ? "text-gray-700" : "text-gray-400"}`}>Eixo Anterior ({evalBData.date})</span>
                      {evalBData.photos.front ? (
                        <PostureImageWithBones
                          src={evalBData.photos.front}
                          alt="Frente anterior"
                          view="front"
                          markers={evalBData.markers.front}
                          isLightTheme={isLightTheme}
                          renderSVGBones={renderSVGBones}
                        />
                      ) : (
                        <div className={`relative aspect-square rounded-lg overflow-hidden border flex items-center justify-center text-xs ${isLightTheme ? "border-gray-200 bg-gray-100 text-gray-400" : "border-gray-800 bg-black text-gray-500"}`}>
                          Imagem não disponível
                        </div>
                      )}
                      <div className="grid grid-cols-4 gap-1 text-[9px] font-bold mt-2">
                        <div className={`p-1 rounded ${isLightTheme ? "bg-gray-200 text-gray-800" : "bg-[#121315] text-[#b9cacb]"}`}>Cervical: {evalBData.kpis.cervical}</div>
                        <div className={`p-1 rounded ${isLightTheme ? "bg-gray-200 text-gray-800" : "bg-[#121315] text-[#b9cacb]"}`}>Ombros: {evalBData.kpis.escapular}</div>
                        <div className={`p-1 rounded ${isLightTheme ? "bg-gray-200 text-gray-800" : "bg-[#121315] text-[#b9cacb]"}`}>Pelve: {evalBData.kpis.pelvico}</div>
                        <div className={`p-1 rounded ${isLightTheme ? "bg-gray-200 text-gray-800" : "bg-[#121315] text-[#b9cacb]"}`}>Geral: {evalBData.kpis.geral}</div>
                      </div>
                    </div>

                    {/* Newer Evaluation A */}
                    <div className={`space-y-2 p-3 rounded-xl text-center border ${isLightTheme ? "bg-gray-50 border-gray-200" : "bg-black/40 border-gray-900"}`}>
                      <span className={`text-[10px] font-bold block uppercase ${isLightTheme ? "text-gray-700" : "text-gray-400"}`}>Eixo Atual ({evalAData.date})</span>
                      {evalAData.photos.front ? (
                        <PostureImageWithBones
                          src={evalAData.photos.front}
                          alt="Frente atual"
                          view="front"
                          markers={evalAData.markers.front}
                          isLightTheme={isLightTheme}
                          renderSVGBones={renderSVGBones}
                        />
                      ) : (
                        <div className={`relative aspect-square rounded-lg overflow-hidden border flex items-center justify-center text-xs ${isLightTheme ? "border-gray-200 bg-gray-100 text-gray-400" : "border-gray-800 bg-black text-gray-500"}`}>
                          Imagem não disponível
                        </div>
                      )}
                      <div className="grid grid-cols-4 gap-1 text-[9px] font-bold mt-2">
                        <div className={`p-1 rounded ${isLightTheme ? "bg-gray-200 text-gray-800" : "bg-[#121315] text-[#b9cacb]"}`}>Cervical: {evalAData.kpis.cervical}</div>
                        <div className={`p-1 rounded ${isLightTheme ? "bg-gray-200 text-gray-800" : "bg-[#121315] text-[#b9cacb]"}`}>Ombros: {evalAData.kpis.escapular}</div>
                        <div className={`p-1 rounded ${isLightTheme ? "bg-gray-200 text-gray-800" : "bg-[#121315] text-[#b9cacb]"}`}>Pelve: {evalAData.kpis.pelvico}</div>
                        <div className={`p-1 rounded ${isLightTheme ? "bg-gray-200 text-gray-800" : "bg-[#121315] text-[#b9cacb]"}`}>Geral: {evalAData.kpis.geral}</div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* CHRONOLOGICAL EVALUATIONS CARDS */}
              <div className="space-y-3">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>Registros Históricos</span>

                {history.map(item => (
                  <div key={item.id} className={`border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono transition-all ${isLightTheme ? "bg-white border-gray-200 hover:border-cyan-500 text-gray-900" : "bg-[#121315]/60 border-gray-850 hover:border-[#3a494b]/30 text-white"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center ${isLightTheme ? "bg-gray-100 border-gray-200" : "bg-[#1f2022] border-gray-800"}`}>
                        <span className="text-[8px] text-gray-500 uppercase font-bold">Mês</span>
                        <span className={`text-xs font-black ${isLightTheme ? "text-gray-950" : "text-white"}`}>{item.date}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase ${isLightTheme ? "text-gray-900" : "text-gray-200"}`}>{item.answers.nome}</span>
                          <span className={`text-[8px] ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>({item.answers.idade} anos | {item.answers.peso} kg)</span>
                        </div>
                        <p className={`text-[10px] ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>
                          Dor: <b className={isLightTheme ? "text-gray-800" : "text-gray-300"}>{item.answers.dorAtual === "Sim" ? `Sim (${item.answers.localDor})` : "Ausente"}</b> | Sit: <b className={isLightTheme ? "text-gray-800" : "text-gray-300"}>{item.answers.tempoSentado}h/dia</b>
                        </p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-2.5 sm:pt-0 ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
                      <div className="flex gap-1.5 text-right font-mono text-[10px] shrink-0 mr-4">
                        <div className={`px-2.5 py-1 rounded border ${isLightTheme ? "bg-gray-50 border-gray-200" : "bg-black/40 border-gray-900"}`}>
                          <span className="text-gray-500 block text-[7px] uppercase font-bold">Geral</span>
                          <span className={`text-xs font-black ${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"}`}>{item.kpis.geral}%</span>
                        </div>
                        <div className={`px-2.5 py-1 rounded border ${isLightTheme ? "bg-gray-50 border-gray-200" : "bg-black/40 border-gray-900"}`}>
                          <span className="text-gray-500 block text-[7px] uppercase font-bold">Simetria</span>
                          <span className={`text-xs font-black ${isLightTheme ? "text-lime-600" : "text-[#ccff00]"}`}>{item.kpis.simetria}%</span>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setCompareEvalA(item.id);
                            // Populate state fields to edit or view
                            setFrontMarkers(item.markers.front);
                            setBackMarkers(item.markers.back);
                            setRightMarkers(item.markers.right);
                            setLeftMarkers(item.markers.left);
                            setFrontPhoto(item.photos.front);
                            setBackPhoto(item.photos.back);
                            setRightPhoto(item.photos.right);
                            setLeftPhoto(item.photos.left);
                            setPainCurrent(item.answers.dorAtual);
                            setPainLocation(item.answers.localDor);
                            setHoursSitting(item.answers.tempoSentado);
                            setTrainingLevel(item.answers.nivelTreino);
                            setPostureAiDiagnosis(item.aiReport || null);
                            setNewEvalStep(3);
                            setActiveTab("new");
                          }}
                          className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Visualizar Eixos
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteEvalClick(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/20 cursor-pointer"
                          title="Excluir Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </>
          )}

            </div>
          )}

        </div>
      )}

      {/* Exclude confirmation modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Excluir Avaliação Postural"
        message="Deseja realmente excluir esta análise postural do histórico? Esta ação é irreversível e removerá todos os dados, eixos e referências das fotos."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDeleteEval}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setEvalToDeleteId(null);
        }}
        variant="danger"
      />

      {/* Unlock points confirmation modal */}
      <ConfirmModal
        isOpen={isUnlockConfirmOpen}
        title="Ajuste de Pontos Bloqueado"
        message="Deseja desbloquear a autorização de edição manual para refinar os pontos anatômicos do aluno?"
        confirmLabel="Desbloquear"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setIsEditingUnlocked(true);
          if (pendingDrag) {
            setDraggingId(pendingDrag);
            setSkeletonScaleX(100);
            setSkeletonScaleY(100);
            setSkeletonOffsetX(0);
            setSkeletonOffsetY(0);
          }
          setIsUnlockConfirmOpen(false);
          setPendingDrag(null);
        }}
        onCancel={() => {
          setIsUnlockConfirmOpen(false);
          setPendingDrag(null);
        }}
      />

    </div>

    {/* STYLE BLOCK FOR HIGH-FIDELITY PRINT */}
    <style>{`
      @media print {
        body, html, #root {
          background-color: #ffffff !important;
          color: #000000 !important;
          background-image: none !important;
        }
        .print\\:hidden {
          display: none !important;
        }
        .print\\:block {
          display: block !important;
        }
        @page {
          size: A4;
          margin: 1.5cm;
        }
      }
    `}</style>

    {/* PRINT ONLY REPORT (HIGH CONTRAST, PROFESSIONAL CLINICAL STYLE) */}
    <div className="hidden print:block text-black bg-white font-sans text-xs p-6 leading-relaxed max-w-4xl mx-auto space-y-6">
      {/* Header with clinic-style logo & letterhead */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-black">TREINOPRO - LAUDO DE AVALIAÇÃO POSTURAL</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Análise e Mapeamento de Biomecânica Clínica</p>
        </div>
        <div className="text-right font-mono text-[9px] text-gray-600">
          <p>Data: {selectedEvaluationForView?.date || new Date().toLocaleDateString("pt-BR")}</p>
          <p>ID da Avaliação: #{selectedEvaluationForView?.id || "NOVO"}</p>
        </div>
      </div>

      {/* Student info grid */}
      <div className="grid grid-cols-4 gap-4 bg-gray-100 p-4 rounded-lg border border-gray-300">
        <div>
          <span className="text-[8px] font-bold text-gray-500 uppercase block">Aluno</span>
          <span className="text-xs font-bold text-black">{currentStudent?.name}</span>
        </div>
        <div>
          <span className="text-[8px] font-bold text-gray-500 uppercase block">Idade / Peso</span>
          <span className="text-xs font-semibold text-black">
            {selectedEvaluationForView?.answers.idade || painCurrent ? `${selectedEvaluationForView?.answers.idade || "N/A"} anos | ${selectedEvaluationForView?.answers.peso || "N/A"} kg` : "N/A"}
          </span>
        </div>
        <div>
          <span className="text-[8px] font-bold text-gray-500 uppercase block">Nível de Treino</span>
          <span className="text-xs font-semibold text-black">{selectedEvaluationForView?.answers.nivelTreino || trainingLevel || "N/A"}</span>
        </div>
        <div>
          <span className="text-[8px] font-bold text-gray-500 uppercase block">Dor Atual / Sentado</span>
          <span className="text-xs font-semibold text-black">
            {selectedEvaluationForView?.answers.dorAtual === "Sim" || painCurrent === "Sim" ? `Sim (${selectedEvaluationForView?.answers.localDor || painLocation})` : "Não"} / {selectedEvaluationForView?.answers.tempoSentado || hoursSitting}h/dia
          </span>
        </div>
      </div>

      {/* Overall score and indicators */}
      <div className="grid grid-cols-3 gap-6">
        {/* Overall score badge */}
        <div className="border border-black p-4 rounded-xl text-center flex flex-col justify-center items-center bg-gray-50 col-span-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Índice Postural Geral</span>
          <span className="text-4xl font-black text-black my-2">{computedMetrics.geralScore}%</span>
          <span className="text-[9px] text-gray-600 font-medium">Classificação: {computedMetrics.geralScore > 85 ? "Excelente" : computedMetrics.geralScore > 70 ? "Bom / Estável" : "Compensações Visíveis"}</span>
        </div>

        {/* Local indices table */}
        <div className="col-span-2 border border-gray-300 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold uppercase border-b border-gray-200 pb-1">Índices de Alinhamento Articular</h3>
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
              <span className="text-gray-600">Índice Cervical:</span>
              <span className="font-bold">{computedMetrics.cervicalScore === null ? "—" : `${computedMetrics.cervicalScore}%`}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
              <span className="text-gray-600">Índice Escapular:</span>
              <span className="font-bold">{computedMetrics.scapularScore}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
              <span className="text-gray-600">Índice Pélvico:</span>
              <span className="font-bold">{computedMetrics.pelvicScore}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
              <span className="text-gray-600">Índice Simetria:</span>
              <span className="font-bold">{computedMetrics.simetriaScore}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
              <span className="text-gray-600">Índice Estabilidade:</span>
              <span className="font-bold">{computedMetrics.estabilidadeScore === null ? "—" : `${computedMetrics.estabilidadeScore}%`}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
              <span className="text-gray-600">Mobilidade Estimada:</span>
              <span className="font-bold">{computedMetrics.mobilidadeScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estimated Deviations & Risk */}
      <div className="grid grid-cols-2 gap-6">
        <div className="border border-gray-300 p-4 rounded-xl space-y-2">
          <h3 className="text-xs font-bold uppercase border-b border-gray-200 pb-1">Análise Angular de Desvios</h3>
          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Região Cervical:</span>
              <span className="font-bold text-black">{computedMetrics.cervicalText}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Região dos Ombros:</span>
              <span className="font-bold text-black">{computedMetrics.shoulderText}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Eixo Quadril / Pelve:</span>
              <span className="font-bold text-black">{computedMetrics.pelvicText}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Articulação dos Joelhos:</span>
              <span className="font-bold text-black">{computedMetrics.kneeText}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-300 p-4 rounded-xl space-y-2 bg-gray-50 flex flex-col justify-center">
          <span className="text-[9px] font-bold text-gray-500 uppercase block">Risco Geral de Compensação</span>
          <span className="text-lg font-black text-black uppercase tracking-wide my-1">{computedMetrics.risk}</span>
          <p className="text-[9px] text-gray-500 leading-normal">
            Risco calculado com base no somatório das assimetrias escapulares, báscula pélvica e projeção cervical detectadas nas fotos.
          </p>
        </div>
      </div>

      {/* AI Narrative Report */}
      {postureAiDiagnosis && (
        <div className="border border-gray-300 p-4 rounded-xl space-y-2">
          <h3 className="text-xs font-bold uppercase border-b border-gray-200 pb-1">Parecer Técnico e Análise de Alinhamento</h3>
          <p className="text-[10px] text-gray-700 whitespace-pre-wrap leading-relaxed font-mono">
            {postureAiDiagnosis}
          </p>
        </div>
      )}

      {/* Corrective exercises list */}
      <div className="border border-gray-300 p-4 rounded-xl space-y-3">
        <h3 className="text-xs font-bold uppercase border-b border-gray-200 pb-1">Prescrição de Exercícios Corretivos & Mobilidade</h3>
        <div className="space-y-3">
          {computedMetrics.suggestions.map((ex, idx) => (
            <div key={idx} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-black">{idx + 1}. {ex.name.toUpperCase()}</span>
                <span className="text-[8px] bg-gray-200 text-black px-2 py-0.5 rounded font-bold uppercase">{ex.target}</span>
              </div>
              <p className="text-[10px] text-gray-600 mt-1">{ex.description}</p>
              <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono">
                <span>Séries: <b>{ex.sets}</b> | Repetições: <b>{ex.reps}</b></span>
                <span>Observações: {ex.notes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with signatures and legal disclaimer */}
      <div className="pt-8 border-t border-gray-300 grid grid-cols-2 gap-8 text-[10px]">
        <div className="space-y-4">
          <p className="leading-normal text-gray-500">
            <b>Nota de Responsabilidade:</b> Este laudo postural representa uma estimativa e mapeamento biomecânico detalhado sobre referências fotostáticas. Não substitui consulta médica ou diagnóstico fisioterapêutico clínico especializado.
          </p>
        </div>
        <div className="text-center space-y-8 flex flex-col justify-end">
          <div className="border-b border-gray-400 w-3/4 mx-auto"></div>
          <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-700">Assinatura do Profissional Responsável</p>
        </div>
      </div>
    </div>

    {/* HIGH PRECISION ZOOM MODAL */}
    {isZoomModalOpen && (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 animate-fade-in print:hidden backdrop-blur-md transition-all duration-300 ${
        isLightTheme ? "bg-white/70" : "bg-black/85"
      }`}>
        <div className={`w-full max-w-7xl h-[95vh] md:h-[90vh] border rounded-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-300 shadow-[0_10px_50px_rgba(0,0,0,0.15)] ${
          isLightTheme ? "bg-white border-gray-200/90" : "bg-[#0c0d0e] border-gray-800/80 shadow-[0_0_50px_rgba(0,242,255,0.05)]"
        }`}>
          
          {/* LEFT SIDE: Big Image Canvas (60%) */}
          <div className={`flex-1 p-6 relative flex flex-col items-center justify-center min-h-0 border-b md:border-b-0 md:border-r transition-colors duration-300 ${
            isLightTheme ? "bg-[#f3f4f6] border-gray-200" : "bg-black border-gray-900"
          }`}>
            
            {/* Modal Header inside left panel */}
            <div className={`absolute top-4 left-4 right-4 flex items-center justify-between z-30 p-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 ${
              isLightTheme 
                ? "bg-white/80 border-gray-200/60 shadow-sm text-gray-800" 
                : "bg-black/50 border-gray-800/40 text-white"
            }`}>
              <div className="flex items-center gap-2">
                <Maximize2 className={`w-4 h-4 ${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"}`} />
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  isLightTheme ? "text-gray-950" : "text-white"
                }`}>
                  Ajustador de Alta Precisão ({activePhotoView.toUpperCase()})
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <span className={`text-[10px] font-mono ${
                  isLightTheme ? "text-gray-600" : "text-gray-400"
                }`}>
                  Arraste os pontos anatômicos com precisão milimétrica
                </span>
              </div>
            </div>

            {/* Big Canvas Wrapper (Even Larger Sizing) */}
            <div 
              className={`relative w-full max-w-[420px] sm:max-w-[460px] md:max-w-[480px] lg:max-w-[500px] xl:max-w-[540px] aspect-[3/4] rounded-2xl overflow-hidden border select-none transition-all duration-300 shadow-2xl ${
                isLightTheme ? "bg-white border-gray-200" : "bg-black border-gray-900"
              }`}
            >
              {activePhotoState && (
                <div
                  ref={imageContainerRef}
                  className="absolute"
                  style={{
                    left: `${activeLayout.offsetX}%`,
                    top: `${activeLayout.offsetY}%`,
                    width: `${activeLayout.renderW}%`,
                    height: `${activeLayout.renderH}%`,
                    transform: `scale(${photoScales[activePhotoView] / 100}) translate(${photoOffsets[activePhotoView].x}px, ${photoOffsets[activePhotoView].y}px)`,
                    transformOrigin: "center center",
                    transition: "transform 0.1s ease-out"
                  }}
                >
                  <img
                    referrerPolicy="no-referrer"
                    src={activePhotoState}
                    alt={`Postura ${activePhotoView}`}
                    className="w-full h-full object-fill pointer-events-none"
                    draggable="false"
                  />

                  {/* SVG overlay bones drawing */}
                  {showSkeleton && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      {renderSVGBones(activePhotoView, activeMarkersList, 0, 0, 100, 100)}
                    </svg>
                  )}

                  {/* Draggable markers */}
                  {activeMarkersList.map((m, idx) => {
                    const mId = m.id || m.label || `marker-modal-${idx}`;
                    const isSelected = (m.id || m.label) === selectedPointForGuide;
                    return (
                      <div
                        key={mId}
                        className="absolute select-none cursor-grab active:cursor-grabbing z-20 group"
                        style={{
                          left: `${m.x}%`,
                          top: `${m.y}%`,
                          transform: "translate(-50%, -50%)",
                          touchAction: "none"
                        }}
                        onMouseDown={handleMarkerMouseDown(activePhotoView, m.id || m.label)}
                        onTouchStart={handleMarkerTouchStart(activePhotoView, m.id || m.label)}
                      >
                        <div className="relative flex flex-col items-center">
                          {/* Pulse animation for selected marker */}
                          {isSelected && (
                            <div className="absolute -inset-2 bg-[#00f2ff]/40 rounded-full animate-ping z-0 pointer-events-none" />
                          )}
                          <div className={`w-4 h-4 rounded-full ${getMarkerColor(m.type)} border-2 shadow-lg flex items-center justify-center transition-all z-10 ${isSelected ? "border-[#00f2ff] scale-125 shadow-[0_0_10px_#00f2ff]" : ""}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                          
                          {/* Marker label - Only appears on hover or selection */}
                          <div className={`absolute top-5 text-[8px] font-mono px-1.5 py-0.5 rounded border shadow-md whitespace-nowrap flex items-center gap-1 pointer-events-none z-20 transition-all duration-150 origin-top ${
                            isSelected 
                              ? isLightTheme 
                                ? "bg-white border-cyan-500/30 text-gray-900 shadow-md opacity-100 scale-100 translate-y-0" 
                                : "bg-black border-cyan-500/20 text-white opacity-100 scale-100 translate-y-0"
                              : isLightTheme 
                                ? "bg-white border-gray-200 text-gray-600 shadow-sm opacity-0 scale-95 -translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0" 
                                : "bg-black/95 border-gray-800 text-gray-400 opacity-0 scale-95 -translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                          }`}>
                            <span>{m.label}</span>
                            <span className={`${isLightTheme ? "text-gray-400" : "text-gray-500"} text-[7px]`}>
                              ({Math.round(m.x)}, {Math.round(m.y)})
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Left Ruler Overlay */}
              {showRuler && renderLeftRuler()}

              {/* Posture Silhouette Guide Overlay */}
              <PostureSilhouetteGuide studentHeight={studentHeightCm} scalePercent={rulerScalePercent} shiftPercent={rulerShiftPercent} />

              {/* Laser grid/alignment overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  {/* Vertical subdivisions */}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={`v-grid-modal-${i}`}
                      className={`absolute top-0 bottom-0 border-r ${
                        i === 4 ? "border-transparent" : isLightTheme ? "border-cyan-500/15" : "border-cyan-500/10"
                      }`}
                      style={{ left: `${(i + 1) * 10}%` }}
                    />
                  ))}
                  {/* Horizontal subdivisions */}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={`h-grid-modal-${i}`}
                      className={`absolute left-0 right-0 border-b ${
                        i === 4 ? "border-transparent" : isLightTheme ? "border-cyan-500/15" : "border-cyan-500/10"
                      }`}
                      style={{ top: `${(i + 1) * 10}%` }}
                    />
                  ))}

                  {/* Plumb Line */}
                  <div className="absolute top-0 bottom-0 left-1/2 border-r-2 border-dashed border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                  {/* Horizontal hip line */}
                  <div className="absolute left-0 right-0 top-1/2 border-b-2 border-dashed border-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.3)]" />
                </div>
              )}
            </div>

            {/* Zoom & offset sliders in modal (Dual theme supported) */}
            <div className={`absolute bottom-4 left-4 right-4 p-3.5 rounded-xl border backdrop-blur-md text-[9px] font-mono grid grid-cols-3 gap-4 transition-all shadow-md ${
              isLightTheme 
                ? "bg-white/95 border-gray-200 text-gray-700 shadow-lg" 
                : "bg-black/70 border-gray-900/60 text-gray-400"
            }`}>
              <div>
                <span className={`block mb-1 font-semibold ${isLightTheme ? "text-gray-800" : "text-gray-400"}`}>
                  Zoom: {photoScales[activePhotoView]}%
                </span>
                <input
                  type="range"
                  min="50"
                  max="250"
                  value={photoScales[activePhotoView]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPhotoScales(prev => ({ ...prev, [activePhotoView]: val }));
                  }}
                  className="w-full accent-cyan-500 h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <span className={`block mb-1 font-semibold ${isLightTheme ? "text-gray-800" : "text-gray-400"}`}>
                  Mover X: {photoOffsets[activePhotoView].x}px
                </span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={photoOffsets[activePhotoView].x}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPhotoOffsets(prev => ({ ...prev, [activePhotoView]: { ...prev[activePhotoView], x: val } }));
                  }}
                  className="w-full accent-cyan-500 h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <span className={`block mb-1 font-semibold ${isLightTheme ? "text-gray-800" : "text-gray-400"}`}>
                  Mover Y: {photoOffsets[activePhotoView].y}px
                </span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={photoOffsets[activePhotoView].y}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPhotoOffsets(prev => ({ ...prev, [activePhotoView]: { ...prev[activePhotoView], y: val } }));
                  }}
                  className="w-full accent-cyan-500 h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Interactive Point Guide Sidebar (380px width) */}
          <div className={`w-full md:w-[380px] p-5 flex flex-col justify-between overflow-y-auto space-y-4 transition-all border-l ${
            isLightTheme ? "bg-[#fdfefe] border-gray-200" : "bg-[#0c0d0e] border-gray-900"
          }`}>
            
            {/* Top title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 ${
                  isLightTheme ? "text-gray-900" : "text-white"
                }`}>
                  <Compass className={`w-3.5 h-3.5 ${isLightTheme ? "text-cyan-600" : "text-cyan-400"}`} /> 
                  Guia de Pontos
                </h4>
                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(false)}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isLightTheme 
                      ? "text-gray-500 hover:text-gray-900 bg-gray-100/60 hover:bg-gray-100 border-gray-200" 
                      : "text-gray-400 hover:text-white bg-[#121315]/50 hover:bg-[#121315] border-gray-900 hover:border-gray-800"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[9px] text-gray-500 font-mono">
                Ajuste fino guiado para calibração biomecânica.
              </p>
            </div>

            {/* Selected Point Instruction Card */}
            {(() => {
              const selectedMarker = activeMarkersList.find(m => (m.id || m.label) === selectedPointForGuide) || activeMarkersList[0];
              if (!selectedMarker) return null;
              const instruction = getMarkerInstruction(selectedMarker.label);
              
              // Get next/previous points for pagination
              const currentIndex = activeMarkersList.findIndex(m => (m.id || m.label) === (selectedMarker.id || selectedMarker.label));
              const hasPrev = currentIndex > 0;
              const hasNext = currentIndex < activeMarkersList.length - 1;
              
              const handlePrevPoint = () => {
                if (hasPrev) {
                  const prevM = activeMarkersList[currentIndex - 1];
                  setSelectedPointForGuide(prevM.id || prevM.label);
                }
              };
              
              const handleNextPoint = () => {
                if (hasNext) {
                  const nextM = activeMarkersList[currentIndex + 1];
                  setSelectedPointForGuide(nextM.id || nextM.label);
                }
              };

              return (
                <div className="flex-1 flex flex-col justify-between gap-3 py-1 min-h-0">
                  {/* Information Card */}
                  <div className={`border rounded-xl p-3.5 space-y-2 font-mono transition-all ${
                    isLightTheme 
                      ? "bg-[#f5f7fa] border-cyan-500/30 text-gray-800" 
                      : "bg-[#121315] border-cyan-500/20 text-gray-300"
                  }`}>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Ponto Ativo</span>
                    </div>
                    
                    <div>
                      <h5 className={`text-sm font-extrabold uppercase tracking-tight ${
                        isLightTheme ? "text-gray-950" : "text-white"
                      }`}>
                        {selectedMarker.label}
                      </h5>
                      <span className={`text-[9px] font-semibold uppercase tracking-wider block mt-0.5 ${
                        isLightTheme ? "text-cyan-600" : "text-cyan-400"
                      }`}>
                        {instruction.subtitle}
                      </span>
                    </div>
                    
                    <div className={`p-2.5 rounded-xl border ${
                      isLightTheme ? "bg-white border-gray-255 text-gray-700" : "bg-black/50 border-gray-900 text-gray-300"
                    }`}>
                      <span className="text-[8px] font-bold text-gray-500 uppercase block mb-1">Dica de Posicionamento:</span>
                      <p className="text-[9.5px] leading-relaxed">{instruction.description}</p>
                    </div>
                    
                    <div className={`text-[9px] flex justify-between pt-1 border-t ${
                      isLightTheme ? "text-gray-500 border-gray-200/80" : "text-gray-500 border-gray-900/60"
                    }`}>
                      <span>Coordenadas:</span>
                      <span className={`font-bold ${isLightTheme ? "text-gray-900" : "text-white"}`}>
                        X: {Math.round(selectedMarker.x)}% | Y: {Math.round(selectedMarker.y)}%
                      </span>
                    </div>
                  </div>

                  {/* Point Selection List */}
                  <div className="space-y-1.5 min-h-0 flex-1">
                    <span className={`text-[8.5px] font-bold font-mono uppercase tracking-wider block ${
                      isLightTheme ? "text-gray-600" : "text-gray-500"
                    }`}>
                      Selecione para ajustar:
                    </span>
                    <div className="grid grid-cols-2 gap-1 overflow-y-auto max-h-[140px] pr-1">
                      {activeMarkersList.map((m) => {
                        const mId = m.id || m.label;
                        const mSelected = mId === selectedPointForGuide;
                        return (
                          <button
                            key={mId}
                            type="button"
                            onClick={() => setSelectedPointForGuide(mId)}
                            className={`p-1.5 rounded-lg text-left border font-mono text-[8px] font-bold transition-all truncate flex items-center gap-1.5 cursor-pointer ${
                              mSelected
                                ? "bg-cyan-500/10 text-cyan-600 border-cyan-500/40 shadow-sm"
                                : isLightTheme
                                  ? "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                                  : "bg-[#121315]/50 text-gray-400 border-gray-900 hover:text-white"
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full ${getMarkerColor(m.type)}`} />
                            <span className="truncate">{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ruler Calibration Section inside Sidebar */}
                  <div className={`p-3 rounded-xl border font-mono space-y-2.5 transition-all ${
                    isLightTheme 
                      ? "bg-[#f5f7fa] border-gray-200 text-gray-700" 
                      : "bg-[#121315] border-gray-850 text-gray-400"
                  }`}>
                    <div className="flex items-center justify-between border-b pb-1.5 border-gray-200/60 dark:border-gray-800/60">
                      <div className="flex items-center gap-1.5">
                        <Compass className={`w-3.5 h-3.5 ${isLightTheme ? "text-cyan-600" : "text-cyan-400"}`} />
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isLightTheme ? "text-gray-900" : "text-white"}`}>Calibrar Régua</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRuler(!showRuler)}
                        className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded border transition-colors ${
                          showRuler
                            ? "bg-cyan-500/15 text-cyan-600 border-cyan-500/30 dark:text-cyan-400"
                            : isLightTheme
                              ? "bg-gray-100 text-gray-400 border-gray-200"
                              : "bg-[#0e0f11] text-gray-600 border-gray-800"
                        }`}
                      >
                        {showRuler ? "ON" : "OFF"}
                      </button>
                    </div>
                    
                    {showRuler && (
                      <div className="space-y-2 pt-0.5 text-[8.5px]">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Posição Vertical (Y):</span>
                            <span className={`font-bold ${isLightTheme ? "text-gray-950" : "text-white"}`}>{rulerShiftPercent}px</span>
                          </div>
                          <input
                            type="range"
                            min="-150"
                            max="150"
                            value={rulerShiftPercent}
                            onChange={(e) => setRulerShiftPercent(Number(e.target.value))}
                            className="w-full accent-cyan-500 h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Escala / Proporção:</span>
                            <span className={`font-bold ${isLightTheme ? "text-gray-950" : "text-white"}`}>{rulerScalePercent}%</span>
                          </div>
                          <input
                            type="range"
                            min="60"
                            max="150"
                            value={rulerScalePercent}
                            onChange={(e) => setRulerScalePercent(Number(e.target.value))}
                            className="w-full accent-cyan-500 h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <p className="text-[7.5px] text-gray-500 leading-normal">
                          Ajuste o início e fim da fita métrica para coincidir com a postura real do avaliado na foto.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pagination controls */}
                  <div className={`flex items-center justify-between gap-2 pt-2.5 border-t font-mono text-[9px] font-bold uppercase ${
                    isLightTheme ? "border-gray-200" : "border-gray-900"
                  }`}>
                    <button
                      type="button"
                      disabled={!hasPrev}
                      onClick={handlePrevPoint}
                      className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                        hasPrev
                          ? isLightTheme
                            ? "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300"
                            : "bg-[#121315] text-white border-gray-800 hover:bg-gray-900"
                          : isLightTheme
                            ? "text-gray-300 border-gray-100 cursor-not-allowed opacity-50"
                            : "text-gray-600 border-gray-950 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <ChevronLeft className="w-3 h-3" /> Ant
                    </button>
                    
                    <span className="text-gray-500 text-[8px]">
                      {currentIndex + 1} / {activeMarkersList.length}
                    </span>

                    <button
                      type="button"
                      disabled={!hasNext}
                      onClick={handleNextPoint}
                      className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                        hasNext
                          ? "bg-[#ccff00] text-black border-yellow-500 hover:bg-[#b5e000]"
                          : isLightTheme
                            ? "text-gray-300 border-gray-100 cursor-not-allowed opacity-50"
                            : "text-gray-600 border-gray-950 cursor-not-allowed opacity-50"
                      }`}
                    >
                      Próx <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Bottom confirmation action */}
            <div className={`pt-3 border-t ${isLightTheme ? "border-gray-200" : "border-gray-900"}`}>
              <button
                type="button"
                onClick={() => setIsZoomModalOpen(false)}
                className="w-full py-2.5 bg-[#ccff00] hover:bg-[#b5e000] text-black text-[10px] font-mono font-bold uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(204,255,0,0.15)] flex items-center justify-center gap-1 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Concluir Ajustes Finos
              </button>
            </div>

          </div>
        </div>
      </div>
    )}
  </>
  );
}
