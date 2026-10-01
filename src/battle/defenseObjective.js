const combatReady = u => u.active && u.status === 'steady' && u.type !== 'artillery' && u.morale >= 18 && u.cohesion >= 14 && u.strength >= u.initialStrength * .18;
const inside = (u, zone) => u.x >= zone.x1 && u.x <= zone.x2 && u.y >= zone.y1 && u.y <= zone.y2;

export function defenseStatus(engine) {
  const rule = engine.config.defenseObjective;
  if (!rule) return null;
  const army = engine.formations.filter(u => u.side === 'continental' && u.type !== 'artillery');
  const initial = army.reduce((sum,u) => sum + u.initialStrength, 0);
  const fighting = army.filter(u => combatReady(u) && u.order !== 'withdraw');
  const garrison = fighting.filter(u => inside(u, rule.zone));
  const enemies = engine.formations.filter(u => u.side === 'crown' && combatReady(u));
  const strength = garrison.reduce((sum,u) => sum + u.strength, 0);
  const requiredGarrison = Math.ceil(initial * rule.garrisonFraction);
  const contested = enemies.some(u => inside(u, rule.zone));
  const threatened = garrison.some(u => enemies.some(e => Math.hypot(e.x-u.x,e.y-u.y) <= rule.pressureRange));
  const holding = strength >= requiredGarrison && !contested;
  const fightingStrength = fighting.reduce((sum,u) => sum+u.strength,0);
  const requiredArmy = Math.ceil(initial*rule.armyFraction);
  const state = fightingStrength < requiredArmy ? 'Too few fighting troops' : contested ? 'Contested' : strength < requiredGarrison ? 'Garrison too weak' : threatened ? 'Defending under fire' : 'Waiting for enemy pressure';
  return {label: rule.zone.label || 'Position', requireUntilDeadline: !!rule.requireUntilDeadline, seconds: engine.defenseSeconds || 0, requiredSeconds: rule.requiredSeconds, strength, requiredGarrison, fighting: fightingStrength, requiredArmy, holding, threatened, contested, state};
}

export function updateDefense(engine, dt) {
  const goal = defenseStatus(engine);
  if (!goal || !goal.holding || !goal.threatened) return;
  const before = engine.defenseSeconds || 0;
  engine.defenseSeconds = Math.min(goal.requiredSeconds, before + dt);
  if (before < goal.requiredSeconds - 1e-6 && engine.defenseSeconds >= goal.requiredSeconds - 1e-6) {
    engine.events.push({time: engine.time, type: 'objective', message: `${goal.label} defense time secured. ${goal.requireUntilDeadline ? 'Hold through the deadline' : 'Hold the position'} with at least ${goal.requiredGarrison} troops inside and ${goal.requiredArmy} still fighting to complete the objective.`});
  }
}
