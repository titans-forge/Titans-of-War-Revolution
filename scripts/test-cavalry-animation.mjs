import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {decodeRGBPNG} from './png-pixels.mjs';
import {keyMagentaPixels} from '../src/battle/spriteChroma.js';
import {CAVALRY_TROT_SPRITES,cavalrySpritePlacement} from '../src/battle/cavalrySprites.js';
import {cavalryMotionFrame} from '../src/battle/cavalryMotion.js';
import {travelPhase} from '../src/battle/figureMotion.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';

const png=fs.readFileSync(new URL('../public/images/units/revolution-cavalry-trot-v1.png',import.meta.url));
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),CAVALRY_TROT_SPRITES[0][0].sha256);
const {width,height,rgba}=decodeRGBPNG(png);assert.equal(width,1774);assert.equal(height,887);keyMagentaPixels(rgba);
const covered=new Set(),frames=[];
for(const s of CAVALRY_TROT_SPRITES.flat()) {
 const f=s.frame;assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=width&&f.y+f.height<=height);
 for(const other of frames)assert.ok(f.x+f.width<=other.x||other.x+other.width<=f.x||f.y+f.height<=other.y||other.y+other.height<=f.y);
 frames.push(f);let count=0;
 for(let y=f.y;y<f.y+f.height;y++)for(let x=f.x;x<f.x+f.width;x++) {
  const key=y*width+x,alpha=rgba[key*4+3];
  if(x===f.x||y===f.y||x===f.x+f.width-1||y===f.y+f.height-1)assert.equal(alpha,0,'all edges have clean gutters');
  if(alpha>32){covered.add(key);count++;}
 }
 assert.ok(count>59000&&count<68000,'complete rider, horse and weapon survive keying');
 for(const facing of [0,Math.PI]) {
  const p=cavalrySpritePlacement(s.profile,s.frameIndex,45,facing),q=cavalrySpritePlacement(s.profile,s.frameIndex,45,facing+Math.PI);
  assert.equal(p.key,s.runtimeKey);assert.ok(Math.abs(p.scale*s.bodyHeight-45)<1e-10);
  assert.ok(Math.abs(p.originX+q.originX-1)<1e-10);
  assert.ok(Math.abs(p.originY*(f.height+4)+f.y-2-s.groundAnchor.y)<1e-8);
 }
}
for(let i=0;i<width*height;i++)if(rgba[i*4+3]>32)assert.ok(covered.has(i),'no disconnected saber, tail, hoof or background outside the measured frames');
const u=Object.freeze({active:true,status:'steady',moving:true,order:'advance'});
for(let n=0;n<4;n++)assert.equal(cavalryMotionFrame(u,n*Math.PI/2+.1),n);
assert.equal(cavalryMotionFrame(u,.2),cavalryMotionFrame(u,Math.PI*2+.2));
assert.equal(cavalryMotionFrame(u,-.1),3);
assert.equal(cavalryMotionFrame(u,NaN,NaN),0);
for(const variant of [{moving:false},{active:false},{status:'withdrawn'},{order:'fallback'}])assert.equal(cavalryMotionFrame({...u,...variant},2),null);
assert.equal(cavalryMotionFrame({...u,status:'routed',order:'withdraw'},2),1,'routing continues distance-driven motion');
for(const args of [[1,0,45,0],[0,4,45,0],[0,0,0,0],[0,0,45,NaN]])assert.equal(cavalrySpritePlacement(...args),null);

// Observe the real reserve arrival and a legal movement order. Animation must
// neither advance during pause nor mutate simulation state or determine damage.
const battle=new TrentonEngine(17810117,'cowpens');
for(let i=0;i<465;i++)battle.tick(.05);
const rider=battle.formations.find(x=>x.id==='washington-cavalry');assert.ok(rider.active);
battle.move(rider.id,{x:rider.x+120,y:rider.y});let phase=0,seen=new Set();
for(let i=0;i<100;i++) {
 const previous={x:rider.x,y:rider.y};battle.tick(.05);phase=travelPhase(previous,rider,phase);
 const before=JSON.stringify(battle.snapshot());seen.add(cavalryMotionFrame(rider,phase));assert.equal(JSON.stringify(battle.snapshot()),before);
}
assert.ok([0,1,2,3].every(f=>seen.has(f)),'real movement traverses all four authored poses');
const previous={x:rider.x,y:rider.y},before=cavalryMotionFrame(rider,phase);battle.tick(0);
assert.equal(travelPhase(previous,rider,phase),phase);assert.equal(cavalryMotionFrame(rider,phase),before);
battle.order(rider.id,'hold');battle.tick(.05);assert.equal(cavalryMotionFrame(rider,phase),null,'halt restores planted stance');
console.log('Cavalry animation passed: eight complete keyed subjects, clean gutters, mirrored anchors, real reserve movement, halt, fallback, routing, pause and state purity.');
