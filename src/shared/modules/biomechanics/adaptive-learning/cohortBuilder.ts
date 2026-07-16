/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: COHORT BUILDER
 * ============================================================================
 */

/**
 * Agrupa alunos em clusters semelhantes para evitar comparações injustas.
 */
export function identifyCohort(studentTwin: any): string {
  const age = studentTwin.identity.age;
  const goal = studentTwin.goals.primaryGoal;
  const exp = studentTwin.identity.experienceLevel;
  
  let ageBracket = "under30";
  if (age >= 30 && age <= 45) ageBracket = "30-45";
  else if (age > 45) ageBracket = "over45";

  // Ex: "cohort_hypertrophy_intermediate_30-45"
  return `cohort_${goal}_${exp}_${ageBracket}`;
}
