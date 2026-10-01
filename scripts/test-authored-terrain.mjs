import assert from 'node:assert/strict';
import {BUNKER_HARBOR,resolveDestination,routeTo,segmentClear,withdrawalDestination} from '../src/battle/terrainNavigation.js';

const near=(a,b,tolerance=1e-6)=>Math.hypot(a.x-b.x,a.y-b.y)<=tolerance;
const routeClear=(battle,start,route)=>route.every((point,index)=>segmentClear(battle,index?route[index-1]:start,point));

assert.ok(BUNKER_HARBOR.length>=5,'shoreline annotation is available to the scene');
assert.equal(segmentClear('bunker_hill',{x:300,y:400},{x:80,y:400}),false,'march cannot enter the visible harbor');
const projected=resolveDestination('bunker_hill',{x:150,y:400});
assert.ok(projected&&!near(projected,{x:150,y:400}),'a harbor click projects back to shoreline ground');
assert.equal(segmentClear('bunker_hill',projected,projected),true);
const deepProjected=resolveDestination('bunker_hill',{x:55,y:500});
assert.ok(deepProjected&&segmentClear('bunker_hill',deepProjected,deepProjected),'a deep playable harbor click still reaches the nearest dry shore');

{
  const start={x:300,y:550},goal={x:100,y:100};
  assert.equal(segmentClear('bunker_hill',start,goal),false,'direct diagonal cuts the painted shoreline');
  const route=routeTo('bunker_hill',start,goal);
  assert.ok(route&&near(route.at(-1),goal));
  assert.ok(routeClear('bunker_hill',start,route),'planned shoreline route contains only legal legs');
}

{
  const unit={x:410,y:470,side:'continental'};
  const exit=withdrawalDestination('bunker_hill',unit);
  assert.deepEqual(exit,{x:700,y:-90},'Bunker Hill withdrawal uses the visible northern neck');
  const route=routeTo('bunker_hill',unit,exit);
  assert.ok(route&&near(route.at(-1),exit)&&routeClear('bunker_hill',unit,route),'northward withdrawal is legal and preserves its off-map endpoint');
  assert.deepEqual(withdrawalDestination('bunker_hill',{x:1010,y:470,side:'crown'}),{x:1290,y:470});
}

assert.equal(segmentClear('long_island',{x:50,y:50},{x:1100,y:600}),true,'perspective river is intentionally not a collision mask');
const boatRoute=routeTo('long_island',{x:300,y:300},{x:-90,y:300});
assert.deepEqual(boatRoute.at(-1),{x:-90,y:300},'Long Island withdrawal preserves its exit');
assert.ok(routeClear('long_island',{x:300,y:300},boatRoute),'Long Island withdrawal has clear legs');

console.log('Authored terrain passed: Bunker harbor projection/routing, legal northern retreat, and bounded map coverage.');
