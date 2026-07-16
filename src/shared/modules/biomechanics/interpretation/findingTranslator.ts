/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: FINDING TRANSLATOR
 * ============================================================================
 */

import { TranslationDictionaryEntry } from "../types/interpretation.types";

export const FindingTranslationDatabase: Record<string, TranslationDictionaryEntry> = {
  shoulder_anteriorization: {
    technical: "Shoulder Protraction",
    professional: "Anteriorização dos ombros",
    student: "Ombros mais projetados para frente"
  },
  thoracic_kyphosis: {
    technical: "Thoracic Kyphosis",
    professional: "Aumento da curvatura torácica aparente",
    student: "Tendência a curvar a parte superior das costas"
  },
  anterior_pelvic_tilt: {
    technical: "Anterior Pelvic Tilt",
    professional: "Anteversão pélvica provável",
    student: "Tendência a empinar o quadril"
  },
  knee_valgus_tendency: {
    technical: "Knee Valgus",
    professional: "Tendência ao valgo dinâmico",
    student: "Tendência dos joelhos apontarem para dentro"
  }
};

/**
 * Traduz um achado com base no dicionário linguístico do sistema.
 */
export function translateFinding(findingId: string, target: "technical" | "professional" | "student"): string {
  const entry = FindingTranslationDatabase[findingId];
  if (!entry) return findingId; // Fallback se não houver tradução cadastrada
  return entry[target];
}
