// Visual choreography only. Damage continues to come from the engine's shared
// melee exchange; these poses never generate a hit or consume ammunition.
const TAU=Math.PI*2;
const wrap=value=>((value%1)+1)%1;
const smooth=value=>value*value*(3-2*value);

export function infantryContactCycle(unit,time,figurePhase=0,contactSince=time,inFront=false) {
  if(!unit?.active || unit.status!=='steady' || !unit.engaged || unit.moving || unit.order==='withdraw')return null;
  const guard={frame:0,x:0,rotation:0,stage:'guard'};
  if(!inFront || unit.order==='fallback' || !Number.isFinite(time) || !Number.isFinite(contactSince))return guard;
  const age=Math.max(0,time-contactSince);
  // Everyone first establishes a guard when a new contact begins.
  if(age<.3)return guard;
  const variation=Number.isFinite(figurePhase)?figurePhase:0;
  const duration=1.65+.14*Math.sin(variation*.47);
  const phase=wrap((age-.3)/duration+wrap(variation/TAU)*.7);
  const direction=Math.cos(unit.facing||0)>=0?1:-1;
  if(phase<.48)return guard;
  if(phase<.60) {
    const tension=smooth((phase-.48)/.12);
    return {frame:0,x:-direction*.32*tension,rotation:-direction*.007*tension,stage:'prepare'};
  }
  if(phase<.79) {
    const reach=Math.sin((phase-.60)/.19*Math.PI);
    return {frame:1,x:direction*(.25+.65*reach),rotation:direction*.007*reach,stage:'thrust'};
  }
  if(phase<.92) {
    const settle=1-smooth((phase-.79)/.13);
    return {frame:0,x:direction*.25*settle,rotation:direction*.003*settle,stage:'recover'};
  }
  return guard;
}

// Use actual contacting directions to choose the visible edge. A flank contact
// above/below the line should engage its near row, not an unrelated x edge.
export function contactFrontRanks(unit,opponents,figures,spacingX=11,spacingY=12) {
  const fronts=new Set();
  if(!unit || !Array.isArray(opponents) || !Array.isArray(figures) || !figures.length)return fronts;
  for(const enemy of opponents) {
    const dx=enemy.x-unit.x,dy=enemy.y-unit.y,length=Math.hypot(dx,dy);
    if(!Number.isFinite(length)||length<.01)continue;
    const nx=dx/length,ny=dy/length;
    const projected=figures.map(f=>f.x*nx+f.y*ny);
    const edge=Math.max(...projected);
    const band=(Math.abs(nx)*spacingX+Math.abs(ny)*spacingY)*1.05;
    figures.forEach((f,i)=>{if(edge-projected[i]<=band)fronts.add(f);});
  }
  return fronts;
}
