import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BATTLE_DEFINITIONS} from '../src/battle/battleDefinitions.js';
import {landmarksFor,landmarkAt,LANDMARK_NOTE} from '../src/battle/historicalLandmarks.js';
for(const id of Object.keys(BATTLE_DEFINITIONS)){
 const marks=landmarksFor(id);assert.ok(marks.length>=1&&marks.length<=2,`${id} landmark coverage`);
 assert.ok(fs.existsSync(`public/images/battles/${id.replace('_','-')}.webp`));
 for(const l of marks){
  assert.equal(landmarkAt(id,{x:l.x,y:l.y}),l);
  assert.ok(l.x-l.width/2>=0&&l.x+l.width/2<=1200&&l.y-l.height/2>=0&&l.y+l.height/2<=680);
  assert.equal(new URL(l.source).protocol,'https:');assert.ok(l.description.length>50);
 }
 assert.equal(landmarkAt(id,{x:-20,y:-20}),null);
}
assert.equal(landmarkAt('trenton',{x:NaN,y:0}),null);assert.deepEqual(landmarksFor('unknown'),[]);
assert.match(LANDMARK_NOTE,/not a survey map/);
assert.match(landmarksFor('cowpens')[0].description,/natural boundaries/);
assert.match(landmarksFor('long_island')[0].description,/reconstruction/);
console.log('Historical landmarks passed: all seven fields, bounded hover regions, sources, reconstruction and Cowpens qualifications.');
