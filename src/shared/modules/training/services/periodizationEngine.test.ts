import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPeriodizationPlan, auditAndAutoHeal, buildCopilotInterpretation } from './periodizationEngine';

test('buildPeriodizationPlan generates a structured plan from strategy decisions', () => {
  const plan = buildPeriodizationPlan({
    frequency: '5 dias por semana',
    duration: '60 minutos',
    model: 'Periodização Linear',
    objective: 'Hipertrofia',
    references: 'Brad Schoenfeld',
    priorityMuscles: 'Peitoral, Costas',
    maintenanceMuscles: 'Panturrilhas',
    division: '⚡ ABCD Especialização'
  });

  assert.ok(plan.mesociclos.length >= 2);
  assert.ok(plan.microciclos.length >= 4);
  assert.ok(plan.microciclos.some((week) => week.weeklyVolume >= 10));
  assert.ok(plan.mesociclos.some((meso) => meso.deload));
});

test('auditAndAutoHeal reduces unsafe weekly volume and records the correction', () => {
  const initialPlan = buildPeriodizationPlan({
    frequency: '5 dias por semana',
    duration: '60 minutos',
    model: 'Periodização Linear',
    objective: 'Hipertrofia',
    references: 'Brad Schoenfeld',
    priorityMuscles: 'Peitoral, Costas',
    maintenanceMuscles: 'Panturrilhas',
    division: '⚡ ABCD Especialização'
  });

  const result = auditAndAutoHeal(initialPlan, {
    avoid: 'Lesão no ombro',
    sleep: 'Sono restrito',
    stress: 'Elevado',
    recoveryScore: 55
  });

  assert.ok(result.auditLog.length > 0);
  assert.ok(result.microciclos.every((week) => week.weeklyVolume <= 16));
});

test('buildCopilotInterpretation explains engine decisions without inventing a new plan', () => {
  const plan = buildPeriodizationPlan({
    frequency: '5 dias por semana',
    duration: '60 minutos',
    model: 'Periodização Linear',
    objective: 'Hipertrofia',
    references: 'Brad Schoenfeld',
    priorityMuscles: 'Peitoral, Costas',
    maintenanceMuscles: 'Panturrilhas',
    division: '⚡ ABCD Especialização'
  });

  const report = buildCopilotInterpretation(plan, {
    avoid: 'Lesão no ombro',
    sleep: 'Sono restrito',
    stress: 'Elevado',
    recoveryScore: 55
  }, 'Por que existe um deload nesta semana?');

  assert.match(report.summary.toLowerCase(), /engine central|deload|recupera/);
  assert.ok(report.recommendations.length >= 1);
  assert.equal(report.appliesDirectly, false);
});
