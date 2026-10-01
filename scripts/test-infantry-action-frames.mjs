import assert from 'node:assert/strict';
import {infantryActionFrame,infantryFrontRank} from '../src/battle/infantryActionFrames.js';
import {travelPhase,infantryBodyMotion} from '../src/battle/figureMotion.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
const unit={active:true,status:'steady',moving:true,order:'advance',engaged:false};
assert.deepEqual(infantryActionFrame(unit,.5),{kind:'march',frame:0});
assert.deepEqual(infantryActionFrame(unit,Math.PI+.5),{kind:'march',frame:1});
assert.deepEqual(infantryActionFrame(unit,.5+Math.PI*2),infantryActionFrame(unit,.5),'stride repeats by travel distance');
assert.equal(infantryActionFrame({...unit,moving:false},100),null,'stopped formations do not march in place');
assert.deepEqual(infantryActionFrame({...unit,status:'routed',order:'withdraw'},4),{kind:'march',frame:1},'routing troops animate their actual travel');
for(const moving of [true,false])assert.deepEqual(infantryActionFrame({...unit,order:'fallback',engaged:true,moving},4),{kind:'contact',frame:0},'backward and temporarily stopped fallback uses the guard');
assert.equal(infantryActionFrame({...unit,order:'fallback',moving:false},4),null);
for(const invalid of [{active:false},{status:'withdrawn'}])assert.equal(infantryActionFrame({...unit,...invalid},4),null);
const contact={...unit,moving:false,engaged:true};
assert.deepEqual(infantryActionFrame(contact,0),{kind:'contact',frame:0},'only the approved guard is requested');
assert.equal(infantryActionFrame({...contact,order:'withdraw'},4),null);
for(const [x,front,spacing,expected] of [[55,55,11,true],[44,55,11,true],[33,55,11,false],[-55,-55,11,true],[-44,-55,11,true],[22,22,11,true],[11,22,11,true],[0,22,11,false]])assert.equal(infantryFrontRank(x,front,spacing),expected);
assert.equal(infantryFrontRank(NaN,50,11),false);
// Real marching, paused, and stopped states preserve the accumulated cadence.
const battle=new TrentonEngine(17,'trenton'),a=battle.formations.find(u=>u.id==='mercer');
for(const other of battle.formations)if(other.side==='crown')other.firePolicy='hold';
battle.move(a.id,{x:a.x+80,y:a.y});let phase=0,seen=new Set();
for(let i=0;i<45;i++){const previous={x:a.x,y:a.y};battle.tick(.05);phase=travelPhase(previous,a,phase);seen.add(infantryActionFrame(a,phase)?.frame);}
assert.ok(seen.has(0)&&seen.has(1),'real movement advances both stride drawings');
const paused=infantryActionFrame(a,phase);battle.tick(0);assert.deepEqual(infantryActionFrame(a,phase),paused);
battle.order(a.id,'hold');battle.tick(.05);assert.equal(infantryActionFrame(a,phase),null);
// Reach real contact through orders, then verify a zero-time engine tick leaves
// both the drawing and procedural front-rank motion frozen.
const melee=new TrentonEngine(17,'bunker_hill');
for(const u of melee.formations)if(u.side==='continental')melee.order(u.id,'advance');
let engaged;
for(let i=0;i<800&&!engaged;i++){melee.tick(.05);engaged=melee.formations.find(u=>u.active&&u.status==='steady'&&u.engaged&&!u.moving);}
assert.ok(engaged,'real ordered battle reaches stationary close combat');
const before={frame:infantryActionFrame(engaged,0),motion:infantryBodyMotion(engaged,0,melee.time,1.7)};
melee.tick(0);
assert.deepEqual({frame:infantryActionFrame(engaged,0),motion:infantryBodyMotion(engaged,0,melee.time,1.7)},before,'paused real contact is frozen');
console.log('Infantry action frames passed: distance-driven stride, real contact pause, retreat/fallback distinctions, occupied front ranks, real movement and stop.');
