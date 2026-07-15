/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiomechanicalAuditEngine } from "./src/shared/modules/training/workout-engines/biomechanicalAudit";
import { QualityEngine } from "./src/shared/modules/training/workout-engines/qualityEngine";
import { AdherenceEngine } from "./src/shared/modules/training/workout-engines/adherenceEngine";
import { ProgressionEngine } from "./src/shared/modules/training/workout-engines/progressionEngine";
import { RecoveryPredictionEngine } from "./src/shared/modules/training/workout-engines/recoveryPrediction";
import { ScientificEvidenceEngine } from "./src/shared/modules/training/workout-engines/scientificEvidence";
import { HeatMapEngine } from "./src/shared/modules/training/workout-engines/heatMapEngine";
import { DashboardEngine } from "./src/shared/modules/training/workout-engines/dashboardEngine";

console.log("\x1b[36m==================================================\x1b[0m");
console.log("\x1b[36m          INICIANDO SUÍTE DE TESTES UNITÁRIOS     \x1b[0m");
console.log("\x1b[36m==================================================\x1b[0m");

const startMem = process.memoryUsage().heapUsed;
const startTime = performance.now();

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`\x1b[32m✔ PASS:\x1b[0m ${message}`);
  } else {
    failed++;
    console.log(`\x1b[31m✘ FAIL:\x1b[0m ${message}`);
  }
}

// Mock Workouts
const sampleWorkouts = [
  {
    name: "Treino A - Peitoral e Ombros",
    exercises: [
      { name: "Supino Reto Halteres", sets: 4, reps: "8-12", muscleGroup: "Peitoral" },
      { name: "Supino Inclinado Halteres", sets: 4, reps: "8-12", muscleGroup: "Peitoral" },
      { name: "Peck Deck / Crucifixo Máquina", sets: 3, reps: "10-15", muscleGroup: "Peitoral" },
      { name: "Desenvolvimento com Halteres", sets: 3, reps: "8-12", muscleGroup: "Ombros" },
      { name: "Elevação Lateral na Polia", sets: 4, reps: "12-15", muscleGroup: "Ombros" }
    ]
  },
  {
    name: "Treino B - Membros Inferiores",
    exercises: [
      { name: "Leg Press 45°", sets: 4, reps: "8-12", muscleGroup: "Quadríceps" },
      { name: "Agachamento Hack Machine", sets: 4, reps: "8-12", muscleGroup: "Quadríceps" },
      { name: "Mesa Flexora Bilateral", sets: 4, reps: "10-12", muscleGroup: "Posteriores de Coxa" },
      { name: "Stiff Barra", sets: 3, reps: "8-12", muscleGroup: "Posteriores de Coxa" }
    ]
  }
];

// Test 1: Biomechanical Audit Engine Classification
console.log("\n\x1b[34m[1/8] Testando Classificação de Exercícios...\x1b[0m");
const c1 = BiomechanicalAuditEngine.audit(sampleWorkouts);
assert(c1.score > 0 && c1.score <= 100, `Biomechanical Score calculado com sucesso: ${c1.score}`);
assert(c1.metrics.pushVolume === 26, `Volume de Empurrar correto: ${c1.metrics.pushVolume} séries`);
assert(c1.metrics.pullVolume === 7, `Volume de Puxar correto: ${c1.metrics.pullVolume} séries`);

// Test 2: Quality Engine
console.log("\n\x1b[34m[2/8] Testando Quality Engine...\x1b[0m");
const q1 = QualityEngine.calculate({
  volumeDireto: { Peitoral: 11, Costas: 0, Quadríceps: 8, "Posteriores de Coxa": 7 },
  volumeIndireto: {},
  volumeEfetivo: { Peitoral: 11, Costas: 0, Quadríceps: 8, "Posteriores de Coxa": 7 },
  fatigueByMuscle: {},
  recoveryByMuscle: {},
  systemicFatigue: 50,
  movementCount: { horizontalPush: 8, verticalPush: 3, horizontalPull: 0, verticalPull: 0 },
  studentData: { experiencia: "Intermediário" },
  workouts: sampleWorkouts
});
assert(q1.score > 0, `Qualidade de Treino calculada: ${q1.score}%`);

// Test 3: Adherence Engine
console.log("\n\x1b[34m[3/8] Testando Adherence Engine...\x1b[0m");
const adReport = AdherenceEngine.calculate({
  missedWorkouts: 0,
  incompleteWorkouts: 0,
  actualTime: 60,
  ignoredExercises: 0,
  reportedRpeDiff: 0,
  painLevel: 0,
  painArea: "Nenhuma",
  punctualityDelay: 0
});
assert(adReport.score === 100, `Aderência perfeita retorna Score 100`);

// Test 4: Progression Engine
console.log("\n\x1b[34m[4/8] Testando Progression Engine...\x1b[0m");
const progReport = ProgressionEngine.calculate(sampleWorkouts, { "Supino Reto Halteres": 25 });
assert(progReport.exercises.length > 0, "Lista de exercícios para progressão gerada com sucesso");

// Test 5: Recovery Prediction Engine
console.log("\n\x1b[34m[5/8] Testando Recovery Prediction Engine...\x1b[0m");
const recReport = RecoveryPredictionEngine.predict({
  systemicFatigue: 80,
  fatigueByMuscle: { Peitoral: 15 },
  recoveryByMuscle: { Peitoral: [48, 48] },
  currentWeek: 2
});
assert(recReport.fatigueRisk === "Moderado", "Predição de fadiga funciona corretamente");

// Test 6: Scientific Evidence Engine
console.log("\n\x1b[34m[6/8] Testando Scientific Evidence Engine...\x1b[0m");
const sciReport = ScientificEvidenceEngine.evaluate(sampleWorkouts);
assert(sciReport.score >= 85, "Prescrição baseada em evidências científicas classificada");

// Test 7: Heat Map Engine
console.log("\n\x1b[34m[7/8] Testando Heat Map Engine...\x1b[0m");
const hmReport = HeatMapEngine.calculate({
  volumeEfetivo: { Peitoral: 11, Quadríceps: 8 },
  volumeDireto: { Peitoral: 11, Quadríceps: 8 },
  fatigueByMuscle: { Peitoral: 10 },
  recoveryByMuscle: { Peitoral: [48, 48] },
  frequency: 3
});
assert(hmReport.muscleStatusList["Peitoral"].level === "Ideal", "Status do peitoral classificado como Ideal");

// Test 8: Dashboard Orchestrator
console.log("\n\x1b[34m[8/8] Testando Master Dashboard Engine...\x1b[0m");
const masterReport = DashboardEngine.compileReport({
  workouts: sampleWorkouts,
  volumeDireto: { Peitoral: 11, Quadríceps: 8, "Posteriores de Coxa": 7 },
  volumeIndireto: {},
  volumeEfetivo: { Peitoral: 11, Quadríceps: 8, "Posteriores de Coxa": 7 },
  fatigueByMuscle: { Peitoral: 10 },
  recoveryByMuscle: { Peitoral: [48, 48] },
  systemicFatigue: 50,
  movementCount: { horizontalPush: 8, verticalPush: 3, horizontalPull: 0, verticalPull: 0 },
  studentData: { experiencia: "Intermediário" },
  frequency: 3,
  currentWeek: 2
});
assert(masterReport.audit.score > 0, "Dashboard compilado com sucesso");

const endMem = process.memoryUsage().heapUsed;
const endTime = performance.now();

console.log("\x1b[36m==================================================\x1b[0m");
console.log(`\x1b[36mRESULTADO DOS TESTES:\x1b[0m Passed: ${passed} | Failed: ${failed}`);
console.log(`Tempo total: ${(endTime - startTime).toFixed(2)} ms`);
console.log(`Consumo de Memória: ${((endMem - startMem) / 1024 / 1024).toFixed(3)} MB`);
console.log("\x1b[36m==================================================\x1b[0m");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
