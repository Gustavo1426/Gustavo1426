import { WorkoutOrchestrator } from "./src/shared/modules/training/services/workoutOrchestrator";
import { normalizeMuscleName } from "./src/shared/modules/training/engines/synergyEngine";

const database = {
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

function getMockExercisesForMuscle(muscle, count) {
    const list = database[muscle] || database[normalizeMuscleName(muscle)] || [
        { name: `${muscle} Exercício`, category: "isolado" }
    ];

    const result = [];
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
    generateContent: async (prompt) => {
        let musclesDict = {};
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

        const exercises = [];
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

async function runScenario(scenarioName, input) {
    const orchestrator = new WorkoutOrchestrator();
    try {
        const res = await orchestrator.build(input, mockAI);
        
        // Count movements by pattern
        const movementCount = {
            horizontalPush: 0, horizontalPull: 0, verticalPush: 0, verticalPull: 0, squat: 0, hipHinge: 0
        };
        const getMovementPattern = (exName) => {
            if (!exName) return null;
            const norm = exName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
            if (norm.includes("supinoreto") || norm.includes("crucifixo") || norm.includes("peckdeck") || norm.includes("voador") || norm.includes("crossunder") || norm.includes("supinoinclinado") || norm.includes("paralelas")) return "horizontalPush";
            if (norm.includes("remadacurvada") || norm.includes("remadabaixa") || norm.includes("remadaarticulada") || norm.includes("remadahorizontal") || norm.includes("remada")) return "horizontalPull";
            if (norm.includes("desenvolvimento") || norm.includes("militar") || norm.includes("desenvolvimentohalteres")) return "verticalPush";
            if (norm.includes("puxadaalta") || norm.includes("barrafixa") || norm.includes("puxadavertical") || norm.includes("puxada")) return "verticalPull";
            if (norm.includes("unilateral") || norm.includes("passada") || norm.includes("afundo") || norm.includes("bulgaro") || norm.includes("avanco")) return "singleLeg";
            if (norm.includes("agachamentolivre") || norm.includes("legpress") || norm.includes("agachamento") || norm.includes("hack")) return "squat";
            if (norm.includes("hipthrust") || norm.includes("elevacaopelvica") || norm.includes("stiff") || norm.includes("levantamentoterra") || norm.includes("terra") || norm.includes("meioterra")) return "hipHinge";
            return null;
        };

        res.workout.exercises.forEach(ex => {
            const pat = getMovementPattern(ex.name);
            if (pat && movementCount[pat] !== undefined) {
                movementCount[pat]++;
            }
        });

        return {
            input,
            volumeDireto: res.volumeDireto,
            volumeIndireto: res.volumeIndireto,
            volumeEfetivo: res.volumeEfetivo,
            fatigueByMuscle: res.fatigueByMuscle,
            systemicFatigue: res.systemicFatigue || 0,
            recoveryByMuscle: res.recoveryByMuscle,
            movementCount,
            validation: res.validation,
            auditReport: res.auditReport
        };
    } catch (err) {
        return {
            input,
            error: err.message,
            stack: err.stack
        };
    }
}

async function startAudit() {
    console.log("=== EXECUTANDO CENÁRIO A ===");
    const scenarioA = await runScenario("Cenário A", {
        goal: "hipertrofia",
        frequency: {
            "Peitoral": 1, "Costas": 1, "Quadríceps": 1, "Posteriores de Coxa": 1, "Glúteos": 1,
            "Bíceps": 1, "Tríceps": 1, "Ombros": 1, "Panturrilhas": 1, "Core": 1, "Adutores": 1
        },
        priorities: {
            "Peitoral": "alta",
            "Costas": "alta"
        },
        volume: {
            "Peitoral": 24, // Capped to 16
            "Costas": 24, // Capped to 16
            "Quadríceps": 10, "Posteriores de Coxa": 10, "Glúteos": 10,
            "Bíceps": 10, "Tríceps": 10, "Ombros": 10, "Panturrilhas": 10, "Core": 10, "Adutores": 10
        },
        trainingDays: ["segunda"],
        currentWeek: 2
    });

    console.log("=== EXECUTANDO CENÁRIO B ===");
    const scenarioB = await runScenario("Cenário B", {
        goal: "hipertrofia",
        frequency: {
            "Peitoral": 2, "Costas": 2, "Quadríceps": 3, "Posteriores de Coxa": 2, "Glúteos": 2,
            "Bíceps": 2, "Tríceps": 2, "Ombros": 2, "Panturrilhas": 2, "Core": 2, "Adutores": 2
        },
        priorities: {
            "Quadríceps": "alta"
        },
        volume: {
            "Peitoral": 10, "Costas": 10, "Quadríceps": 16, "Posteriores de Coxa": 8, "Glúteos": 8,
            "Bíceps": 6, "Tríceps": 6, "Ombros": 8, "Panturrilhas": 6, "Core": 6, "Adutores": 6
        },
        trainingDays: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"],
        currentWeek: 2
    });

    console.log("=== EXECUTANDO CENÁRIO C ===");
    const scenarioC = await runScenario("Cenário C", {
        goal: "emagrecimento",
        frequency: {
            "Peitoral": 2, "Costas": 2, "Quadríceps": 1, "Posteriores de Coxa": 1, "Glúteos": 1,
            "Bíceps": 1, "Tríceps": 1, "Ombros": 1, "Panturrilhas": 1, "Core": 1
        },
        priorities: {},
        volume: {
            "Peitoral": 8, "Costas": 8, "Quadríceps": 6, "Posteriores de Coxa": 6, "Glúteos": 6,
            "Bíceps": 4, "Tríceps": 4, "Ombros": 4, "Panturrilhas": 4, "Core": 4
        },
        studentLimitations: "joelho",
        trainingDays: ["segunda", "quarta", "sexta"],
        currentWeek: 2
    });

    console.log("=== EXECUTANDO CENÁRIO D ===");
    const scenarioD = await runScenario("Cenário D", {
        goal: "hipertrofia",
        frequency: {
            "Peitoral": 2, "Costas": 2, "Quadríceps": 2, "Posteriores de Coxa": 2, "Glúteos": 1,
            "Bíceps": 2, "Tríceps": 2, "Ombros": 2, "Panturrilhas": 1, "Core": 1
        },
        priorities: {
            "Bíceps": "alta",
            "Tríceps": "alta"
        },
        volume: {
            "Peitoral": 10, "Costas": 10, "Quadríceps": 8, "Posteriores de Coxa": 8, "Glúteos": 6,
            "Bíceps": 12, "Tríceps": 12, "Ombros": 8, "Panturrilhas": 6, "Core": 6
        },
        trainingDays: ["segunda", "terca", "quinta", "sabado"],
        currentWeek: 2
    });

    console.log("=== EXECUTANDO CENÁRIO E ===");
    const scenarioE = await runScenario("Cenário E", {
        goal: "hipertrofia",
        frequency: {
            "Peitoral": 3, "Costas": 3, "Quadríceps": 3, "Posteriores de Coxa": 3, "Glúteos": 3,
            "Bíceps": 3, "Tríceps": 3, "Ombros": 3, "Panturrilhas": 3, "Core": 3, "Adutores": 3
        },
        priorities: {
            "Peitoral": "alta",
            "Costas": "alta"
        },
        volume: {
            "Peitoral": 24, "Costas": 24, "Quadríceps": 24, "Posteriores de Coxa": 20, "Glúteos": 20,
            "Bíceps": 16, "Tríceps": 16, "Ombros": 16, "Panturrilhas": 16, "Core": 16, "Adutores": 16
        },
        trainingDays: ["segunda", "quarta", "sexta"], // Systemic limit = 3 * 12 = 36. Capped to maxSystemicDirectLoad = 3 * 20 = 60.
        currentWeek: 2
    });

    const results = {
        "Cenário A": scenarioA,
        "Cenário B": scenarioB,
        "Cenário C": scenarioC,
        "Cenário D": scenarioD,
        "Cenário E": scenarioE
    };

    console.log("\n--- JSON OUTPUT ---");
    console.log(JSON.stringify(results, null, 2));
}

startAudit().catch(console.error);
