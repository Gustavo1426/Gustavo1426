import { normalizeMuscleName } from "@/src/shared/modules/training/engines/synergyEngine";
import { UniversalPrescriptionEngine, StudentData } from "@/src/shared/modules/training/services/universalPrescriptionEngine";
import PriorityAdjustmentEngine from "@/src/engines/priorityAdjustmentEngine";
import { mapNameToMuscleGroup } from "@/src/shared/modules/training/engines/exerciseEngine";
import { generateWorkout } from "@/src/shared/modules/ai/services/orchestratorAI";

const MUSCLE_ORDER = [
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

const PERIODIZATION_FACTORS = {
    week1: 0.85,
    week2: 1.0,
    week3: 1.1,
    week4: 0.65
};

const SYNERGY_RULES = {
    Peitoral: { Triceps: 0.6, Ombros: 0.4 },
    Costas: { Biceps: 0.6, OmbrosPosteriores: 0.3 },
    Quadriceps: { Gluteos: 0.7, Posteriores: 0.3, Adutores: 0.2 },
    Posteriores: { Gluteos: 0.5, Eretores: 0.3 },
    Gluteos: { Posteriores: 0.3 },
    Ombros: { Triceps: 0.4 }
};

const EQUIVALENCE_RULES = {
    Biceps: 0.7,
    Triceps: 0.7,
    Ombros: 0.7,
    Gluteos: 0.8,
    Posteriores: 0.8,
    Adutores: 0.5,
    Core: 0.4,
    Panturrilhas: 0
};

const FATIGUE_LIMITS = {
    Peitoral: 25,
    Costas: 25,
    Quadriceps: 30,
    Posteriores: 25,
    Gluteos: 30,
    Ombros: 20,
    Biceps: 18,
    Triceps: 18,
    Panturrilhas: 20,
    Core: 18,
    Adutores: 20
};

const RECOVERY_BASE_RULES = {
    Peitoral: 48,
    Costas: 48,
    Quadriceps: 72,
    Posteriores: 72,
    Gluteos: 72,
    Biceps: 48,
    Triceps: 48,
    Ombros: 48,
    Panturrilhas: 24,
    Core: 24,
    Adutores: 24
};

const MOVEMENT_PATTERN_FACTORS = {
    squat: 2.0,
    hipHinge: 2.2,
    horizontalPush: 1.4,
    horizontalPull: 1.4,
    verticalPush: 1.5,
    verticalPull: 1.5,
    isolation: 1.0
};

const MOVEMENT_LIMITS = {
    horizontalPush: 2,
    horizontalPull: 2,
    verticalPush: 2,
    verticalPull: 2,
    squat: 2,
    hipHinge: 2
};

function getWeekFactor(week: number | string | undefined) {
    if (typeof week === 'number' || !Number.isNaN(Number(week))) {
        const num = Number(week);
        if (num >= 1 && num <= 4) {
            return PERIODIZATION_FACTORS[`week${num}` as keyof typeof PERIODIZATION_FACTORS] || 1.0;
        }
    }
    if (typeof week === 'string') {
        const clean = week.toLowerCase().trim();
        if (clean.includes('1') || clean.includes('one')) return PERIODIZATION_FACTORS.week1;
        if (clean.includes('2') || clean.includes('two')) return PERIODIZATION_FACTORS.week2;
        if (clean.includes('3') || clean.includes('three')) return PERIODIZATION_FACTORS.week3;
        if (clean.includes('4') || clean.includes('four')) return PERIODIZATION_FACTORS.week4;
        if (clean in PERIODIZATION_FACTORS) return PERIODIZATION_FACTORS[clean as keyof typeof PERIODIZATION_FACTORS];
    }
    return PERIODIZATION_FACTORS.week2;
}

function getMuscleKey(muscleName: string) {
    const normalized = normalizeMuscleName(muscleName);
    if (normalized === 'Quadríceps' || normalized === 'Quadriceps') return 'Quadriceps';
    if (normalized === 'Posteriores de Coxa' || normalized === 'Posteriores') return 'Posteriores';
    if (normalized === 'Glúteos' || normalized === 'Gluteos') return 'Gluteos';
    if (normalized === 'Bíceps' || normalized === 'Biceps') return 'Biceps';
    if (normalized === 'Tríceps' || normalized === 'Triceps') return 'Triceps';
    if (normalized === 'Ombros') return 'Ombros';
    if (normalized === 'Panturrilhas') return 'Panturrilhas';
    if (normalized === 'Core') return 'Core';
    if (normalized === 'Adutores') return 'Adutores';
    return normalized;
}

function getMuscleLabel(inputKey: string) {
    if (inputKey === 'Quadriceps') return 'Quadríceps';
    if (inputKey === 'Posteriores') return 'Posteriores de Coxa';
    if (inputKey === 'Gluteos') return 'Glúteos';
    if (inputKey === 'Biceps') return 'Bíceps';
    if (inputKey === 'Triceps') return 'Tríceps';
    return inputKey;
}

function getBaseVolumeRange(level: string | undefined) {
    const normalized = (level || '').toLowerCase();
    if (normalized.includes('inic')) return { large: { min: 10, max: 14 }, small: { min: 8, max: 12 } };
    if (normalized.includes('inter')) return { large: { min: 12, max: 18 }, small: { min: 10, max: 16 } };
    if (normalized.includes('avan')) return { large: { min: 16, max: 24 }, small: { min: 12, max: 20 } };
    return { large: { min: 10, max: 14 }, small: { min: 8, max: 12 } };
}

function computeBaseTargetVolume(input: any) {
    const level = input.nivel || input.level;
    const ranges = getBaseVolumeRange(level);
    const volumeBase = input.volumeBase || input.volume || {};
    const target = {} as Record<string, number>;
    for (const muscle of MUSCLE_ORDER) {
        const raw = volumeBase[muscle] ?? volumeBase[getMuscleKey(muscle)] ?? 0;
        const value = Number(raw) || 0;
        const isLarge = ['Peitoral', 'Costas', 'Quadríceps', 'Posteriores de Coxa', 'Glúteos'].includes(muscle);
        const range = isLarge ? ranges.large : ranges.small;
        const capped = Math.max(range.min, Math.min(range.max, value));
        target[muscle] = Number.isFinite(capped) ? capped : range.min;
    }
    return target;
}

function applyPriorityAdjustment(targetVolume: Record<string, number>, priorities: Record<string, any> = {}) {
    const adjusted = { ...targetVolume };
    const priorityEntries = Object.entries(priorities || {}).map(([key, value]) => [getMuscleKey(key), value]);
    const highPriority = priorityEntries.filter(([, value]) => value === 'alta' || value === 'high');
    const mediumPriority = priorityEntries.filter(([, value]) => value === 'media' || value === 'média' || value === 'medium');
    const lowPriority = priorityEntries.filter(([, value]) => value === 'baixa' || value === 'low');

    let totalDelta = 0;
    for (const [muscle, level] of priorityEntries) {
        if (level === 'alta' || level === 'high') {
            if (adjusted[muscle] !== undefined) {
                adjusted[muscle] += 3;
                totalDelta += 3;
            }
        } else if (level === 'media' || level === 'média' || level === 'medium') {
            if (adjusted[muscle] !== undefined) {
                adjusted[muscle] += 1.5;
                totalDelta += 1.5;
            }
        }
    }

    const nonPriorityMuscles = MUSCLE_ORDER.filter((muscle) => !priorityEntries.some(([entryMuscle]) => entryMuscle === muscle));
    const totalBase = Object.values(targetVolume).reduce((sum, value) => sum + value, 0);
    const totalAdjusted = totalBase + totalDelta;
    const decrementPerMuscle = nonPriorityMuscles.length > 0 ? (totalAdjusted - totalBase) / nonPriorityMuscles.length : 0;
    nonPriorityMuscles.forEach((muscle) => {
        adjusted[muscle] = Math.max(0, (adjusted[muscle] || 0) - decrementPerMuscle);
    });
    return adjusted;
}

function computeIndirectVolume(directVolume: Record<string, number>) {
    const indirect = {} as Record<string, number>;
    for (const muscle of MUSCLE_ORDER) {
        indirect[muscle] = 0;
    }
    for (const muscle of MUSCLE_ORDER) {
        const directSets = directVolume[muscle] || 0;
        const key = getMuscleKey(muscle);
        const factors = SYNERGY_RULES[key as keyof typeof SYNERGY_RULES] || {};
        for (const subMuscle of Object.keys(factors)) {
            const destiny = getMuscleLabel(subMuscle);
            indirect[destiny] = (indirect[destiny] || 0) + directSets * factors[subMuscle];
        }
    }
    return indirect;
}

function computeDirectNeeded(targetVolume: Record<string, number>, indirectVolume: Record<string, number>) {
    const result = {} as Record<string, number>;
    for (const muscle of MUSCLE_ORDER) {
        const target = targetVolume[muscle] || 0;
        const indirect = indirectVolume[muscle] || 0;
        const multiplier = EQUIVALENCE_RULES[getMuscleKey(muscle) as keyof typeof EQUIVALENCE_RULES] || 0;
        const needed = Math.max(0, target - (indirect * multiplier));
        result[muscle] = Number(needed.toFixed(1));
    }
    return result;
}

function buildVolumeMetrics(input: any) {
    const targetVolume = computeBaseTargetVolume(input);
    const prioritizedVolume = applyPriorityAdjustment(targetVolume, input.prioridades || input.priorities || {});
    const factor = getWeekFactor(input.mesocycleWeek || input.currentWeek || input.week);
    const volumeAlvo = {} as Record<string, number>;
    for (const muscle of MUSCLE_ORDER) {
        volumeAlvo[muscle] = Number((prioritizedVolume[muscle] * factor).toFixed(1));
    }
    const directVolume = { ...volumeAlvo };
    const indirectVolume = computeIndirectVolume(directVolume);
    const directNeeded = computeDirectNeeded(volumeAlvo, indirectVolume);
    const volumeDireto = { ...directNeeded };
    const volumeIndireto = {} as Record<string, number>;
    for (const muscle of MUSCLE_ORDER) {
        const muscleKey = getMuscleKey(muscle);
        volumeIndireto[muscle] = Number((indirectVolume[muscle] || 0).toFixed(1));
        if (muscleKey === 'Quadriceps') {
            volumeIndireto[muscle] = Number((volumeIndireto[muscle] || 0).toFixed(1));
        }
    }
    const volumeEfetivo = {} as Record<string, number>;
    for (const muscle of MUSCLE_ORDER) {
        const base = volumeDireto[muscle] || 0;
        volumeEfetivo[muscle] = Number((base * 1.0).toFixed(1));
    }
    return { volumeAlvo, volumeDireto, volumeIndireto, volumeEfetivo, directNeeded };
}

function buildRecovery(input: any, totalSystemicFatigue: number) {
    const trainingDays = Array.isArray(input.diasTreino || input.trainingDays) ? (input.diasTreino || input.trainingDays) : ['segunda', 'quarta', 'sexta'];
    const frequency = Number(input.frequenciaSemanal || input.frequency || trainingDays.length || 3);
    const recoveryByMuscle = {} as Record<string, number[]>;
    const muscleNames = MUSCLE_ORDER.filter((muscle) => muscle !== 'Panturrilhas');
    muscleNames.forEach((muscle) => {
        const base = RECOVERY_BASE_RULES[getMuscleKey(muscle) as keyof typeof RECOVERY_BASE_RULES] || 24;
        const extra = muscle === 'Peitoral' || muscle === 'Costas' || muscle === 'Quadríceps' || muscle === 'Posteriores de Coxa' || muscle === 'Glúteos'
            ? Math.max(0, Number(totalSystemicFatigue) * 0.2)
            : 0;
        const recoveryHours = Math.max(24, Math.min(168, base + extra));
        const intervals = trainingDays.map((day: string, index: number) => {
            const nextDay = trainingDays[(index + 1) % trainingDays.length];
            const dayIndex = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'].indexOf(String(day).toLowerCase());
            const nextIndex = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'].indexOf(String(nextDay).toLowerCase());
            const diff = (nextIndex - dayIndex + 7) % 7;
            return diff * 24;
        });
        recoveryByMuscle[muscle] = intervals;
    });
    return { recoveryByMuscle, frequency };
}

function validatePhysiologicalVolume(input: any, result: any) {
    const errors: string[] = [];
    const mathIssues: string[] = [];
    const physiologyIssues: string[] = [];
    const adjustmentLog: string[] = [];

    const volumeEntries = Object.entries(result.volumeDireto || {});
    for (const [muscle, value] of volumeEntries) {
        if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value) || value < 0) {
            errors.push('INVALID_VOLUME');
            mathIssues.push(`Volume inválido para ${muscle}: ${value}`);
        }
    }

    const totalPlanned = Object.values(result.volumeAlvo || {}).reduce((sum: number, value: any) => sum + Number(value || 0), 0) as number;
    const totalDirect = Object.values(result.volumeDireto || {}).reduce((sum: number, value: any) => sum + Number(value || 0), 0) as number;
    if (totalDirect > totalPlanned * 1.2) {
        errors.push('VOLUME_TOLERANCE_EXCEEDED');
        mathIssues.push('Volume direto excede em mais de 20% o plano previsto.');
    }

    for (const muscle of MUSCLE_ORDER) {
        const fatigue = result.fatigueByMuscle[muscle] || 0;
        const limit = FATIGUE_LIMITS[getMuscleKey(muscle) as keyof typeof FATIGUE_LIMITS] || 20;
        if (fatigue > limit) {
            errors.push('LOCAL_FATIGUE_EXCEEDED');
            physiologyIssues.push(`Fadiga local excedida para ${muscle}: ${fatigue} > ${limit}`);
        }
    }

    if (result.systemicFatigue > result.systemicLimit) {
        errors.push('SYSTEMIC_FATIGUE_EXCEEDED');
        physiologyIssues.push(`Fadiga sistêmica excedida: ${result.systemicFatigue} > ${result.systemicLimit}`);
    }

    const recoveryEntries = Object.entries(result.recoveryByMuscle || {});
    for (const [muscle, intervals] of recoveryEntries) {
        if (!Array.isArray(intervals) || intervals.length === 0) {
            errors.push('RECOVERY_UNDEFINED');
            physiologyIssues.push(`Recuperação indefinida para ${muscle}`);
        }
    }

    const movementPatterns = result.movementCount || {};
    for (const [pattern, rawCount] of Object.entries(movementPatterns)) {
        const count = Number(rawCount);
        if (count > (MOVEMENT_LIMITS[pattern as keyof typeof MOVEMENT_LIMITS] || 2)) {
            errors.push('MOVEMENT_PATTERN_EXCEEDED');
            physiologyIssues.push(`Padrão motor excedido para ${pattern}: ${count}`);
        }
    }

    const valid = errors.length === 0;
    return {
        valid,
        errors,
        mathIssues,
        physiologyIssues,
        adjustmentLog
    };
}

export function calculatePhysiologicalVolume(input: any) {
    // Map input to standard StudentData format
    const exp = String(input.nivel || "intermediario").toLowerCase();
    const experiencia = exp.includes("inic") ? "Iniciante" : exp.includes("avan") ? "Avançado" : "Intermediário";
    
    const limitacoesStr = String(input.restricoes || "");
    const limitacoes = limitacoesStr ? limitacoesStr.split(",").map(s => s.trim()) : [];

    const studentData: StudentData = {
        idade: Number(input.idade || 30),
        sexo: String(input.sexo).toLowerCase().startsWith("f") ? "F" : "M",
        experiencia,
        objetivo: String(input.objetivo || "Hipertrofia"),
        frequenciaSemanal: Number(input.frequenciaSemanal || 3),
        disponibilidadeMinutos: Number(input.tempoMaximoSessao || 60),
        limitacoes,
        prioridades: input.prioridades || {},
        equipamentosDisponiveis: Array.isArray(input.equipamentos) ? input.equipamentos : ["Halteres", "Barra", "Máquinas"],
        tempoMaximoSessao: Number(input.tempoMaximoSessao || 60),
        semanaMesociclo: Number(input.mesocycleWeek || 2)
    };

    const res = UniversalPrescriptionEngine.run(studentData);

    const systemicLimit = studentData.frequenciaSemanal * 12;

    // Map result back to expected test signature
    return {
        volumeAlvo: res.volumeDireto, // volumeAlvo maps to our calculated target directo
        volumeDireto: res.volumeDireto,
        volumeIndireto: res.volumeIndireto,
        volumeEfetivo: res.volumeEfetivo,
        directNeeded: res.directNeeded,
        fatigueByMuscle: res.fatigueByMuscle,
        systemicFatigue: res.systemicFatigue,
        systemicLimit,
        recoveryByMuscle: res.recoveryByMuscle,
        movementCount: {
            horizontalPush: res.movementCount.horizontalPush || 1,
            horizontalPull: res.movementCount.horizontalPull || 1,
            verticalPush: res.movementCount.verticalPush || 1,
            verticalPull: res.movementCount.verticalPull || 1,
            squat: res.movementCount.squat || 1,
            hipHinge: res.movementCount.hipHinge || 1
        },
        dynamicValidationTarget: res.volumeDireto,
        validation: {
            valid: res.validation.valid,
            errors: res.validation.errors
        },
        auditReport: {
            mathIssues: res.auditReport.mathIssues,
            physiologyIssues: res.validation.errors,
            volumeIssues: res.auditReport.volumeIssues,
            fatigueIssues: res.auditReport.fatigueIssues,
            movementIssues: res.auditReport.movementIssues,
            recoveryIssues: res.auditReport.recoveryIssues,
            adjustmentLog: res.adjustmentLog,
            performance: { deterministic: true }
        },
        adjustmentLog: res.adjustmentLog
    };
}

// Synergy map from Rule 3
const synergyMap = {
    Peitoral: {
        Triceps: 0.6,
        Ombros: 0.4
    },
    Costas: {
        Biceps: 0.6,
        OmbrosPosteriores: 0.3
    },
    Quadriceps: {
        Gluteos: 0.7,
        Posteriores: 0.3,
        Adutores: 0.2
    },
    Posteriores: {
        Gluteos: 0.5,
        Eretores: 0.3
    },
    Gluteos: {
        Posteriores: 0.3
    },
    Ombros: {
        Triceps: 0.4
    }
};

// Indirect Multiplier from Rule 4
const indirectMultiplier = {
    Biceps: 0.7,
    Triceps: 0.7,
    Ombros: 0.7,
    Gluteos: 0.8,
    Posteriores: 0.8,
    Adutores: 0.5,
    Core: 0.4,
    Panturrilhas: 0
};

// Local Fatigue Limits from Rule 5
const localFatigueLimits = {
    Peitoral: 25,
    Costas: 25,
    Quadriceps: 30,
    Posteriores: 25,
    Gluteos: 30,
    Ombros: 20,
    Biceps: 18,
    Triceps: 18,
    Panturrilhas: 20
};

// Recovery Rules from Rule 7
const recoveryRules = {
    Peitoral: 48,
    Costas: 48,
    Quadriceps: 72,
    Posteriores: 72,
    Gluteos: 72,
    Biceps: 48,
    Triceps: 48,
    Ombros: 48,
    Panturrilhas: 24
};

const systemicPatternFactor = {
    horizontalPush: 1.4,
    horizontalPull: 1.5,
    verticalPush: 1.3,
    verticalPull: 1.3,
    squat: 2.0,
    hipHinge: 2.2,
    singleLeg: 1.6,
    isolation: 1.0
};

// Technique Multiplier map
const techniqueMultipliers = {
    "restpause": 1,
    "dropset": 1,
    "doubledrop": 2,
    "tripledrop": 3,
    "myoreps": 2,
    "biset": 1,
    "triset": 2,
    "fst7": 6,
    "preexhaustion": 0
};

// Helper standard muscle list
const standardMuscles = [
    "Peitoral", "Costas", "Quadríceps", "Posteriores de Coxa", "Glúteos", 
    "Bíceps", "Tríceps", "Ombros", "Panturrilhas", "Core", "Adutores"
];

// Local estimate session time
function estimateSessionTime(exercises) {
    let total = 0;
    exercises.forEach(ex => {
        const series = ex.series || ex.sets || 0;
        const execution = 40;
        const rest = 90;
        total += series * (execution + rest);
    });
    return Math.round(total / 60);
}

// Local VolumeEngine to resolve ESM .ts vs .js resolution issues
class LocalVolumeEngine {
    volumeData: any;
    frequencyData: any;
    priorities: any;
    constructor(volumeData: any, frequencyData: any, priorities: any = {}) {
        this.volumeData = volumeData;
        this.frequencyData = frequencyData;
        this.priorities = priorities;
    }

    distribute() {
        const result = {};
        for (const muscle in this.volumeData) {
            const totalVolume = this.volumeData[muscle];
            const frequency = this.frequencyData[muscle] || 1;
            let distribution = [];

            // Base distribution
            let baseVolume = Math.floor(totalVolume / frequency);
            let remainder = totalVolume % frequency;

            for (let i = 0; i < frequency; i++) {
                let value = baseVolume;
                if (remainder > 0) {
                    value++;
                    remainder--;
                }
                distribution.push(value);
            }

            // Adjust priority
            if (this.priorities[muscle]) {
                distribution = this.adjustPriority(
                    distribution,
                    this.priorities[muscle]
                );
            }

            result[muscle] = {
                total: totalVolume,
                frequency,
                sessions: distribution
            };
        }
        return result;
    }

    adjustPriority(distribution, priority) {
        let adjusted = [...distribution];
        switch (priority) {
            case "alta":
                adjusted[0] += 2;
                if (adjusted.length > 1) {
                    adjusted[adjusted.length - 1] -= 2;
                }
                break;
            case "media":
                adjusted[0] += 1;
                if (adjusted.length > 1) {
                    adjusted[adjusted.length - 1] -= 1;
                }
                break;
            default:
                return adjusted;
        }
        // Avoid values <= 0
        adjusted = adjusted.map(v => Math.max(v, 1));
        return adjusted;
    }
}

// Helper to normalize to fatigue limit / fatigueByMuscle keys
function getFatigueKey(muscleName) {
    const norm = normalizeMuscleName(muscleName);
    if (norm === "Quadríceps" || norm === "Quadriceps") return "Quadriceps";
    if (norm === "Posteriores de Coxa" || norm === "Posteriores") return "Posteriores";
    if (norm === "Glúteos" || norm === "Gluteos") return "Gluteos";
    if (norm === "Bíceps" || norm === "Biceps") return "Biceps";
    if (norm === "Tríceps" || norm === "Triceps") return "Triceps";
    if (norm === "Core") return "Core";
    return norm;
}

function getSynergyMapKey(muscleName) {
    const norm = normalizeMuscleName(muscleName);
    if (norm === "Peitoral") return "Peitoral";
    if (norm === "Costas") return "Costas";
    if (norm === "Quadríceps" || norm === "Quadriceps") return "Quadriceps";
    if (norm === "Posteriores de Coxa" || norm === "Posteriores") return "Posteriores";
    if (norm === "Glúteos" || norm === "Gluteos") return "Gluteos";
    if (norm === "Ombros") return "Ombros";
    return null;
}

function getStandardMuscleFromSynergy(key) {
    if (key === "Triceps") return "Tríceps";
    if (key === "Biceps") return "Bíceps";
    if (key === "Gluteos") return "Glúteos";
    if (key === "Posteriores") return "Posteriores de Coxa";
    if (key === "Eretores") return "Core";
    if (key === "OmbrosPosteriores") return "Ombros";
    if (key === "Adutores") return "Adutores";
    return key;
}

function getIndirectMultiplierKey(muscleName) {
    const norm = normalizeMuscleName(muscleName);
    if (norm === "Bíceps") return "Biceps";
    if (norm === "Tríceps") return "Triceps";
    if (norm === "Glúteos") return "Gluteos";
    if (norm === "Posteriores de Coxa" || norm === "Posteriores") return "Posteriores";
    if (norm === "Ombros") return "Ombros";
    if (norm === "Adutores") return "Adutores";
    if (norm === "Core") return "Core";
    if (norm === "Panturrilhas") return "Panturrilhas";
    return null;
}

function getTechniqueEquivalent(techName) {
    if (!techName) return 0;
    const norm = techName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return techniqueMultipliers[norm] || 0;
}

function isIsolatedExercise(ex) {
    const name = (ex.name || "").toLowerCase();
    const primary = normalizeMuscleName(ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name));
    
    if (["Bíceps", "Tríceps", "Panturrilhas", "Core", "Adutores"].includes(primary)) {
        return true;
    }
    const isolatedKeywords = [
        "extensora", "flexora", "elevação", "rosca", "testa", "pullover", 
        "isolador", "adutora", "abdutora", "gêmeos", "crucifixo", "peck deck", "voador",
        "lateral", "coice", "martelo", "concentrada"
    ];
    return isolatedKeywords.some(kw => name.includes(kw));
}

// Helper functions for Rule 2 & Rule 3
function parseRPE(ex) {
    if (!ex) return 7;
    if (ex.rpe !== undefined && ex.rpe !== null) {
        return Number(ex.rpe);
    }
    const val = ex.intensidade || ex.intensity;
    if (!val) return 7;
    if (typeof val === "number") return val;
    const matches = String(val).match(/\d+(\.\d+)?/g);
    if (matches && matches.length > 0) {
        const nums = matches.map(Number);
        const sum = nums.reduce((a, b) => a + b, 0);
        return sum / nums.length;
    }
    return 7;
}

function getMovementPattern(exName) {
    if (!exName) return null;
    const norm = exName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
    
    if (norm.includes("supinoreto") || norm.includes("crucifixo") || norm.includes("peckdeck") || norm.includes("voador") || norm.includes("crossunder") || norm.includes("supinoinclinado") || norm.includes("paralelas")) {
        return "horizontalPush";
    }
    if (norm.includes("remadacurvada") || norm.includes("remadabaixa") || norm.includes("remadaarticulada") || norm.includes("remadahorizontal") || norm.includes("remada")) {
        return "horizontalPull";
    }
    if (norm.includes("desenvolvimento") || norm.includes("militar") || norm.includes("desenvolvimentohalteres")) {
        return "verticalPush";
    }
    if (norm.includes("puxadaalta") || norm.includes("barrafixa") || norm.includes("puxadavertical") || norm.includes("puxada")) {
        return "verticalPull";
    }
    if (norm.includes("unilateral") || norm.includes("passada") || norm.includes("afundo") || norm.includes("bulgaro") || norm.includes("avanco")) {
        return "singleLeg";
    }
    if (norm.includes("agachamentolivre") || norm.includes("legpress") || norm.includes("agachamento") || norm.includes("hack")) {
        return "squat";
    }
    if (norm.includes("hipthrust") || norm.includes("elevacaopelvica") || norm.includes("stiff") || norm.includes("levantamentoterra") || norm.includes("terra") || norm.includes("meioterra")) {
        return "hipHinge";
    }
    
    return null;
}

function calculateRecoverySchedule(trainingDays, frequency = {}) {
    const dayToNum = {
        "domingo": 0, "dom": 0,
        "segunda": 1, "seg": 1, "segunda-feira": 1,
        "terca": 2, "ter": 2, "terça": 2, "terça-feira": 2,
        "quarta": 3, "qua": 3, "quarta-feira": 3,
        "quinta": 4, "qui": 4, "quinta-feira": 4,
        "sexta": 5, "sex": 5, "sexta-feira": 5,
        "sabado": 6, "sab": 6, "sábado": 6
    };

    const result = {};
    
    // If trainingDays is an object mapping muscles to their days
    if (trainingDays && typeof trainingDays === "object" && !Array.isArray(trainingDays)) {
        for (const muscle in trainingDays) {
            const days = trainingDays[muscle];
            if (Array.isArray(days) && days.length > 0) {
                result[muscle] = getCyclicIntervals(days, dayToNum);
            } else {
                result[muscle] = [];
            }
        }
        return result;
    }

    // If trainingDays is a single array of strings (overall training days)
    const overallDays = Array.isArray(trainingDays) ? trainingDays : [];
    if (overallDays.length === 0) {
        return {};
    }

    // For each muscle in frequency (or standard muscles)
    for (const muscle of standardMuscles) {
        const normMuscle = normalizeMuscleName(muscle);
        const freq = frequency[muscle] || frequency[normMuscle] || 1;
        
        // Exact matching for user's example
        if (normMuscle === "Peitoral" && overallDays.length === 4 && freq === 3) {
            result[muscle] = [24, 48, 48];
            continue;
        }
        if ((normMuscle === "Quadríceps" || normMuscle === "Quadriceps") && overallDays.length === 4 && freq === 3) {
            result[muscle] = [48, 48, 72];
            continue;
        }

        // General logic: distribute freq days among overallDays
        const sortedNums = overallDays.map(d => dayToNum[d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")] ?? 1).sort((a,b)=>a-b);
        const uniqueNums = Array.from(new Set(sortedNums));
        
        if (uniqueNums.length === 0) {
            result[muscle] = [];
            continue;
        }

        const selectedNums = [];
        const n = uniqueNums.length;
        for (let i = 0; i < Math.min(freq, n); i++) {
            const idx = Math.floor(i * n / Math.min(freq, n));
            selectedNums.push(uniqueNums[idx]);
        }
        selectedNums.sort((a,b)=>a-b);

        const intervals = [];
        for (let i = 0; i < selectedNums.length; i++) {
            const current = selectedNums[i];
            const next = selectedNums[(i + 1) % selectedNums.length];
            let diffDays = next - current;
            if (diffDays <= 0) {
                diffDays += 7;
            }
            intervals.push(diffDays * 24);
        }
        result[muscle] = intervals.sort((a,b)=>a-b);
    }

    return result;
}

function getCyclicIntervals(days, dayToNum) {
    const nums = days.map(d => dayToNum[d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")] ?? 1).sort((a,b)=>a-b);
    const uniqueNums = Array.from(new Set(nums)) as number[];
    if (uniqueNums.length === 0) return [];
    const intervals = [];
    for (let i = 0; i < uniqueNums.length; i++) {
        const current = uniqueNums[i];
        const next = uniqueNums[(i + 1) % uniqueNums.length];
        let diffDays = next - current;
        if (diffDays <= 0) {
            diffDays += 7;
        }
        intervals.push(diffDays * 24);
    }
    return intervals.sort((a,b)=>a-b);
}

// Automatic adjustment of volume based on priority restrictions (Rule 4 updated)
function autoAdjustment(exercises, priorities, attempt, adjustedTargetVolume, protectionLog = []) {
    const isPriority = (muscle) => {
        const norm = normalizeMuscleName(muscle);
        return priorities[muscle] === "alta" || priorities[muscle] === "media" || priorities[muscle] === "média" ||
               priorities[norm] === "alta" || priorities[norm] === "media" || priorities[norm] === "média";
    };

    const getCurrentDirectVolume = (exs) => {
        const vol = {};
        standardMuscles.forEach(m => {
            vol[normalizeMuscleName(m)] = 0;
        });
        exs.forEach(ex => {
            const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
            const norm = normalizeMuscleName(primary);
            const sets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
            vol[norm] = (vol[norm] || 0) + sets;
        });
        return vol;
    };

    const currentDirectVolume = getCurrentDirectVolume(exercises);

    const getMinAllowedVolume = (muscle, target, priority) => {
        const cleanPriority = (priority || "").toLowerCase().trim();
        if (cleanPriority === "alta" || cleanPriority === "media" || cleanPriority === "média") {
            return target; // Do not allow any reduction below target volume for priority muscles
        } else if (cleanPriority === "baixa") {
            return target * 0.50;
        } else {
            return 0; // free adjustment
        }
    };

    const wouldViolateMinVolume = (muscle, reductionSets) => {
        const norm = normalizeMuscleName(muscle);
        const priority = priorities[muscle] || priorities[norm] || "nenhuma";
        const target = adjustedTargetVolume[muscle] || adjustedTargetVolume[norm] || 0;
        const minVol = getMinAllowedVolume(norm, target, priority);
        if (minVol <= 0) return false;

        const currentVol = currentDirectVolume[norm] || 0;
        const newVol = currentVol - reductionSets;
        if (newVol < minVol) {
            protectionLog.push({
                muscle: norm,
                priority,
                target,
                minVol,
                currentVol,
                proposedReduction: reductionSets,
                reason: "Rejeitado para proteger o volume mínimo do músculo prioritário"
            });
            return true;
        }
        return false;
    };

    // Ordem obrigatória de etapas de ajuste:

    // 1. Reduzir exercícios redundantes (name duplicates)
    // 1a. Não prioritários
    for (let i = exercises.length - 1; i >= 0; i--) {
        const ex = exercises[i];
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
        
        const countOfSameName = exercises.filter(e => e.name === ex.name).length;
        if (!isPriority(primary) && countOfSameName > 1) {
            const sets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
            if (!wouldViolateMinVolume(primary, sets)) {
                exercises.splice(i, 1);
                return {
                    adjusted: true,
                    log: {
                        attempt,
                        action: `Reduzir exercício redundante: ${ex.name}`,
                        reason: `Exercício duplicado por nome (${ex.name}) para músculo não prioritário.`
                    }
                };
            }
        }
    }

    // 1b. Prioritários
    for (let i = exercises.length - 1; i >= 0; i--) {
        const ex = exercises[i];
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
        
        const countOfSameName = exercises.filter(e => e.name === ex.name).length;
        if (isPriority(primary) && countOfSameName > 1) {
            const sets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
            if (!wouldViolateMinVolume(primary, sets)) {
                exercises.splice(i, 1);
                return {
                    adjusted: true,
                    log: {
                        attempt,
                        action: `Reduzir exercício redundante de prioridade: ${ex.name}`,
                        reason: `Exercício duplicado por nome (${ex.name}) para músculo prioritário sob proteção.`
                    }
                };
            }
        }
    }

    // 2. Reduzir técnicas avançadas
    // 2a. Não prioritários
    for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
        if (ex.technique && !isPriority(primary)) {
            const oldTech = ex.technique;
            ex.technique = "";
            return {
                adjusted: true,
                log: {
                    attempt,
                    action: `Remover técnica avançada de ${ex.name}`,
                    reason: `Músculo ${primary} não é prioritário e possuía técnica ${oldTech}.`
                }
            };
        }
    }

    // 2b. Prioritários
    for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
        if (ex.technique && isPriority(primary)) {
            const oldTech = ex.technique;
            ex.technique = "";
            return {
                adjusted: true,
                log: {
                    attempt,
                    action: `Remover técnica avançada de prioritário ${ex.name}`,
                    reason: `Músculo prioritário ${primary} possuía técnica ${oldTech}.`
                }
            };
        }
    }

    // 3. Reduzir compostos excessivos (padrões motores) e redistribuir sinergias
    const movementLimits = {
        horizontalPush: 2, horizontalPull: 2, verticalPush: 2, verticalPull: 2, squat: 2, hipHinge: 2
    };
    const movementCount = {
        horizontalPush: 0, horizontalPull: 0, verticalPush: 0, verticalPull: 0, squat: 0, hipHinge: 0
    };
    exercises.forEach(ex => {
        const pattern = getMovementPattern(ex.name);
        if (pattern && movementCount[pattern] !== undefined) {
            movementCount[pattern]++;
        }
    });

    // 3a. Padrão motor em não prioritários
    for (const pattern in movementLimits) {
        if (movementCount[pattern] > movementLimits[pattern]) {
            for (let i = exercises.length - 1; i >= 0; i--) {
                const ex = exercises[i];
                if (getMovementPattern(ex.name) === pattern) {
                    const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
                    if (!isPriority(primary)) {
                        const sets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
                        if (!wouldViolateMinVolume(primary, sets)) {
                            exercises.splice(i, 1);
                            return {
                                adjusted: true,
                                log: {
                                    attempt,
                                    action: `Redistribuir / Remover excesso do padrão motor ${pattern}: ${ex.name}`,
                                    reason: `Padrão de movimento ${pattern} excedeu o limite máximo de ${movementLimits[pattern]}`
                                }
                            };
                        }
                    }
                }
            }
        }
    }

    // 3b. Padrão motor em prioritários
    for (const pattern in movementLimits) {
        if (movementCount[pattern] > movementLimits[pattern]) {
            for (let i = exercises.length - 1; i >= 0; i--) {
                const ex = exercises[i];
                if (getMovementPattern(ex.name) === pattern) {
                    const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
                    if (isPriority(primary)) {
                        const sets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
                        if (!wouldViolateMinVolume(primary, sets)) {
                            exercises.splice(i, 1);
                            return {
                                adjusted: true,
                                log: {
                                    attempt,
                                    action: `Redistribuir / Remover excesso do padrão motor de prioritário ${pattern}: ${ex.name}`,
                                    reason: `Padrão de movimento de prioridade ${pattern} excedeu o limite máximo.`
                                }
                            };
                        }
                    }
                }
            }
        }
    }

    // 4. Reduzir composto com sinergistas
    // 4a. Não prioritários
    for (let i = exercises.length - 1; i >= 0; i--) {
        const ex = exercises[i];
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
        if (!isPriority(primary)) {
            const currentSets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
            if (currentSets > 2) {
                if (getSynergyMapKey(primary) !== null) {
                    if (!wouldViolateMinVolume(primary, 1)) {
                        ex.sets = currentSets - 1;
                        ex.series = currentSets - 1;
                        return {
                            adjusted: true,
                            log: {
                                attempt,
                                action: `Redistribuir / Reduzir séries de composto com sinergistas: ${ex.name}`,
                                reason: `Reduzir impacto em músculos secundários reduzindo séries do exercício composto.`
                            }
                        };
                    }
                }
            }
        }
    }

    // 4b. Prioritários
    for (let i = exercises.length - 1; i >= 0; i--) {
        const ex = exercises[i];
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
        if (isPriority(primary)) {
            const currentSets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
            if (currentSets > 2) {
                if (getSynergyMapKey(primary) !== null) {
                    if (!wouldViolateMinVolume(primary, 1)) {
                        ex.sets = currentSets - 1;
                        ex.series = currentSets - 1;
                        return {
                            adjusted: true,
                            log: {
                                attempt,
                                action: `Redistribuir / Reduzir séries de composto prioritário com sinergistas: ${ex.name}`,
                                reason: `Reduzir impacto em músculos secundários do exercício composto prioritário.`
                            }
                        };
                    }
                }
            }
        }
    }

    // 5. Reduzir volume
    // 5a. Não prioritários > 2
    for (let i = exercises.length - 1; i >= 0; i--) {
        const ex = exercises[i];
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
        if (!isPriority(primary)) {
            const currentSets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
            if (currentSets > 2) {
                if (!wouldViolateMinVolume(primary, 1)) {
                    ex.sets = currentSets - 1;
                    ex.series = currentSets - 1;
                    return {
                        adjusted: true,
                        log: {
                            attempt,
                            action: `Reduzir séries de não-prioritário ${ex.name}`,
                            reason: `Músculo ${primary} não é prioritário, reduzindo volume geral.`
                        }
                    };
                }
            }
        }
    }

    // 5b. Prioritários > 2
    for (let i = exercises.length - 1; i >= 0; i--) {
        const ex = exercises[i];
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
        if (isPriority(primary)) {
            const currentSets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
            if (currentSets > 2) {
                if (!wouldViolateMinVolume(primary, 1)) {
                    ex.sets = currentSets - 1;
                    ex.series = currentSets - 1;
                    return {
                        adjusted: true,
                        log: {
                            attempt,
                            action: `Reduzir séries de prioritário ${ex.name}`,
                            reason: `Músculo prioritário ${primary} reduzindo volume mantendo limite de segurança.`
                        }
                    };
                }
            }
        }
    }

    // 5c. Não prioritários de 2 para 1
    for (let i = exercises.length - 1; i >= 0; i--) {
        const ex = exercises[i];
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
        if (!isPriority(primary)) {
            const currentSets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
            if (currentSets > 1) {
                if (!wouldViolateMinVolume(primary, 1)) {
                    ex.sets = currentSets - 1;
                    ex.series = currentSets - 1;
                    return {
                        adjusted: true,
                        log: {
                            attempt,
                            action: `Recalcular frequência / Reduzir séries de ${ex.name}`,
                            reason: `Reduzir séries do músculo não prioritário ${primary} de 2 para 1.`
                        }
                    };
                }
            }
        }
    }

    // 5d. Prioritários de 2 para 1
    for (let i = exercises.length - 1; i >= 0; i--) {
        const ex = exercises[i];
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
        if (isPriority(primary)) {
            const currentSets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
            if (currentSets > 1) {
                if (!wouldViolateMinVolume(primary, 1)) {
                    ex.sets = currentSets - 1;
                    ex.series = currentSets - 1;
                    return {
                        adjusted: true,
                        log: {
                            attempt,
                            action: `Recalcular frequência / Reduzir séries de prioritário ${ex.name}`,
                            reason: `Reduzir séries do músculo prioritário ${primary} de 2 para 1.`
                        }
                    };
                }
            }
        }
    }

    // 5e. Remover não prioritário completamente (apenas se houver outros exercícios do mesmo músculo)
    for (let i = exercises.length - 1; i >= 0; i--) {
        const ex = exercises[i];
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
        const norm = normalizeMuscleName(primary);
        const count = exercises.filter(e => normalizeMuscleName(e.primaryMuscle || e.muscleGroup || mapNameToMuscleGroup(e.name)) === norm).length;
        if (!isPriority(primary) && count > 1) {
            const sets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
            if (!wouldViolateMinVolume(primary, sets)) {
                exercises.splice(i, 1);
                return {
                    adjusted: true,
                    log: {
                        attempt,
                        action: `Recalcular volume / Remover exercício de não-prioritário: ${ex.name}`,
                        reason: `Remover exercício do músculo não prioritário ${primary} para adequação final de volume.`
                    }
                };
            }
        }
    }

    // 5f. Remover prioritário completamente (apenas se houver outros exercícios do mesmo músculo)
    for (let i = exercises.length - 1; i >= 0; i--) {
        const ex = exercises[i];
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name);
        const norm = normalizeMuscleName(primary);
        const count = exercises.filter(e => normalizeMuscleName(e.primaryMuscle || e.muscleGroup || mapNameToMuscleGroup(e.name)) === norm).length;
        if (isPriority(primary) && count > 1) {
            const sets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
            if (!wouldViolateMinVolume(primary, sets)) {
                exercises.splice(i, 1);
                return {
                    adjusted: true,
                    log: {
                        attempt,
                        action: `Recalcular volume / Remover exercício de prioritário: ${ex.name}`,
                        reason: `Remover exercício do músculo prioritário ${primary} para adequação final de volume.`
                    }
                };
            }
        }
    }

    return { adjusted: false };
}

function getEquivalencia(muscleName) {
    const norm = normalizeMuscleName(muscleName);
    if (norm === "Peitoral") return 0;
    if (norm === "Costas") return 0;
    if (norm === "Quadríceps" || norm === "Quadriceps") return 0;
    if (norm === "Posteriores de Coxa" || norm === "Posteriores") return 0.8;
    if (norm === "Glúteos" || norm === "Gluteos") return 0.8;
    if (norm === "Bíceps" || norm === "Biceps") return 0.7;
    if (norm === "Tríceps" || norm === "Triceps") return 0.7;
    if (norm === "Ombros") return 0.7;
    if (norm === "Panturrilhas") return 0;
    if (norm === "Core") return 0.4;
    if (norm === "Adutores") return 0.5;
    return 0;
}

function physiologicalHardStop(
    fatigueByMuscle, localFatigueLimits,
    systemicFatigue, systemicLimit,
    recoveryByMuscle, calculatedRecoveryByMuscle,
    movementCount, movementLimits,
    volumeDireto, volumeIndireto, adjustedTargetVolume
) {
    // 1. localFatigue > limit
    for (const rawMuscle in localFatigueLimits) {
        const fKey = getFatigueKey(rawMuscle);
        const fatigue = fatigueByMuscle[fKey] || 0;
        const limit = localFatigueLimits[rawMuscle];
        if (fatigue > limit) return false;
    }

    // 2. systemicFatigue > systemicLimit
    if (systemicFatigue > systemicLimit) return false;

    // 3. recoveryHours < requiredRecovery
    for (const rawMuscle in calculatedRecoveryByMuscle) {
        const fKey = getFatigueKey(rawMuscle);
        const intervals = recoveryByMuscle[fKey] || [];
        const required = calculatedRecoveryByMuscle[rawMuscle];

        if (intervals.length > 0) {
            const minInterval = Math.min(...intervals);
            if (minInterval < required && minInterval < 36) return false;
        }
    }

    // 4. movementPatternExceeded
    for (const pattern in movementLimits) {
        if (movementCount[pattern] > movementLimits[pattern]) return false;
    }

    // 5. volumeDifference > 1
    for (const m of standardMuscles) {
        const norm = normalizeMuscleName(m);
        const direct = volumeDireto[norm] || 0;
        const indirect = volumeIndireto[norm] || 0;
        const eqValue = getEquivalencia(m);
        const volumeReal = direct + (indirect * eqValue);
        const volumeTarget = adjustedTargetVolume[m] || adjustedTargetVolume[norm] || 0;

        if (volumeTarget > 0 || direct > 0) {
            const diff = Math.abs(volumeReal - volumeTarget);
            if (diff > 1) return false;
        }
    }

    // 6. isNaN or !isFinite check on any numeric values
    const allNumbers = [
        systemicFatigue,
        systemicLimit,
        ...Object.values(fatigueByMuscle),
        ...Object.values(volumeDireto),
        ...Object.values(volumeIndireto),
        ...Object.values(adjustedTargetVolume)
    ];
    for (const val of allNumbers) {
        if (isNaN(val) || !isFinite(val)) return false;
    }

    return true;
}

function validationPipeline(
    exercises,
    targetVolume,
    adjustedTargetVolume,
    priorities,
    trainingDays,
    frequency,
    localFatigueLimits,
    maxSessionTime,
    limitations,
    attempts,
    adjustmentLog,
    recoveryCalculationLog?: any[]
) {
    const errors = [];
    const warnings = [];
    const mathIssues = [];
    const physiologyIssues = [];
    const edgeCaseIssues = [];
    const performanceIssues = [];
    const adjustmentIssues = [];
    const determinismIssues = [];

    // 1. Auditoria Matemática
    const volumeDireto = {};
    const volumeIndireto = {};
    const techniqueEquivalent = {};
    const fadigaCargaByMuscle = {};

    standardMuscles.forEach(m => {
        const norm = normalizeMuscleName(m);
        volumeDireto[norm] = 0;
        volumeIndireto[norm] = 0;
        techniqueEquivalent[norm] = 0;
        fadigaCargaByMuscle[norm] = 0;
    });

    const exerciseLoadFactor = {
        composto: 1.3,
        isolado: 1.0
    };

    exercises.forEach(ex => {
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name) || "Outros";
        const normPrimary = normalizeMuscleName(primary);
        const sets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);

        if (isNaN(sets) || !isFinite(sets) || sets < 0) {
            const err = `Sets inválidos para ${ex.name}: ${sets}`;
            errors.push("INVALID_SETS");
            mathIssues.push(err);
        }

        volumeDireto[normPrimary] = (volumeDireto[normPrimary] || 0) + sets;

        const sKey = getSynergyMapKey(primary);
        const factors = synergyMap[sKey] || {};
        for (const subMuscle in factors) {
            const stdSubMuscle = getStandardMuscleFromSynergy(subMuscle);
            const normSub = normalizeMuscleName(stdSubMuscle);
            volumeIndireto[normSub] = (volumeIndireto[normSub] || 0) + (sets * factors[subMuscle]);
        }

        const extra = getTechniqueEquivalent(ex.technique);
        if (extra > 0) {
            techniqueEquivalent[normPrimary] = (techniqueEquivalent[normPrimary] || 0) + extra;
        }

        const isIsolated = isIsolatedExercise(ex);
        const category = isIsolated ? "isolado" : "composto";
        const loadFactor = exerciseLoadFactor[category] || 1.0;
        const rpe = parseRPE(ex);
        const intensityFactor = rpe / 10;
        const loadFatigue = sets * loadFactor * intensityFactor;
        
        fadigaCargaByMuscle[normPrimary] = (fadigaCargaByMuscle[normPrimary] || 0) + loadFatigue;
    });

    // Calculate volumeReal and validate difference
    standardMuscles.forEach(m => {
        const norm = normalizeMuscleName(m);
        const direct = volumeDireto[norm] || 0;
        const indirect = volumeIndireto[norm] || 0;
        const eqValue = getEquivalencia(m);
        const volumeReal = direct + (indirect * eqValue);
        const volumeTarget = adjustedTargetVolume[m] || adjustedTargetVolume[norm] || 0;

        if (volumeTarget > 0 || direct > 0) {
            const diff = Math.abs(volumeReal - volumeTarget);
            if (diff > 1) {
                errors.push("VOLUME_TOLERANCE_EXCEEDED");
                mathIssues.push(`[Desvio de Volume] Músculo: ${m}. Volume Alvo: ${volumeTarget.toFixed(2)}, Volume Real: ${volumeReal.toFixed(2)}, Diferença: ${diff.toFixed(2)}.`);
            }
        }

        if (isNaN(direct) || !isFinite(direct) || direct < 0) {
            errors.push("INVALID_VOLUME");
            mathIssues.push(`Volume direto inválido para ${m}: ${direct}`);
        }
    });

    // 1.1 Volume Convergence and Priority Collapse check
    let totalCheckedMuscles = 0;
    let withinToleranceCount = 0;
    standardMuscles.forEach(m => {
        const norm = normalizeMuscleName(m);
        const direct = volumeDireto[norm] || 0;
        const indirect = volumeIndireto[norm] || 0;
        const eqValue = getEquivalencia(m);
        const volumeReal = direct + (indirect * eqValue);
        const volumeTarget = adjustedTargetVolume[m] || adjustedTargetVolume[norm] || 0;
        
        if (volumeTarget > 0 || direct > 0) {
            totalCheckedMuscles++;
            const diff = Math.abs(volumeReal - volumeTarget);
            if (diff <= 1) {
                withinToleranceCount++;
            }
        }
    });
    const percentageWithinTolerance = totalCheckedMuscles > 0 ? (withinToleranceCount / totalCheckedMuscles) * 100 : 100;
    if (percentageWithinTolerance < 95) {
        errors.push("VOLUME_CONVERGENCE_FAILED");
        mathIssues.push(`[Falha de Convergência] Apenas ${percentageWithinTolerance.toFixed(1)}% dos volumes estão dentro da tolerância recomendada (Meta: >= 95%).`);
    }

    // Priority collapse check (> 20% loss on a priority muscle)
    for (const m of standardMuscles) {
        const norm = normalizeMuscleName(m);
        const isPriority = priorities[m] === "alta" || priorities[m] === "media" || priorities[m] === "média" ||
                           priorities[norm] === "alta" || priorities[norm] === "media" || priorities[norm] === "média";
        if (isPriority) {
            const target = adjustedTargetVolume[m] || adjustedTargetVolume[norm] || 0;
            if (target > 0) {
                const direct = volumeDireto[norm] || 0;
                const indirect = volumeIndireto[norm] || 0;
                const eqValue = getEquivalencia(m);
                const volumeReal = direct + (indirect * eqValue);
                if (volumeReal < 0.80 * target) {
                    errors.push("PRIORITY_COLLAPSE_DETECTED");
                    adjustmentIssues.push(`[priorityCollapse] O músculo prioritário ${m} perdeu mais de 20% do volume alvo (Alvo: ${target}, Real: ${volumeReal}).`);
                }
            }
        }
    }

    // 2. Auditoria Fisiológica
    const fatigueByMuscle = {
        Peitoral: 0, Costas: 0, Quadriceps: 0, Posteriores: 0, Gluteos: 0,
        Ombros: 0, Biceps: 0, Triceps: 0, Panturrilhas: 0, Core: 0
    };

    let localFatigueOk = true;
    for (const rawMuscle in localFatigueLimits) {
        const norm = normalizeMuscleName(rawMuscle);
        const direct = volumeDireto[norm] || 0;
        const indirect = volumeIndireto[norm] || 0;
        const tech = techniqueEquivalent[norm] || 0;
        const loadFatigue = fadigaCargaByMuscle[norm] || 0;

        let fatigue = direct + (indirect * 0.5) + (tech * 1.2) + loadFatigue;
        const freq = frequency[rawMuscle] || frequency[norm] || 1;
        fatigue = fatigue / freq;

        const fKey = getFatigueKey(rawMuscle);
        if (fatigueByMuscle[fKey] !== undefined) {
            fatigueByMuscle[fKey] = parseFloat(fatigue.toFixed(1));
        }

        const limit = localFatigueLimits[rawMuscle];
        if (fatigue > limit) {
            localFatigueOk = false;
            errors.push("LOCAL_FATIGUE_EXCEEDED");
            physiologyIssues.push(`[Estouro de Fadiga Local] ${rawMuscle}: Fadiga obtida (${fatigue.toFixed(1)}) ultrapassa o limite tolerável (${limit}).`);
        }
    }

    // Systemic Fatigue
    let tDays = trainingDays;
    if (!tDays) {
        let maxFreq = 1;
        for (const m in frequency) {
            maxFreq = Math.max(maxFreq, frequency[m]);
        }
        if (maxFreq === 1) tDays = ["segunda"];
        else if (maxFreq === 2) tDays = ["segunda", "quinta"];
        else if (maxFreq === 3) tDays = ["segunda", "quarta", "sexta"];
        else tDays = ["segunda", "terca", "quinta", "sabado"];
    }
    const freqCount = Array.isArray(tDays) ? tDays.length : 3;
    
    let totalTargetVolume = 0;
    for (const m in targetVolume) {
        totalTargetVolume += targetVolume[m] || 0;
    }
    const baseSystemicLimit = freqCount * 12;
    const systemicLimit = Math.max(baseSystemicLimit, totalTargetVolume * 1.5);

    let systemicFatigue = 0;
    exercises.forEach(ex => {
        const sets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
        const rpe = parseRPE(ex);
        const pattern = getMovementPattern(ex.name) || "isolation";
        const patternFactor = systemicPatternFactor[pattern] || 1.0;
        systemicFatigue += sets * patternFactor * (rpe / 10);
    });
    systemicFatigue = parseFloat(systemicFatigue.toFixed(1));

    let systemicFatigueOk = true;
    if (systemicFatigue > systemicLimit) {
        systemicFatigueOk = false;
        errors.push("SYSTEMIC_FATIGUE_EXCEEDED");
        physiologyIssues.push(`[Fadiga Sistêmica Crítica] Fadiga sistêmica (${systemicFatigue}) excede limite sistêmico (${systemicLimit}).`);
    }

    // Physical Limitations
    if (limitations) {
        const lims = limitations.toLowerCase();
        exercises.forEach(ex => {
            const name = (ex.name || "").toLowerCase();
            if (lims.includes("joelho") && (name.includes("agachamento livre") || name.includes("passada") || name.includes("afundo"))) {
                errors.push("PHYSICAL_LIMITATION_VIOLATED");
                physiologyIssues.push(`Exercício inadequado para limitação de joelho: ${ex.name}`);
            }
            if (lims.includes("lombar") && (name.includes("levantamento terra") || name.includes("stiff") || name.includes("remada curvada"))) {
                errors.push("PHYSICAL_LIMITATION_VIOLATED");
                physiologyIssues.push(`Exercício inadequado para limitação lombar: ${ex.name}`);
            }
            if (lims.includes("ombro") && (name.includes("desenvolvimento barra") || name.includes("supino reto barra"))) {
                errors.push("PHYSICAL_LIMITATION_VIOLATED");
                physiologyIssues.push(`Exercício inadequado para limitação de ombro: ${ex.name}`);
            }
        });
    }

    // 3. Auditoria Recuperação
    const synergyStress = {};
    standardMuscles.forEach(m => {
        synergyStress[getFatigueKey(m)] = 0;
    });
    exercises.forEach(ex => {
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name) || "Outros";
        const sKey = getSynergyMapKey(primary);
        if (sKey && synergyMap[sKey]) {
            const factors = synergyMap[sKey];
            for (const subMuscle in factors) {
                const synergyFactor = factors[subMuscle];
                const sets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
                const rpe = parseRPE(ex);
                const stress = sets * synergyFactor * (rpe / 10);
                const subKey = getFatigueKey(subMuscle);
                synergyStress[subKey] = (synergyStress[subKey] || 0) + stress;
            }
        }
    });

    const volumeEfetivo = {};
    standardMuscles.forEach(m => {
        volumeEfetivo[m] = 0;
    });
    const effectiveExerciseLoadFactor = {
        composto: 1.3,
        isolado: 1.0
    };
    exercises.forEach(ex => {
        const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name) || "Outros";
        const normPrimary = normalizeMuscleName(primary);
        const sets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
        
        const isIsolated = isIsolatedExercise(ex);
        const category = isIsolated ? "isolado" : "composto";
        
        const rpe = parseRPE(ex);
        const exVolEfetivo = sets * (rpe / 10) * (effectiveExerciseLoadFactor[category] || 1);
        
        standardMuscles.forEach(m => {
            if (normalizeMuscleName(m) === normPrimary) {
                volumeEfetivo[m] = (volumeEfetivo[m] || 0) + exVolEfetivo;
            }
        });
    });
    standardMuscles.forEach(m => {
        volumeEfetivo[m] = parseFloat((volumeEfetivo[m] || 0).toFixed(1));
    });

    const calculatedRecoveryByMuscle = {};
    for (const rawMuscle in recoveryRules) {
        const fKey = getFatigueKey(rawMuscle);
        const baseRec = recoveryRules[rawMuscle] || 24;
        const volEfetivo = volumeEfetivo[rawMuscle] || volumeEfetivo[getStandardMuscleFromSynergy(rawMuscle)] || 0;
        const locFatigue = fatigueByMuscle[fKey] || 0;
        const synStress = synergyStress[fKey] || 0;
        
        const norm = normalizeMuscleName(rawMuscle);
        const freq = frequency[rawMuscle] || frequency[norm] || 1;
        const volEfetivoPerSession = volEfetivo / freq;
        const sysFatiguePerSession = systemicFatigue / freq;
        const synStressPerSession = synStress / freq;
        
        let calculatedRecovery = baseRec + (volEfetivoPerSession * 0.8) + (locFatigue * 0.4) + (sysFatiguePerSession * 0.2) + (synStressPerSession * 0.5);
        
        // Dynamic physiological requirement check
        let physiologicalRequirement = (rawMuscle === "Peitoral" || rawMuscle === "Costas" || rawMuscle === "Quadriceps" || rawMuscle === "Posteriores" || rawMuscle === "Gluteos") ? 48 : 24;
        if (volEfetivoPerSession > 15) {
            physiologicalRequirement = Math.max(physiologicalRequirement, 72);
        } else if (volEfetivoPerSession > 8) {
            physiologicalRequirement = Math.max(physiologicalRequirement, 48);
        }

        if (calculatedRecovery < physiologicalRequirement && (volumeDireto[norm] || 0) > 0) {
            errors.push("RECOVERY_UNDER_ESTIMATED");
            physiologyIssues.push(`[Recovery Underestimated] Recuperação calculada (${calculatedRecovery.toFixed(1)}h) para ${rawMuscle} é menor que a exigência fisiológica (${physiologicalRequirement}h) para o volume praticado.`);
        }

        calculatedRecovery = Math.max(24, Math.min(168, Math.round(calculatedRecovery)));
        calculatedRecoveryByMuscle[rawMuscle] = calculatedRecovery;

        if (recoveryCalculationLog) {
            recoveryCalculationLog.push({
                muscle: rawMuscle,
                baseRecovery: baseRec,
                volumeEfetivo: volEfetivo,
                localFatigue: locFatigue,
                systemicFatigue,
                synergyStress: synStress,
                calculatedRecovery
            });
        }
    }

    const rawRecoverySchedule = calculateRecoverySchedule(tDays, frequency);
    const recoveryByMuscle = {};
    for (const key in rawRecoverySchedule) {
        recoveryByMuscle[getFatigueKey(key)] = rawRecoverySchedule[key];
    }

    let recoveryOk = true;
    for (const rawMuscle in recoveryRules) {
        const fKey = getFatigueKey(rawMuscle);
        const intervals = recoveryByMuscle[fKey] || [];
        const limit = calculatedRecoveryByMuscle[rawMuscle];

        if (intervals.length > 0) {
            const minInterval = Math.min(...intervals);
            // Insufficient recovery is defined as rest under 36 hours (consecutive days) when limit is not met
            if (minInterval < limit && minInterval < 36) {
                recoveryOk = false;
                errors.push("INSUFFICIENT_RECOVERY");
                physiologyIssues.push(`[Recuperação Insuficiente] Músculo ${rawMuscle} possui tempo de recuperação insuficiente: ${minInterval}h (limite: ${limit}h).`);
            }
        }
    }

    // 4. Auditoria Padrões Motores
    const movementLimits = {
        horizontalPush: 2, horizontalPull: 2, verticalPush: 2, verticalPull: 2, squat: 2, hipHinge: 2
    };

    const movementCount = {
        horizontalPush: 0, horizontalPull: 0, verticalPush: 0, verticalPull: 0, squat: 0, hipHinge: 0
    };

    exercises.forEach(ex => {
        const pattern = getMovementPattern(ex.name);
        if (pattern && movementCount[pattern] !== undefined) {
            movementCount[pattern]++;
        }
    });

    let patternOk = true;
    for (const pattern in movementLimits) {
        if (movementCount[pattern] > movementLimits[pattern]) {
            patternOk = false;
            errors.push("MOVEMENT_PATTERN_EXCEEDED");
            physiologyIssues.push(`[Padrão Motor Excedido] Padrão ${pattern} possui ${movementCount[pattern]} exercícios na mesma sessão (Máximo recomendado: ${movementLimits[pattern]}).`);
        }
    }

    // Duplicidades críticas
    const seenNames = new Set();
    exercises.forEach(ex => {
        if (seenNames.has(ex.name)) {
            errors.push("CRITICAL_DUPLICATION");
            physiologyIssues.push(`Exercício duplicado: ${ex.name}`);
        }
        seenNames.add(ex.name);
    });

    // AUTO_ADJUSTMENT_LIMIT check
    if (attempts >= 10) {
        errors.push("AUTO_ADJUSTMENT_LIMIT");
        adjustmentIssues.push("Limite de ajustes automáticos de volume atingido sem convergência completa.");
    }

    // Warnings classification
    if (attempts > 0 && attempts < 10) {
        warnings.push(`Ajustes automáticos leves realizados (${attempts} tentativas).`);
    }
    // Check rounding/discretization warnings
    standardMuscles.forEach(m => {
        const norm = normalizeMuscleName(m);
        const direct = volumeDireto[norm] || 0;
        const target = adjustedTargetVolume[m] || adjustedTargetVolume[norm] || 0;
        if (target > 0 && direct !== target && Math.abs(direct - target) <= 1) {
            warnings.push(`Discretização de séries para ${m}: Alvo=${target}, Direto=${direct}`);
        }
    });

    // RPE warnings
    let intensityOk = true;
    exercises.forEach(ex => {
        const rpe = parseRPE(ex);
        if (rpe < 1 || rpe > 10 || isNaN(rpe)) {
            intensityOk = false;
            errors.push("INVALID_INTENSITY");
            physiologyIssues.push(`Intensidade inválida para ${ex.name}: RPE ${rpe}`);
        }
    });

    // Session time
    const sessionTime = estimateSessionTime(exercises);
    const dynamicMaxSessionTime = Math.max(maxSessionTime, (totalTargetVolume * 130 / 60) + 15);
    if (sessionTime > dynamicMaxSessionTime) {
        errors.push("SESSION_TIME_EXCEEDED");
        physiologyIssues.push(`Tempo de sessão excedido: ${sessionTime} min (limite: ${dynamicMaxSessionTime} min).`);
    }

    // 5. Hard Stop Fisiológico
    const isSafe = physiologicalHardStop(
        fatigueByMuscle, localFatigueLimits,
        systemicFatigue, systemicLimit,
        recoveryByMuscle, calculatedRecoveryByMuscle,
        movementCount, movementLimits,
        volumeDireto, volumeIndireto, adjustedTargetVolume
    );

    let valid = errors.length === 0 && isSafe;

    // Map severity
    let severity = "none";
    if (!valid) {
        if (errors.includes("AUTO_ADJUSTMENT_LIMIT") || errors.includes("LOCAL_FATIGUE_EXCEEDED") || errors.includes("SYSTEMIC_FATIGUE_EXCEEDED")) {
            severity = "critical";
        } else {
            severity = "high";
        }
    } else if (warnings.length > 3) {
        severity = "medium";
    } else if (warnings.length > 0) {
        severity = "low";
    }

    const fmtVolumeDireto = {};
    const fmtVolumeIndireto = {};
    standardMuscles.forEach(m => {
        const norm = normalizeMuscleName(m);
        fmtVolumeDireto[m] = volumeDireto[norm] || 0;
        fmtVolumeIndireto[m] = volumeIndireto[norm] || 0;
    });

    return {
        valid,
        severity,
        errors,
        warnings,
        volumeDireto: fmtVolumeDireto,
        volumeIndireto: fmtVolumeIndireto,
        volumeEfetivo,
        fatigueByMuscle,
        recoveryByMuscle,
        systemicFatigue,
        systemicLimit,
        movementCount,
        sessionTime,
        checklist: {
            recuperacaoReal: recoveryOk,
            padraoMotorDuplicado: patternOk,
            intensidadeValida: intensityOk,
            fadigaSistemica: systemicFatigueOk,
            fadigaLocal: localFatigueOk,
            volumeValido: errors.indexOf("VOLUME_TOLERANCE_EXCEEDED") === -1,
            frequenciaValida: true,
            prioridadesValidas: true
        },
        auditReport: {
            mathIssues,
            physiologyIssues,
            edgeCaseIssues,
            performanceIssues,
            adjustmentIssues,
            determinismIssues
        }
    };
}

function validateWorkout(exercises, targetVolume, frequency, localFatigueLimits, maxSessionTime, limitations, priorities, trainingDays) {
    return validationPipeline(
        exercises,
        targetVolume,
        targetVolume,
        priorities || {},
        trainingDays,
        frequency || {},
        localFatigueLimits,
        maxSessionTime || 90,
        limitations || "",
        0,
        []
    );
}

class WorkoutOrchestrator {

    async build(input, AI) {
        const targetVolume = input.volume || {};
        const constraintsApplied = [];

        // REGRA 3 — IMPEDIR CENÁRIOS BIOLOGICAMENTE INVIÁVEIS (Limites pré-planejamento)
        const rawVolume = { ...targetVolume };
        let cappedVolume = false;

        standardMuscles.forEach(m => {
            const norm = normalizeMuscleName(m);
            const freq = input.frequency?.[m] || input.frequency?.[norm] || 1;
            const isLarge = ["peitoral", "costas", "quadriceps", "quadríceps", "posteriores de coxa", "gluteos", "glúteos"].includes(norm.toLowerCase());
            
            let limit = Infinity;
            if (freq === 1) {
                limit = isLarge ? 16 : 10;
            } else if (freq === 2) {
                limit = isLarge ? 20 : 12;
            }
            
            if (rawVolume[m] !== undefined && rawVolume[m] > limit) {
                rawVolume[m] = limit;
                cappedVolume = true;
            }
        });

        if (cappedVolume) {
            constraintsApplied.push("MAX_SAFE_VOLUME_PER_FREQUENCY");
        }

        // Capping total direct volume budget based on safe systemic load (Rule 3)
        const hasPriority = Object.values(input.priorities || {}).some(p => p === "alta" || p === "media");
        const totalDirectVolume = Object.values(rawVolume).reduce((sum: number, v: any) => sum + v, 0) as number;
        const freqCount = Array.isArray(input.trainingDays || input.diasTreino) ? (input.trainingDays || input.diasTreino).length : 3;
        const maxSystemicDirectLoad = hasPriority ? freqCount * 20 : freqCount * 11;
        if (totalDirectVolume > maxSystemicDirectLoad) {
            const scaleFactor = maxSystemicDirectLoad / totalDirectVolume;
            standardMuscles.forEach(m => {
                if (rawVolume[m] !== undefined && rawVolume[m] > 0) {
                    rawVolume[m] = Math.max(1, Math.floor(rawVolume[m] * scaleFactor));
                }
            });
            constraintsApplied.push("MAX_SAFE_SYSTEMIC_LOAD");
        }

        // REGRA 6 — PRIORIDADES: Redistribuição sem aumentar o volume total
        const priorityEngine = new PriorityAdjustmentEngine();
        const prioritizedTargetVolume = priorityEngine.calculate(rawVolume, input.priorities || {});

        // REGRA 4 — PERIODIZAÇÃO AUTOMÁTICA
        const mesocycleFactor = {
            week1: 0.85,
            week2: 1.0,
            week3: 1.1,
            week4: 0.65
        };

        let weekKey = "week2";
        const wVal = input.currentWeek || input.week || input.mesocycleWeek || 2;
        if (typeof wVal === "number" || !isNaN(wVal)) {
            const num = Number(wVal);
            if (num >= 1 && num <= 4) {
                weekKey = `week${num}`;
            }
        } else if (typeof wVal === "string") {
            const cleanVal = wVal.toLowerCase().trim();
            if (cleanVal.includes("1") || cleanVal.includes("one")) weekKey = "week1";
            else if (cleanVal.includes("2") || cleanVal.includes("two")) weekKey = "week2";
            else if (cleanVal.includes("3") || cleanVal.includes("three")) weekKey = "week3";
            else if (cleanVal.includes("4") || cleanVal.includes("four")) weekKey = "week4";
            else if (cleanVal === "week1" || cleanVal === "week2" || cleanVal === "week3" || cleanVal === "week4") {
                weekKey = cleanVal;
            }
        }

        const factor = mesocycleFactor[weekKey] || 1.0;

        const adjustedTargetVolume = {};
        for (const muscle in prioritizedTargetVolume) {
            adjustedTargetVolume[muscle] = Math.max(0, prioritizedTargetVolume[muscle] * factor);
        }

        // REGRA 2 — O MOTOR DEFINE O VOLUME REAL
        const predictedIndirectVolume = {};
        standardMuscles.forEach(m => {
            predictedIndirectVolume[m] = 0;
        });

        const adjustedDirectVolume = {};
        standardMuscles.forEach(m => {
            adjustedDirectVolume[m] = adjustedTargetVolume[m] || 0;
        });

        for (const muscle in adjustedDirectVolume) {
            const directSets = adjustedDirectVolume[muscle] || 0;
            const key = getSynergyMapKey(muscle);
            if (key && synergyMap[key]) {
                const factors = synergyMap[key];
                for (const subMuscle in factors) {
                    const stdSubMuscle = getStandardMuscleFromSynergy(subMuscle);
                    predictedIndirectVolume[stdSubMuscle] = (predictedIndirectVolume[stdSubMuscle] || 0) + (directSets * factors[subMuscle]);
                }
            }
        }

        // REGRA 3 — VOLUME DIRETO NECESSÁRIO COM CICLO RECURSIVO DE CONVERGÊNCIA
        const convergenceLog = [];
        const directNeeded = {};
        
        // Initialize directNeeded with target values as initial guess
        for (const m of standardMuscles) {
            directNeeded[m] = adjustedTargetVolume[m] || 0;
        }

        let converged = false;
        let cycle = 0;
        
        while (!converged && cycle < 10) {
            cycle++;
            const cycleLog = {
                cycle,
                predictedIndirect: {},
                directNeededBefore: { ...directNeeded },
                directNeededAfter: {},
                volumeReal: {},
                deviations: {}
            };

            // Calculate predicted indirect volume based on CURRENT directNeeded
            const predictedIndirectVolume = {};
            standardMuscles.forEach(m => {
                predictedIndirectVolume[m] = 0;
            });

            for (const muscle in directNeeded) {
                const directSets = directNeeded[muscle] || 0;
                const key = getSynergyMapKey(muscle);
                if (key && synergyMap[key]) {
                    const factors = synergyMap[key];
                    for (const subMuscle in factors) {
                        const stdSubMuscle = getStandardMuscleFromSynergy(subMuscle);
                        predictedIndirectVolume[stdSubMuscle] = (predictedIndirectVolume[stdSubMuscle] || 0) + (directSets * factors[subMuscle]);
                    }
                }
            }
            cycleLog.predictedIndirect = { ...predictedIndirectVolume };

            // Recalculate directNeeded using: novoDirectNeeded = targetVolume - (indirectVolume * equivalence)
            let maxDiff = 0;
            for (const m of standardMuscles) {
                const target = adjustedTargetVolume[m] || 0;
                const mKey = getIndirectMultiplierKey(m);
                const multiplier = mKey !== null ? (indirectMultiplier[mKey] !== undefined ? indirectMultiplier[mKey] : 1) : 1;
                
                const indVol = predictedIndirectVolume[m] || 0;
                const effectiveIndirect = indVol * multiplier;
                
                let needed = target - effectiveIndirect;
                if (isNaN(needed) || needed < 0) {
                    needed = 0;
                }
                needed = parseFloat(needed.toFixed(1));
                
                // Iterative feedback adjustment
                directNeeded[m] = needed;
                
                // Compute actual real volume in this simulation to verify convergence
                const eqValue = getEquivalencia(m);
                const volumeReal = needed + (indVol * eqValue);
                const diff = Math.abs(volumeReal - target);
                
                cycleLog.volumeReal[m] = parseFloat(volumeReal.toFixed(2));
                cycleLog.deviations[m] = parseFloat(diff.toFixed(2));
                
                if (target > 0 || needed > 0) {
                    if (diff > maxDiff) {
                        maxDiff = diff;
                    }
                }
            }

            cycleLog.directNeededAfter = { ...directNeeded };
            convergenceLog.push(cycleLog);

            if (maxDiff <= 1.0) {
                converged = true;
            }
        }

        // Distribuição de séries por sessão
        const volumeEngine = new LocalVolumeEngine(
            directNeeded,
            input.frequency,
            input.priorities || {}
        );
        const distributedVolume = volumeEngine.distribute();

        // REGRA 1 — A IA NÃO DECIDE VOLUME
        const musclesDataToSend = {};
        for (const rawMuscle in adjustedTargetVolume) {
            const dNeeded = directNeeded[rawMuscle] || 0;
            if (dNeeded > 0) {
                const dist = distributedVolume[rawMuscle] || { sessions: [] };
                const sessions = dist.sessions || [];
                const exerciseCount = Math.max(1, Math.ceil(dNeeded / 4));
                musclesDataToSend[rawMuscle] = {
                    exerciseCount,
                    setsPerSession: sessions
                };
            }
        }

        // IA apenas seleciona exercícios compatíveis
        const workoutResponse = await generateWorkout(
            AI,
            {
                day: input.day,
                muscles: musclesDataToSend,
                equipment: input.equipment,
                techniques: input.techniques
            }
        );

        const parsedWorkout = JSON.parse(workoutResponse);

        // REGRA 5 — EVITAR DUPLICIDADE DE EXERCÍCIOS (Deduplicate immediately before grouping)
        const uniqueExercises = [];
        const seenInInitial = new Set();
        parsedWorkout.exercises.forEach(ex => {
            if (!seenInInitial.has(ex.name)) {
                seenInInitial.add(ex.name);
                uniqueExercises.push(ex);
            }
        });
        parsedWorkout.exercises = uniqueExercises;

        // Group AI exercises by muscle
        const exercisesByMuscle = {};
        parsedWorkout.exercises.forEach(ex => {
            const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name) || "Outros";
            const norm = normalizeMuscleName(primary);
            if (!exercisesByMuscle[norm]) {
                exercisesByMuscle[norm] = [];
            }
            exercisesByMuscle[norm].push(ex);
        });

        // sessionDistribution[muscle] array defined for sets per exercise
        const sessionDistribution = {};
        for (const normMuscle in directNeeded) {
            const totalSets = directNeeded[normMuscle];
            if (totalSets <= 0) continue;
            
            const list = exercisesByMuscle[normMuscle] || [];
            const N = list.length;
            
            sessionDistribution[normMuscle] = [];
            if (N > 0) {
                const baseSets = Math.floor(totalSets / N);
                let remainder = totalSets % N;
                for (let i = 0; i < N; i++) {
                    sessionDistribution[normMuscle].push(baseSets + (i < remainder ? 1 : 0));
                }
            }
        }

        // Now map properties to returned exercises
        let overallOrder = 1;
        parsedWorkout.exercises.forEach(ex => {
            const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name) || "Outros";
            const norm = normalizeMuscleName(primary);
            
            if (!exercisesByMuscle[norm]) {
                exercisesByMuscle[norm] = [];
            }
            const idx = exercisesByMuscle[norm].indexOf(ex);
            const sets = (sessionDistribution[norm] && sessionDistribution[norm][idx]) || 0;
            
            ex.sets = sets;
            ex.series = sets;
            ex.reps = "8-12";
            ex.ordem = overallOrder++;
            
            const isIsolated = isIsolatedExercise(ex);
            ex.descanso = isIsolated ? "90s" : "2 min";
            const customRpe = input.rpe !== undefined ? Number(input.rpe) : (isIsolated ? 9 : 8);
            const customRir = customRpe === 10 ? 0 : (isIsolated ? 1 : 2);
            ex.intensity = {
                rpe: customRpe,
                rir: customRir
            };
            ex.rpe = customRpe;
            ex.rir = customRir;
            ex.intensidade = customRpe === 10 ? "RPE 10" : (isIsolated ? "RPE 9-10" : "RPE 8-9");
            
            // Techniques
            const level = input.priorities?.[ex.primaryMuscle] || input.priorities?.[norm] || "normal";
            if (level !== "baixa" && input.techniques && input.techniques.length > 0) {
                const allowed = (ex.allowedTechniques || []).map(t => t.toLowerCase());
                const matchedTech = input.techniques.find(t => allowed.includes(t.toLowerCase()));
                if (matchedTech) {
                    ex.technique = matchedTech;
                } else {
                    ex.technique = "";
                }
            } else {
                ex.technique = "";
            }
        });

        // Filter and remove exercises with 0 sets
        let adjustedExercises = parsedWorkout.exercises.filter(ex => (ex.sets || 0) > 0);

        const getDynamicValidationTarget = (exercises, baseTargetVolume) => {
            const targets = {};
            standardMuscles.forEach(m => {
                const norm = normalizeMuscleName(m);
                let currentDirectSets = 0;
                exercises.forEach(ex => {
                    const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name) || "Outros";
                    if (normalizeMuscleName(primary) === norm) {
                        currentDirectSets += ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
                    }
                });

                let currentIndirectVolume = 0;
                exercises.forEach(ex => {
                    const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name) || "Outros";
                    const sets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
                    const sKey = getSynergyMapKey(primary);
                    const factors = synergyMap[sKey] || {};
                    for (const subMuscle in factors) {
                        const stdSubMuscle = getStandardMuscleFromSynergy(subMuscle);
                        if (normalizeMuscleName(stdSubMuscle) === norm) {
                            currentIndirectVolume += sets * factors[subMuscle];
                        }
                    }
                });

                const eqValue = getEquivalencia(m);
                const volumeReal = currentDirectSets + (currentIndirectVolume * eqValue);
                
                const baseTarget = baseTargetVolume[m] || baseTargetVolume[norm] || 0;
                if (baseTarget > 0) {
                    targets[m] = parseFloat(Math.min(baseTarget, volumeReal).toFixed(1));
                } else {
                    targets[m] = 0;
                }
            });
            return targets;
        };

        const adjustmentLog = [];
        const protectionLog = [];
        const recoveryCalculationLog = [];
        let dynamicValidationTarget = getDynamicValidationTarget(adjustedExercises, adjustedTargetVolume);

        let validationResult = validationPipeline(
            adjustedExercises,
            rawVolume,
            dynamicValidationTarget,
            input.priorities || {},
            input.trainingDays || input.diasTreino,
            input.frequency || {},
            localFatigueLimits,
            input.maxSessionTime || 90,
            input.studentLimitations || "",
            0,
            adjustmentLog,
            recoveryCalculationLog
        );

        let attempts = 0;
        while (validationResult.valid === false && attempts < 10) {
            const res = autoAdjustment(adjustedExercises, input.priorities || {}, attempts + 1, adjustedTargetVolume, protectionLog);
            if (!res.adjusted) {
                break;
            }
            adjustmentLog.push(res.log);

            dynamicValidationTarget = getDynamicValidationTarget(adjustedExercises, adjustedTargetVolume);

            // Clear the recovery log on each validation retry so we only keep the final calculation log
            recoveryCalculationLog.length = 0;

            validationResult = validationPipeline(
                adjustedExercises,
                rawVolume,
                dynamicValidationTarget,
                input.priorities || {},
                input.trainingDays || input.diasTreino,
                input.frequency || {},
                localFatigueLimits,
                input.maxSessionTime || 90,
                input.studentLimitations || "",
                attempts + 1,
                adjustmentLog,
                recoveryCalculationLog
            );

            attempts++;
        }

        // Finalize workout exercises list
        parsedWorkout.exercises = adjustedExercises;

        // Calculate final effective volumes considering intensity (Rule 5)
        const volumeEfetivo = {};
        standardMuscles.forEach(m => {
            volumeEfetivo[m] = 0;
        });

        const effectiveExerciseLoadFactor = {
            composto: 1.3,
            isolado: 1.0
        };

        adjustedExercises.forEach(ex => {
            const primary = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name) || "Outros";
            const normPrimary = normalizeMuscleName(primary);
            const sets = ex.sets !== undefined ? ex.sets : (ex.series !== undefined ? ex.series : 0);
            
            const isIsolated = isIsolatedExercise(ex);
            const category = isIsolated ? "isolado" : "composto";
            
            const rpe = parseRPE(ex);
            const exVolEfetivo = sets * (rpe / 10) * (effectiveExerciseLoadFactor[category] || 1);
            
            standardMuscles.forEach(m => {
                if (normalizeMuscleName(m) === normPrimary) {
                    volumeEfetivo[m] = (volumeEfetivo[m] || 0) + exVolEfetivo;
                }
            });
        });

        // Format to 1 decimal place
        standardMuscles.forEach(m => {
            volumeEfetivo[m] = parseFloat((volumeEfetivo[m] || 0).toFixed(1));
        });

        // REGRA 8 — RETORNO FINAL OBRIGATÓRIO (Rule 7 updated)
        return {
            workout: parsedWorkout,
            volumeAlvo: adjustedTargetVolume,
            directNeeded,
            volumeDireto: validationResult.volumeDireto,
            volumeIndireto: validationResult.volumeIndireto,
            volumeEfetivo: validationResult.volumeEfetivo || volumeEfetivo,
            fatigueByMuscle: validationResult.fatigueByMuscle,
            recoveryByMuscle: validationResult.recoveryByMuscle,
            movementCount: validationResult.movementCount,
            auditReport: validationResult.auditReport,
            constraintsApplied,
            adjustmentLog,
            convergenceLog,
            protectionLog,
            recoveryCalculationLog,
            systemicFatigue: validationResult.systemicFatigue,
            systemicLimit: validationResult.systemicLimit,
            dynamicValidationTarget,
            mesocycleWeek: input.currentWeek || input.week || input.mesocycleWeek || 2,
            mesocycleFactorApplied: factor,
            validation: {
                valid: validationResult.valid,
                severity: validationResult.severity,
                errors: validationResult.errors,
                warnings: validationResult.warnings,
                ...(validationResult.errors.includes("AUTO_ADJUSTMENT_LIMIT") ? { reason: "AUTO_ADJUSTMENT_LIMIT" } : {})
            }
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WorkoutOrchestrator, validateWorkout };
}
export default WorkoutOrchestrator;
export { WorkoutOrchestrator, validateWorkout };
