import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {repulseStatus} from '../src/battle/repulseObjective.js';
import {objectiveSummary} from '../src/battle/objectiveSummary.js';
import {battleDebrief} from '../src/battle/battleDebrief.js';
import {captureBattleCheckpoint,restoreBattleCheckpoint} from '../src/battle/battleCheckpoint.js';
const fresh=()=>new TrentonEngine(49,'saratoga',{metrics:{army:50,supply:50,support:50}});
const ready=()=>{const e=fresh();e.route(e.formations.find(u=>u.id==='fraser'));e.route(e.formations.find(u=>u.id==='riedesel'));return e;};
let e=ready();assert.equal(repulseStatus(e).ready,true);assert.equal(e.objectiveStatus().losses,0);
e.time=e.config.timeLimit-.05;e.checkOutcome();assert.equal(e.outcome,'undecided','two routed columns do not bypass the deadline');
e.time=e.config.timeLimit;e.checkOutcome();assert.equal(e.outcome,'victory','two routs count even without physical casualties');
assert.match(objectiveSummary(e.objectiveStatus()),/Columns broken 2\/2/);assert.doesNotMatch(objectiveSummary(e.objectiveStatus()),/loss target/);assert.match(battleDebrief(e.snapshot()),/reconnaissance was repulsed/);
e=fresh();for(const u of e.formations.filter(u=>u.side==='crown'))u.strength*=.5;e.time=e.config.timeLimit;e.checkOutcome();assert.equal(e.outcome,'defeat','casualties alone no longer satisfy the objective');
e=ready();for(const u of e.formations.filter(u=>u.side==='continental'))u.order='withdraw';assert.equal(repulseStatus(e).fighting,0);e.time=e.config.timeLimit;e.checkOutcome();assert.equal(e.outcome,'defeat','mass withdrawal cannot satisfy army preservation');
e=ready();for(const u of e.formations.filter(u=>u.side==='continental'))u.status='routed';assert.equal(repulseStatus(e).fighting,0);e.checkOutcome();assert.equal(e.outcome,'defeat');
e=ready();const lincoln=e.formations.find(u=>u.id==='lincoln-reserve');assert.equal(lincoln.active,false);assert.equal(repulseStatus(e).fighting,2820,'unarrived reserve is not fighting');
for(const u of e.formations.filter(u=>u.side==='crown'&&u.status==='routed'))u.active=false;assert.equal(repulseStatus(e).broken,2,'off-field routs remain credited');
const restored=restoreBattleCheckpoint(captureBattleCheckpoint(e),'saratoga',{metrics:{army:50,supply:50,support:50}});assert.ok(restored);assert.deepEqual(repulseStatus(restored),repulseStatus(e));
e=fresh();for(const u of e.formations.filter(u=>u.side==='crown'))e.route(u);e.checkOutcome();assert.equal(e.outcome,'victory','all enemy routs still win immediately');
assert.equal(repulseStatus(new TrentonEngine(49,'trenton')),null);
console.log('Repulse objective passed: morale success, deadline, casualty shortcut rejection, army exclusions, off-field routs and checkpoint recovery.');

for(const seed of [49,17761226,17760827])for(const policy of ['idle','withdraw','unsupported']){
 const e=new TrentonEngine(seed,'saratoga');
 if(policy==='withdraw')for(const u of e.formations.filter(u=>u.side==='continental'))e.order(u.id,'withdraw');
 if(policy==='unsupported')e.attack('morgan','fraser');
 while(e.outcome==='undecided'&&e.time<140)e.tick(.05);
 assert.notEqual(e.outcome,'victory',`${policy} seed ${seed} cannot bypass the repulse`);
}
console.log('Saratoga shortcuts rejected across three seeds: idle, immediate withdrawal and unsupported single-column attack.');

{
 const e=ready(),units=e.formations.filter(u=>u.side==='continental');
 for(const u of units){u.active=true;u.entered=true;u.strength=u.initialStrength*.5;}
 assert.equal(repulseStatus(e).fighting,repulseStatus(e).requiredArmy);
 e.time=e.config.timeLimit;e.checkOutcome();assert.equal(e.outcome,'victory','exact half-army boundary passes');
 e.outcome='undecided';units[0].strength-=.01;e.checkOutcome();assert.equal(e.outcome,'defeat','a fraction below the army boundary fails');
}
{
 const e=fresh(),enemy=e.formations.find(u=>u.side==='crown');enemy.status='withdrawn';assert.equal(repulseStatus(e).broken,0,'organized withdrawal is not a rout');enemy.status='routed';enemy.entered=false;assert.equal(repulseStatus(e).broken,0,'an unentered reserve cannot be credited as defeated');
}
console.log('Repulse boundary checks passed: exact army minimum and unentered/organized enemy exclusions.');
