import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {routeTo,segmentClear} from '../src/battle/terrainNavigation.js';

const bounds={minX:55,maxX:1145,minY:45,maxY:635};
const inside=point=>point.x>=bounds.minX&&point.x<=bounds.maxX&&point.y>=bounds.minY&&point.y<=bounds.maxY;

{
  const start={x:55,y:285},goal={x:895,y:45};
  assert.equal(segmentClear('brandywine',start,goal),false,'regression must require navigation around the channel');
  const route=routeTo('brandywine',start,goal);
  assert.ok(route&&route.length);
  assert.ok(route.every(inside),`normal movement route cannot contain unreachable boundary waypoint: ${JSON.stringify(route)}`);
  assert.deepEqual(route.at(-1),goal);
}

{
  const engine=new TrentonEngine(1,'brandywine');
  const unit=engine.formations.find(entry=>entry.id==='wayne-ford');
  Object.assign(unit,{x:55,y:285,target:{x:895,y:45},order:'advance'});
  for(let tick=0;tick<2500&&Math.hypot(unit.x-unit.target.x,unit.y-unit.target.y)>1;tick++)engine.advanceUnit(unit,.05);
  assert.ok(Math.hypot(unit.x-unit.target.x,unit.y-unit.target.y)<=1,'formation reaches a legal edge destination without stalling against movement clamps');
  assert.equal(unit.navigationBlocked,false);
  assert.ok(inside(unit));
}

{
  const retreat=routeTo('brandywine',{x:300,y:300},{x:-90,y:300});
  assert.deepEqual(retreat.at(-1),{x:-90,y:300},'off-map withdrawal endpoint remains exempt from playable bounds');
  assert.ok(retreat.slice(0,-1).every(inside));
}

console.log('Navigation boundaries passed: reachable grid waypoints, edge arrival, and preserved off-map retreat.');
