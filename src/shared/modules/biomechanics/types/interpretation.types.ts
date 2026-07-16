/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: INTERPRETATION TYPES
 * ============================================================================
 */

export interface InterpretationResult {
  findingId: string;
  title: string;
  category: "posture" | "symmetry" | "mobility" | "alignment";
  severity: "low" | "medium" | "high";
  severityDescription: string;
  technicalExplanation: string;
  studentExplanation: string;
  professionalNotes: {
    analysis: string;
    considerations: string[];
  };
  possibleImpacts: string[];
}

export interface TranslationDictionaryEntry {
  technical: string;
  professional: string;
  student: string;
}
