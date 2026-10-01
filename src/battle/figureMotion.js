// Visual state follows simulated distance and reload state; it never changes combat.
export function travelPhase(previous, unit, phase = 0) {
  if (!previous || !unit.active) return phase;
  const distance = Math.hypot(unit.x-previous.x, unit.y-previous.y);
  // Ignore spawn/teleport jumps rather than racing through a gait cycle.
  return phase + (distance < 40 ? distance : 0) * (unit.type === 'cavalry' ? .22 : .42);
}
export function firingOrigin(firing, facing) {
  return firing ? (Math.cos(facing) < 0 ? .73 : .27) : .5;
}
export function crewLoading(reload, moving, phase) {
  if (moving || reload <= 0 || reload > 2.7) return {reach:0,lean:0};
  const progress=(2.7-reload)/2.7;
  const effort=Math.sin(progress*Math.PI)**2;
  return {reach:effort*(1.2+.4*Math.sin(phase)),lean:effort*.065};
}

// Motion is sampled from simulation state/time. With originY=1, scale changes
// breathe upward from the boots instead of making feet slide over the ground.
export function infantryBodyMotion(unit, travel, simulationTime, figurePhase = 0) {
  if (!unit?.active || unit.status === 'routed' || unit.status === 'withdrawn') {
    return { x: 0, lift: 0, rotation: 0, scaleY: 1 };
  }
  if (unit.moving) {
    const gait = Math.sin(travel + figurePhase);
    return { x: 0, lift: Math.abs(gait) * .7, rotation: gait * .012, scaleY: 1 };
  }
  if (unit.engaged) {
    const thrust=Math.sin(simulationTime*5+figurePhase);
    const direction=Math.cos(unit.facing||0)>=0?1:-1;
    return {x:direction*thrust*.7,lift:0,rotation:direction*thrust*.012,scaleY:1};
  }
  if (unit.reload > 0) {
    const progress = Math.max(0, Math.min(1, (1.8 - unit.reload) / 1.8));
    const effort = Math.sin(progress * Math.PI) ** 2;
    const variation = .8 + .2 * Math.sin(figurePhase);
    return {
      x: effort * .32 * Math.sin(figurePhase),
      lift: 0,
      rotation: effort * .008 * variation,
      scaleY: 1 - effort * .009 * variation,
    };
  }
  const tempo = unit.engaged ? 1.65 : 1.05;
  const breath = Math.sin(simulationTime * tempo + figurePhase);
  return {
    x: 0,
    lift: 0,
    rotation: breath * (unit.engaged ? .0035 : .0018),
    scaleY: 1 + breath * (unit.engaged ? .0025 : .0035),
  };
}
