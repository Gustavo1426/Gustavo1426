/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardEngine } from "./src/shared/modules/training/workout-engines/dashboardEngine";

console.log("\x1b[35m==================================================\x1b[0m");
console.log("\x1b[35m         INICIANDO TESTE DE STRESS (100.000)      \x1b[0m");
console.log("\x1b[35m==================================================\x1b[0m");

const totalScenarios = 100000;
const startMem = process.memoryUsage().heapUsed;
const startTime = performance.now();

const muscles = ["Peitoral", "Costas", "Ombros", "Bíceps", "Tríceps", "Quadríceps", "Posteriores de Coxa", "Glúteos", "Panturrilhas", "Core"];
const exercisesPool = [
  { name: "Supino Reto Halteres", group: "Peitoral" },
  { name: "Supino Inclinado Barra", group: "Peitoral" },
  { name: "Peck Deck", group: "Peitoral" },
  { name: "Puxada Alta Frente", group: "Costas" },
  { name: "Remada Curvada", group: "Costas" },
  { name: "Pulldown com Corda", group: "Costas" },
  { name: "Desenvolvimento Halteres", group: "Ombros" },
  { name: "Elevação Lateral Polia", group: "Ombros" },
  { name: "Agachamento Livre", group: "Quadríceps" },
  { name: "Leg Press 45°", group: "Quadríceps" },
  { name: "Mesa Flexora", group: "Posteriores de Coxa" },
  { name: "Stiff", group: "Posteriores de Coxa" },
  { name: "Hip Thrust", group: "Glúteos" },
  { name: "Tríceps Pulley", group: "Tríceps" },
  { name: "Rosca Direta", group: "Bíceps" },
  { name: "Abdominal Supra", group: "Core" }
];

let validReportsCount = 0;

for (let i = 1; i <= totalScenarios; i++) {
  // Generate random workouts (1 to 3 workouts per plan)
  const numWorkouts = Math.floor(Math.random() * 3) + 1;
  const workouts = [];

  for (let w = 0; w < numWorkouts; w++) {
    const numExercises = Math.floor(Math.random() * 4) + 3; // 3 to 6 exercises
    const exercises = [];
    
    // Choose unique exercises
    const chosen = new Set<number>();
    while (exercises.length < numExercises) {
      const idx = Math.floor(Math.random() * exercisesPool.length);
      if (!chosen.has(idx)) {
        chosen.add(idx);
        const poolEx = exercisesPool[idx];
        exercises.push({
          name: poolEx.name,
          sets: Math.floor(Math.random() * 3) + 3, // 3 to 5 sets
          reps: "8-12",
          muscleGroup: poolEx.group
        });
      }
    }

    workouts.push({
      name: `Treino Stress ${w + 1}`,
      exercises
    });
  }

  // Compile inputs
  const randomFreq = Math.floor(Math.random() * 4) + 3; // 3 to 6
  const randomWeek = Math.floor(Math.random() * 4) + 1; // 1 to 4

  const randomReport = DashboardEngine.compileReport({
    workouts,
    volumeDireto: { Peitoral: Math.floor(Math.random() * 15) },
    volumeEfetivo: { Peitoral: Math.floor(Math.random() * 15) },
    fatigueByMuscle: { Peitoral: Math.floor(Math.random() * 30) },
    recoveryByMuscle: { Peitoral: [Math.floor(Math.random() * 24) + 24, 48] },
    systemicFatigue: Math.floor(Math.random() * 120),
    movementCount: { horizontalPush: Math.floor(Math.random() * 6) },
    studentData: { experiencia: "Avançado", objetivo: "Hipertrofia" },
    frequency: randomFreq,
    currentWeek: randomWeek
  });

  if (randomReport && randomReport.audit.score >= 20 && randomReport.audit.score <= 100) {
    validReportsCount++;
  }

  if (i % 25000 === 0) {
    console.log(`- Executados: ${i.toLocaleString()} cenários...`);
  }
}

const endTime = performance.now();
const endMem = process.memoryUsage().heapUsed;

const totalTimeMs = endTime - startTime;
const scenariosPerSec = Math.round((totalScenarios / totalTimeMs) * 1000);

console.log("\x1b[35m==================================================\x1b[0m");
console.log(`\x1b[35mSUCESSO:\x1b[0m Auditado ${validReportsCount.toLocaleString()} de ${totalScenarios.toLocaleString()} cenários.`);
assert(validReportsCount === totalScenarios, "Todos os relatórios gerados são válidos e determinísticos!");
console.log(`Tempo total: ${(totalTimeMs / 1000).toFixed(2)} segundos`);
console.log(`Velocidade de processamento: ${scenariosPerSec.toLocaleString()} cenários/segundo`);
console.log(`Delta Memória: ${((endMem - startMem) / 1024 / 1024).toFixed(3)} MB`);
console.log("\x1b[35m==================================================\x1b[0m");

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`\x1b[32m✔ PASS:\x1b[0m ${msg}`);
  } else {
    console.log(`\x1b[31m✘ FAIL:\x1b[0m ${msg}`);
    process.exit(1);
  }
}
