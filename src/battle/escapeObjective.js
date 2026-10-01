const fighting = u => u.active && u.status === 'steady' && u.morale>=18 && u.cohesion>=14 && u.strength>=u.initialStrength*.18;
export function escapeStatus(engine) {
  const rule=engine.config.escape;
  if(!rule)return null;
  const crown=engine.formations.filter(u=>u.side==='crown');
  const initial=crown.reduce((sum,u)=>sum+u.initialStrength,0);
  const escaped=crown.filter(u=>u.escaped).reduce((sum,u)=>sum+u.strength,0);
  const blockers=engine.formations.filter(u=>u.side==='continental'&&u.type!=='artillery'&&u.order!=='withdraw'&&fighting(u)&&Math.hypot(u.x-rule.x,u.y-rule.y)<=rule.blockRadius);
  const blockingStrength=blockers.reduce((sum,u)=>sum+u.strength,0);
  return {escaped,allowed:Math.floor(initial*rule.allowedFraction),initial,opensIn:Math.max(0,rule.opensAt-engine.time),open:engine.time>=rule.opensAt,blocked:blockingStrength>=rule.requiredBlockers,blockingStrength,requiredBlockers:rule.requiredBlockers};
}
export function prepareEscape(engine) {
  const rule=engine.config.escape;
  if(!rule||engine.time<rule.opensAt)return;
  if(!engine.escapeStarted){engine.escapeStarted=true;engine.events.push({time:engine.time,type:'report',message:'Hessian regiments are withdrawing toward the southern road. Block the marked exit and break their remaining formations.'});}
  for(const unit of engine.formations.filter(u=>u.side==='crown'&&fighting(u))){
    unit.retiring=true;
    unit.order='advance';unit.targetId=null;
    unit.target={x:rule.x,y:rule.y};
  }
}
export function departEscapingUnit(engine, unit) {
  const rule=engine.config.escape;
  if(!rule||engine.time<rule.opensAt||!unit.retiring||!fighting(unit)||Math.hypot(unit.x-rule.x,unit.y-rule.y)>rule.exitRadius)return false;
  unit.moving=false;
  if(escapeStatus(engine).blocked){unit.order='hold';unit.target={x:unit.x,y:unit.y};return true;}
  unit.active=false;unit.escaped=true;unit.status='withdrawn';
  engine.events.push({time:engine.time,type:'report',message:`${unit.name} escaped in good order with ${Math.round(unit.strength)} troops.`});
  return true;
}
