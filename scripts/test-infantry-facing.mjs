import assert from 'node:assert/strict';
import {infantryFacing,directionalInfantryPose} from '../src/battle/infantryFacing.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {travelPhase} from '../src/battle/figureMotion.js';
const radians=d=>d*Math.PI/180;
for(const offset of [-720,-360,0,360,720]) {
 for(const d of [0,180])assert.equal(infantryFacing(radians(d+offset)),'side');
 assert.equal(infantryFacing(radians(90+offset)),'front');
 assert.equal(infantryFacing(radians(-90+offset)),'rear');
}
assert.equal(infantryFacing(NaN),'side');
for(let d=46;d<54;d+=.1){assert.equal(infantryFacing(radians(d),'front'),'front');assert.equal(infantryFacing(radians(d),'side'),'side');}
assert.equal(infantryFacing(radians(43),'front'),'side');assert.equal(infantryFacing(radians(-90),'front'),'rear');
const u=Object.freeze({active:true,type:'infantry',status:'steady',order:'hold',moving:false,engaged:false,reload:0,volleySerial:0,ammunition:30,facing:Math.PI/2});
const pose=(patch={},travel=0,time=0,front=true)=>directionalInfantryPose({...u,...patch},travel,time,0,0,front);
assert.equal(pose(),'carry');assert.equal(pose({moving:true}), 'march0');assert.equal(pose({moving:true},Math.PI+.1),'march1');
assert.equal(pose({moving:true,order:'fallback'}),'guard');assert.equal(pose({moving:true,status:'routed',order:'withdraw'}),'march0');
assert.equal(pose({volleySerial:1,reload:1.7}),'fire');assert.equal(pose({volleySerial:1,reload:1}),'reload');assert.equal(pose({volleySerial:1,reload:1,ammunition:0}),'carry');
assert.equal(pose({active:false}),null);assert.equal(pose({type:'artillery'}),null);assert.equal(pose({status:'withdrawn'}),null);
const contact=new Set();for(let t=0;t<4;t+=.03){contact.add(pose({engaged:true},0,t,true));assert.equal(pose({engaged:true},0,t,false),'guard');assert.equal(pose({engaged:true,order:'fallback'},0,t,true),'guard');}
assert.deepEqual([...contact].sort(),['guard','thrust']);
const engine=new TrentonEngine(17,'trenton'),unit=engine.formations.find(u=>u.id==='mercer');engine.attack(unit.id,'rall');let travel=0,previous=null,seen=new Set();
for(let i=0;i<500;i++){const old={x:unit.x,y:unit.y};engine.tick(.05);travel=travelPhase(old,unit,travel);const before=JSON.stringify(engine.snapshot());previous=infantryFacing(unit.facing,previous);seen.add(directionalInfantryPose(unit,travel,engine.time,0,0,true));assert.equal(JSON.stringify(engine.snapshot()),before);}
assert.ok(seen.has('march0')&&seen.has('march1'));assert.ok(seen.has('fire')||seen.has('reload')||seen.has('guard'));
const paused=directionalInfantryPose(unit,travel,engine.time,0,0,true);engine.tick(0);assert.equal(directionalInfantryPose(unit,travel,engine.time,0,0,true),paused);
console.log('Infantry facing passed: heading wrap/dead band, complete action selection, occupied contact ranks, fallback/routing, real attack state purity and pause.');
