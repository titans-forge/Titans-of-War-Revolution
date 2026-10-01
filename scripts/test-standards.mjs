import assert from 'node:assert/strict';
import { standardDesign, clothSample } from '../src/battle/standards.js';
assert.equal(standardDesign('bunker_hill',{side:'continental'}),'provincial');
for(const battle of ['long_island','trenton']) assert.equal(standardDesign(battle,{side:'continental'}),'grand-union');
for(const battle of ['brandywine','saratoga','monmouth','cowpens']) assert.equal(standardDesign(battle,{side:'continental'}),'thirteen-stars');
assert.equal(standardDesign('long_island',{side:'crown',name:"Heister's Hessian Column"}),'hessian-marker');
assert.equal(standardDesign('cowpens',{side:'crown',name:'British Legion Dragoons'}),'british-union');
for(let time=0;time<300;time+=.37) {
  assert.equal(Math.abs(clothSample(0,time,1).y),0,'Hoist stays on pole');
  for(let i=0;i<28;i++) {
    const s=clothSample(i/27,time,1);
    assert.ok(Math.abs(s.y)<=2.3 && s.height>=.87 && s.height<=1);
    assert.ok(s.shade>=199 && s.shade<=249);
  }
}
assert.deepEqual(clothSample(1,10,2),clothSample(1,10,2),'Paused time retains folds');
assert.notDeepEqual(clothSample(1,10,2),clothSample(1,11,2),'Free edge moves with time');
console.log('Standards passed: era mapping, fixed hoist, bounded cloth geometry, pause stability.');
