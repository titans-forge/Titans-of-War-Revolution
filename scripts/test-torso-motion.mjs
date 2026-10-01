import assert from 'node:assert/strict';
import {torsoMotionWeights,torsoMotionOffset,torsoMeshGeometry} from '../src/battle/infantryTorsoMotion.js';
import {infantryRigSprites} from '../src/battle/infantryRigSprites.js';
for(const [u,v] of [[.45,.2],[.6,.32],[.4,.56],[.35,.7]])for(const phase of [0,1,2,3])assert.deepEqual(torsoMotionOffset(torsoMotionWeights(u,v),phase),{x:0,y:0},'face, gripping hand and musket remain fixed');
const hand=torsoMotionWeights(.94,.84),coat=torsoMotionWeights(.25,.97);
assert.ok(torsoMotionOffset(hand,Math.PI/2).x>.5);assert.ok(torsoMotionOffset(hand,Math.PI*1.5).x<-.5);
assert.ok(Math.abs(torsoMotionOffset(coat,2).x)>.2);
for(let p=0;p<Math.PI*2;p+=.1)for(const weights of [hand,coat]){const o=torsoMotionOffset(weights,p);assert.ok(Math.abs(o.x)<=.9&&Math.abs(o.y)<=.32);assert.deepEqual(torsoMotionOffset(weights,p),o);}
for(let profile=0;profile<4;profile++) {
 const sprite=infantryRigSprites(profile).torso,g=torsoMeshGeometry(sprite);
 assert.equal(g.vertices.length,g.uvs.length);assert.equal(g.samples.length,g.vertices.length/2);
 for(let p=0;p<Math.PI*2;p+=.2)for(let i=0;i<g.samples.length;i+=3){
  const points=g.samples.slice(i,i+3).map(s=>{const o=torsoMotionOffset(s.weights,p);return {x:s.x+o.x/sprite.scaleX,y:s.y+o.y/sprite.scaleY};});
  const[a,b,c]=points;assert.ok((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)>0,'cloth warp never folds a triangle inside out');
 }
}
console.log('Torso motion passed: stable face/weapon grip, free-arm counter-swing, coat motion, bounded displacement and no folded mesh triangles for all four uniforms.');
