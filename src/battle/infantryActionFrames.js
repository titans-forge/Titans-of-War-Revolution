const cycle = value => ((value % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

// Distance chooses the stride drawing. Stationary units never cycle their feet;
// routed and withdrawing troops can use the same stride while facing their exit.
export function infantryActionFrame(unit, travel, figurePhase = 0) {
  if (!unit?.active || !['steady','routed'].includes(unit.status)) return null;
  const offset = Number.isFinite(figurePhase) ? figurePhase : 0;
  // A fallback is guarded even if contact temporarily stops its movement.
  if (unit.order === 'fallback') return unit.moving || unit.engaged ? {kind:'contact',frame:0} : null;
  if (unit.moving) {
    const phase = cycle((Number.isFinite(travel) ? travel : 0) + Math.sin(offset) * .22);
    return {kind:'march',frame:phase < Math.PI ? 0 : 1};
  }
  if (unit.status === 'steady' && unit.engaged && unit.order !== 'withdraw') {
    // Contact starts from guard; the separate contact-cycle selector chooses
    // the authored thrust only for ranks actually facing an opponent.
    return {kind:'contact',frame:0};
  }
  return null;
}

// Rank selection follows the occupied formation's visible front, including
// formations too depleted to fill a complete row of the original layout.
export function infantryFrontRank(x, frontX, spacing) {
  return [x,frontX,spacing].every(Number.isFinite) && spacing > 0 && Math.abs(x-frontX) <= spacing * 1.05;
}
