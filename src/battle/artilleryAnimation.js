// Visual-only choreography of the existing 3.2-second gameplay reload. It is
// deliberately compressed, not a historical drill clock or a second fire timer.
export function artilleryCrewAction(unit, index) {
  if (!unit?.active || unit.type!=='artillery' || unit.status!=='steady' || unit.moving || unit.engaged || ['withdraw','fallback','reform'].includes(unit.order)) return null;
  if (!(unit.volleySerial>0) || !Number.isFinite(unit.reload) || unit.reload<=0 || unit.reload>3.2) return null;
  const elapsed=3.2-unit.reload;
  if (elapsed<.3) return index===1 ? {stage:'fire',frame:3} : null;
  if (!(unit.ammunition>0)) return null;
  if (index===0) {
    if ((elapsed>=.4&&elapsed<.6)||(elapsed>=1.7&&elapsed<1.9)) return {stage:'prepare',frame:0};
    if (elapsed>=.6&&elapsed<1.1) return {stage:'sponge',frame:1};
    if (elapsed>=1.9&&elapsed<2.5) return {stage:'ram',frame:1};
  }
  if (index===2&&elapsed>=1.15&&elapsed<1.65) return {stage:'serve',frame:2};
  return null;
}

// Crew identity is stable through casualty rebuilds. Working men face inward
// toward the muzzle/breech. On the move they face the battery's travel heading.
export function artilleryCrewStation(index, facing, moving=false) {
  if (!Number.isInteger(index)||index<0||index>4||!Number.isFinite(facing)) return null;
  const stations=[{x:67,y:5,frame:1,inward:true},{x:-39,y:8,frame:3,inward:false},{x:44,y:6,frame:2,inward:true},{x:-28,y:22,frame:1,inward:false},{x:8,y:25,frame:2,inward:false}];
  const station=stations[index],direction=Math.cos(facing)>=0?1:-1;
  return {...station,x:station.x*direction,facing:!moving&&station.inward?facing+Math.PI:facing};
}
