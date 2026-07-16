/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.5.1: DECISION MEMORY ENGINE - HISTORY
 * ============================================================================
 */

import { DecisionAction, DecisionCategory } from "../types/decisionTypes";

export interface DecisionRecord {
  id: string;
  studentId: string;
  date: string;
  decision: DecisionAction;
  category: DecisionCategory;
  confidence: number;
  reason: string;
  result: "success" | "neutral" | "failure" | "pending";
}
