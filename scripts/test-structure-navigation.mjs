import assert from 'node:assert/strict';
import {STRUCTURE_FOOTPRINTS} from '../src/battle/structureFootprints.js';
import {routeTo,segmentClear,resolveDestination,withdrawalDestination} from '../src/battle/terrainNavigation.js';
import {BATTLE_DEFINITIONS} from '../src/battle/battleDefinitions.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
const clearRoute=(id,start,goal)=>{
 const route=routeTo(id,start,goal);assert.ok(route,`${id}: route exists`);
 let previous=start;for(const point of route){assert.ok(segmentClear(id,previous,point),`${id}: clear route leg`);previous=point;}return route;
};
for(const [id,structures] of Object.entries(STRUCTURE_FOOTPRINTS)){
 for(const s of structures){
  const center={x:(s.x1+s.x2)/2,y:(s.y1+s.y2)/2};
  const left={x:s.x1-45,y:center.y},right={x:s.x2+45,y:center.y};
  assert.equal(segmentClear(id,left,right),false,`${id}: cannot march through walls`);
  assert.equal(segmentClear(id,center,center),false);
  const route=clearRoute(id,left,right);assert.deepEqual(route.at(-1),right);
  clearRoute(id,right,left);
  const engine=new TrentonEngine(44,id);
  const mover=engine.formations.find(u=>u.side==='continental');
  for(const u of engine.formations)if(u!==mover)u.active=false;
  Object.assign(mover,left,{target:{...left},order:'hold'});engine.move(mover.id,right);
  const accepted={...mover.target};
  for(let i=0;i<2000&&Math.hypot(mover.x-accepted.x,mover.y-accepted.y)>1;i++){
    const before={x:mover.x,y:mover.y};engine.advanceUnit(mover,.05);
    assert.ok(segmentClear(id,before,mover),'actual engine detour cannot cross walls');
  }
  assert.ok(Math.hypot(mover.x-accepted.x,mover.y-accepted.y)<1,`${id}: engine reaches far side of building`);

  const projected=resolveDestination(id,center);assert.ok(projected);assert.ok(segmentClear(id,projected,projected));
  clearRoute(id,left,center);
  assert.equal(segmentClear(id,{x:s.x1-1,y:s.y1},{x:s.x2+1,y:s.y1}),false,'grazing wall is blocked');
 }
 for(const unit of BATTLE_DEFINITIONS[id].formations){
  assert.ok(segmentClear(id,unit,unit),`${id}/${unit.id}: deployment outside walls`);
  clearRoute(id,unit,withdrawalDestination(id,unit));
 }
 // Runtime engine movement must obey walls, including AI and retreats.
 for(const seed of [17761226,42]){
  const engine=new TrentonEngine(seed,id);
  for(let step=0;step<600&&engine.outcome==='undecided';step++){
   const before=engine.formations.map(u=>({x:u.x,y:u.y}));engine.tick(.25);
   engine.formations.forEach((u,i)=>assert.ok(segmentClear(id,before[i],u),`${id}/${u.id}: movement crossed wall`));
  }
 }
}
console.log('Structure navigation passed: five battlefields, wall crossing, projected orders, reverse routes, deployment, retreat and runtime movement.');
