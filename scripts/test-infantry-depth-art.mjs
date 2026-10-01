import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {decodeRGBPNG} from './png-pixels.mjs';import {keyMagentaPixels} from '../src/battle/spriteChroma.js';
import {INFANTRY_DIRECTIONAL_SOURCES,INFANTRY_DIRECTIONAL_SPRITES,directionalProfileReady,directionalSpritePlacement,directionalSprite,directionalSources} from '../src/battle/infantryDirectionalSprites.js';
import {depthFoot,depthMotionOffset,depthMeshGeometry} from '../src/battle/infantryDepthMotion.js';
import {directionalVolleySamples} from '../src/battle/infantryVolleyVisuals.js';
assert.equal(INFANTRY_DIRECTIONAL_SOURCES.length,4);assert.equal(INFANTRY_DIRECTIONAL_SPRITES.length,40);
for(const source of INFANTRY_DIRECTIONAL_SOURCES){
 const png=fs.readFileSync(new URL('../public'+source.path,import.meta.url));assert.equal(crypto.createHash('sha256').update(png).digest('hex'),source.sha256);
 const {width,height,rgba}=decodeRGBPNG(png);assert.equal(width,source.width);assert.equal(height,source.height);keyMagentaPixels(rgba);
 const frames=INFANTRY_DIRECTIONAL_SPRITES.filter(s=>s.profile===source.profile),covered=new Set();
 for(const s of frames){const f=s.frame;assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=width&&f.y+f.height<=height);let count=0;
  for(let y=f.y;y<f.y+f.height;y++)for(let x=f.x;x<f.x+f.width;x++){const i=y*width+x,a=rgba[i*4+3];if(x===f.x||x===f.x+f.width-1||y===f.y||y===f.y+f.height-1)assert.equal(a,0,`${s.runtimeKey}: clear source edge`);if(a>32){assert.ok(!covered.has(i));covered.add(i);count++;}}
  assert.ok(count>22000,'whole subject');assert.equal(count,s.foreground);const art=directionalSpritePlacement(s.profile,s.view,s.pose,36);assert.ok(art.originX>0&&art.originX<1);assert.ok(art.originY>.5&&art.originY<1.1);assert.equal(art.scale,36/443);
 }
 // The rejected two drawing stride columns stay in the source for provenance;
 // only the first five columns of each row are accepted as runtime textures.
 for(let y=0;y<height;y++)for(let x=0;x<Math.round(width*5/7);x++){const i=y*width+x;if(rgba[i*4+3]>32)assert.ok(covered.has(i),'no cropped accepted weapon/boot');}
 assert.equal(directionalProfileReady(source.profile,()=>true),true);assert.equal(directionalProfileReady(source.profile,key=>!key.endsWith('rear-reload')),false);
 for(const view of ['front','rear']){
  assert.equal(directionalSprite(source.profile,view,'march0'),directionalSprite(source.profile,view,'carry'));
  const sprite=directionalSprite(source.profile,view),g=depthMeshGeometry(sprite);
  for(let p=0;p<Math.PI*2;p+=.05){const moved=g.samples.map(v=>{const o=depthMotionOffset(v.x,v.y,p,view);assert.ok(Math.abs(o.y)<4.3&&Math.abs(o.x)<=.43);if(v.y<=-28)assert.deepEqual(o,{x:0,y:0});return {x:v.x+o.x,y:v.y+o.y};});
   for(let i=0;i<moved.length;i+=3){const [a,b,c]=moved.slice(i,i+3),area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);assert.ok(area<0,'no inverted leg/cloth triangle');}
  }
 }
}
assert.equal(directionalProfileReady(6,()=>true),false);assert.equal(directionalSpritePlacement(0,'side','carry'),null);assert.equal(directionalSources([2,2]).length,2);
for(const view of ['front','rear'])for(const p of [0,Math.PI,Math.PI*2]){const a=depthFoot(p-.00001,view),b=depthFoot(p+.00001,view);assert.ok(Math.abs(a.y-b.y)<.001,'continuous stride boundaries');}
assert.notEqual(depthFoot(0).y,depthFoot(Math.PI).y);assert.equal(depthFoot(0,'front').y,-depthFoot(0,'rear').y);
const figures=Array.from({length:24},(_,i)=>({x:(i%12)*11,y:Math.floor(i/12)*12,height:39})),unit={active:true,type:'infantry',x:300,y:300};
for(const view of ['front','rear']){const points=directionalVolleySamples(unit,figures,view,.9);assert.equal(points.length,5);assert.equal(new Set(points.map(p=>p.x)).size,5);assert.ok(points.every(p=>p.dx===0&&(view==='front'?p.dy>0:p.dy<0)));}
assert.deepEqual(directionalVolleySamples(unit,[],'front'),[]);assert.deepEqual(directionalVolleySamples(unit,figures,'side'),[]);
console.log('Depth art passed: 40 complete keyed poses, profile availability, ground anchors, rejected strides excluded, continuous alternating feet, stable head, no folded triangles and occupied-edge volley smoke.');
