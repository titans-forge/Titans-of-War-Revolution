import assert from 'node:assert/strict';
import {artilleryTransport} from '../src/battle/artilleryTransport.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
const unit={active:true,type:'artillery',status:'steady',engaged:false,order:'advance',moving:true,reload:0,facing:0};
for(const facing of [0,Math.PI]){
 const u={...unit,facing};let s=artilleryTransport(null,u,1,true);assert.equal(s.mode,'gather');assert.equal(s.positions.length,3);
 s=artilleryTransport(s,u,1.2,true);const before=structuredClone(s);assert.deepEqual(artilleryTransport(s,u,1.2,true),s,'pause');assert.deepEqual(s,before,'no input mutation');
 const halt={...u,moving:false,order:'hold'},stopped=artilleryTransport(s,halt,1.2,false);assert.equal(stopped.mode,'deploy');
 for(let i=0;i<3;i++){assert.equal(stopped.positions[i].x,s.positions[i].x);assert.equal(stopped.positions[i].y,s.positions[i].y);assert.equal(stopped.positions[i].travel,s.positions[i].travel,'gait phase survives interruption');}
 const settling=artilleryTransport(stopped,halt,1.4,false),restart=artilleryTransport(settling,u,1.4,true);assert.equal(restart.mode,'gather');
 for(let i=0;i<3;i++)assert.equal(restart.positions[i].x,settling.positions[i].x,'rapid restart preserves positions');
 const hauled=artilleryTransport(restart,u,2.11,true);assert.equal(hauled.mode,'haul');assert.equal(hauled.positions,null);
 const deploy=artilleryTransport(hauled,halt,2.2,false);assert.equal(deploy.mode,'deploy');assert.equal(artilleryTransport(deploy,halt,2.91,false).mode,'idle');
 for(const patch of [{engaged:true},{status:'routed'},{active:false},{order:'fallback'},{order:'withdraw'},{moving:false,reload:.1}]){
  const cancelled=artilleryTransport(restart,{...u,...patch},1.5,true);assert.equal(cancelled.mode,'idle');assert.equal(cancelled.positions,null);
 }
 assert.equal(artilleryTransport(hauled,u,2.2,false).mode,'deploy','missing art exits composite');
}
const battle=new TrentonEngine(17,'trenton'),gun=battle.formations.find(u=>u.id==='knox');battle.attack('knox','rall');let state=null;const modes=new Set();
for(let i=0;i<40;i++){battle.tick(.05);const snap=JSON.stringify(battle.snapshot());state=artilleryTransport(state,gun,battle.time,true);modes.add(state.mode);assert.equal(JSON.stringify(battle.snapshot()),snap);assert.equal(gun.volleySerial,0);}
assert.ok(modes.has('gather')&&modes.has('haul'));battle.order('knox','hold');battle.tick(.05);state=artilleryTransport(state,gun,battle.time,false);assert.equal(state.mode,'deploy');
for(let i=0;i<20;i++){battle.tick(.05);state=artilleryTransport(state,gun,battle.time,false);}assert.equal(state.mode,'idle');
console.log('Artillery transport passed: gather/haul/deploy/idle, interrupted position continuity, mirrored stations, immutable pause, combat/fallback/reload cancellation, missing art and real battery move/halt.');
