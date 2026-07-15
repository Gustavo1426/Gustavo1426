import { WorkoutOrchestrator } from "./src/shared/modules/training/services/workoutOrchestrator";
import { normalizeMuscleName } from "./src/shared/modules/training/engines/synergyEngine";
import { performance } from "perf_hooks";

const standardMuscles = [
    "Peitoral", "Costas", "Quadríceps", "Posteriores de Coxa", "Glúteos", 
    "Bíceps", "Tríceps", "Ombros", "Panturrilhas", "Core", "Adutores"
];

const database: Record<string, { name: string; category: string }[]> = {
    "Peitoral": [
        { name: "Supino Reto Barra", category: "composto" },
        { name: "Supino Inclinado Halteres", category: "composto" },
        { name: "Peck Deck", category: "isolado" },
        { name: "Crucifixo Reto", category: "isolado" }
    ],
    "Costas": [
        { name: "Barra Fixa", category: "composto" },
        { name: "Remada Curvada", category: "composto" },
        { name: "Puxada Alta", category: "composto" },
        { name: "Pulldown", category: "isolado" }
    ],
    "Quadríceps": [
        { name: "Agachamento Livre", category: "composto" },
        { name: "Leg Press 45", category: "composto" },
        { name: "Cadeira Extensora", category: "isolado" }
    ],
    "Posteriores de Coxa": [
        { name: "Stiff", category: "composto" },
        { name: "Mesa Flexora", category: "isolado" },
        { name: "Cadeira Flexora", category: "isolado" }
    ],
    "Glúteos": [
        { name: "Elevação Pélvica", category: "composto" },
        { name: "Glúteo Cabo", category: "isolado" }
    ],
    "Bíceps": [
        { name: "Rosca Direta", category: "isolado" },
        { name: "Rosca Martelo", category: "isolado" }
    ],
    "Tríceps": [
        { name: "Tríceps Pulley", category: "isolado" },
        { name: "Tríceps Testa", category: "isolado" }
    ],
    "Ombros": [
        { name: "Desenvolvimento Halteres", category: "composto" },
        { name: "Elevação Lateral", category: "isolado" }
    ],
    "Panturrilhas": [
        { name: "Gêmeos em Pé", category: "isolado" },
        { name: "Gêmeos Sentado", category: "isolado" }
    ],
    "Core": [
        { name: "Abdominal Supra", category: "isolado" },
        { name: "Prancha Isométrica", category: "isolado" }
    ],
    "Adutores": [
        { name: "Cadeira Adutora", category: "isolado" }
    ]
};

function getMockExercisesForMuscle(muscle: string, count: number) {
    const list = database[muscle] || database[normalizeMuscleName(muscle)] || [
        { name: `${muscle} Exercício`, category: "isolado" }
    ];

    const result: any[] = [];
    for (let i = 0; i < count; i++) {
        const base = list[i % list.length];
        result.push({
            name: base.name,
            primaryMuscle: muscle,
            secondaryMuscles: muscle === "Peitoral" ? ["Tríceps", "Ombros"] : (muscle === "Costas" ? ["Bíceps", "Ombros"] : []),
            equipment: ["Halter", "Barra", "Polia"],
            category: base.category,
            allowedTechniques: ["restpause", "dropset", "myoreps", "biset"]
        });
    }
    return result;
}

const mockAI = {
    generateContent: async (prompt: string) => {
        let musclesDict: Record<string, any> = {};
        const startIndex = prompt.indexOf("Estrutura de Músculos a Treinar");
        const endIndex = prompt.indexOf("Regras Obrigatórias");
        if (startIndex !== -1 && endIndex !== -1) {
            const jsonSub = prompt.substring(startIndex, endIndex);
            const braceStart = jsonSub.indexOf("{");
            const braceEnd = jsonSub.lastIndexOf("}");
            if (braceStart !== -1 && braceEnd !== -1) {
                try {
                    const jsonStr = jsonSub.substring(braceStart, braceEnd + 1);
                    musclesDict = JSON.parse(jsonStr);
                } catch (e) {
                    // Fallback
                }
            }
        }

        const exercises: any[] = [];
        for (const muscle in musclesDict) {
            const mData = musclesDict[muscle];
            const count = mData.exerciseCount || 1;
            const muscleExs = getMockExercisesForMuscle(muscle, count);
            exercises.push(...muscleExs);
        }

        return {
            response: {
                text: () => JSON.stringify({ exercises })
            }
        };
    }
};

function getEquivalencia(muscleName: string): number {
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

function generateRandomScenario(forceDays: number | null = null) {
    const days = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
    const numDays = forceDays !== null ? forceDays : Math.floor(Math.random() * 7) + 1;
    const trainingDays = [...days].sort(() => 0.5 - Math.random()).slice(0, numDays);

    let maxActiveCount = 1;
    if (numDays > 4) maxActiveCount = 4;
    else if (numDays > 2) maxActiveCount = 3;
    else maxActiveCount = 2;

    const activeCount = Math.floor(Math.random() * maxActiveCount) + 1;
    const shuffled = [...standardMuscles].sort(() => 0.5 - Math.random());
    const activeMuscles = shuffled.slice(0, activeCount);

    const volume: Record<string, number> = {};
    const frequency: Record<string, number> = {};
    const priorities: Record<string, string> = {};

    let remainingTotalVolumeBudget = numDays * 10;

    standardMuscles.forEach(m => {
        if (activeMuscles.includes(m) && remainingTotalVolumeBudget > 0) {
            const limit = Math.min(24, remainingTotalVolumeBudget);
            const vol = Math.floor(Math.random() * (limit + 1));
            volume[m] = vol;
            remainingTotalVolumeBudget -= vol;

            let freq = 1;
            if (vol > 15) {
                freq = Math.min(3, numDays);
            } else if (vol > 7) {
                freq = Math.min(2, numDays);
            }
            frequency[m] = freq;
            priorities[m] = ["alta", "media", "baixa", "nenhuma"][Math.floor(Math.random() * 4)];
        } else {
            volume[m] = 0;
            frequency[m] = 0;
            priorities[m] = "nenhuma";
        }
    });

    const totalVolume = Object.values(volume).reduce((sum: number, v: any) => sum + v, 0) as number;
    if (totalVolume === 0) {
        const fallbackMuscle = standardMuscles[Math.floor(Math.random() * standardMuscles.length)];
        volume[fallbackMuscle] = Math.min(10, numDays * 8);
        frequency[fallbackMuscle] = Math.min(2, numDays);
        priorities[fallbackMuscle] = "alta";
    }

    const limitationsList = ["joelho", "ombro", "lombar", "nenhuma"];
    const limitChoice = limitationsList[Math.floor(Math.random() * limitationsList.length)];
    const studentLimitations = limitChoice === "nenhuma" ? "" : limitChoice;
    const currentWeek = Math.floor(Math.random() * 4) + 1;

    return {
        volume,
        frequency,
        priorities,
        trainingDays,
        studentLimitations,
        currentWeek
    };
}

async function runComprehensiveAudit() {
    const orchestrator = new WorkoutOrchestrator();

    // ==========================================
    // 1. RUN FIXED SCENARIOS
    // ==========================================

    // Scenario A
    const inputA = {
        volume: { Peitoral: 24, Costas: 28 },
        frequency: { Peitoral: 1, Costas: 1 },
        priorities: {},
        trainingDays: ["segunda"],
        currentWeek: 2,
        rpe: 10
    };
    const resA: any = await orchestrator.build(inputA, mockAI);

    // Scenario B
    const inputB = {
        volume: { "Quadríceps": 16, "Posteriores de Coxa": 16 },
        frequency: { "Quadríceps": 2, "Posteriores de Coxa": 2 },
        priorities: { "Quadríceps": "alta", "Posteriores de Coxa": "alta" },
        trainingDays: ["segunda", "quinta"],
        currentWeek: 2,
        rpe: 10
    };
    const resB: any = await orchestrator.build(inputB, mockAI);

    // Scenario C
    const inputC = {
        volume: { 
            "Peitoral": 24, "Costas": 24, "Quadríceps": 24, "Posteriores de Coxa": 20, "Glúteos": 20,
            "Bíceps": 16, "Tríceps": 16, "Ombros": 16, "Panturrilhas": 16, "Core": 16, "Adutores": 16 
        },
        frequency: { 
            "Peitoral": 7, "Costas": 7, "Quadríceps": 7, "Posteriores de Coxa": 7, "Glúteos": 7,
            "Bíceps": 7, "Tríceps": 7, "Ombros": 7, "Panturrilhas": 7, "Core": 7, "Adutores": 7 
        },
        priorities: { "Peitoral": "alta", "Costas": "alta" },
        trainingDays: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"],
        currentWeek: 2
    };
    const resC: any = await orchestrator.build(inputC, mockAI);

    // Format scenarios for "rawExecutionEvidence"
    const formatEvidence = (res: any) => {
        return {
            volumeAlvo: res.volumeAlvo,
            directNeeded: res.directNeeded,
            volumeDireto: res.volumeDireto,
            volumeIndireto: res.volumeIndireto,
            volumeEfetivo: res.volumeEfetivo,
            fatigueByMuscle: res.fatigueByMuscle,
            systemicFatigue: res.systemicFatigue,
            recoveryByMuscle: res.recoveryByMuscle,
            movementCount: res.movementCount,
            adjustmentLog: res.adjustmentLog,
            dynamicValidationTarget: res.dynamicValidationTarget
        };
    };

    const rawExecutionEvidence = {
        scenarioA: formatEvidence(resA),
        scenarioB: formatEvidence(resB),
        scenarioC: formatEvidence(resC)
    };

    // ==========================================
    // 2. 1000 DETERMINISTIC TESTS
    // ==========================================
    let deterministicMatches = 0;
    const baseOutputStr = JSON.stringify(resA);
    for (let i = 0; i < 1000; i++) {
        const currentRes = await orchestrator.build(inputA, mockAI);
        if (JSON.stringify(currentRes) === baseOutputStr) {
            deterministicMatches++;
        }
    }

    // ==========================================
    // 3. 100,000 STRESS TESTS
    // ==========================================
    const stressCount = 100000;
    
    // Trackers for Statistical Evidence
    const deviations: number[] = [];
    const localFatigues: number[] = [];
    const systemicFatigues: number[] = [];
    const recoveryHours: number[] = [];
    const executionTimes: number[] = [];

    let failures = 0;
    const realIssuesFound: string[] = [];

    for (let i = 0; i < stressCount; i++) {
        const scenario = generateRandomScenario();
        const start = performance.now();
        try {
            const result: any = await orchestrator.build(scenario, mockAI);
            const duration = performance.now() - start;
            executionTimes.push(duration);

            if (result && result.validation) {
                // Collect deviations
                const volAlvo = result.volumeAlvo || {};
                const volDireto = result.volumeDireto || {};
                const volIndireto = result.volumeIndireto || {};

                standardMuscles.forEach(m => {
                    const norm = normalizeMuscleName(m);
                    const target = volAlvo[m] || volAlvo[norm] || 0;
                    if (target > 0) {
                        const direct = volDireto[norm] || 0;
                        const indirect = volIndireto[norm] || 0;
                        const eqValue = getEquivalencia(m);
                        const volumeReal = direct + (indirect * eqValue);
                        deviations.push(Math.abs(volumeReal - target));
                    }
                });

                // Collect local fatigues
                if (result.fatigueByMuscle) {
                    Object.values(result.fatigueByMuscle).forEach((f: any) => {
                        localFatigues.push(Number(f) || 0);
                    });
                }

                // Collect systemic fatigue
                if (result.systemicFatigue !== undefined) {
                    systemicFatigues.push(Number(result.systemicFatigue) || 0);
                }

                // Collect recovery hours
                if (result.recoveryByMuscle) {
                    Object.values(result.recoveryByMuscle).forEach((list: any) => {
                        if (Array.isArray(list)) {
                            list.forEach((val: any) => {
                                recoveryHours.push(Number(val) || 0);
                            });
                        }
                    });
                }
            } else {
                failures++;
                realIssuesFound.push(`Empty response or missing validation on run #${i}`);
            }
        } catch (err: any) {
            failures++;
            realIssuesFound.push(`Exception on run #${i}: ${err.message}`);
        }

        // Periodically output progress to avoid timeouts
        if ((i + 1) % 25000 === 0) {
            console.log(`Stress tests progress: ${i + 1}/${stressCount}...`);
        }
    }

    // Sort arrays to compute statistics (median, percentiles)
    deviations.sort((a, b) => a - b);
    localFatigues.sort((a, b) => a - b);
    systemicFatigues.sort((a, b) => a - b);
    recoveryHours.sort((a, b) => a - b);
    executionTimes.sort((a, b) => a - b);

    const getMean = (arr: number[]) => arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
    const getPercentile = (arr: number[], pct: number) => {
        if (arr.length === 0) return 0;
        const idx = Math.floor(arr.length * (pct / 100));
        return arr[Math.min(idx, arr.length - 1)];
    };

    // Statistical Evidence formats
    const statisticalEvidence = {
        volumeDeviation: {
            mean: parseFloat(getMean(deviations).toFixed(4)),
            max: parseFloat((deviations[deviations.length - 1] || 0).toFixed(4)),
            p50: parseFloat(getPercentile(deviations, 50).toFixed(4)),
            p90: parseFloat(getPercentile(deviations, 90).toFixed(4)),
            p95: parseFloat(getPercentile(deviations, 95).toFixed(4)),
            p99: parseFloat(getPercentile(deviations, 99).toFixed(4)),
            percentageWithinTolerance: parseFloat(((deviations.filter(d => d <= 1.0).length / Math.max(1, deviations.length)) * 100).toFixed(2))
        },
        fatigueDistribution: {
            local: {
                mean: parseFloat(getMean(localFatigues).toFixed(4)),
                max: parseFloat((localFatigues[localFatigues.length - 1] || 0).toFixed(4)),
                p50: parseFloat(getPercentile(localFatigues, 50).toFixed(4)),
                p90: parseFloat(getPercentile(localFatigues, 90).toFixed(4)),
                p95: parseFloat(getPercentile(localFatigues, 95).toFixed(4)),
                p99: parseFloat(getPercentile(localFatigues, 99).toFixed(4))
            },
            systemic: {
                mean: parseFloat(getMean(systemicFatigues).toFixed(4)),
                max: parseFloat((systemicFatigues[systemicFatigues.length - 1] || 0).toFixed(4)),
                p50: parseFloat(getPercentile(systemicFatigues, 50).toFixed(4)),
                p90: parseFloat(getPercentile(systemicFatigues, 90).toFixed(4)),
                p95: parseFloat(getPercentile(systemicFatigues, 95).toFixed(4)),
                p99: parseFloat(getPercentile(systemicFatigues, 99).toFixed(4))
            }
        },
        recoveryDistribution: {
            mean: parseFloat(getMean(recoveryHours).toFixed(4)),
            min: parseFloat((recoveryHours[0] || 0).toFixed(4)),
            max: parseFloat((recoveryHours[recoveryHours.length - 1] || 0).toFixed(4)),
            p50: parseFloat(getPercentile(recoveryHours, 50).toFixed(4)),
            p90: parseFloat(getPercentile(recoveryHours, 90).toFixed(4)),
            p95: parseFloat(getPercentile(recoveryHours, 95).toFixed(4)),
            p99: parseFloat(getPercentile(recoveryHours, 99).toFixed(4))
        },
        executionTimeDistribution: {
            meanMs: parseFloat(getMean(executionTimes).toFixed(4)),
            minMs: parseFloat((executionTimes[0] || 0).toFixed(4)),
            maxMs: parseFloat((executionTimes[executionTimes.length - 1] || 0).toFixed(4)),
            p50Ms: parseFloat(getPercentile(executionTimes, 50).toFixed(4)),
            p90Ms: parseFloat(getPercentile(executionTimes, 90).toFixed(4)),
            p95Ms: parseFloat(getPercentile(executionTimes, 95).toFixed(4)),
            p99Ms: parseFloat(getPercentile(executionTimes, 99).toFixed(4))
        }
    };

    const finalVerdict = (failures === 0 && deterministicMatches === 1000) ? "APPROVED" : "REJECTED";

    const finalReport = {
        rawExecutionEvidence,
        statisticalEvidence,
        deterministicMatches,
        stressTestsTotal: stressCount,
        stressTestsFailures: failures,
        realIssuesFound,
        finalVerdict
    };

    console.log("=== COMPREHENSIVE AUDIT RESULT ===");
    console.log(JSON.stringify(finalReport, null, 2));
}

runComprehensiveAudit().catch(err => {
    console.error("Critical error running comprehensive audit:", err);
    process.exit(1);
});
