/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: DIGITAL TWIN CORE ORCHESTRATOR
 * ============================================================================
 */

import { DigitalTwin, TwinSnapshot } from "../types/digitalTwin.types";
import { TwinEvent, applyEventToTwin } from "./twinUpdater";
import { createTwinSnapshot } from "./twinVersioning";

/**
 * Controlador principal do Digital Twin.
 * Recebe o estado atual do banco, aplica o evento, gera o Snapshot histórico e devolve o novo estado.
 */
export async function processTwinEvent(
  currentTwinState: DigitalTwin, 
  event: TwinEvent
): Promise<{ newTwinState: DigitalTwin; snapshot: TwinSnapshot }> {
  
  try {
    console.log(`[Digital Twin Engine] Processando evento: ${event.type}`);

    // 1. Aplica a mutação de estado baseada no evento recebido
    const newTwinState = applyEventToTwin(currentTwinState, event);

    // 2. Cria o registro histórico imutável (Timeline)
    const snapshot = createTwinSnapshot(newTwinState, event.type);

    // TODO em produção: Salvar 'newTwinState' no Firestore (Sobrescrevendo o doc atual)
    // TODO em produção: Salvar 'snapshot' em uma subcoleção 'history' para formar a linha do tempo

    return {
      newTwinState,
      snapshot
    };

  } catch (error) {
    console.error("[Digital Twin Engine] Falha ao atualizar o gêmeo digital.", error);
    throw error;
  }
}
