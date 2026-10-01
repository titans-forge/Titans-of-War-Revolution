import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {decodeRGBPNG} from './png-pixels.mjs';
import {keyMagentaPixels} from '../src/battle/spriteChroma.js';
import {INFANTRY_RIG_SPRITES,INFANTRY_UNIFORM_PARTS,infantryRigSprites,infantryRigTextures,infantryRigSources,rigPartPlacement} from '../src/battle/infantryRigSprites.js';
import {BATTLE_DEFINITIONS} from '../src/battle/battleDefinitions.js';
import {getUnitIdentity} from '../src/battle/unitIdentity.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {infantryStrideRig} from '../src/battle/infantryStrideRig.js';
const png=fs.readFileSync(new URL('../public/images/units/revolution-infantry-uniform-rig-v1.png',import.meta.url));
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),'f1fee032e69ab1d59c3f80e7291491b99329e36be50d1c269f5fd7911d3cfcdb');
const {width,height,rgba}=decodeRGBPNG(png);assert.equal(width,1448);assert.equal(height,1086);keyMagentaPixels(rgba);
const covered=new Set(),frames=[];
for(const s of Object.values(INFANTRY_UNIFORM_PARTS)) {
 const f=s.frame;assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=width&&f.y+f.height<=height);
 for(const other of frames)assert.ok(f.x+f.width<=other.x||other.x+other.width<=f.x||f.y+f.height<=other.y||other.y+other.height<=f.y);
 frames.push(f);let count=0;
 for(let y=f.y;y<f.y+f.height;y++)for(let x=f.x;x<f.x+f.width;x++) {
  const index=y*width+x,alpha=rgba[index*4+3];
  if(x===f.x||y===f.y||x===f.x+f.width-1||y===f.y+f.height-1)assert.equal(alpha,0,'complete silhouette and clear source gutters');
  if(alpha>32){covered.add(index);count++;}
 }
 assert.ok(count>(s.part==='torso'?120000:40000),'actual complete part survives chroma keying');
 assert.ok(rgba[(s.pivot.y*width+s.pivot.x)*4+3]>32,'joint lies inside authored cloth or leather');
}
for(let i=0;i<width*height;i++)if(rgba[i*4+3]>32)assert.ok(covered.has(i),'no omitted weapon tip, fringe or disconnected material');
assert.equal(infantryRigTextures().length,12,'shared regular-infantry legs do not duplicate GPU textures');
assert.equal(infantryRigSources([1,1,2,3]).length,2,'source atlases load once');
assert.equal(infantryRigSources([3]).length,1,'brown-clad rig needs only its own atlas');
assert.deepEqual(infantryRigSources([]),[]);
assert.equal(infantryRigSprites(0),INFANTRY_RIG_SPRITES,'Continental registration unchanged');
for(const profile of [1,2])for(const part of ['thigh','calf','foot'])assert.equal(infantryRigSprites(profile)[part],INFANTRY_RIG_SPRITES[part]);
for(const part of ['torso','thigh','calf','foot'])assert.notEqual(infantryRigSprites(3)[part],INFANTRY_RIG_SPRITES[part],'brown uniform has matching authored parts');
for(const profile of [-1,6,NaN,'1']){assert.equal(infantryRigSprites(profile),null);assert.equal(rigPartPlacement('torso',1,1,null,profile),null);}
let formations=0;
for(const [battleId,battle] of Object.entries(BATTLE_DEFINITIONS)) {
 const infantry=battle.formations.filter(u=>u.type==='infantry'),profiles=infantry.map(u=>getUnitIdentity(battleId,u).infantryProfile);
 const sources=new Set(infantryRigSources(profiles).map(s=>s.key));
 for(const u of infantry) {
  const profile=getUnitIdentity(battleId,u).infantryProfile,rig=infantryRigSprites(profile);assert.ok(rig);formations++;
  for(const [part,s] of Object.entries(rig)) {
   assert.ok(sources.has(s.key),'every formation has all necessary preload sources');
   for(const scale of [.75,1,1.4]) {
    const a=rigPartPlacement(part,scale,1,8*scale,profile),b=rigPartPlacement(part,scale,-1,8*scale,profile);
    assert.ok(Math.abs(a.originX+b.originX-1)<1e-10);
    assert.ok(Math.abs(a.originY*(s.frame.height+4)+s.frame.y-2-s.pivot.y)<1e-8);
    assert.equal(a.scaleX,b.scaleX);assert.equal(a.scaleY,b.scaleY);
   }
  }
 }
}
// Real enemy movement exercises British and German rigs; player movement covers
// the brown-clad profile. Rendering calls must not alter snapshots or combat.
const seen=new Set();
for(const battleId of ['trenton','bunker_hill']) {
 const engine=new TrentonEngine(17,battleId);
 for(const u of engine.formations)if(u.side==='continental'&&u.type==='infantry')engine.order(u.id,'advance');
 for(let i=0;i<800&&seen.size<4;i++) {
  engine.tick(.05);const before=JSON.stringify(engine.snapshot());
  for(const u of engine.formations)if(u.type==='infantry') {
   const pose=infantryStrideRig(u,engine.time),profile=getUnitIdentity(battleId,u).infantryProfile;
   if(pose){assert.ok(infantryRigSprites(profile));seen.add(profile);}
  }
  assert.equal(JSON.stringify(engine.snapshot()),before);
 }
}
assert.deepEqual([...seen].sort(),[0,1,2,3]);
console.log(`Infantry uniform rigs passed: six complete keyed parts, shared textures, mirrored joints, ${formations} infantry formations in seven battles and real movement for all four profiles.`);
