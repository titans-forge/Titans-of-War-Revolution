import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {INFANTRY_RELOAD_SPRITES,infantryReloadSprite,reloadSpritePlacement} from '../src/battle/infantryReloadSprites.js';

const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'public/images/units/revolution-infantry-reload-v1.png');
const png=fs.readFileSync(file);
assert.equal(png.subarray(1,4).toString('ascii'),'PNG');
assert.equal(png.readUInt32BE(16),1254); assert.equal(png.readUInt32BE(20),1254);
assert.equal(png[25],6,'reload atlas must use RGBA PNG color type 6');
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),'2144e3d222f9ed412d459a30378e4ad5fd40522691faa6a0ff85fef64a247498');

const frames=[];
for(const profile of [0,1,2,3]) {
  const meta=infantryReloadSprite(profile),f=meta.frame,b=meta.alphaBounds;
  assert.equal(meta.bodyHeight,meta.bootLineY-meta.bodyTopY+1);
  assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=meta.width&&f.y+f.height<=meta.height);
  assert.ok(b.x>=f.x&&b.y>=f.y&&b.x+b.width<=f.x+f.width&&b.y+b.height<=f.y+f.height);
  for(const prior of frames)assert.ok(f.x+f.width<=prior.x||prior.x+prior.width<=f.x||f.y+f.height<=prior.y||prior.y+prior.height<=f.y,'frames must not overlap');
  frames.push(f);
  const right=reloadSpritePlacement(profile,39,0),left=reloadSpritePlacement(profile,39,Math.PI);
  assert.equal(right.key,meta.key); assert.equal(right.frame,`reload-${profile}`);
  assert.ok(Math.abs(right.scale*meta.bodyHeight-39)<1e-9);
  assert.ok(Math.abs(right.originX+left.originX-1)<1e-12,'mirroring must retain boot anchor');
  assert.equal(right.originY*f.height+f.y,meta.bootAnchor.y);
}
assert.equal(infantryReloadSprite(4),null); assert.equal(reloadSpritePlacement(4,39,0),null);
assert.equal(Object.keys(INFANTRY_RELOAD_SPRITES).filter(key=>/^\d+$/.test(key)).length,4);
console.log('Infantry reload atlas passed: RGBA/hash, four disjoint measured frames, body scaling, and mirrored boot anchors.');

for(const bad of ['provenance','toString',null,NaN])assert.equal(infantryReloadSprite(bad),null);
for(const bad of [0,-1,Infinity,NaN])assert.equal(reloadSpritePlacement(0,bad,0),null);
assert.equal(reloadSpritePlacement(0,39,NaN),null);
