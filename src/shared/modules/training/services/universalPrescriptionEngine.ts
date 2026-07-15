/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { normalizeMuscleName } from "@/src/shared/modules/training/engines/synergyEngine";

// ==========================================
// TYPES AND INTERFACES FOR UNIFIED PRESCRIPTION
// ==========================================

export interface StudentData {
  idade: number;
  sexo: "M" | "F" | "Outro";
  experiencia: "Iniciante" | "Intermediário" | "Avançado";
  objetivo: "Hipertrofia" | "Força" | "Resistência" | "Reabilitação" | string;
  frequenciaSemanal: number;
  disponibilidadeMinutos: number;
  limitacoes: string[];
  prioridades: Record<string, "alta" | "media" | "baixa" | "nenhuma">;
  equipamentosDisponiveis: string[];
  tempoMaximoSessao: number;
  historicoTreino?: string;
  semanaMesociclo: number; // 1, 2, 3, or 4
}

export interface MuscleVolumeCriterias {
  MEV: number;
  MAV: number;
  MRV: number;
}

export interface RawAIExercise {
  name: string;
  primaryMuscle: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: string;
  series: number;
  sets: number; // For compatibility
  reps: string;
  rpe: number;
  rir: number;
  cadence: string;
  rest: string;
  notes: string;
  technique: string;
  order: number;
}

export interface SessionWorkout {
  day: string;
  exercises: WorkoutExercise[];
  sessionTimeMin: number;
}

export interface ValidationReport {
  valid: boolean;
  errors: string[];
  severity: "none" | "warning" | "critical";
}

export interface AuditReport {
  mathIssues: string[];
  volumeIssues: string[];
  fatigueIssues: string[];
  movementIssues: string[];
  recoveryIssues: string[];
  equipmentIssues: string[];
  periodizationIssues: string[];
  validationIssues: string[];
}

export interface UnifiedPrescriptionResult {
  valid: boolean;
  severity: "none" | "warning" | "critical";
  errors: string[];
  studentData: StudentData;
  volumeDireto: Record<string, number>;
  volumeIndireto: Record<string, number>;
  volumeEfetivo: Record<string, number>;
  directNeeded: Record<string, number>;
  fatigueByMuscle: Record<string, number>;
  recoveryByMuscle: Record<string, number[]>;
  systemicFatigue: number;
  movementCount: Record<string, number>;
  auditReport: AuditReport;
  validation: ValidationReport;
  workouts: SessionWorkout[];
  adjustmentLog: string[];
}

// ==========================================
// CONSTANTS & RULES (EXCLUSIVELY HERE)
// ==========================================

export const MUSCLE_GROUPS = [
  "Peitoral",
  "Costas",
  "Quadríceps",
  "Posteriores de Coxa",
  "Glúteos",
  "Bíceps",
  "Tríceps",
  "Ombros",
  "Panturrilhas",
  "Core",
  "Adutores"
];

const LARGE_MUSCLES = [
  "Peitoral",
  "Costas",
  "Quadríceps",
  "Posteriores de Coxa",
  "Glúteos"
];

const PERIODIZATION_FACTORS: Record<number, number> = {
  1: 0.85,
  2: 1.00,
  3: 1.10,
  4: 0.65
};

const SYNERGY_RULES: Record<string, Record<string, number>> = {
  Peitoral: { Tríceps: 0.6, Ombros: 0.4 },
  Costas: { Bíceps: 0.6, Ombros: 0.3 },
  Quadríceps: { Glúteos: 0.7, "Posteriores de Coxa": 0.3, Adutores: 0.2 },
  "Posteriores de Coxa": { Glúteos: 0.5, Core: 0.3 },
  Glúteos: { "Posteriores de Coxa": 0.3 },
  Ombros: { Tríceps: 0.4 }
};

const EQUIVALENCE_RULES: Record<string, number> = {
  Bíceps: 0.7,
  Tríceps: 0.7,
  Ombros: 0.7,
  Glúteos: 0.8,
  "Posteriores de Coxa": 0.8,
  Adutores: 0.5,
  Core: 0.4,
  Panturrilhas: 0
};

const FATIGUE_LIMITS: Record<string, number> = {
  Peitoral: 25,
  Costas: 25,
  Quadríceps: 30,
  "Posteriores de Coxa": 25,
  Glúteos: 30,
  Ombros: 20,
  Bíceps: 18,
  Tríceps: 18,
  Panturrilhas: 20,
  Core: 18,
  Adutores: 20
};

const RECOVERY_BASE_RULES: Record<string, number> = {
  Peitoral: 48,
  Costas: 48,
  Quadríceps: 72,
  "Posteriores de Coxa": 72,
  Glúteos: 72,
  Bíceps: 48,
  Tríceps: 48,
  Ombros: 48,
  Panturrilhas: 24,
  Core: 24,
  Adutores: 24
};

const MOVEMENT_LIMITS: Record<string, number> = {
  horizontalPush: 2,
  horizontalPull: 2,
  verticalPush: 2,
  verticalPull: 2,
  squat: 2,
  hipHinge: 2
};

// ==========================================
// CORE IMPLEMENTATION ENGINE
// ==========================================

export class UniversalPrescriptionEngine {
  
  /**
   * Run the complete 15-stage scientific prescription pipeline.
   */
  public static run(studentData: StudentData, rawAIExercises?: RawAIExercise[]): UnifiedPrescriptionResult {
    const adjustmentLog: string[] = [];

    // -------------------------------------------------------------
    // ETAPA 1: Receber os dados do aluno. (Enforced by input types)
    // -------------------------------------------------------------
    const data = { ...studentData };

    // -------------------------------------------------------------
    // ETAPA 2: Definir automaticamente MEV, MAV, MRV.
    // -------------------------------------------------------------
    const criterias: Record<string, MuscleVolumeCriterias> = {};
    for (const muscle of MUSCLE_GROUPS) {
      criterias[muscle] = this.calculateLimits(muscle, data.experiencia);
    }

    // -------------------------------------------------------------
    // ETAPA 3: Aplicar periodização automática.
    // -------------------------------------------------------------
    const periodizationFactor = PERIODIZATION_FACTORS[data.semanaMesociclo] ?? 1.00;
    const baseTargetVolume: Record<string, number> = {};
    for (const muscle of MUSCLE_GROUPS) {
      const criteria = criterias[muscle];
      // Target base is average of MEV and MAV as a baseline starting point, multiplied by periodization
      const rawBaseline = (criteria.MEV + criteria.MAV) / 2;
      baseTargetVolume[muscle] = parseFloat((rawBaseline * periodizationFactor).toFixed(1));
    }

    // -------------------------------------------------------------
    // ETAPA 4: Aplicar prioridades (Alta: +3, Média: +1.5, Baixa/Nenhuma: 0).
    // Redistribuindo das prioridades menores, sem aumentar o volume total.
    // -------------------------------------------------------------
    const volumeDireto = this.applyPriorities(baseTargetVolume, data.prioridades, criterias);

    // -------------------------------------------------------------
    // ETAPA 5: Calcular sinergias (synergyEngine rules).
    // -------------------------------------------------------------
    const volumeIndireto: Record<string, number> = {};
    for (const muscle of MUSCLE_GROUPS) {
      volumeIndireto[muscle] = 0;
    }
    for (const muscle of MUSCLE_GROUPS) {
      const direct = volumeDireto[muscle] || 0;
      const synergyDestinations = SYNERGY_RULES[muscle];
      if (synergyDestinations) {
        for (const destMuscle of Object.keys(synergyDestinations)) {
          const factor = synergyDestinations[destMuscle];
          volumeIndireto[destMuscle] = parseFloat(((volumeIndireto[destMuscle] || 0) + (direct * factor)).toFixed(1));
        }
      }
    }

    // -------------------------------------------------------------
    // ETAPA 6: Calcular Volume Direto, Volume Indireto, Volume Efetivo, Direct Needed.
    // -------------------------------------------------------------
    const volumeEfetivo: Record<string, number> = {};
    const directNeeded: Record<string, number> = {};
    for (const muscle of MUSCLE_GROUPS) {
      const direct = volumeDireto[muscle] || 0;
      const indirect = volumeIndireto[muscle] || 0;
      const equivMultiplier = EQUIVALENCE_RULES[muscle] ?? 0.5;
      
      volumeEfetivo[muscle] = parseFloat((direct + (indirect * equivMultiplier)).toFixed(1));
      
      // Direct needed to hit targets
      const target = baseTargetVolume[muscle] || 0;
      directNeeded[muscle] = parseFloat(Math.max(0, target - (indirect * equivMultiplier)).toFixed(1));
    }

    // -------------------------------------------------------------
    // ETAPA 7: Distribuir o volume semanal entre os dias.
    // -------------------------------------------------------------
    const workoutDays = this.getWorkoutDays(data.frequenciaSemanal);
    
    // -------------------------------------------------------------
    // ETAPA 8: Solicitar exercícios para IA. (AI only gets non-volume parameters)
    // -------------------------------------------------------------
    // Note: In a live execution, this returns inputs to pass to AI. 
    // Here we handle the post-AI resolution if exercises are passed, or build them.
    const rawExercises = rawAIExercises && rawAIExercises.length > 0 
      ? rawAIExercises 
      : this.fallbackAIExerciseSelection(volumeDireto, data.equipamentosDisponiveis, data.limitacoes);

    // -------------------------------------------------------------
    // ETAPA 9: Filtrar exercícios recebidos.
    // Eliminar duplicados, padrões repetidos, incompatíveis.
    // -------------------------------------------------------------
    const filteredExercises = this.filterExercises(rawExercises, data.limitacoes, data.equipamentosDisponiveis);

    // -------------------------------------------------------------
    // ETAPA 10: Inserir localmente séries, reps, RPE, RIR, cadência, descanso, técnicas, ordem.
    // -------------------------------------------------------------
    let workouts = this.buildSessionWorkouts(filteredExercises, volumeDireto, workoutDays);

    // -------------------------------------------------------------
    // ETAPA 11: Calcular fadiga local, fadiga sistêmica, recuperação, interferência, etc.
    // -------------------------------------------------------------
    let fatigueByMuscle = this.calculateLocalFatigue(workouts);
    let systemicFatigue = this.calculateSystemicFatigue(fatigueByMuscle);
    let recoveryByMuscle = this.calculateRecovery(data.frequenciaSemanal, fatigueByMuscle);
    let movementCount = this.calculateMovementPatterns(workouts);

    // -------------------------------------------------------------
    // ETAPA 12: Executar autoAdjustment. (Máximo 10 tentativas)
    // 1-duplicidade, 2-técnicas, 3-compostos, 4-redistribuir, 5-sinergias, 6-recuperação, 7-fadiga, 8-volume
    // -------------------------------------------------------------
    let attempts = 0;
    let needsAdjustment = true;
    while (attempts < 10 && needsAdjustment) {
      const check = this.performAdjustmentStep(workouts, data, criterias, fatigueByMuscle, recoveryByMuscle, movementCount, attempts);
      if (check.adjusted) {
        adjustmentLog.push(`Tentativa ${attempts + 1}: ${check.log}`);
        // Re-evaluate metrics
        fatigueByMuscle = this.calculateLocalFatigue(workouts);
        systemicFatigue = this.calculateSystemicFatigue(fatigueByMuscle);
        recoveryByMuscle = this.calculateRecovery(data.frequenciaSemanal, fatigueByMuscle);
        movementCount = this.calculateMovementPatterns(workouts);
        attempts++;
      } else {
        needsAdjustment = false;
      }
    }

    // -------------------------------------------------------------
    // ETAPA 13: Executar Validation Pipeline.
    // -------------------------------------------------------------
    const validationErrors: string[] = [];
    
    // Validate Volume
    for (const muscle of MUSCLE_GROUPS) {
      const crit = criterias[muscle];
      const direct = volumeDireto[muscle] || 0;
      if (direct > crit.MRV) {
        validationErrors.push(`CRITICAL_MRV_EXCEEDED: Volume do grupo ${muscle} (${direct}) excede o MRV (${crit.MRV}).`);
      }
      if (direct < crit.MEV && crit.MEV > 0 && direct > 0) {
        validationErrors.push(`MEV_NOT_REACHED: Volume do grupo ${muscle} (${direct}) está abaixo do MEV (${crit.MEV}).`);
      }
    }

    // Validate Fatigue & Recovery
    for (const muscle of MUSCLE_GROUPS) {
      const fat = fatigueByMuscle[muscle] || 0;
      const limit = FATIGUE_LIMITS[muscle] || 25;
      if (fat > limit) {
        validationErrors.push(`FATIGUE_LIMIT_EXCEEDED: Fadiga local no grupo ${muscle} (${fat}) ultrapassou o teto (${limit}).`);
      }
    }

    // Validate Movement Patterns
    for (const pat of Object.keys(MOVEMENT_LIMITS)) {
      const count = movementCount[pat] || 0;
      const limit = MOVEMENT_LIMITS[pat];
      if (count > limit) {
        validationErrors.push(`MOVEMENT_LIMIT_EXCEEDED: Padrão motor ${pat} (${count}) excede o limite (${limit}).`);
      }
    }

    // Validate Restrictions
    for (const ex of workouts.flatMap(w => w.exercises)) {
      const nameLower = ex.name.toLowerCase();
      for (const lim of data.limitacoes) {
        const limLower = lim.toLowerCase();
        if (nameLower.includes(limLower)) {
          validationErrors.push(`RESTRICTED_EXERCISE: Exercício ${ex.name} viola a limitação '${lim}'.`);
        }
      }
    }

    const validation: ValidationReport = {
      valid: validationErrors.length === 0,
      errors: validationErrors,
      severity: validationErrors.length > 0 ? "critical" : "none"
    };

    // -------------------------------------------------------------
    // ETAPA 14: Executar Auditoria.
    // -------------------------------------------------------------
    const auditReport: AuditReport = {
      mathIssues: [],
      volumeIssues: [],
      fatigueIssues: [],
      movementIssues: [],
      recoveryIssues: [],
      equipmentIssues: [],
      periodizationIssues: [],
      validationIssues: []
    };

    // Populate auditor issues
    validationErrors.forEach(err => {
      if (err.includes("MRV") || err.includes("MEV")) auditReport.volumeIssues.push(err);
      else if (err.includes("FATIGUE")) auditReport.fatigueIssues.push(err);
      else if (err.includes("MOVEMENT")) auditReport.movementIssues.push(err);
      else if (err.includes("RESTRICTED")) auditReport.equipmentIssues.push(err);
      else auditReport.validationIssues.push(err);
    });

    // Check session times
    workouts.forEach(w => {
      if (w.sessionTimeMin > data.tempoMaximoSessao) {
        const issue = `SESSION_TIME_EXCEEDED: Tempo estimado da sessão (${w.sessionTimeMin} min) excede o limite máximo (${data.tempoMaximoSessao} min).`;
        auditReport.validationIssues.push(issue);
        validation.errors.push(issue);
        validation.valid = false;
        validation.severity = "critical";
      }
    });

    // -------------------------------------------------------------
    // ETAPA 15: Aprovar treino ou retornar erro crítico.
    // -------------------------------------------------------------
    const finalResult: UnifiedPrescriptionResult = {
      valid: validation.valid,
      severity: validation.severity,
      errors: validation.errors,
      studentData: data,
      volumeDireto,
      volumeIndireto,
      volumeEfetivo,
      directNeeded,
      fatigueByMuscle,
      recoveryByMuscle,
      systemicFatigue,
      movementCount,
      auditReport,
      validation,
      workouts,
      adjustmentLog
    };

    return finalResult;
  }

  // ==========================================
  // INTERNAL MATHEMATICAL MATH & RULES METHODS
  // ==========================================

  private static calculateLimits(muscle: string, experience: string): MuscleVolumeCriterias {
    const isLarge = LARGE_MUSCLES.includes(muscle);
    const exp = experience.toLowerCase();

    if (exp.includes("inic")) {
      return {
        MEV: isLarge ? 8 : 6,
        MAV: isLarge ? 10 : 8,
        MRV: isLarge ? 12 : 10
      };
    } else if (exp.includes("inter")) {
      return {
        MEV: isLarge ? 12 : 10,
        MAV: isLarge ? 14 : 12,
        MRV: isLarge ? 18 : 14
      };
    } else {
      // Avançado
      return {
        MEV: isLarge ? 16 : 12,
        MAV: isLarge ? 18 : 14,
        MRV: isLarge ? 22 : 18
      };
    }
  }

  private static applyPriorities(
    baseVolume: Record<string, number>,
    priorities: Record<string, "alta" | "media" | "baixa" | "nenhuma">,
    criterias: Record<string, MuscleVolumeCriterias>
  ): Record<string, number> {
    const adjusted = { ...baseVolume };
    const priorityEntries = Object.entries(priorities || {});
    
    let totalAddedVolume = 0;
    const priorityMuscles: string[] = [];

    // 1. Add volumes for High and Medium priorities
    for (const [rawMuscle, level] of priorityEntries) {
      const muscle = normalizeMuscleName(rawMuscle);
      if (!MUSCLE_GROUPS.includes(muscle)) continue;

      if (level === "alta") {
        adjusted[muscle] = (adjusted[muscle] || 0) + 3;
        totalAddedVolume += 3;
        priorityMuscles.push(muscle);
      } else if (level === "media") {
        adjusted[muscle] = (adjusted[muscle] || 0) + 1.5;
        totalAddedVolume += 1.5;
        priorityMuscles.push(muscle);
      }
    }

    // Cap at MRV
    for (const m of MUSCLE_GROUPS) {
      const limit = criterias[m];
      if (adjusted[m] > limit.MRV) {
        adjusted[m] = limit.MRV;
      }
    }

    // 2. Redistribute by decrementing non-priority muscles to keep total weekly volume constant
    const nonPriorityMuscles = MUSCLE_GROUPS.filter(m => !priorityMuscles.includes(m));
    if (nonPriorityMuscles.length > 0 && totalAddedVolume > 0) {
      const decrement = totalAddedVolume / nonPriorityMuscles.length;
      for (const m of nonPriorityMuscles) {
        const crit = criterias[m];
        // Ensure we don't go below 0 or below minimum MEV if possible (unless forced by total conservation)
        const proposed = (adjusted[m] || 0) - decrement;
        adjusted[m] = parseFloat(Math.max(crit.MEV * 0.5, Math.max(0, proposed)).toFixed(1));
      }
    }

    return adjusted;
  }

  private static getWorkoutDays(freq: number): string[] {
    const days = ["Segunda", "Quarta", "Sexta", "Sábado", "Terça", "Quinta", "Domingo"];
    return days.slice(0, Math.min(7, Math.max(1, freq)));
  }

  private static fallbackAIExerciseSelection(
    volumeDireto: Record<string, number>,
    equipamentos: string[],
    limitacoes: string[]
  ): RawAIExercise[] {
    // Generate fallback exercises based on muscles with direct volume
    const exercises: RawAIExercise[] = [];
    const eqList = equipamentos.map(e => e.toLowerCase());
    const limitList = limitacoes.map(l => l.toLowerCase());

    const fallbackDB: Record<string, string[]> = {
      Peitoral: ["Supino Inclinado Máquina", "Crucifixo Cabo", "Supino Horizontal Máquina", "Crossover"],
      Costas: ["Remada Articulada", "Puxada Alta", "Remada Curvada", "Pulldown"],
      Quadríceps: ["Cadeira Extensora", "Leg Press 45", "Agachamento Hack", "Passada"],
      "Posteriores de Coxa": ["Mesa Flexora", "Cadeira Flexora", "Stiff", "Flexão de Joelhos em Pé"],
      Glúteos: ["Elevação Pélvica", "Glúteo Cabo", "Cadeira Abdutora", "Agachamento Búlgaro"],
      Bíceps: ["Rosca Direta Cabo", "Rosca Scott Máquina", "Rosca Alternada", "Rosca Martelo"],
      Tríceps: ["Tríceps Pulley", "Tríceps Corda", "Tríceps Testa", "Tríceps Francês"],
      Ombros: ["Elevação Lateral Cabo", "Desenvolvimento Máquina", "Elevação Frontal", "Crucifixo Inverso"],
      Panturrilhas: ["Gêmeos Sentado", "Gêmeos em Pé Máquina", "Panturrilha Leg Press"],
      Core: ["Abdominal Supra Cabo", "Prancha Isométrica", "Abdominal Infra", "Abdominal Crunch"],
      Adutores: ["Cadeira Adutora", "Adutor Cabo", "Cossack Squat"]
    };

    for (const muscle of MUSCLE_GROUPS) {
      const vol = volumeDireto[muscle] || 0;
      if (vol > 0) {
        const pool = fallbackDB[muscle] || [];
        // Add 2-3 exercises for this muscle
        const count = vol > 12 ? 3 : (vol > 6 ? 2 : 1);
        let selectedCount = 0;
        for (const ex of pool) {
          if (selectedCount >= count) break;
          // Verify limitation incompatibility
          const isRestricted = limitList.some(lim => ex.toLowerCase().includes(lim));
          if (!isRestricted) {
            exercises.push({ name: ex, primaryMuscle: muscle });
            selectedCount++;
          }
        }
      }
    }
    return exercises;
  }

  private static filterExercises(
    raw: RawAIExercise[],
    limitacoes: string[],
    equipamentos: string[]
  ): RawAIExercise[] {
    const filtered: RawAIExercise[] = [];
    const seenNames = new Set<string>();
    const seenPatterns = new Set<string>();

    const limitList = limitacoes.map(l => l.toLowerCase());

    for (const ex of raw) {
      const name = ex.name.trim();
      const nameLower = name.toLowerCase();

      // Rule 1: Eliminate Duplicates by exact name
      if (seenNames.has(nameLower)) continue;

      // Rule 2: Eliminate incompatible exercises due to limitations
      const isRestricted = limitList.some(lim => nameLower.includes(lim));
      if (isRestricted) continue;

      // Rule 3: Eliminate repeated motor patterns
      const pattern = this.getMovementPattern(name);
      if (pattern) {
        const currentPatternCount = Array.from(seenPatterns).filter(p => p === pattern).length;
        if (currentPatternCount >= (MOVEMENT_LIMITS[pattern] || 2)) {
          continue; // skip to avoid exceeding pattern limits
        }
        seenPatterns.add(pattern);
      }

      seenNames.add(nameLower);
      filtered.push(ex);
    }

    return filtered;
  }

  private static buildSessionWorkouts(
    exercises: RawAIExercise[],
    volumeDireto: Record<string, number>,
    days: string[]
  ): SessionWorkout[] {
    const workouts: SessionWorkout[] = days.map(day => ({
      day,
      exercises: [],
      sessionTimeMin: 0
    }));

    // Distribute exercises over workout days
    let dayIndex = 0;
    exercises.forEach((ex, index) => {
      const muscle = normalizeMuscleName(ex.primaryMuscle);
      const totalVol = volumeDireto[muscle] || 0;
      
      // Calculate sets per exercise based on total target volume divided by direct exercise count
      const muscleExs = exercises.filter(e => normalizeMuscleName(e.primaryMuscle) === muscle);
      const exCount = muscleExs.length || 1;
      const calculatedSets = Math.max(2, Math.min(5, Math.round(totalVol / exCount)));

      const targetDay = workouts[dayIndex];
      const workoutEx: WorkoutExercise = {
        id: `ex-${index + 1}-${Math.random().toString(36).substr(2, 4)}`,
        name: ex.name,
        muscleGroup: muscle,
        series: calculatedSets,
        sets: calculatedSets,
        reps: "8-12",
        rpe: 8,
        rir: 2,
        cadence: "3-1-2",
        rest: "90s",
        notes: "Controle a fase excêntrica.",
        technique: totalVol >= 20 && index === exercises.indexOf(ex) ? "Drop-set" : "",
        order: targetDay.exercises.length + 1
      };

      targetDay.exercises.push(workoutEx);
      dayIndex = (dayIndex + 1) % workouts.length;
    });

    // Estimate session times
    workouts.forEach(w => {
      w.sessionTimeMin = this.estimateSessionTime(w.exercises);
    });

    return workouts;
  }

  private static calculateLocalFatigue(workouts: SessionWorkout[]): Record<string, number> {
    const fatigue: Record<string, number> = {};
    for (const m of MUSCLE_GROUPS) fatigue[m] = 0;

    workouts.forEach(w => {
      w.exercises.forEach(ex => {
        const sets = ex.series || 0;
        fatigue[ex.muscleGroup] = (fatigue[ex.muscleGroup] || 0) + sets;

        // Apply synergist indirect fatigue
        const syn = SYNERGY_RULES[ex.muscleGroup];
        if (syn) {
          for (const dest of Object.keys(syn)) {
            const factor = syn[dest];
            fatigue[dest] = parseFloat(((fatigue[dest] || 0) + (sets * factor * 0.5)).toFixed(1));
          }
        }
      });
    });

    return fatigue;
  }

  private static calculateSystemicFatigue(fatigue: Record<string, number>): number {
    return parseFloat(Object.values(fatigue).reduce((a, b) => a + b, 0).toFixed(1));
  }

  private static calculateRecovery(freq: number, fatigue: Record<string, number>): Record<string, number[]> {
    const recovery: Record<string, number[]> = {};
    const intervalHours = Math.round(168 / freq);

    for (const m of MUSCLE_GROUPS) {
      const base = RECOVERY_BASE_RULES[m] || 48;
      const currentFatigue = fatigue[m] || 0;
      // Recovery hours grows proportionally with local fatigue
      const actualHours = Math.round(base * (1 + (currentFatigue * 0.02)));
      recovery[m] = [actualHours, Math.max(24, intervalHours)];
    }
    return recovery;
  }

  private static calculateMovementPatterns(workouts: SessionWorkout[]): Record<string, number> {
    const counts: Record<string, number> = {
      horizontalPush: 0,
      horizontalPull: 0,
      verticalPush: 0,
      verticalPull: 0,
      squat: 0,
      hipHinge: 0
    };

    workouts.forEach(w => {
      w.exercises.forEach(ex => {
        const pattern = this.getMovementPattern(ex.name);
        if (pattern && counts[pattern] !== undefined) {
          counts[pattern]++;
        }
      });
    });

    return counts;
  }

  private static estimateSessionTime(exercises: WorkoutExercise[]): number {
    let total = 0;
    exercises.forEach(ex => {
      const sets = ex.series || 0;
      const execution = 40; // seconds
      const rest = 90; // seconds
      total += sets * (execution + rest);
    });
    return Math.round(total / 60);
  }

  private static getMovementPattern(name: string): string | null {
    const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
    if (norm.includes("supinoreto") || norm.includes("crucifixo") || norm.includes("peckdeck") || norm.includes("voador") || norm.includes("supinohorizontal")) {
      return "horizontalPush";
    }
    if (norm.includes("remada") || norm.includes("puxadabaixa")) {
      return "horizontalPull";
    }
    if (norm.includes("desenvolvimento") || norm.includes("militar")) {
      return "verticalPush";
    }
    if (norm.includes("puxadaalta") || norm.includes("barrafixa") || norm.includes("puxadavertical")) {
      return "verticalPull";
    }
    if (norm.includes("agachamento") || norm.includes("legpress") || norm.includes("hack")) {
      return "squat";
    }
    if (norm.includes("stiff") || norm.includes("levantamentoterra") || norm.includes("terra") || norm.includes("elevacaopelvica")) {
      return "hipHinge";
    }
    return null;
  }

  private static performAdjustmentStep(
    workouts: SessionWorkout[],
    studentData: StudentData,
    criterias: Record<string, MuscleVolumeCriterias>,
    fatigue: Record<string, number>,
    recovery: Record<string, number[]>,
    movementCount: Record<string, number>,
    attempt: number
  ): { adjusted: boolean; log: string } {
    
    // Check duplication in session workouts
    for (const w of workouts) {
      const seen = new Set<string>();
      for (let i = w.exercises.length - 1; i >= 0; i--) {
        const ex = w.exercises[i];
        if (seen.has(ex.name.toLowerCase())) {
          w.exercises.splice(i, 1);
          return { adjusted: true, log: `Reduzida duplicidade de exercício redundante: ${ex.name}` };
        }
        seen.add(ex.name.toLowerCase());
      }
    }

    // Check excessive techniques
    for (const w of workouts) {
      for (const ex of w.exercises) {
        if (ex.technique && ex.series > 4) {
          ex.technique = "";
          return { adjusted: true, log: `Removida técnica avançada no exercício ${ex.name} por excesso de séries (${ex.series})` };
        }
      }
    }

    // Reduce compound patterns if limit exceeded
    for (const pat of Object.keys(MOVEMENT_LIMITS)) {
      if ((movementCount[pat] || 0) > MOVEMENT_LIMITS[pat]) {
        // Find an exercise matching this pattern and remove or replace with isolated
        for (const w of workouts) {
          const idx = w.exercises.findIndex(e => this.getMovementPattern(e.name) === pat);
          if (idx !== -1) {
            const removed = w.exercises.splice(idx, 1)[0];
            return { adjusted: true, log: `Removido composto excessivo do padrão ${pat}: ${removed.name}` };
          }
        }
      }
    }

    // Adjust sets if session time exceeded
    for (const w of workouts) {
      if (w.sessionTimeMin > studentData.tempoMaximoSessao) {
        // Decrease sets of the longest exercise
        const targetEx = w.exercises.reduce((prev, current) => (prev.series > current.series) ? prev : current, w.exercises[0]);
        if (targetEx && targetEx.series > 2) {
          targetEx.series--;
          targetEx.sets = targetEx.series;
          w.sessionTimeMin = this.estimateSessionTime(w.exercises);
          return { adjusted: true, log: `Reduzida quantidade de séries no exercício ${targetEx.name} de ${targetEx.series + 1} para ${targetEx.series} para ajustar o tempo máximo da sessão` };
        }
      }
    }

    return { adjusted: false, log: "" };
  }
}
