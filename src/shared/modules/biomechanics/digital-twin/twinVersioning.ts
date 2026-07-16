/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: TWIN VERSIONING & SNAPSHOTS
 * ============================================================================
 */

import { DigitalTwin, TwinSnapshot } from "../types/digitalTwin.types";

/**
 * Cria um retrato imutável do Gêmeo Digital em um momento específico do tempo.
 * Essencial para o 'TwinTimeline' e para a explicabilidade da IA no futuro.
 */
export function createTwinSnapshot(twin: DigitalTwin, triggerEvent: string): TwinSnapshot {
  return {
    snapshotId: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    triggerEvent,
    state: JSON.parse(JSON.stringify(twin)) // Deep copy para imutabilidade
  };
}
