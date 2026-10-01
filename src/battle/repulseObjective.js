// A broken column is a tactical success even when most of its soldiers survive.
export function repulseStatus(engine) {
  const rule=engine.config.repulseObjective;
  if(!rule)return null;
  const enemies=engine.formations.filter(u=>u.side==='crown'&&u.type!=='artillery');
  const army=engine.formations.filter(u=>u.side==='continental'&&u.type!=='artillery');
  const broken=enemies.filter(u=>u.entered&&u.status==='routed').length;
  const requiredArmy=Math.ceil(army.reduce((n,u)=>n+u.initialStrength,0)*rule.armyFraction);
  const fighting=army.filter(u=>u.active&&u.status==='steady'&&u.order!=='withdraw'&&u.morale>=18&&u.cohesion>=14&&u.strength>=u.initialStrength*.18).reduce((n,u)=>n+u.strength,0);
  return {broken,requiredBroken:rule.requiredBroken,total:enemies.length,fighting,requiredArmy,ready:broken>=rule.requiredBroken&&fighting>=requiredArmy};
}
