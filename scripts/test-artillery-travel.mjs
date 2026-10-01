import assert from 'node:assert/strict';
import {ARTILLERY_TRAVEL_SPRITES,artilleryTravelWeights,artilleryTravelState,artilleryTravelOffset,artilleryTravelGeometry} from '../src/battle/artilleryTravelMotion.js';
import {artilleryHaulReady,ARTILLERY_HAUL_SPRITES} from '../src/battle/supportActionSprites.js';
import {artilleryHaulFrame} from '../src/battle/supportActionMotion.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {travelPhase} from '../src/battle/figureMotion.js';
const gun={active:true,type:'artillery',status:'steady',moving:true,order:'advance',strength:120,initialStrength:120};
const area=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
let minimum=Infinity;
for(const sprite of ARTILLERY_TRAVEL_SPRITES){
 const geometry=artilleryTravelGeometry(sprite);assert.equal(geometry.samples.length,1920);
 for(let phase=0;phase<Math.PI*2;phase+=.04){
  const state=artilleryTravelState(gun,phase,1.7,-1);
  const points=geometry.samples.map(p=>{const o=artilleryTravelOffset(p.weights,state);assert.ok(Math.hypot(o.x,o.y)<2);return {x:p.x+o.x/geometry.factor,y:p.y+o.y/geometry.factor};});
  for(let i=0;i<points.length;i+=3){const ratio=area(...points.slice(i,i+3))/area(...geometry.samples.slice(i,i+3));minimum=Math.min(minimum,ratio);assert.ok(ratio>.15,`Mesh folded/collapsed: ${sprite.atlasFrame} ${phase} ${ratio}`);}
  for(const x of [sprite.frame.x,sprite.frame.x+sprite.frame.width/2,sprite.frame.x+sprite.frame.width]){
   const upper=artilleryTravelOffset(artilleryTravelWeights(sprite,x,sprite.hip),state);assert.ok(upper.x===0&&upper.y===0);
  }
  if(sprite.tool)for(let y=285;y<490;y+=5){const o=artilleryTravelOffset(artilleryTravelWeights(sprite,1102+(485-y)*.45,y),state);assert.ok(o.x===0&&o.y===0,'staff stays rigid');}
 }
}
for(const patch of [{active:false},{moving:false},{status:'destroyed'},{type:'infantry'}])assert.equal(artilleryTravelState({...gun,...patch},2,0,0),null);
for(const phase of [NaN,Infinity])assert.equal(artilleryTravelState(gun,phase,0,0),null);
for(const order of ['advance','withdraw','fallback']){
 const initial=artilleryTravelState({...gun,order},4,1.7,4);for(const foot of Object.values(initial))assert.ok(foot.x===0&&foot.y===0,'smooth start');
 const early=artilleryTravelState({...gun,order},4.00001,1.7,4);assert.ok(Math.abs(early.left.x)<1e-7);
}
const forward=artilleryTravelState(gun,2,0,0),back=artilleryTravelState({...gun,order:'fallback'},2,0,0);assert.equal(back.left.x,-forward.left.x);assert.equal(back.left.y,forward.left.y);
assert.ok(artilleryTravelState({...gun,status:'routed'},2,0,0));
const keys=new Set(ARTILLERY_HAUL_SPRITES.map(s=>s.runtimeKey));assert.ok(artilleryHaulReady(k=>keys.has(k)));
for(const missing of keys)assert.equal(artilleryHaulReady(k=>keys.has(k)&&k!==missing),false);
const battle=new TrentonEngine(17,'trenton'),battery=battle.formations.find(u=>u.id==='knox');battle.attack('knox','rall');let phase=0,poses=new Set();
for(let i=0;i<70;i++){
 const beforePosition={x:battery.x,y:battery.y};battle.tick(.05);phase=travelPhase(beforePosition,battery,phase);
 const snapshot=JSON.stringify(battle.snapshot()),state=artilleryTravelState(battery,phase,0,0);
 assert.ok(state,'normal advancing battery gets travel motion');poses.add(state.left.x.toFixed(3));assert.equal(JSON.stringify(battle.snapshot()),snapshot);assert.equal(battery.volleySerial,0);
}
assert.ok(poses.size>20);const paused=artilleryTravelState(battery,phase,0,0);battle.tick(0);assert.deepEqual(artilleryTravelState(battery,phase,0,0),paused);
assert.equal(artilleryHaulFrame({...gun,strength:40},phase),null);assert.ok(artilleryTravelState({...gun,strength:40},phase,0,0),'depleted crew retains individual motion');
battle.order('knox','hold');battle.tick(.05);assert.equal(artilleryTravelState(battery,phase,0,0),null);
console.log(`Artillery travel passed: three crew profiles, rigid tools/upper bodies, bounded mesh (minimum triangle ratio ${minimum.toFixed(3)}), distance-driven steps, entry, pause, halt, backwards fallback, depleted crews, missing haul poses and actual battery firing discipline.`);
