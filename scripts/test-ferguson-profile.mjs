import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {decodeRGBPNG} from './png-pixels.mjs';import {keyMagentaPixels} from '../src/battle/spriteChroma.js';
import {retainSpriteIslands,spriteIslandSeeds} from '../src/battle/spriteIslands.js';
import {FERGUSON_SOURCES,FERGUSON_SPRITES,FERGUSON_TORSO,fergusonSprite,fergusonProfileReady,resolveInfantryProfile} from '../src/battle/fergusonSprites.js';
import {directionalSources,directionalSpritePlacement} from '../src/battle/infantryDirectionalSprites.js';
import {infantryRigSprites,infantryRigSources} from '../src/battle/infantryRigSprites.js';
import {infantryHeadingPresentation} from '../src/battle/infantryHeading.js';
import {directionalInfantryPose} from '../src/battle/infantryFacing.js';
import {getUnitIdentity} from '../src/battle/unitIdentity.js';import {BATTLE_DEFINITIONS} from '../src/battle/battleDefinitions.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {torsoMeshGeometry,torsoMotionOffset,torsoMotionWeights} from '../src/battle/infantryTorsoMotion.js';

assert.equal(FERGUSON_SOURCES.length,3);assert.equal(FERGUSON_SPRITES.length,25);assert.ok(FERGUSON_TORSO);
const all=[...FERGUSON_SPRITES,FERGUSON_TORSO];
for(const source of FERGUSON_SOURCES){
 const png=fs.readFileSync(new URL('../public'+source.path,import.meta.url));assert.equal(crypto.createHash('sha256').update(png).digest('hex'),source.sha256);
 const {width,height,rgba}=decodeRGBPNG(png);assert.equal(width,source.width);assert.equal(height,source.height);keyMagentaPixels(rgba);
 const covered=new Uint8Array(width*height);
 for(const s of all.filter(s=>s.key===source.key)){
  const f=s.frame,p=s.padding,w=f.width+p*2,h=f.height+p*2,cut=new Uint8ClampedArray(w*h*4);
  for(let y=0;y<f.height;y++)for(let x=0;x<f.width;x++){const i=((f.y+y)*width+f.x+x)*4;cut.set(rgba.subarray(i,i+4),((y+p)*w+x+p)*4);}
  retainSpriteIslands(cut,w,h,spriteIslandSeeds(s));let count=0,green=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4;if(!cut[i+3])continue;count++;
   assert.ok(x>p&&x<w-p-1&&y>p&&y<h-p-1,'no clipped figure or weapon at frame edge');
   const si=(f.y+y-p)*width+f.x+x-p;assert.equal(covered[si],0,'no neighbor fragments shared');covered[si]=1;
   assert.deepEqual(cut.slice(i,i+4),rgba.slice(si*4,si*4+4),'owned source pixels unchanged');
   if(cut[i+1]>cut[i]*1.13&&cut[i+1]>cut[i+2]*1.1&&cut[i+3]>32)green++;
  }
  assert.equal(count,s.foreground);assert.ok(count>30000,'whole readable subject');assert.ok(green>1500,`${s.runtimeKey} retains its green uniform`);
 }
 // Two unused stride columns in the front/rear source remain for provenance.
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(rgba[(y*width+x)*4+3]&&(source.key!=='ferguson-depth'||x<width*5/7))assert.equal(covered[y*width+x],1,'all accepted source pixels accounted for');
}
assert.equal(fergusonProfileReady(()=>true),true);
const required=[...all.map(s=>s.runtimeKey),...['thigh','calf','foot'].map(p=>'revolution-infantry-rig-'+p)];
for(const missing of required){assert.equal(fergusonProfileReady(k=>k!==missing),false);assert.equal(resolveInfantryProfile(4,k=>k!==missing),3,'whole-profile fallback for every missing component');}
for(const p of [0,1,2,3])assert.equal(resolveInfantryProfile(p,()=>false),p);
assert.equal(resolveInfantryProfile(4,()=>true),4);assert.equal(infantryRigSprites(4).torso,FERGUSON_TORSO);
// The new torso carries its rifle on the right of the source, so the old
// torso's right-edge sleeve mask must not bend this barrel or gripping hand.
const tg=torsoMeshGeometry(FERGUSON_TORSO);
for(let phase=0;phase<Math.PI*2;phase+=.08){
 for(const [u,v] of [[.86,.15],[.86,.65],[.86,.9],[.53,.25]]){const o=torsoMotionOffset(torsoMotionWeights(u,v,'ferguson'),phase);assert.ok(o.x===0&&o.y===0,'face, barrel and grip stay fixed');}
 const points=tg.samples.map(p=>{const o=torsoMotionOffset(p.weights,phase);return{x:p.x+o.x/FERGUSON_TORSO.scaleX,y:p.y+o.y/FERGUSON_TORSO.scaleY};});
 for(let i=0;i<points.length;i+=3){const [a,b,c]=points.slice(i,i+3);assert.ok((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)>0,'no folded torso triangle');}
}
assert.ok(torsoMotionOffset(torsoMotionWeights(.5,.9,'ferguson'),Math.PI/2).x>.4,'free sleeve still moves');
assert.equal(directionalSources([4]).length,3);assert.equal(infantryRigSources([4]).length,2);
for(const heading of ['e','se','s','sw','w','nw','n','ne']){
 const {view,flipX}=infantryHeadingPresentation(heading);
 for(const pose of ['carry','fire','reload','guard','thrust','march0','march1']){
  assert.ok(fergusonSprite(view,pose));const a=directionalSpritePlacement(4,view,pose,36,flipX),b=directionalSpritePlacement(4,view,pose,36,!flipX);
  assert.ok(a.key.startsWith('ferguson-'));assert.ok(Math.abs(a.originX+b.originX-1)<1e-9);assert.equal(a.scale,b.scale);
 }
}
const users=Object.entries(BATTLE_DEFINITIONS).flatMap(([battle,b])=>b.formations.filter(u=>getUnitIdentity(battle,u).infantryProfile===4).map(u=>battle+':'+u.id));
assert.deepEqual(users,['brandywine:ferguson']);assert.equal(getUnitIdentity('cowpens','morgan-riflemen').infantryProfile,3);
const engine=new TrentonEngine(17761226,'brandywine'),seen=new Set();
for(let i=0;i<1600&&engine.outcome==='undecided';i++){
 engine.tick(.05);const before=JSON.stringify(engine.snapshot()),u=engine.formations.find(u=>u.id==='ferguson');
 const pose=directionalInfantryPose(u,engine.time,engine.time,0,0,true);if(pose){assert.ok(fergusonSprite('side',pose));seen.add(pose.startsWith('march')?'march':pose);}
 assert.equal(JSON.stringify(engine.snapshot()),before,'art cannot alter weapon timing or casualties');
}
assert.ok(seen.has('march')&&seen.has('reload'),'real Brandywine movement and breech reload must both resolve');
console.log(`Ferguson profile passed: 25 isolated green action cutouts, matching torso, eight directions, all missing-component fallbacks and real Brandywine states ${[...seen].join(', ')}.`);
