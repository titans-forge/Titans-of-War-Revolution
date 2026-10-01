import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {decodeRGBPNG} from './png-pixels.mjs';
import {keyMagentaPixels} from '../src/battle/spriteChroma.js';
import {CAVALRY_CONTACT_SPRITES,ARTILLERY_HAUL_SPRITES,cavalryContactPlacement,artilleryHaulPlacement} from '../src/battle/supportActionSprites.js';
import {cavalryContactCycle,artilleryHaulFrame} from '../src/battle/supportActionMotion.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {travelPhase} from '../src/battle/figureMotion.js';
for(const [sprites,hash,minimum] of [[CAVALRY_CONTACT_SPRITES.flat(),'29795dde7fff920fe87dcb07e637f7db861337e8518898ea537e8fa7dbee7ffa',90000],[ARTILLERY_HAUL_SPRITES,'a43147e468657ec54f137a9fa097a131b3df6fb08f091bc612f59f8dde6ec457',250000]]) {
 const png=fs.readFileSync(new URL('../public'+sprites[0].path,import.meta.url));assert.equal(crypto.createHash('sha256').update(png).digest('hex'),hash);
 const {width,height,rgba}=decodeRGBPNG(png);assert.equal(width,1536);assert.equal(height,1024);keyMagentaPixels(rgba);const covered=new Set(),frames=[];
 for(const s of sprites){const f=s.frame;assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=width&&f.y+f.height<=height);for(const o of frames)assert.ok(f.x+f.width<=o.x||o.x+o.width<=f.x||f.y+f.height<=o.y||o.y+o.height<=f.y);frames.push(f);let count=0;
  for(let y=f.y;y<f.y+f.height;y++)for(let x=f.x;x<f.x+f.width;x++){const i=y*width+x,a=rgba[i*4+3];if(x===f.x||y===f.y||x===f.x+f.width-1||y===f.y+f.height-1)assert.equal(a,0);if(a>32){covered.add(i);count++;}}
  assert.ok(count>minimum,'complete keyed subjects');
 }
 for(let i=0;i<width*height;i++)if(rgba[i*4+3]>32)assert.ok(covered.has(i),'no discarded saber, hoof, wheel or crew');
}
for(const profile of [0,2])for(const frame of [0,1]){const a=cavalryContactPlacement(profile,frame,45,0),b=cavalryContactPlacement(profile,frame,45,Math.PI);assert.ok(Math.abs(a.originX+b.originX-1)<1e-10);assert.equal(a.scale,45/480);}
for(const frame of [0,1]){const a=artilleryHaulPlacement(frame,0),b=artilleryHaulPlacement(frame,Math.PI),s=ARTILLERY_HAUL_SPRITES[frame];assert.ok(Math.abs(a.originX+b.originX-1)<1e-10);assert.ok(Math.abs((1348-s.anchor.x)*a.scale-31.84)<.1,'moving muzzle agrees with existing 64px gun');}
const rider=Object.freeze({active:true,type:'cavalry',status:'steady',engaged:true,moving:false,order:'attack'});
const stages=new Set();for(let t=0;t<5;t+=.01){const p=cavalryContactCycle(rider,t,1.7,0,true);stages.add(p.stage);assert.equal(cavalryContactCycle(rider,t,1.7,0,false).frame,0,'rear ranks stay guarded');}
for(const stage of ['guard','prepare','cut','recover'])assert.ok(stages.has(stage));
for(const patch of [{active:false},{moving:true},{engaged:false},{status:'routed'},{order:'fallback'},{order:'withdraw'},{type:'infantry'}])assert.equal(cavalryContactCycle({...rider,...patch},3,0,0,true),null);
const gun=Object.freeze({active:true,type:'artillery',status:'steady',moving:true,engaged:false,order:'advance',strength:120,initialStrength:120});
assert.equal(artilleryHaulFrame(gun,.2),0);assert.equal(artilleryHaulFrame(gun,Math.PI+.2),1);
for(const patch of [{active:false},{moving:false},{engaged:true},{status:'routed'},{order:'fallback'},{strength:59},{type:'infantry'}])assert.equal(artilleryHaulFrame({...gun,...patch},1),null);
assert.notEqual(artilleryHaulFrame({...gun,strength:60},1),null,'three represented crew can haul');
const battle=new TrentonEngine(17810117,'cowpens');while(battle.time<23.1)battle.tick(.05);
battle.attack('washington-cavalry','legion-dragoons');const mounted=battle.formations.find(u=>u.id==='washington-cavalry');let since=null,cut=false;
for(let i=0;i<1000&&!cut;i++){battle.tick(.05);if(mounted.engaged&&!mounted.moving){since??=battle.time;const before=JSON.stringify(battle.snapshot());const action=cavalryContactCycle(mounted,battle.time,0,since,true);cut=action?.stage==='cut';assert.equal(JSON.stringify(battle.snapshot()),before);}}
assert.ok(cut,'real reserve attack reaches mounted cut pose');const frozen=cavalryContactCycle(mounted,battle.time,0,since,true);battle.tick(0);assert.deepEqual(cavalryContactCycle(mounted,battle.time,0,since,true),frozen);
const trenton=new TrentonEngine(17,'trenton'),battery=trenton.formations.find(u=>u.id==='knox');trenton.attack(battery.id,'rall');let phase=0,seen=new Set();
for(let i=0;i<70;i++){const prev={x:battery.x,y:battery.y};trenton.tick(.05);phase=travelPhase(prev,battery,phase);const before=JSON.stringify(trenton.snapshot());seen.add(artilleryHaulFrame(battery,phase));assert.equal(JSON.stringify(trenton.snapshot()),before);assert.equal(battery.volleySerial,0,'moving battery still cannot fire');}
assert.ok(seen.has(0)&&seen.has(1));trenton.order(battery.id,'hold');trenton.tick(.05);assert.equal(artilleryHaulFrame(battery,phase),null);
console.log('Support actions passed: complete assets, mirrored anchors, consistent gun scale, front-rank cuts, real mounted contact/pause, actual hauling, halt, depleted crew and firing discipline.');
