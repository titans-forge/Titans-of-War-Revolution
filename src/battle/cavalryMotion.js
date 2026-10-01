// Authored leg poses follow distance travelled, never wall-clock time. Standing,
// blocked and backward-falling formations retain the original standing artwork.
export function cavalryMotionFrame(unit, travel, figurePhase = 0) {
  if (!unit?.active || !['steady', 'routed'].includes(unit.status) || !unit.moving || unit.order === 'fallback') return null;
  const phase = (Number.isFinite(travel) ? travel : 0) + (Number.isFinite(figurePhase) ? figurePhase : 0);
  const wrapped = ((phase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return Math.min(3, Math.floor(wrapped / (Math.PI / 2)));
}
