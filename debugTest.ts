import { WorkoutOrchestrator } from "./src/shared/modules/training/services/workoutOrchestrator";

async function debug() {
    const orchestrator = new WorkoutOrchestrator();
    
    // Test 1 input
    const input1 = {
        volume: { Peitoral: 20, Costas: 20, "Bíceps": 10 },
        frequency: { Peitoral: 2, Costas: 2, "Bíceps": 1 },
        priorities: { Peitoral: "alta", Costas: "alta", "Bíceps": "alta" },
        trainingDays: ["segunda", "quarta", "sexta"],
        currentWeek: 2
    };

    const mockAI1 = {
        generateContent: async (prompt: string) => {
            return {
                response: {
                    text: () => JSON.stringify({
                      exercises: [
                        { name: "Supino Reto", primaryMuscle: "Peitoral", category: "composto", allowedTechniques: [] },
                        { name: "Supino Inclinado", primaryMuscle: "Peitoral", category: "composto", allowedTechniques: [] },
                        { name: "Chest Press Maquina", primaryMuscle: "Peitoral", category: "isolado", allowedTechniques: [] },
                        { name: "Fly com Halteres", primaryMuscle: "Peitoral", category: "isolado", allowedTechniques: [] },
                        { name: "Remada Curvada", primaryMuscle: "Costas", category: "composto", allowedTechniques: [] },
                        { name: "Puxada Alta", primaryMuscle: "Costas", category: "composto", allowedTechniques: [] },
                        { name: "Remada Baixa", primaryMuscle: "Costas", category: "composto", allowedTechniques: [] },
                        { name: "Barra Fixa", primaryMuscle: "Costas", category: "composto", allowedTechniques: [] },
                        { name: "Rosca Direta", primaryMuscle: "Biceps", category: "isolado", allowedTechniques: [] }
                      ]
                    })
                }
            };
        }
    };

    console.log("=== RUNNING TEST 1 DEBUG ===");
    const result1 = await orchestrator.build(input1, mockAI1 as any);
    console.log("Result 1 validation errors:", result1.validation.errors);
    console.log("Result 1 validation warnings:", result1.validation.warnings);
    console.log("Result 1 target volume:", result1.volumeAlvo);
    console.log("Result 1 dynamicValidationTarget:", result1.dynamicValidationTarget);
    console.log("Result 1 actual volumes:", {
        Peitoral: (result1.volumeDireto["Peitoral"] || 0) + ((result1.volumeIndireto["Peitoral"] || 0) * 0.5),
        Costas: (result1.volumeDireto["Costas"] || 0) + ((result1.volumeIndireto["Costas"] || 0) * 0.5),
        Biceps: (result1.volumeDireto["Bíceps"] || 0) + ((result1.volumeIndireto["Bíceps"] || 0) * 0.7)
    });
    console.log("Result 1 direct volume:", result1.volumeDireto);
    console.log("Result 1 indirect volume:", result1.volumeIndireto);
    console.log("Result 1 adjustment actions:", result1.adjustmentLog.map((l: any) => l.action));

    // Test 6 input
    const input6 = {
        volume: { Peitoral: 12 },
        frequency: { Peitoral: 2 },
        trainingDays: ["segunda", "quarta"],
        currentWeek: 2
    };

    const mockAI6 = {
        generateContent: async (prompt: string) => {
            return {
                response: {
                    text: () => JSON.stringify({
                      exercises: [
                        { name: "Supino Reto", primaryMuscle: "Peitoral", category: "composto", allowedTechniques: [] },
                        { name: "Supino Reto", primaryMuscle: "Peitoral", category: "composto", allowedTechniques: [] },
                        { name: "Supino Inclinado", primaryMuscle: "Peitoral", category: "composto", allowedTechniques: [] },
                        { name: "Supino Inclinado", primaryMuscle: "Peitoral", category: "composto", allowedTechniques: [] }
                      ]
                    })
                }
            };
        }
    };

    console.log("\n=== RUNNING TEST 6 DEBUG ===");
    const result6 = await orchestrator.build(input6, mockAI6 as any);
    console.log("Result 6 validation:", result6.validation);
    console.log("Result 6 exercises:", result6.workout.exercises);
    console.log("Result 6 adjustmentLog:", result6.adjustmentLog);
}

debug().catch(console.error);
