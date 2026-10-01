// UI and tutorial acknowledgements are derived from the engine after an order.
const POSITION_TOLERANCE = 1;

export function issueCommand(engine, unitId, type, value) {
  const unit = engine?.formations.find(u => u.id === unitId && u.side === 'continental');
  if (!unit?.active || unit.status !== 'steady' || engine.outcome !== 'undecided') return null;
  if (type === 'ground-move') {
    if (![value?.x,value?.y].every(Number.isFinite)) return null;
    engine.move(unitId,value);
    if (unit.order !== 'advance' || Math.hypot(unit.target.x-unit.x,unit.target.y-unit.y) <= POSITION_TOLERANCE) return null;
    return {type,unitId,accepted:true,order:unit.order,target:{...unit.target},battleTime:engine.time};
  }
  if (type === 'target') {
    const target = engine.formations.find(u => u.id === value && u.side === 'crown' && u.active && u.status === 'steady');
    if (!target) return null;
    engine.attack(unitId,value);
    if (unit.order !== 'attack' || unit.targetId !== value) return null;
    return {type,unitId,accepted:true,order:unit.order,targetId:unit.targetId,battleTime:engine.time};
  }
  if (type === 'fire-policy') {
    if (!['free','effective','hold'].includes(value)) return null;
    engine.setFirePolicy(unitId,value);
    if (unit.firePolicy !== value) return null;
    return {type,unitId,accepted:true,policy:value,confirmedPolicy:unit.firePolicy,battleTime:engine.time};
  }
  if (type === 'formation') {
    if (unit.type !== 'infantry' || unit.formationMode === value || !['line','column','open'].includes(value)) return null;
    engine.setFormation(unitId,value);
    return unit.formationMode === value ? {type,unitId,accepted:true,mode:value,battleTime:engine.time} : null;
  }
  if (type === 'order') {
    if (!['hold','advance','volley','reform','fallback','withdraw'].includes(value)) return null;
    if (value === 'reform' && unit.reformRemaining > 0) return null;
    engine.order(unitId,value);
    if (value === 'volley' ? !unit.volleyRequested : unit.order !== value) return null;
    const enemy = engine.combatTarget(unit);
    const safeGround = !enemy || Math.hypot(enemy.x-unit.x,enemy.y-unit.y)>240;
    return {type,unitId,accepted:true,order:value,confirmedOrder:unit.order,volleyRequested:unit.volleyRequested,reformRemaining:unit.reformRemaining,safeGround,battleTime:engine.time};
  }
  return null;
}
