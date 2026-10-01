import assert from 'node:assert/strict';
import { BattleSound, synthesizeEffect } from '../src/battle/battleSound.js';
for(const kind of ['musket','cannon','metal']) {
 const wave=synthesizeEffect(kind);let peak=0,energy=0;
 for(const value of wave){assert.ok(Number.isFinite(value));peak=Math.max(peak,Math.abs(value));energy+=value*value;}
 assert.ok(peak<.95&&peak>.05);assert.ok(energy/wave.length>.00001);
 assert.ok(Math.abs(wave.at(-1))<.002,'No abrupt audible tail');
}
const sound=new BattleSound();let played=[];sound.play=(kind,x)=>{if(sound.enabled&&sound.running)played.push(kind);};sound.enabled=true;sound.context={currentTime:1};
const snap=serial=>({formations:[{id:'a',type:'infantry',x:500,active:true,volleySerial:serial,engaged:false}]});
sound.sync(snap(4),true);assert.equal(played.length,0,'Enabling does not replay old fire');
sound.context.currentTime=2;sound.sync(snap(5),true);assert.deepEqual(played,['musket']);
sound.sync(snap(5),true);assert.equal(played.length,1,'Repeated snapshots do not replay volleys');
sound.context.currentTime=3;sound.sync(snap(6),false);assert.equal(played.length,1,'Paused snapshots cannot play');
sound.context.currentTime=4;sound.sync(snap(6),true);assert.equal(played.length,1,'Resume does not backlog paused fire');
const melee={formations:[{id:'a',type:'infantry',x:500,active:true,volleySerial:6,engaged:true}]};
sound.sync(melee,true);sound.sync(melee,true);assert.equal(played.filter(k=>k==='metal').length,1,'Contact is throttled');
sound.setVolume(-1);assert.equal(sound.volume,0);sound.setVolume(2);assert.equal(sound.volume,1);
console.log('Battle sound passed: finite bounded waveforms, quiet tails, event deduplication, pause/no backlog and contact throttle.');
const capped=new BattleSound();capped.enabled=true;capped.running=true;capped.context={state:'running'};
let stopped=0;for(let i=0;i<10;i++)capped.voices.add({stop(){stopped++;}});
assert.doesNotThrow(()=>capped.play('musket',0),'Voice cap rejects new audio before allocating nodes');
capped.disable();assert.equal(stopped,10);assert.equal(capped.voices.size,0);
assert.equal(await new BattleSound().enable(),false,'Unsupported environments fail without breaking the game');
