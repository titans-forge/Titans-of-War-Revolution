import assert from 'node:assert/strict';
import {infantryPose,weaponStatus} from '../src/battle/infantryAnimation.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
const standing={active:true,status:'steady',moving:false,order:'hold',engaged:false,volleySerial:1};
for(let phase=0;phase<20;phase+=.25){
 assert.equal(infantryPose({...standing,reload:1.8},phase),'fire');
 assert.equal(infantryPose({...standing,reload:.9},phase),'reload');
 assert.equal(infantryPose({...standing,reload:.05},phase),'ready');
 assert.equal(infantryPose({...standing,reload:0},phase),'carry');
}
for(const state of [{moving:true},{active:false},{status:'routed'},{status:'withdrawn'},{order:'withdraw'},{order:'fallback'},{order:'reform'}])assert.equal(infantryPose({...standing,reload:.9,...state}),'carry');
assert.equal(infantryPose({...standing,engaged:true,reload:.9}),'contact','contact interrupts loading');
assert.equal(infantryPose({...standing,volleySerial:0,reload:.9}),'carry','initial cooldown is not a real shot');
for(const bad of [NaN,Infinity,-Infinity,-1,2])assert.equal(infantryPose({...standing,reload:bad}),'carry');
assert.equal(infantryPose(null),'carry');
// Verify real fire -> load -> ready behavior, preservation through pause, and
// identical sampled poses when simulation frames are partitioned differently.
function battle(){
 const e=new TrentonEngine(17761226,'trenton'),a=e.formations.find(u=>u.id==='mercer'),b=e.formations.find(u=>u.id==='rall');
 for(const u of e.formations)u.active=u===a||u===b;
 Object.assign(a,{x:400,y:300,target:{x:400,y:300},order:'hold',firePolicy:'hold',facing:0});
 Object.assign(b,{x:580,y:300,target:{x:580,y:300},order:'hold',firePolicy:'hold'});e.nextCrownDecision=1e9;
 e.order(a.id,'volley');return {e,a};
}
const {e,a}=battle();e.tick(.05);assert.equal(infantryPose(a),'fire');
const ammo=a.ammunition,serial=a.volleySerial,snapshot=e.snapshot();e.tick(0);
assert.deepEqual(e.snapshot(),snapshot);assert.equal(infantryPose(a),'fire','paused state freezes the weapon pose');
e.tick(.6);assert.equal(infantryPose(a),'reload');e.tick(1.05);assert.equal(infantryPose(a),'ready');
e.tick(.2);assert.equal(infantryPose(a),'carry');assert.equal(a.volleySerial,serial);assert.equal(a.ammunition,ammo,'poses cannot create another shot');
const fine=battle(),coarse=battle();for(let i=0;i<16;i++)fine.e.tick(.05);for(let i=0;i<4;i++)coarse.e.tick(.2);
assert.deepEqual(fine.e.snapshot(),coarse.e.snapshot());assert.equal(infantryPose(fine.a,3),infantryPose(coarse.a,3));
console.log('Infantry animation passed: real-shot fire/load/ready sequence, deterministic pause/rank variation, contact and retreat interruption, frame parity and unchanged ammunition.');

assert.equal(infantryPose({...standing,reload:.9,ammunition:0}),'carry','empty ammunition cannot depict another reload');
assert.equal(infantryPose({...standing,reload:1.8,ammunition:0}),'fire','the last actual shot is still shown');
assert.equal(weaponStatus({...standing,reload:.9,ammunition:3,volleyRequested:true}),'Reloading 0.9s · volley queued');
assert.equal(weaponStatus({...standing,engaged:true,volleyRequested:true}),'Close combat · volley waiting');
assert.equal(weaponStatus({...standing,reload:0,ammunition:3}),'Loaded');
assert.equal(weaponStatus({...standing,reload:.9,ammunition:0}),'Out of ammunition');

assert.equal(weaponStatus({...standing,reload:.049999999,ammunition:3}),'Reloading 0.1s','a partial final tenth cannot display a misleading 0.0s reload');
