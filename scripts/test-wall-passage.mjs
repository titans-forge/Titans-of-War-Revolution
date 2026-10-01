import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {footprintDistance,formationFootprint} from '../src/battle/formationContact.js';
import {segmentClear} from '../src/battle/terrainNavigation.js';
// Test both sides of the rejected barracks, different widths and frame sizes.
let cases=0,maxSeconds=0;
for(const y of [244,300])for(const mode of ['line','column','open'])for(const dt of [.025,.05,.1])for(const reverse of [false,true]){
 const engine=new TrentonEngine(22,'trenton');const [a,b]=engine.formations;
 for(const unit of engine.formations)unit.active=unit===a||unit===b;
 const separation=formationFootprint({formationMode:mode}).x*2+6;
 Object.assign(a,{x:420-separation/2,y,target:{x:700,y},order:'advance',formationMode:mode,fatigue:0});
 Object.assign(b,{x:420+separation/2,y,target:{x:200,y},order:'advance',formationMode:mode,fatigue:0});
 let steps=0;
 for(;steps<60/dt;steps++){
  for(const unit of reverse?[b,a]:[a,b]){
   const before={x:unit.x,y:unit.y};engine.advanceUnit(unit,dt);
   assert.ok(segmentClear('trenton',before,unit),'passing cannot cut a wall');
   assert.ok(Math.hypot(unit.x-before.x,unit.y-before.y)<=42*dt+1e-8,'passing cannot teleport or exceed speed');
   assert.ok(footprintDistance(a,b)>=1-1e-8,'friendly footprints cannot overlap');
  }
  if(Math.hypot(a.x-700,a.y-y)<2&&Math.hypot(b.x-200,b.y-y)<2)break;
 }
 assert.ok(steps<60/dt,`wall passage completes: y=${y}, ${mode}, dt=${dt}, reversed=${reverse}`);
 cases++;maxSeconds=Math.max(maxSeconds,steps*dt);
}
console.log(`Wall passage passed: ${cases} cases, both sides of barracks, three formation widths, frame sizes and update orders; longest ${maxSeconds.toFixed(2)}s.`);
