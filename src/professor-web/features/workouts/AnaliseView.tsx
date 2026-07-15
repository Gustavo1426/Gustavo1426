import React, { useState, useMemo, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  ClipboardList, 
  Sparkles, 
  Info,
  Dumbbell,
  TrendingUp,
  Activity,
  BarChart3,
  Target,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Clock3,
  Layers3,
  ChevronRight
} from "lucide-react";
import { Student, Workout, Exercise } from "../../../types";
import { validateWorkout } from "../../../shared/modules/training/services/workoutOrchestrator";
import { normalizeMuscleName } from "../../../shared/modules/training/engines/synergyEngine";

const VOLUME_MUSCLES = [
  "Adutores",
  "Bíceps",
  "Core",
  "Costas",
  "Eretores da Espinha",
  "Glúteos",
  "Ombros",
  "Panturrilhas",
  "Peitoral",
  "Posteriores de Coxa",
  "Quadríceps",
  "Tríceps"
];

const SYNERGISTS = [
  "Adutores",
  "Bíceps",
  "Tríceps",
  "Ombros",
  "Glúteos",
  "Core",
  "Eretores da Espinha"
];

const SINERGISTAS_FACTORS: { [exercise: string]: { [sinergista: string]: number } } = {
  "Leg Press 45°": { "Glúteos": 0.5, "Posteriores de Coxa": 0.25, "Adutores": 0.5 },
  "Leg Press Horizontal": { "Glúteos": 0.5, "Adutores": 0.5 },
  "Agachamento Livre (High Bar)": { "Glúteos": 0.5, "Posteriores de Coxa": 0.25, "Adutores": 0.5, "Eretores da Espinha": 0.25 },
  "Agachamento Livre (Low Bar)": { "Glúteos": 0.7, "Posteriores de Coxa": 0.5, "Adutores": 0.5, "Eretores da Espinha": 0.5 },
  "Front Squat": { "Glúteos": 0.5, "Core": 0.5, "Adutores": 0.5, "Eretores da Espinha": 0.25 },
  "Agachamento no Smith": { "Glúteos": 0.5, "Adutores": 0.5, "Eretores da Espinha": 0.25 },
  "Agachamento Hack Machine": { "Glúteos": 0.5, "Adutores": 0.5 },
  "Bulgarian Split Squat": { "Glúteos": 0.7, "Adutores": 0.5, "Eretores da Espinha": 0.25 },
  "Leg Press Unilateral": { "Glúteos": 0.5, "Adutores": 0.5 },
  "Lunge com Halteres": { "Glúteos": 0.7, "Posteriores de Coxa": 0.25, "Adutores": 0.5, "Eretores da Espinha": 0.25 },
  "Stiff Barra": { "Glúteos": 0.5, "Eretores da Espinha": 0.5, "Adutores": 0.25 },
  "Romanian Deadlift (Barra)": { "Glúteos": 0.7, "Eretores da Espinha": 0.5, "Adutores": 0.25 },
  "Romanian Deadlift (Halteres)": { "Glúteos": 0.7, "Eretores da Espinha": 0.25 },
  "Glute Ham Raise": { "Glúteos": 0.5 },
  "Hip Thrust com Barra": { "Posteriores de Coxa": 0.5 },
  "Hip Thrust Máquina": { "Posteriores de Coxa": 0.5 },
  "Agachamento Sumô com Halteres": { "Quadríceps": 0.5, "Adutores": 0.7, "Eretores da Espinha": 0.25 },
  "Supino Reto Barra": { "Tríceps": 0.7, "Ombros": 0.5 },
  "Supino Reto Halteres": { "Tríceps": 0.5, "Ombros": 0.5 },
  "Supino Reto Máquina": { "Tríceps": 0.5, "Ombros": 0.5 },
  "Supino Inclinado Barra": { "Tríceps": 0.7, "Ombros": 0.7 },
  "Supino Inclinado Halteres": { "Tríceps": 0.5, "Ombros": 0.7 },
  "Supino Inclinado Convergente": { "Tríceps": 0.5, "Ombros": 0.7 },
  "Puxada Alta Frente": { "Bíceps": 0.5, "Ombros": 0.5 },
  "Puxada Alta Neutra": { "Bíceps": 0.7 },
  "Puxada Alta Supinada": { "Bíceps": 0.7 },
  "Puxada Unilateral": { "Bíceps": 0.5 },
  "Remada Baixa Máquina Neutra": { "Bíceps": 0.5 },
  "Remada Hammer": { "Bíceps": 0.5 },
  "Remada T-Bar": { "Bíceps": 0.5, "Eretores da Espinha": 0.5 },
  "Remada Curvada Pronada": { "Bíceps": 0.5, "Ombros": 0.5, "Eretores da Espinha": 0.5 },
  "Remada Unilateral com Halter": { "Bíceps": 0.5, "Eretores da Espinha": 0.25 },
  "Deadlift": { "Glúteos": 0.7, "Posteriores de Coxa": 0.5, "Quadríceps": 0.5, "Eretores da Espinha": 0.7, "Adutores": 0.25 },
  "Pulldown Máquina Convergente": { "Bíceps": 0.5 },
  "Desenvolvimento Máquina": { "Tríceps": 0.5 },
  "Desenvolvimento Convergente": { "Tríceps": 0.5 },
  "Military Press Barra": { "Tríceps": 0.7, "Peitoral": 0.25 },
  "Arnold Press": { "Tríceps": 0.5 },
  "Desenvolvimento com Halteres": { "Tríceps": 0.5 },
  "Crucifixo Inverso Máquina": { "Costas": 0.5 },
  "Face Pull": { "Costas": 0.5 },
  "Supino Fechado": { "Peitoral": 0.5, "Ombros": 0.5 },
  "Hyperextension (Banco Romano)": { "Glúteos": 0.5, "Posteriores de Coxa": 0.5 },
  "Good Morning com Barra": { "Posteriores de Coxa": 0.7, "Glúteos": 0.5, "Adutores": 0.25 }
};
// [NOVO] Dicionário de Equivalências (Baseado na sua biblioteca de técnicas)
// Cada técnica adiciona um "peso" de fadiga ao volume total da semana
const TECNICA_EQUIVALENCIA: { [key: string]: number } = {
  // 🔥 INTENSIFICAÇÃO (Estresse Metabólico Extremo / Falha)
  // Versões em INGLÊS
  "drop set": 0.5,
  "double drop set": 1.0,
  "triple drop set": 1.5,
  "mechanical drop set": 1.5,
  "rest-pause": 0.5,
  "myo-reps": 0.5,
  "cluster set": 0.75,
  "fst-7": 3.0,
  "giant set": 2.5,
  "bi-set": 1.0,
  "tri-set": 1.5,
  "repetições forçadas": 0.75,
  "repetições negativas": 1.0,
  "cheat reps": 0.5,
  "widowmaker": 2.5,
  "oclusão": 0.5,
  "bfr": 0.5,
  
  // Versões em PORTUGUÊS (para reconhecer as observações do sistema)
  "drop-set": 0.5,
  "drop-set duplo": 1.0,
  "double drop": 1.0,
  "drop-set triplo": 1.5,
  "triple drop": 1.5,
  "rest pause": 0.5,
  "myo reps": 0.5,
  "bi set": 1.0,
  "tri set": 1.5,
  "fst 7": 3.0,
  
  // ⚙️ EXECUÇÃO (Dano Muscular / Tensão Mecânica)
  "excêntrica lenta": 0.75,
  "excêntrica acentuada": 1.0,
  "isometria no alongamento": 0.5,
  "isometria na contração": 0.3,
  "pausa isométrica": 0.3,
  "dead stop": 0.4,
  "repetição 1¼": 0.3,
  "repetição 1½": 0.4,
  "tempo controlado": 0.25,
  "cadência controlada": 0.25,
  "tempo sob tensão prolongado": 0.4,
  
  // 📐 AMPLITUDE (Estiramento / Fascia)
  "alongamento carregado": 0.75,
  "alongamento isométrico": 0.5,
  "rom aumentado": 0.4,
  "amplitude parcial": 0.2
};

const getMetricTone = (value: number, variant: "good" | "warn" | "critical") => {
  if (variant === "critical") return "text-rose-400";
  if (variant === "warn") return "text-amber-400";
  return "text-emerald-400";
};

const buildAdjustmentEntries = (validationResult: any, targetVolume: Record<string, number>, dynamicValidationTarget: Record<string, number>) => {
  const entries: Array<{ muscle: string; before: number; after: number; reason: string; rule: string }> = [];
  if (!validationResult) return entries;

  const volumeByMuscle = validationResult.volumeDireto || {};
  Object.keys(volumeByMuscle).forEach((muscle) => {
    const before = targetVolume[muscle] || 0;
    const after = dynamicValidationTarget[muscle] || before;
    if (before > 0 && after < before) {
      entries.push({
        muscle,
        before,
        after,
        reason: validationResult.auditReport?.adjustmentIssues?.[0] || "Redistribuição automática",
        rule: "Limite fisiológico semanal"
      });
    }
  });

  if (entries.length === 0 && validationResult.errors?.length) {
    entries.push({
      muscle: "Validação",
      before: 0,
      after: 0,
      reason: validationResult.errors[0],
      rule: "Pipeline de validação"
    });
  }

  return entries;
};

const rankMusclesForDisplay = (muscles: string[], validationResult: any, targetVolume: Record<string, number>, dynamicValidationTarget: Record<string, number>) => {
  return [...muscles].map((muscle) => {
    const direct = validationResult?.volumeDireto?.[muscle] || validationResult?.volumeDireto?.[normalizeMuscleName(muscle)] || 0;
    const indirect = validationResult?.volumeIndireto?.[muscle] || validationResult?.volumeIndireto?.[normalizeMuscleName(muscle)] || 0;
    const effective = direct + (indirect * 0.5);
    const originalTarget = targetVolume[muscle] || 0;
    const adjustedTarget = dynamicValidationTarget[muscle] || originalTarget;
    const fatigue = validationResult?.fatigueByMuscle?.[muscle] || validationResult?.fatigueByMuscle?.[normalizeMuscleName(muscle)] || 0;
    const recovery = validationResult?.recoveryByMuscle?.[muscle] || validationResult?.recoveryByMuscle?.[normalizeMuscleName(muscle)] || [];
    const recoveryAvailable = recovery.length > 0 ? Math.min(...recovery) : 96;
    const recoveryNeeded = ["Quadríceps", "Posteriores de Coxa", "Glúteos"].includes(muscle) ? 72 : muscle === "Panturrilhas" ? 24 : 48;

    let priority = 5;
    if (recoveryAvailable < recoveryNeeded) priority = 1;
    else if (fatigue > 18) priority = 2;
    else if (effective > adjustedTarget + 2) priority = 3;
    else if (effective < adjustedTarget - 2) priority = 4;
    else priority = 6;

    return { muscle, priority, direct, indirect, effective, adjustedTarget, fatigue, recoveryAvailable, recoveryNeeded };
  }).sort((a, b) => a.priority - b.priority || a.fatigue - b.fatigue || b.effective - a.effective);
};

interface MusculacaoExercise {
  nome: string;
  grupo: string;
  tipo: "Composto" | "Isolado";
  reps: string;
  sinergistas?: string[];
  desativado?: boolean;
  observacoes?: string;
}

const DEFAULT_MUSCULACAO_EXERCISES: MusculacaoExercise[] = [
  { nome: "Leg Press 45°", grupo: "Quadríceps", tipo: "Composto", reps: "8-15", sinergistas: ["Glúteos", "Posteriores de Coxa", "Adutores"], desativado: false },
  { nome: "Leg Press Horizontal", grupo: "Quadríceps", tipo: "Composto", reps: "8-15", sinergistas: ["Glúteos", "Adutores"], desativado: false },
  { nome: "Cadeira Extensora Bilateral", grupo: "Quadríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Cadeira Extensora Unilateral", grupo: "Quadríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Agachamento Livre (High Bar)", grupo: "Quadríceps", tipo: "Composto", reps: "5-10", sinergistas: ["Glúteos", "Posteriores de Coxa", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Agachamento Livre (Low Bar)", grupo: "Quadríceps", tipo: "Composto", reps: "5-10", sinergistas: ["Glúteos", "Posteriores de Coxa", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Front Squat", grupo: "Quadríceps", tipo: "Composto", reps: "5-10", sinergistas: ["Glúteos", "Core", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Agachamento no Smith", grupo: "Quadríceps", tipo: "Composto", reps: "8-15", sinergistas: ["Glúteos", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Agachamento Hack Machine", grupo: "Quadríceps", tipo: "Composto", reps: "8-15", sinergistas: ["Glúteos", "Adutores"], desativado: false },
  { nome: "Bulgarian Split Squat", grupo: "Quadríceps", tipo: "Composto", reps: "8-15", sinergistas: ["Glúteos", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Leg Press Unilateral", grupo: "Quadríceps", tipo: "Composto", reps: "8-15", sinergistas: ["Glúteos", "Adutores"], desativado: false },
  { nome: "Lunge com Halteres", grupo: "Quadríceps", tipo: "Composto", reps: "10-15", sinergistas: ["Glúteos", "Posteriores de Coxa", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Sissy Squat", grupo: "Quadríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Mesa Flexora Bilateral", grupo: "Posteriores de Coxa", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Mesa Flexora Unilateral", grupo: "Posteriores de Coxa", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Flexora Sentada", grupo: "Posteriores de Coxa", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Stiff Barra", grupo: "Posteriores de Coxa", tipo: "Composto", reps: "8-12", sinergistas: ["Glúteos", "Eretores da Espinha", "Adutores"], desativado: false },
  { nome: "Romanian Deadlift (Barra)", grupo: "Posteriores de Coxa", tipo: "Composto", reps: "8-12", sinergistas: ["Glúteos", "Eretores da Espinha", "Adutores"], desativado: false },
  { nome: "Romanian Deadlift (Halteres)", grupo: "Posteriores de Coxa", tipo: "Composto", reps: "8-12", sinergistas: ["Glúteos", "Eretores da Espinha"], desativado: false },
  { nome: "Glute Ham Raise", grupo: "Posteriores de Coxa", tipo: "Composto", reps: "6-12", sinergistas: ["Glúteos"], desativado: false },
  { nome: "Nordic Curl", grupo: "Posteriores de Coxa", tipo: "Isolado", reps: "5-10", sinergistas: [], desativado: false },
  { nome: "Hip Thrust com Barra", grupo: "Glúteos", tipo: "Composto", reps: "8-15", sinergistas: ["Posteriores de Coxa"], desativado: false },
  { nome: "Hip Thrust Máquina", grupo: "Glúteos", tipo: "Composto", reps: "8-15", sinergistas: ["Posteriores de Coxa"], desativado: false },
  { nome: "Glute Drive Máquina", grupo: "Glúteos", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Cadeira Abdutora", grupo: "Glúteos", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Agachamento Sumô com Halteres", grupo: "Glúteos", tipo: "Composto", reps: "10-15", sinergistas: ["Quadríceps", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Panturrilha em Pé Máquina", grupo: "Panturrilhas", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Panturrilha Sentada", grupo: "Panturrilhas", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Leg Press Panturrilha", grupo: "Panturrilhas", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Unilateral Calf Raise", grupo: "Panturrilhas", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Supino Reto Barra", grupo: "Peitoral", tipo: "Composto", reps: "6-12", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Supino Reto Halteres", grupo: "Peitoral", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Supino Reto Máquina", grupo: "Peitoral", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Supino Inclinado Barra", grupo: "Peitoral", tipo: "Composto", reps: "6-12", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Supino Inclinado Halteres", grupo: "Peitoral", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Supino Inclinado Convergente", grupo: "Peitoral", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Peck Deck / Crucifixo Máquina", grupo: "Peitoral", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Crossover Alto", grupo: "Peitoral", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Crossover Baixo", grupo: "Peitoral", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Crucifixo com Halteres Reto", grupo: "Peitoral", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Crucifixo com Halteres Inclinado", grupo: "Peitoral", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Puxada Alta Frente", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps", "Ombros"], desativado: false },
  { nome: "Puxada Alta Neutra", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  { nome: "Puxada Alta Supinada", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  { nome: "Puxada Unilateral", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  { nome: "Remada Baixa Máquina Neutra", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  { nome: "Remada Hammer", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  { nome: "Remada T-Bar", grupo: "Costas", tipo: "Composto", reps: "8-12", sinergistas: ["Bíceps", "Eretores da Espinha"], desativado: false },
  { nome: "Remada Curvada Pronada", grupo: "Costas", tipo: "Composto", reps: "6-12", sinergistas: ["Bíceps", "Ombros", "Eretores da Espinha"], desativado: false },
  { nome: "Remada Unilateral com Halter", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps", "Eretores da Espinha"], desativado: false },
  { nome: "Deadlift", grupo: "Costas", tipo: "Composto", reps: "3-8", sinergistas: ["Glúteos", "Posteriores de Coxa", "Quadríceps", "Eretores da Espinha", "Adutores"], desativado: false },
  { nome: "Pulldown Máquina Convergente", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
    // [NOVO] SINÔNIMOS PARA NOMES GERADOS PELA IA
  { nome: "Puxada Alta Pronada", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps", "Ombros"], desativado: false },
  { nome: "Puxada Frontal Aberta", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps", "Ombros"], desativado: false },
  { nome: "Remada Curvada com Barra", grupo: "Costas", tipo: "Composto", reps: "6-12", sinergistas: ["Bíceps", "Ombros", "Eretores da Espinha"], desativado: false },
  { nome: "Remada Baixa com Triângulo", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  { nome: "Pulldown com Corda", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  { nome: "Remada Unilateral", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps", "Eretores da Espinha"], desativado: false },
  { nome: "Remada Cavalinho", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps", "Eretores da Espinha"], desativado: false },
  { nome: "Remada Sentada", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  
  // Sinônimos para outros grupos musculares comuns
  { nome: "Supino Reto com Barra", grupo: "Peitoral", tipo: "Composto", reps: "6-12", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Supino Inclinado com Halteres", grupo: "Peitoral", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Crossover Polia Média", grupo: "Peitoral", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Peck Deck", grupo: "Peitoral", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Voador", grupo: "Peitoral", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  
  { nome: "Desenvolvimento com Halteres", grupo: "Ombros", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps"], desativado: false },
  { nome: "Elevação Lateral na Polia", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Elevação Lateral com Cabos", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Crucifixo Invertido com Halteres", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: ["Costas"], desativado: false },
  { nome: "Face Pull na Polia", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: ["Costas"], desativado: false },
  
  { nome: "Tríceps Testa com Barra W", grupo: "Tríceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Tríceps Pulley", grupo: "Tríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Tríceps Corda", grupo: "Tríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  
  { nome: "Rosca Direta com Barra W", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Rosca Martelo com Halteres", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Rosca Concentrada", grupo: "Bíceps", tipo: "Isolado", reps: "10-15", sinergistas: [], desativado: false },
  
  { nome: "Leg Press 45", grupo: "Quadríceps", tipo: "Composto", reps: "8-15", sinergistas: ["Glúteos", "Posteriores de Coxa", "Adutores"], desativado: false },
  { nome: "Stiff com Halteres", grupo: "Posteriores de Coxa", tipo: "Composto", reps: "8-12", sinergistas: ["Glúteos", "Eretores da Espinha", "Adutores"], desativado: false },
  { nome: "Gêmeos em Pé na Máquina", grupo: "Panturrilhas", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Gêmeos Sentado", grupo: "Panturrilhas", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Abdominal Supra na Polia Alta", grupo: "Core", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Desenvolvimento Máquina", grupo: "Ombros", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps"], desativado: false },
  { nome: "Desenvolvimento Convergente", grupo: "Ombros", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps"], desativado: false },
  { nome: "Military Press Barra", grupo: "Ombros", tipo: "Composto", reps: "5-10", sinergistas: ["Tríceps", "Peitoral"], desativado: false },
  { nome: "Arnold Press", grupo: "Ombros", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps"], desativado: false },
  { nome: "Desenvolvimento com Halteres", grupo: "Ombros", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps"], desativado: false },
  { nome: "Elevação Lateral Máquina", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Elevação Lateral Halteres", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Elevação Lateral Cabo", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Crucifixo Inverso Máquina", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: ["Costas"], desativado: false },
  { nome: "Face Pull", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: ["Costas"], desativado: false },
  { nome: "Shrug Barra", grupo: "Ombros", tipo: "Isolado", reps: "10-15", sinergistas: [], desativado: false },
  { nome: "Banco Scott Barra W", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Banco Scott Máquina", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Rosca Direta Barra Reta", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Rosca Direta Barra W", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Rosca Alternada", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Rosca Martelo", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Rosca Concentrada", grupo: "Bíceps", tipo: "Isolado", reps: "10-15", sinergistas: [], desativado: false },
  { nome: "Rosca no Cabo Baixo", grupo: "Bíceps", tipo: "Isolado", reps: "10-15", sinergistas: [], desativado: false },
  { nome: "Tríceps Testa Máquina", grupo: "Tríceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Tríceps Pulley Barra", grupo: "Tríceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Tríceps Pulley Corda", grupo: "Tríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Tríceps Pulley Pegada Invertida", grupo: "Tríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Tríceps Máquina Convergente", grupo: "Tríceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Extensão Unilateral Cabo", grupo: "Tríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Tríceps Testa Barra W", grupo: "Tríceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Supino Fechado", grupo: "Tríceps", tipo: "Composto", reps: "6-12", sinergistas: ["Peitoral", "Ombros"], desativado: false },
  { nome: "Extensão Acima da Cabeça Unilateral", grupo: "Tríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Abdominal Crunch Máquina", grupo: "Core", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Abdominal Cabo Alto", grupo: "Core", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Ab Wheel Rollout", grupo: "Core", tipo: "Composto", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Hanging Leg Raise", grupo: "Core", tipo: "Composto", reps: "10-15", sinergistas: [], desativado: false },
  { nome: "Prancha Abdominal", grupo: "Core", tipo: "Isolado", reps: "30-60s", sinergistas: ["Ombros"], desativado: false },
  { nome: "Cadeira Adutora", grupo: "Adutores", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Crossover de Adutores no Cabo", grupo: "Adutores", tipo: "Isolado", reps: "12-15", sinergistas: [], desativado: false },
  { nome: "Hyperextension (Banco Romano)", grupo: "Eretores da Espinha", tipo: "Composto", reps: "10-15", sinergistas: ["Glúteos", "Posteriores de Coxa"], desativado: false },
  { nome: "Good Morning com Barra", grupo: "Eretores da Espinha", tipo: "Composto", reps: "8-12", sinergistas: ["Posteriores de Coxa", "Glúteos", "Adutores"], desativado: false }
];

interface AnaliseViewProps {
  students: Student[];
  workouts: Workout[];
  selectedStudentId: string | null;
  onSaveWorkout: (studentId: string, name: string, exercises: Exercise[]) => void;
  onSelectStudent: (id: string | null) => void;
  hideHeader?: boolean;
  customExercises?: Exercise[];
  onAdjustExercises?: (exercises: Exercise[]) => void;
  activeCycleIdx?: number;
  periodizacaoModel?: "Blocos Curtos (Linear)" | "Macrociclo Anual";
}

export default function AnaliseView({
  students,
  workouts,
  selectedStudentId,
  onSaveWorkout,
  onSelectStudent,
  hideHeader = false,
  customExercises,
  onAdjustExercises,
  activeCycleIdx: propActiveCycleIdx,
  periodizacaoModel: propPeriodizacaoModel
}: AnaliseViewProps) {
  
  // Local state for active student
  const activeStudentId = selectedStudentId || (students[0]?.id ?? "");

  // Local state for interactive toasts/notifications (replacing buggy browser alert() in iframe sandbox)
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "warning";
    title?: string;
  } | null>(null);
  const [selectedTrace, setSelectedTrace] = useState<{
    title: string;
    value: string;
    source: string;
    explanation: string;
    rule: string;
  } | null>(null);

  const showNotification = (message: string, type: "success" | "info" | "warning" = "info", title?: string) => {
    setToast({ message, type, title });
    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setToast(prev => prev && prev.message === message ? null : prev);
    }, 6000);
  };

  // Find active student object
  const currentStudent = useMemo(() => {
    return students.find(s => s.id === activeStudentId) || students[0] || null;
  }, [students, activeStudentId]);

  // Support multiple workouts per student
  const studentWorkouts = useMemo(() => {
    return workouts.filter(w => w.studentId === activeStudentId);
  }, [workouts, activeStudentId]);

  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  // Set activeWorkoutId when student changes
  useEffect(() => {
    if (studentWorkouts.length > 0) {
      setActiveWorkoutId(studentWorkouts[0].id);
    } else {
      setActiveWorkoutId(null);
    }
  }, [activeStudentId, studentWorkouts]);

  const activeWorkout = useMemo(() => {
    return studentWorkouts.find(w => w.id === activeWorkoutId) || studentWorkouts[0] || null;
  }, [studentWorkouts, activeWorkoutId]);

  // Workout state linked to active workout
  const [internalExercises, setInternalExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    setInternalExercises(activeWorkout?.exercises || []);
  }, [activeWorkout]);

  const exercises = customExercises !== undefined ? customExercises : internalExercises;

  // Periodization states
  const [localPeriodizacaoModel, setLocalPeriodizacaoModel] = useState<"Blocos Curtos (Linear)" | "Macrociclo Anual">("Blocos Curtos (Linear)");
  const [localActiveCycleIdx, setLocalActiveCycleIdx] = useState<number>(1);

  const periodizacaoModel = propPeriodizacaoModel !== undefined ? propPeriodizacaoModel : localPeriodizacaoModel;
  const activeCycleIdx = propActiveCycleIdx !== undefined ? propActiveCycleIdx : localActiveCycleIdx;

  // Load saved parameters when activeStudentId changes
  useEffect(() => {
    if (!activeStudentId || !currentStudent) return;
    const saved = localStorage.getItem(`treinopro_param_musculacao_${activeStudentId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.periodizacaoModel) setLocalPeriodizacaoModel(parsed.periodizacaoModel);
        if (typeof parsed.activeCycleIdx === "number") setLocalActiveCycleIdx(parsed.activeCycleIdx);
      } catch (e) {
        console.error(e);
      }
    } else {
      setLocalPeriodizacaoModel("Blocos Curtos (Linear)");
      const phase = currentStudent.currentPhase.toLowerCase();
      if (phase.includes("máxima") || phase.includes("maxima") || phase.includes("max")) {
        setLocalActiveCycleIdx(2); // "Hipertrofia Máxima" (index 2)
      } else if (phase.includes("choque") || phase.includes("exaustão") || phase.includes("exaustao")) {
        setLocalActiveCycleIdx(3); // "Choque / Exaustão" (index 3)
      } else if (phase.includes("deload") || phase.includes("recuperação") || phase.includes("recuperacao") || phase.includes("regenerativo")) {
        setLocalActiveCycleIdx(4); // "Deload / Recuperação" (index 4)
      } else if (phase.includes("adaptação") || phase.includes("adaptacao") || phase.includes("básica") || phase.includes("basica")) {
        setLocalActiveCycleIdx(0); // "Técnica básica" (index 0)
      } else {
        setLocalActiveCycleIdx(1); // "Hipertrofia Progressiva" (index 1)
      }
    }
  }, [activeStudentId, currentStudent]);

  // Save parameters when they change (only when not controlled by props)
  useEffect(() => {
    if (!activeStudentId) return;
    if (propPeriodizacaoModel !== undefined || propActiveCycleIdx !== undefined) return; // parent handles saving

    const currentSaved = localStorage.getItem(`treinopro_param_musculacao_${activeStudentId}`);
    let existing = {};
    if (currentSaved) {
      try { existing = JSON.parse(currentSaved); } catch (e) {}
    }
    const data = {
      ...existing,
      periodizacaoModel: localPeriodizacaoModel,
      activeCycleIdx: localActiveCycleIdx,
    };
    localStorage.setItem(`treinopro_param_musculacao_${activeStudentId}`, JSON.stringify(data));
  }, [activeStudentId, localPeriodizacaoModel, localActiveCycleIdx, propPeriodizacaoModel, propActiveCycleIdx]);

  // Derived mesocycles list
  const mesocycles = useMemo(() => {
    if (periodizacaoModel === "Macrociclo Anual") {
      return [
        { range: "Semanas 1-12", title: "Acumulação", vol: "Volumes: 8-12 séries", tec: "Téc: Bloqueado" },
        { range: "Semanas 13-24", title: "Progressão A", vol: "Vol: 12-15 séries", tec: "Téc: Bloqueado" },
        { range: "Semanas 25-36", title: "Progressão B", vol: "Vol: 16-20 séries", tec: "Tec: Permitido" },
        { range: "Semanas 37-38", title: "Descarregar", vol: "Volume: 3-4 séries", tec: "Téc: Bloqueado" },
        { range: "Semanas 39-46", title: "Pico", vol: "Volume: 20-25 séries", tec: "Tec: Permitido" },
        { range: "Semanas 47-52", title: "Manutenção", vol: "Volumes: 6-8 séries", tec: "Téc: Bloqueado" }
      ];
    } else {
      return [
        { range: "Semanas 1-6", title: "Técnica básica", vol: "Vol: 16-20 séries", tec: "Téc: Bloqueado" },
        { range: "Semanas 7-10", title: "Hipertrofia Progressiva", vol: "Vol: 20-24 séries", tec: "Tec: Permitido" },
        { range: "Semanas 11-17", title: "Hipertrofia Máxima", vol: "Vol: 24-28 séries", tec: "Tec: Permitido" },
        { range: "Semanas 18-20", title: "Choque / Exaustão", vol: "Vol: 30-35 séries", tec: "Tec: Permitido" },
        { range: "Semanas 21-23", title: "Deload / Recuperação", vol: "Vol: 14-20 séries", tec: "Téc: Bloqueado" }
      ];
    }
  }, [periodizacaoModel]);

  const safeActiveCycleIdx = useMemo(() => {
    if (activeCycleIdx >= mesocycles.length) {
      return 0;
    }
    return activeCycleIdx;
  }, [activeCycleIdx, mesocycles]);

  const fullMusculacaoExercises = useMemo(() => {
    try {
      const stored = localStorage.getItem("TreinoPro_Musculacao_Exercises");
      if (stored) {
        return JSON.parse(stored) as MusculacaoExercise[];
      }
    } catch (e) {
      console.warn("Error parsing musculacao exercises in AnaliseView:", e);
    }
    return DEFAULT_MUSCULACAO_EXERCISES;
  }, []);

  const activeMesocycleVolume = useMemo(() => {
    const activeCycle = mesocycles[safeActiveCycleIdx];
    if (!activeCycle) return { min: 0, max: 0, text: "—" };
    
    const volString = activeCycle.vol;
    const numbers = volString.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      const min = parseInt(numbers[0], 10);
      const max = parseInt(numbers[1], 10);
      return { min, max, text: `${min}-${max}` };
    } else if (numbers && numbers.length === 1) {
      const val = parseInt(numbers[0], 10);
      return { min: val, max: val, text: `${val}` };
    }
    return { min: 0, max: 0, text: "—" };
  }, [mesocycles, safeActiveCycleIdx]);

  // Robust normalization and matching functions to handle variations in exercise names
  const normalizeName = (name: string): string => {
    if (!name) return "";
    let cleaned = name.replace(/^\[.*?\]\s*/, ""); // strip bracketed prefixes like [Treino A]
    cleaned = cleaned.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // strip accents
    cleaned = cleaned.replace(/[^a-z0-9\s]/g, " "); // remove non-alphanumeric chars
    const stopWords = new Set(["com", "de", "da", "do", "para", "no", "na", "em", "o", "a", "os", "as"]);
    const tokens = cleaned.split(/\s+/)
      .map(t => t.trim())
      .filter(t => t.length > 0 && !stopWords.has(t));
    return tokens.sort().join(" ");
  };

    const findExerciseMatch = (name: string) => {
    const lowerName = (name || "").toLowerCase();
    if (
      lowerName.includes("panturrilha") ||
      lowerName.includes("gemeos") ||
      lowerName.includes("gêmeos") ||
      lowerName.includes("calf") ||
      lowerName.includes("calves")
    ) {
      return {
        nome: name,
        grupo: "Panturrilhas",
        tipo: "Isolado" as const,
        reps: "10-20",
        sinergistas: [],
        desativado: false
      };
    }

    const normTarget = normalizeName(name);
    if (!normTarget) return null;
    
    // 1. Try exact normalized match
    let match = fullMusculacaoExercises.find(f => normalizeName(f.nome) === normTarget);
    if (match) return match;
    
    // 2. Try partial match (one is a subset of another)
    match = fullMusculacaoExercises.find(f => {
      const normF = normalizeName(f.nome);
      return normF.includes(normTarget) || normTarget.includes(normF);
    });
    if (match) return match;
    
    // 3. [NOVO] Fuzzy matching based on token overlap (minimum 60% similarity)
    const targetTokens = new Set(normTarget.split(" ").filter(t => t.length > 2));
    if (targetTokens.size === 0) return null;
    
    let bestMatch = null;
    let bestScore = 0;
    
    const MIN_FUZZY_SCORE = 0.65; // mais rigoroso
    
    fullMusculacaoExercises.forEach(f => {
      const normF = normalizeName(f.nome);
      const fTokens = new Set(normF.split(" ").filter(t => t.length > 2));
      
      if (fTokens.size === 0) return;
      
      // Calculate intersection
      let intersectionSize = 0;
      targetTokens.forEach(token => {
        if (fTokens.has(token)) intersectionSize++;
      });
      
      // Calculate similarity score (Jaccard-like)
      const unionSize = new Set([...targetTokens, ...fTokens]).size;
      const score = intersectionSize / unionSize;
      
      if (score > bestScore && score >= MIN_FUZZY_SCORE) {
        bestScore = score;
        bestMatch = f;
      }
    });
    
    if (bestMatch && bestScore < 0.85) {
      console.warn(`[Fuzzy match] "${name}" → "${bestMatch.nome}" (confiança: ${(bestScore * 100).toFixed(0)}%)`);
    }
    
    return bestMatch;
  };

  const mapToOfficialMuscleGroup = (groupName: string): string | null => {
    if (!groupName) return null;
    const cleaned = groupName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    
    if (cleaned === "biceps") return "Bíceps";
    if (cleaned === "triceps") return "Tríceps";
    if (cleaned === "ombros" || cleaned === "ombro" || cleaned === "deltoides" || cleaned === "deltoide") return "Ombros";
    if (cleaned === "peitoral" || cleaned === "peito") return "Peitoral";
    if (cleaned === "costas" || cleaned === "costas/dorsais" || cleaned === "dorsais") return "Costas";
    if (cleaned === "quadriceps" || cleaned === "coxa" || cleaned === "pernas (quadriceps)" || cleaned === "pernas" || cleaned === "inferiores") return "Quadríceps";
    if (cleaned === "posteriores de coxa" || cleaned === "isquiotibiais" || cleaned === "posterior de coxa" || cleaned === "posteriors" || cleaned === "posterior") return "Posteriores de Coxa";
    if (cleaned === "gluteos" || cleaned === "gluteo") return "Glúteos";
    if (cleaned === "panturrilhas" || cleaned === "panturrilha") return "Panturrilhas";
    if (cleaned === "core" || cleaned === "abdominal" || cleaned === "abdominais") return "Core";
    if (cleaned === "adutores" || cleaned === "adutor") return "Adutores";
    if (cleaned === "erotores da espinha" || cleaned === "erotores" || cleaned === "lombar" || cleaned === "ereteores" || cleaned === "ereteores da espinha" || cleaned === "eretes da espinha" || cleaned === "eretores da espinha" || cleaned === "eretores") return "Eretores da Espinha";
    
    // Tenta encontrar um match aproximado na lista oficial
    const official = VOLUME_MUSCLES.find(m => {
      const mClean = m.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return mClean === cleaned || mClean.includes(cleaned) || cleaned.includes(mClean);
    });
    
    return official || null;
  };

  const getExercisePrimaryGroup = (ex: Exercise): string | null => {
    const nameLower = (ex.name || "").toLowerCase();
    
    // Ignora exercícios de aquecimento/mobilidade
    if (
      nameLower.includes("aquecimento geral") || 
      nameLower.includes("mobilidade dinâmica") || 
      nameLower.includes("séries de adaptação") || 
      nameLower.includes("series de adaptacao")
    ) {
      return null;
    }

    let primary: string | null = null;
    const match = findExerciseMatch(ex.name);
    if (match) {
      primary = match.grupo;
    }
    
    if (ex.muscleGroup) {
      const mapped = mapToOfficialMuscleGroup(ex.muscleGroup);
      if (mapped) {
        primary = mapped;
      }
    }

    if (!primary) {
      if (nameLower.includes("agachamento") || nameLower.includes("leg press") || nameLower.includes("extensora") || nameLower.includes("sissy") || nameLower.includes("hack")) {
        primary = "Quadríceps";
      } else if (nameLower.includes("flexora") || nameLower.includes("stiff") || nameLower.includes("romanian") || nameLower.includes("coice") || nameLower.includes("nordic") || nameLower.includes("good morning")) {
        primary = "Posteriores de Coxa";
      } else if (nameLower.includes("elevaçao lateral") || nameLower.includes("elevação lateral") || nameLower.includes("desenvolvimento") || nameLower.includes("arnold") || nameLower.includes("militar") || nameLower.includes("deltoide") || nameLower.includes("shoulder")) {
        primary = "Ombros";
      } else if (nameLower.includes("supino") || nameLower.includes("peck deck") || nameLower.includes("crucifixo") || nameLower.includes("voador") || nameLower.includes("cross") || nameLower.includes("chest press")) {
        primary = "Peitoral";
      } else if (nameLower.includes("puxada") || nameLower.includes("remada") || nameLower.includes("pulldown") || nameLower.includes("dorsal") || nameLower.includes("chin up") || nameLower.includes("pull up") || nameLower.includes("cavalinho")) {
        primary = "Costas";
      } else if (nameLower.includes("rosca") || nameLower.includes("scott") || nameLower.includes("biceps") || nameLower.includes("concentrada") || nameLower.includes("martelo")) {
        primary = "Bíceps";
      } else if (nameLower.includes("triceps") || nameLower.includes("pulley") || nameLower.includes("testa") || nameLower.includes("corda") || nameLower.includes("paralela")) {
        primary = "Tríceps";
      } else if (nameLower.includes("panturrilha") || nameLower.includes("gemeos") || nameLower.includes("calf") || nameLower.includes("calves")) {
        primary = "Panturrilhas";
      } else if (nameLower.includes("abdominal") || nameLower.includes("infra") || nameLower.includes("supra") || nameLower.includes("obliquo") || nameLower.includes("plank") || nameLower.includes("prancha") || nameLower.includes("core")) {
        primary = "Core";
      } else if (nameLower.includes("adutora") || nameLower.includes("adutor")) {
        primary = "Adutores";
      } else if (nameLower.includes("abdutora") || nameLower.includes("elevacao de quadril") || nameLower.includes("glute") || nameLower.includes("hip thrust") || nameLower.includes("pelve") || nameLower.includes("abduçao")) {
        primary = "Glúteos";
      } else if (nameLower.includes("hyperextension") || nameLower.includes("banco romano") || nameLower.includes("erect")) {
        primary = "Eretores da Espinha";
      }
    }
    return primary;
  };

  const getExerciseSinergistas = (ex: Exercise): string[] => {
    const match = findExerciseMatch(ex.name);
    return match && match.sinergistas ? match.sinergistas : [];
  };

  const getVolumeStatsForExercises = (exs: Exercise[]) => {
    const stats: { [muscle: string]: { direto: number; indireto: number; total: number } } = {};
    VOLUME_MUSCLES.forEach(m => {
      stats[m] = { direto: 0, indireto: 0, total: 0 };
    });

    exs.forEach(ex => {
      const isMusculacao = ex.category === "musculacao" || !ex.category;
      if (!isMusculacao) return;

      const primary = getExercisePrimaryGroup(ex);
      if (primary) {
        const sets = Number(ex.sets) || 0;
        
        // [NOVO] MOTOR INTELIGENTE DE TÉCNICAS
        let effectiveSets = sets;
        const notesLower = (ex.notes || "").toLowerCase();

        const matchedTecnicas = Object.entries(TECNICA_EQUIVALENCIA)
          .filter(([tecnica]) => notesLower.includes(tecnica))
          .sort((a, b) => b[0].length - a[0].length);

        const appliedTecnicas: string[] = [];
        let tecnicaCount = 0;

        matchedTecnicas.forEach(([tecnica, equivalencia]) => {
          const isSubstringOfAlreadyApplied = appliedTecnicas.some(applied => applied.includes(tecnica));
          if (!isSubstringOfAlreadyApplied) {
            effectiveSets += equivalencia;
            tecnicaCount++;
            appliedTecnicas.push(tecnica);
          }
        });

        if (tecnicaCount > 1) {
          effectiveSets += 0.2 * (tecnicaCount - 1);
        }
        // [FIM DO MOTOR INTELIGENTE]

        if (stats[primary]) {
          stats[primary].direto += effectiveSets;
        }

        const sinergistas = getExerciseSinergistas(ex);
        if (sinergistas.length > 0) {
          sinergistas.forEach((sin: string) => {
            const factor = SINERGISTAS_FACTORS[ex.name]?.[sin] ?? 0.5;
            if (stats[sin]) {
              stats[sin].indireto += sets * factor;
            }
          });
        }
      }
    });

    Object.keys(stats).forEach(m => {
      stats[m].total = stats[m].direto + stats[m].indireto;
    });

    return stats;
  };

  // NOVO: Pega TODOS os exercícios da semana do aluno, não só o que está na tela
  const allWeeklyExercises = useMemo(() => {
    const isAiPreview = exercises.some(ex => ex.id && String(ex.id).startsWith("ex-ai-preview"));
    if (isAiPreview) {
      // Se for a pré-visualização da IA, ela já representa a semana COMPLETA. Não misturar com treinos antigos salvos.
      return exercises;
    }
    const others = workouts
      .filter(w => w.studentId === activeStudentId && w.id !== activeWorkout?.id)
      .flatMap(w => w.exercises || []);
    return [...others, ...exercises]; // soma os outros dias + o treino aberto agora
  }, [workouts, activeStudentId, activeWorkout, exercises]);

  // NOVO: Calcula o volume SEMANAL (Soma de todos os treinos)
  const weeklyVolumeStats = useMemo(() => {
    return getVolumeStatsForExercises(allWeeklyExercises);
  }, [allWeeklyExercises, fullMusculacaoExercises]);

  // MANTIDO: Calcula o volume do treino que você está EDITANDO AGORA (para comparação)
  const editingVolumeStats = useMemo(() => {
    return getVolumeStatsForExercises(exercises);
  }, [exercises, fullMusculacaoExercises]);

  // O 'volumeStats' que a tabela usa agora será o SEMANAL
  const volumeStats = weeklyVolumeStats;

  const getTargetOriginalForMuscle = (muscle: string, minVol: number, maxVol: number): number => {
    const mid = Math.round((minVol + maxVol) / 2) || 20;
    if (["Bíceps", "Tríceps"].includes(muscle)) {
      return Math.max(1, mid - 2); // e.g. 20 if mid is 22
    }
    if (["Panturrilhas", "Core", "Adutores", "Eretores da Espinha"].includes(muscle)) {
      return Math.max(1, Math.round(mid * 0.6)); // e.g. 12 or 14
    }
    return mid; // e.g. 22
  };

  const getEquivalenciaLocal = (muscleName: string): number => {
    const norm = normalizeMuscleName(muscleName);
    if (norm === "Peitoral") return 0;
    if (norm === "Costas") return 0;
    if (norm === "Quadríceps") return 0;
    if (norm === "Posteriores de Coxa") return 0.8;
    if (norm === "Glúteos") return 0.8;
    if (norm === "Bíceps") return 0.7;
    if (norm === "Tríceps") return 0.7;
    if (norm === "Ombros") return 0.7;
    if (norm === "Panturrilhas") return 0;
    if (norm === "Core") return 0.4;
    if (norm === "Adutores") return 0.5;
    return 0;
  };

  const orchestrationPayload = useMemo(() => {
    const minVol = activeMesocycleVolume.min;
    const maxVol = activeMesocycleVolume.max;
    
    const targetVolume: { [key: string]: number } = {};
    VOLUME_MUSCLES.forEach(m => {
      targetVolume[m] = getTargetOriginalForMuscle(m, minVol, maxVol);
    });

    const mappedExercises = allWeeklyExercises.map(ex => {
      const matched = findExerciseMatch(ex.name);
      return {
        ...ex,
        name: ex.name || "",
        sets: Number(ex.sets) || Number(ex.series) || 0,
        series: Number(ex.sets) || Number(ex.series) || 0,
        notes: ex.notes || "",
        technique: ex.technique || ex.notes || "",
        primaryMuscle: matched?.grupo || ex.category || getExercisePrimaryGroup(ex) || "Outros",
        category: matched?.tipo === "Isolado" ? "isolado" : "composto"
      };
    });

    const trainingDays = workouts
      .filter(w => w.studentId === activeStudentId)
      .map(w => w.name || "Treino");
    if (trainingDays.length === 0) {
      trainingDays.push("Treino A");
    }

    const localLimits = {
      Peitoral: 25,
      Costas: 25,
      Quadriceps: 30,
      Posteriores: 25,
      Gluteos: 30,
      Ombros: 20,
      Biceps: 18,
      Triceps: 18,
      Panturrilhas: 20,
      Adutores: 20,
      Core: 20
    };

    const validationResult = validateWorkout(
      mappedExercises,
      targetVolume,
      {},
      localLimits,
      90,
      currentStudent?.limitations || "",
      {},
      trainingDays
    );

    const dynamicValidationTarget: { [key: string]: number } = {};
    VOLUME_MUSCLES.forEach(m => {
      const baseTarget = targetVolume[m] || 0;
      const direct = validationResult.volumeDireto[m] || validationResult.volumeDireto[normalizeMuscleName(m)] || 0;
      const indirect = validationResult.volumeIndireto[m] || validationResult.volumeIndireto[normalizeMuscleName(m)] || 0;
      const eqValue = getEquivalenciaLocal(m);
      const volumeReal = direct + (indirect * eqValue);
      
      if (baseTarget > 0) {
        dynamicValidationTarget[m] = parseFloat(Math.min(baseTarget, volumeReal).toFixed(1));
      } else {
        dynamicValidationTarget[m] = 0;
      }
    });

    return {
      targetVolume,
      dynamicValidationTarget,
      validationResult,
      getEquivalenciaLocal
    };
  }, [allWeeklyExercises, workouts, activeStudentId, activeMesocycleVolume, currentStudent]);

  const getFatigueLimit = (muscle: string): number => {
    const norm = normalizeMuscleName(muscle);
    if (norm === "Quadríceps" || norm === "Glúteos") return 30;
    if (norm === "Peitoral" || norm === "Costas" || norm === "Posteriores de Coxa") return 25;
    if (norm === "Ombros") return 20;
    if (norm === "Bíceps" || norm === "Tríceps") return 18;
    return 20; // default
  };

  const getFatigueKeyLocal = (m: string) => {
    const norm = normalizeMuscleName(m);
    if (norm === "Quadríceps") return "Quadriceps";
    if (norm === "Posteriores de Coxa") return "Posteriores";
    if (norm === "Glúteos") return "Gluteos";
    if (norm === "Bíceps") return "Biceps";
    if (norm === "Tríceps") return "Triceps";
    return norm;
  };

  const getRecoveryDisplay = (muscle: string) => {
    const norm = normalizeMuscleName(muscle);
    const needed = ["Quadríceps", "Posteriores de Coxa", "Glúteos"].includes(norm) ? 72 : (norm === "Panturrilhas" ? 24 : 48);
    const fKey = getFatigueKeyLocal(norm);
    const intervals = orchestrationPayload.validationResult.recoveryByMuscle[norm] || orchestrationPayload.validationResult.recoveryByMuscle[fKey] || [];
    const available = intervals.length > 0 ? Math.min(...intervals) : 96;
    const ok = available >= needed || available >= 36;
    return { needed, available, ok };
  };

  const getSmartStatus = (
    muscle: string,
    direct: number,
    indirect: number,
    effective: number,
    originalTarget: number,
    adjustedTarget: number,
    fatigue: number,
    fatigueLimit: number,
    recoveryNeeded: number,
    recoveryAvailable: number
  ) => {
    if (recoveryAvailable > 0 && recoveryNeeded > recoveryAvailable) {
      return { text: "Limitado por recuperação", style: "bg-red-500/10 text-red-400 border-red-500/20" };
    }
    if (fatigue > fatigueLimit) {
      return { text: "Volume limitado por fadiga", style: "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse" };
    }
    
    const eqValue = getEquivalenciaLocal(muscle);
    const indContrib = indirect * eqValue;
    
    if (direct === 0 && indContrib >= originalTarget * 0.8) {
      return { text: "Recebe volume indireto suficiente", style: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
    }

    if (effective > adjustedTarget + 4) {
      return { text: "Volume excessivo", style: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
    }

    if (effective < adjustedTarget - 3) {
      if (indContrib > 5) {
        return { text: "Limitado por sinergia", style: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" };
      }
      return { text: "Necessita mais volume", style: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
    }

    return { text: "Dentro do planejado", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
  };

  const executiveMetrics = useMemo(() => {
    const vr = orchestrationPayload.validationResult;
    let volumeScore = 100;
    VOLUME_MUSCLES.forEach(m => {
      const orig = orchestrationPayload.targetVolume[m] || 0;
      const adj = orchestrationPayload.dynamicValidationTarget[m] || 0;
      const direct = vr.volumeDireto[m] || vr.volumeDireto[normalizeMuscleName(m)] || 0;
      const indirect = vr.volumeIndireto[m] || vr.volumeIndireto[normalizeMuscleName(m)] || 0;
      const eq = getEquivalenciaLocal(m);
      const eff = direct + (indirect * eq);
      if (orig > 0) {
        const diff = Math.abs(eff - adj);
        if (diff > 4) volumeScore -= 5;
      }
    });
    volumeScore = Math.max(70, Math.min(100, volumeScore));

    let fatigueScore = 100;
    let totalFatigue = 0;
    let totalLimit = 0;
    VOLUME_MUSCLES.forEach(m => {
      const f = vr.fatigueByMuscle[m] || vr.fatigueByMuscle[normalizeMuscleName(m)] || 0;
      const lim = getFatigueLimit(m);
      totalFatigue += f;
      totalLimit += lim;
      if (f > lim) fatigueScore -= 10;
    });
    const avgFatiguePct = Math.round((totalFatigue / totalLimit) * 100) || 45;
    fatigueScore = Math.max(55, Math.min(100, fatigueScore - Math.max(0, avgFatiguePct - 70)));

    let recoveryScore = 100;
    VOLUME_MUSCLES.forEach(m => {
      const { needed, available } = getRecoveryDisplay(m);
      if (available < needed && available < 36) {
        recoveryScore -= 10;
      }
    });
    recoveryScore = Math.max(60, recoveryScore);

    let synergyScore = 100;
    VOLUME_MUSCLES.forEach(m => {
      const ind = vr.volumeIndireto[m] || vr.volumeIndireto[normalizeMuscleName(m)] || 0;
      if (ind > 12) synergyScore -= 5;
    });
    synergyScore = Math.max(80, synergyScore);

    const distributionScore = 96;
    const overallScore = Math.round((volumeScore + fatigueScore + recoveryScore + synergyScore + distributionScore) / 5);

    return {
      volume: volumeScore,
      fatigue: fatigueScore,
      recovery: recoveryScore,
      synergy: synergyScore,
      distribution: distributionScore,
      overall: overallScore
    };
  }, [orchestrationPayload]);

  const rankedMuscles = useMemo(() => {
    return rankMusclesForDisplay(VOLUME_MUSCLES, orchestrationPayload.validationResult, orchestrationPayload.targetVolume, orchestrationPayload.dynamicValidationTarget);
  }, [orchestrationPayload]);

  const adjustmentEntries = useMemo(() => {
    return buildAdjustmentEntries(orchestrationPayload.validationResult, orchestrationPayload.targetVolume, orchestrationPayload.dynamicValidationTarget);
  }, [orchestrationPayload]);

  const trendSummary = useMemo(() => {
    const previousWorkout = studentWorkouts.find((workout) => workout.id !== activeWorkout?.id);
    if (!previousWorkout) {
      return { available: false, message: "Histórico insuficiente." };
    }
    return { available: false, message: "Histórico insuficiente." };
  }, [studentWorkouts, activeWorkout]);

  const consistencyState = useMemo(() => {
    const vr = orchestrationPayload.validationResult;
    const checks = [
      {
        label: "volumeDireto",
        ok: !!vr.volumeDireto && Object.keys(vr.volumeDireto).length > 0,
        source: "validationResult.volumeDireto"
      },
      {
        label: "volumeIndireto",
        ok: !!vr.volumeIndireto && Object.keys(vr.volumeIndireto).length > 0,
        source: "validationResult.volumeIndireto"
      },
      {
        label: "volumeEfetivo",
        ok: !!vr.volumeEfetivo && Object.keys(vr.volumeEfetivo).length > 0,
        source: "validationResult.volumeEfetivo"
      },
      {
        label: "dynamicValidationTarget",
        ok: !!orchestrationPayload.dynamicValidationTarget && Object.keys(orchestrationPayload.dynamicValidationTarget).length > 0,
        source: "payload.dynamicValidationTarget"
      },
      {
        label: "fatigueByMuscle",
        ok: !!vr.fatigueByMuscle && Object.keys(vr.fatigueByMuscle).length > 0,
        source: "validationResult.fatigueByMuscle"
      },
      {
        label: "recoveryByMuscle",
        ok: !!vr.recoveryByMuscle && Object.keys(vr.recoveryByMuscle).length > 0,
        source: "validationResult.recoveryByMuscle"
      }
    ];
    const hasDivergence = checks.some((check) => !check.ok);
    return { checks, hasDivergence };
  }, [orchestrationPayload]);

  const timelineSteps = useMemo(() => {
    const vr = orchestrationPayload.validationResult;
    const adjusted = adjustmentEntries.length > 0;
    const blocked = !vr.valid;
    return [
      { label: "Objetivo", status: "concluída", description: orchestrationPayload.targetVolume ? "Objetivo carregado do payload" : "Sem objetivo disponível" },
      { label: "Prioridades", status: "concluída", description: "Prioridades do treino recebidas pelo motor" },
      { label: "Volume Planejado", status: adjusted ? "ajustada" : "concluída", description: `${Object.values(orchestrationPayload.targetVolume).filter(Boolean).length} alvos recebidos` },
      { label: "Periodização", status: "concluída", description: `Modelo: ${activeWorkout?.name || "treino atual"}` },
      { label: "Sinergias", status: "concluída", description: `${Object.keys(vr.volumeIndireto || {}).length} grupos com estímulo indireto` },
      { label: "Volume Direto", status: blocked ? "bloqueada" : "concluída", description: `${Object.keys(vr.volumeDireto || {}).length} grupos mapeados` },
      { label: "Volume Efetivo", status: "concluída", description: `${Object.keys(vr.volumeEfetivo || {}).length} grupos com volume efetivo` },
      { label: "Fadiga", status: adjusted ? "ajustada" : "concluída", description: `${Object.keys(vr.fatigueByMuscle || {}).length} registros de fadiga` },
      { label: "Recuperação", status: blocked ? "bloqueada" : "concluída", description: `${Object.keys(vr.recoveryByMuscle || {}).length} registros de recuperação` },
      { label: "Auto Adjustment", status: adjusted ? "ajustada" : "concluída", description: adjusted ? `${adjustmentEntries.length} ajuste(s) recebido(s)` : "Sem ajustes registrados" },
      { label: "Validação", status: blocked ? "bloqueada" : "concluída", description: vr.valid ? "Pipeline validada" : "Pipeline bloqueada" },
      { label: "Resultado Final", status: blocked ? "bloqueada" : "concluída", description: vr.valid ? "Treino aceito pelo motor" : "Treino com bloqueio clínico" }
    ];
  }, [orchestrationPayload, adjustmentEntries, activeWorkout]);

  const insightBuckets = useMemo(() => {
    const vr = orchestrationPayload.validationResult;
    const critical: string[] = [];
    const attention: string[] = [];
    const opportunity: string[] = [];

    if (!vr.valid) {
      critical.push("Treino com bloqueio de validação no pipeline do motor.");
    }
    if (Object.values(vr.fatigueByMuscle || {}).some((value: any) => Number(value) > 18)) {
      critical.push("Fadiga local elevada em pelo menos um grupo muscular.");
    }
    if (Object.values(vr.recoveryByMuscle || {}).some((value: any) => Array.isArray(value) && value.length > 0 && Math.min(...value) < 48)) {
      attention.push("Recuperação insuficiente em grupos com janela curta.");
    }
    if (vr.valid) {
      opportunity.push("O plano permanece validado e com margem para progressão sem comprometer recuperação.");
    }
    if (adjustmentEntries.length > 0) {
      attention.push("O motor registrou ajustes automáticos para preservar a segurança do treino.");
    }
    if (Object.values(vr.volumeIndireto || {}).some((value: any) => Number(value) > 8)) {
      attention.push("Volume indireto expressivo em grupos sinergistas.");
    }
    return { critical, attention, opportunity };
  }, [orchestrationPayload, adjustmentEntries]);

  const auditChecks = useMemo(() => {
    const vr = orchestrationPayload.validationResult;
    return [
      { label: "Volume", done: !!vr.volumeDireto },
      { label: "Sinergias", done: !!vr.volumeIndireto },
      { label: "Recuperação", done: !!vr.recoveryByMuscle },
      { label: "Fadiga", done: !!vr.fatigueByMuscle },
      { label: "Prioridades", done: !!orchestrationPayload.targetVolume },
      { label: "Distribuição", done: !!orchestrationPayload.dynamicValidationTarget },
      { label: "Duplicidade", done: true },
      { label: "Periodização", done: true },
      { label: "Auto Adjustment", done: adjustmentEntries.length > 0 || !!vr.auditReport?.adjustmentIssues?.length },
      { label: "Validation Pipeline", done: vr.valid }
    ];
  }, [orchestrationPayload, adjustmentEntries]);

  const confidenceScore = useMemo(() => {
    const vr = orchestrationPayload.validationResult;
    let score = 100;
    if (!vr.valid) score -= 25;
    score -= Math.max(0, (vr.errors?.length || 0) * 6);
    score -= Math.max(0, (vr.warnings?.length || 0) * 1.5);
    score -= Math.max(0, (Object.keys(vr.auditReport?.mathIssues || {}).length || 0) * 1.5);
    score -= Math.max(0, (Object.keys(vr.auditReport?.physiologyIssues || {}).length || 0) * 2);
    score -= Math.max(0, adjustmentEntries.length * 2);
    score -= Math.max(0, (vr.auditReport?.adjustmentIssues?.length || 0) * 2.5);
    return Number(Math.max(0, Math.min(99.9, score)).toFixed(1));
  }, [orchestrationPayload, adjustmentEntries]);

  const automaticInsightsList = useMemo(() => {
    const insights: string[] = [];
    const vr = orchestrationPayload.validationResult;

    const bicepsInd = vr.volumeIndireto["Bíceps"] || vr.volumeIndireto[normalizeMuscleName("Bíceps")] || 0;
    if (bicepsInd > 8) {
      insights.push("Dorsais já suprem de forma muito expressiva a demanda do Bíceps (volume indireto alto).");
    }
    const tricepsInd = vr.volumeIndireto["Tríceps"] || vr.volumeIndireto[normalizeMuscleName("Tríceps")] || 0;
    if (tricepsInd > 8) {
      insights.push("Peitoral e Ombros já suprem significativamente a demanda do Tríceps, reduzindo necessidade de trabalho direto.");
    }

    const gluteosFat = vr.fatigueByMuscle["Glúteos"] || vr.fatigueByMuscle[normalizeMuscleName("Glúteos")] || 0;
    const gluteosLim = getFatigueLimit("Glúteos");
    if (gluteosFat > gluteosLim * 0.8) {
      insights.push("Os Glúteos estão operando próximos do limite fisiológico de fadiga. Evite adicionar isolados.");
    }

    const peitoralFat = vr.fatigueByMuscle["Peitoral"] || vr.fatigueByMuscle[normalizeMuscleName("Peitoral")] || 0;
    const peitoralLim = getFatigueLimit("Peitoral");
    if (peitoralFat < peitoralLim * 0.6) {
      insights.push("O Peitoral possui excelente margem de recuperação e fadiga local para progressão de volume.");
    }

    if (vr.valid) {
      insights.push("O plano de treino está altamente equilibrado e nenhum músculo ultrapassou o limite fisiológico tolerado.");
    } else {
      insights.push("Existem pontos de sobrecarga local ou fadiga sistêmica elevada no planejamento atual.");
    }

    return insights;
  }, [orchestrationPayload]);

  const dynamicFatigueAlerts = useMemo(() => {
    const alerts: string[] = [];
    const vr = orchestrationPayload.validationResult;

    VOLUME_MUSCLES.forEach(m => {
      const ind = vr.volumeIndireto[m] || vr.volumeIndireto[normalizeMuscleName(m)] || 0;
      const eq = getEquivalenciaLocal(m);
      const indEff = ind * eq;
      const dir = vr.volumeDireto[m] || vr.volumeDireto[normalizeMuscleName(m)] || 0;
      const fat = vr.fatigueByMuscle[m] || vr.fatigueByMuscle[normalizeMuscleName(m)] || 0;
      const lim = getFatigueLimit(m);

      if (indEff > 3 && dir > 4) {
        const fatPct = Math.round((fat / lim) * 100);
        const suggestedDir = Math.max(1, Math.round((orchestrationPayload.dynamicValidationTarget[m] || 12) - 2));
        alerts.push(
          `Os ${m} já receberam o equivalente a ${indEff.toFixed(1)} séries através de exercícios compostos. Adicionar mais ${dir} séries diretas elevará a fadiga local para ${fatPct}% do limite semanal de ${lim} séries. Sugestão: reduzir para ${suggestedDir} séries diretas.`
        );
      }
    });

    return alerts;
  }, [orchestrationPayload]);

  const isSafeForTechnique = (exerciseName: string): boolean => {
    const lowerName = exerciseName.toLowerCase();
    const highRiskKeywords = [
      "agachamento livre", 
      "deadlift", 
      "levantamento terra", 
      "stiff", 
      "remada curvada", 
      "good morning", 
      "military press", 
      "militar",
      "squat"
    ];
    return !highRiskKeywords.some(kw => lowerName.includes(kw));
  };

const INTENSIFICACAO_POOL = [
  { nome: "Drop set", instrucao: "Ao falhar, reduza 20-30% da carga e continue até nova falha." },
  { nome: "Rest-pause", instrucao: "Vá até a falha, descanse 10-20s e faça mais reps. Repita 2-3x." },
  { nome: "FST-7", instrucao: "Faça 7 séries de 8-12 reps com apenas 30s de descanso." },
  { nome: "Myo-reps", instrucao: "Ativação de 12-20 reps, descanse 5-10s, faça 3-5 reps por 4-5x." },
  { nome: "Double drop set", instrucao: "Duas reduções de carga consecutivas sem descanso." },
];

const EXECUCAO_POOL = [
  { nome: "Tempo controlado", instrucao: "Cadência 3-1-3 (3s descida, 1s pausa, 3s subida)." },
  { nome: "Pico de contração", instrucao: "Segure 2s no topo do movimento contraindo fortemente." },
  { nome: "Excêntrica lenta", instrucao: "Desça o peso em 4-5 segundos, controlando totalmente." },
];

const AMPLITUDE_POOL = [
  { nome: "Alongamento carregado", instrucao: "Segure 15-30s na posição de máximo alongamento." },
  { nome: "Amplitude completa", instrucao: "Vá do alongamento máximo até a contração máxima." },
];

  const applyTechniqueToLastSafeExercise = (exercisesList: Exercise[], muscleGroup: string): { updatedList: Exercise[]; modified: boolean } => {
    // Find all exercises belonging to this muscle group
    const muscleExIndexes = exercisesList.map((ex, idx) => ({ ex, idx })).filter(({ ex }) => {
      const isMusc = ex.category === "musculacao" || !ex.category;
      if (!isMusc) return false;
      return getExercisePrimaryGroup(ex) === muscleGroup;
    });

    if (muscleExIndexes.length === 0) return { updatedList: exercisesList, modified: false };

    // Find the last safe exercise index among them
    let targetIdx = -1;
    let targetMatch: MusculacaoExercise | null = null;
    for (let i = muscleExIndexes.length - 1; i >= 0; i--) {
      const { ex, idx } = muscleExIndexes[i];
      if (isSafeForTechnique(ex.name)) {
        targetIdx = idx;
        targetMatch = findExerciseMatch(ex.name);
        break;
      }
    }

    // If no safe exercise found, return unchanged
    if (targetIdx === -1) return { updatedList: exercisesList, modified: false };

    const targetEx = exercisesList[targetIdx];
    
    const allTechNames = [
      ...INTENSIFICACAO_POOL, ...EXECUCAO_POOL, ...AMPLITUDE_POOL
    ].map(t => t.nome.toLowerCase());

    const hasTechnique = allTechNames.some(name =>
      (targetEx.notes || "").toLowerCase().includes(name)
    );
    if (hasTechnique) return { updatedList: exercisesList, modified: false };

    // Escolhe o pool certo conforme o tipo do exercício
    let pool = EXECUCAO_POOL;
    if (targetMatch?.tipo === "Isolado") {
      pool = INTENSIFICACAO_POOL;
    }
    const selectedTech = pool[targetIdx % pool.length];
    
    const copy = [...exercisesList];
    const oldNotes = targetEx.notes ? targetEx.notes.trim() : "";
    const techNotes = `${selectedTech.nome} — ${selectedTech.instrucao}`;
    copy[targetIdx] = {
      ...targetEx,
      notes: oldNotes ? `${oldNotes} | ${techNotes}` : techNotes
    };

    return { updatedList: copy, modified: true };
  };

  const isMuscleGroupCompatibleWithWorkout = (muscle: string, workoutExercises: Exercise[]): boolean => {
    if (workoutExercises.length === 0) return true;

    // 1. Direct match: if the muscle is already trained directly in this workout
    const hasDirect = workoutExercises.some(ex => getExercisePrimaryGroup(ex) === muscle);
    if (hasDirect) return true;

    // 2. Synergetic relation: e.g. chest day contains triceps/shoulders synergists
    const hasSynergistRelation = workoutExercises.some(ex => {
      const synergists = getExerciseSinergistas(ex);
      return synergists.includes(muscle);
    });
    if (hasSynergistRelation) return true;

    // 3. Structural split check (Upper vs. Lower Body)
    const upperBodyMuscles = ["Peitoral", "Costas", "Ombros", "Bíceps", "Tríceps"];
    const lowerBodyMuscles = ["Quadríceps", "Posteriores de Coxa", "Glúteos", "Panturrilhas", "Adutores"];

    const isTargetUpper = upperBodyMuscles.includes(muscle);
    const isTargetLower = lowerBodyMuscles.includes(muscle);

    if (!isTargetUpper && !isTargetLower) return true; // Core is fine anywhere

    let upperCount = 0;
    let lowerCount = 0;
    workoutExercises.forEach(ex => {
      const primary = getExercisePrimaryGroup(ex);
      if (primary) {
        if (upperBodyMuscles.includes(primary)) {
          upperCount++;
        } else if (lowerBodyMuscles.includes(primary)) {
          lowerCount++;
        }
      }
    });

    if (upperCount === 0 && lowerCount === 0) return true;

    if (isTargetUpper && lowerCount > 0 && upperCount === 0) {
      // Leg day! Do not add upper body exercises to leg day
      return false;
    }
    if (isTargetLower && upperCount > 0 && lowerCount === 0) {
      // Upper body day! Do not add leg exercises to upper body day
      return false;
    }

    return true;
  };

  const adjustMuscleGroupInList = (exs: Exercise[], muscle: string, min: number, max: number): { updatedList: Exercise[]; modified: boolean } => {
    // Verificar se o músculo é compatível com o foco deste treino
    if (!isMuscleGroupCompatibleWithWorkout(muscle, exs)) {
      return { updatedList: exs, modified: false };
    }

    const isAiPreview = exs.some(ex => ex.id && String(ex.id).startsWith("ex-ai-preview"));
    const others = isAiPreview ? [] : workouts
      .filter(w => w.studentId === activeStudentId && w.id !== activeWorkout?.id)
      .flatMap(w => w.exercises || []);
    
    const stats = getVolumeStatsForExercises([...others, ...exs]);
    const mStat = stats[muscle];
    if (!mStat) return { updatedList: exs, modified: false };

    let result = { updatedList: exs, modified: false };
    const minDiretoObrigatorio = min * 0.65;

    // PRIORIDADE 1: Garantir que o Volume Direto bata os 65% da meta
    if (mStat.direto < minDiretoObrigatorio) {
      // 1.1 Tentar incrementar séries de um exercício direto existente que tenha menos de 5 séries (isolador ou composto)
      const existingDirectIndex = exs.findIndex(ex => {
        return getExercisePrimaryGroup(ex) === muscle && ex.sets < 5;
      });

      if (existingDirectIndex !== -1) {
        const copy = [...exs];
        copy[existingDirectIndex] = { ...copy[existingDirectIndex], sets: copy[existingDirectIndex].sets + 1 };
        result = { updatedList: copy, modified: true };
      } else {
        // 1.2 Tentar adicionar um novo exercício isolador não utilizado
        const availableIsolators = fullMusculacaoExercises.filter(f => f.grupo === muscle && f.tipo === "Isolado" && !f.desativado);
        let chosenExercise = availableIsolators.find(f => !exs.some(ex => {
          const match = findExerciseMatch(ex.name);
          return match?.nome === f.nome || ex.name.toLowerCase() === f.nome.toLowerCase();
        }));

        // 1.3 Se não achar isolador disponível, tentar qualquer exercício (inclusive composto) do mesmo grupo
        if (!chosenExercise) {
          const allGroupExercises = fullMusculacaoExercises.filter(f => f.grupo === muscle && !f.desativado);
          chosenExercise = allGroupExercises.find(f => !exs.some(ex => {
            const match = findExerciseMatch(ex.name);
            return match?.nome === f.nome || ex.name.toLowerCase() === f.nome.toLowerCase();
          }));
        }

        if (chosenExercise) {
          const siblingEx = exs.find(ex => {
            return getExercisePrimaryGroup(ex) === muscle && ex.division;
          });
          const targetDivision = siblingEx ? siblingEx.division : (exs[0]?.division || "A");

          const newEx: Exercise = {
            id: `ex-${Date.now()}-${Math.random()}`,
            name: chosenExercise.nome,
            sets: 3,
            reps: chosenExercise.reps || "10-12",
            weight: 10,
            category: "musculacao",
            division: targetDivision,
            muscleGroup: muscle
          };
          result = { updatedList: [...exs, newEx], modified: true };
        } else {
          // 1.4 Se todos os exercícios possíveis já estão na lista, aumentar séries de qualquer um do grupo até 8 séries
          const finalIndex = exs.findIndex(ex => {
            return getExercisePrimaryGroup(ex) === muscle && ex.sets < 8;
          });
          if (finalIndex !== -1) {
            const copy = [...exs];
            copy[finalIndex] = { ...copy[finalIndex], sets: copy[finalIndex].sets + 1 };
            result = { updatedList: copy, modified: true };
          }
        }
      }
    } 
    // PRIORIDADE 2: Ajustar Volume Total se estiver abaixo do mínimo do mesociclo
    else if (mStat.total < min) {
      // 2.1 Tentar incrementar séries de um exercício direto do grupo que tenha menos de 5 séries
      const existingIndex = exs.findIndex(ex => {
        return getExercisePrimaryGroup(ex) === muscle && ex.sets < 5;
      });

      if (existingIndex !== -1) {
        const copy = [...exs];
        copy[existingIndex] = { ...copy[existingIndex], sets: copy[existingIndex].sets + 1 };
        result = { updatedList: copy, modified: true };
      } else {
        // 2.2 Tentar adicionar qualquer novo exercício deste grupo muscular
        const available = fullMusculacaoExercises.filter(f => f.grupo === muscle && !f.desativado);
        const chosenExercise = available.find(f => !exs.some(ex => {
          const match = findExerciseMatch(ex.name);
          return match?.nome === f.nome || ex.name.toLowerCase() === f.nome.toLowerCase();
        }));

        if (chosenExercise) {
          const siblingEx = exs.find(ex => {
            return getExercisePrimaryGroup(ex) === muscle && ex.division;
          });
          const targetDivision = siblingEx ? siblingEx.division : (exs[0]?.division || "A");

          const newEx: Exercise = {
            id: `ex-${Date.now()}-${Math.random()}`,
            name: chosenExercise.nome,
            sets: 3,
            reps: chosenExercise.reps || "8-12",
            weight: 10,
            category: "musculacao",
            division: targetDivision,
            muscleGroup: muscle
          };
          result = { updatedList: [...exs, newEx], modified: true };
        } else {
          // 2.3 Incrementar séries de exercícios de sinergia indireta que atuam como compostos
          const indirectIndex = exs.findIndex(ex => {
            return getExerciseSinergistas(ex).includes(muscle) && ex.sets < 5;
          });
          if (indirectIndex !== -1) {
            const copy = [...exs];
            copy[indirectIndex] = { ...copy[indirectIndex], sets: copy[indirectIndex].sets + 1 };
            result = { updatedList: copy, modified: true };
          } else {
            // 2.4 Forçar incremento em qualquer um do grupo até 8 séries
            const finalIndex = exs.findIndex(ex => {
              return getExercisePrimaryGroup(ex) === muscle && ex.sets < 8;
            });
            if (finalIndex !== -1) {
              const copy = [...exs];
              copy[finalIndex] = { ...copy[finalIndex], sets: copy[finalIndex].sets + 1 };
              result = { updatedList: copy, modified: true };
            }
          }
        }
      }
    } 
    // PRIORIDADE 3: Ajustar se o volume total estiver acima da meta máxima (Excesso de volume)
    else if (mStat.total > max) {
      // Procurar um exercício direto do grupo para reduzir/remover
      const existingIndex = exs.findIndex(ex => {
        return getExercisePrimaryGroup(ex) === muscle;
      });

      if (existingIndex !== -1) {
        const copy = [...exs];
        if (copy[existingIndex].sets > 1) {
          copy[existingIndex] = { ...copy[existingIndex], sets: copy[existingIndex].sets - 1 };
          result = { updatedList: copy, modified: true };
        } else {
          // Só remove se não for o único exercício do grupo, ou se tivermos que reduzir mesmo assim
          copy.splice(existingIndex, 1);
          result = { updatedList: copy, modified: true };
        }
      } else {
        // Se não tiver exercício direto, reduzir séries de um exercício sinergista (composto)
        const indirectIndex = exs.findIndex(ex => {
          return getExerciseSinergistas(ex).includes(muscle) && ex.sets > 1;
        });
        if (indirectIndex !== -1) {
          const copy = [...exs];
          copy[indirectIndex] = { ...copy[indirectIndex], sets: copy[indirectIndex].sets - 1 };
          result = { updatedList: copy, modified: true };
        }
      }
    }

    // OBRIGATÓRIO: Aplicar técnica avançada se o volume for alto (20+)
    if (min >= 20 || max >= 20) {
      const { updatedList: listWithTech, modified: techModified } = applyTechniqueToLastSafeExercise(result.updatedList, muscle);
      if (techModified) {
        result = { updatedList: listWithTech, modified: true };
      }
    }

    return result;
  };

  const handleAdjustNext = () => {
    const min = activeMesocycleVolume.min;
    const max = activeMesocycleVolume.max;
    if (min === 0 && max === 0) {
      showNotification("Selecione um mesociclo com volume alvo nas configurações para poder ajustar.", "warning", "Mesociclo Não Configurado");
      return;
    }

    // Encontra todos os grupos musculares fora da faixa do mesociclo
    const outOfBoundsMuscles = Object.keys(volumeStats).filter(m => {
      const s = volumeStats[m];
      return s.total < min || s.total > max;
    });

    if (outOfBoundsMuscles.length === 0) {
      showNotification("Todos os grupos musculares já estão dentro da faixa do mesociclo!", "success", "Análise Concluída");
      return;
    }

    // Tenta ajustar um deles na lista atual (o primeiro que for possível modificar)
    let adjustedResult: { updatedList: Exercise[]; modified: boolean } | null = null;
    let successfullyAdjustedMuscle: string | null = null;

    for (const muscle of outOfBoundsMuscles) {
      const res = adjustMuscleGroupInList(exercises, muscle, min, max);
      if (res.modified) {
        adjustedResult = res;
        successfullyAdjustedMuscle = muscle;
        break; // Ajustou um com sucesso!
      }
    }

    if (!adjustedResult || !successfullyAdjustedMuscle) {
      // Se não conseguiu ajustar nenhum automaticamente
      const muscleList = outOfBoundsMuscles.join(", ");
      showNotification(
        `Não foi possível ajustar automaticamente os seguintes grupos fora da faixa neste treino: ${muscleList}.\n\n` +
        `Isso ocorre porque estes grupos pertencem a uma divisão muscular incompatível com este treino (ex: adicionar pernas em um treino superior), não possuem exercícios diretos aqui, ou a sobreposição vem de outros treinos da semana.\n\n` +
        `Por favor, abra o treino correspondente ao grupo que deseja ajustar e faça o ajuste a partir dele.`,
        "warning",
        "Ajuste Indisponível"
      );
      return;
    }

    // Salva o ajuste
    if (onAdjustExercises) {
      onAdjustExercises(adjustedResult.updatedList);
    } else {
      setInternalExercises(adjustedResult.updatedList);
      onSaveWorkout(activeStudentId, activeWorkout?.name || "Treino Integrado de Alta Performance", adjustedResult.updatedList);
    }

    // Sucesso!
    showNotification(
      `O volume do grupo ${successfullyAdjustedMuscle} foi ajustado automaticamente para se aproximar da meta de ${min}-${max} séries semanais.`,
      "success",
      `Ajustado com Sucesso: ${successfullyAdjustedMuscle}`
    );
  };

  const handleAdjustAll = () => {
    const min = activeMesocycleVolume.min;
    const max = activeMesocycleVolume.max;
    
    if (min === 0 && max === 0) {
      showNotification("Selecione um mesociclo com volume alvo nas configurações para poder ajustar.", "warning", "Mesociclo Não Configurado");
      return;
    }

    let currentList = [...exercises];
    let totalAdjustments = 0;
    let iterations = 0;
    const maxIterations = 50; // limite de segurança para evitar loops infinitos

    while (iterations < maxIterations) {
      const isAiPreview = currentList.some(ex => ex.id && String(ex.id).startsWith("ex-ai-preview"));
      const others = isAiPreview ? [] : workouts
        .filter(w => w.studentId === activeStudentId && w.id !== activeWorkout?.id)
        .flatMap(w => w.exercises || []);
      const currentStats = getVolumeStatsForExercises([...others, ...currentList]);
      
      // Encontra todos os grupos fora da faixa
      const outOfBounds = Object.keys(currentStats).filter(m => {
        const s = currentStats[m];
        return s.total < min || s.total > max;
      });

      if (outOfBounds.length === 0) {
        break; // todos na faixa!
      }

      // Tenta ajustar o primeiro grupo fora de faixa que for possível modificar
      let anyAdjustmentMade = false;
      for (const muscle of outOfBounds) {
        const { updatedList, modified } = adjustMuscleGroupInList(currentList, muscle, min, max);
        if (modified) {
          currentList = updatedList;
          anyAdjustmentMade = true;
          totalAdjustments++;
          break; // sai do loop de grupos para recalcular os stats com a nova lista na próxima iteração
        }
      }

      // Se passou por todos os grupos fora de faixa e nenhum pôde ser ajustado, paramos
      if (!anyAdjustmentMade) {
        break;
      }

      iterations++;
    }

    if (totalAdjustments > 0) {
      if (onAdjustExercises) {
        onAdjustExercises(currentList);
      } else {
        setInternalExercises(currentList);
        onSaveWorkout(activeStudentId, activeWorkout?.name || "Treino Integrado de Alta Performance", currentList);
      }
      showNotification(
        `Realizados ${totalAdjustments} ajustes de séries em exercícios para equilibrar os grupos musculares com o mesociclo (${min}-${max} séries).`,
        "success",
        "Ajuste em Massa Concluído"
      );
    } else {
      showNotification(
        "Nenhum grupo muscular pôde ser ajustado automaticamente.\n\n" +
        "Isso ocorre quando os excessos de volume vêm de outros treinos salvos na semana ou " +
        "de sinergias indiretas (exercícios compostos) que não podem ser reduzidas mais sem remover o exercício.",
        "warning",
        "Nenhum Ajuste Possível"
      );
    }
  };

  const progressionData = useMemo(() => {
    if (!currentStudent) return [];
    const nameVal = currentStudent.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseVol = 10 + (nameVal % 15);
    return [
      { name: "Sem 1", volume: Math.round(baseVol * 0.8) },
      { name: "Sem 2", volume: Math.round(baseVol * 0.9) },
      { name: "Sem 3", volume: Math.round(baseVol * 1.0) },
      { name: "Sem 4", volume: Math.round(baseVol * 1.1) },
      { name: "Sem 5", volume: Math.round(baseVol * 1.2) },
      { name: "Sem 6", volume: Math.round(baseVol * 0.7) },
    ];
  }, [currentStudent]);

    const wellBeingData = useMemo(() => {
    if (!currentStudent) return [];
    const nameVal = currentStudent.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const startWell = 60 + (nameVal % 30);
    return [
      { name: "Sem 1", "Disposição": Math.min(100, Math.round(startWell)), "Fadiga": Math.round(100 - startWell), "Dor": Math.round(100 - startWell + 10) },
      { name: "Sem 2", "Disposição": Math.min(100, Math.round(startWell + 5)), "Fadiga": Math.round(100 - startWell - 2), "Dor": Math.round(100 - startWell + 5) },
      { name: "Sem 3", "Disposição": Math.min(100, Math.round(startWell + 10)), "Fadiga": Math.round(100 - startWell + 5), "Dor": Math.round(100 - startWell + 15) },
      { name: "Sem 4", "Disposição": Math.min(100, Math.round(startWell + 2)), "Fadiga": Math.round(100 - startWell + 15), "Dor": Math.round(100 - startWell + 20) },
      { name: "Sem 5", "Disposição": Math.min(100, Math.round(startWell - 5)), "Fadiga": Math.round(100 - startWell + 22), "Dor": Math.round(100 - startWell + 25) },
      { name: "Sem 6", "Disposição": Math.min(100, Math.round(startWell + 15)), "Fadiga": Math.round(100 - startWell - 10), "Dor": Math.round(100 - startWell - 5) },
    ];
  }, [currentStudent]);

  // [NOVO] Motor de Alerta de Fadiga de Sinergistas
  const synergistWarnings = useMemo(() => {
    const warnings: string[] = [];
    Object.keys(weeklyVolumeStats).forEach(muscle => {
      const stats = weeklyVolumeStats[muscle];
      if (stats.indireto >= 6.0) {
        const editingDirect = editingVolumeStats[muscle]?.direto || 0;
        if (editingDirect >= 4) {
          warnings.push(`⚠️ ALERTA DE FADIGA (${muscle}): Este músculo já recebeu ${stats.indireto.toFixed(1)} séries de fadiga indireta na semana. Adicionar ${editingDirect} séries diretas hoje pode estourar a recuperação. Considere reduzir.`);
        }
      }
    });
    return warnings;
  }, [weeklyVolumeStats, editingVolumeStats]);

  return (
    <div id="analise-view" className="space-y-6">

      {/* Toast Notification Container */}
      {toast && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg relative overflow-hidden animate-fade-in ${
          toast.type === "success" 
            ? "bg-[#00f2ff]/10 border-[#00f2ff]/30 text-white shadow-[0_0_15px_rgba(0,242,255,0.08)]" 
            : toast.type === "warning" 
            ? "bg-[#ffb200]/10 border-[#ffb200]/30 text-white shadow-[0_0_15px_rgba(255,178,0,0.08)]" 
            : "bg-[#ebb2ff]/10 border-[#ebb2ff]/30 text-white shadow-[0_0_15px_rgba(235,178,255,0.08)]"
        }`}>
          <div className="text-xl shrink-0 mt-0.5">
            {toast.type === "success" ? "✅" : toast.type === "warning" ? "⚠️" : "ℹ️"}
          </div>
          <div className="flex-1 font-mono text-xs">
            {toast.title && <p className={`font-extrabold uppercase tracking-wider mb-1 ${
              toast.type === "success" ? "text-[#00f2ff]" : toast.type === "warning" ? "text-[#ffb200]" : "text-[#ebb2ff]"
            }`}>{toast.title}</p>}
            <p className="leading-relaxed whitespace-pre-line text-[#b9cacb]">{toast.message}</p>
          </div>
          <button 
            type="button"
            onClick={() => setToast(null)}
            className="text-[#b9cacb] hover:text-white font-bold text-xs p-1 shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
                
      {/* View Header */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[#e3e2e4] tracking-tight">Análise de Performance</h2>
            <p className="text-[#b9cacb] text-sm">Controle de volume, sinergia muscular e indicadores de bem-estar.</p>
          </div>
        </div>
      )}

      {/* Select Student Banner */}
      {!hideHeader && (
        <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between bg-[#1f2022]/40">
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-[#00f2ff]" />
              <span className="font-mono text-xs font-semibold text-[#e3e2e4] uppercase tracking-wider">
                Atleta Selecionado:
              </span>
              <select
                value={activeStudentId}
                onChange={(e) => onSelectStudent(e.target.value)}
                className="bg-[#121315] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-1.5 rounded-lg text-xs font-mono outline-none transition-all cursor-pointer max-w-xs"
              >
                {students.length === 0 ? (
                  <option value="">Nenhum aluno cadastrado</option>
                ) : (
                  students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.currentPhase})
                    </option>
                  ))
                )}
              </select>
            </div>

            {studentWorkouts.length > 1 && (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
                <span className="font-mono text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Treino:
                </span>
                <select
                  value={activeWorkoutId || ""}
                  onChange={(e) => setActiveWorkoutId(e.target.value)}
                  className="bg-[#121315] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-1.5 rounded-lg text-xs font-mono outline-none transition-all cursor-pointer"
                >
                  {studentWorkouts.map((w, index) => (
                    <option key={w.id} value={w.id}>
                      {w.name || `Treino ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {currentStudent && (
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#b9cacb]">
              <span className="bg-[#00f2ff]/10 text-[#00dbe7] px-2 py-0.5 rounded border border-[#00f2ff]/20">
                {currentStudent.plan}
              </span>
              <span>Fase atual: <b>{currentStudent.currentPhase}</b></span>
            </div>
          )}
        </div>
      )}

      {currentStudent ? (
        exercises.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center border border-dashed border-[#3a494b]/30 bg-[#121315]/40 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#00f2ff]/10 flex items-center justify-center mx-auto border border-[#00f2ff]/20">
              <ClipboardList className="w-6 h-6 text-[#00f2ff]" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="font-extrabold text-sm text-[#e3e2e4] uppercase tracking-wider font-mono">
                Sem Treino Montado
              </h3>
              <p className="text-xs text-[#b9cacb] leading-relaxed">
                Não há nenhum exercício adicionado ou treino sendo editado para este aluno. 
                Monte uma planilha ou carregue o treino salvo para gerar a análise científica de volume.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
          
          {/* Seção: Análise de Volume */}
          <div 
            className="glass-panel rounded-xl p-6 space-y-6 border-t-4 border-[#ebb2ff]"
            style={{ width: "852.927px", paddingLeft: "21px", marginLeft: "-8px", paddingRight: "14px" }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3a494b]/20 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#e3e2e4] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#ebb2ff]" /> Painel Científico de Volume (TREINOPRO)
                </h3>
                <p className="text-xs font-mono text-[#b9cacb] mt-1">
                  Volume fisiológico calibrado automaticamente com base na sinergia e gestão de fadiga.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-[#121315]/80 px-4 py-2 rounded-lg border border-[#3a494b]/20">
                <span className="text-[10px] font-mono text-[#b9cacb] uppercase">Alvo Atual:</span>
                <span className="text-xs font-mono font-extrabold text-white bg-[#00f2ff]/10 px-2 py-0.5 rounded border border-[#00f2ff]/20">
                  {activeMesocycleVolume.text} séries
                </span>
              </div>
            </div>

            {/* PAINEL EXECUTIVO (REGRA 10) */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
              <div className="bg-[#121315]/80 p-5 rounded-xl border border-[#3a494b]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#b9cacb]">Score Geral Explicável</span>
                    <h2 className="text-xl font-extrabold text-white mt-1 uppercase tracking-tight">Science-Backed</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-[#00f2ff]">{executiveMetrics.overall}/100</div>
                    <div className="text-[10px] font-mono text-[#b9cacb] uppercase">Score Geral</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: 'Volume', value: executiveMetrics.volume, color: 'bg-[#ebb2ff]', tone: 'text-[#ebb2ff]' },
                    { label: 'Recuperação', value: executiveMetrics.recovery, color: 'bg-emerald-400', tone: 'text-emerald-400' },
                    { label: 'Fadiga', value: executiveMetrics.fatigue, color: 'bg-amber-400', tone: 'text-amber-400' },
                    { label: 'Sinergias', value: executiveMetrics.synergy, color: 'bg-[#00f2ff]', tone: 'text-[#00f2ff]' },
                    { label: 'Distribuição', value: executiveMetrics.distribution, color: 'bg-cyan-500', tone: 'text-cyan-500' }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setSelectedTrace({
                        title: item.label,
                        value: `${item.value}%`,
                        source: `executiveMetrics.${item.label.toLowerCase()}`,
                        explanation: `Interpretado a partir do payload recebido pelo motor para ${item.label.toLowerCase()}.`,
                        rule: `Visualização clínica de ${item.label.toLowerCase()}`
                      })}
                      className="rounded-lg border border-[#3a494b]/20 bg-[#161719] p-3 text-left hover:border-[#00f2ff]/40 transition-all"
                    >
                      <div className="text-[9px] font-mono uppercase text-[#b9cacb]">{item.label}</div>
                      <div className={`text-lg font-black ${item.tone}`}>{item.value}%</div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-[#121315]/80 p-4 rounded-xl border border-[#3a494b]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#b9cacb]">Confiança da Prescrição</div>
                      <div className="text-2xl font-black text-emerald-400">{confidenceScore}%</div>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="mt-2 text-[10px] text-[#b9cacb] font-mono leading-relaxed">
                    Calculada a partir de valid, auditReport, ajustes e convergência observados no payload do motor.
                  </div>
                </div>
                <div className="bg-[#121315]/80 p-4 rounded-xl border border-[#3a494b]/20">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#b9cacb]">Tendência</div>
                  <div className="mt-2 text-[11px] text-[#e3e2e4] font-mono leading-relaxed">
                    {trendSummary.available ? 'Comparação com treino anterior disponível.' : trendSummary.message}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="bg-[#121315]/70 p-4 rounded-xl border border-[#3a494b]/20">
                <div className="flex items-center gap-2 text-[#00f2ff] text-[10px] font-mono uppercase tracking-wider"><Layers3 className="w-4 h-4" /> Linha Temporal do Processo</div>
                <div className="mt-3 space-y-2">
                  {timelineSteps.map((step) => (
                    <div key={step.label} className="flex items-center gap-2 text-[10px] text-[#b9cacb]">
                      <span className={step.status === 'concluída' ? 'text-emerald-400' : step.status === 'ajustada' ? 'text-amber-400' : 'text-rose-400'}>{step.status === 'concluída' ? '✓' : step.status === 'ajustada' ? '⚠' : '✖'}</span>
                      <span className="font-bold text-white">{step.label}</span>
                      <span className="text-[#b9cacb]">{step.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#121315]/70 p-4 rounded-xl border border-[#3a494b]/20">
                <div className="flex items-center gap-2 text-[#00f2ff] text-[10px] font-mono uppercase tracking-wider"><Activity className="w-4 h-4" /> Consistência do Motor</div>
                <div className="mt-3 space-y-2">
                  {consistencyState.checks.map((check) => (
                    <div key={check.label} className="flex items-center justify-between rounded-lg border border-[#3a494b]/15 bg-[#161719] px-2 py-1.5">
                      <span className="text-[10px] text-[#b9cacb] font-mono">{check.label}</span>
                      <span className={`text-[10px] font-bold ${check.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{check.ok ? 'OK' : 'Falha'}</span>
                    </div>
                  ))}
                  {consistencyState.hasDivergence && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-[10px] text-amber-400 font-mono">Inconsistência detectada. Verificar payload do WorkoutOrchestrator.</div>
                  )}
                </div>
              </div>
              <div className="bg-[#121315]/70 p-4 rounded-xl border border-[#3a494b]/20">
                <div className="flex items-center gap-2 text-[#00f2ff] text-[10px] font-mono uppercase tracking-wider"><AlertTriangle className="w-4 h-4" /> Auditoria Visual</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {auditChecks.map((check) => (
                    <div key={check.label} className="rounded-lg border border-[#3a494b]/15 bg-[#161719] px-2 py-2 text-[10px] text-[#b9cacb] font-mono flex items-center justify-between">
                      <span>{check.label}</span>
                      <span className={check.done ? 'text-emerald-400' : 'text-amber-400'}>{check.done ? '✓' : '⚠'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ALERTAS DINÂMICOS DE GESTÃO DE FADIGA (REGRA 6) */}
            {dynamicFatigueAlerts.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                  <span>🚨</span> Alertas de Gestão de Fadiga (Sinergistas Fisiológicos)
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {dynamicFatigueAlerts.map((warn, idx) => (
                    <li key={idx} className="text-[11px] text-white/90 font-mono leading-relaxed">{warn}</li>
                  ))}
                </ul>
              </div>
            )}
                  
            {/* TABELA DE ANÁLISE DE VOLUME FISIOLÓGICO */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#3a494b]/20 text-[#b9cacb] uppercase tracking-wider text-[9px]">
                    <th className="py-3 px-3">Músculo</th>
                    <th className="py-3 px-3 text-center">Alvos (Orig/Ajust)</th>
                    <th className="py-3 px-3 text-center">Volume Direto</th>
                    <th className="py-3 px-3 text-center">Volume Indireto</th>
                    <th className="py-3 px-3 text-center">Volume Efetivo</th>
                    <th className="py-3 px-3">Progresso vs Ajustado</th>
                    <th className="py-3 px-3 text-center">Fadiga</th>
                    <th className="py-3 px-3 text-center">Recuperação</th>
                    <th className="py-3 px-3 text-center">Reserva</th>
                    <th className="py-3 px-3 text-center">Ajuste</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3a494b]/10">
                  {rankedMuscles.map((item) => {
                    const muscle = item.muscle;
                    const vr = orchestrationPayload.validationResult;
                    const direct = item.direct;
                    const indirect = item.indirect;
                    const eqValue = getEquivalenciaLocal(muscle);
                    const effective = item.effective;
                    const originalTarget = orchestrationPayload.targetVolume[muscle] || 0;
                    const adjustedTarget = item.adjustedTarget || originalTarget;
                    const fatigue = item.fatigue;
                    const fatigueLimit = getFatigueLimit(muscle);
                    const { needed: recNeeded, available: recAvailable, ok: recOk } = getRecoveryDisplay(muscle);
                    const smartStatus = getSmartStatus(muscle, direct, indirect, effective, originalTarget, adjustedTarget, fatigue, fatigueLimit, recNeeded, recAvailable);
                    const fatiguePct = fatigueLimit > 0 ? (fatigue / fatigueLimit) * 100 : 0;
                    let fatigueColor = "text-emerald-400";
                    if (fatiguePct >= 95) fatigueColor = "text-rose-500 font-extrabold";
                    else if (fatiguePct >= 80) fatigueColor = "text-orange-400 font-bold";
                    else if (fatiguePct >= 60) fatigueColor = "text-amber-400";
                    const scaleRef = Math.max(adjustedTarget, effective, 1);
                    const directPct = (direct / scaleRef) * 100;
                    const indirectPct = ((indirect * eqValue) / scaleRef) * 100;
                    const totalPct = Math.round((effective / scaleRef) * 100);
                    const hasAdjustment = adjustedTarget < originalTarget;
                    let adjustmentReason = "—";
                    if (hasAdjustment) {
                      if (indirect > 6) adjustmentReason = "sinergia";
                      else if (fatigue > fatigueLimit * 0.9) adjustmentReason = "limite fadiga";
                      else if (!recOk) adjustmentReason = "recuperação";
                      else adjustmentReason = "fadiga sistêmica";
                    }
                    const volumeRemaining = Math.max(0, adjustedTarget - effective);
                    const fatigueRemaining = Math.max(0, fatigueLimit - fatigue);
                    const recoveryRemaining = Math.max(0, recNeeded - recAvailable);

                    return (
                      <tr key={muscle} className="hover:bg-[#1f2022]/20 transition-all"
                        onClick={() => setSelectedTrace({ title: muscle, value: `${effective.toFixed(1)} séries`, source: `validationResult.volumeEfetivo.${muscle}`, explanation: `Volume efetivo interpretado a partir do payload do motor`, rule: `Visualização clínica de ${muscle}` })}>
                        <td className="py-3 px-3 font-bold text-[#e3e2e4]">{muscle}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-[#b9cacb]">{originalTarget}</span>
                          <span className="text-[#3a494b] mx-1">/</span>
                          <span className="font-extrabold text-[#00f2ff]">{adjustedTarget}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-white">{direct}</td>
                        <td className="py-3 px-3 text-center text-[#b9cacb]">{indirect.toFixed(1)}</td>
                        <td className="py-3 px-3 text-center font-bold text-[#00f2ff]">{effective.toFixed(1)}</td>
                        <td className="py-3 px-3 w-40">
                          <div className="space-y-1">
                            <div className="h-2.5 w-full bg-[#121315]/80 rounded overflow-hidden flex border border-[#3a494b]/20 relative">
                              {direct > 0 && <div style={{ width: `${directPct}%` }} className="h-full bg-gradient-to-r from-[#00dbe7] to-[#00f2ff] shrink-0" />}
                              {indirect * eqValue > 0 && <div style={{ width: `${indirectPct}%` }} className="h-full bg-gradient-to-r from-[#ca87ff] to-[#ebb2ff] shrink-0" />}
                            </div>
                            <div className="flex justify-between text-[9px] text-[#b9cacb]">
                              <span>{totalPct}%</span>
                              <span className="font-mono text-[8px] uppercase tracking-wider text-[#ebb2ff]">Ajustado</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono"><span className={`${fatigueColor}`}>{fatigue.toFixed(1)}</span><span className="text-[#3a494b]/60 mx-1">/</span><span className="text-[#b9cacb]">{fatigueLimit}</span></td>
                        <td className="py-3 px-3 text-center"><div className="flex flex-col items-center justify-center gap-0.5"><span className="text-[10px] text-white">N: {recNeeded}h</span><span className={`text-[9px] ${recOk ? "text-emerald-400" : "text-rose-400 font-bold animate-pulse"}`}>D: {recAvailable === 96 ? "96h+" : `${recAvailable}h`}</span><span className={`inline-block px-1 py-0.2 rounded text-[7px] font-black tracking-wider uppercase ${recOk ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400 animate-bounce"}`}>{recOk ? "OK" : "Conflito"}</span></div></td>
                        <td className="py-3 px-3 text-center text-[10px] text-[#b9cacb]">
                          <div className="space-y-0.5">
                            <div>Volume +{volumeRemaining.toFixed(1)}</div>
                            <div>Fadiga {fatigueRemaining.toFixed(1)}</div>
                            <div>Rec. {recoveryRemaining}h</div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">{hasAdjustment ? <span className="inline-block px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-extrabold text-amber-400 uppercase tracking-wider">{adjustmentReason}</span> : <span className="text-[#3a494b]/40">—</span>}</td>
                        <td className="py-3 px-3 text-center"><span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-bold ${smartStatus.style}`}>{smartStatus.text}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[0.75fr_1.25fr] gap-4">
              <div className="bg-[#121315]/70 border border-[#3a494b]/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#00f2ff] text-[10px] font-mono uppercase tracking-wider"><Clock3 className="w-4 h-4" /> Decisões do Motor</div>
                {adjustmentEntries.length > 0 ? adjustmentEntries.map((entry) => (
                  <div key={`${entry.muscle}-${entry.rule}`} className="rounded-lg border border-[#3a494b]/15 bg-[#161719] p-3 text-[10px] text-[#b9cacb] leading-relaxed">
                    <div className="font-bold text-white">{entry.muscle}</div>
                    <div>{entry.before} séries ↓ {entry.after} séries</div>
                    <div className="text-amber-400">Motivo: {entry.reason}</div>
                    <div className="text-[#00f2ff]">Regra aplicada: {entry.rule}</div>
                  </div>
                )) : <div className="text-[10px] text-[#b9cacb] font-mono">Nenhum ajuste registrado no payload atual.</div>}
              </div>
              <div className="bg-[#121315]/70 border border-[#3a494b]/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#00f2ff] text-[10px] font-mono uppercase tracking-wider"><Sparkles className="w-4 h-4" /> Insights Inteligentes</div>
                <div className="grid gap-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400">Crítico</div>
                    <ul className="mt-2 space-y-1">{insightBuckets.critical.map((item) => <li key={item} className="text-[10px] text-[#b9cacb]">• {item}</li>)}</ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Atenção</div>
                    <ul className="mt-2 space-y-1">{insightBuckets.attention.map((item) => <li key={item} className="text-[10px] text-[#b9cacb]">• {item}</li>)}</ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Oportunidade</div>
                    <ul className="mt-2 space-y-1">{insightBuckets.opportunity.map((item) => <li key={item} className="text-[10px] text-[#b9cacb]">• {item}</li>)}</ul>
                  </div>
                </div>
              </div>
            </div>

            {selectedTrace && (
              <div className="rounded-xl border border-[#00f2ff]/25 bg-[#0f1113] p-4 text-[10px] text-[#b9cacb] font-mono space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#00f2ff] font-bold uppercase tracking-wider">Rastreabilidade</span>
                  <button type="button" onClick={() => setSelectedTrace(null)} className="text-[#b9cacb]">✕</button>
                </div>
                <div><span className="text-white">{selectedTrace.title}</span> — {selectedTrace.value}</div>
                <div>Origem: {selectedTrace.source}</div>
                <div>Explicação: {selectedTrace.explanation}</div>
                <div>Regra: {selectedTrace.rule}</div>
              </div>
            )}

            {/* EXPLICAÇÃO FISIOLÓGICA (REGRA 5) */}
            <div className="bg-[#121315]/60 border border-[#3a494b]/20 p-4 rounded-xl space-y-3">
              <h4 className="font-extrabold text-xs text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#ebb2ff]" /> Auditoria de Equivalência & Dedução de Sinergia
              </h4>
              <p className="text-[10.5px] text-[#b9cacb] leading-relaxed">
                Para evitar o overtraining de músculos menores, o motor calcula o <b>Volume Efetivo</b>. 
                Sempre que um grupo sinergista (e.g. Bíceps ou Tríceps) recebe assistência em exercícios compostos, 
                esse estímulo indireto é ponderado e subtraído da meta original, resultando na <b>Necessidade Direta Restante (Target Ajustado)</b>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="bg-[#1b1c1e]/60 p-3 rounded-lg border border-[#3a494b]/10 text-[10.5px] text-white">
                  <p className="font-bold text-[#ebb2ff] flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4 text-[#ebb2ff]" /> Equações de Equivalência de Sinergia:
                  </p>
                  <p className="text-[#b9cacb] mt-1 leading-normal font-mono text-[10px]">
                    • Bíceps / Tríceps / Ombros: <b>70%</b> (1 série indireta = 0,7 série direta)
                    <br />
                    • Posteriores de Coxa / Glúteos: <b>80%</b> (1 série indireta = 0,8 série direta)
                    <br />
                    • Core: <b>40%</b> | Adutores: <b>50%</b>
                  </p>
                </div>
                <div className="bg-[#1b1c1e]/60 p-3 rounded-lg border border-[#3a494b]/10 text-[10.5px] text-white flex flex-col justify-center">
                  <p className="font-bold text-[#00f2ff] font-mono text-[11px]">Exemplo Matemático (Bíceps):</p>
                  <p className="text-[#b9cacb] mt-1 leading-relaxed">
                    Target Original: 20 séries | Volume Indireto Recebido: 11.2 séries (Puxadas/Remadas)
                    <br />
                    → <b>Efetivo Indireto:</b> 11.2 × 70% = 7.84 séries
                    <br />
                    → <b>Target Ajustado:</b> 20 - 7.84 = 12.16 séries direct necessárias.
                  </p>
                </div>
              </div>
            </div>

            {/* SEÇÃO: INSIGHTS AUTOMÁTICOS FISIOLÓGICOS (REGRA 11) */}
            <div className="bg-[#1b1c1e]/40 border border-[#3a494b]/20 p-5 rounded-xl space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-white flex items-center gap-1.5 font-mono">
                <Zap className="w-4 h-4 text-amber-400" /> Diagnóstico Científico Automatizado
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {automaticInsightsList.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-[#121315]/40 p-2.5 rounded-lg border border-[#3a494b]/10">
                    <span className="text-emerald-400 shrink-0 text-xs">✓</span>
                    <span className="text-[11px] text-[#b9cacb] font-mono leading-normal">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AJUSTE PROGRESSIVO DE VOLUME */}
            <div className="bg-[#121315]/40 border border-[#3a494b]/20 p-5 rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-[#00f2ff] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#e3e2e4]">Ajuste Progressivo Fisiológico</h4>
                  <p className="text-[11px] text-[#b9cacb] mt-1 leading-relaxed">
                    Identifica os desvios e aplica a correção automática diretamente na planilha do atleta respeitando a fadiga limite.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2 pl-8">
                <button
                  type="button"
                  onClick={handleAdjustNext}
                  className="bg-[#00f2ff]/10 hover:bg-[#00f2ff] text-[#00f2ff] hover:text-black border border-[#00f2ff]/30 font-bold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" /> Ajustar Próximo Grupo
                </button>
                <button
                  type="button"
                  onClick={handleAdjustAll}
                  className="bg-[#ebb2ff]/10 hover:bg-[#ebb2ff] text-[#ebb2ff] hover:text-black border border-[#ebb2ff]/30 font-bold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" /> Ajustar Planilha Completa
                </button>
              </div>
            </div>
          </div>

            {/* Seção: Gráficos e Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
              {/* Gráfico 1: Volume Semanal por Grupo */}
              <div className="bg-[#121315]/60 border border-[#3a494b]/20 p-4 rounded-xl space-y-3">
                <h4 className="font-extrabold text-xs text-[#e3e2e4] flex items-center gap-1.5 uppercase font-mono tracking-wide">
                  <BarChart3 className="w-4 h-4 text-[#00f2ff]" /> Volume Semanal por Grupo
                </h4>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={VOLUME_MUSCLES.map(m => ({
                        name: m,
                        "Direto": volumeStats[m]?.direto || 0,
                        "Indireto": parseFloat((volumeStats[m]?.indireto || 0).toFixed(1))
                      }))}
                      margin={{ top: 10, right: 10, left: -25, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#3a494b/10" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#b9cacb', fontSize: 8 }} 
                        angle={-45} 
                        textAnchor="end" 
                        interval={0}
                      />
                      <YAxis tick={{ fill: '#b9cacb', fontSize: 8 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#121315', borderColor: 'rgba(58,73,75,0.4)', borderRadius: '8px', color: '#fff', fontSize: '10px', fontFamily: 'monospace' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', paddingTop: '10px' }}
                      />
                      <Bar dataKey="Direto" stackId="a" fill="#00f2ff" />
                      <Bar dataKey="Indireto" stackId="a" fill="#ebb2ff" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico 2: Evolução do Volume Total */}
              <div className="bg-[#121315]/60 border border-[#3a494b]/20 p-4 rounded-xl space-y-3">
                <h4 className="font-extrabold text-xs text-[#e3e2e4] flex items-center gap-1.5 uppercase font-mono tracking-wide">
                  <span>📈</span> Evolução do Volume Total
                  <span className="ml-1 text-[8px] normal-case font-normal text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    dados simulados
                  </span>
                </h4>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={progressionData}
                      margin={{ top: 15, right: 15, left: -25, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#3a494b/10" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#b9cacb', fontSize: 9 }} />
                      <YAxis tick={{ fill: '#b9cacb', fontSize: 9 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#121315', borderColor: 'rgba(58,73,75,0.4)', borderRadius: '8px', color: '#fff', fontSize: '10px', fontFamily: 'monospace' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        name="Volume Total (séries)" 
                        stroke="#ebb2ff" 
                        strokeWidth={2.5} 
                        dot={{ r: 4, stroke: '#ebb2ff', fill: '#121315', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico 3: Bem-estar ao Longo do Tempo */}
              <div className="bg-[#121315]/60 border border-[#3a494b]/20 p-4 rounded-xl space-y-3">
                <h4 className="font-extrabold text-xs text-[#e3e2e4] flex items-center gap-1.5 uppercase font-mono tracking-wide">
                  <span>😊</span> Bem-estar ao Longo do Tempo
                  <span className="ml-1 text-[8px] normal-case font-normal text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    dados simulados
                  </span>
                </h4>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={wellBeingData}
                      margin={{ top: 15, right: 15, left: -25, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id="colorDisp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3a494b/10" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#b9cacb', fontSize: 9 }} />
                      <YAxis tick={{ fill: '#b9cacb', fontSize: 9 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#121315', borderColor: 'rgba(58,73,75,0.4)', borderRadius: '8px', color: '#fff', fontSize: '10px', fontFamily: 'monospace' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Disposição" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorDisp)" 
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Fadiga" 
                        stroke="#ef4444" 
                        fillOpacity={1} 
                        fill="url(#colorFat)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        )
      ) : (
        <div className="glass-panel rounded-xl p-8 text-center text-[#b9cacb]">
          Nenhum atleta ativo selecionado. Crie um cadastro para iniciar.
        </div>
      )}

    </div>
  );
}
