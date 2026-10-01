import assert from 'node:assert/strict';import fs from 'node:fs';
import {decodeRGBPNG} from './png-pixels.mjs';import{keyMagentaPixels}from'../src/battle/spriteChroma.js';
import{ARTILLERY_MARCH_SPRITES,artilleryMarchReady,artilleryMarchFrame,artilleryMarchPlacement}from'../src/battle/artilleryMarchSprites.js';
import{artilleryDeploymentStation}from'../src/battle/artilleryDeployment.js';import{artilleryCrewStation}from'../src/battle/artilleryAnimation.js';
import{TrentonEngine}from'../src/battle/trentonEngine.js';import{travelPhase}from'../src/battle/figureMotion.js';
const textures=new Map();
for(const row of ARTILLERY_MARCH_SPRITES)for(const s of row){
 if(!textures.has(s.key)){const im=decodeRGBPNG(fs.readFileSync(new URL('../public'+s.path,import.meta.url)));keyMagentaPixels(im.rgba);textures.set(s.key,im);}
 const {width,height,rgba}=textures.get(s.key),f=s.frame;assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=width&&f.y+f.height<=height);let count=0;
 for(let y=f.y;y<f.y+f.height;y++)for(let x=f.x;x<f.x+f.width;x++){const alpha=rgba[(y*width+x)*4+3];if(x===f.x||y===f.y||x===f.x+f.width-1||y===f.y+f.height-1)assert.equal(alpha,0,'transparent bounds preserve full boots and tools');if(alpha>32)count++;}
 assert.ok(count>25000);assert.ok(s.anchor.x>f.x&&s.anchor.x<f.x+f.width);assert.ok(s.anchor.y>f.y&&s.anchor.y<f.y+f.height);
}
for(let role=0;role<3;role++){
 const keys=new Set(ARTILLERY_MARCH_SPRITES[role].map(s=>s.runtimeKey));assert.ok(artilleryMarchReady(role,k=>keys.has(k)));
 for(const missing of keys)assert.equal(artilleryMarchReady(role,k=>keys.has(k)&&k!==missing),false);
 for(let pose=0;pose<4;pose++){const a=artilleryMarchPlacement(role,pose,0),b=artilleryMarchPlacement(role,pose,Math.PI);assert.ok(Math.abs(a.originX+b.originX-1)<1e-12);assert.equal(a.scale,b.scale);}
}
for(const role of [-1,3,NaN])assert.equal(artilleryMarchReady(role,()=>true),false);
const unit={active:true,type:'artillery',moving:true,status:'steady',order:'advance',facing:0,reload:0};
const poses=new Set();for(let p=-7;p<7;p+=.01)poses.add(artilleryMarchFrame(unit,p));assert.deepEqual([...poses].sort(),[0,1,2,3]);
for(const patch of [{moving:false},{active:false},{order:'fallback'},{status:'withdrawn'},{type:'infantry'}])assert.equal(artilleryMarchFrame({...unit,...patch},1),null);
assert.equal(artilleryMarchFrame(unit,NaN),null);
const halt={...unit,moving:false,order:'hold'};
for(const facing of [0,Math.PI])for(let i=0;i<3;i++){
 const u={...halt,facing},station=artilleryCrewStation(i,facing),start=artilleryDeploymentStation(u,i,station,3,3),late=artilleryDeploymentStation(u,i,station,3.69999,3);
 assert.ok(start&&late);assert.ok(Math.hypot(late.x-station.x,late.y-station.y)<1e-5);assert.equal(artilleryDeploymentStation(u,i,station,3.71,3),null);
 const frozen=artilleryDeploymentStation(u,i,station,3.2,3);assert.deepEqual(artilleryDeploymentStation(u,i,station,3.2,3),frozen);
 for(const patch of [{moving:true},{engaged:true},{reload:.1},{status:'routed'},{order:'fallback'},{order:'withdraw'}])assert.equal(artilleryDeploymentStation({...u,...patch},i,station,3.2,3),null);
}
const engine=new TrentonEngine(17,'trenton'),gun=engine.formations.find(u=>u.id==='knox');engine.attack('knox','rall');let phase=0;const realPoses=new Set();
for(let i=0;i<70;i++){const before={x:gun.x,y:gun.y};engine.tick(.05);phase=travelPhase(before,gun,phase);const snap=JSON.stringify(engine.snapshot());realPoses.add(artilleryMarchFrame(gun,phase));assert.equal(JSON.stringify(engine.snapshot()),snap);assert.equal(gun.volleySerial,0);}
assert.deepEqual([...realPoses].sort(),[0,1,2,3]);engine.order('knox','hold');engine.tick(.05);assert.equal(artilleryMarchFrame(gun,phase),null);
console.log('Artillery march passed: twelve complete cutouts, mirrored anchors, all missing-pose fallbacks, distance-driven four-pose cycle, guarded fallback, deployment/pause/fire cancellation and actual battery move/halt.');
