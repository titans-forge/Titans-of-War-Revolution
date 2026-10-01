import assert from 'node:assert/strict';
import {travelPhase,firingOrigin,crewLoading,infantryBodyMotion} from '../src/battle/figureMotion.js';
const unit={x:10,y:0,type:'infantry',active:true};
const full=travelPhase({x:0,y:0},unit,0);
const half=travelPhase({x:0,y:0},{...unit,x:5},0);
assert.equal(travelPhase({x:5,y:0},unit,half),full,'Distance cadence independent of frame subdivision');
assert.equal(travelPhase(unit,unit,full),full,'No sliding animation while stationary or paused');
assert.equal(travelPhase(null,unit,0),0,'Spawn starts without movement');
assert.equal(travelPhase({x:1000,y:0},unit,full),full,'Teleport does not accelerate gait');
assert.equal(firingOrigin(true,0)+firingOrigin(true,Math.PI),1,'Mirrored firing anchor preserves body position');
assert.equal(firingOrigin(false,Math.PI),.5);
for(const reload of [0,3.2])assert.deepEqual(crewLoading(reload,false,1),{reach:0,lean:0});
assert.deepEqual(crewLoading(1.5,true,1),{reach:0,lean:0},'No loading while marching');
assert.ok(crewLoading(1.5,false,1).reach>0,'Reload drives crew effort');
const steady={...unit,status:'steady',moving:false,reload:0,engaged:false};
assert.deepEqual(infantryBodyMotion(steady,4,12,2),infantryBodyMotion(steady,4,12,2),'Paused simulation time retains the exact pose');
const idle=infantryBodyMotion(steady,4,12,2);
assert.equal(idle.lift,0,'Idle breathing keeps boots on the ground');
assert.ok(idle.scaleY>=.9965&&idle.scaleY<=1.0035,'Idle breathing remains subtle');
const march=infantryBodyMotion({...steady,moving:true},Math.PI/2,12,0);
assert.equal(march.lift,.7);
assert.equal(march.scaleY,1,'March cadence does not stretch bodies');
assert.deepEqual(march,infantryBodyMotion({...steady,moving:true},Math.PI/2+Math.PI*2,99,0),'March follows travel distance, not wall time');
const reloadStart=infantryBodyMotion({...steady,reload:1.8},0,12,1);
const reloadMiddle=infantryBodyMotion({...steady,reload:.9},0,12,1);
assert.deepEqual(reloadStart,{x:0,lift:0,rotation:0,scaleY:1});
assert.ok(Math.abs(reloadMiddle.x)>0&&reloadMiddle.scaleY<1,'Reload midpoint adds bounded varied lean');
for(let phase=0;phase<20;phase+=.31){const m=infantryBodyMotion({...steady,reload:.9},0,12,phase);assert.ok(Math.abs(m.x)<=.32&&Math.abs(m.rotation)<=.008&&m.scaleY>=.991&&m.scaleY<=1);}
assert.deepEqual(infantryBodyMotion({...steady,status:'routed',moving:true},10,12,1),{x:0,lift:0,rotation:0,scaleY:1});
console.log('Figure motion passed: distance cadence, pause stability, anchored idle/march motion, mirrored fire, and bounded reload lean.');

{
 const contact={...steady,engaged:true,facing:0};
 const right=infantryBodyMotion(contact,0,12,1),left=infantryBodyMotion({...contact,facing:Math.PI},0,12,1);
 assert.equal(right.x,-left.x);assert.equal(right.rotation,-left.rotation);
 assert.equal(right.lift,0);assert.equal(right.scaleY,1);
 assert.deepEqual(right,infantryBodyMotion(contact,0,12,1),'paused contact pose is exact');
 assert.ok(Math.abs(right.x)<=.7&&Math.abs(right.rotation)<=.012,'contact motion stays bounded');
}
