// Sampled entirely from authoritative simulation state. Visual timing never
// consumes ammunition or changes the firing interval. Marching and retreating
// troops keep their carry pose; close combat interrupts the weapon cycle.
export function infantryPose(unit, figurePhase = 0) {
  if (!unit?.active || unit.status !== 'steady' || unit.moving || ['withdraw','fallback','reform'].includes(unit.order)) return 'carry';
  if (unit.engaged) return 'contact';
  if (!(unit.volleySerial > 0) || !Number.isFinite(unit.reload) || unit.reload <= 0 || unit.reload > 1.8) return 'carry';
  const ripple = .04 * (1 + Math.sin(Number.isFinite(figurePhase) ? figurePhase : 0));
  const elapsed = 1.8 - unit.reload;
  if (elapsed < .26 + ripple) return 'fire';
  if (unit.ammunition === 0) return 'carry';
  if (unit.reload > .16 + ripple) return 'reload';
  return 'ready';
}

// Compact selected-unit feedback. It describes weapon readiness, not a promise
// that the current target is in range or a queued shot can fire immediately.
export function weaponStatus(unit) {
  if (!unit?.active || unit.status !== 'steady') return 'Weapons unavailable';
  if (unit.engaged) return unit.volleyRequested ? 'Close combat · volley waiting' : 'Close combat · cannot fire';
  if (unit.ammunition === 0) return 'Out of ammunition';
  if (['withdraw','fallback','reform'].includes(unit.order)) return 'Fire suspended by orders';
  const queued=unit.volleyRequested ? ' · volley queued' : '';
  if (unit.type === 'artillery' && unit.moving) return `Moving battery · cannot fire${queued}`;
  if (Number.isFinite(unit.reload) && unit.reload > 0) return `Reloading ${(Math.ceil(unit.reload * 10) / 10).toFixed(1)}s${queued}`;
  return `Loaded${queued}`;
}
