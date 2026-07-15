import WorkoutOrchestrator from "./src/shared/modules/training/services/workoutOrchestrator";

const orchestrator = new WorkoutOrchestrator();

// Definição de dados fictícios para caso o script seja executado de forma independente
const input = typeof global !== "undefined" && global.input ? global.input : {
  day: "Segunda-feira",
  volume: { Peitoral: 12, Costas: 12, Tríceps: 6, Bíceps: 6 },
  frequency: { Peitoral: 2, Costas: 2, Tríceps: 2, Bíceps: 2 },
  priorities: { Peitoral: "alta", gluteos: "alta", panturrilhas: "alta" },
  equipment: ["Halteres", "Polia", "Barra"],
  techniques: ["dropSet"],
  maxSessionTime: 60
};

const AI = typeof global !== "undefined" && global.AI ? global.AI : {
  generateContent: async (prompt) => {
    return {
      response: {
        text: () => JSON.stringify({
          exercises: [
            { name: "supinoReto", series: 4, technique: "dropSet" },
            { name: "puxadaAlta", series: 4 }
          ]
        })
      }
    };
  }
};

const result = await orchestrator.build(
  input,
  AI
);

console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);
