import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {GERMAN_TRICORN_SPRITES,germanTricornSprite,germanSpritePlacement} from '../src/battle/germanTricornSprites.js';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const state of ['carry','fire']){
  const sprite=germanTricornSprite(state),file=path.join(root,'public',sprite.path.replace('/images/','images/'));
  const png=fs.readFileSync(file);
  assert.equal(png.subarray(1,4).toString('ascii'),'PNG');assert.equal(png.readUInt32BE(16),sprite.width);assert.equal(png.readUInt32BE(20),sprite.height);assert.equal(png[25],6,`${state} must be RGBA`);
  assert.equal(crypto.createHash('sha256').update(png).digest('hex'),sprite.sha256);
  assert.equal(sprite.bodyHeight,sprite.bootLineY-sprite.bodyTopY+1);
  assert.equal(sprite.origin.x,sprite.bootAnchor.x/sprite.width);assert.equal(sprite.origin.y,sprite.bootAnchor.y/sprite.height);
  assert.ok(Math.abs(sprite.bodyHeight*sprite.scaleToCommonBody-GERMAN_TRICORN_SPRITES.commonBodyHeight)<1e-9);
}
assert.throws(()=>germanTricornSprite('reload'),/Unknown German tricorn sprite state/);
assert.equal(fs.readdirSync(path.join(root,'public','images','units')).some(name=>name.includes('attempt')||name.includes('rejected')),false);
console.log('German tricorn sprites passed: two RGBA whole textures, hashes, body-height normalization, and boot anchors.');

for(const state of ['carry','fire']) {
 const meta=germanTricornSprite(state),p=germanSpritePlacement(state,35,0),q=germanSpritePlacement(state,35,Math.PI),f=meta.frame;
 assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=meta.width&&f.y+f.height<=meta.height);
 assert.ok(Math.abs(p.scale*meta.bodyHeight-35)<1e-9);
 assert.equal(p.originX+q.originX,1,'mirrored feet stay anchored');
 assert.equal(p.originY*f.height+f.y,meta.bootAnchor.y);
}
assert.throws(()=>germanTricornSprite('provenance'));
