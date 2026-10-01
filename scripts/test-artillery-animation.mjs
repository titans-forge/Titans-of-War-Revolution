import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {decodeRGBPNG} from './png-pixels.mjs';
import {keyMagentaPixels} from '../src/battle/spriteChroma.js';
import {ARTILLERY_ACTION_SPRITES,artillerySpritePlacement} from '../src/battle/artillerySprites.js';
import {artilleryCrewAction,artilleryCrewStation} from '../src/battle/artilleryAnimation.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';

const png=fs.readFileSync(new URL('../public/images/units/revolution-artillery-actions-v1.png',import.meta.url));
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),ARTILLERY_ACTION_SPRITES[0].sha256);
const {width,height,rgba}=decodeRGBPNG(png);assert.equal(width,1536);assert.equal(height,1024);keyMagentaPixels(rgba);
const covered=new Set(),frames=[];
for(const s of ARTILLERY_ACTION_SPRITES) {
 const f=s.frame;assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=width&&f.y+f.height<=height);
 for(const other of frames)assert.ok(f.x+f.width<=other.x||other.x+other.width<=f.x||f.y+f.height<=other.y||other.y+other.height<=f.y);
 frames.push(f);let count=0;
 for(let y=f.y;y<f.y+f.height;y++)for(let x=f.x;x<f.x+f.width;x++) {
  const key=y*width+x,alpha=rgba[key*4+3];
  if(x===f.x||y===f.y||x===f.x+f.width-1||y===f.y+f.height-1)assert.equal(alpha,0,'safe transparent frame edges');
  if(alpha>32){covered.add(key);count++;}
 }
 assert.ok(count>58000&&count<71000,'complete body and tool survives the actual keyer');
 const p=artillerySpritePlacement(s.frameIndex,34,0),q=artillerySpritePlacement(s.frameIndex,34,Math.PI);
 assert.ok(Math.abs(p.originX+q.originX-1)<1e-10);assert.ok(Math.abs(p.originY*(f.height+4)+f.y-2-s.groundAnchor.y)<1e-8);
 assert.ok(Math.abs(p.scale*s.bodyHeight-34)<1e-10);
}
for(let i=0;i<width*height;i++)if(rgba[i*4+3]>32)assert.ok(covered.has(i),'no missing disconnected tool tip or visible background');
assert.equal(ARTILLERY_ACTION_SPRITES[0].bodyHeight,ARTILLERY_ACTION_SPRITES[1].bodyHeight,'leaning must not enlarge the man');

// Check working tool registration against the measured 64px gun: muzzle at
// (31.84,-13.3), vent approximately (-10,-9.8). Both left and right views.
for(const [index,frame,target] of [[0,1,{x:31.84,y:-13.3}],[2,2,{x:31.84,y:-13.3}],[1,3,{x:-10,y:-9.8}]]) {
 const sprite=ARTILLERY_ACTION_SPRITES[frame];
 for(const direction of [1,-1]) {
  const facing=direction===1?0:Math.PI,station=artilleryCrewStation(index,facing),scale=34/sprite.bodyHeight;
  const toolDirection=Math.cos(station.facing)>=0?1:-1;
  const tip={x:station.x+toolDirection*(sprite.toolTip.x-sprite.groundAnchor.x)*scale,y:station.y+(sprite.toolTip.y-sprite.groundAnchor.y)*scale};
  assert.ok(Math.hypot(tip.x-target.x*direction,tip.y-target.y)<2,'working tool meets its correct gun end');
 }
}
for(let i=0;i<5;i++) {
 const a=artilleryCrewStation(i,0),b=artilleryCrewStation(i,Math.PI);assert.equal(a.x,-b.x);assert.equal(a.y,b.y);
 assert.equal(artilleryCrewStation(i,0,true).facing,0,'moving crew turn with the battery');
}
for(const index of [-1,5,NaN])assert.equal(artilleryCrewStation(index,0),null);
const unit=Object.freeze({type:'artillery',active:true,status:'steady',moving:false,engaged:false,order:'hold',volleySerial:1,reload:2.4,ammunition:5});
assert.equal(artilleryCrewAction(unit,0).stage,'sponge');
assert.equal(artilleryCrewAction({...unit,reload:1.9},2).stage,'serve');
assert.equal(artilleryCrewAction({...unit,reload:1},0).stage,'ram');
assert.equal(artilleryCrewAction({...unit,reload:3.2},1).stage,'fire');
for(const changes of [{moving:true},{engaged:true},{active:false},{status:'routed'},{order:'withdraw'},{order:'fallback'},{order:'reform'},{volleySerial:0},{reload:0},{reload:NaN},{reload:4},{ammunition:0}])for(let i=0;i<5;i++)assert.equal(artilleryCrewAction({...unit,...changes},i),null);
assert.equal(artilleryCrewAction({...unit,reload:3.1,ammunition:0},1).stage,'fire','last actual round still receives a firing pose');

const battle=new TrentonEngine(17761226,'trenton');battle.attack('knox','rall');battle.attack('mercer','rall');battle.attack('sullivan','lossberg');
const gun=battle.formations.find(u=>u.id==='knox');let stages=new Set(),firstShot=null;
for(let i=0;i<1800&&stages.size<5;i++) {
 battle.tick(.05);if(gun.volleySerial>0)firstShot??=battle.time;
 const before=JSON.stringify(battle.snapshot());
 for(let j=0;j<5;j++){const action=artilleryCrewAction(gun,j);if(action)stages.add(action.stage);}
 assert.equal(JSON.stringify(battle.snapshot()),before,'animation never changes ammunition, timing or damage');
}
assert.ok(firstShot!==null,'real attack produces artillery fire');
for(const stage of ['fire','prepare','sponge','serve','ram'])assert.ok(stages.has(stage),'real battery reaches '+stage);
const actions=Array.from({length:5},(_,i)=>artilleryCrewAction(gun,i));battle.tick(0);assert.deepEqual(Array.from({length:5},(_,i)=>artilleryCrewAction(gun,i)),actions);
console.log('Artillery action passed: complete keyed figures, tool-to-gun registration, mirrored stations, actual firing/reload stages, interruption, empty-ammo behavior, pause and state purity.');
