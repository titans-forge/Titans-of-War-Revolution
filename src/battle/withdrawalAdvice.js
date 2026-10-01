// Advice only: withdrawal remains available when preserving a unit is urgent.
export function withdrawalAdvice(unit, objective, outcome) {
  const goal = objective?.evacuation;
  if (!goal || (outcome && outcome !== 'undecided') || !unit?.active ||
      unit.side !== 'continental' || unit.status !== 'steady' || unit.order !== 'withdraw') return null;
  const remaining = goal.requiredScreen - goal.screenSeconds;
  if (remaining <= 1e-6) return null;
  return `Delaying action incomplete: ${Math.ceil(remaining)}s still needed under enemy pressure. Withdrawing formations do not count toward the screen. Keep enough troops defending the marked ground; use Hold or a move order to cancel this withdrawal if needed.`;
}
