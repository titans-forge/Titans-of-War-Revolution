import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {decodeRGBPNG} from './png-pixels.mjs';import {keyMagentaPixels} from '../src/battle/spriteChroma.js';
import {retainSpriteIslands,spriteIslandSeeds} from '../src/battle/spriteIslands.js';
import {GRENADIER_SOURCES,GRENADIER_SPRITES,GRENADIER_TORSO} from '../src/battle/grenadierAtlas.js';
import {specialInfantryProfileReady,resolveInfantryProfile,infantryProfileLoadSet,SPECIAL_INFANTRY_IDS} from '../src/battle/infantrySpecialProfiles.js';
import {directionalSources,directionalSpritePlacement,directionalSprite} from '../src/battle/infantryDirectionalSprites.js';
import {infantryRigSprites,infantryRigSources} from '../src/battle/infantryRigSprites.js';
import {infantryHeadingPresentation} from '../src/battle/infantryHeading.js';
import {directionalInfantryPose} from '../src/battle/infantryFacing.js';
import {getUnitIdentity} from '../src/battle/unitIdentity.js';import {BATTLE_DEFINITIONS} from '../src/battle/battleDefinitions.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {depthMotionOffset} from '../src/battle/infantryDepthMotion.js';
import {torsoMeshGeometry,torsoMotionOffset,torsoMotionWeights} from '../src/battle/infantryTorsoMotion.js';

const grenadierSprite=(view,pose)=>directionalSprite(5,view,pose);
const grenadierProfileReady=has=>specialInfantryProfileReady(5,has);
assert.equal(GRENADIER_SOURCES.length,3);assert.equal(GRENADIER_SPRITES.length,25);assert.ok(GRENADIER_TORSO);
const all=[...GRENADIER_SPRITES,GRENADIER_TORSO];
for(const source of GRENADIER_SOURCES){
 const png=fs.readFileSync(new URL('../public'+source.path,import.meta.url));assert.equal(crypto.createHash('sha256').update(png).digest('hex'),source.sha256);
 const {width,height,rgba}=decodeRGBPNG(png);assert.equal(width,source.width);assert.equal(height,source.height);keyMagentaPixels(rgba);
 const covered=new Uint8Array(width*height);
 for(const s of all.filter(s=>s.key===source.key)){
  const f=s.frame,p=s.padding,w=f.width+p*2,h=f.height+p*2,cut=new Uint8ClampedArray(w*h*4);
  for(let y=0;y<f.height;y++)for(let x=0;x<f.width;x++){const i=((f.y+y)*width+f.x+x)*4;cut.set(rgba.subarray(i,i+4),((y+p)*w+x+p)*4);}
  retainSpriteIslands(cut,w,h,spriteIslandSeeds(s));let count=0,red=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4;if(!cut[i+3])continue;count++;
   assert.ok(x>p&&x<w-p-1&&y>p&&y<h-p-1,'no clipped figure or weapon at frame edge');
   const si=(f.y+y-p)*width+f.x+x-p;assert.equal(covered[si],0,'no neighbor fragments shared');covered[si]=1;
   assert.deepEqual(cut.slice(i,i+4),rgba.slice(si*4,si*4+4),'owned source pixels unchanged');
   if(cut[i]>cut[i+1]*1.4&&cut[i]>cut[i+2]*1.4&&cut[i+3]>32)red++;
  }
  assert.equal(count,s.foreground);assert.ok(count>30000,'whole readable subject');assert.ok(red>1500,`${s.runtimeKey} retains its scarlet uniform`);
 }
 // All ten depth/diagonal actions and all six side subjects are accepted.
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(rgba[(y*width+x)*4+3])assert.equal(covered[y*width+x],1,'all accepted source pixels accounted for');
}
assert.equal(grenadierProfileReady(()=>true),true);
const required=[...all.map(s=>s.runtimeKey),...['thigh','calf','foot'].map(p=>'revolution-infantry-rig-'+p)];
for(const missing of required){assert.equal(grenadierProfileReady(k=>k!==missing),false);assert.equal(resolveInfantryProfile(5,k=>k!==missing),1,'whole-profile fallback for every missing component');}
for(const p of [0,1,2,3])assert.equal(resolveInfantryProfile(p,()=>false),p);
assert.equal(resolveInfantryProfile(5,()=>true),5);assert.equal(infantryRigSprites(5).torso,GRENADIER_TORSO);
// The new torso carries its rifle on the right of the source, so the old
// torso's right-edge sleeve mask must not bend this barrel or gripping hand.
const tg=torsoMeshGeometry(GRENADIER_TORSO);
for(let phase=0;phase<Math.PI*2;phase+=.08){
 for(const [u,v] of [[.86,.15],[.86,.65],[.86,.9],[.53,.25]]){const o=torsoMotionOffset(torsoMotionWeights(u,v,'right-weapon'),phase);assert.ok(o.x===0&&o.y===0,'face, barrel and grip stay fixed');}
 const points=tg.samples.map(p=>{const o=torsoMotionOffset(p.weights,phase);return{x:p.x+o.x/GRENADIER_TORSO.scaleX,y:p.y+o.y/GRENADIER_TORSO.scaleY};});
 for(let i=0;i<points.length;i+=3){const [a,b,c]=points.slice(i,i+3);assert.ok((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)>0,'no folded torso triangle');}
}
assert.ok(torsoMotionOffset(torsoMotionWeights(.5,.9,'right-weapon'),Math.PI/2).x>.4,'free sleeve still moves');
assert.equal(directionalSources([5]).length,3);assert.equal(infantryRigSources([5]).length,2);
for(const heading of ['e','se','s','sw','w','nw','n','ne']){
 const {view,flipX}=infantryHeadingPresentation(heading);
 for(const pose of ['carry','fire','reload','guard','thrust','march0','march1']){
  assert.ok(grenadierSprite(view,pose));const a=directionalSpritePlacement(5,view,pose,36,flipX),b=directionalSpritePlacement(5,view,pose,36,!flipX);
  assert.ok(a.key.startsWith('grenadier-'));assert.ok(Math.abs(a.originX+b.originX-1)<1e-9);assert.equal(a.scale,b.scale);
 }
}
const users=Object.entries(BATTLE_DEFINITIONS).flatMap(([battle,b])=>b.formations.filter(u=>getUnitIdentity(battle,u).infantryProfile===5).map(u=>battle+':'+u.id));
assert.deepEqual(users,['monmouth:grenadiers-monmouth']);assert.equal(getUnitIdentity('cowpens','morgan-riflemen').infantryProfile,3);
const engine=new TrentonEngine(17761226,'monmouth'),seen=new Set();
for(let i=0;i<1600&&engine.outcome==='undecided';i++){
 engine.tick(.05);const before=JSON.stringify(engine.snapshot()),u=engine.formations.find(u=>u.id==='grenadiers-monmouth');
 const pose=directionalInfantryPose(u,engine.time,engine.time,0,0,true);if(pose){assert.ok(grenadierSprite('side',pose));seen.add(pose.startsWith('march')?'march':pose);}
 assert.equal(JSON.stringify(engine.snapshot()),before,'art cannot alter weapon timing or casualties');
}
assert.ok(seen.has('march')&&seen.has('reload'),'real Monmouth movement and muzzle reload must both resolve');
console.log(`Grenadier profile passed: 25 isolated scarlet action cutouts, matching torso, eight directions, all missing-component fallbacks and real Monmouth states ${[...seen].join(', ')}.`);

assert.deepEqual(SPECIAL_INFANTRY_IDS,[4,5]);
assert.deepEqual(infantryProfileLoadSet(5),[5,1]);assert.deepEqual(infantryProfileLoadSet(4),[4,3]);
for(const p of [0,1,2,3])assert.deepEqual(infantryProfileLoadSet(p),[p]);
assert.equal(getUnitIdentity('monmouth','guards-monmouth').infantryProfile,1);
assert.equal(getUnitIdentity('brandywine','ferguson').infantryProfile,4);

// The corrected rear-diagonal drawing has the loose hand on the left and
// musket on the right. Its localized sleeve mask must follow that artwork.
assert.equal(grenadierSprite('rearDiagonal','carry').motionLayout,'rear-left-arm');
for(let phase=0;phase<Math.PI*2;phase+=.08){
 for(const [x,y] of [[0,-33],[4,-32],[4,-23],[4,-14]]){
  const o=depthMotionOffset(x,y,phase,'rearDiagonal','rear-left-arm');assert.ok(o.x===0&&o.y===0,'rear-diagonal face and musket stay fixed');
 }
}
assert.ok(Math.abs(depthMotionOffset(-5,-20,Math.PI/2,'rearDiagonal','rear-left-arm').x)>.3,'correct free sleeve moves');
