export function commandIndicator(unit, outcome, formations = []) {
  if (outcome !== 'undecided' || !unit?.active || unit.side !== 'continental' || unit.status !== 'steady') return null;
  if (!['advance', 'attack', 'fallback', 'withdraw'].includes(unit.order)) return null;
  let target = unit.target;
  let label = 'Destination', color = 0xe6c75f;
  if (unit.order === 'attack') {
    const enemy = formations.find(e => e.id === unit.targetId && e.active && e.status === 'steady');
    if (!enemy) return null;
    target = enemy; label = `Attack: ${enemy.name}`; color = 0xe48e76;
  }
  if (![unit.x, unit.y, target?.x, target?.y].every(Number.isFinite)) return null;
  const gap = Math.hypot(target.x-unit.x, target.y-unit.y);
  const heldInCombat=unit.engaged && !unit.moving;
  if (unit.order === 'advance' && heldInCombat) label = gap < 2 ? 'In combat at destination' : 'Destination · held in combat';
  else if (unit.order === 'advance' && gap < 2) label = 'At destination';
  if (unit.order === 'withdraw') { label = gap < 2 ? 'Waiting at exit' : 'Withdrawal destination'; color = 0xb3d2d3; }
  if (unit.order === 'fallback') { label = 'Fall back · remain on the field'; color = 0xb3d2d3; }
  const ahead=formations.find(other=>other.id===unit.waitingFor&&other.active&&other.status==='steady');
  if(ahead && !heldInCombat)label=`Position occupied · waiting for ${ahead.name}`;
  if (unit.navigationBlocked && !heldInCombat) label = 'No traversable route';
  // Contact may still involve approach or separation motion. Hide long text
  // throughout the clash, while preserving the order description for the HUD.
  return {x: Math.max(12,Math.min(1188,target.x)), y: Math.max(20,Math.min(650,target.y)), label, color, drawLine: gap >= 2, showLabel: !unit.engaged};
}
