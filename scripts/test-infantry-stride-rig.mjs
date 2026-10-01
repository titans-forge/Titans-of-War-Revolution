import assert from 'node:assert/strict';
import {infantryStrideRig} from '../src/battle/infantryStrideRig.js';
const unit=Object.freeze({active:true,type:'infantry',status:'steady',moving:true,order:'advance',facing:0});
const at=p=>infantryStrideRig(unit,p);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
assert.ok(at(.01).near.ankle.x>at(.01).far.ankle.x);
assert.ok(at(Math.PI+.01).near.ankle.x<at(Math.PI+.01).far.ankle.x,'opposite half reverses the actual leading leg');
assert.equal(at(Math.PI/2).near.stance,true);assert.equal(at(Math.PI/2).far.stance,false);
assert.equal(at(Math.PI*1.5).near.stance,false);assert.equal(at(Math.PI*1.5).far.stance,true);
for(let p=0;p<Math.PI*2;p+=.03){
 const pose=at(p),mirror=infantryStrideRig({...unit,facing:Math.PI},p);
 for(const side of ['near','far']) {
  const leg=pose[side];assert.ok(Math.abs(distance(leg.hip,leg.knee)-8)<1e-9);assert.ok(Math.abs(distance(leg.knee,leg.ankle)-7.5)<1e-9);
  assert.ok(leg.ankle.y<=-2+1e-9,'feet do not pass through the ground');
  for(const point of ['hip','knee','ankle']){assert.ok(Math.abs(leg[point].x+mirror[side][point].x)<1e-9);assert.ok(Math.abs(leg[point].y-mirror[side][point].y)<1e-9);}
  if(leg.stance){assert.equal(leg.ankle.y,-2);assert.equal(leg.footRotation,0);}
 }
}
// Horizontal stride uses the same .42 distance cadence as the existing scene.
// At base scale, body translation and planted-foot translation cancel exactly.
for(const phase of [.2,.8,1.7]){const dx=.2;assert.ok(Math.abs(at(phase+.42*dx).near.ankle.x+dx-at(phase).near.ankle.x)<1e-9);}
for(const phase of [0,Math.PI,Math.PI*2]){const a=at(phase-1e-6),b=at(phase+1e-6);for(const side of ['near','far'])assert.ok(distance(a[side].ankle,b[side].ankle)<1e-4,'no cycle-boundary teleport');}
for(const patch of [{active:false},{moving:false},{order:'fallback'},{status:'withdrawn'},{type:'artillery'}])assert.equal(infantryStrideRig({...unit,...patch},1),null);
assert.ok(infantryStrideRig({...unit,status:'routed',order:'withdraw'},1));
assert.equal(infantryStrideRig(unit,NaN),null);
assert.deepEqual(at(1),at(1),'same simulated travel gives the same pose while paused');
console.log('Infantry stride rig passed: alternating anatomical legs, equal bone lengths, ground clearance, horizontal planting, continuous boundaries, mirrored gait and movement gating.');

const {TrentonEngine}=await import('../src/battle/trentonEngine.js');
const {travelPhase}=await import('../src/battle/figureMotion.js');
const battle=new TrentonEngine(17,'trenton'),soldier=battle.formations.find(u=>u.id==='mercer');
battle.move(soldier.id,{x:soldier.x+80,y:soldier.y});let travel=0,leading=new Set();
for(let i=0;i<45;i++) {
 const previous={x:soldier.x,y:soldier.y};battle.tick(.05);travel=travelPhase(previous,soldier,travel);
 const before=JSON.stringify(battle.snapshot()),pose=infantryStrideRig(soldier,travel);
 assert.ok(pose);leading.add(pose.near.ankle.x>pose.far.ankle.x);
 assert.equal(JSON.stringify(battle.snapshot()),before,'rig never changes combat state');
}
assert.equal(leading.size,2,'real movement alternates both leading legs');
const frozen=infantryStrideRig(soldier,travel);battle.tick(0);assert.deepEqual(infantryStrideRig(soldier,travel),frozen);
battle.order(soldier.id,'fallback');battle.tick(.05);assert.equal(infantryStrideRig(soldier,travel),null);
battle.order(soldier.id,'hold');battle.tick(.05);assert.equal(infantryStrideRig(soldier,travel),null);
console.log('Real infantry orders passed: advance, alternate legs, pause, guarded fallback, halt and state purity.');

const contact=new TrentonEngine(17,'trenton'),m=contact.formations.find(u=>u.id==='mercer'),enemy=contact.formations.find(u=>u.id==='rall');
contact.move(m.id,{x:enemy.x,y:enemy.y});let reached=false;
for(let i=0;i<1200;i++){contact.tick(.05);if(m.engaged&&!m.moving&&m.status==='steady'){reached=true;break;}}
assert.ok(reached,'real Continental ground advance reaches close combat');
assert.equal(infantryStrideRig(m,10),null,'march rig yields to existing combat art at actual contact');
console.log('Real Continental close-combat handoff passed.');
