import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import{decodeRGBPNG}from'./png-pixels.mjs';import{keyMagentaPixels}from'../src/battle/spriteChroma.js';
import{retainSpriteIslands,spriteIslandSeeds}from'../src/battle/spriteIslands.js';
import{INFANTRY_DIAGONAL_SOURCES as sources,INFANTRY_DIAGONAL_SPRITES as sprites}from'../src/battle/infantryDiagonalAtlas.js';
import{directionalSpritePlacement,diagonalProfileReady,directionalSprite}from'../src/battle/infantryDirectionalSprites.js';
import{depthMotionOffset,depthMeshGeometry,depthFoot}from'../src/battle/infantryDepthMotion.js';
import{directionalVolleySamples}from'../src/battle/infantryVolleyVisuals.js';
assert.equal(sources.length,4);assert.equal(sprites.length,40);let rejectedNeighborPixels=0;
for(const source of sources){const png=fs.readFileSync(new URL('../public'+source.path,import.meta.url));assert.equal(crypto.createHash('sha256').update(png).digest('hex'),source.sha256);const {width,height,rgba}=decodeRGBPNG(png);keyMagentaPixels(rgba);const covered=new Uint8Array(width*height);
 for(const s of sprites.filter(s=>s.profile===source.profile)){const f=s.frame,p=s.padding,w=f.width+2*p,h=f.height+2*p,cut=new Uint8ClampedArray(w*h*4);assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=width&&f.y+f.height<=height);
  for(let y=0;y<f.height;y++)for(let x=0;x<f.width;x++){const src=((f.y+y)*width+f.x+x)*4,dest=((y+p)*w+x+p)*4;cut.set(rgba.subarray(src,src+4),dest);}
  const before=cut.slice();retainSpriteIslands(cut,w,h,spriteIslandSeeds(s));let count=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(before[i+3]&&!cut[i+3])rejectedNeighborPixels++;if(!cut[i+3])continue;count++;assert.ok(x>p&&x<w-p-1&&y>p&&y<h-p-1,'clear keyed gutter');const sourceIndex=(f.y+y-p)*width+f.x+x-p;assert.equal(covered[sourceIndex],0,'no shared fragments between subjects');covered[sourceIndex]=1;assert.deepEqual(cut.slice(i,i+4),before.slice(i,i+4),'owned foreground unchanged');}
  assert.equal(count,s.foreground);assert.ok(count>30000,'complete soldier and weapon');
  for(const flipped of [false,true]){const a=directionalSpritePlacement(s.profile,s.view,s.pose,36,flipped),b=directionalSpritePlacement(s.profile,s.view,s.pose,36,!flipped);assert.ok(Math.abs(a.originX+b.originX-1)<1e-9);assert.equal(a.scale,b.scale);assert.equal(a.flipX,flipped);}
 }
 for(let i=0;i<width*height;i++)if(rgba[i*4+3])assert.equal(covered[i],1,'every source foreground pixel assigned exactly once');
 assert.equal(diagonalProfileReady(source.profile,()=>true),true);assert.equal(diagonalProfileReady(source.profile,key=>key!==`infantry-diagonal-${source.profile}-rearDiagonal-reload`),false);assert.equal(diagonalProfileReady(source.profile,key=>!key.endsWith('rear-reload')),false);
 for(const view of ['frontDiagonal','rearDiagonal']){const sprite=directionalSprite(source.profile,view),g=depthMeshGeometry(sprite);
  for(let phase=0;phase<Math.PI*2;phase+=.04){const points=g.samples.map(p=>{const o=depthMotionOffset(p.x,p.y,phase,view);if(p.y<=-28)assert.deepEqual(o,{x:0,y:0});assert.ok(Math.abs(o.x)<=Math.SQRT2&&Math.abs(o.y)<4);return {x:p.x+o.x,y:p.y+o.y};});
   for(let i=0;i<points.length;i+=3){const [a,b,c]=points.slice(i,i+3);assert.ok((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)<0,`non-inverted ${source.profile} ${view} phase ${phase}`);}
  }
 }
}
assert.ok(rejectedNeighborPixels>100,'test proves overlapping bounds require island isolation');assert.equal(diagonalProfileReady(6,()=>true),false);
for(const view of ['frontDiagonal','rearDiagonal'])for(const p of [0,Math.PI,Math.PI*2]){const a=depthFoot(p-.000001,view),b=depthFoot(p+.000001,view);assert.ok(Math.abs(a.x-b.x)<.001&&Math.abs(a.y-b.y)<.001,'continuous support/passing boundaries');}
const f=Array.from({length:48},(_,i)=>({x:(i%12-5.5)*11,y:(Math.floor(i/12)-1.5)*12,height:39})),u={active:true,type:'infantry',x:400,y:300};
for(const v of ['frontDiagonal','rearDiagonal'])for(const flip of [false,true]){const samples=directionalVolleySamples(u,f,v,1,flip);assert.equal(samples.length,5);assert.ok(samples.every(s=>flip?s.dx<0:s.dx>0));assert.ok(samples.every(s=>v.startsWith('front')?s.dy>0:s.dy<0));}
console.log(`Diagonal art passed: 40 complete isolated silhouettes, ${rejectedNeighborPixels} neighboring pixels excluded, mirrored anchors, full-set fallback, four diagonal foot/volley directions and non-inverted mesh cycles.`);
