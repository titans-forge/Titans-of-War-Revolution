const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export const CROWN_TARGET_WEIGHTS = Object.freeze({
  assigned: 170,
  retained: 65,
  cavalryArtillery: 90,
});

export function crownTargetScore(unit, enemy, assignedCount = 0) {
  return distance(unit, enemy)
    + assignedCount * CROWN_TARGET_WEIGHTS.assigned
    - (unit.targetId === enemy.id ? CROWN_TARGET_WEIGHTS.retained : 0)
    - (unit.type === 'cavalry' && enemy.type === 'artillery' ? CROWN_TARGET_WEIGHTS.cavalryArtillery : 0);
}

export function chooseCrownTarget(unit, enemies, assigned = new Map(), { isContact = () => false } = {}) {
  if (!unit || !Array.isArray(enemies) || !enemies.length) return null;
  const contacts=enemies.filter(enemy=>isContact(unit,enemy));
  const candidates=contacts.length ? contacts : enemies;
  return [...candidates].sort((a, b) =>
    crownTargetScore(unit, a, assigned.get(a.id) || 0)
    - crownTargetScore(unit, b, assigned.get(b.id) || 0)
    || String(a.id).localeCompare(String(b.id))
  )[0] || null;
}
