import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePhysiologicalVolume } from './workoutOrchestrator';

test('calculatePhysiologicalVolume returns a deterministic volume-only contract', () => {
  const input = {
    objetivo: 'hipertrofia',
    sexo: 'masculino',
    idade: 30,
    peso: 80,
    altura: 180,
    nivel: 'intermediario',
    frequenciaSemanal: 3,
    diasTreino: ['segunda', 'quarta', 'sexta'],
    mesocycleWeek: 2,
    prioridades: {
      Peitoral: 'alta',
      Costas: 'media',
      Quadriceps: 'baixa'
    },
    restricoes: '',
    musculos: ['Peitoral', 'Costas', 'Quadriceps'],
    volumeBase: {
      Peitoral: 12,
      Costas: 10,
      Quadriceps: 14,
      Gluteos: 0,
      Ombros: 0,
      Biceps: 0,
      Triceps: 0,
      'Posteriores de Coxa': 0,
      Panturrilhas: 0,
      Core: 0,
      Adutores: 0
    }
  };

  const first = calculatePhysiologicalVolume(input);
  const second = calculatePhysiologicalVolume(input);

  assert.deepEqual(first, second);
  assert.equal(first.validation.valid, true);
  assert.deepEqual(Object.keys(first), [
    'volumeAlvo',
    'volumeDireto',
    'volumeIndireto',
    'volumeEfetivo',
    'directNeeded',
    'fatigueByMuscle',
    'systemicFatigue',
    'systemicLimit',
    'recoveryByMuscle',
    'movementCount',
    'dynamicValidationTarget',
    'validation',
    'auditReport',
    'adjustmentLog'
  ]);
  assert.ok(first.volumeAlvo.Peitoral > 0);
  assert.ok(first.directNeeded.Peitoral >= 0);
  assert.ok(first.recoveryByMuscle.Peitoral.length > 0);
});
