// Presentation-only settling after a hauling battery halts. Never delay gameplay fire.
export function artilleryDeploymentStation(unit,index,station,time,since){
 if(since===null||!Number.isFinite(since)||!Number.isFinite(time)||time<since||time-since>=.7||!unit?.active||unit.status!=='steady'||unit.moving||unit.engaged||['fallback','withdraw','reform'].includes(unit.order)||unit.reload>0||index>2)return null;
 const direction=Math.cos(unit.facing)>=0?1:-1;
 const from={x:[10,-20,-39][index]*direction,y:12};
 if(!Number.isFinite(from.x))return null;
 const t=(time-since)/.7,progress=t*t*(3-2*t),dx=station.x-from.x,dy=station.y-from.y;
 return {x:from.x+dx*progress,y:from.y+dy*progress,facing:Math.atan2(dy,dx),travel:Math.hypot(dx,dy)*progress*.42};
}
