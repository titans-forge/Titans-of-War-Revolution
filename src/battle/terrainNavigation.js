import {structuresFor, structurePolygon, expandedStructure} from './structureFootprints.js';
const CHANNEL = [[225,255],[160,295],[132,325],[155,360],[230,398],[345,425],[435,464],[490,500],[560,528],[660,565],[780,620],[880,680],[920,720]];
const WATER_RADIUS = 18;
const GRID = 20;
const WORLD = { minX: 0, maxX: 1200, minY: 0, maxY: 680 };
const MOVEMENT = { minX: 55, maxX: 1145, minY: 45, maxY: 635 };

export const BRANDYWINE_FORD = { x: 560, y: 528, radius: 45 };
// Authored from the visible left shoreline in bunker-hill.webp, mapped into the
// 1200 x 680 battlefield. The upper harbor is deliberately omitted because the
// distant town/neck is represented there and is the Continental line of retreat.
export const BUNKER_HARBOR = [
  {x:0,y:180},{x:128,y:183},{x:190,y:226},{x:213,y:285},
  {x:190,y:350},{x:205,y:430},{x:178,y:520},{x:160,y:680},{x:0,y:680},
];

const finitePoint = point => Number.isFinite(point?.x) && Number.isFinite(point?.y);
const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const inFord = point => distance(point,BRANDYWINE_FORD) <= BRANDYWINE_FORD.radius;

function pointSegmentDistance(point,a,b) {
  const dx=b[0]-a[0],dy=b[1]-a[1],lengthSquared=dx*dx+dy*dy;
  const t=lengthSquared ? Math.max(0,Math.min(1,((point.x-a[0])*dx+(point.y-a[1])*dy)/lengthSquared)) : 0;
  return Math.hypot(point.x-(a[0]+dx*t),point.y-(a[1]+dy*t));
}

function segmentsIntersect(a,b,c,d) {
  const cross=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
  const abC=cross(a,b,c),abD=cross(a,b,d),cdA=cross(c,d,a),cdB=cross(c,d,b);
  const on=(p,q,r)=>r.x>=Math.min(p.x,q.x)-1e-9&&r.x<=Math.max(p.x,q.x)+1e-9&&r.y>=Math.min(p.y,q.y)-1e-9&&r.y<=Math.max(p.y,q.y)+1e-9;
  if(((abC>0&&abD<0)||(abC<0&&abD>0))&&((cdA>0&&cdB<0)||(cdA<0&&cdB>0)))return true;
  return (Math.abs(abC)<=1e-9&&on(a,b,c))||(Math.abs(abD)<=1e-9&&on(a,b,d))||(Math.abs(cdA)<=1e-9&&on(c,d,a))||(Math.abs(cdB)<=1e-9&&on(c,d,b));
}

function pointInPolygon(point,polygon) {
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[i],b=polygon[j];
    if(pointSegmentDistance(point,[a.x,a.y],[b.x,b.y])<=1e-7)return true;
    if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
  }
  return inside;
}

function segmentDistance(a,b,c,d) {
  if(segmentsIntersect(a,b,c,d))return 0;
  const tuple=point=>[point.x,point.y];
  return Math.min(pointSegmentDistance(a,tuple(c),tuple(d)),pointSegmentDistance(b,tuple(c),tuple(d)),pointSegmentDistance(c,tuple(a),tuple(b)),pointSegmentDistance(d,tuple(a),tuple(b)));
}

function fordSplitParameters(a,b) {
  const dx=b.x-a.x,dy=b.y-a.y,fx=a.x-BRANDYWINE_FORD.x,fy=a.y-BRANDYWINE_FORD.y;
  const qa=dx*dx+dy*dy;
  if(!qa)return[0,1];
  const qb=2*(fx*dx+fy*dy),qc=fx*fx+fy*fy-BRANDYWINE_FORD.radius**2;
  const discriminant=qb*qb-4*qa*qc;
  const values=[0,1];
  if(discriminant>=0){
    const root=Math.sqrt(discriminant);
    for(const t of [(-qb-root)/(2*qa),(-qb+root)/(2*qa)])if(t>0&&t<1)values.push(t);
  }
  return values.sort((x,y)=>x-y);
}

function blocked(battleId,point,unit) {
  if(structuresFor(battleId).some(s=>pointInPolygon(point,structurePolygon(expandedStructure(s,unit)))))return true;
  if(battleId==='bunker_hill')return pointInPolygon(point,BUNKER_HARBOR);
  if(battleId!=='brandywine')return false;
  if(inFord(point))return false;
  for(let i=0;i<CHANNEL.length-1;i++)if(pointSegmentDistance(point,CHANNEL[i],CHANNEL[i+1])<=WATER_RADIUS)return true;
  return false;
}

export function segmentClear(battleId,a,b,unit) {
  if(!finitePoint(a)||!finitePoint(b))return false;
  for(const structure of structuresFor(battleId)){
    const expanded=expandedStructure(structure,unit);
    const polygon=structurePolygon(expanded);
    // Old deployment/changed-width overlap may leave by the nearest edge,
    // with immediate improvement and no crossing of the actual building.
    if(unit && pointInPolygon(a,polygon) && !pointInPolygon(a,structurePolygon(structure))){
      const depth=p=>Math.max(0,Math.min(p.x-expanded.x1,expanded.x2-p.x,p.y-expanded.y1,expanded.y2-p.y));
      const walls=structurePolygon(structure);
      if(depth({x:a.x+(b.x-a.x)*.001,y:a.y+(b.y-a.y)*.001})<depth(a)-1e-10 && depth(b)<depth(a)-1e-8 && !pointInPolygon(b,walls) && !walls.some((p,i)=>segmentsIntersect(a,b,p,walls[(i+1)%4])))continue;
    }
    if(pointInPolygon(a,polygon)||pointInPolygon(b,polygon))return false;
    if(polygon.some((p,i)=>segmentsIntersect(a,b,p,polygon[(i+1)%polygon.length])))return false;
  }
  if(battleId==='bunker_hill'){
    if(blocked(battleId,a)||blocked(battleId,b))return false;
    for(let i=0;i<BUNKER_HARBOR.length;i++)if(segmentsIntersect(a,b,BUNKER_HARBOR[i],BUNKER_HARBOR[(i+1)%BUNKER_HARBOR.length]))return false;
    return true;
  }
  if(battleId!=='brandywine')return true;
  const splits=fordSplitParameters(a,b);
  for(let index=0;index<splits.length-1;index++){
    const from=splits[index],to=splits[index+1],middle=(from+to)/2;
    const midpoint={x:a.x+(b.x-a.x)*middle,y:a.y+(b.y-a.y)*middle};
    if(inFord(midpoint))continue;
    const sectionA={x:a.x+(b.x-a.x)*from,y:a.y+(b.y-a.y)*from};
    const sectionB={x:a.x+(b.x-a.x)*to,y:a.y+(b.y-a.y)*to};
    for(let channel=0;channel<CHANNEL.length-1;channel++){
      const c={x:CHANNEL[channel][0],y:CHANNEL[channel][1]},d={x:CHANNEL[channel+1][0],y:CHANNEL[channel+1][1]};
      if(segmentDistance(sectionA,sectionB,c,d)<=WATER_RADIUS)return false;
    }
  }
  return true;
}

export function resolveDestination(battleId,point,unit) {
  if(!finitePoint(point))return null;
  const original={x:point.x,y:point.y};
  if((battleId!=='brandywine'&&battleId!=='bunker_hill'&&!structuresFor(battleId).length)||point.x<WORLD.minX||point.x>WORLD.maxX||point.y<WORLD.minY||point.y>WORLD.maxY||!blocked(battleId,point,unit))return original;
  // Radial search gives the nearest dry sample without choosing a preferred bank.
  // The coastal polygon is wider than the Brandywine channel, so cover its full
  // playable extent rather than returning null for clicks well out in the harbor.
  const projectionRadius=structuresFor(battleId).length||battleId==='bunker_hill'?240:WATER_RADIUS*3;
  for(let radius=.5;radius<=projectionRadius;radius+=.5)for(let index=0;index<144;index++){
    const angle=index*Math.PI/72;
    const candidate={x:point.x+Math.cos(angle)*radius,y:point.y+Math.sin(angle)*radius};
    if(candidate.x>=MOVEMENT.minX&&candidate.x<=MOVEMENT.maxX&&candidate.y>=MOVEMENT.minY&&candidate.y<=MOVEMENT.maxY&&!blocked(battleId,candidate,unit))return candidate;
  }
  return null;
}

const nodeKey=(x,y)=>`${x},${y}`;
const parseKey=key=>{const [x,y]=key.split(',').map(Number);return{x,y};};
const gridPoint=(x,y)=>({x:x*GRID,y:y*GRID});
const gridDry=(battleId,x,y,unit)=>{
  const point=gridPoint(x,y);
  return point.x>=MOVEMENT.minX&&point.x<=MOVEMENT.maxX&&point.y>=MOVEMENT.minY&&point.y<=MOVEMENT.maxY&&!blocked(battleId,point,unit);
};

function nearestGrid(battleId,point,unit) {
  const cx=Math.round(point.x/GRID),cy=Math.round(point.y/GRID);
  for(let radius=0;radius<=5;radius++)for(let y=cy-radius;y<=cy+radius;y++)for(let x=cx-radius;x<=cx+radius;x++){
    if(Math.max(Math.abs(x-cx),Math.abs(y-cy))!==radius||!gridDry(battleId,x,y,unit))continue;
    const candidate=gridPoint(x,y);
    if(segmentClear(battleId,point,candidate,unit))return{x,y};
  }
  return null;
}

function gridRoute(battleId,start,goal,unit) {
  const first=nearestGrid(battleId,start,unit),last=nearestGrid(battleId,goal,unit);
  if(!first||!last)return null;
  const startKey=nodeKey(first.x,first.y),goalKey=nodeKey(last.x,last.y);
  const open=new Map([[startKey,distance(first,last)]]),came=new Map(),cost=new Map([[startKey,0]]);
  const directions=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
  while(open.size){
    let currentKey=null,currentScore=Infinity;
    for(const [key,score] of open)if(score<currentScore||(score===currentScore&&key<currentKey)){currentKey=key;currentScore=score;}
    open.delete(currentKey);
    if(currentKey===goalKey){
      const path=[];
      for(let key=currentKey;key;key=came.get(key))path.push(parseKey(key));
      return path.reverse().map(point=>gridPoint(point.x,point.y));
    }
    const current=parseKey(currentKey),base=cost.get(currentKey);
    for(const [dx,dy] of directions){
      const nx=current.x+dx,ny=current.y+dy;
      if(!gridDry(battleId,nx,ny,unit))continue;
      if(dx&&dy&&(!gridDry(battleId,current.x+dx,current.y,unit)||!gridDry(battleId,current.x,current.y+dy,unit)))continue;
      const from=gridPoint(current.x,current.y),to=gridPoint(nx,ny);
      if(!segmentClear(battleId,from,to,unit))continue;
      const nextKey=nodeKey(nx,ny),nextCost=base+Math.hypot(dx,dy)*GRID;
      if(nextCost>= (cost.get(nextKey)??Infinity))continue;
      came.set(nextKey,currentKey);cost.set(nextKey,nextCost);
      open.set(nextKey,nextCost+distance(to,gridPoint(last.x,last.y)));
    }
  }
  return null;
}

function simplify(battleId,start,points,unit) {
  const result=[];
  let anchor=start,index=0;
  while(index<points.length){
    let furthest=index;
    for(let probe=index;probe<points.length;probe++)if(segmentClear(battleId,anchor,points[probe],unit))furthest=probe;
    result.push(points[furthest]);anchor=points[furthest];index=furthest+1;
  }
  return result;
}

export function routeTo(battleId,start,goal,unit) {
  if(!finitePoint(start)||!finitePoint(goal))return null;
  const requested={x:goal.x,y:goal.y};
  if(battleId!=='brandywine'&&battleId!=='bunker_hill'&&!structuresFor(battleId).length)return [requested];
  if(blocked(battleId,start,unit)){
    if(!unit || blocked(battleId,start))return null;
    const exit=resolveDestination(battleId,start,unit);
    if(!exit || !segmentClear(battleId,start,exit,unit))return null;
    const remaining=routeTo(battleId,exit,goal,unit);
    return remaining?[exit,...remaining]:null;
  }
  const offMap=goal.x<WORLD.minX||goal.x>WORLD.maxX||goal.y<WORLD.minY||goal.y>WORLD.maxY;
  const interiorGoal=offMap?{
    x:Math.max(MOVEMENT.minX,Math.min(MOVEMENT.maxX,goal.x)),
    y:Math.max(MOVEMENT.minY,Math.min(MOVEMENT.maxY,goal.y)),
  }:resolveDestination(battleId,goal,unit);
  if(!interiorGoal)return null;
  if(segmentClear(battleId,start,interiorGoal,unit)){
    if(!offMap)return[interiorGoal];
    return segmentClear(battleId,interiorGoal,requested,unit)?[interiorGoal,requested]:null;
  }
  const grid=gridRoute(battleId,start,interiorGoal,unit);
  if(!grid)return null;
  // Keep the validated start-to-grid connector. Dropping the first grid node can
  // make the first returned leg cross water even though the A* path itself is dry.
  const points=[...grid,interiorGoal];
  const route=simplify(battleId,start,points,unit);
  if(offMap){
    const last=route.at(-1)||start;
    if(!segmentClear(battleId,last,requested,unit))return null;
    route.push(requested);
  }
  return route;
}

/** Default off-map endpoint used by the engine for routed/withdrawn units. */
export function withdrawalDestination(battleId,unit) {
  if(!finitePoint(unit))return null;
  if(battleId==='bunker_hill'&&unit.side==='continental')return{x:700,y:-90};
  return{x:unit.side==='crown'?WORLD.maxX+90:-90,y:Math.max(MOVEMENT.minY,Math.min(MOVEMENT.maxY,unit.y))};
}
