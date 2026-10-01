const ready = u => u.active && u.status === 'steady' && u.morale >= 18 && u.cohesion >= 14 && u.strength >= u.initialStrength * .18;
const inside = (u,z) => u.x>=z.x1 && u.x<=z.x2 && u.y>=z.y1 && u.y<=z.y2;
export function atEvacuationExit(unit, rule) {
  return rule.kind === 'road' ? Math.hypot(unit.x-rule.exitX,unit.y-rule.exitY) <= rule.exitRadius : unit.x <= rule.exitX;
}
export function evacuationStatus(engine) {
  const rule=engine.config.evacuation;
  if(!rule)return null;
  const troops=engine.formations.filter(u=>u.side==='continental'&&u.type!=='artillery');
  const initial=troops.reduce((n,u)=>n+u.initialStrength,0);
  const saved=troops.filter(u=>u.evacuated).reduce((n,u)=>n+u.strength,0);
  // Once a formation receives Withdraw, let it finish reaching the exit before
  // resolving the battle. Otherwise crossing the minimum with an earlier unit
  // can strand a later ordered formation in transit and omit it from "saved".
  const withdrawing=troops.filter(u=>u.active&&u.status==='steady'&&u.order==='withdraw'&&!u.evacuated).length;
  const blocked=rule.kind==='road' && engine.formations.some(u=>u.side==='crown'&&ready(u)&&Math.hypot(u.x-rule.exitX,u.y-rule.exitY)<=rule.blockRadius);
  const defenders=troops.filter(u=>ready(u)&&u.order!=='withdraw'&&(rule.screenZone ? inside(u,rule.screenZone) : u.x>=rule.screenX));
  const enemies=engine.formations.filter(u=>u.side==='crown'&&ready(u));
  const strength=defenders.reduce((sum,u)=>sum+u.strength,0);
  const requiredGarrison=Math.ceil(initial*(rule.garrisonFraction||0));
  const pressure=defenders.some(u=>enemies.some(e=>Math.hypot(e.x-u.x,e.y-u.y)<=320));
  const screenHolding=pressure&&strength>=requiredGarrison;
  const screenState=(engine.screenSeconds||0)>=rule.screenSeconds-1e-6 ? 'Delaying action complete' : strength<requiredGarrison || defenders.length===0 ? 'Needs a defending garrison' : !pressure ? 'Waiting for enemy pressure' : 'Defending under pressure';
  return {strength,screenHolding,screenState,saved,initial,required:Math.ceil(initial*rule.requiredFraction),withdrawing,screenSeconds:engine.screenSeconds||0,requiredScreen:rule.screenSeconds,opensIn:Math.max(0,rule.opensAt-engine.time),exitX:rule.exitX,ready:engine.time>=rule.opensAt,blocked,kind:rule.kind||'boats',screenLabel:rule.screenLabel||'Screen',exitLabel:rule.exitLabel||'Boats',requiredGarrison};
}
export function updateScreen(engine,dt) {
  const goal=evacuationStatus(engine);
  if(!goal || !goal.screenHolding)return;
  const before=engine.screenSeconds||0;
  engine.screenSeconds=Math.min(goal.requiredScreen,before+dt);
  if(before<goal.requiredScreen-1e-6 && engine.screenSeconds>=goal.requiredScreen-1e-6)engine.events.push({time:engine.time,type:'report',message:`${goal.screenLabel} complete. Use Withdraw to save ${goal.required} fighting troops through ${goal.exitLabel === 'Boats' ? 'the evacuation line' : 'the Chester Road'}.`});
}
