import assert from 'node:assert/strict';
import {infantryContactCycle,contactFrontRanks} from '../src/battle/infantryContactCycle.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
const u={active:true,status:'steady',engaged:true,moving:false,order:'advance',facing:0};
assert.equal(infantryContactCycle(u,10,0,10,true).frame,0,'new contact starts guarded');
const stages=new Set(),frames=new Set();
for(let t=10;t<15;t+=.01){const s=infantryContactCycle(u,t,1.7,10,true);stages.add(s.stage);frames.add(s.frame);assert.ok(Math.abs(s.x)<=.91);assert.ok(Math.abs(s.rotation)<=.008);}
assert.deepEqual([...stages].sort(),['guard','prepare','recover','thrust']);assert.equal(frames.size,2);
for(const override of [{moving:true},{status:'routed'},{status:'withdrawn'},{active:false},{engaged:false},{order:'withdraw'}])assert.equal(infantryContactCycle({...u,...override},12,0,10,true),null);
for(let t=10;t<15;t+=.05){assert.equal(infantryContactCycle(u,t,0,10,false).frame,0,'rear ranks never thrust');assert.equal(infantryContactCycle({...u,order:'fallback'},t,0,10,true).stage,'guard','fallback never thrusts');}
for(const t of [10,10.5,11,11.5,12,13]){const a=infantryContactCycle(u,t,1,10,true),b=infantryContactCycle({...u,facing:Math.PI},t,1,10,true);assert.equal(a.frame,b.frame);assert.ok(Math.abs(a.x+b.x)<1e-10);assert.ok(Math.abs(a.rotation+b.rotation)<1e-10);}
const poses=Array.from({length:12},(_,i)=>({x:(i%4)*11,y:Math.floor(i/4)*12}));
const at={x:100,y:100};
const right=contactFrontRanks(at,[{x:200,y:100}],poses);assert.ok([...right].every(f=>f.x>=22));assert.equal(right.size,6);
const north=contactFrontRanks(at,[{x:100,y:0}],poses);assert.ok([...north].every(f=>f.y<=12));assert.equal(north.size,8);
const both=contactFrontRanks(at,[{x:200,y:100},{x:100,y:0}],poses);assert.ok(both.size>right.size);
const depleted=poses.slice(0,2);assert.equal(contactFrontRanks(at,[{x:200,y:100}],depleted).size,2);
assert.equal(contactFrontRanks(at,[{x:NaN,y:0}],poses).size,0);
// Rendering cycles do not mutate real combat state; a paused battle cannot
// advance its posture. Contact age comes from the scene's first observed contact.
const battle=new TrentonEngine(17761226,'bunker_hill');for(const f of battle.formations)if(f.side==='continental')battle.order(f.id,'advance');
let fighter;for(let i=0;i<800&&!fighter;i++){battle.tick(.05);fighter=battle.formations.find(f=>f.active&&f.status==='steady'&&f.engaged&&!f.moving);}
assert.ok(fighter);const since=battle.time-.95,before=battle.snapshot();const pose=infantryContactCycle(fighter,battle.time,1.7,since,true);
for(let i=0;i<100;i++)infantryContactCycle(fighter,battle.time,1.7,since,true);
assert.deepEqual(battle.snapshot(),before);battle.tick(0);assert.deepEqual(infantryContactCycle(fighter,battle.time,1.7,since,true),pose);
console.log('Infantry contact cycle passed: guard/prepare/thrust/recover, edge ranks, flank contacts, pause, retreat gating, mirror symmetry and no combat-state mutation.');
