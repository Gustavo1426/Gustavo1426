import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Users, 
  Scale, 
  Camera, 
  Plus, 
  Sparkles,
  CheckCircle,
  X,
  Trash2,
  ChevronRight,
  Info,
  Loader2,
  Check,
  Activity,
  Award,
  Zap,
  TrendingUp,
  Flame,
  Moon,
  ChevronLeft,
  Save,
  FileText,
  LayoutDashboard,
  ClipboardList,
  Settings,
  Upload
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Student } from "../../../../types";
import { generateEvaluationPDF } from "../../../../shared/core/utils/generatePDF";
import { calcularAntropometria } from "../../../../shared/core/utils/bodyComposition";
import ConfirmModal from "../../../../shared/presentation/components/ConfirmModal";

// Modular Imports
import AntropometriaView, { DobrasData, PerimetrosData } from "./AntropometriaView";
import RiscoCardiacoView, { 
  RiscoCardiacoResponse, 
  getRiscoCardiacoClassification,
  RISCO_CARDIAC_QUESTIONS
} from "./RiscoCardiacoView";
import IndiceAtividadeView, { 
  IndiceAtividadeResponse, 
  getIndiceAtividadeClassification 
} from "./IndiceAtividadeView";
import QuestionarioSonoView, { 
  getSonoClassification,
  SONO_QUESTIONS 
} from "./QuestionarioSonoView";
import QuestionarioEstresseView, { 
  getEstresseClassification,
  ESTRESSE_QUESTIONS 
} from "./QuestionarioEstresseView";

// ==========================================
// 📊 REAL-TIME AUTOMATIC CALCULATIONS ENGINE
// ==========================================

export const getIMC = (peso: number, alturaCm: number) => {
  if (peso < 20 || peso > 300 || alturaCm < 100 || alturaCm > 230) {
    return { imc: 0, text: "Dados inválidos", color: "text-gray-400", hex: "#9ca3af", status: "error" };
  }
  const alturaM = alturaCm / 100;
  const imc = peso / (alturaM * alturaM);
  if (imc < 10 || imc > 80) {
    return { imc: parseFloat(imc.toFixed(1)), text: "Valores impossíveis", color: "text-rose-500", hex: "#f43f5e", status: "error" };
  }
  
  let text = "Peso normal";
  let color = "text-emerald-400";
  let hex = "#34d399";
  let status = "success";
  if (imc < 18.5) {
    text = "Abaixo do peso";
    color = "text-amber-400";
    hex = "#fbbf24";
  } else if (imc < 25) {
    text = "Peso normal";
    color = "text-emerald-400";
    hex = "#34d399";
  } else if (imc < 30) {
    text = "Sobrepeso";
    color = "text-orange-400";
    hex = "#fb923c";
  } else if (imc < 35) {
    text = "Obesidade Grau I";
    color = "text-rose-500";
    hex = "#f43f5e";
  } else if (imc < 40) {
    text = "Obesidade Grau II";
    color = "text-rose-600";
    hex = "#e11d48";
  } else {
    text = "Obesidade Grau III";
    color = "text-rose-700";
    hex = "#be123c";
  }
  return { imc: parseFloat(imc.toFixed(2)), text, color, hex, status };
};

export const getRCQ = (cintura?: number, quadril?: number, genero: "masculino" | "feminino" = "masculino") => {
  if (!cintura || !quadril || quadril === 0) {
    return { rcq: 0, text: "Insira medidas", color: "text-gray-400", valid: false };
  }
  const rcq = cintura / quadril;
  const valid = rcq >= 0.60 && rcq <= 1.30;
  
  let text = "Baixo risco";
  let color = "text-emerald-400";
  if (genero === "masculino") {
    if (rcq < 0.95) {
      text = "Baixo risco";
      color = "text-emerald-400";
    } else if (rcq <= 1.0) {
      text = "Risco moderado";
      color = "text-amber-400";
    } else {
      text = "Alto risco";
      color = "text-rose-500";
    }
  } else {
    if (rcq < 0.80) {
      text = "Baixo risco";
      color = "text-emerald-400";
    } else if (rcq <= 0.85) {
      text = "Risco moderado";
      color = "text-amber-400";
    } else {
      text = "Alto risco";
      color = "text-rose-500";
    }
  }
  
  return { rcq: parseFloat(rcq.toFixed(2)), text, color, valid };
};

export const getRCE = (cintura?: number, estatura?: number) => {
  if (!cintura || !estatura || estatura === 0) {
    return { rce: 0, text: "Insira medidas", color: "text-gray-400", valid: false };
  }
  const rce = cintura / estatura;
  const valid = rce >= 0.30 && rce <= 0.80;
  
  let text = "Baixo risco";
  let color = "text-emerald-400";
  if (rce < 0.5) {
    text = "Baixo risco";
    color = "text-emerald-400";
  } else if (rce < 0.6) {
    text = "Risco aumentado";
    color = "text-amber-400";
  } else {
    text = "Alto risco (gordura visceral)";
    color = "text-rose-500";
  }
  return { rce: parseFloat(rce.toFixed(2)), text, color, valid };
};

export const getPercentualGorduraDobras = (
  dobras: DobrasData,
  idade: number,
  genero: "masculino" | "feminino",
  protocolo: "jp3" | "jp7" | "durnin" | "faulkner" | "guedes",
  conversao: "siri" | "brozek"
) => {
  let dc = 0;
  let missingFields: string[] = [];
  
  if (protocolo === "jp3") {
    if (genero === "masculino") {
      const { peitoral, abdomen, coxa } = dobras;
      if (peitoral === undefined || abdomen === undefined || coxa === undefined) {
        if (peitoral === undefined) missingFields.push("Peitoral");
        if (abdomen === undefined) missingFields.push("Abdominal");
        if (coxa === undefined) missingFields.push("Coxa");
        return { bf: 0, dc: 0, missingFields, valid: false };
      }
      const sum3 = peitoral + abdomen + coxa;
      dc = 1.10938 - (0.0008267 * sum3) + (0.0000016 * sum3 * sum3) - (0.0002574 * idade);
    } else {
      const { triceps, suprailiaca, coxa } = dobras;
      if (triceps === undefined || suprailiaca === undefined || coxa === undefined) {
        if (triceps === undefined) missingFields.push("Tríceps");
        if (suprailiaca === undefined) missingFields.push("Suprailíaca");
        if (coxa === undefined) missingFields.push("Coxa");
        return { bf: 0, dc: 0, missingFields, valid: false };
      }
      const sum3 = triceps + suprailiaca + coxa;
      dc = 1.097 - (0.00085 * sum3) + (0.0000015 * sum3 * sum3) - (0.00022 * idade);
    }
  } else if (protocolo === "jp7") {
    const { peitoral, mediaAxilar, triceps, subescapular, abdomen, suprailiaca, coxa } = dobras;
    if (
      peitoral === undefined || mediaAxilar === undefined || triceps === undefined ||
      subescapular === undefined || abdomen === undefined || suprailiaca === undefined || coxa === undefined
    ) {
      if (peitoral === undefined) missingFields.push("Peitoral");
      if (mediaAxilar === undefined) missingFields.push("Axilar Média");
      if (triceps === undefined) missingFields.push("Tríceps");
      if (subescapular === undefined) missingFields.push("Subescapular");
      if (abdomen === undefined) missingFields.push("Abdominal");
      if (suprailiaca === undefined) missingFields.push("Suprailíaca");
      if (coxa === undefined) missingFields.push("Coxa");
      return { bf: 0, dc: 0, missingFields, valid: false };
    }
    const sum7 = peitoral + mediaAxilar + triceps + subescapular + abdomen + suprailiaca + coxa;
    if (genero === "masculino") {
      dc = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * idade);
    } else {
      dc = 1.097 - (0.000390 * sum7) + (0.00000015 * sum7 * sum7) - (0.000242 * idade);
    }
  } else if (protocolo === "durnin") {
    const { biceps, triceps, subescapular, suprailiaca } = dobras;
    if (biceps === undefined || triceps === undefined || subescapular === undefined || suprailiaca === undefined) {
      if (biceps === undefined) missingFields.push("Bíceps");
      if (triceps === undefined) missingFields.push("Tríceps");
      if (subescapular === undefined) missingFields.push("Subescapular");
      if (suprailiaca === undefined) missingFields.push("Suprailíaca");
      return { bf: 0, dc: 0, missingFields, valid: false };
    }
    const sum4 = biceps + triceps + subescapular + suprailiaca;
    const logSum = Math.log10(sum4 || 1);
    if (genero === "masculino") {
      dc = 1.1765 - (0.0744 * logSum);
    } else {
      dc = 1.1665 - (0.0706 * logSum);
    }
  } else if (protocolo === "faulkner") {
    const { peitoral, mediaAxilar, triceps, subescapular } = dobras;
    if (peitoral === undefined || mediaAxilar === undefined || triceps === undefined || subescapular === undefined) {
      if (peitoral === undefined) missingFields.push("Peitoral");
      if (mediaAxilar === undefined) missingFields.push("Axilar Média");
      if (triceps === undefined) missingFields.push("Tríceps");
      if (subescapular === undefined) missingFields.push("Subescapular");
      return { bf: 0, dc: 0, missingFields, valid: false };
    }
    const sum4 = peitoral + mediaAxilar + triceps + subescapular;
    const logSum = Math.log10(sum4 || 1);
    dc = 1.1620 - (0.0630 * logSum);
  } else if (protocolo === "guedes") {
    const { triceps, subescapular, peitoral, mediaAxilar, abdomen, suprailiaca, coxa, panturrilha } = dobras;
    if (
      triceps === undefined || subescapular === undefined || peitoral === undefined ||
      mediaAxilar === undefined || abdomen === undefined || suprailiaca === undefined ||
      coxa === undefined || panturrilha === undefined
    ) {
      if (triceps === undefined) missingFields.push("Tríceps");
      if (subescapular === undefined) missingFields.push("Subescapular");
      if (peitoral === undefined) missingFields.push("Peitoral");
      if (mediaAxilar === undefined) missingFields.push("Axilar Média");
      if (abdomen === undefined) missingFields.push("Abdominal");
      if (suprailiaca === undefined) missingFields.push("Suprailíaca");
      if (coxa === undefined) missingFields.push("Coxa");
      if (panturrilha === undefined) missingFields.push("Panturrilha");
      return { bf: 0, dc: 0, missingFields, valid: false };
    }
    const sum8 = triceps + subescapular + peitoral + mediaAxilar + abdomen + suprailiaca + coxa + panturrilha;
    const logSum = Math.log10(sum8 || 1);
    dc = 1.15 - (0.062 * logSum);
  }
  
  if (dc <= 0) return { bf: 0, dc: 0, missingFields, valid: false };
  
  let bf = 0;
  if (conversao === "siri") {
    bf = (495 / dc) - 450;
  } else {
    bf = (457 / dc) - 414.2;
  }
  
  const valid = bf >= 3 && bf <= 60;
  return { bf: parseFloat(bf.toFixed(1)), dc: parseFloat(dc.toFixed(4)), missingFields, valid };
};

export const getBFClassification = (bf: number, idade: number, genero: "masculino" | "feminino") => {
  if (bf <= 0) return { text: "Sem dados", color: "text-gray-400" };
  let cat: "baixo" | "normal" | "alto" | "muitoAlto" = "normal";
  
  if (genero === "masculino") {
    if (idade < 30) {
      if (bf < 14) cat = "baixo";
      else if (bf <= 20) cat = "normal";
      else if (bf <= 25) cat = "alto";
      else cat = "muitoAlto";
    } else if (idade < 40) {
      if (bf < 15) cat = "baixo";
      else if (bf <= 21) cat = "normal";
      else if (bf <= 26) cat = "alto";
      else cat = "muitoAlto";
    } else if (idade < 50) {
      if (bf < 16) cat = "baixo";
      else if (bf <= 22) cat = "normal";
      else if (bf <= 27) cat = "alto";
      else cat = "muitoAlto";
    } else if (idade < 60) {
      if (bf < 17) cat = "baixo";
      else if (bf <= 23) cat = "normal";
      else if (bf <= 28) cat = "alto";
      else cat = "muitoAlto";
    } else {
      if (bf < 18) cat = "baixo";
      else if (bf <= 24) cat = "normal";
      else if (bf <= 29) cat = "alto";
      else cat = "muitoAlto";
    }
  } else {
    if (idade < 30) {
      if (bf < 21) cat = "baixo";
      else if (bf <= 28) cat = "normal";
      else if (bf <= 33) cat = "alto";
      else cat = "muitoAlto";
    } else if (idade < 40) {
      if (bf < 22) cat = "baixo";
      else if (bf <= 29) cat = "normal";
      else if (bf <= 34) cat = "alto";
      else cat = "muitoAlto";
    } else if (idade < 50) {
      if (bf < 23) cat = "baixo";
      else if (bf <= 30) cat = "normal";
      else if (bf <= 35) cat = "alto";
      else cat = "muitoAlto";
    } else if (idade < 60) {
      if (bf < 24) cat = "baixo";
      else if (bf <= 31) cat = "normal";
      else if (bf <= 36) cat = "alto";
      else cat = "muitoAlto";
    } else {
      if (bf < 25) cat = "baixo";
      else if (bf <= 32) cat = "normal";
      else if (bf <= 37) cat = "alto";
      else cat = "muitoAlto";
    }
  }
  
  const mapping = {
    baixo: { text: "Baixo", color: "text-amber-400" },
    normal: { text: "Normal (Saudável)", color: "text-emerald-400" },
    alto: { text: "Alto", color: "text-orange-400" },
    muitoAlto: { text: "Muito Alto", color: "text-rose-500" }
  };
  return mapping[cat];
};

export const getTMB = (peso: number, alturaCm: number, idade: number, genero: "masculino" | "feminino", formula: "harris" | "mifflin") => {
  if (peso <= 0 || alturaCm <= 0 || idade <= 0) return 0;
  let tmb = 0;
  if (formula === "harris") {
    if (genero === "masculino") {
      tmb = 88.362 + (13.397 * peso) + (4.799 * alturaCm) - (5.677 * idade);
    } else {
      tmb = 447.593 + (9.247 * peso) + (3.098 * alturaCm) - (4.330 * idade);
    }
  } else {
    if (genero === "masculino") {
      tmb = (10 * peso) + (6.25 * alturaCm) - (5 * idade) + 5;
    } else {
      tmb = (10 * peso) + (6.25 * alturaCm) - (5 * idade) - 161;
    }
  }
  return Math.round(tmb);
};

export const getPesoIdeal = (alturaCm: number, genero: "masculino" | "feminino", formula: "lorenz" | "broca" | "devine") => {
  if (alturaCm <= 0) return 0;
  let pesoIdeal = 0;
  if (formula === "lorenz") {
    if (genero === "masculino") {
      pesoIdeal = (alturaCm - 100) - ((alturaCm - 150) / 4);
    } else {
      pesoIdeal = (alturaCm - 100) - ((alturaCm - 150) / 2.5);
    }
  } else if (formula === "broca") {
    pesoIdeal = alturaCm - 100;
  } else if (formula === "devine") {
    const inches = alturaCm / 2.54;
    const diff = Math.max(0, inches - 60);
    if (genero === "masculino") {
      pesoIdeal = 50 + (2.3 * diff);
    } else {
      pesoIdeal = 45.5 + (2.3 * diff);
    }
  }
  return parseFloat(pesoIdeal.toFixed(1));
};

export const getSuperficieCorporal = (peso: number, alturaCm: number) => {
  if (peso <= 0 || alturaCm <= 0) return 0;
  const sc = 0.007184 * Math.pow(peso, 0.425) * Math.pow(alturaCm, 0.725);
  return parseFloat(sc.toFixed(2));
};

export const get1RM = (carga: number, repeticoes: number, formula: "brzycki" | "epley" | "baechle") => {
  if (carga <= 0 || repeticoes <= 0) return 0;
  let max = 0;
  if (formula === "brzycki") {
    const factor = 1.0278 - (0.0278 * repeticoes);
    max = factor > 0 ? carga / factor : carga;
  } else if (formula === "epley") {
    max = carga * (1 + (repeticoes / 30));
  } else {
    max = carga * (1 + (0.033 * repeticoes));
  }
  return parseFloat(max.toFixed(1));
};

export const get1RMTable = (oneRm: number) => {
  if (oneRm <= 0) return [];
  const percentages = [
    { label: "100%", reps: "1", val: 1.0 },
    { label: "95%", reps: "2", val: 0.95 },
    { label: "90%", reps: "3-4", val: 0.90 },
    { label: "85%", reps: "5-6", val: 0.85 },
    { label: "80%", reps: "7-8", val: 0.80 },
    { label: "75%", reps: "9-11", val: 0.75 },
    { label: "70%", reps: "12-14", val: 0.70 },
    { label: "65%", reps: "15-18", val: 0.65 },
    { label: "60%", reps: "19-23", val: 0.60 }
  ];
  return percentages.map(p => ({
    ...p,
    weight: parseFloat((oneRm * p.val).toFixed(1))
  }));
};

export const getFCMax = (idade: number, formula: "tanaka" | "haskell") => {
  if (idade <= 0) return 0;
  return formula === "tanaka" ? Math.round(208 - (0.7 * idade)) : Math.round(220 - idade);
};

export const getFCZonas = (fcMax: number, fcRepouso: number) => {
  if (fcMax <= 0 || fcRepouso <= 0) return [];
  const fcr = fcMax - fcRepouso;
  const zones = [
    { label: "Zona 1 (50-60%)", desc: "Recuperação ativa", minPct: 0.50, maxPct: 0.60 },
    { label: "Zona 2 (60-70%)", desc: "Base aeróbia", minPct: 0.60, maxPct: 0.70 },
    { label: "Zona 3 (70-80%)", desc: "Aeróbio intenso", minPct: 0.70, maxPct: 0.80 },
    { label: "Zona 4 (80-90%)", desc: "Anaeróbio", minPct: 0.80, maxPct: 0.90 },
    { label: "Zona 5 (90-100%)", desc: "VO₂ máx", minPct: 0.90, maxPct: 1.00 }
  ];
  return zones.map(z => ({
    ...z,
    minBpm: Math.round((fcr * z.minPct) + fcRepouso),
    maxBpm: Math.round((fcr * z.maxPct) + fcRepouso)
  }));
};

export const getVolumeTotal = (carga: number, reps: number, series: number) => {
  return carga * reps * series;
};

export const getVolumeSemanalClassification = (seriesSemanais: number) => {
  if (seriesSemanais < 8) return { text: "Abaixo da recomendação", color: "text-amber-400" };
  if (seriesSemanais <= 12) return { text: "Iniciante (8-12 séries)", color: "text-emerald-400" };
  if (seriesSemanais <= 18) return { text: "Intermediário (12-18 séries)", color: "text-cyan-400" };
  if (seriesSemanais <= 25) return { text: "Avançado (18-25 séries)", color: "text-[#ccff00]" };
  return { text: "Elite (25+ séries)", color: "text-purple-400" };
};

export interface PhysicalEvaluation {
  id: string;
  userId: string;
  date: string; // MM/YYYY
  timestamp: number;
  gender?: string;
  fotoFrente?: string;
  fotoLado?: string;
  fotoCostas?: string;
  analiseIA?: string;
  protocolo: string; // e.g. "Análise de Composição por IA"
  isRascunho?: boolean; // If evaluation is incomplete draft
  dobras: DobrasData;
  perimetros?: PerimetrosData;

  // Anamnese fields
  anamnese_doencas_cronicas?: string;
  anamnese_historico_lesoes?: string;
  anamnese_usa_medicacao?: boolean;
  anamnese_medicacao_nome?: string;
  anamnese_medicacao_dosagem?: string;
  anamnese_medicacao_medico?: string;
  anamnese_cirurgias?: string;
  anamnese_alergias?: string;
  anamnese_observacoes?: string;
  resultados: {
    percentualGordura: number;
    percentualMassaMuscular: number;
    massaGorda: number;
    massaMagra: number;
    imc: number;
    tmb: number;
    get: number;
    peso: number;
    somatotipo?: string;
    distribuicaoGordura?: string;
    definicaoMuscular?: string;
    regioesAcumulo?: string;
    mudancasComposicao?: string;
  };
  observacoesManual?: string;

  // Real-time calculation preferences and results
  protocoloDobras?: string;
  conversaoDc?: string;
  formulaTmb?: string;
  formulaPesoIdeal?: string;
  formula1rm?: string;
  fatorAtividade?: number;
  fcMaxFormula?: string;
  fcRepouso?: number;
  carga1rm?: number;
  repeticoes1rm?: number;
  cargaVolume?: number;
  repeticoesVolume?: number;
  seriesVolume?: number;
  seriesSemanaisVolume?: number;
  superficieCorporal?: number;
  pesoIdeal?: number;
  rcq?: number;
  rce?: number;

  // Cardiac risk
  risco_cardiaco_pontuacao?: number;
  risco_cardiaco_classificacao?: string;
  risco_cardiaco_respostas?: RiscoCardiacoResponse;

  // Activity index
  indice_atividade_intensidade?: number;
  indice_atividade_duracao?: number;
  indice_atividade_frequencia?: number;
  indice_atividade_escore_final?: number;
  indice_atividade_classificacao?: string;

  // Sleep
  sono_pontuacao?: number;
  sono_classificacao?: string;
  sono_respostas?: Record<string, boolean>;

  // Stress
  estresse_pontuacao?: number;
  estresse_classificacao?: string;
  estresse_respostas?: Record<string, number>;

  // Composition method configuration
  compositionMethod?: "dobras" | "bioimpedancia";
  bioBf?: string;
  bioMassaMagra?: string;
}

interface AvaliacaoCorporalProps {
  currentStudent: Student;
  students: Student[];
  onSelectStudent: (studentId: string) => void;
  onUpdateStudentBF: (studentId: string, bf: number, weight?: number, height?: number, date?: string) => void;
  onSaveAndAdvance?: () => void;
  isFormMode?: boolean;
  onSetIsFormMode?: (mode: boolean) => void;
  triggerResetCount?: number;
}

export default function AvaliacaoCorporal({
  currentStudent,
  students = [],
  onSelectStudent,
  onUpdateStudentBF,
  onSaveAndAdvance,
  isFormMode: propIsFormMode,
  onSetIsFormMode: propOnSetIsFormMode,
  triggerResetCount
}: AvaliacaoCorporalProps) {
  
  // App view modes
  const [localIsFormMode, setLocalIsFormMode] = useState(false);
  const isFormMode = propIsFormMode !== undefined ? propIsFormMode : localIsFormMode;
  const setIsFormMode = propOnSetIsFormMode || setLocalIsFormMode;
  const [activeFormTab, setActiveFormTab] = useState<"anamnese" | "antropometria" | "ia" | "cardio" | "atividade" | "sono" | "estresse">("anamnese");
  const [activeHistoryTab, setActiveHistoryTab] = useState<"anamnese" | "antropometria" | "ia" | "cardio" | "atividade" | "sono" | "estresse">("anamnese");

  useEffect(() => {
    if (triggerResetCount && triggerResetCount > 0) {
      resetFormStates();
    }
  }, [triggerResetCount]);

  // Past evaluations for selected student
  const [evaluations, setEvaluations] = useState<PhysicalEvaluation[]>([]);
  const [selectedPastEvalId, setSelectedPastEvalId] = useState<string>("");

  // Anamnese Form State
  const [anamneseDoencas, setAnamneseDoencas] = useState("");
  const [anamneseLesoes, setAnamneseLesoes] = useState("");
  const [anamneseUsaMedicacao, setAnamneseUsaMedicacao] = useState<boolean | null>(null);
  const [anamneseMedicacaoNome, setAnamneseMedicacaoNome] = useState("");
  const [anamneseMedicacaoDosagem, setAnamneseMedicacaoDosagem] = useState("");
  const [anamneseMedicacaoMedico, setAnamneseMedicacaoMedico] = useState("");
  const [anamneseCirurgias, setAnamneseCirurgias] = useState("");
  const [anamneseAlergias, setAnamneseAlergias] = useState("");
  const [anamneseObservacoes, setAnamneseObservacoes] = useState("");

  // Form State
  const [formMonth, setFormMonth] = useState("");
  const [formPeso, setFormPeso] = useState<number>(currentStudent?.weight || 70);
  const [formAltura, setFormAltura] = useState<number>(() => {
    const rawH = currentStudent?.height || 175;
    return rawH < 3 ? Math.round(rawH * 100) : rawH;
  });
  const [formIdade, setFormIdade] = useState<number>(currentStudent?.age || 26);
  const [formGenero, setFormGenero] = useState<"masculino" | "feminino">("masculino");
  
  const [dobras, setDobras] = useState<DobrasData>({});
  const [perimetros, setPerimetros] = useState<PerimetrosData>({});
  const [cardioAnswers, setCardioAnswers] = useState<RiscoCardiacoResponse>({
    idade: 0, sexo: 0, peso: 0, atividade: 0, tabagismo: 0, pressao: 0, historico: 0, colesterol: 0, diabetes: 0
  });
  const [activityAnswers, setActivityAnswers] = useState<IndiceAtividadeResponse>({
    intensidade: 1, duracao: 1, frequencia: 1
  });
  const [sleepAnswers, setSleepAnswers] = useState<Record<string, boolean>>({});
  const [stressAnswers, setStressAnswers] = useState<Record<string, number>>({});
  const [observacoesManual, setObservacoesManual] = useState("");

  // Real-time calculation controls and preferences states
  const [antropometriaSubTab, setAntropometriaSubTab] = useState<"medidas" | "composicao" | "metabolismo" | "performance">("medidas");
  const [protocoloDobras, setProtocoloDobras] = useState<"jp3" | "jp7" | "durnin" | "faulkner" | "guedes">("jp3");
  const [conversaoDc, setConversaoDc] = useState<"siri" | "brozek">("siri");
  const [formulaTmb, setFormulaTmb] = useState<"harris" | "mifflin">("mifflin");
  const [formulaPesoIdeal, setFormulaPesoIdeal] = useState<"lorenz" | "broca" | "devine">("lorenz");
  const [formula1rm, setFormula1rm] = useState<"brzycki" | "epley" | "baechle">("brzycki");
  const [fatorAtividade, setFatorAtividade] = useState<number>(1.55);
  const [fcMaxFormula, setFcMaxFormula] = useState<"tanaka" | "haskell">("tanaka");
  const [fcRepouso, setFcRepouso] = useState<number>(60);
  const [carga1rm, setCarga1rm] = useState<number>(80);
  const [repeticoes1rm, setRepeticoes1rm] = useState<number>(8);
  const [cargaVolume, setCargaVolume] = useState<number>(60);
  const [repeticoesVolume, setRepeticoesVolume] = useState<number>(10);
  const [seriesVolume, setSeriesVolume] = useState<number>(4);
  const [seriesSemanaisVolume, setSeriesSemanaisVolume] = useState<number>(16);

  // Photos & Scanning state (Composição corporal por IA)
  const [photoFront, setPhotoFront] = useState<string | null>(null);
  const [photoSide, setPhotoSide] = useState<string | null>(null);
  const [photoBack, setPhotoBack] = useState<string | null>(null);
  const [isDraggingFront, setIsDraggingFront] = useState(false);
  const [isDraggingSide, setIsDraggingSide] = useState(false);
  const [isDraggingBack, setIsDraggingBack] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMessageIndex, setScanMessageIndex] = useState(0);
  const scanMessages = [
    "Analisando composição corporal...",
    "Mapeando distribuição de gordura...",
    "Detectando padrões corporais...",
    "Processando dados...",
    "Gerando análise inteligente..."
  ];
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [laudoText, setLaudoText] = useState<string | null>(null);

  // Method selected for Body Composition
  const [compositionMethod, setCompositionMethod] = useState<"dobras" | "bioimpedancia">("dobras");
  const [bioBf, setBioBf] = useState<string>("");
  const [bioMassaMagra, setBioMassaMagra] = useState<string>("");

  // Camera states
  const [activeCameraView, setActiveCameraView] = useState<"front" | "side" | "back" | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Delete modal states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<string | null>(null);

  // Unanswered validations warnings
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationBanner, setShowValidationBanner] = useState(false);

  // Local state for interactive toasts/notifications (replacing buggy browser alert() in iframe sandbox)
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "warning";
    title?: string;
  } | null>(null);

  const showNotification = (message: string, type: "success" | "info" | "warning" = "info", title?: string) => {
    setToast({ message, type, title });
    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setToast(prev => prev && prev.message === message ? null : prev);
    }, 6000);
  };

  // Active method's BF and Massa Magra
  const getSelectedComposition = () => {
    if (compositionMethod === "dobras") {
      const realTimeBfData = getPercentualGorduraDobras(dobras, formIdade, formGenero, protocoloDobras, conversaoDc);
      const resAntro = calcularAntropometria({
        sexo: formGenero,
        idade: formIdade,
        peso: formPeso,
        altura: formAltura,
        dobras,
        perimetros
      });
      const bf = realTimeBfData.valid ? realTimeBfData.bf : resAntro.percentualGordura;
      const mg = parseFloat((formPeso * (bf / 100)).toFixed(1));
      const mm = parseFloat((formPeso - mg).toFixed(1));
      return {
        bf,
        massaMagra: mm,
        massaGorda: mg,
        methodLabel: `Dobras Cutâneas (${protocoloDobras.toUpperCase()})`
      };
    } else {
      const bf = parseFloat(bioBf) || 15.0;
      const mm = parseFloat(bioMassaMagra) || parseFloat((formPeso * (1 - bf / 100)).toFixed(1));
      const mg = parseFloat((formPeso - mm).toFixed(1));
      return {
        bf,
        massaMagra: mm,
        massaGorda: mg,
        methodLabel: "Bioimpedância"
      };
    }
  };

  // Consulting configuration states
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [consultingConfig, setConsultingConfig] = useState({
    logoText: "TREINOPRO",
    slogan: "PLATAFORMA INTELIGENTE DE PERFORMANCE",
    companyName: "ACADEMIA TREINOPRO LTDA",
    address: "Av. Paulista, 1000 - Bela Vista - Sao Paulo / SP",
    phone: "(11) 98888-7777",
    email: "suporte@treinopro.com.br",
    website: "www.treinopro.com.br",
    qrLink: typeof window !== "undefined" ? (window.location.origin + "/?role=aluno") : "treinopro.com.br/aluno",
    evaluatorName: "Prof. Gustavo Workout",
    evaluatorCref: "054112-G/SP",
    shortName: "",
    themeId: "blue"
  });

  // Load consulting configuration on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem("treinopro_consultoria_config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConsultingConfig(prev => ({
          logoText: parsed.logoText || "TREINOPRO",
          slogan: parsed.slogan || "PLATAFORMA INTELIGENTE DE PERFORMANCE",
          companyName: parsed.companyName || "ACADEMIA TREINOPRO LTDA",
          address: parsed.address !== undefined ? parsed.address : "Av. Paulista, 1000 - Bela Vista - Sao Paulo / SP",
          phone: parsed.phone || "(11) 98888-7777",
          email: parsed.email || "suporte@treinopro.com.br",
          website: parsed.website !== undefined ? parsed.website : "www.treinopro.com.br",
          qrLink: parsed.qrLink && parsed.qrLink !== "treinopro.com.br/aluno" ? parsed.qrLink : (typeof window !== "undefined" ? (window.location.origin + "/?role=aluno") : "treinopro.com.br/aluno"),
          evaluatorName: parsed.evaluatorName || "Prof. Gustavo Workout",
          evaluatorCref: parsed.evaluatorCref || "054112-G/SP",
          shortName: parsed.shortName || "",
          themeId: parsed.themeId || "blue"
        }));
      }
    } catch (e) {
      console.error("Erro ao carregar configuracoes da consultoria:", e);
    }
  }, []);

  // Set default evaluation month & gender on mount / student change
  useEffect(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    setFormMonth(`${mm}/${yyyy}`);
    
    if (currentStudent) {
      const isMasc = currentStudent.gender ? (currentStudent.gender === "masculino") : (!currentStudent.name.trim().toLowerCase().endsWith("a"));
      setFormGenero(isMasc ? "masculino" : "feminino");
      setFormPeso(currentStudent.weight || 70);
      const rawH = currentStudent.height || 175;
      setFormAltura(rawH < 3 ? Math.round(rawH * 100) : rawH);
      setFormIdade(currentStudent.age || 26);
    }
  }, [currentStudent]);

  // Load evaluations list on student change
  useEffect(() => {
    if (currentStudent) {
      const saved = localStorage.getItem(`coach_physical_evaluations_${currentStudent.id}`);
      if (saved) {
        const parsed: PhysicalEvaluation[] = JSON.parse(saved);
        setEvaluations(parsed);
        if (parsed.length > 0) {
          setSelectedPastEvalId(parsed[0].id);
        } else {
          setSelectedPastEvalId("");
        }
      } else {
        const seeded = getSeededEvaluations(currentStudent);
        localStorage.setItem(`coach_physical_evaluations_${currentStudent.id}`, JSON.stringify(seeded));
        setEvaluations(seeded);
        if (seeded.length > 0) {
          setSelectedPastEvalId(seeded[0].id);
        }
        // Sync with Firestore
        import("../../../../shared/infrastructure/sync/SyncManager").then(({ SyncManager }) => {
          SyncManager.getInstance().sync();
        }).catch(err => console.error("Error triggering sync on seed:", err));
      }
      
      // Exit form mode
      setIsFormMode(false);
      resetFormStates();
    }
  }, [currentStudent]);

  // Sync camera message cycling when scanning
  useEffect(() => {
    let interval: any;
    if (scanning) {
      setScanMessageIndex(0);
      interval = setInterval(() => {
        setScanMessageIndex(prev => (prev + 1) % scanMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [scanning]);

  // Reset form inputs for a new clean draft
  const resetFormStates = () => {
    setDobras({});
    setPerimetros({});
    setCardioAnswers({
      idade: 0, sexo: 0, peso: 0, atividade: 0, tabagismo: 0, pressao: 0, historico: 0, colesterol: 0, diabetes: 0
    });
    setActivityAnswers({ intensidade: 1, duracao: 1, frequencia: 1 });
    setSleepAnswers({});
    setStressAnswers({});
    setObservacoesManual("");
    setAnamneseDoencas("");
    setAnamneseLesoes("");
    setAnamneseUsaMedicacao(null);
    setAnamneseMedicacaoNome("");
    setAnamneseMedicacaoDosagem("");
    setAnamneseMedicacaoMedico("");
    setAnamneseCirurgias("");
    setAnamneseAlergias("");
    setAnamneseObservacoes("");
    setPhotoFront(null);
    setPhotoSide(null);
    setPhotoBack(null);
    setScanResult(null);
    setLaudoText(null);
    setCompositionMethod("dobras");
    setBioBf("");
    setBioMassaMagra("");
    setValidationErrors([]);
    setShowValidationBanner(false);
  };

  // Seed default evaluations for rich analytics display
  function getSeededEvaluations(student: Student): PhysicalEvaluation[] {
    const isMasc = !student.name.trim().toLowerCase().endsWith("a");
    const initialBf = isMasc ? 14.5 : 22.5;
    const initialWeight = student.weight || 72;
    const initialHeight = student.height || 175;
    
    return [
      {
        id: "eval-seeded-3",
        userId: student.id,
        date: "06/2026",
        timestamp: Date.now(),
        protocolo: "Análise de Composição por IA",
        isRascunho: false,
        anamnese_doencas_cronicas: "Nenhuma crônica. Histórico de asma na infância, hoje 100% controlada.",
        anamnese_historico_lesoes: "Leve encurtamento de posterior esquerdo, sob controle com alongamentos diários.",
        anamnese_usa_medicacao: false,
        anamnese_cirurgias: "Apendicectomia em 2015",
        anamnese_alergias: "Nenhuma conhecida",
        anamnese_observacoes: "Aluno refere desconforto esporádico no joelho se correr mais de 5km.",
        dobras: { peitoral: 11, abdomen: 17, coxa: 14 },
        perimetros: {
          pescoco: 37, ombros: 114, torax: 98, cintura: 80, abdomen: 84, quadril: 96,
          bracoD: 34, bracoE: 33.5, antebracoD: 28, antebracoE: 27.5,
          coxaD: 55, coxaE: 54.5, panturrilhaD: 37, panturrilhaE: 37
        },
        resultados: {
          peso: initialWeight,
          percentualGordura: initialBf,
          percentualMassaMuscular: isMasc ? 44.5 : 34.0,
          massaGorda: parseFloat((initialWeight * (initialBf / 100)).toFixed(1)),
          massaMagra: parseFloat((initialWeight * (1 - initialBf / 100)).toFixed(1)),
          imc: parseFloat((initialWeight / Math.pow(initialHeight / 100, 2)).toFixed(1)),
          tmb: isMasc ? Math.round(10 * initialWeight + 6.25 * initialHeight - 5 * 26 + 5) : Math.round(10 * initialWeight + 6.25 * initialHeight - 5 * 26 - 161),
          get: isMasc ? Math.round((10 * initialWeight + 6.25 * initialHeight - 5 * 26 + 5) * 1.55) : Math.round((10 * initialWeight + 6.25 * initialHeight - 5 * 26 - 161) * 1.55),
          somatotipo: "Mesomorfo",
          distribuicaoGordura: isMasc ? "Androide" : "Ginoide",
          definicaoMuscular: "Alta",
          regioesAcumulo: isMasc ? "Leve acúmulo na região infraumbilical." : "Acúmulo localizado nos quadris e coxas.",
          mudancasComposicao: "Aumento de densidade de deltoides e peitoral superior com preservação de gordura controlada."
        },
        fotoFrente: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
        fotoLado: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&q=80&w=400",
        fotoCostas: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400",
        analiseIA: `**LAUDO DE COMPOSIÇÃO CORPORAL POR IA**
**Atleta:** ${student.name} | **Gênero:** ${isMasc ? 'Masculino' : 'Feminino'} | **Biotipo:** Mesomorfo

• **Gordura Corporal (BF):** ${initialBf}% (Excelente nível de condicionamento)
• **Somatotipo:** Mesomorfo equilibrado
• **Regiões de acúmulo:** ${isMasc ? "Região infraumbilical leve" : "Regiões glútea e coxas"}`,
        
        risco_cardiaco_pontuacao: 14,
        risco_cardiaco_classificacao: "RISCO ABAIXO DA MÉDIA",
        risco_cardiaco_respostas: {
          idade: 2, sexo: isMasc ? 10 : 1, peso: 3, atividade: 3, tabagismo: 1, pressao: 1, historico: 1, colesterol: 1, diabetes: 1
        },
        indice_atividade_intensidade: 4,
        indice_atividade_duracao: 3,
        indice_atividade_frequencia: 4,
        indice_atividade_escore_final: 48,
        indice_atividade_classificacao: "Aceitável (poderia ser melhor)",

        sono_pontuacao: 15,
        sono_classificacao: "DÉBITO DE SONO LEVE",
        sono_respostas: {
          sono_1: false, sono_2: true, sono_3: false, sono_4: false, sono_5: true,
          sono_6: true, sono_7: false, sono_8: false, sono_9: false, sono_10: false,
          sono_11: true, sono_12: false, sono_13: false, sono_14: true, sono_15: false
        },

        estresse_pontuacao: 12,
        estresse_classificacao: "ESTRESSE MODERADO",
        estresse_respostas: {
          estresse_1: 1, estresse_2: 1, estresse_3: 1, estresse_4: 1, estresse_5: 0,
          estresse_6: 0, estresse_7: 2, estresse_8: 0, estresse_9: 0, estresse_10: 1,
          estresse_11: 1, estresse_12: 0, estresse_13: 1, estresse_14: 1, estresse_15: 1,
          estresse_16: 1, estresse_17: 0, estresse_18: 0, estresse_19: 0, estresse_20: 0,
          estresse_21: 1, estresse_22: 0, estresse_23: 0, estresse_24: 0, estresse_25: 0
        }
      }
    ];
  }

  // Find currently selected physical evaluation
  const activePastEval = useMemo(() => {
    return evaluations.find(e => e.id === selectedPastEvalId) || evaluations[0] || null;
  }, [evaluations, selectedPastEvalId]);

  // Camera integration
  const startCamera = async (view: "front" | "side" | "back") => {
    try {
      setActiveCameraView(view);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 640 } }
      });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err) {
      console.error("Camera access error:", err);
      showNotification("Não foi possível acessar a câmera. Use a opção de Upload de fotos.", "warning", "Erro de Câmera");
      setActiveCameraView(null);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setActiveCameraView(null);
  };

  const compressImage = (base64OrFile: string | File, maxWidth = 500, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(typeof base64OrFile === "string" ? base64OrFile : "");
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };

      img.onerror = (err) => {
        reject(err);
      };

      if (typeof base64OrFile === "string") {
        img.src = base64OrFile;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            img.src = e.target.result as string;
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(base64OrFile);
      }
    });
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const size = Math.min(video.videoWidth, video.videoHeight);
      const targetSize = Math.min(size, 500); // Max 500px for avatar/thumbnail sizes
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, targetSize, targetSize);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // Highly compressed JPEG
        if (activeCameraView === "front") setPhotoFront(dataUrl);
        else if (activeCameraView === "side") setPhotoSide(dataUrl);
        else if (activeCameraView === "back") setPhotoBack(dataUrl);
      }
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, view: "front" | "side" | "back") => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file)
        .then(compressedBase64 => {
          if (view === "front") setPhotoFront(compressedBase64);
          else if (view === "side") setPhotoSide(compressedBase64);
          else if (view === "back") setPhotoBack(compressedBase64);
        })
        .catch(err => {
          console.error("Error compressing file:", err);
          showNotification("Não foi possível processar o arquivo de imagem.", "warning", "Erro de Arquivo");
        });
    }
  };

  const handleLoadMockPhotos = () => {
    setPhotoFront("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400");
    setPhotoSide("https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&q=80&w=400");
    setPhotoBack("https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400");
  };

  // Run AI processing to extract composition metrics from photos
  const handleRunAiAnalysis = async () => {
    setScanning(true);
    setScanResult(null);
    setLaudoText(null);

    const activeComp = getSelectedComposition();

    try {
      const previousRecord = evaluations.length > 0 ? evaluations[0] : null;
      const previousAnalysis = previousRecord ? previousRecord.analiseIA : undefined;

      let aiProvider = "gemini";
      try {
        const savedSettings = localStorage.getItem("treinopro_settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.aiProvider) aiProvider = parsed.aiProvider;
        }
      } catch (e) {
        console.error(e);
      }

      const response = await fetch("/api/analyze-body", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontPhoto: photoFront,
          sidePhoto: photoSide,
          backPhoto: photoBack,
          previousAnalysis,
          studentName: currentStudent.name,
          gender: formGenero,
          age: formIdade,
          weight: formPeso,
          height: formAltura,
          aiProvider,
          mode: "composition",
          realBf: activeComp.bf,
          realMassaMagra: activeComp.massaMagra
        })
      });

      const data = await response.json();
      
      // Compute standard metabolic results locally as baselines
      let tmb = Math.round(10 * formPeso + 6.25 * formAltura - 5 * formIdade + (formGenero === "masculino" ? 5 : -161));
      let get = Math.round(tmb * 1.55);
      let imc = parseFloat((formPeso / Math.pow(formAltura / 100, 2)).toFixed(1));

      // Extract results from AI response (Respecting Option A: Unification Absoluta)
      const percentualGordura = activeComp.bf;
      const massaMagra = activeComp.massaMagra;
      const massaGorda = activeComp.massaGorda;

      const parsedResult = {
        percentualGordura,
        percentualMassaMuscular: formGenero === "masculino" ? 44 : 33, 
        massaGorda,
        massaMagra,
        imc,
        tmb,
        get,
        peso: formPeso,
        somatotipo: data.somatotype || "Mesomorfo",
        distribuicaoGordura: data.fatDistribution || (formGenero === "masculino" ? "Androide" : "Ginoide"),
        definicaoMuscular: data.muscleDefinition || "Moderada",
        regioesAcumulo: data.accumulationRegions || (formGenero === "masculino" ? "Região abdominal infraumbilical." : "Membros inferiores e quadris."),
        mudancasComposicao: data.mudancasComposicao || "Redução progressiva da gordura subcutânea e maior evidência de feixes musculares superior."
      };

      setScanResult(parsedResult);
      setLaudoText(data.analysis || "Laudo gerado offline com sucesso.");
    } catch (err: any) {
      console.error(err);
      // Fallback local mock analysis based on real metrics
      const percentualGordura = activeComp.bf;
      const massaMagra = activeComp.massaMagra;
      const massaGorda = activeComp.massaGorda;
      const imc = parseFloat((formPeso / Math.pow(formAltura / 100, 2)).toFixed(1));
      const tmb = Math.round(10 * formPeso + 6.25 * formAltura - 5 * formIdade + (formGenero === "masculino" ? 5 : -161));
      const get = Math.round(tmb * 1.55);

      const bmi = imc;
      const somatotipo = bmi > 25 ? "Endomorfo" : (bmi < 21 ? "Ectomorfo" : "Mesomorfo");
      const fatDistribution = formGenero === "masculino" ? "Androide" : "Ginoide";

      setScanResult({
        percentualGordura,
        percentualMassaMuscular: formGenero === "masculino" ? 44 : 33,
        massaGorda,
        massaMagra,
        imc,
        tmb,
        get,
        peso: formPeso,
        somatotipo,
        distribuicaoGordura: fatDistribution,
        definicaoMuscular: "Moderada",
        regioesAcumulo: formGenero === "masculino" ? "Região abdominal infraumbilical." : "Membros inferiores e quadris.",
        mudancasComposicao: "Preservação muscular linear e redução de gordura subcutânea."
      });
      setLaudoText(`### LAUDO DE COMPOSIÇÃO CLÍNICO-INTERPRETATIVO
Atleta: ${currentStudent.name} | Gênero: ${formGenero === 'masculino' ? 'Masculino' : 'Feminino'} | Idade: ${formIdade} anos
Peso: ${formPeso} kg | Altura: ${formAltura} cm | IMC: ${imc} kg/m²

---

1. COMPOSIÇÃO CORPORAL E DISTRIBUIÇÃO DE GORDURA
   • Percentual de Gordura Real (BF): ${percentualGordura}%
   • Massa Magra Real: ${massaMagra} kg
   • Massa Gorda Real: ${massaGorda} kg
   • Distribuição Predominante: ${fatDistribution === 'Androide' ? 'Androide (Tronco e Abdômen)' : 'Ginoide (Quadril e Membros Inferiores)'}
   • Regiões com maior acúmulo: ${formGenero === "masculino" ? "Região abdominal infraumbilical e flancos." : "Membros inferiores, quadril e coxas."}

2. ESTIMATIVA DO SOMATOTIPO (BIOTIPO)
   • Tipo Estimado: ${somatotipo}
   • Justificativa: Estrutura morfológica compatível com o somatotipo ${somatotipo === 'Ectomorfo' ? 'longilíneo' : (somatotipo === 'Endomorfo' ? 'brevilíneo' : 'mediolíneo')} e IMC de ${imc} kg/m².

3. RECOMENDAÇÕES PRÁTICAS & METAS
   • Treinamento: Foco em sobrecarga progressiva de cargas para hipertrofia e desenvolvimento/manutenção da massa muscular contrátil.
   • Nutrição: Adequação calórica com aporte de proteínas de 1.8g a 2.0g/kg de peso corporal, visando a melhoria da composição corporal.`);
    } finally {
      setScanning(false);
    }
  };

  // Run form validation for a COMPLETE evaluation
  const runFormValidation = () => {
    const errors: string[] = [];

    // 1. Check if cardiac risk answers are completed (9 questions, i.e. keys have values > 0)
    const unansweredCardio = RISCO_CARDIAC_QUESTIONS.filter(q => !cardioAnswers[q.id as keyof RiscoCardiacoResponse]);
    if (unansweredCardio.length > 0) {
      errors.push("Risco Cardíaco: Todas as 9 perguntas devem ser respondidas.");
    }

    // 2. Check if physical activity selects are made
    if (!activityAnswers.intensidade || !activityAnswers.duracao || !activityAnswers.frequencia) {
      errors.push("Índice Atividade: Responda todas as 3 seleções de frequência/duração/intensidade.");
    }

    // 3. Sleep questions (15 questions)
    const answeredSleepCount = SONO_QUESTIONS.filter(q => sleepAnswers[q.id] !== undefined).length;
    if (answeredSleepCount < 15) {
      errors.push(`Questionário de Sono: Responda as ${15 - answeredSleepCount} perguntas pendentes.`);
    }

    // 4. Stress questions (25 questions)
    const answeredStressCount = ESTRESSE_QUESTIONS.filter(q => stressAnswers[q.id] !== undefined).length;
    if (answeredStressCount < 25) {
      errors.push(`Questionário de Estresse: Responda as ${25 - answeredStressCount} perguntas pendentes.`);
    }

    // 5. Anamnese validation (pelo menos um dos campos deve ser preenchido)
    const isAnamneseFilled = 
      anamneseDoencas.trim().length > 0 ||
      anamneseLesoes.trim().length > 0 ||
      anamneseCirurgias.trim().length > 0 ||
      anamneseAlergias.trim().length > 0 ||
      anamneseObservacoes.trim().length > 0 ||
      anamneseUsaMedicacao !== null;
    if (!isAnamneseFilled) {
      errors.push("Anamnese: Preencha pelo menos um campo da Anamnese.");
    }

    return errors;
  };

  // Run form validation for metric ranges
  const runMetricValidation = (isDraft = false) => {
    const errors: string[] = [];

    // 1. Weight validation
    if (formPeso < 20 || formPeso > 300) {
      errors.push(`Peso Corporal: O peso de ${formPeso} kg está fora da faixa aceitável (20 a 300 kg).`);
    }

    // 2. Height validation
    if (formAltura < 100 || formAltura > 230) {
      errors.push(`Estatura / Altura: A estatura de ${formAltura} cm está fora da faixa aceitável (100 a 230 cm).`);
    }

    // 3. Dobras cutâneas validation
    Object.entries(dobras).forEach(([key, val]) => {
      const numVal = val as number | undefined | null;
      if (numVal !== undefined && numVal !== null && numVal > 0 && (numVal < 2 || numVal > 80)) {
        errors.push(`Dobra Cutânea (${key.toUpperCase()}): O valor de ${numVal} mm está fora da faixa aceitável (2 a 80 mm).`);
      }
    });

    // 4. Perímetros validation
    if (perimetros.torax !== undefined && perimetros.torax !== null && perimetros.torax > 0) {
      if (perimetros.torax < 70 || perimetros.torax > 140) {
        errors.push(`Perímetro do Tórax (Peitoral): O valor de ${perimetros.torax} cm está fora da faixa aceitável (70 a 140 cm).`);
      }
    }
    if (perimetros.cintura !== undefined && perimetros.cintura !== null && perimetros.cintura > 0) {
      if (perimetros.cintura < 55 || perimetros.cintura > 150) {
        errors.push(`Perímetro da Cintura: O valor de ${perimetros.cintura} cm está fora da faixa aceitável (55 a 150 cm).`);
      }
    }
    if (perimetros.quadril !== undefined && perimetros.quadril !== null && perimetros.quadril > 0) {
      if (perimetros.quadril < 70 || perimetros.quadril > 150) {
        errors.push(`Perímetro do Quadril: O valor de ${perimetros.quadril} cm está fora da faixa aceitável (70 a 150 cm).`);
      }
    }
    
    const bracos = [
      { name: "Braço Direito", id: "bracoD", val: perimetros.bracoD },
      { name: "Braço Esquerdo", id: "bracoE", val: perimetros.bracoE }
    ];
    bracos.forEach(b => {
      if (b.val !== undefined && b.val !== null && b.val > 0) {
        if (b.val < 20 || b.val > 50) {
          errors.push(`Perímetro do ${b.name}: O valor de ${b.val} cm está fora da faixa aceitável (20 a 50 cm).`);
        }
      }
    });

    const coxas = [
      { name: "Coxa Direita", id: "coxaD", val: perimetros.coxaD },
      { name: "Coxa Esquerda", id: "coxaE", val: perimetros.coxaE }
    ];
    coxas.forEach(c => {
      if (c.val !== undefined && c.val !== null && c.val > 0) {
        if (c.val < 40 || c.val > 80) {
          errors.push(`Perímetro da ${c.name}: O valor de ${c.val} cm está fora da faixa aceitável (40 a 80 cm).`);
        }
      }
    });

    const panturrilhas = [
      { name: "Panturrilha Direita", id: "panturrilhaD", val: perimetros.panturrilhaD },
      { name: "Panturrilha Esquerda", id: "panturrilhaE", val: perimetros.panturrilhaE }
    ];
    panturrilhas.forEach(p => {
      if (p.val !== undefined && p.val !== null && p.val > 0) {
        if (p.val < 25 || p.val > 50) {
          errors.push(`Perímetro da ${p.name}: O valor de ${p.val} cm está fora da faixa aceitável (25 a 50 cm).`);
        }
      }
    });

    Object.entries(perimetros).forEach(([key, val]) => {
      const numVal = val as number | undefined | null;
      if (numVal !== undefined && numVal !== null && numVal > 0) {
        if (["torax", "cintura", "quadril", "bracoD", "bracoE", "coxaD", "coxaE", "panturrilhaD", "panturrilhaE"].includes(key)) {
          return;
        }
        if (numVal < 20 || numVal > 250) {
          errors.push(`Perímetro (${key.toUpperCase()}): O valor de ${numVal} cm está fora da faixa aceitável (20 a 250 cm).`);
        }
      }
    });

    // 5. RCQ validation
    if (perimetros.cintura && perimetros.quadril && perimetros.cintura > 0 && perimetros.quadril > 0) {
      const rcqVal = perimetros.cintura / perimetros.quadril;
      if (rcqVal < 0.65 || rcqVal > 1.20) {
        errors.push(`Relação Cintura-Quadril (RCQ): O valor de ${rcqVal.toFixed(2)} está fora da faixa aceitável (0,65 a 1,20).`);
      }
    }

    // 6. RCE validation
    if (perimetros.cintura && formAltura && perimetros.cintura > 0 && formAltura > 0) {
      const rceVal = perimetros.cintura / formAltura;
      if (rceVal < 0.35 || rceVal > 0.70) {
        errors.push(`Relação Cintura-Estatura (RCE): O valor de ${rceVal.toFixed(2)} está fora da faixa aceitável (0,35 a 0,70).`);
      }
    }

    // 7. % Gordura validation
    if (!isDraft) {
      const activeComp = getSelectedComposition();
      let compBf = scanResult?.percentualGordura;
      if (compBf === undefined) {
        compBf = activeComp.bf;
      }
      if (compBf > 0) {
        if (compBf < 3 || compBf > 60) {
          errors.push(`Percentual de Gordura (% BF): O valor de ${compBf.toFixed(1)}% está fora da faixa aceitável (3% a 60%).`);
        }
      } else {
        errors.push(`Percentual de Gordura (% BF): O percentual de gordura deve ser preenchido para homologar a avaliação.`);
      }
    }

    return errors;
  };

  // Persist assessment (supports complete or draft)
  const saveAssessment = (isDraft: boolean, keepFormOpen = false): boolean => {
    // Metric range validation is MANDATORY for all saves (drafts and complete)
    const metricErrors = runMetricValidation(isDraft);
    if (metricErrors.length > 0) {
      setValidationErrors(metricErrors);
      setShowValidationBanner(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        document.getElementById("avaliacao-fisica-section")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return false;
    }

    if (!isDraft) {
      const errors = runFormValidation();
      if (errors.length > 0) {
        setValidationErrors(errors);
        setShowValidationBanner(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          document.getElementById("avaliacao-fisica-section")?.scrollIntoView({ behavior: "smooth" });
        }, 50);
        return false;
      }
    }

    // Prepare scores
    const cardiacScore: number = Object.values(cardioAnswers).reduce((acc: number, val) => acc + (val as number || 0), 0) as number;
    const cardiacClass = getRiscoCardiacoClassification(cardiacScore).text;

    const activityScore = activityAnswers.intensidade * activityAnswers.duracao * activityAnswers.frequencia;
    const activityClass = getIndiceAtividadeClassification(activityScore).categoria;

    const sleepSimCount = Object.keys(sleepAnswers).filter(key => key.startsWith("sono_") && sleepAnswers[key] === true).length;
    const sleepScore = sleepSimCount * 3;
    const sleepClass = getSonoClassification(sleepScore).text;

    const stressScore = Object.keys(stressAnswers).filter(key => key.startsWith("estresse_")).reduce((acc: number, key) => acc + (stressAnswers[key] as number || 0), 0) as number;
    const stressClass = getEstresseClassification(stressScore).text;

    // Compile composition stats (using bodyComposition helper and selected formulas)
    const activeComp = getSelectedComposition();
    const bodyComp = calcularAntropometria({
      sexo: formGenero,
      idade: formIdade,
      peso: formPeso,
      altura: formAltura,
      dobras,
      perimetros
    });

    let compBf = scanResult?.percentualGordura;
    if (compBf === undefined) {
      compBf = activeComp.bf;
    }

    const calculatedMg = scanResult ? parseFloat((formPeso * (compBf / 100)).toFixed(1)) : activeComp.massaGorda;
    const calculatedMm = scanResult ? parseFloat((formPeso - calculatedMg).toFixed(1)) : activeComp.massaMagra;
    const calculatedImc = scanResult?.imc || bodyComp.imc;
    const calculatedTmb = getTMB(formPeso, formAltura, formIdade, formGenero, formulaTmb) || bodyComp.tmb;
    const calculatedGet = Math.round(calculatedTmb * fatorAtividade);

    const rcqResult = getRCQ(perimetros.cintura, perimetros.quadril, formGenero);
    const rceResult = getRCE(perimetros.cintura, formAltura);
    const calculatedPesoIdeal = getPesoIdeal(formAltura, formGenero, formulaPesoIdeal);
    const calculatedSc = getSuperficieCorporal(formPeso, formAltura);

    const resultadosComposicao = scanResult || {
      peso: formPeso,
      percentualGordura: compBf,
      percentualMassaMuscular: formGenero === "masculino" ? 44.5 : 34.0,
      massaGorda: calculatedMg,
      massaMagra: calculatedMm,
      imc: calculatedImc,
      tmb: calculatedTmb,
      get: calculatedGet,
      somatotipo: "Mesomorfo",
      distribuicaoGordura: formGenero === "masculino" ? "Androide" : "Ginoide",
      definicaoMuscular: "Moderada",
      regioesAcumulo: formGenero === "masculino" ? "Região infraumbilical." : "Quadril e coxas."
    };

    const newRecord: PhysicalEvaluation = {
      id: "eval-" + Date.now(),
      userId: currentStudent.id,
      date: formMonth || new Date().toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" }),
      timestamp: Date.now(),
      isRascunho: isDraft,
      dobras,
      perimetros,
      resultados: resultadosComposicao,
      fotoFrente: photoFront || undefined,
      fotoLado: photoSide || undefined,
      fotoCostas: photoBack || undefined,
      analiseIA: laudoText || undefined,
      observacoesManual: observacoesManual || undefined,
      protocolo: compositionMethod === "bioimpedancia"
        ? "Exame de Bioimpedância"
        : (scanResult ? "Análise de Composição por IA" : `Antropometria de Campo (${protocoloDobras.toUpperCase()})`),
      compositionMethod,
      bioBf,
      bioMassaMagra,

      // Real-time calculations preferences & results
      protocoloDobras,
      conversaoDc,
      formulaTmb,
      formulaPesoIdeal,
      formula1rm,
      fatorAtividade,
      fcMaxFormula,
      fcRepouso,
      carga1rm,
      repeticoes1rm,
      cargaVolume,
      repeticoesVolume,
      seriesVolume,
      seriesSemanaisVolume,
      superficieCorporal: calculatedSc,
      pesoIdeal: calculatedPesoIdeal,
      rcq: rcqResult.rcq || undefined,
      rce: rceResult.rce || undefined,

      // Anamnese fields
      anamnese_doencas_cronicas: anamneseDoencas || undefined,
      anamnese_historico_lesoes: anamneseLesoes || undefined,
      anamnese_usa_medicacao: anamneseUsaMedicacao !== null ? anamneseUsaMedicacao : undefined,
      anamnese_medicacao_nome: anamneseMedicacaoNome || undefined,
      anamnese_medicacao_dosagem: anamneseMedicacaoDosagem || undefined,
      anamnese_medicacao_medico: anamneseMedicacaoMedico || undefined,
      anamnese_cirurgias: anamneseCirurgias || undefined,
      anamnese_alergias: anamneseAlergias || undefined,
      anamnese_observacoes: anamneseObservacoes || undefined,

      risco_cardiaco_pontuacao: cardiacScore,
      risco_cardiaco_classificacao: cardiacClass,
      risco_cardiaco_respostas: cardioAnswers,

      indice_atividade_intensidade: activityAnswers.intensidade,
      indice_atividade_duracao: activityAnswers.duracao,
      indice_atividade_frequencia: activityAnswers.frequencia,
      indice_atividade_escore_final: activityScore,
      indice_atividade_classificacao: activityClass,

      sono_pontuacao: sleepScore,
      sono_classificacao: sleepClass,
      sono_respostas: sleepAnswers,

      estresse_pontuacao: stressScore,
      estresse_classificacao: stressClass,
      estresse_respostas: stressAnswers,
      gender: formGenero
    };

    const updated = [newRecord, ...evaluations.filter(e => e.date !== newRecord.date)];
    setEvaluations(updated);
    
    try {
      localStorage.setItem(`coach_physical_evaluations_${currentStudent.id}`, JSON.stringify(updated));
      // Sync with Firestore
      import("../../../../shared/infrastructure/sync/SyncManager").then(({ SyncManager }) => {
        SyncManager.getInstance().sync();
      }).catch(err => console.error("Error triggering sync on saveAssessment:", err));
    } catch (error) {
      console.error("LocalStorage save error:", error);
      if (error instanceof Error && error.name === "QuotaExceededError") {
        // Strip photos from older evaluations to clear space while preserving numeric metrics
        const cleanedUpdated = updated.map((rec, index) => {
          if (index > 0) {
            return {
              ...rec,
              fotoFrente: undefined,
              fotoLado: undefined,
              fotoCostas: undefined
            };
          }
          return rec;
        });

        try {
          localStorage.setItem(`coach_physical_evaluations_${currentStudent.id}`, JSON.stringify(cleanedUpdated));
          setEvaluations(cleanedUpdated);
          showNotification("Aviso: Limite de armazenamento atingido. O histórico de fotos antigas foi otimizado para liberar espaço.", "info", "Armazenamento Otimizado");
          // Sync with Firestore
          import("../../../../shared/infrastructure/sync/SyncManager").then(({ SyncManager }) => {
            SyncManager.getInstance().sync();
          }).catch(err => console.error("Error triggering sync on saveAssessment (cleaned):", err));
        } catch (innerError) {
          // As a last-resort fallback, strip photos from the current evaluation too to preserve critical numbers
          const noPhotosUpdated = updated.map(rec => ({
            ...rec,
            fotoFrente: undefined,
            fotoLado: undefined,
            fotoCostas: undefined
          }));
          try {
            localStorage.setItem(`coach_physical_evaluations_${currentStudent.id}`, JSON.stringify(noPhotosUpdated));
            setEvaluations(noPhotosUpdated);
            showNotification("Aviso: Limite do navegador atingido. Os dados numéricos foram salvos com sucesso, mas as fotos não puderam ser armazenadas.", "warning", "Salvo Sem Fotos");
            // Sync with Firestore
            import("../../../../shared/infrastructure/sync/SyncManager").then(({ SyncManager }) => {
              SyncManager.getInstance().sync();
            }).catch(err => console.error("Error triggering sync on saveAssessment (no photos):", err));
          } catch (finalError) {
            showNotification("Erro de armazenamento. Não foi possível salvar os dados no navegador.", "warning", "Erro ao Salvar");
            return false;
          }
        }
      } else {
        showNotification("Erro inesperado ao salvar os dados.", "warning", "Erro de Sistema");
        return false;
      }
    }

    setSelectedPastEvalId(newRecord.id);

    // Propagate BF & evaluation date back to parent profile
    onUpdateStudentBF(
      currentStudent.id, 
      resultadosComposicao.percentualGordura, 
      formPeso, 
      formAltura, 
      newRecord.date
    );

    if (!keepFormOpen) {
      showNotification(
        isDraft 
          ? "Rascunho de avaliação física salvo com sucesso!" 
          : "Avaliação física COMPLETA salva e homologada no prontuário com sucesso!",
        "success",
        isDraft ? "Rascunho Salvo" : "Avaliação Homologada"
      );
      setIsFormMode(false);
      resetFormStates();
    }
    return true;
  };

  // Step-by-step auto progression handler
  const handleSaveAndNext = () => {
    // Save draft and keep form open. Only proceed if successful.
    const success = saveAssessment(true, true);
    if (!success) {
      showNotification("Por favor, preencha todos os dados corretamente para poder avançar.", "warning", "Campos Pendentes");
      return;
    }
    
    // Define tabs list in order
    const tabsList = ["anamnese", "antropometria", "ia", "cardio", "atividade", "sono", "estresse"];
    const currentIndex = tabsList.indexOf(activeFormTab);
    
    if (currentIndex < tabsList.length - 1) {
      const nextTab = tabsList[currentIndex + 1];
      const tabNames: Record<string, string> = {
        anamnese: "Anamnese",
        antropometria: "Antropometria",
        ia: "Composição por IA",
        cardio: "Risco Cardíaco",
        atividade: "Aptidão Física",
        sono: "Qualidade do Sono",
        estresse: "Nível de Estresse"
      };
      showNotification(`Progresso salvo! Avançando para: ${tabNames[nextTab] || nextTab}`, "success", "Etapa Salva");
      setActiveFormTab(nextTab as any);
      // Wait a tick and scroll to section header
      setTimeout(() => {
        document.getElementById("avaliacao-fisica-section")?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const getPendingSteps = (): string[] => {
    const pending: string[] = [];
    
    // 1. Anamnese
    const isAnamneseFilled = 
      (anamneseDoencas && anamneseDoencas.trim().length > 0) ||
      (anamneseLesoes && anamneseLesoes.trim().length > 0) ||
      (anamneseCirurgias && anamneseCirurgias.trim().length > 0) ||
      (anamneseAlergias && anamneseAlergias.trim().length > 0) ||
      (anamneseObservacoes && anamneseObservacoes.trim().length > 0) ||
      anamneseUsaMedicacao !== null;
    if (!isAnamneseFilled) {
      pending.push("Anamnese: Preencher pelo menos um campo ou medicação.");
    }

    // 2. Antropometria metric validation
    const metricErrors = runMetricValidation(true);
    if (metricErrors.length > 0) {
      pending.push("Antropometria: Corrigir valores de pesos, medidas ou BF.");
    }

    // 3. Cardio
    const unansweredCardioCount = RISCO_CARDIAC_QUESTIONS.filter(q => !cardioAnswers[q.id as keyof RiscoCardiacoResponse]).length;
    if (unansweredCardioCount > 0) {
      pending.push(`Risco Cardíaco: Responder ${unansweredCardioCount} perguntas pendentes.`);
    }

    // 4. Atividade
    if (!activityAnswers.intensidade || !activityAnswers.duracao || !activityAnswers.frequencia) {
      pending.push("Aptidão Física: Responder todas as 3 seleções de frequência/duração/intensidade.");
    }

    // 5. Sono
    const answeredSleepCount = SONO_QUESTIONS.filter(q => sleepAnswers[q.id] !== undefined).length;
    if (answeredSleepCount < 15) {
      pending.push(`Questionário de Sono: Responder ${15 - answeredSleepCount} perguntas pendentes.`);
    }

    return pending;
  };

  const arePreviousStepsCompleted = (): boolean => {
    return getPendingSteps().length === 0;
  };

  // Delete past evaluation handler
  const handleDeleteEvaluation = (id: string) => {
    setEvaluationToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteEvaluation = () => {
    if (evaluationToDelete) {
      const updated = evaluations.filter(e => e.id !== evaluationToDelete);
      setEvaluations(updated);
      localStorage.setItem(`coach_physical_evaluations_${currentStudent.id}`, JSON.stringify(updated));
      if (updated.length > 0) {
        setSelectedPastEvalId(updated[0].id);
      } else {
        setSelectedPastEvalId("");
      }
      // Sync with Firestore
      import("../../../../shared/infrastructure/sync/SyncManager").then(({ SyncManager }) => {
        SyncManager.getInstance().sync();
      }).catch(err => console.error("Error triggering sync on confirmDeleteEvaluation:", err));
    }
    setIsDeleteConfirmOpen(false);
    setEvaluationToDelete(null);
  };

  // Recharts Chart datasets
  const chronologicalHistory = useMemo(() => {
    return [...evaluations]
      .filter(e => !e.isRascunho)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [evaluations]);

  const hasChartData = chronologicalHistory.length > 0;

  return (
    <div id="avaliacao-fisica-section" className="space-y-6">
      
      {/* Toast Notification Container */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] max-w-sm p-4 rounded-xl border flex items-start gap-3 shadow-2xl overflow-hidden animate-fade-in ${
          toast.type === "success" 
            ? "bg-emerald-950/90 border-emerald-500/30 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
            : toast.type === "warning" 
            ? "bg-amber-950/90 border-amber-500/30 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]" 
            : "bg-cyan-950/90 border-cyan-500/30 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        }`}>
          <div className="text-xl shrink-0 mt-0.5">
            {toast.type === "success" ? "✅" : toast.type === "warning" ? "⚠️" : "ℹ️"}
          </div>
          <div className="flex-1 font-mono text-xs">
            {toast.title && <p className={`font-extrabold uppercase tracking-wider mb-1 ${
              toast.type === "success" ? "text-emerald-400" : toast.type === "warning" ? "text-amber-400" : "text-cyan-400"
            }`}>{toast.title}</p>}
            <p className="leading-relaxed whitespace-pre-line text-gray-200">{toast.message}</p>
          </div>
          <button 
            type="button"
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-white font-bold text-xs p-1 shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
      


      {/* Validation banner inside form */}
      {isFormMode && showValidationBanner && (
        <div className="bg-rose-500/10 border border-rose-500/25 p-5 rounded-2xl space-y-2">
          <h4 className="font-mono text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
            ⚠️ CAMPOS OBRIGATÓRIOS PENDENTES
          </h4>
          <p className="text-xs text-gray-400 font-sans leading-relaxed">
            Para homologar uma avaliação completa, todos os questionários devem ser preenchidos. Você também pode clicar em <strong>"Salvar Rascunho"</strong> para guardar seu progresso incompleto.
          </p>
          <ul className="list-disc pl-5 text-xs font-mono text-rose-300 space-y-1">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ==========================================
          ✍️ FORM/CREATION MODE
          ========================================== */}
      {isFormMode ? (
        <div className="space-y-6">
          {/* Form navigation controls */}
          <div className="flex items-center justify-between border-b border-gray-850 pb-2">
            <button
              type="button"
              onClick={() => setIsFormMode(false)}
              className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-xl transition-all font-mono text-xs cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar ao Histórico
            </button>

            <span className="font-mono text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-cyan-500" /> Cadastrando Nova Avaliação
            </span>
          </div>

          {/* Bio overview input (Automatically populated) */}
          <div className="bg-[#121315]/40 border border-gray-850/80 p-5 rounded-2xl grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2 md:col-span-1 space-y-1">
              <label className="text-[10px] font-mono text-gray-500 uppercase font-bold">Mês Referência</label>
              <input
                type="text"
                placeholder="MM/AAAA"
                value={formMonth}
                onChange={(e) => setFormMonth(e.target.value)}
                className="w-full bg-gray-900/60 border border-gray-800 focus:border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-500 uppercase font-bold">Peso Atual (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formPeso}
                onChange={(e) => setFormPeso(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-900/60 border border-gray-800 focus:border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-500 uppercase font-bold">Altura (cm)</label>
              <input
                type="number"
                value={formAltura}
                onChange={(e) => setFormAltura(parseInt(e.target.value) || 0)}
                className="w-full bg-gray-900/60 border border-gray-800 focus:border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-500 uppercase font-bold">Idade (anos)</label>
              <input
                type="number"
                value={formIdade}
                onChange={(e) => setFormIdade(parseInt(e.target.value) || 0)}
                className="w-full bg-gray-900/60 border border-gray-800 focus:border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-500 uppercase font-bold">Sexo Biológico</label>
              <select
                value={formGenero}
                onChange={(e) => setFormGenero(e.target.value as "masculino" | "feminino")}
                className="w-full bg-gray-900/60 border border-gray-800 focus:border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white"
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
              {(() => {
                const firstWord = currentStudent?.name?.trim().split(" ")[0].toLowerCase();
                if (!firstWord) return null;
                const endingInA = firstWord.endsWith("a") || firstWord.endsWith("as");
                const endingInOMasc = firstWord.endsWith("o") || firstWord.endsWith("os") || firstWord.endsWith("r") || firstWord.endsWith("u") || firstWord.endsWith("i") || firstWord.endsWith("e");
                
                const commonMaleWithA = ["luca", "jean", "felipe", "andre", "henrique", "guilherme", "gabriel", "rafael", "daniel", "samuel"];
                const commonFemaleWithOMasc = ["solange", "regina", "raquel", "ester", "ruth", "yasmin", "beatriz", "alice", "carol"];

                let hasInconsistency = false;
                if (formGenero === "feminino" && (endingInOMasc || commonMaleWithA.includes(firstWord)) && !commonFemaleWithOMasc.includes(firstWord)) {
                  hasInconsistency = true;
                } else if (formGenero === "masculino" && (endingInA || commonFemaleWithOMasc.includes(firstWord)) && !commonMaleWithA.includes(firstWord)) {
                  hasInconsistency = true;
                }

                if (hasInconsistency) {
                  return (
                    <div className="text-[10px] text-rose-400 font-mono mt-1">
                      ⚠️ Nome-sexo inconsistente. Confirme se está correto.
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* Form Tabs Grid Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 bg-gray-950/20 p-1.5 rounded-2xl border border-gray-850">
            {[
              { id: "anamnese", label: "Anamnese", step: "Etapa 01", icon: ClipboardList },
              { id: "antropometria", label: "Antropometria", step: "Etapa 02", icon: Scale },
              { id: "ia", label: "Composição IA", step: "Etapa 03", icon: Camera },
              { id: "cardio", label: "Risco Cardíaco", step: "Etapa 04", icon: Activity },
              { id: "atividade", label: "Aptidão Física", step: "Etapa 05", icon: Zap },
              { id: "sono", label: "Sono (Coren)", step: "Etapa 06", icon: Moon },
              { id: "estresse", label: "Estresse", step: "Etapa 07", icon: Award }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isSel = activeFormTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id as any)}
                  className={`py-3 px-2 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    isSel 
                      ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/10" 
                      : "bg-[#111214]/40 hover:bg-[#1c1d21]/60 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <span className={`text-[8px] font-bold ${isSel ? "text-black/60" : "text-gray-500"}`}>{tab.step}</span>
                  <IconComp className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Rendering */}
          <div className="glass-panel p-6 rounded-2xl bg-[#1b1c1e]/20 border border-gray-800" id="avaliacao-fisica-section">
            {activeFormTab === "anamnese" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-2 pb-4 border-b border-gray-800">
                  <ClipboardList className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Anamnese / Histórico Clínico
                  </h3>
                </div>

                {/* Confirm No Restrictions Alert */}
                {anamneseDoencas.trim().toLowerCase() === "nenhuma" &&
                 anamneseLesoes.trim().toLowerCase() === "nenhuma" &&
                 anamneseCirurgias.trim().toLowerCase() === "nenhuma" &&
                 anamneseAlergias.trim().toLowerCase() === "nenhuma" && (
                  <div className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-xl text-amber-400 text-[11px] font-mono flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Confirme que o aluno não possui restrições clínicas.</span>
                  </div>
                )}

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Doenças crônicas */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">1. Doenças Crônicas ou Histórico Clínico</label>
                      <span className="text-[9px] font-mono text-gray-500">{anamneseDoencas.length}/500</span>
                    </div>
                    <textarea
                      maxLength={500}
                      rows={3}
                      placeholder="Ex: Hipertensão, Diabetes, Asma, etc. Se não houver, digite 'Nenhuma'."
                      value={anamneseDoencas}
                      onChange={(e) => setAnamneseDoencas(e.target.value)}
                      className="w-full bg-gray-900/60 border border-gray-800 focus:border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600 min-h-[80px]"
                    />
                  </div>

                  {/* Histórico de lesões */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">2. Histórico de Lesões / Dores Articulares</label>
                      <span className="text-[9px] font-mono text-gray-500">{anamneseLesoes.length}/500</span>
                    </div>
                    <textarea
                      maxLength={500}
                      rows={3}
                      placeholder="Ex: Lesão no joelho direito em 2020, dor lombar crônica, etc. Se não houver, digite 'Nenhuma'."
                      value={anamneseLesoes}
                      onChange={(e) => setAnamneseLesoes(e.target.value)}
                      className="w-full bg-gray-900/60 border border-gray-800 focus:border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600 min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Medicação contínua */}
                <div className="p-4 bg-gray-900/30 border border-gray-850 rounded-xl space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block">3. Faz uso de medicação contínua?</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs font-mono text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          name="usa_medicacao"
                          checked={anamneseUsaMedicacao === false}
                          onChange={() => setAnamneseUsaMedicacao(false)}
                          className="text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        Não faz uso
                      </label>
                      <label className="flex items-center gap-2 text-xs font-mono text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          name="usa_medicacao"
                          checked={anamneseUsaMedicacao === true}
                          onChange={() => setAnamneseUsaMedicacao(true)}
                          className="text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        Sim, faz uso
                      </label>
                    </div>
                  </div>

                  {anamneseUsaMedicacao === true && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-850">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-gray-500 uppercase font-bold">Qual(is) medicação(ões)?</label>
                        <input
                          type="text"
                          placeholder="Ex: Enalapril"
                          value={anamneseMedicacaoNome}
                          onChange={(e) => setAnamneseMedicacaoNome(e.target.value)}
                          className="w-full bg-gray-900/60 border border-gray-800 focus:border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-gray-500 uppercase font-bold">Dosagem e frequência</label>
                        <input
                          type="text"
                          placeholder="Ex: 10mg ao dia"
                          value={anamneseMedicacaoDosagem}
                          onChange={(e) => setAnamneseMedicacaoDosagem(e.target.value)}
                          className="w-full bg-gray-900/60 border border-gray-800 focus:border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-gray-500 uppercase font-bold">Médico responsável</label>
                        <input
                          type="text"
                          placeholder="Ex: Dr. Carlos Silva"
                          value={anamneseMedicacaoMedico}
                          onChange={(e) => setAnamneseMedicacaoMedico(e.target.value)}
                          className="w-full bg-gray-900/60 border border-gray-800 focus:border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cirurgias prévias */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">4. Cirurgias Prévias (Adicional Recomendado)</label>
                      <span className="text-[9px] font-mono text-gray-500">{anamneseCirurgias.length}/500</span>
                    </div>
                    <textarea
                      maxLength={500}
                      rows={3}
                      placeholder="Ex: Apendicectomia em 2015, reconstrução de LCA em 2019, etc. Se não houver, digite 'Nenhuma'."
                      value={anamneseCirurgias}
                      onChange={(e) => setAnamneseCirurgias(e.target.value)}
                      className="w-full bg-gray-900/60 border border-gray-800 focus:border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600 min-h-[80px]"
                    />
                  </div>

                  {/* Alergias */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">5. Alergias (Adicional Recomendado)</label>
                      <span className="text-[9px] font-mono text-gray-500">{anamneseAlergias.length}/500</span>
                    </div>
                    <textarea
                      maxLength={500}
                      rows={3}
                      placeholder="Ex: Alergia a látex, frutos do mar, etc. Se não houver, digite 'Nenhuma'."
                      value={anamneseAlergias}
                      onChange={(e) => setAnamneseAlergias(e.target.value)}
                      className="w-full bg-gray-900/60 border border-gray-800 focus:border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600 min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Observações clínicas adicionais */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">6. Observações Clínicas Adicionais</label>
                    <span className="text-[9px] font-mono text-gray-500">{anamneseObservacoes.length}/500</span>
                  </div>
                  <textarea
                    maxLength={500}
                    rows={3}
                    placeholder="Informações complementares relevantes para o treino."
                    value={anamneseObservacoes}
                    onChange={(e) => setAnamneseObservacoes(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 focus:border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600 min-h-[80px]"
                  />
                </div>

                {/* Separated Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={handleSaveAndNext}
                    className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Salvar e Ir para Próxima Etapa (Antropometria)
                  </button>
                </div>
              </div>
            )}

            {activeFormTab === "antropometria" && (
              <div className="space-y-6">
                {/* Antropometria Sub-Tab Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-gray-850 pb-3">
                  <button
                    type="button"
                    onClick={() => setAntropometriaSubTab("medidas")}
                    className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      antropometriaSubTab === "medidas"
                        ? "bg-[#ccff00] text-black font-bold"
                        : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5 inline mr-1" /> Entrada de Medidas & Dobras
                  </button>
                  <button
                    type="button"
                    onClick={() => setAntropometriaSubTab("composicao")}
                    className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      antropometriaSubTab === "composicao"
                        ? "bg-[#ccff00] text-black font-bold"
                        : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5 inline mr-1" /> Composição & Índices
                  </button>
                  <button
                    type="button"
                    onClick={() => setAntropometriaSubTab("metabolismo")}
                    className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      antropometriaSubTab === "metabolismo"
                        ? "bg-[#ccff00] text-black font-bold"
                        : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 inline mr-1" /> Metabolismo & GET
                  </button>
                  <button
                    type="button"
                    onClick={() => setAntropometriaSubTab("performance")}
                    className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      antropometriaSubTab === "performance"
                        ? "bg-[#ccff00] text-black font-bold"
                        : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 inline mr-1" /> Performance, Cardio & Volume
                  </button>
                </div>

                {/* Sub-tab 1: Medidas e Dobras (Input Form) */}
                {antropometriaSubTab === "medidas" && (
                  <AntropometriaView
                    dobras={dobras}
                    perimetros={perimetros}
                    onChangeDobras={setDobras}
                    onChangePerimetros={setPerimetros}
                  />
                )}

                {/* Sub-tab 2: Composição & Índices */}
                {antropometriaSubTab === "composicao" && (() => {
                  const imcData = getIMC(formPeso, formAltura);
                  const rcqData = getRCQ(perimetros.cintura, perimetros.quadril, formGenero);
                  const rceData = getRCE(perimetros.cintura, formAltura);
                  const bfData = getPercentualGorduraDobras(dobras, formIdade, formGenero, protocoloDobras, conversaoDc);
                  const bfClass = getBFClassification(bfData.bf, formIdade, formGenero);
                  
                  const activeComp = getSelectedComposition();
                  const bfClassActive = getBFClassification(activeComp.bf, formIdade, formGenero);

                  const mg = activeComp.massaGorda;
                  const mm = activeComp.massaMagra;
                  const pesoIdealVal = getPesoIdeal(formAltura, formGenero, formulaPesoIdeal);
                  const scVal = getSuperficieCorporal(formPeso, formAltura);

                  const resAntro = calcularAntropometria({
                    sexo: formGenero,
                    idade: formIdade,
                    peso: formPeso,
                    altura: formAltura,
                    dobras,
                    perimetros
                  });

                  return (
                    <div className="space-y-6">
                      {/* Range validation banner */}
                      {(formPeso < 20 || formPeso > 300 || formAltura < 100 || formAltura > 230) && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-xl font-mono">
                          ⚠️ Aviso: Peso e altura atuais estão fora dos limites normais recomendados para cálculos precisos (Peso: 20-300kg | Altura: 100-230cm).
                        </div>
                      )}

                      {/* Método de Composição Corporal Selector */}
                      <div className="bg-[#121315]/80 border border-gray-800/80 p-5 rounded-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono text-[#ccff00] uppercase font-bold tracking-wider block">Método de Composição Corporal</span>
                            <span className="text-[10px] text-gray-400 font-mono">Escolha o método principal para determinar a composição corporal e alimentar a IA</span>
                          </div>
                          <div className="flex gap-2 bg-gray-900/60 p-1 border border-gray-850 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setCompositionMethod("dobras")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                compositionMethod === "dobras"
                                  ? "bg-cyan-500 text-black font-bold"
                                  : "text-gray-400 hover:text-white"
                              }`}
                            >
                              Dobras Cutâneas
                            </button>
                            <button
                              type="button"
                              onClick={() => setCompositionMethod("bioimpedancia")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                compositionMethod === "bioimpedancia"
                                  ? "bg-cyan-500 text-black font-bold"
                                  : "text-gray-400 hover:text-white"
                              }`}
                            >
                              Bioimpedância
                            </button>
                          </div>
                        </div>

                        {compositionMethod === "bioimpedancia" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-850">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block">Percentual de Gordura (%)</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={bioBf}
                                  onChange={(e) => {
                                    setBioBf(e.target.value);
                                    const bfNum = parseFloat(e.target.value) || 0;
                                    const mgVal = formPeso * (bfNum / 100);
                                    setBioMassaMagra(String(parseFloat((formPeso - mgVal).toFixed(1))));
                                  }}
                                  placeholder="Ex: 14.5"
                                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-500">% BF</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block">Massa Magra (kg)</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={bioMassaMagra}
                                  onChange={(e) => setBioMassaMagra(e.target.value)}
                                  placeholder="Ex: 64.2"
                                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-500">kg MM</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Consolidated Protocol Card */}
                        <div className="bg-gradient-to-br from-[#121315]/90 to-cyan-950/20 border border-cyan-500/20 p-5 rounded-2xl flex flex-col justify-between md:col-span-2 lg:col-span-3">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2.5">
                              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5" /> Protocolo Selecionado ({activeComp.methodLabel})
                              </span>
                              <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-full font-bold">
                                {compositionMethod === "bioimpedancia" ? "Bioimpedância" : `Dobras (${protocoloDobras.toUpperCase()})`}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                              <div className="bg-black/40 p-3 rounded-xl border border-gray-900 flex flex-col justify-between">
                                <span className="text-[8px] font-mono text-gray-500 block uppercase font-bold">Gordura Corporal</span>
                                <span className="text-xl font-black text-white mt-1">{activeComp.bf}%</span>
                              </div>
                              <div className="bg-black/40 p-3 rounded-xl border border-gray-900 flex flex-col justify-between">
                                <span className="text-[8px] font-mono text-gray-500 block uppercase font-bold">Massa Magra</span>
                                <span className="text-xl font-black text-[#ccff00] mt-1">{activeComp.massaMagra} kg</span>
                              </div>
                              <div className="bg-black/40 p-3 rounded-xl border border-gray-900 flex flex-col justify-between">
                                <span className="text-[8px] font-mono text-gray-500 block uppercase font-bold">Massa Gorda</span>
                                <span className="text-xl font-black text-rose-400 mt-1">{activeComp.massaGorda} kg</span>
                              </div>
                              <div className="bg-black/40 p-3 rounded-xl border border-gray-900 flex flex-col justify-between">
                                <span className="text-[8px] font-mono text-gray-500 block uppercase font-bold">IMC</span>
                                <span className="text-xl font-black text-cyan-400 mt-1">{resAntro.imc}</span>
                              </div>
                              <div className="bg-black/40 p-3 rounded-xl border border-gray-900 flex flex-col justify-between">
                                <span className="text-[8px] font-mono text-gray-500 block uppercase font-bold">RCQ (Cintura/Quadril)</span>
                                <span className="text-xl font-black text-amber-400 mt-1">{resAntro.rcq}</span>
                              </div>
                              <div className="bg-black/40 p-3 rounded-xl border border-gray-900 flex flex-col justify-between">
                                <span className="text-[8px] font-mono text-gray-500 block uppercase font-bold">TMB (Harris-Benedict)</span>
                                <span className="text-xl font-black text-purple-400 mt-1">{resAntro.tmb} kcal</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 pt-1.5 text-[9px] font-mono text-gray-400 border-t border-gray-850 justify-between">
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Soma 3 Dobras (JP3): <strong className="text-white">{resAntro.soma3} mm</strong></span>
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Soma 7 Dobras (JP7): <strong className="text-white">{resAntro.soma7} mm</strong></span>
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Densidade Corporal (DC): <strong className="text-white">{resAntro.densidadeCorporal}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* IMC Card */}
                        <div className="bg-[#121315]/60 border border-gray-800/80 p-5 rounded-2xl flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Índice de Massa Corporal (IMC)</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-white">{imcData.imc || "--"}</span>
                              <span className="text-xs text-gray-400 font-mono">kg/m²</span>
                            </div>
                            <span className={`text-xs font-mono ${imcData.color} font-bold block`}>{imcData.text}</span>
                          </div>
                          
                          {/* Visual meter bar */}
                          {imcData.imc > 0 && (
                            <div className="mt-4 space-y-1">
                              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden flex">
                                <div className="h-full bg-amber-400" style={{ width: "18.5%" }}></div>
                                <div className="h-full bg-emerald-400" style={{ width: "25%" }}></div>
                                <div className="h-full bg-orange-400" style={{ width: "15%" }}></div>
                                <div className="h-full bg-rose-500" style={{ width: "42%" }}></div>
                              </div>
                              <div className="flex justify-between text-[9px] font-mono text-gray-500">
                                <span>18.5</span>
                                <span>25.0</span>
                                <span>30.0</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Relação Cintura-Quadril (RCQ) */}
                        <div className="bg-[#121315]/60 border border-gray-800/80 p-5 rounded-2xl flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Relação Cintura-Quadril (RCQ)</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-white">{rcqData.rcq || "--"}</span>
                              <span className="text-xs text-gray-400 font-mono">razão</span>
                            </div>
                            <span className={`text-xs font-mono ${rcqData.color} font-bold block`}>{rcqData.text}</span>
                          </div>
                          <p className="text-[10px] font-mono text-gray-500 mt-3">
                            Métrica cardiovascular. Medidas necessárias: Cintura ({perimetros.cintura || "?"} cm) e Quadril ({perimetros.quadril || "?"} cm).
                          </p>
                        </div>

                        {/* Relação Cintura-Estatura (RCE) */}
                        <div className="bg-[#121315]/60 border border-gray-800/80 p-5 rounded-2xl flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Relação Cintura-Estatura (RCE)</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-white">{rceData.rce || "--"}</span>
                              <span className="text-xs text-gray-400 font-mono">razão</span>
                            </div>
                            <span className={`text-xs font-mono ${rceData.color} font-bold block`}>{rceData.text}</span>
                          </div>
                          <p className="text-[10px] font-mono text-gray-500 mt-3">
                            Avaliação de gordura visceral. Limite de saúde: &lt; 0.50. Medidas necessárias: Cintura ({perimetros.cintura || "?"} cm) e Altura ({formAltura || "?"} cm).
                          </p>
                        </div>

                        {/* % Gordura Corporal Dobras */}
                        <div className="bg-[#121315]/60 border border-gray-800/80 p-5 rounded-2xl md:col-span-2 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Percentual de Gordura (% BF)</span>
                            <div className="flex gap-1.5">
                              <select
                                value={protocoloDobras}
                                onChange={(e) => setProtocoloDobras(e.target.value as any)}
                                className="bg-gray-900 border border-gray-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white focus:outline-none"
                              >
                                <option value="jp3">Jackson-Pollock 3</option>
                                <option value="jp7">Jackson-Pollock 7</option>
                                <option value="durnin">Durnin-Womersley</option>
                                <option value="faulkner">Faulkner 4</option>
                                <option value="guedes">Guedes 8</option>
                              </select>
                              <select
                                value={conversaoDc}
                                onChange={(e) => setConversaoDc(e.target.value as any)}
                                className="bg-gray-900 border border-gray-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white focus:outline-none"
                              >
                                <option value="siri">Siri</option>
                                <option value="brozek">Brozek</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">{bfData.bf ? `${bfData.bf}%` : "--"}</span>
                              </div>
                              <span className={`text-xs font-mono ${bfClass.color} font-bold block mt-1`}>{bfClass.text}</span>
                            </div>

                            <div className="text-[10px] font-mono text-gray-400 space-y-1 border-l border-gray-800 pl-3">
                              <p className="text-[9px] text-gray-500 uppercase font-bold">Métricas de Peso:</p>
                              <div>Massa Gorda: <span className="text-white font-bold">{mg ? `${mg} kg` : "--"}</span></div>
                              <div>Massa Magra: <span className="text-white font-bold">{mm ? `${mm} kg` : "--"}</span></div>
                              <div>Densidade (DC): <span className="text-white font-bold">{bfData.dc || "--"}</span></div>
                            </div>
                          </div>

                          {/* Missing fields alert */}
                          {!bfData.valid && bfData.missingFields && bfData.missingFields.length > 0 && (
                            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] font-mono text-rose-400">
                              Faltando dobras para protocolo: {bfData.missingFields.join(", ")}
                            </div>
                          )}
                          {bfData.valid && (
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                              <Check className="w-3 h-3" /> Protocolo {protocoloDobras.toUpperCase()} calculado com sucesso!
                            </div>
                          )}
                        </div>

                        {/* Peso Ideal & Superfície Corporal */}
                        <div className="bg-[#121315]/60 border border-gray-800/80 p-5 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Peso Ideal & Superfície</span>
                            <select
                              value={formulaPesoIdeal}
                              onChange={(e) => setFormulaPesoIdeal(e.target.value as any)}
                              className="bg-gray-900 border border-gray-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white focus:outline-none"
                            >
                              <option value="lorenz">Lorenz</option>
                              <option value="broca">Broca</option>
                              <option value="devine">Devine</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-850">
                              <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">Peso Ideal</span>
                              <span className="text-lg font-bold text-[#ccff00]">{pesoIdealVal ? `${pesoIdealVal} kg` : "--"}</span>
                            </div>
                            <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-850">
                              <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">Superfície</span>
                              <span className="text-lg font-bold text-cyan-400">{scVal ? `${scVal} m²` : "--"}</span>
                            </div>
                          </div>
                          <p className="text-[9px] font-mono text-gray-500">
                            Superfície Corporal baseada no protocolo DuBois & DuBois.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Sub-tab 3: Metabolismo & GET */}
                {antropometriaSubTab === "metabolismo" && (() => {
                  const tmbVal = getTMB(formPeso, formAltura, formIdade, formGenero, formulaTmb);
                  const getVal = Math.round(tmbVal * fatorAtividade);

                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* TMB Card */}
                        <div className="bg-[#121315]/60 border border-gray-800/80 p-5 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Taxa Metabólica Basal (TMB)</span>
                            <select
                              value={formulaTmb}
                              onChange={(e) => setFormulaTmb(e.target.value as any)}
                              className="bg-gray-900 border border-gray-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white focus:outline-none"
                            >
                              <option value="mifflin">Mifflin-St Jeor</option>
                              <option value="harris">Harris-Benedict</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-bold text-[#ccff00]">{tmbVal || "--"}</span>
                              <span className="text-xs text-gray-400 font-mono">kcal/dia</span>
                            </div>
                            <p className="text-xs text-gray-400 font-mono">Energia mínima para sobrevivência em repouso absoluto.</p>
                          </div>
                        </div>

                        {/* GET Card */}
                        <div className="bg-[#121315]/60 border border-gray-800/80 p-5 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Gasto Energético Total (GET)</span>
                            <select
                              value={fatorAtividade}
                              onChange={(e) => setFatorAtividade(parseFloat(e.target.value) || 1.2)}
                              className="bg-gray-900 border border-gray-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white focus:outline-none"
                            >
                              <option value="1.2">Sedentário (x1.2)</option>
                              <option value="1.375">Levemente ativo (x1.375)</option>
                              <option value="1.55">Moderadamente ativo (x1.55)</option>
                              <option value="1.725">Muito ativo (x1.725)</option>
                              <option value="1.9">Extremamente ativo (x1.9)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-bold text-cyan-400">{getVal || "--"}</span>
                              <span className="text-xs text-gray-400 font-mono">kcal/dia</span>
                            </div>
                            <p className="text-xs text-gray-400 font-mono">Total de calorias gastas considerando o nível de atividade diária.</p>
                          </div>
                        </div>
                      </div>

                      {/* Visual summary comparison */}
                      {tmbVal > 0 && (
                        <div className="bg-[#121315]/30 border border-gray-850 p-5 rounded-2xl space-y-4 font-mono">
                          <h6 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Análise de Distribuição Calórica</h6>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Metabolismo Basal (TMB):</span>
                                <span className="text-white font-bold">{tmbVal} kcal</span>
                              </div>
                              <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                                <div className="h-full bg-[#ccff00]" style={{ width: `${Math.min(100, (tmbVal / getVal) * 100)}%` }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Custo de Atividade Adicional:</span>
                                <span className="text-white font-bold">{getVal - tmbVal} kcal</span>
                              </div>
                              <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, ((getVal - tmbVal) / getVal) * 100)}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Sub-tab 4: Performance, Cardio & Volume */}
                {antropometriaSubTab === "performance" && (() => {
                  const calculated1rm = get1RM(carga1rm, repeticoes1rm, formula1rm);
                  const rmTable = get1RMTable(calculated1rm);
                  const maxFc = getFCMax(formIdade, fcMaxFormula);
                  const targetZones = getFCZonas(maxFc, fcRepouso);
                  const volumeTotal = getVolumeTotal(cargaVolume, repeticoesVolume, seriesVolume);
                  const volWeeklyClass = getVolumeSemanalClassification(seriesSemanaisVolume);

                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {/* 1RM Estimation */}
                        <div className="bg-[#121315]/60 border border-gray-800/80 p-5 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Estimador de 1RM</span>
                            <select
                              value={formula1rm}
                              onChange={(e) => setFormula1rm(e.target.value as any)}
                              className="bg-gray-900 border border-gray-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white focus:outline-none"
                            >
                              <option value="brzycki">Brzycki</option>
                              <option value="epley">Epley</option>
                              <option value="baechle">Baechle</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-mono text-gray-500 uppercase">Carga (kg)</label>
                              <input
                                type="number"
                                value={carga1rm}
                                onChange={(e) => setCarga1rm(parseFloat(e.target.value) || 0)}
                                className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-mono text-gray-500 uppercase">Reps</label>
                              <input
                                type="number"
                                value={repeticoes1rm}
                                onChange={(e) => setRepeticoes1rm(parseInt(e.target.value) || 0)}
                                className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="pt-2">
                            <span className="text-[9px] font-mono text-gray-500 uppercase block">1RM Estimado</span>
                            <span className="text-3xl font-bold text-[#ccff00]">{calculated1rm ? `${calculated1rm} kg` : "--"}</span>
                          </div>
                        </div>

                        {/* Heart Rate Zones */}
                        <div className="bg-[#121315]/60 border border-gray-800/80 p-5 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Zonas de Frequência Cardíaca</span>
                            <select
                              value={fcMaxFormula}
                              onChange={(e) => setFcMaxFormula(e.target.value as any)}
                              className="bg-gray-900 border border-gray-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white focus:outline-none"
                            >
                              <option value="tanaka">Tanaka</option>
                              <option value="haskell">Haskell</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-mono text-gray-500 uppercase">FC Repouso (bpm)</label>
                              <input
                                type="number"
                                value={fcRepouso}
                                onChange={(e) => setFcRepouso(parseInt(e.target.value) || 60)}
                                className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white"
                              />
                            </div>
                            <div className="pt-3">
                              <span className="text-[9px] font-mono text-gray-500 uppercase block">FC Máxima</span>
                              <span className="text-xl font-bold text-rose-400">{maxFc ? `${maxFc} bpm` : "--"}</span>
                            </div>
                          </div>
                          <p className="text-[9px] font-mono text-gray-500">
                            Cálculo de alvos usando o método de Karvonen (FC Reserva).
                          </p>
                        </div>

                        {/* Volume de Treino */}
                        <div className="bg-[#121315]/60 border border-gray-800/80 p-5 rounded-2xl space-y-4">
                          <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider block">Volume de Treino</span>
                          
                          <div className="grid grid-cols-4 gap-1.5">
                            <div>
                              <label className="text-[8px] font-mono text-gray-500 uppercase block text-center">Carga</label>
                              <input
                                type="number"
                                value={cargaVolume}
                                onChange={(e) => setCargaVolume(parseFloat(e.target.value) || 0)}
                                className="w-full bg-gray-900 border border-gray-800 rounded px-1 py-1 text-[10px] text-center text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-mono text-gray-500 uppercase block text-center">Reps</label>
                              <input
                                type="number"
                                value={repeticoesVolume}
                                onChange={(e) => setRepeticoesVolume(parseInt(e.target.value) || 0)}
                                className="w-full bg-gray-900 border border-gray-800 rounded px-1 py-1 text-[10px] text-center text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-mono text-gray-500 uppercase block text-center">Séries</label>
                              <input
                                type="number"
                                value={seriesVolume}
                                onChange={(e) => setSeriesVolume(parseInt(e.target.value) || 0)}
                                className="w-full bg-gray-900 border border-gray-800 rounded px-1 py-1 text-[10px] text-center text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-mono text-gray-500 uppercase block text-center">Seman.</label>
                              <input
                                type="number"
                                value={seriesSemanaisVolume}
                                onChange={(e) => setSeriesSemanaisVolume(parseInt(e.target.value) || 0)}
                                className="w-full bg-gray-900 border border-gray-800 rounded px-1 py-1 text-[10px] text-center text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="bg-gray-900/40 p-2 rounded border border-gray-850">
                              <span className="text-[8px] font-mono text-gray-500 uppercase block">Vol. Total/Exercício</span>
                              <span className="text-xs font-bold text-white">{volumeTotal ? `${volumeTotal} kg` : "--"}</span>
                            </div>
                            <div className="bg-gray-900/40 p-2 rounded border border-gray-850">
                              <span className="text-[8px] font-mono text-gray-500 uppercase block">Class. Semanal</span>
                              <span className={`text-[9px] font-mono font-bold ${volWeeklyClass.color} block truncate`}>{volWeeklyClass.text}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic tables grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1RM Percentages Table */}
                        {calculated1rm > 0 && (
                          <div className="bg-[#121315]/40 border border-gray-850 p-5 rounded-2xl space-y-3 font-mono text-xs">
                            <h6 className="text-[10px] text-[#ccff00] font-bold uppercase tracking-wider">Tabela de Carga Baseada em %1RM</h6>
                            <div className="grid grid-cols-3 gap-2 text-center text-[10px] border-b border-gray-800 pb-1.5 text-gray-500 uppercase">
                              <span className="text-left">Intensidade</span>
                              <span>Repetições</span>
                              <span className="text-right">Peso Estimado</span>
                            </div>
                            <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
                              {rmTable.map((row) => (
                                <div key={row.label} className="grid grid-cols-3 gap-2 text-center py-1 border-b border-gray-900 text-gray-300">
                                  <span className="text-left text-white font-bold">{row.label}</span>
                                  <span>{row.reps}</span>
                                  <span className="text-right text-[#ccff00] font-bold">{row.weight} kg</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Heart Rate Zones Table */}
                        {maxFc > 0 && targetZones.length > 0 && (
                          <div className="bg-[#121315]/40 border border-gray-850 p-5 rounded-2xl space-y-3 font-mono text-xs">
                            <h6 className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Zonas Alvo de Treinamento Cardiovascular</h6>
                            <div className="grid grid-cols-3 gap-2 text-center text-[10px] border-b border-gray-800 pb-1.5 text-gray-500 uppercase">
                              <span className="text-left">Zona</span>
                              <span>Objetivo</span>
                              <span className="text-right">Frequência (BPM)</span>
                            </div>
                            <div className="space-y-1">
                              {targetZones.map((row) => (
                                <div key={row.label} className="grid grid-cols-3 gap-2 text-center py-1 border-b border-gray-900 text-gray-300">
                                  <span className="text-left text-white font-bold truncate">{row.label}</span>
                                  <span className="text-gray-400 truncate">{row.desc}</span>
                                  <span className="text-right text-rose-400 font-bold">{row.minBpm} - {row.maxBpm}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Save and continue button */}
                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={handleSaveAndNext}
                    className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Salvar e Ir para Próxima Etapa (Composição IA)
                  </button>
                </div>
              </div>
            )}

            {activeFormTab === "ia" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-[#1b1c1e]/40 p-4 rounded-xl border border-gray-800">
                  <div>
                    <h5 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      📸 Análise Visual por IA (Morfometria de Composição)
                    </h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Suba as 3 fotos do aluno para mapeamento corporal biomecânico automático por visão computacional.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadMockPhotos}
                    className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/40 rounded-xl text-[10px] font-mono text-[#ccff00]"
                  >
                    Carregar Fotos Demo
                  </button>
                </div>

                {/* Selector of Composition Method for IA Analysis */}
                <div className="bg-[#121315]/80 border border-gray-800/80 p-5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#ccff00] uppercase font-bold tracking-wider block">Dados Clínicos para Análise da IA (Unificação)</span>
                      <span className="text-[10px] text-gray-400 font-mono">Defina qual método fornecerá o % de Gordura e a Massa Magra para o laudo interpretativo</span>
                    </div>
                    <div className="flex gap-2 bg-gray-900/60 p-1 border border-gray-850 rounded-xl self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => setCompositionMethod("dobras")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          compositionMethod === "dobras"
                            ? "bg-cyan-500 text-black font-bold"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Dobras Cutâneas (JP)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompositionMethod("bioimpedancia")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          compositionMethod === "bioimpedancia"
                            ? "bg-cyan-500 text-black font-bold"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Bioimpedância
                      </button>
                    </div>
                  </div>

                  {/* Active composition metrics display/input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-850/60">
                    <div className="bg-black/30 border border-gray-900 p-3 rounded-xl flex flex-col justify-between">
                      <span className="text-[8px] font-mono text-gray-500 uppercase font-bold">Origem dos Dados</span>
                      <span className="text-xs font-mono text-white font-bold mt-1">
                        {compositionMethod === "dobras" ? "Dobras Cutâneas" : "Exame de Bioimpedância"}
                      </span>
                    </div>

                    {compositionMethod === "dobras" ? (
                      <>
                        <div className="bg-black/30 border border-gray-900 p-3 rounded-xl flex flex-col justify-between">
                          <span className="text-[8px] font-mono text-gray-500 uppercase font-bold">Gordura Corporal (BF)</span>
                          <span className="text-sm font-mono text-cyan-400 font-black mt-1">
                            {getSelectedComposition().bf.toFixed(1)}%
                          </span>
                        </div>
                        <div className="bg-black/30 border border-gray-900 p-3 rounded-xl flex flex-col justify-between">
                          <span className="text-[8px] font-mono text-gray-500 uppercase font-bold">Massa Magra Ativa</span>
                          <span className="text-sm font-mono text-[#ccff00] font-black mt-1">
                            {getSelectedComposition().massaMagra.toFixed(1)} kg
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono text-gray-500 uppercase font-bold block">Ajustar % Gordura (BF)</label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={bioBf}
                              onChange={(e) => {
                                setBioBf(e.target.value);
                                const bfNum = parseFloat(e.target.value) || 0;
                                const mgVal = formPeso * (bfNum / 100);
                                setBioMassaMagra(String(parseFloat((formPeso - mgVal).toFixed(1))));
                              }}
                              placeholder="Ex: 14.5"
                              className="w-full bg-gray-900 border border-gray-850 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-gray-500">% BF</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono text-gray-500 uppercase font-bold block">Ajustar Massa Magra</label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={bioMassaMagra}
                              onChange={(e) => setBioMassaMagra(e.target.value)}
                              placeholder="Ex: 64.2"
                              className="w-full bg-gray-900 border border-gray-850 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-gray-500">kg MM</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Photo grid upload & camera integration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Front Photo */}
                  <div className="bg-[#121315]/40 border border-gray-850 p-4 rounded-xl space-y-3 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                    <div className="text-center">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Frente</span>
                    </div>
                    {photoFront ? (
                      <div className="relative group rounded-lg overflow-hidden border border-gray-800 max-h-[160px] self-center">
                        <img src={photoFront} alt="Frente" className="h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setPhotoFront(null)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black text-rose-400 hover:text-rose-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingFront(true); }}
                        onDragLeave={() => setIsDraggingFront(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingFront(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            compressImage(file)
                              .then(compressed => setPhotoFront(compressed))
                              .catch(err => console.error("Compression error:", err));
                          }
                        }}
                        className={`border border-dashed rounded-xl p-4 text-center space-y-3 transition-all cursor-pointer relative group flex flex-col items-center justify-center min-h-[150px] ${
                          isDraggingFront
                            ? "border-[#ccff00] bg-[#ccff00]/5"
                            : "border-gray-800 hover:border-gray-600 bg-black/20 hover:bg-black/40"
                        }`}
                      >
                        <label className="block w-full h-full cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "front")}
                          />
                          <Upload className="w-8 h-8 text-cyan-500/40 mx-auto group-hover:text-cyan-400 transition-colors" />
                          <p className="text-[10px] text-gray-400 mt-2 font-mono">
                            Arraste & solte ou <span className="text-[#ccff00] underline font-bold">clique para subir</span>
                          </p>
                        </label>
                        <div className="flex justify-center pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              startCamera("front");
                            }}
                            className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded text-[9px] font-mono text-gray-300 flex items-center gap-1 transition-colors hover:text-[#ccff00]"
                          >
                            <Camera className="w-3 h-3 text-cyan-450" /> Usar Câmera
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Side Photo */}
                  <div className="bg-[#121315]/40 border border-gray-850 p-4 rounded-xl space-y-3 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                    <div className="text-center">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Perfil / Lado</span>
                    </div>
                    {photoSide ? (
                      <div className="relative group rounded-lg overflow-hidden border border-gray-800 max-h-[160px] self-center">
                        <img src={photoSide} alt="Perfil" className="h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setPhotoSide(null)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black text-rose-400 hover:text-rose-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingSide(true); }}
                        onDragLeave={() => setIsDraggingSide(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingSide(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            compressImage(file)
                              .then(compressed => setPhotoSide(compressed))
                              .catch(err => console.error("Compression error:", err));
                          }
                        }}
                        className={`border border-dashed rounded-xl p-4 text-center space-y-3 transition-all cursor-pointer relative group flex flex-col items-center justify-center min-h-[150px] ${
                          isDraggingSide
                            ? "border-[#ccff00] bg-[#ccff00]/5"
                            : "border-gray-800 hover:border-gray-600 bg-black/20 hover:bg-black/40"
                        }`}
                      >
                        <label className="block w-full h-full cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "side")}
                          />
                          <Upload className="w-8 h-8 text-cyan-500/40 mx-auto group-hover:text-cyan-400 transition-colors" />
                          <p className="text-[10px] text-gray-400 mt-2 font-mono">
                            Arraste & solte ou <span className="text-[#ccff00] underline font-bold">clique para subir</span>
                          </p>
                        </label>
                        <div className="flex justify-center pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              startCamera("side");
                            }}
                            className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded text-[9px] font-mono text-gray-300 flex items-center gap-1 transition-colors hover:text-[#ccff00]"
                          >
                            <Camera className="w-3 h-3 text-cyan-450" /> Usar Câmera
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Back Photo */}
                  <div className="bg-[#121315]/40 border border-gray-850 p-4 rounded-xl space-y-3 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                    <div className="text-center">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Costas</span>
                    </div>
                    {photoBack ? (
                      <div className="relative group rounded-lg overflow-hidden border border-gray-800 max-h-[160px] self-center">
                        <img src={photoBack} alt="Costas" className="h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setPhotoBack(null)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black text-rose-400 hover:text-rose-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingBack(true); }}
                        onDragLeave={() => setIsDraggingBack(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingBack(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            compressImage(file)
                              .then(compressed => setPhotoBack(compressed))
                              .catch(err => console.error("Compression error:", err));
                          }
                        }}
                        className={`border border-dashed rounded-xl p-4 text-center space-y-3 transition-all cursor-pointer relative group flex flex-col items-center justify-center min-h-[150px] ${
                          isDraggingBack
                            ? "border-[#ccff00] bg-[#ccff00]/5"
                            : "border-gray-800 hover:border-gray-600 bg-black/20 hover:bg-black/40"
                        }`}
                      >
                        <label className="block w-full h-full cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "back")}
                          />
                          <Upload className="w-8 h-8 text-cyan-500/40 mx-auto group-hover:text-cyan-400 transition-colors" />
                          <p className="text-[10px] text-gray-400 mt-2 font-mono">
                            Arraste & solte ou <span className="text-[#ccff00] underline font-bold">clique para subir</span>
                          </p>
                        </label>
                        <div className="flex justify-center pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              startCamera("back");
                            }}
                            className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded text-[9px] font-mono text-gray-300 flex items-center gap-1 transition-colors hover:text-[#ccff00]"
                          >
                            <Camera className="w-3 h-3 text-cyan-450" /> Usar Câmera
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Camera stream overlay */}
                {activeCameraView && (
                  <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center p-6 z-[60]">
                    <div className="bg-gray-950 border border-gray-800 p-5 rounded-2xl w-full max-w-md space-y-4">
                      <h4 className="font-mono text-xs font-black text-white uppercase tracking-wider text-center">
                        Capturando Foto ({activeCameraView})
                      </h4>
                      <video ref={videoRef} autoPlay playsInline className="w-full aspect-square bg-black rounded-xl object-cover border border-gray-850" />
                      <div className="flex justify-between">
                        <button
                          onClick={stopCamera}
                          className="px-3.5 py-1.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white text-xs font-mono rounded-lg transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={capturePhoto}
                          className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono rounded-lg font-bold transition-all"
                        >
                          Capturar Foto
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* IA Trigger Button */}
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    disabled={scanning || (!photoFront && !photoSide && !photoBack)}
                    onClick={handleRunAiAnalysis}
                    className="px-6 py-3.5 bg-[#ccff00] text-black font-mono text-xs font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 flex items-center gap-2 cursor-pointer"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{scanMessages[scanMessageIndex]}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-800 fill-emerald-800 animate-pulse" />
                        <span>Rodar Visão Computacional por IA</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Scan Results rendering */}
                {scanResult && (
                  <div className="bg-[#ccff00]/5 border border-[#ccff00]/15 p-5 rounded-2xl space-y-4">
                    <h5 className="font-mono text-xs font-black text-[#ccff00] uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> COMPOSIÇÃO EXTRAÍDA COM SUCESSO!
                    </h5>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                      <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-850">
                        <span className="text-[9px] text-gray-500 block uppercase font-bold">% Gordura (BF)</span>
                        <span className="text-xl font-black text-cyan-400">{scanResult.percentualGordura}%</span>
                      </div>
                      <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-850">
                        <span className="text-[9px] text-gray-500 block uppercase font-bold">Massa Magra</span>
                        <span className="text-xl font-black text-white">{scanResult.massaMagra} kg</span>
                      </div>
                      <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-850">
                        <span className="text-[9px] text-gray-500 block uppercase font-bold">Somatotipo</span>
                        <span className="text-xl font-black text-[#ccff00]">{scanResult.somatotipo}</span>
                      </div>
                      <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-850">
                        <span className="text-[9px] text-gray-500 block uppercase font-bold">Distribuição</span>
                        <span className="text-xl font-black text-white">{scanResult.distribuicaoGordura}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 font-sans leading-relaxed border-t border-gray-850 pt-3">
                      <p className="font-bold text-white mb-1">Laudo Narrativo da IA:</p>
                      <p className="whitespace-pre-line bg-[#121315]/40 p-4 rounded-xl text-gray-300 font-mono text-[11px] leading-relaxed border border-gray-850">
                        {laudoText}
                      </p>
                    </div>

                    {/* Save and continue button */}
                    <div className="flex justify-end pt-4 border-t border-gray-850">
                      <button
                        type="button"
                        onClick={handleSaveAndNext}
                        className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        Salvar e Ir para Próxima Etapa (Risco Cardíaco)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeFormTab === "cardio" && (
              <div className="space-y-6">
                <RiscoCardiacoView
                  answers={cardioAnswers}
                  onChange={setCardioAnswers}
                />
                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={handleSaveAndNext}
                    className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Salvar e Ir para Próxima Etapa (Aptidão Física)
                  </button>
                </div>
              </div>
            )}

            {activeFormTab === "atividade" && (
              <div className="space-y-6">
                <IndiceAtividadeView
                  answers={activityAnswers}
                  onChange={setActivityAnswers}
                />
                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={handleSaveAndNext}
                    className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Salvar e Ir para Próxima Etapa (Sono)
                  </button>
                </div>
              </div>
            )}

            {activeFormTab === "sono" && (
              <div className="space-y-6">
                <QuestionarioSonoView
                  answers={sleepAnswers}
                  onChange={setSleepAnswers}
                />
                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={handleSaveAndNext}
                    className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Salvar e Ir para Próxima Etapa (Estresse)
                  </button>
                </div>
              </div>
            )}

            {activeFormTab === "estresse" && (
              <div className="space-y-6">
                <QuestionarioEstresseView
                  answers={stressAnswers}
                  onChange={setStressAnswers}
                />
                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      const success = saveAssessment(true);
                      if (success) {
                        showNotification("Todas as etapas foram salvas com sucesso como rascunho!", "success", "Rascunho Concluído");
                        if (onSaveAndAdvance) {
                          onSaveAndAdvance();
                        }
                      }
                    }}
                    className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Salvar e Ir para Próxima Etapa (Finalizar Rascunho)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Teacher's additional remarks */}
          <div className="glass-panel p-5 rounded-2xl bg-[#1b1c1e]/20 border border-gray-850 space-y-2">
            <label className="text-[10px] font-mono text-gray-500 uppercase font-black tracking-wider block">
              ✍️ Observações do Professor (Prescrição ou Notas Manuais)
            </label>
            <textarea
              rows={3}
              value={observacoesManual}
              onChange={(e) => setObservacoesManual(e.target.value)}
              placeholder="Digite aqui recomendações médicas complementares, restrições ou observações particulares observadas..."
              className="w-full bg-gray-900/40 border border-gray-850 focus:border-cyan-500/30 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none placeholder-gray-700"
            />
          </div>

          {/* Bottom Actions panel */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-gray-850">
            <span className="text-[10px] font-mono text-gray-500 italic">
              * Você pode salvar a avaliação como Rascunho incompleto.
            </span>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
              {onSaveAndAdvance && (
                <button
                  type="button"
                  onClick={onSaveAndAdvance}
                  className="flex-1 sm:flex-initial px-5 py-3 bg-[#ccff00]/10 hover:bg-[#ccff00]/20 border border-[#ccff00]/30 text-[#ccff00] font-mono text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  Ir para Próxima Fase (Sem Salvar) <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => saveAssessment(true)}
                className="flex-1 sm:flex-initial px-5 py-3 bg-[#1c1d21] border border-gray-800 hover:bg-gray-800 text-gray-300 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <FileText className="w-4 h-4 text-amber-400" /> Salvar Rascunho
              </button>
              
              {/* 
                REQUISITO: O botão "Homologar avaliação completa" deve aparecer APENAS na última etapa do processo de avaliação ("estresse").
                - Removido de todas as etapas intermediárias (garantido pela condicional de activeFormTab === "estresse").
                - Validação baseada na etapa atual e garantia de que todas as etapas anteriores estejam concluídas.
                - Exibição de avisos detalhados em caso de pendências obrigatórias.
              */}
              {activeFormTab === "estresse" && (
                <>
                  {arePreviousStepsCompleted() ? (
                    <button
                      type="button"
                      id="homologar-completa-btn"
                      onClick={() => {
                        const success = saveAssessment(false);
                        if (success && onSaveAndAdvance) {
                          onSaveAndAdvance();
                        }
                      }}
                      className="flex-1 sm:flex-initial px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-lg shadow-cyan-500/10 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Save className="w-4 h-4" /> Homologar Avaliação Completa
                    </button>
                  ) : (
                    <div className="text-right flex flex-col items-end gap-1 w-full sm:w-auto" id="validation-pending-box">
                      <span className="text-[10px] text-rose-400 font-mono bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg font-bold flex items-center gap-1">
                        ⚠️ Etapas anteriores obrigatórias pendentes:
                      </span>
                      <ul className="text-[9px] text-gray-500 font-mono text-right list-none space-y-0.5">
                        {getPendingSteps().map((p, idx) => (
                          <li key={idx}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ==========================================
           📊 DASHBOARD / HISTORICAL VIEW MODE
           ========================================== */
        <div className="space-y-6">
          
          {/* Evaluations selection / Empty state */}
          {evaluations.length === 0 ? (
            <div className="text-center p-10 border border-dashed border-gray-800 rounded-2xl bg-[#121315]/10 space-y-3">
              <Activity className="w-10 h-10 text-gray-600 mx-auto" />
              <div>
                <p className="text-xs font-mono text-white font-bold">Nenhuma Avaliação Cadastrada</p>
                <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Este aluno ainda não possui avaliações antropométricas ou clínicas cadastradas. Inicie uma nova avaliação agora.
                </p>
              </div>
              <button
                onClick={() => {
                  resetFormStates();
                  setIsFormMode(true);
                }}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Nova Avaliação
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Select Active Record inside Dashboard */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1b1c1e]/30 border border-gray-850 p-4 rounded-xl gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">Registro:</span>
                  <select
                    value={selectedPastEvalId}
                    onChange={(e) => setSelectedPastEvalId(e.target.value)}
                    className="bg-gray-900 border border-gray-800 text-white rounded-lg text-xs px-3 py-1.5 focus:outline-none font-mono cursor-pointer"
                  >
                    {evaluations.map((e) => (
                      <option key={e.id} value={e.id}>
                        Avaliação de {e.date} {e.isRascunho ? "(Rascunho)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="px-3 py-1.5 bg-cyan-950/20 hover:bg-cyan-900/40 border border-cyan-900/30 text-cyan-400 rounded-xl transition-all text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                    title="Personalizar dados e design da consultoria no PDF"
                  >
                    <Settings className="w-3.5 h-3.5" /> Personalizar PDF
                  </button>
                  <button
                    onClick={() => generateEvaluationPDF(activePastEval, currentStudent)}
                    className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 rounded-xl transition-all text-[10px] font-mono flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> PDF do Laudo
                  </button>
                  <button
                    onClick={() => handleDeleteEvaluation(activePastEval.id)}
                    className="p-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 text-rose-400 rounded-lg transition-all"
                    title="Excluir Avaliação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status banner if draft */}
              {activePastEval.isRascunho && (
                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                    <Info className="w-4 h-4" />
                    <span>Esta avaliação é um <strong>RASCUNHO</strong> e não foi homologada por completo.</span>
                  </div>
                  <button
                    onClick={() => {
                      // Load draft into form
                      setFormMonth(activePastEval.date);
                      setDobras(activePastEval.dobras || {});
                      setPerimetros(activePastEval.perimetros || {});
                      setCardioAnswers(activePastEval.risco_cardiaco_respostas || {
                        idade: 0, sexo: 0, peso: 0, atividade: 0, tabagismo: 0, pressao: 0, historico: 0, colesterol: 0, diabetes: 0
                      });
                      setAnamneseDoencas(activePastEval.anamnese_doencas_cronicas || "");
                      setAnamneseLesoes(activePastEval.anamnese_historico_lesoes || "");
                      setAnamneseUsaMedicacao(activePastEval.anamnese_usa_medicacao !== undefined ? activePastEval.anamnese_usa_medicacao : null);
                      setAnamneseMedicacaoNome(activePastEval.anamnese_medicacao_nome || "");
                      setAnamneseMedicacaoDosagem(activePastEval.anamnese_medicacao_dosagem || "");
                      setAnamneseMedicacaoMedico(activePastEval.anamnese_medicacao_medico || "");
                      setAnamneseCirurgias(activePastEval.anamnese_cirurgias || "");
                      setAnamneseAlergias(activePastEval.anamnese_alergias || "");
                      setAnamneseObservacoes(activePastEval.anamnese_observacoes || "");
                      setActivityAnswers({
                        intensidade: activePastEval.indice_atividade_intensidade || 1,
                        duracao: activePastEval.indice_atividade_duracao || 1,
                        frequencia: activePastEval.indice_atividade_frequencia || 1
                      });
                      setSleepAnswers(activePastEval.sono_respostas || {});
                      setStressAnswers(activePastEval.estresse_respostas || {});
                      setObservacoesManual(activePastEval.observacoesManual || "");
                      setPhotoFront(activePastEval.fotoFrente || null);
                      setPhotoSide(activePastEval.fotoLado || null);
                      setPhotoBack(activePastEval.fotoCostas || null);
                      setScanResult(activePastEval.resultados);
                      setLaudoText(activePastEval.analiseIA || null);
                      setCompositionMethod(activePastEval.compositionMethod || "dobras");
                      setBioBf(activePastEval.bioBf || (activePastEval.resultados?.percentualGordura ? String(activePastEval.resultados.percentualGordura) : ""));
                      setBioMassaMagra(activePastEval.bioMassaMagra || (activePastEval.resultados?.massaMagra ? String(activePastEval.resultados.massaMagra) : ""));
                      setIsFormMode(true);
                    }}
                    className="px-3 py-1 bg-amber-500 text-black font-mono text-[10px] font-bold rounded-lg hover:bg-amber-400 transition-all cursor-pointer"
                  >
                    Completar Avaliação
                  </button>
                </div>
              )}

              {/* Main active sub-section display tab selection */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 bg-gray-950/20 p-1.5 rounded-2xl border border-gray-850">
                {[
                  { id: "anamnese", label: "Anamnese", icon: ClipboardList },
                  { id: "antropometria", label: "Antropometria", icon: Scale },
                  { id: "ia", label: "Composição IA", icon: Camera },
                  { id: "cardio", label: "Risco Cardíaco", icon: Activity },
                  { id: "atividade", label: "Aptidão Física", icon: Zap },
                  { id: "sono", label: "Sono", icon: Moon },
                  { id: "estresse", label: "Estresse", icon: Award }
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isSel = activeHistoryTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveHistoryTab(tab.id as any)}
                      className={`py-3 px-2 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                        isSel 
                          ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/10" 
                          : "bg-[#111214]/40 hover:bg-[#1c1d21]/60 text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* READ-ONLY view modes of selected evaluation */}
              <div className="glass-panel p-6 rounded-2xl bg-[#1b1c1e]/15 border border-gray-850">
                {activeHistoryTab === "anamnese" && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-2 pb-4 border-b border-gray-800">
                      <ClipboardList className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                        Anamnese e Histórico Clínico
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Doenças */}
                      <div className="bg-[#111214]/50 p-4 rounded-xl border border-gray-850">
                        <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block mb-1">
                          Doenças Crônicas ou Histórico Clínico
                        </span>
                        <p className="text-xs font-mono text-white whitespace-pre-wrap">
                          {activePastEval.anamnese_doencas_cronicas || "Nenhuma registrada."}
                        </p>
                      </div>

                      {/* Lesões */}
                      <div className="bg-[#111214]/50 p-4 rounded-xl border border-gray-850">
                        <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block mb-1">
                          Histórico de Lesões / Dores Articulares
                        </span>
                        <p className="text-xs font-mono text-white whitespace-pre-wrap">
                          {activePastEval.anamnese_historico_lesoes || "Nenhuma registrada."}
                        </p>
                      </div>
                    </div>

                    {/* Uso de medicação */}
                    <div className="bg-[#111214]/50 p-4 rounded-xl border border-gray-850">
                      <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block mb-2">
                        Faz uso de medicação contínua?
                      </span>
                      {activePastEval.anamnese_usa_medicacao ? (
                        <div className="space-y-2">
                          <p className="text-xs font-mono text-rose-400 font-bold flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
                            Sim, faz uso de medicação contínua.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-800/60">
                            <div>
                              <span className="text-[9px] font-mono text-gray-500 uppercase">Qual(is) medicação(ões)?</span>
                              <p className="text-xs font-mono text-white">{activePastEval.anamnese_medicacao_nome || "-"}</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-gray-500 uppercase">Dosagem e frequência</span>
                              <p className="text-xs font-mono text-white">{activePastEval.anamnese_medicacao_dosagem || "-"}</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-gray-500 uppercase">Médico responsável</span>
                              <p className="text-xs font-mono text-white">{activePastEval.anamnese_medicacao_medico || "-"}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-green-400 flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                          Não faz uso de medicação contínua.
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Cirurgias */}
                      <div className="bg-[#111214]/50 p-4 rounded-xl border border-gray-850">
                        <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block mb-1">
                          Cirurgias Prévias
                        </span>
                        <p className="text-xs font-mono text-white whitespace-pre-wrap">
                          {activePastEval.anamnese_cirurgias || "Nenhuma registrada."}
                        </p>
                      </div>

                      {/* Alergias */}
                      <div className="bg-[#111214]/50 p-4 rounded-xl border border-gray-850">
                        <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block mb-1">
                          Alergias
                        </span>
                        <p className="text-xs font-mono text-white whitespace-pre-wrap">
                          {activePastEval.anamnese_alergias || "Nenhuma registrada."}
                        </p>
                      </div>
                    </div>

                    {/* Observações adicionais */}
                    {activePastEval.anamnese_observacoes && (
                      <div className="bg-[#111214]/50 p-4 rounded-xl border border-gray-850">
                        <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block mb-1">
                          Observações Clínicas Adicionais
                        </span>
                        <p className="text-xs font-mono text-white whitespace-pre-wrap">
                          {activePastEval.anamnese_observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeHistoryTab === "antropometria" && (
                  <AntropometriaView
                    dobras={activePastEval.dobras || {}}
                    perimetros={activePastEval.perimetros || {}}
                    onChangeDobras={() => {}}
                    onChangePerimetros={() => {}}
                    isReadOnly={true}
                  />
                )}

                {activeHistoryTab === "ia" && (
                  <div className="space-y-6 font-mono">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {activePastEval.fotoFrente && (
                        <div className="bg-gray-900/30 p-3 border border-gray-850 rounded-xl text-center">
                          <span className="text-[9px] text-gray-500 uppercase block mb-2 font-bold">Morfometria Frente</span>
                          <img src={activePastEval.fotoFrente} alt="Frente" className="w-full object-cover rounded-lg max-h-[220px]" />
                        </div>
                      )}
                      {activePastEval.fotoLado && (
                        <div className="bg-gray-900/30 p-3 border border-gray-850 rounded-xl text-center">
                          <span className="text-[9px] text-gray-500 uppercase block mb-2 font-bold">Morfometria Lado</span>
                          <img src={activePastEval.fotoLado} alt="Lado" className="w-full object-cover rounded-lg max-h-[220px]" />
                        </div>
                      )}
                      {activePastEval.fotoCostas && (
                        <div className="bg-gray-900/30 p-3 border border-gray-850 rounded-xl text-center">
                          <span className="text-[9px] text-gray-500 uppercase block mb-2 font-bold">Morfometria Costas</span>
                          <img src={activePastEval.fotoCostas} alt="Costas" className="w-full object-cover rounded-lg max-h-[220px]" />
                        </div>
                      )}
                    </div>

                    <div className="glass-panel p-5 rounded-xl space-y-4 border border-gray-800">
                      <h5 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                        🌟 Resultados de Composição Corporal
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-[#161719]/60 p-3.5 rounded-xl border border-gray-800 text-center">
                          <span className="text-[9px] text-gray-400 uppercase tracking-wider block mb-1 font-bold">PESO</span>
                          <span className="text-base font-black text-white">{activePastEval.resultados.peso} kg</span>
                        </div>
                        <div className="bg-[#161719]/60 p-3.5 rounded-xl border border-gray-800 text-center">
                          <span className="text-[9px] text-gray-400 uppercase tracking-wider block mb-1 font-bold">% GORDURA</span>
                          <span className="text-base font-black text-cyan-400">{activePastEval.resultados.percentualGordura}%</span>
                        </div>
                        <span className="hidden md:block border-r border-gray-800 h-10 my-auto" />
                        <div className="bg-[#161719]/60 p-3.5 rounded-xl border border-gray-800 text-center">
                          <span className="text-[9px] text-gray-400 uppercase tracking-wider block mb-1 font-bold">MASSA MAGRA</span>
                          <span className="text-base font-black text-white">{activePastEval.resultados.massaMagra} kg</span>
                        </div>
                        <div className="bg-[#161719]/60 p-3.5 rounded-xl border border-gray-800 text-center">
                          <span className="text-[9px] text-gray-400 uppercase tracking-wider block mb-1 font-bold">MASSA GORDA</span>
                          <span className="text-base font-black text-white">{activePastEval.resultados.massaGorda} kg</span>
                        </div>
                      </div>

                      {activePastEval.analiseIA && (
                        <div className="border-t border-gray-800 pt-4 mt-2">
                          <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-2">Relatório Visão Computacional</span>
                          <div className="p-4 bg-[#161719]/60 text-gray-300 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-line border border-gray-800">
                            {activePastEval.analiseIA}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeHistoryTab === "cardio" && (
                  <RiscoCardiacoView
                    answers={activePastEval.risco_cardiaco_respostas || {
                      idade: 0, sexo: 0, peso: 0, atividade: 0, tabagismo: 0, pressao: 0, historico: 0, colesterol: 0, diabetes: 0
                    }}
                    onChange={() => {}}
                    isReadOnly={true}
                  />
                )}

                {activeHistoryTab === "atividade" && (
                  <IndiceAtividadeView
                    answers={{
                      intensidade: activePastEval.indice_atividade_intensidade || 1,
                      duracao: activePastEval.indice_atividade_duracao || 1,
                      frequencia: activePastEval.indice_atividade_frequencia || 1
                    }}
                    onChange={() => {}}
                    isReadOnly={true}
                  />
                )}

                {activeHistoryTab === "sono" && (
                  <QuestionarioSonoView
                    answers={activePastEval.sono_respostas || {}}
                    onChange={() => {}}
                    isReadOnly={true}
                  />
                )}

                {activeHistoryTab === "estresse" && (
                  <QuestionarioEstresseView
                    answers={activePastEval.estresse_respostas || {}}
                    onChange={() => {}}
                    isReadOnly={true}
                  />
                )}
              </div>

              {/* Render manual observations if exist */}
              {activePastEval.observacoesManual && (
                <div className="bg-[#1b1c1e]/40 border border-gray-850 p-5 rounded-2xl">
                  <h5 className="font-mono text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                    🗒️ Observações Manuais do Professor
                  </h5>
                  <p className="font-mono text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                    {activePastEval.observacoesManual}
                  </p>
                </div>
              )}

              {/* ==========================================
                  📈 HISTORICAL EVOLUTION CHARTS
                  ========================================== */}
              <div className="space-y-6 pt-4 border-t border-gray-850">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#ccff00]" />
                  <h4 className="font-mono text-xs font-black text-white uppercase tracking-wider">
                    📈 Curva de Evolução e Parâmetros Clínicos ao Longo do Tempo
                  </h4>
                </div>

                {hasChartData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Weight & BF Chart */}
                    <div className="bg-[#1b1c1e]/30 border border-gray-850 p-5 rounded-2xl space-y-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block font-bold text-center">
                        Peso (kg) & Gordura Corporal (%)
                      </span>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chronologicalHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2b2f" />
                            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                            <Tooltip contentStyle={{ backgroundColor: "#111214", borderColor: "#2a2b2f" }} />
                            <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
                            <Line name="Peso (kg)" type="monotone" dataKey="resultados.peso" stroke="#ccff00" strokeWidth={3} activeDot={{ r: 8 }} />
                            <Line name="% Gordura BF" type="monotone" dataKey="resultados.percentualGordura" stroke="#06b6d4" strokeWidth={3} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Sleep & Stress Chart */}
                    <div className="bg-[#1b1c1e]/30 border border-gray-850 p-5 rounded-2xl space-y-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block font-bold text-center">
                        Pontuação de Sono & Estresse (Menor é melhor)
                      </span>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chronologicalHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2b2f" />
                            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                            <Tooltip contentStyle={{ backgroundColor: "#111214", borderColor: "#2a2b2f" }} />
                            <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
                            <Line name="Escore Sono" type="monotone" dataKey="sono_pontuacao" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
                            <Line name="Escore Estresse" type="monotone" dataKey="estresse_pontuacao" stroke="#ec4899" strokeWidth={3} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Cardiac Risk Chart */}
                    <div className="bg-[#1b1c1e]/30 border border-gray-850 p-5 rounded-2xl space-y-4 md:col-span-2">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block font-bold text-center">
                        Pontuação de Risco Cardíaco (Michigan Heart Association)
                      </span>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chronologicalHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2b2f" />
                            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                            <Tooltip contentStyle={{ backgroundColor: "#111214", borderColor: "#2a2b2f" }} />
                            <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
                            <Line name="Risco Cardíaco (pts)" type="monotone" dataKey="risco_cardiaco_pontuacao" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-900/10 border border-gray-850 rounded-xl p-6 text-center text-xs font-mono text-gray-500">
                    A curva de evolução gráfica requer pelo menos 1 avaliação COMPLETA cadastrada de forma homologada.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteEvaluation}
        title="Excluir Registro de Avaliação"
        message="Tem certeza absoluta que deseja remover este registro? Esta operação apagará permanentemente todos os escores clínicos, questionários e parâmetros de Antropometria."
      />

      {/* Consulting Config Customization Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111214] border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-850 pb-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <Settings className="w-5 h-5" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider">
                  Personalizar Dados & Design da Consultoria (PDF)
                </h3>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Personalize o relatório de avaliação de 13 páginas gerado em PDF com o seu nome, registro CREF, marca, redes de contato e o tema de cores que combina com a sua marca pessoal.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              try {
                localStorage.setItem("treinopro_consultoria_config", JSON.stringify(consultingConfig));
                setIsConfigModalOpen(false);
                showNotification("Configurações da consultoria (PDF) salvas com sucesso!", "success", "Sucesso");
              } catch (err) {
                console.error(err);
                showNotification("Erro ao salvar as configurações no navegador.", "warning", "Erro");
              }
            }} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Evaluator Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Seu Nome Completo</label>
                  <input
                    type="text"
                    value={consultingConfig.evaluatorName}
                    onChange={(e) => setConsultingConfig({ ...consultingConfig, evaluatorName: e.target.value })}
                    className="w-full bg-[#18191b] border border-gray-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none"
                    placeholder="Prof. Gustavo Workout"
                    required
                  />
                </div>

                {/* Evaluator CREF */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Seu Registro CREF</label>
                  <input
                    type="text"
                    value={consultingConfig.evaluatorCref}
                    onChange={(e) => setConsultingConfig({ ...consultingConfig, evaluatorCref: e.target.value })}
                    className="w-full bg-[#18191b] border border-gray-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none"
                    placeholder="054112-G/SP"
                    required
                  />
                </div>

                {/* Como prefere ser chamado / Assinatura */}
                <div className="space-y-1 md:col-span-2 bg-[#121315] p-3 rounded-xl border border-gray-800">
                  <label className="text-[10px] text-cyan-400 uppercase font-bold block">Como prefere ser chamado / Assinatura (Mensagens & Laudo)</label>
                  <input
                    type="text"
                    value={consultingConfig.shortName || ""}
                    onChange={(e) => setConsultingConfig({ ...consultingConfig, shortName: e.target.value })}
                    className="w-full bg-[#18191b] border border-gray-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none mt-1"
                    placeholder="Ex: Gustavo (Deixe em branco para usar seu nome completo)"
                  />
                  <p className="text-[9px] text-gray-400 font-sans mt-1 leading-relaxed">
                    Insira o nome pelo qual deseja assinar as mensagens de WhatsApp geradas por IA e os laudos técnicos (ex: usar apenas <strong>&quot;Gustavo&quot;</strong> ou <strong>&quot;Rodrigo&quot;</strong> em vez do nome completo ou títulos como <strong>&quot;Personal Mangabeira&quot;</strong> ou <strong>&quot;Prof. Gustavo Workout&quot;</strong>). Se deixado em branco, o sistema usará o nome completo.
                  </p>
                </div>

                {/* Logo Text */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Nome da Marca (Topo/Logo)</label>
                  <input
                    type="text"
                    value={consultingConfig.logoText}
                    onChange={(e) => setConsultingConfig({ ...consultingConfig, logoText: e.target.value })}
                    className="w-full bg-[#18191b] border border-gray-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none"
                    placeholder="TREINOPRO"
                    required
                  />
                </div>

                {/* Slogan */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Slogan da Consultoria</label>
                  <input
                    type="text"
                    value={consultingConfig.slogan}
                    onChange={(e) => setConsultingConfig({ ...consultingConfig, slogan: e.target.value })}
                    className="w-full bg-[#18191b] border border-gray-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none"
                    placeholder="PLATAFORMA INTELIGENTE DE PERFORMANCE"
                    required
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Razão Social / Nome da Empresa</label>
                  <input
                    type="text"
                    value={consultingConfig.companyName}
                    onChange={(e) => setConsultingConfig({ ...consultingConfig, companyName: e.target.value })}
                    className="w-full bg-[#18191b] border border-gray-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none"
                    placeholder="ACADEMIA TREINOPRO LTDA"
                    required
                  />
                </div>

                {/* Address */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Endereço de Atendimento / Comercial (Opcional)</label>
                  <input
                    type="text"
                    value={consultingConfig.address}
                    onChange={(e) => setConsultingConfig({ ...consultingConfig, address: e.target.value })}
                    className="w-full bg-[#18191b] border border-gray-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none"
                    placeholder="Deixe em branco se for atendimento online (ex: Consultoria Online)"
                  />
                  <p className="text-[9px] text-gray-500 font-sans">Se deixado em branco, o PDF exibirá automaticamente &quot;Atendimento &amp; Consultoria Online&quot;.</p>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={consultingConfig.phone}
                    onChange={(e) => setConsultingConfig({ ...consultingConfig, phone: e.target.value })}
                    className="w-full bg-[#18191b] border border-gray-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none"
                    placeholder="(11) 98888-7777"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Email de Contato</label>
                  <input
                    type="email"
                    value={consultingConfig.email}
                    onChange={(e) => setConsultingConfig({ ...consultingConfig, email: e.target.value })}
                    className="w-full bg-[#18191b] border border-gray-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none"
                    placeholder="suporte@treinopro.com.br"
                    required
                  />
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Site Oficial / Linktree (Opcional)</label>
                  <input
                    type="text"
                    value={consultingConfig.website}
                    onChange={(e) => setConsultingConfig({ ...consultingConfig, website: e.target.value })}
                    className="w-full bg-[#18191b] border border-gray-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none"
                    placeholder="www.treinopro.com.br"
                  />
                  <p className="text-[9px] text-gray-500 font-sans">Se deixado em branco, será omitido dos rodapés do PDF.</p>
                </div>

                {/* QR Link */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Link de Verificação (Selo QR)</label>
                  <input
                    type="text"
                    value={consultingConfig.qrLink}
                    onChange={(e) => setConsultingConfig({ ...consultingConfig, qrLink: e.target.value })}
                    className="w-full bg-[#18191b] border border-gray-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none"
                    placeholder="treinopro.com.br/aluno"
                    required
                  />
                </div>
              </div>

              {/* Tema de Cores do PDF */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold block">Identidade Visual (Paleta de Cores do PDF)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: "blue", label: "Azul Slate (Clássico)", bg: "bg-blue-600", primary: "#1e3a8a" },
                    { id: "emerald", label: "Verde Bio (Saúde)", bg: "bg-emerald-600", primary: "#064e3b" },
                    { id: "crimson", label: "Vermelho Force (Força)", bg: "bg-red-600", primary: "#7f1d1d" },
                    { id: "purple", label: "Roxo Zen (Mental)", bg: "bg-purple-600", primary: "#581c87" },
                    { id: "amber", label: "Ouro Premium (Premium)", bg: "bg-amber-600", primary: "#78350f" },
                    { id: "slate", label: "Grafite Steel (Tech)", bg: "bg-slate-600", primary: "#1e293b" }
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setConsultingConfig({ ...consultingConfig, themeId: theme.id as any })}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        consultingConfig.themeId === theme.id
                          ? "border-cyan-500 bg-cyan-950/10 text-white"
                          : "border-gray-800 bg-[#161719]/40 text-gray-400 hover:border-gray-700"
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${theme.bg} shrink-0`}></span>
                      <span className="text-[10px] font-sans font-medium truncate">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-850">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all cursor-pointer"
                >
                  Salvar Personalização
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
