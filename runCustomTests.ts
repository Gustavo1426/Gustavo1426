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

console.log("\x1b[35m====================================================================\x1b[0m");
console.log("\x1b[35m          INICIANDO SUÍTE DE TESTES AVANÇADOS E EXCLUSIVOS          \x1b[0m");
console.log("\x1b[35m====================================================================\x1b[0m");

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

// 1. TESTES UNITÁRIOS
console.log("\n\x1b[34;1m[FASE 1] TESTES UNITÁRIOS ESPECÍFICOS\x1b[0m");

// Teste Unitário 1.1: AdherenceEngine com Perfeita Aderência
const adPerfect = AdherenceEngine.calculate({
  missedWorkouts: 0,
  incompleteWorkouts: 0,
  actualTime: 60,
  ignoredExercises: 0,
  reportedRpeDiff: 0,
  painLevel: 0,
  painArea: "Nenhuma",
  punctualityDelay: 0
});
assert(adPerfect.score === 100, "Aderência perfeita: Score deve ser exatamente 100");

// Teste Unitário 1.2: AdherenceEngine com Faltas e Dor
const adSevere = AdherenceEngine.calculate({
  missedWorkouts: 2,
  incompleteWorkouts: 1,
  actualTime: 45,
  ignoredExercises: 3,
  reportedRpeDiff: 2,
  painLevel: 7,
  painArea: "Ombro",
  punctualityDelay: 15
});
assert(adSevere.score < 60, `Aderência severamente prejudicada calculada: ${adSevere.score}% (deve ser < 60)`);

// Teste Unitário 1.3: RecoveryPredictionEngine - Risco Crítico de Overreaching
const recCritical = RecoveryPredictionEngine.predict({
  systemicFatigue: 130,
  fatigueByMuscle: { Peitoral: 25 },
  recoveryByMuscle: { Peitoral: [12, 24] },
  currentWeek: 3
});
assert(recCritical.fatigueRisk === "Alto", `Predição de risco crítico com fadiga sistêmica 130: ${recCritical.fatigueRisk}`);

// Teste Unitário 1.4: RecoveryPredictionEngine - Risco Baixo
const recSafe = RecoveryPredictionEngine.predict({
  systemicFatigue: 30,
  fatigueByMuscle: { Peitoral: 2 },
  recoveryByMuscle: { Peitoral: [48, 48] },
  currentWeek: 1
});
assert(recSafe.fatigueRisk === "Baixo", `Predição de risco seguro com fadiga sistêmica 30: ${recSafe.fatigueRisk}`);


// 2. TESTES DE INTEGRAÇÃO
console.log("\n\x1b[34;1m[FASE 2] TESTES DE INTEGRAÇÃO DO MASTER ENGINE\x1b[0m");

const planIntegration = [
  {
    name: "Treino Costas & Bíceps",
    exercises: [
      { name: "Puxada Alta Frente", sets: 4, reps: "8-12", muscleGroup: "Costas" },
      { name: "Remada Curvada Pronada", sets: 4, reps: "8-12", muscleGroup: "Costas" },
      { name: "Rosca Direta W", sets: 3, reps: "10-12", muscleGroup: "Bíceps" }
    ]
  },
  {
    name: "Treino Quadríceps",
    exercises: [
      { name: "Agachamento Barra Livre", sets: 4, reps: "8-12", muscleGroup: "Quadríceps" },
      { name: "Leg Press 45", sets: 4, reps: "10-12", muscleGroup: "Quadríceps" }
    ]
  }
];

const integrationInput = {
  workouts: planIntegration,
  volumeDireto: { Costas: 8, Bíceps: 3, Quadríceps: 8 },
  volumeIndireto: {},
  volumeEfetivo: { Costas: 8, Bíceps: 3, Quadríceps: 8 },
  fatigueByMuscle: { Costas: 5, Quadríceps: 8 },
  recoveryByMuscle: { Costas: [48, 48], Quadríceps: [48, 48] },
  systemicFatigue: 45,
  movementCount: { horizontalPush: 0, verticalPush: 0, horizontalPull: 4, verticalPull: 4 },
  studentData: { experiencia: "Avançado", objetivo: "Hipertrofia" },
  frequency: 3,
  currentWeek: 2,
  adherence: {
    missedWorkouts: 0,
    incompleteWorkouts: 0,
    actualTime: 60,
    ignoredExercises: 0,
    reportedRpeDiff: 0,
    painLevel: 0,
    painArea: "Nenhuma",
    punctualityDelay: 0
  }
};

const integratedReport = DashboardEngine.compileReport(integrationInput);

assert(integratedReport !== null && typeof integratedReport === "object", "Compilação de relatório integrada retornou um objeto válido");
assert(integratedReport.audit.score > 0 && integratedReport.audit.score <= 100, `Score integrado de auditoria calculado: ${integratedReport.audit.score}%`);
assert(integratedReport.adherence.score === 100, "Aderência integrada default deve ser 100");
assert(integratedReport.quality.score > 50, `Score de qualidade integrado: ${integratedReport.quality.score}%`);


// 3. TESTES DE REGRESSÃO
console.log("\n\x1b[34;1m[FASE 3] TESTES DE REGRESSÃO (PRESERVAÇÃO HISTÓRICA)\x1b[0m");

const regressionPlan = [
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

// O Score biomecânico exato esperado para este plano histórico é 78 (conforme verificado no runTests.ts)
const regressionAuditResult = BiomechanicalAuditEngine.audit(regressionPlan);
assert(regressionAuditResult.score === 78, `Score biomecânico histórico preservado sem regressão: ${regressionAuditResult.score} (esperado: 78)`);
assert(regressionAuditResult.metrics.pushVolume === 26, `Volume de Empurrar histórico preservado sem regressão: ${regressionAuditResult.metrics.pushVolume} (esperado: 26)`);
assert(regressionAuditResult.metrics.pullVolume === 7, `Volume de Puxar histórico preservado sem regressão: ${regressionAuditResult.metrics.pullVolume} (esperado: 7)`);


// 4. TESTES DE DETERMINISMO
console.log("\n\x1b[34;1m[FASE 4] TESTES DE DETERMINISMO (IMUTABILIDADE BYTE-A-BYTE)\x1b[0m");

const detInput = {
  workouts: regressionPlan,
  volumeDireto: { Peitoral: 11, Ombros: 7, Quadríceps: 8, "Posteriores de Coxa": 7 },
  volumeIndireto: {},
  volumeEfetivo: { Peitoral: 11, Ombros: 7, Quadríceps: 8, "Posteriores de Coxa": 7 },
  fatigueByMuscle: { Peitoral: 10 },
  recoveryByMuscle: { Peitoral: [48, 48] },
  systemicFatigue: 50,
  movementCount: { horizontalPush: 8, verticalPush: 3, horizontalPull: 0, verticalPull: 0 },
  studentData: { experiencia: "Intermediário" },
  frequency: 3,
  currentWeek: 2
};

const referenceReport = DashboardEngine.compileReport(detInput);
const referenceSerialized = JSON.stringify(referenceReport);

let isDeterministic = true;
for (let i = 0; i < 500; i++) {
  const trialReport = DashboardEngine.compileReport(detInput);
  if (JSON.stringify(trialReport) !== referenceSerialized) {
    isDeterministic = false;
    break;
  }
}
assert(isDeterministic, "Determinismo de compilação confirmado em 500 execuções idênticas");


// 5. TESTES DE PERFORMANCE
console.log("\n\x1b[34;1m[FASE 5] TESTES DE PERFORMANCE E ESTRESSE TEMPORAL\x1b[0m");

const perfIterations = 10000;
const perfStart = performance.now();

for (let i = 0; i < perfIterations; i++) {
  DashboardEngine.compileReport(detInput);
}

const perfEnd = performance.now();
const totalTimeMs = perfEnd - perfStart;
const averageTimeMs = totalTimeMs / perfIterations;
const opsPerSec = Math.round((perfIterations / totalTimeMs) * 1000);

assert(averageTimeMs < 1.0, `Tempo médio de execução: ${averageTimeMs.toFixed(4)} ms (deve ser < 1.0ms)`);
assert(opsPerSec > 1000, `Rendimento do processador: ${opsPerSec.toLocaleString()} operações/segundo`);

const endMem = process.memoryUsage().heapUsed;
const memoryUsedMB = (endMem - startMem) / 1024 / 1024;

console.log("\n\x1b[35m====================================================================\x1b[0m");
console.log(`\x1b[35mRESUMO FINAL DOS TESTES EXCLUSIVOS:\x1b[0m`);
console.log(`- Testes Passados: ${passed} | Falhados: ${failed}`);
console.log(`- Tempo Médio de Execução da Compilação: \x1b[32;1m${averageTimeMs.toFixed(4)} ms\x1b[0m`);
console.log(`- Vazão do Motor (Throughput): \x1b[32;1m${opsPerSec.toLocaleString()} ops/s\x1b[0m`);
console.log(`- Consumo Incremental de Heap: \x1b[32;1m${memoryUsedMB.toFixed(3)} MB\x1b[0m`);
console.log("\x1b[35m====================================================================\x1b[0m");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
