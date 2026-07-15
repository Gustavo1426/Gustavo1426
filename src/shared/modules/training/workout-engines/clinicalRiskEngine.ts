/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { classifyExercise, AuditWorkout } from "./biomechanicalAudit";

export interface ClinicalRiskEvaluation {
  lumbarCompressionScore: number; // 0 to 100
  kneeFlexionScore: number;       // 0 to 100
  hipHingeScore: number;          // 0 to 100
  pushExcessScore: number;        // 0 to 100
  pullExcessScore: number;        // 0 to 100
  biomechanicalRedundancyScore: number; // 0 to 100
  
  overallRiskScore: number;       // average or weighted score
  overallRiskLevel: "Muito Baixo" | "Baixo" | "Moderado" | "Alto" | "Crítico";
  colorClass: string;
  glowClass: string;
  
  evaluations: {
    lumbarCompression: { status: string; value: number; description: string; advice: string };
    kneeFlexion: { status: string; value: number; description: string; advice: string };
    hipHinge: { status: string; value: number; description: string; advice: string };
    pushExcess: { status: string; value: number; description: string; advice: string };
    pullExcess: { status: string; value: number; description: string; advice: string };
    biomechanicalRedundancy: { status: string; value: number; description: string; advice: string };
  };
}

export class ClinicalRiskEngine {
  /**
   * Evaluates orthopedic and clinical risks of the training plan based on biomechanical loads.
   */
  public static evaluate(workouts: AuditWorkout[]): ClinicalRiskEvaluation {
    let lumbarCompressionSets = 0;
    let totalLowerSets = 0;
    
    let kneeFlexionSets = 0;
    let hipHingeSets = 0;
    
    let pushSets = 0;
    let pullSets = 0;
    
    let redundancyCount = 0;
    let totalExercises = 0;
    
    const patternMapInWorkout: Record<string, Record<string, string[]>> = {};

    workouts.forEach(wk => {
      const wkName = wk.name || "Treino";
      patternMapInWorkout[wkName] = {};
      const workoutExercises = wk.exercises || [];
      
      workoutExercises.forEach(ex => {
        totalExercises++;
        const sets = ex.sets || 4;
        const name = ex.name.toLowerCase();
        const cls = classifyExercise(ex.name, ex.muscleGroup);
        const mg = (ex.muscleGroup || "").toLowerCase();
        
        // 1. Lumbar compression triggers: Back squating, stiff leg deadlift, standard deadlift, barbell rows (remada curvada), standing presses.
        const causesCompression = 
          name.includes("agachamento livre") || 
          name.includes("agachamento costas") ||
          name.includes("back squat") ||
          name.includes("deadlift") || 
          name.includes("levantamento terra") || 
          name.includes("stiff") || 
          name.includes("remada curvada") || 
          name.includes("remada curvado") ||
          name.includes("bent over row") ||
          (name.includes("desenvolvimento") && name.includes("pé") && !name.includes("sentado"));
          
        if (causesCompression) {
          lumbarCompressionSets += sets;
        }
        
        const isLower = ["quadríceps", "quadriceps", "posteriores", "glúteos", "gluteos", "adutores"].some(g => mg.includes(g));
        if (isLower) {
          totalLowerSets += sets;
        }
        
        // 2. Knee flexion triggers: Squatting variations, leg presses, lunges, Bulgarian splits, knee extensions
        const isKneeFlexion = 
          name.includes("agachamento") || 
          name.includes("squat") || 
          name.includes("leg press") || 
          name.includes("hack") || 
          name.includes("extensora") || 
          name.includes("lunge") || 
          name.includes("avanço") || 
          name.includes("avanco") || 
          name.includes("búlgaro") || 
          name.includes("bulgarian") || 
          name.includes("passada");
          
        if (isKneeFlexion && cls.kneeHip === "Knee") {
          kneeFlexionSets += sets;
        }
        
        // 3. Hip hinge triggers: deadlifts, stiff, romanian deadlift, good mornings
        const isHinge = 
          name.includes("stiff") || 
          name.includes("deadlift") || 
          name.includes("terra") || 
          name.includes("romanian") || 
          name.includes("good morning") || 
          name.includes("hip hinge");
          
        if (isHinge && cls.kneeHip === "Hip") {
          hipHingeSets += sets;
        }
        
        // 4. Push vs Pull
        if (cls.pushPull === "Push") {
          pushSets += sets;
        } else if (cls.pushPull === "Pull") {
          pullSets += sets;
        }
        
        // 5. Biomechanical redundancy detection
        const pat = cls.pattern || "Outros";
        if (pat !== "Outros") {
          if (!patternMapInWorkout[wkName][pat]) {
            patternMapInWorkout[wkName][pat] = [];
          }
          patternMapInWorkout[wkName][pat].push(ex.name);
        }
      });
    });

    // Calculate redundancy metric
    Object.keys(patternMapInWorkout).forEach(wkName => {
      Object.keys(patternMapInWorkout[wkName]).forEach(pat => {
        const list = patternMapInWorkout[wkName][pat];
        if (list.length > 1) {
          redundancyCount += (list.length - 1);
        }
      });
    });

    // Score Calculations (0 to 100)
    
    // Lumbar compression score: safe up to 8 sets, moderately loaded up to 14 sets, high risk > 18 sets
    let lumbarCompressionScore = Math.round(Math.min(100, (lumbarCompressionSets / 20) * 100));
    if (lumbarCompressionSets === 0) lumbarCompressionScore = 0;

    // Knee flexion score: safe up to 12 sets, moderately loaded up to 18 sets, high risk > 24 sets
    let kneeFlexionScore = Math.round(Math.min(100, (kneeFlexionSets / 24) * 100));
    
    // Hip hinge score: safe up to 10 sets, moderately loaded up to 16 sets, high risk > 20 sets
    let hipHingeScore = Math.round(Math.min(100, (hipHingeSets / 20) * 100));

    // Push excess: extreme volume if pushSets > 24 or push-to-pull ratio > 1.4
    const pushPullTotal = pushSets + pullSets;
    const pushRatio = pushPullTotal > 0 ? pushSets / pushPullTotal : 0.5;
    let pushExcessScore = Math.round(Math.min(100, (pushSets / 28) * 60 + (pushRatio > 0.58 ? (pushRatio - 0.58) * 400 : 0)));
    if (pushSets === 0) pushExcessScore = 0;

    // Pull excess: extreme volume if pullSets > 24 or pull-to-push ratio > 1.4
    const pullRatio = pushPullTotal > 0 ? pullSets / pushPullTotal : 0.5;
    let pullExcessScore = Math.round(Math.min(100, (pullSets / 28) * 60 + (pullRatio > 0.58 ? (pullRatio - 0.58) * 400 : 0)));
    if (pullSets === 0) pullExcessScore = 0;

    // Biomechanical redundancy score: based on overlapping patterns
    let biomechanicalRedundancyScore = Math.round(Math.min(100, (redundancyCount / 4) * 100));

    // Ensure safe ranges
    lumbarCompressionScore = Math.max(0, Math.min(100, lumbarCompressionScore));
    kneeFlexionScore = Math.max(0, Math.min(100, kneeFlexionScore));
    hipHingeScore = Math.max(0, Math.min(100, hipHingeScore));
    pushExcessScore = Math.max(0, Math.min(100, pushExcessScore));
    pullExcessScore = Math.max(0, Math.min(100, pullExcessScore));
    biomechanicalRedundancyScore = Math.max(0, Math.min(100, biomechanicalRedundancyScore));

    // Overall Weighted Score
    const overallRiskScore = Math.round(
      lumbarCompressionScore * 0.2 +
      kneeFlexionScore * 0.2 +
      hipHingeScore * 0.15 +
      pushExcessScore * 0.15 +
      pullExcessScore * 0.1 +
      biomechanicalRedundancyScore * 0.2
    );

    let overallRiskLevel: "Muito Baixo" | "Baixo" | "Moderado" | "Alto" | "Crítico" = "Muito Baixo";
    let colorClass = "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    let glowClass = "shadow-[0_0_15px_rgba(16,185,129,0.15)]";

    if (overallRiskScore >= 75) {
      overallRiskLevel = "Crítico";
      colorClass = "text-red-400 border-red-500/20 bg-red-500/5";
      glowClass = "shadow-[0_0_15px_rgba(239,68,68,0.25)]";
    } else if (overallRiskScore >= 50) {
      overallRiskLevel = "Alto";
      colorClass = "text-amber-400 border-amber-500/20 bg-amber-500/5";
      glowClass = "shadow-[0_0_15px_rgba(245,158,11,0.2)]";
    } else if (overallRiskScore >= 30) {
      overallRiskLevel = "Moderado";
      colorClass = "text-[#ccff00] border-[#ccff00]/20 bg-[#ccff00]/5";
      glowClass = "shadow-[0_0_15px_rgba(204,255,0,0.15)]";
    } else if (overallRiskScore >= 12) {
      overallRiskLevel = "Baixo";
      colorClass = "text-[#00f2ff] border-[#00f2ff]/20 bg-[#00f2ff]/5";
      glowClass = "shadow-[0_0_15px_rgba(0,242,255,0.15)]";
    }

    // Individual detailed text
    const lumbarStatus = lumbarCompressionScore > 75 ? "Crítico" : lumbarCompressionScore > 50 ? "Alto" : lumbarCompressionScore > 25 ? "Moderado" : "Baixo";
    const lumbarCompression = {
      status: lumbarStatus,
      value: lumbarCompressionSets,
      description: `Carga axial na coluna vertebral calculada em ${lumbarCompressionSets} séries de alta compressão mecânica na semana.`,
      advice: lumbarCompressionScore > 50 
        ? "Recomenda-se substituir variações bilaterais livres (Ex: Agachamento Livre) por suportadas (Ex: Leg Press ou Hack) para poupar discos intervertebrais."
        : "Nível fisiológico de compressão seguro e estimulante para aumento de densidade óssea."
    };

    const kneeStatus = kneeFlexionScore > 75 ? "Crítico" : kneeFlexionScore > 50 ? "Alto" : kneeFlexionScore > 25 ? "Moderado" : "Baixo";
    const kneeFlexion = {
      status: kneeStatus,
      value: kneeFlexionSets,
      description: `Estresse de cisalhamento patelofemoral projetado em ${kneeFlexionSets} séries acumuladas de flexão de joelho na semana.`,
      advice: kneeFlexionScore > 55
        ? "Alta sobrecarga no ligamento patelar. Recomenda-se balancear com exercícios de flexão de quadril (Posteriores) e reduzir volume de agachamento."
        : "Estresse sob limiar adaptativo seguro para tendões e ligamentos cruzados."
    };

    const hipStatus = hipHingeScore > 75 ? "Crítico" : hipHingeScore > 50 ? "Alto" : hipHingeScore > 25 ? "Moderado" : "Baixo";
    const hipHinge = {
      status: hipStatus,
      value: hipHingeSets,
      description: `Volume acumulado de Hinge de Quadril de ${hipHingeSets} séries semanais.`,
      advice: hipHingeScore > 55
        ? "Alto risco de sobrecarga da musculatura eretora da espinha e isquiotibiais. Introduzir exercícios isolados sem carga na coluna."
        : "Tensão mecânica de estiramento segura para glúteos e posteriores."
    };

    const pushStatus = pushExcessScore > 75 ? "Crítico" : pushExcessScore > 50 ? "Alto" : pushExcessScore > 25 ? "Moderado" : "Baixo";
    const pushExcess = {
      status: pushStatus,
      value: pushSets,
      description: `Volume de empurrar totaliza ${pushSets} séries semanais (${Math.round(pushRatio * 100)}% da porção superior).`,
      advice: pushExcessScore > 60
        ? "Desequilíbrio de força postural. Risco de rotação interna de ombros. Adicione remadas e crucifixo invertido para manter razão de 1:1."
        : "Razão de empurrar está balanceada com os músculos antagonistas de puxar."
    };

    const pullStatus = pullExcessScore > 75 ? "Crítico" : pullExcessScore > 50 ? "Alto" : pullExcessScore > 25 ? "Moderado" : "Baixo";
    const pullExcess = {
      status: pullStatus,
      value: pullSets,
      description: `Volume de puxar totaliza ${pullSets} séries semanais (${Math.round(pullRatio * 100)}% da porção superior).`,
      advice: pullExcessScore > 60
        ? "Excesso de tração dorsal. Apesar de seguro posturalmente, pode gerar fadiga cumulativa no complexo articular do ombro anterior."
        : "Volume de puxar ótimo em consonância com a capacidade de estiramento escapular."
    };

    const redundancyStatus = biomechanicalRedundancyScore > 75 ? "Crítico" : biomechanicalRedundancyScore > 50 ? "Alto" : biomechanicalRedundancyScore > 25 ? "Moderado" : "Baixo";
    const biomechanicalRedundancy = {
      status: redundancyStatus,
      value: redundancyCount,
      description: `Identificados ${redundancyCount} sobreposições de vetores de força idênticas na mesma sessão.`,
      advice: biomechanicalRedundancyScore > 40
        ? "Desperdício energético devido a 'séries lixo'. Substitua exercícios repetitivos de mesma angulação por perfis de resistência complementares."
        : "Distribuição variada e eficiente de angulações e perfis de torque biomecânico."
    };

    return {
      lumbarCompressionScore,
      kneeFlexionScore,
      hipHingeScore,
      pushExcessScore,
      pullExcessScore,
      biomechanicalRedundancyScore,
      overallRiskScore,
      overallRiskLevel,
      colorClass,
      glowClass,
      evaluations: {
        lumbarCompression,
        kneeFlexion,
        hipHinge,
        pushExcess,
        pullExcess,
        biomechanicalRedundancy
      }
    };
  }
}
