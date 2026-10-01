import assert from 'node:assert/strict';
import { TrentonEngine } from '../src/battle/trentonEngine.js';
const ids = ['bunker_hill','long_island','trenton','brandywine','saratoga','monmouth','cowpens'];
const run = (engine, seconds, dt=.05) => { for(let i=0;i<Math.round(seconds/dt);i++) engine.tick(dt); };
for(const id of ids) {
  const a=new TrentonEngine(123,id), b=new TrentonEngine(123,id);
  for(const u of a.formations.filter(u=>u.active&&u.side==='continental')) {a.order(u.id,'advance');b.order(u.id,'advance');}
  run(a,30,.05);run(b,30,.2);
  assert.deepEqual(a.snapshot(),b.snapshot(),`${id}: frame partition changes outcome`);
  assert.ok(a.formations.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.strength)&&u.strength>=0));
}
{
 const e=new TrentonEngine();const u=e.formations[0]; const initial=u.cohesion;
 for(let i=0;i<100;i++) e.order(u.id,'reform');
 assert.equal(u.cohesion,initial);run(e,7);assert.equal(u.cohesion,initial);run(e,1.1);assert.ok(u.cohesion>initial);
 u.reload=1.5;for(let i=0;i<100;i++)e.order(u.id,'volley');assert.equal(u.reload,1.5);
 e.order(u.id,'not-an-order');assert.equal(u.order,'hold');
 e.move(u.id,{x:NaN,y:10});assert.ok(Number.isFinite(u.target.x));
 e.order(u.id,'withdraw');assert.equal(u.order,'withdraw');const ammo=u.ammunition;run(e,25);
 assert.equal(u.active,false);assert.equal(u.status,'withdrawn');assert.equal(u.ammunition,ammo);assert.ok(Math.cos(u.facing)<0);
}
{
 const e=new TrentonEngine(123,'long_island');run(e,29);const u=e.formations.find(u=>u.id==='clinton-flank');
 assert.equal(u.entered,true);u.x=1264;e.route(u);run(e,1);assert.equal(u.active,false);e.activateReinforcements();assert.equal(u.active,false);
}
{
 const e=new TrentonEngine();const u=e.formations[0]; e.route(u);const cohesion=u.cohesion;e.setFormation(u.id,'column');assert.equal(u.cohesion,cohesion);run(e,25);assert.equal(u.active,false);
}
console.log('Tactical regressions passed: seven-battle frame parity, timed reform, reload, withdrawal, routing, reinforcement lifecycle, invalid input.');
{
 const e=new TrentonEngine();const a=e.formations[0],b=e.formations.find(u=>u.id==='rall');
 a.x=500;a.y=200;b.x=560;b.y=200;a.ammunition=b.ammunition=0;
 e.move(a.id,{x:800,y:200});const sa=a.strength,sb=b.strength;e.tick(.2);
 assert.ok(a.strength<sa&&b.strength<sb,'contact must cause reciprocal losses');
 assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=59.9,'opposing ranks must not pass through each other');
 assert.equal(a.engaged,true);
}
console.log('Contact exchange and collision regression passed.');
{
 const e=new TrentonEngine();const a=e.formations[0],b=e.formations.find(u=>u.id==='rall');
 a.x=650;a.y=200;b.x=830;b.y=200;
 e.setFirePolicy(a.id,'hold');const ammo=a.ammunition; e.tick(.2);assert.equal(a.ammunition,ammo,'hold fire preserves powder');
 e.setFirePolicy(a.id,'effective');e.tick(.2);assert.equal(a.ammunition,ammo,'effective range rejects distant shots');
 b.x=770;e.tick(.2);assert.equal(a.ammunition,ammo-1,'effective range fires at close target');
 e.setFirePolicy(a.id,'hold');a.reload=1;e.order(a.id,'volley');e.tick(.2);assert.equal(a.ammunition,ammo-1,'volley respects reload');
 e.tick(1);assert.equal(a.ammunition,ammo-2);e.tick(2);assert.equal(a.ammunition,ammo-2,'single volley returns to hold fire');
 assert.equal(a.volleyRequested,false);
}
for(const id of ids) {
 const e=new TrentonEngine(12,id);const status=e.snapshot().objective;
 assert.equal(status.remaining,e.config.timeLimit);assert.equal(status.threshold,e.config.holdVictoryLoss);
 assert.equal(status.resisting,e.formations.filter(u=>u.side==='crown').length,'objective includes reserves');
}
console.log('Fire discipline, one-shot volley, reload protection, and all-battle objective telemetry passed.');
{
 const e=new TrentonEngine();const a=e.formations[0],b=e.formations.find(u=>u.id==='rall');
 e.setFirePolicy(a.id,'effective');e.attack(a.id,b.id);assert.equal(a.order,'attack');assert.equal(a.targetId,b.id);
 assert.ok(Math.abs(Math.hypot(a.target.x-b.x,a.target.y-b.y)-120)<.001);
 b.y+=50;e.tick(.05);assert.ok(Math.abs(Math.hypot(a.target.x-b.x,a.target.y-b.y)-120)<.001,'attack follows designated enemy');
 e.order(a.id,'hold');assert.equal(a.targetId,null);assert.equal(a.order,'hold');
 e.attack(a.id,b.id);e.route(b);e.tick(.05);assert.equal(a.order,'hold');assert.equal(a.targetId,null,'no pursuit of a routed target');
 e.attack(a.id,'invalid');assert.equal(a.order,'hold');
 e.attack(a.id,'sullivan');assert.equal(a.order,'hold','cannot attack own side');
}
{
 const e=new TrentonEngine();e.time=35;e.updateCrownOrders();const crown=e.formations.filter(u=>u.side==='crown');
 assert.ok(new Set(crown.map(u=>u.targetId)).size>1,'Crown spreads assignments');
 const assignments=crown.map(u=>u.targetId);e.time+=.5;e.updateCrownOrders();assert.deepEqual(crown.map(u=>u.targetId),assignments,'no frame-by-frame retargeting');
}
console.log('Assigned attack tracking/cancel, routed targets, effective-range approach and Crown coordination passed.');
