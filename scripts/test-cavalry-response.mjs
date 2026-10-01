import assert from 'node:assert/strict';
import {CAVALRY_CONTACT_SPRITES,cavalryContactReady} from '../src/battle/supportActionSprites.js';
import {cavalryContactCycle} from '../src/battle/supportActionMotion.js';
import {cavalryContactWeights,cavalryContactResponse,cavalryContactOffset,cavalryContactGeometry} from '../src/battle/cavalryContactMotion.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
const unit=Object.freeze({active:true,type:'cavalry',status:'steady',engaged:true,moving:false,order:'attack'});
const area=([a,b,c])=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
let minimumRatio=1,maxVertices=0;
for(const sprite of CAVALRY_CONTACT_SPRITES.flat()){
 const g=cavalryContactGeometry(sprite);maxVertices=Math.max(maxVertices,g.samples.length);assert.ok(g.samples.length<=540);
 for(let t=0;t<5;t+=.017){
  const contact=cavalryContactCycle(unit,t,0,0,true),response=cavalryContactResponse(contact,t,0);
  const points=g.samples.map(s=>{const o=cavalryContactOffset(s.weights,response);assert.ok(Math.hypot(o.x,o.y)<1.4);return{x:s.x+o.x,y:s.y+o.y};});
  for(let i=0;i<points.length;i+=3){const ratio=area(points.slice(i,i+3))/area(g.samples.slice(i,i+3));minimumRatio=Math.min(minimumRatio,ratio);assert.ok(ratio>.5,'horse mesh must never fold or collapse');}
  for(const x of [-20,-12,0,12,20]){const o=cavalryContactOffset(cavalryContactWeights(x,0),response);assert.ok(o.x===0&&o.y===0,'every hoof stays planted');}
  const saddle=cavalryContactOffset(cavalryContactWeights(0,-23),response);
  for(const [x,y] of [[0,-41],[5,-42],[22,-41]]){const o=cavalryContactOffset(cavalryContactWeights(x,y),response);assert.ok(Math.hypot(o.x-saddle.x,o.y-saddle.y)<1e-12,'rider and saber move rigidly with saddle');}
 }
}
for(const p of [.55,.65,.74,.83,1]){
 const a=cavalryContactResponse({progress:p-1e-7},2),b=cavalryContactResponse({progress:p===1?0:p+1e-7},2);
 assert.ok(Math.hypot(a.shift-b.shift,a.settle-b.settle)<1e-5,'weight shift remains continuous across pose boundaries');
}
for(const phase of [-100,0,2,100])for(let t=0;t<5;t+=.01){const c=cavalryContactCycle(unit,t,phase,0,true);assert.ok(c.progress>=0&&c.progress<1);}
for(const profile of [0,2]){assert.equal(cavalryContactReady(profile,()=>true),true);for(const s of CAVALRY_CONTACT_SPRITES[profile/2])assert.equal(cavalryContactReady(profile,k=>k!==s.runtimeKey),false);}
for(const profile of [-1,1,3,NaN])assert.equal(cavalryContactReady(profile,()=>true),false);
const rear=cavalryContactResponse(cavalryContactCycle(unit,3,0,0,false),3);assert.equal(rear.shift,0,'rear ranks never lunge');
assert.equal(cavalryContactResponse(null,1),null);assert.equal(cavalryContactResponse({progress:0},NaN),null);
const battle=new TrentonEngine(17810117,'cowpens');while(battle.time<23.1)battle.tick(.05);battle.attack('washington-cavalry','legion-dragoons');
const cavalry=battle.formations.find(u=>u.id==='washington-cavalry');let since=null,seen=new Set();
for(let i=0;i<1000;i++){
 battle.tick(.05);if(cavalry.engaged&&!cavalry.moving)since??=battle.time;else since=null;
 const before=JSON.stringify(battle.snapshot()),c=cavalryContactCycle(cavalry,battle.time,0,since,true);
 if(c){const r=cavalryContactResponse(c,battle.time);seen.add(c.stage);assert.deepEqual(cavalryContactResponse(c,battle.time),r,'pause is deterministic');}
 assert.equal(JSON.stringify(battle.snapshot()),before,'presentation never changes damage or orders');
 if(seen.size===4)break;
}
assert.deepEqual([...seen].sort(),['cut','guard','prepare','recover']);
for(const patch of [{moving:true},{active:false},{status:'routed'},{order:'fallback'},{order:'withdraw'},{engaged:false}])assert.equal(cavalryContactCycle({...unit,...patch},3,0,0,true),null);
console.log(`Mounted response passed: planted hooves, rigid rider/saber, continuous impulse, complete-pair fallback, real Cowpens stages, max ${maxVertices} vertices, min triangle ratio ${minimumRatio.toFixed(3)}.`);

for(const phase of [0,2,5,7]){const a=cavalryContactResponse(cavalryContactCycle(unit,.3-1e-7,phase,0,true),.3-1e-7,phase),b=cavalryContactResponse(cavalryContactCycle(unit,.3+1e-7,phase,0,true),.3+1e-7,phase);assert.ok(Math.abs(a.shift-b.shift)<1e-5,'new contact fades in even for staggered riders');}
