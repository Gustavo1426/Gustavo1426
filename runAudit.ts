/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardEngine } from "./src/shared/modules/training/workout-engines/dashboardEngine";

console.log("\x1b[33m==================================================\x1b[0m");
console.log("\x1b[33m     INICIANDO TESTE DE DETERMINISMO (1.000)      \x1b[0m");
console.log("\x1b[33m==================================================\x1b[0m");

const plan = [
  {
    name: "Treino A - Peito, Ombro, Tríceps",
    exercises: [
      { name: "Supino Reto Halteres", sets: 4, reps: "8-12", muscleGroup: "Peitoral" },
      { name: "Supino Inclinado Halteres", sets: 4, reps: "8-12", muscleGroup: "Peitoral" },
      { name: "Crossover Alto", sets: 3, reps: "10-15", muscleGroup: "Peitoral" },
      { name: "Desenvolvimento com Halteres", sets: 3, reps: "8-12", muscleGroup: "Ombros" },
      { name: "Elevação Lateral com Cabos", sets: 4, reps: "12-15", muscleGroup: "Ombros" },
      { name: "Tríceps Corda", sets: 3, reps: "10-15", muscleGroup: "Tríceps" }
    ]
  },
  {
    name: "Treino B - Costas e Bíceps",
    exercises: [
      { name: "Puxada Alta Frente", sets: 4, reps: "8-12", muscleGroup: "Costas" },
      { name: "Remada Baixa Máquina Neutra", sets: 4, reps: "8-12", muscleGroup: "Costas" },
      { name: "Crucifixo Invertido com Halteres", sets: 3, reps: "10-15", muscleGroup: "Ombros" },
      { name: "Rosca Martelo com Halteres", sets: 3, reps: "10-12", muscleGroup: "Bíceps" },
      { name: "Rosca Concentrada", sets: 3, reps: "10-12", muscleGroup: "Bíceps" }
    ]
  }
];

const input = {
  workouts: plan,
  volumeDireto: { Peitoral: 11, Costas: 8, Ombros: 7, Tríceps: 3, Bíceps: 6 },
  volumeEfetivo: { Peitoral: 11, Costas: 8, Ombros: 7, Tríceps: 3, Bíceps: 6 },
  fatigueByMuscle: { Peitoral: 12, Costas: 10 },
  recoveryByMuscle: { Peitoral: [48, 48], Costas: [48, 48] },
  systemicFatigue: 62,
  movementCount: { horizontalPush: 8, verticalPush: 3, horizontalPull: 4, verticalPull: 4 },
  studentData: { experiencia: "Intermediário", objetivo: "Hipertrofia" },
  frequency: 3,
  currentWeek: 2
};

const firstReport = DashboardEngine.compileReport(input);
const firstSerialized = JSON.stringify(firstReport);

let isDeterministic = true;
const startTime = performance.now();

for (let i = 0; i < 1000; i++) {
  const currentReport = DashboardEngine.compileReport(input);
  const currentSerialized = JSON.stringify(currentReport);
  
  if (currentSerialized !== firstSerialized) {
    isDeterministic = false;
    break;
  }
}

const endTime = performance.now();

console.log("\x1b[33m==================================================\x1b[0m");
if (isDeterministic) {
  console.log("\x1b[32m✔ DETERMINISMO CONFIRMADO!\x1b[0m");
  console.log(`- Executou 1.000 auditorias biomecânicas idênticas.`);
  console.log(`- Todas as saídas são 100% idênticas byte-a-byte.`);
  console.log(`- Tempo total: ${(endTime - startTime).toFixed(2)} ms`);
  console.log(`- Tempo médio por execução: ${((endTime - startTime) / 1000).toFixed(4)} ms`);
} else {
  console.log("\x1b[31m✘ DESVIOS DETECTADOS!\x1b[0m O comportamento não é determinístico.");
  process.exit(1);
}
console.log("\x1b[33m==================================================\x1b[0m");
process.exit(0);
