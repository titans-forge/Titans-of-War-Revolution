// Compact footprints represent occupied ranks, excluding projecting muskets,
// flags and the perspective height of the sprites. Dimensions are world units.
export function formationFootprint(unit = {}) {
  if (unit.type === 'artillery') return {x:27,y:21};
  if (unit.type === 'cavalry') return {x:49,y:27};
  if (unit.formationMode === 'column') return {x:30,y:31};
  if (unit.formationMode === 'open') return {x:63,y:27};
  return {x:47,y:24};
}
const ready = u => u?.active && u.status === 'steady';
const retreating = u => u.order === 'withdraw' || u.order === 'fallback' || u.retiring;
const finite = p => Number.isFinite(p?.x)&&Number.isFinite(p?.y);
const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
export function footprintDistance(a,b) {
  if(!finite(a)||!finite(b))return Infinity;
  const pa=formationFootprint(a),pb=formationFootprint(b);
  return Math.hypot((a.x-b.x)/(pa.x+pb.x),(a.y-b.y)/(pa.y+pb.y));
}
export function inFormationContact(a,b) {
  return ready(a)&&ready(b)&&a.side!==b.side&&footprintDistance(a,b)<1.045;
}
function sweepAllowed(unit,other,step) {
  const a=formationFootprint(unit),b=formationFootprint(other);
  const x=(unit.x-other.x)/(a.x+b.x),y=(unit.y-other.y)/(a.y+b.y);
  const dx=step.x/(a.x+b.x),dy=step.y/(a.y+b.y),start=x*x+y*y,end=(x+dx)**2+(y+dy)**2;
  // Existing overlap can leave gradually; no positional correction/teleport.
  if(start<1-1e-8)return end>start+1e-10;
  const t=Math.max(0,Math.min(1,-(x*dx+y*dy)/Math.max(1e-12,dx*dx+dy*dy)));
  return (x+dx*t)**2+(y+dy*t)**2>=1-1e-8;
}
// Called sequentially: the engine applies each returned step before evaluating
// the next formation, so every sweep sees already-resolved positions.
export function constrainFormationStep(unit,formations,desired,target,clear=()=>true) {
  if(!finite(unit)||!finite(desired)||!finite(target)||!Array.isArray(formations))return {step:{x:0,y:0},waitingFor:null};
  const length=Math.hypot(desired.x,desired.y);
  if(!ready(unit)||retreating(unit)||length<1e-8)return {step:desired,waitingFor:null};
  const nearby=formations.filter(u=>u.id!==unit.id&&ready(u)&&!retreating(u)&&distance(u,unit)<200+length);
  const legal=step=>clear(unit,{x:unit.x+step.x,y:unit.y+step.y})&&nearby.every(other=>sweepAllowed(unit,other,step));
  if(legal(desired))return {step:desired,waitingFor:null};
  const blocker=nearby.find(other=>!sweepAllowed(unit,other,desired));
  // A hostile front is a combat destination. Friendly ranks may be bypassed.
  if(blocker?.side!==unit.side) {
    let low=0,high=1;
    for(let i=0;i<16;i++){const mid=(low+high)/2;if(legal({x:desired.x*mid,y:desired.y*mid}))low=mid;else high=mid;}
    return {step:{x:desired.x*low,y:desired.y*low},waitingFor:null};
  }
  // Stable pair priority prevents both movers mirroring the same sidestep.
  // A formation already at its destination does not receive right of way.
  if(['advance','attack'].includes(blocker.order) && finite(blocker.target) && distance(blocker,blocker.target)>2 && String(unit.id)>String(blocker.id))return {step:{x:0,y:0},waitingFor:blocker.id};
  const occupiedGoal=footprintDistance({...unit,x:target.x,y:target.y},blocker)<1;
  if(occupiedGoal&&['hold','reform'].includes(blocker.order)&&footprintDistance(unit,blocker)<1.065) {
    return {step:{x:0,y:0},waitingFor:blocker.id};
  }
  const cross=desired.x*(blocker.y-unit.y)-desired.y*(blocker.x-unit.x);
  // Move away from the obstructing side; head-on pairs both pass to their own
  // right, which gives opposite world-space directions.
  const sign=cross>1e-8?-1:1;
  const heading=Math.atan2(desired.y,desired.x);
  // Prefer a sidestep with room to continue. Immediate-only checks can steer
  // both passing formations into the same wall and leave them oscillating.
  // The fallback preserves legal short steps in genuinely confined ground.
  for(const horizon of [48,0]) for(const degrees of [20,-20,40,-40,65,-65,85,-85,90,-90,110,-110,135,-135]) {
    const angle=heading+degrees*sign*Math.PI/180;
    const step={x:Math.cos(angle)*length,y:Math.sin(angle)*length};
    if(legal(step) && (!horizon || clear(unit,{x:unit.x+Math.cos(angle)*horizon,y:unit.y+Math.sin(angle)*horizon})))return {step,waitingFor:null};
  }
  return {step:{x:0,y:0},waitingFor:blocker.id};
}
