import {structuresFor,expandedStructure} from './structureFootprints.js';
import {routeTo,segmentClear} from './terrainNavigation.js';
const finite=p=>Number.isFinite(p?.x)&&Number.isFinite(p?.y);
const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Slab intersection includes grazing walls. Water is not a ballistic obstacle.
export function blockingStructure(battleId,a,b){
 if(!finite(a)||!finite(b))return null;
 return structuresFor(battleId).find(s=>{
  let enter=0,exit=1;
  for(const [axis,low,high] of [['x',s.x1,s.x2],['y',s.y1,s.y2]]){
   const delta=b[axis]-a[axis];
   if(Math.abs(delta)<1e-12){if(a[axis]<low||a[axis]>high)return false;continue;}
   const first=(low-a[axis])/delta,last=(high-a[axis])/delta;
   enter=Math.max(enter,Math.min(first,last));exit=Math.min(exit,Math.max(first,last));
   if(enter>exit)return false;
  }
  return true;
 })||null;
}
export const lineOfFireClear=(id,a,b)=>finite(a)&&finite(b)&&!blockingStructure(id,a,b);
export const weaponRange=unit=>unit.type==='artillery'?390:unit.type==='cavalry'?105:210;

export function clearFiringPosition(battleId,unit,enemy,standOff){
 const obstacle=blockingStructure(battleId,unit,enemy);
 if(!obstacle)return null;
 const clearance={...unit,navigationMargin:12};
 const box=expandedStructure(obstacle,clearance);
 const points=[];
 for(const x of [box.x1-2,box.x2+2])for(const y of [box.y1-2,box.y2+2])points.push({x,y});
 for(let i=0;i<16;i++){const angle=i*Math.PI/8;points.push({x:enemy.x+Math.cos(angle)*standOff,y:enemy.y+Math.sin(angle)*standOff});}
 const candidates=points.filter(p=>p.x>=55&&p.x<=1145&&p.y>=45&&p.y<=635&&gap(p,enemy)<=weaponRange(unit)&&lineOfFireClear(battleId,p,enemy)&&segmentClear(battleId,p,p,clearance));
 candidates.sort((a,b)=>gap(unit,a)-gap(unit,b)||a.x-b.x||a.y-b.y);
 for(const point of candidates)if(routeTo(battleId,unit,point,clearance))return point;
 return null;
}
