import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {segmentClear,BRANDYWINE_FORD} from '../src/battle/terrainNavigation.js';
const e=new TrentonEngine(17770911,'brandywine');let withdrawn=false,fordVisited=false;
for(let i=0;i<3000&&e.outcome==='undecided';i++){
 if(e.time>=50&&!withdrawn){for(const u of e.formations.filter(u=>u.side==='continental'))e.order(u.id,'withdraw');withdrawn=true;}
 const before=e.formations.map(u=>({x:u.x,y:u.y,active:u.active}));e.tick(.05);
 for(let j=0;j<e.formations.length;j++){
  const u=e.formations[j],p=before[j];if(!p.active)continue;
  assert.ok(Number.isFinite(u.x)&&Number.isFinite(u.y));
  assert.ok(Math.hypot(u.x-p.x,u.y-p.y)<=3,'No teleport to another bank');
  assert.ok(segmentClear('brandywine',p,u),'Each actual movement segment stays traversable');
  if(withdrawn&&u.id==='wayne-ford'&&Math.hypot(u.x-BRANDYWINE_FORD.x,u.y-BRANDYWINE_FORD.y)<BRANDYWINE_FORD.radius)fordVisited=true;
 }
}
assert.equal(e.outcome,'withdrawal','Existing delaying-action and escape policy remains viable');
assert.ok(fordVisited,'Wayne uses the ford during withdrawal');
assert.equal(e.formations.some(u=>u.active&&u.navigationBlocked),false,'No survivor remains stuck at a route boundary');
console.log('Brandywine navigation integration passed: ford used, legal continuous steps, no teleport, viable evacuation.');
const banks=new TrentonEngine(1,'brandywine');
for(const u of banks.formations){u.active=false;u.entered=true;}
const a=banks.formations.find(u=>u.id==='wayne-ford'),b=banks.formations.find(u=>u.id==='knyphausen-ford');
Object.assign(a,{x:709.58,y:615.23,active:true,order:'hold',ammunition:0});Object.assign(b,{x:730.42,y:569.77,active:true,order:'hold',ammunition:0});
assert.ok(!segmentClear('brandywine',a,b));assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<62);
const strengths=[a.strength,b.strength];banks.tick(.05);assert.deepEqual([a.strength,b.strength],strengths,'Opposite river banks cannot exchange hand-to-hand damage');
