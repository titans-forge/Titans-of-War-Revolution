// A compressed command objective: opening volleys, orderly fallback and reserve action.
// These are scenario rules, not a reconstruction of historical timings or casualties.
const ready = u => u?.active && u.status === 'steady' && u.order !== 'withdraw' && u.morale >= 18 && u.cohesion >= 14 && u.strength >= u.initialStrength * .18;
const inside = (u,z) => u && u.x>=z.x1 && u.x<=z.x2 && u.y>=z.y1 && u.y<=z.y2;
const gap = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const stateOf = e => e.cowpens || (e.cowpens={shots:{},rallied:{},lineSeconds:0,counterSeconds:0,counterDamage:0,reports:{}});

export function recordCowpensFire(engine,attacker,range) {
  const rule=engine.config.counterattackObjective;
  if(!rule || attacker.moving || range>rule.volleyRange || !rule.screens.includes(attacker.id))return;
  const state=stateOf(engine);
  state.shots[attacker.id]=Math.min(rule.volleys,(state.shots[attacker.id]||0)+1);
}

export function recordCowpensDamage(engine,attacker,damage) {
  if(!engine.config.counterattackObjective || attacker.id!==engine.config.counterattackObjective.reserveId || attacker.order!=='attack')return;
  const goal=cowpensStatus(engine);
  if(goal.regrouped && goal.lineHolding)stateOf(engine).counterDamage+=Math.max(0,damage);
}

export function cowpensStatus(engine) {
  const rule=engine.config.counterattackObjective;
  if(!rule)return null;
  const state=stateOf(engine),byId=id=>engine.formations.find(u=>u.id===id);
  const screens=rule.screens.map(id=>{const unit=byId(id);return{id,name:unit.name,shots:state.shots[id]||0,required:rule.volleys,rallied:!!state.rallied[id],available:ready(unit),x:unit.x,y:unit.y};});
  const line=byId(rule.lineId),reserve=byId(rule.reserveId);
  const enemies=engine.formations.filter(u=>u.side==='crown'&&ready(u));
  const lineHolding=ready(line)&&inside(line,rule.lineZone)&&line.strength>=Math.ceil(line.initialStrength*rule.lineFraction);
  const lineThreatened=lineHolding&&enemies.some(u=>gap(u,line)<=rule.pressureRange);
  const openingComplete=screens.every(s=>s.shots>=s.required);
  const regrouped=screens.every(s=>s.rallied);
  const reserveEngaging=ready(reserve)&&reserve.order==='attack'&&enemies.some(u=>u.id===reserve.targetId&&gap(u,reserve)<=rule.counterRange);
  const reserveViable=ready(reserve);
  const enemyBroken=engine.formations.filter(u=>u.side==='crown'&&(u.status==='routed'||u.status==='withdrawn')).length;
  const fighting=engine.formations.filter(u=>u.side==='continental'&&ready(u)).reduce((sum,u)=>sum+u.strength,0);
  const requiredFighting=Math.ceil(engine.formations.filter(u=>u.side==='continental').reduce((sum,u)=>sum+u.initialStrength,0)*rule.armyFraction);
  const complete=openingComplete&&regrouped&&state.lineSeconds>=rule.holdSeconds-1e-6&&state.counterSeconds>=rule.counterSeconds-1e-6&&state.counterDamage>=rule.counterDamage&&reserveViable&&lineHolding&&fighting>=requiredFighting;
  const phase=!openingComplete?'Opening volleys':!regrouped?'Regroup behind the screen':state.lineSeconds<rule.holdSeconds-1e-6?'Hold the Continental line':!complete?'Counterattack with the reserve':'Counterattack secured';
  return{screens,openingComplete,regrouped,lineHolding,lineThreatened,lineSeconds:state.lineSeconds,requiredLineSeconds:rule.holdSeconds,lineStrength:line?.strength||0,requiredLineStrength:Math.ceil(line.initialStrength*rule.lineFraction),reserveEngaging,reserveViable,counterSeconds:state.counterSeconds,requiredCounterSeconds:rule.counterSeconds,counterDamage:state.counterDamage,requiredCounterDamage:rule.counterDamage,enemyBroken,fighting,requiredFighting,complete,phase};
}

export function updateCowpens(engine,dt) {
  const rule=engine.config.counterattackObjective;
  if(!rule)return;
  const state=stateOf(engine);
  for(const id of rule.screens){const unit=engine.formations.find(u=>u.id===id),point=rule.fallback[id];
    if((state.shots[id]||0)>=rule.volleys&&ready(unit)&&unit.order!=='fallback'&&gap(unit,point)<=rule.rallyRadius)state.rallied[id]=true;
  }
  const goal=cowpensStatus(engine);
  if(goal.openingComplete&&goal.lineHolding&&goal.lineThreatened)state.lineSeconds=Math.min(rule.holdSeconds,state.lineSeconds+dt);
  if(goal.regrouped&&goal.lineHolding&&goal.reserveEngaging)state.counterSeconds=Math.min(rule.counterSeconds,state.counterSeconds+dt);
  const announce=(key,condition,message)=>{if(condition&&!state.reports[key]){state.reports[key]=true;engine.events.push({time:engine.time,type:'objective',message});}};
  for(const screen of goal.screens)announce(screen.id,screen.shots>=screen.required,`${screen.name}: opening fire delivered. Use Fall back to reach the marked rally position while keeping the formation on the field.`);
  announce('regroup',goal.regrouped,'The screens have rallied. Hold Howard inside the Continental line and assign Washington an enemy target for the counterattack.');
  announce('line',state.lineSeconds>=rule.holdSeconds-1e-6,'Continental line established. Complete the cavalry counterattack while preserving Howard and Washington as fighting formations.');
}
