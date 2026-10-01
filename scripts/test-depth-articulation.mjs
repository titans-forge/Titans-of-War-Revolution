import assert from 'node:assert/strict';
import {ALL_INFANTRY_DIRECTIONAL_SPRITES} from '../src/battle/infantryDirectionalSprites.js';
import {depthFoot,depthMotionOffset,depthMotionWeights,depthStrideState,weightedDepthOffset,depthMeshGeometry} from '../src/battle/infantryDepthMotion.js';

const views=['front','rear','frontDiagonal','rearDiagonal'];
const area=([a,b,c])=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
let minimumAreaRatio=1,maximumVertices=0;
for(const sprite of ALL_INFANTRY_DIRECTIONAL_SPRITES.filter(s=>s.pose==='carry'&&s.view!=='side')) {
 const geometry=depthMeshGeometry(sprite);maximumVertices=Math.max(maximumVertices,geometry.samples.length);
 assert.ok(geometry.samples.length<=540,'joint detail must stay inside the established depth-mesh budget');
 for(let phase=0;phase<Math.PI*2;phase+=.035) {
  const state=depthStrideState(phase,sprite.view);
  const moved=geometry.samples.map(p=>{
   const o=weightedDepthOffset(p.weights,state);
   assert.deepEqual(o,depthMotionOffset(p.x,p.y,phase,sprite.view,sprite.motionLayout),'cached weights must preserve motion');
   return {x:p.x+o.x,y:p.y+o.y};
  });
  for(let i=0;i<moved.length;i+=3) {
   const ratio=area(moved.slice(i,i+3))/area(geometry.samples.slice(i,i+3));
   minimumAreaRatio=Math.min(minimumAreaRatio,ratio);
   assert.ok(ratio>.08,`${sprite.profile}/${sprite.view}: no folded or nearly collapsed triangle`);
  }
 }
}
for(const view of views) {
 // Independent anatomical landmarks: face, upper barrel, gripping hand and
 // musket stock. Free-arm flex must not pull these protected regions.
 const weaponX=view==='rear'?-3.8:3.8;
 for(let phase=0;phase<Math.PI*2;phase+=.11) {
  for(const [x,y] of [[0,-33],[weaponX,-32],[weaponX,-23],[weaponX,-14]])
   assert.deepEqual(depthMotionOffset(x,y,phase,view),{x:0,y:0},`${view} protected landmark ${x},${y}`);
 }
 const armX=view==='rearDiagonal'?5.8:view.startsWith('rear')?5:-5;
 const a=depthMotionOffset(armX,-20,Math.PI/2,view),b=depthMotionOffset(armX,-20,Math.PI*1.5,view);
 assert.ok(Math.abs(a.x-b.x)>.65,`${view}: free sleeve counter-swing is visible`);
 const x=view.endsWith('Diagonal')?-2.4:-2;
 const knee=depthMotionOffset(x,-8.5,Math.PI*1.5,view);
 assert.ok(Math.abs(knee.y)>.05,`${view}: passing knee articulates`);
 // At the sole, new joint flex must retain the original foot trajectory.
 const sole=depthMotionWeights(x,0,view);
 assert.equal(sole.knee,0);assert.equal(sole.arm,0);
 for(const toeX of [-5,-4,4,5])assert.equal(depthMotionWeights(toeX,-2,view).leg,1,'outboard toes must move with the foot, not remain pinned by the weapon mask');
 for(const phase of [0,Math.PI,Math.PI*2]) {
  for(const [xx,y] of [[x,-8.5],[armX,-20],[x,0]]) {
   const l=depthMotionOffset(xx,y,phase-1e-6,view),r=depthMotionOffset(xx,y,phase+1e-6,view);
   assert.ok(Math.hypot(l.x-r.x,l.y-r.y)<1e-4,'no jump at foot-exchange or loop boundary');
  }
 }
 for(const phase of [NaN,Infinity,-Infinity])assert.deepEqual(depthMotionOffset(x,-8.5,phase,view),{x:0,y:0});
 const first=depthMotionOffset(x,-8.5,2.1,view);
 assert.deepEqual(depthMotionOffset(x,-8.5,2.1,view),first,'paused distance phase produces the same pose');
 assert.equal(depthFoot(0,view).y,-depthFoot(Math.PI,view).y);
}
console.log(`Depth articulation passed: all supported profile/views, protected head and weapon landmarks, knee and free-arm motion, continuous feet, deterministic pause, max ${maximumVertices} vertices and minimum triangle area ratio ${minimumAreaRatio.toFixed(3)}.`);
