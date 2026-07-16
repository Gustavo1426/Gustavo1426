/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SCORE TYPES
 * ============================================================================
 */

export type IGBClassification = "excellent" | "good" | "attention" | "critical";

export interface BiomechanicalScore {
  overall: number;       // O IGB Final (0-100)
  posture: number;       // Nota da Postura Estática (0-100)
  symmetry: number;      // Nota de Simetria Bilateral (0-100)
  alignment: number;     // Nota de Alinhamento Central/Plumbline (0-100)
  mobility: number;      // Nota de Mobilidade Indireta (0-100)
  risk: number;          // Nota de Risco (100 = risco mínimo, 0 = risco máximo)
  classification: IGBClassification;
  feedbackMessage: string;
}

// Pesos oficiais do Índice Global Biomecânico (IGB)
export const SCORE_WEIGHTS = {
  posture: 0.30,
  symmetry: 0.25,
  alignment: 0.20,
  mobility: 0.15,
  risk: 0.10
} as const;
