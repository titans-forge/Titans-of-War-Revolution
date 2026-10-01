import assert from 'node:assert/strict';
import {BRANDYWINE_FORD,resolveDestination,routeTo,segmentClear} from '../src/battle/terrainNavigation.js';

const near=(a,b,tolerance=1e-6)=>Math.hypot(a.x-b.x,a.y-b.y)<=tolerance;
const routeClear=(start,route)=>route.every((point,index)=>segmentClear('brandywine',index?route[index-1]:start,point));

{
  const start={x:410,y:560},goal={x:720,y:430};
  assert.equal(segmentClear('brandywine',start,goal),false,'direct cross-river march is blocked');
  const route=routeTo('brandywine',start,goal);
  assert.ok(route&&route.length>=2&&near(route.at(-1),goal));
  assert.ok(routeClear(start,route),'every planned leg stays on dry ground or inside the ford');
  assert.ok(route.some(point=>near(point,BRANDYWINE_FORD,BRANDYWINE_FORD.radius)),'cross-river route passes through the ford opening');
  const reverse=routeTo('brandywine',goal,start);
  assert.ok(reverse&&near(reverse.at(-1),start)&&routeClear(goal,reverse),'reverse crossing also uses a legal route');
}

{
  const start={x:300,y:150},goal={x:700,y:150};
  assert.ok(segmentClear('brandywine',start,goal));
  assert.deepEqual(routeTo('brandywine',start,goal),[goal],'same-bank movement remains a direct command');
}

{
  const water={x:345,y:425};
  const resolved=resolveDestination('brandywine',water);
  assert.ok(resolved&&!near(resolved,water));
  assert.ok(segmentClear('brandywine',resolved,resolved),'water destination projects to dry ground');
  assert.ok(Math.hypot(resolved.x-water.x,resolved.y-water.y)<40,'projection stays near the clicked bank');
}

{
  const point={x:100,y:100};
  assert.deepEqual(resolveDestination('trenton',point),point);
  assert.deepEqual(routeTo('trenton',point,{x:300,y:200}),[{x:300,y:200}]);
  assert.equal(resolveDestination('brandywine',{x:NaN,y:20}),null);
  assert.equal(routeTo('brandywine',point,{x:Infinity,y:20}),null);
  assert.equal(segmentClear('brandywine',point,{x:20,y:NaN}),false);
  assert.equal(routeTo('brandywine',{x:345,y:425},{x:700,y:200}),null,'unit already centered in blocked water cannot teleport out');
}

{
  const start={x:300,y:300},retreat={x:-90,y:300};
  const route=routeTo('brandywine',start,retreat);
  assert.ok(route&&near(route.at(-1),retreat),'off-map retreat endpoint is preserved');
  assert.ok(routeClear(start,route));
  assert.ok(route.some(point=>point.x===55),'retreat reaches the legal interior boundary before leaving the field');
}

{
  const edge={x:515.6663385480638,y:528.8980143987951},goal={x:170,y:610};
  assert.equal(segmentClear('brandywine',edge,goal),false,'long leg cannot skip a thin blocked sliver at the ford boundary');
  const route=routeTo('brandywine',edge,goal);
  assert.ok(route&&routeClear(edge,route),'ford-edge position receives a clear connector instead of a permanently blocked first step');
  let from=edge;
  for(const waypoint of route){
    const length=Math.hypot(waypoint.x-from.x,waypoint.y-from.y),steps=Math.max(1,Math.ceil(length));
    for(let i=1;i<=steps;i++){
      const prior={x:from.x+(waypoint.x-from.x)*(i-1)/steps,y:from.y+(waypoint.y-from.y)*(i-1)/steps};
      const next={x:from.x+(waypoint.x-from.x)*i/steps,y:from.y+(waypoint.y-from.y)*i/steps};
      assert.ok(segmentClear('brandywine',prior,next),'every accepted route remains clear when subdivided into movement-sized steps');
    }
    from=waypoint;
  }
}

console.log('Terrain navigation passed: ford routing, direct same-bank movement, destination projection, finite guards, and off-map retreat.');
