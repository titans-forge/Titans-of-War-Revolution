import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
const run=(e,t,dt=.05)=>{for(let i=0;i<Math.round(t/dt);i++)e.tick(dt);};
function simulate(at,dt=.05,seed=17760827){const e=new TrentonEngine(seed,'long_island');run(e,at,dt);for(const u of e.formations.filter(u=>u.side==='continental'))e.order(u.id,'withdraw');run(e,130,dt);return e;}
const early=simulate(0);assert.equal(early.outcome,'defeat');assert.equal(early.objectiveStatus().evacuation.screenSeconds,0);
const success=simulate(30);assert.equal(success.outcome,'withdrawal');assert.ok(success.objectiveStatus().evacuation.saved>=1650);
assert.deepEqual(success.snapshot(),simulate(30,.2).snapshot(),'Evacuation is independent of frame subdivision');
const wait=new TrentonEngine(1,'long_island');for(const u of wait.formations.filter(u=>u.side==='continental'))wait.order(u.id,'withdraw');run(wait,40);assert.equal(wait.formations.filter(u=>u.evacuated).length,0,'No departure before boats arrive');
const routed=new TrentonEngine(1,'long_island');for(const u of routed.formations.filter(u=>u.side==='continental'))routed.route(u);run(routed,60);assert.equal(routed.objectiveStatus().evacuation.saved,0,'Routed units cannot count as evacuated');
const shelter=new TrentonEngine(1,'long_island');for(const u of shelter.formations.filter(u=>u.side==='continental')){u.x=200;u.target.x=200;}run(shelter,20);assert.equal(shelter.objectiveStatus().evacuation.screenSeconds,0,'Camping behind the screen line earns no delay credit');
const noEnemy=new TrentonEngine(1,'long_island');for(const u of noEnemy.formations.filter(u=>u.side==='crown')){u.x=1190;u.target.x=1190;}noEnemy.config={...noEnemy.config,enemyAdvanceAt:1000};run(noEnemy,5);assert.equal(noEnemy.objectiveStatus().evacuation.screenSeconds,0,'Uncontested presence earns no delay credit');
assert.equal(new TrentonEngine(1,'trenton').objectiveStatus().evacuation,null,'Other battles retain their rules');
console.log('Evacuation passed: organized success, immediate retreat failure, boat readiness, routed exclusion, forward pressure, and frame parity.');
