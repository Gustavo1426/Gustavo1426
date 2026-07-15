/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiomechanicalAuditEngine, BiomechanicalAuditReport } from "./biomechanicalAudit";
import { QualityEngine, WorkoutQualityReport } from "./qualityEngine";
import { AdherenceEngine, AdherenceReport, AdherenceData } from "./adherenceEngine";
import { ProgressionEngine, ProgressionReport } from "./progressionEngine";
import { RecoveryPredictionEngine, RecoveryReport } from "./recoveryPrediction";
import { ScientificEvidenceEngine, ScientificEvidenceReport } from "./scientificEvidence";
import { HeatMapEngine, HeatMapReport } from "./heatMapEngine";

export interface DashboardReportInput {
  workouts: any[];
  volumeDireto?: Record<string, number>;
  volumeIndireto?: Record<string, number>;
  volumeEfetivo?: Record<string, number>;
  fatigueByMuscle?: Record<string, number>;
  recoveryByMuscle?: Record<string, number[]>;
  systemicFatigue?: number;
  movementCount?: Record<string, number>;
  studentData: any;
  frequency: number;
  currentWeek: number;
  adherence?: AdherenceData;
  exerciseLoads?: Record<string, number>;
}

export interface ConsolidatedDashboardReport {
  quality: WorkoutQualityReport;
  adherence: AdherenceReport;
  progression: ProgressionReport;
  recovery: RecoveryReport;
  evidence: ScientificEvidenceReport;
  heatMap: HeatMapReport;
  audit: BiomechanicalAuditReport;
}

export class DashboardEngine {
  /**
   * Compiles and coordinates all engines deterministically.
   * Ensures UI code has zero mathematical overhead.
   */
  public static compileReport(input: DashboardReportInput): ConsolidatedDashboardReport {
    const workouts = input.workouts || [];
    const volDireto = input.volumeDireto || {};
    const volIndireto = input.volumeIndireto || {};
    const volEfetivo = input.volumeEfetivo || {};
    const fatByMuscle = input.fatigueByMuscle || {};
    const recByMuscle = input.recoveryByMuscle || {};
    const sysFatigue = input.systemicFatigue || 0;
    const movCount = input.movementCount || {};
    const student = input.studentData || {};
    const freq = input.frequency || 3;
    const week = input.currentWeek || 2;

    const adhData: AdherenceData = input.adherence || {
      missedWorkouts: 1,
      incompleteWorkouts: 1,
      actualTime: 52,
      ignoredExercises: 2,
      reportedRpeDiff: 1.5,
      painLevel: 3,
      painArea: "Ombro Anterior",
      punctualityDelay: 15
    };

    const loads = input.exerciseLoads || {};

    // 1. Audit Engine
    const audit = BiomechanicalAuditEngine.audit(workouts);

    // 2. Quality Engine
    const quality = QualityEngine.calculate({
      volumeDireto: volDireto,
      volumeIndireto: volIndireto,
      volumeEfetivo: volEfetivo,
      fatigueByMuscle: fatByMuscle,
      recoveryByMuscle: recByMuscle,
      systemicFatigue: sysFatigue,
      movementCount: movCount,
      studentData: student,
      workouts
    });

    // 3. Adherence Engine
    const adherence = AdherenceEngine.calculate(adhData);

    // 4. Progression Engine
    const progression = ProgressionEngine.calculate(workouts, loads, {
      rir: student?.rir ?? 2,
      rpe: student?.rpe ?? 8,
      realReps: student?.realReps || {},
      missedWorkouts: adhData.missedWorkouts,
      trainingTime: adhData.actualTime,
      painLevel: adhData.painLevel,
      painArea: adhData.painArea,
      historyPerf: student?.historyPerf || {}
    });

    // 5. Recovery Engine
    const recovery = RecoveryPredictionEngine.predict({
      systemicFatigue: sysFatigue,
      fatigueByMuscle: fatByMuscle,
      recoveryByMuscle: recByMuscle,
      currentWeek: week,
      painLevel: adhData.painLevel,
      missedWorkouts: adhData.missedWorkouts,
      frequency: freq
    });

    // 6. Scientific Evidence Engine
    const evidence = ScientificEvidenceEngine.evaluate(workouts);

    // 7. Heat Map Engine
    const heatMap = HeatMapEngine.calculate({
      volumeEfetivo: volEfetivo,
      volumeDireto: volDireto,
      fatigueByMuscle: fatByMuscle,
      recoveryByMuscle: recByMuscle,
      frequency: freq
    });

    return {
      audit,
      quality,
      adherence,
      progression,
      recovery,
      evidence,
      heatMap
    };
  }
}
