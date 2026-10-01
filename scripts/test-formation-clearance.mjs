import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {STRUCTURE_FOOTPRINTS,expandedStructure} from '../src/battle/structureFootprints.js';
import {segmentClear,resolveDestination} from '../src/battle/terrainNavigation.js';
const profiles=[{type:'infantry',formationMode:'line'},{type:'infantry',formationMode:'column'},{type:'infantry',formationMode:'open'},{type:'cavalry',formationMode:'line'},{type:'artillery',formationMode:'battery'}];
let cases=0;
for(const [id,[house]] of Object.entries(STRUCTURE_FOOTPRINTS))for(const profile of profiles){
 const engine=new TrentonEngine(46,id);const u=engine.formations.find(x=>x.side==='continental');for(const x of engine.formations)x.active=x===u;
 Object.assign(u,profile,{fatigue:0});const bounds=expandedStructure(house,u),y=(house.y1+house.y2)/2;
 Object.assign(u,{x:bounds.x1-25,y,target:{x:bounds.x1-25,y},order:'hold'});
 engine.move(u.id,{x:bounds.x2+25,y});
 for(let i=0;i<4000&&Math.hypot(u.x-u.target.x,u.y-u.target.y)>.1;i++){
  const before={x:u.x,y:u.y};engine.advanceUnit(u,.05);
  assert.ok(segmentClear(id,before,u,u),'whole footprint clears each swept segment');
  assert.ok(Math.hypot(u.x-before.x,u.y-before.y)<=2.71,'no teleport');
 }
 assert.ok(Math.hypot(u.x-u.target.x,u.y-u.target.y)<.1,`${id}/${profile.type}/${profile.formationMode} arrives`);
 const destination=resolveDestination(id,{x:house.x2+1,y},u);
 assert.ok(segmentClear(id,destination,destination,u),'near-wall click projects the complete footprint clear');
 // Expanding into existing clearance can leave outward, but not deepen overlap.
 const overlapping={x:house.x2+1,y};
 assert.equal(segmentClear(id,overlapping,{x:overlapping.x-1,y},u),false);
 const exit=resolveDestination(id,overlapping,u),distance=Math.hypot(exit.x-overlapping.x,exit.y-overlapping.y);
 assert.equal(segmentClear(id,overlapping,{x:overlapping.x+(exit.x-overlapping.x)/distance,y:overlapping.y+(exit.y-overlapping.y)/distance},u),true);
 cases++;
}
// Formation changes discard narrow cached routes; fresh orders project wider ranks.
const e=new TrentonEngine(46,'trenton');const u=e.formations[0];e.navigation.set(u.id,{goal:{x:600,y:320},points:[{x:550,y:320}]});e.setFormation(u.id,'open');assert.equal(e.navigation.has(u.id),false);e.move(u.id,{x:510,y:272});assert.ok(segmentClear('trenton',u.target,u.target,u));
console.log(`Formation clearance passed: ${cases} map/profile combinations, swept bounds, destination projection, gradual overlap escape and changed-width replanning.`);
