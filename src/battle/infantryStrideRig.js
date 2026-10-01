const TAU=Math.PI*2;
const wrap=value=>((value%TAU)+TAU)%TAU;
const smooth=t=>t*t*(3-2*t);

// Solve a clothed two-bone leg. Knees bend toward the facing direction; the
// near/far painter order is fixed by the renderer, not guessed from artwork.
function legAt(phase,hip) {
  const p=wrap(phase),stance=p<Math.PI,t=stance?p/Math.PI:(p-Math.PI)/Math.PI;
  const span=Math.PI/.42;
  const ankle={x:stance?span*(.5-t):span*(smooth(t)-.5),y:-2-(stance?0:Math.sin(t*Math.PI)*3)};
  const upper=8,lower=7.5,dx=ankle.x-hip.x,dy=ankle.y-hip.y;
  const length=Math.hypot(dx,dy),along=(upper*upper-lower*lower+length*length)/(2*length);
  const across=Math.sqrt(Math.max(0,upper*upper-along*along));
  const knee={x:hip.x+dx/length*along+dy/length*across,y:hip.y+dy/length*along-dx/length*across};
  return {hip,knee,ankle,stance,footRotation:stance?0:Math.sin(t*Math.PI)*.2};
}

export function infantryStrideRig(unit,travel,figurePhase=0,bodyHeight=36) {
  if(!unit?.active||unit.type!=='infantry'||!['steady','routed'].includes(unit.status)||!unit.moving||unit.order==='fallback'||!Number.isFinite(travel)||!Number.isFinite(bodyHeight)||bodyHeight<=0)return null;
  const phase=wrap(travel+Math.sin(Number.isFinite(figurePhase)?figurePhase:0)*.22);
  const hip={x:0,y:-17.2+.2*Math.cos(phase*2)};
  const direction=Math.cos(Number.isFinite(unit.facing)?unit.facing:0)>=0?1:-1,scale=bodyHeight/36;
  const transform=p=>({x:p.x*direction*scale,y:p.y*scale});
  const convert=leg=>({...leg,hip:transform(leg.hip),knee:transform(leg.knee),ankle:transform(leg.ankle),footRotation:leg.footRotation*direction});
  return {phase,direction,scale,hip:transform(hip),near:convert(legAt(phase,hip)),far:convert(legAt(phase+Math.PI,hip))};
}
