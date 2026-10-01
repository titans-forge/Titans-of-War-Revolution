import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {decodeRGBPNG} from './png-pixels.mjs';
import {keyMagentaPixels} from '../src/battle/spriteChroma.js';
import {INFANTRY_RIG_SPRITES,rigPartPlacement} from '../src/battle/infantryRigSprites.js';
const png=fs.readFileSync(new URL('../public/images/units/revolution-infantry-rig-parts-v1.png',import.meta.url));
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),'40951ad4979de7d7e107eecb57af7750e60a9e6135668a0f4e7fb52066cb60a0');
const {width,height,rgba}=decodeRGBPNG(png);assert.equal(width,1254);assert.equal(height,1254);keyMagentaPixels(rgba);
for(const [part,s] of Object.entries(INFANTRY_RIG_SPRITES)) {
 const f=s.frame;assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=width&&f.y+f.height<=height);
 let count=0;
 for(let y=f.y;y<f.y+f.height;y++)for(let x=f.x;x<f.x+f.width;x++) {
  const alpha=rgba[(y*width+x)*4+3];if(alpha>32)count++;
  // Calf and foot are cut at their overlapping cloth joints on purpose.
  if(x===f.x||x===f.x+f.width-1||(['torso','thigh'].includes(part)&&(y===f.y||y===f.y+f.height-1)))assert.equal(alpha,0,'safe outside silhouette edges');
 }
 assert.ok(count>25000,'painted part survives runtime transparency');
 const a=rigPartPlacement(part,1,1,8),b=rigPartPlacement(part,1,-1,8);
 assert.ok(Math.abs(a.originX+b.originX-1)<1e-10);
 assert.ok(Math.abs(a.originY*(f.height+4)+f.y-2-s.pivot.y)<1e-10,'measured joint is the actual texture origin');
 assert.ok(a.scaleX>0&&a.scaleY>0);
}
assert.equal(rigPartPlacement('missing'),null);assert.equal(rigPartPlacement('thigh'),null);
console.log('Infantry rig artwork passed: source hash, real keyed pixels, silhouette gutters, intentional joint crops and mirrored joint registration.');
