import assert from 'node:assert/strict';
import{TrentonEngine}from'../src/battle/trentonEngine.js';
import{escapeStatus,prepareEscape,departEscapingUnit}from'../src/battle/escapeObjective.js';
import{battleDebrief}from'../src/battle/battleDebrief.js';
const run=(e,t,dt=.05)=>{for(let i=0;i<Math.round(t/dt);i++)e.tick(dt);return e;};
const fresh=()=>new TrentonEngine(17761226,'trenton');
function intercept(dt=.05){let e=fresh();e.attack('mercer','rall');e.attack('knox','rall');e.attack('sullivan','lossberg');run(e,45,dt);e.move('sullivan',{x:650,y:550});e.attack('mercer','knyphausen');e.attack('knox','knyphausen');return run(e,160,dt);}
const win=intercept();assert.equal(win.outcome,'victory');assert.equal(escapeStatus(win).escaped,0);assert.match(battleDebrief(win.snapshot()),/interception objective was achieved/);assert.deepEqual(win.snapshot(),intercept(.2).snapshot());
const idle=run(fresh(),160);assert.equal(idle.outcome,'defeat');assert.ok(escapeStatus(idle).escaped>escapeStatus(idle).allowed);assert.match(battleDebrief(idle.snapshot()),/Too many troops/);
const e=fresh(), u=e.formations.find(u=>u.id==='knyphausen'), block=e.formations.find(u=>u.id==='sullivan');u.x=680;u.y=625;e.time=64;prepareEscape(e);assert.equal(departEscapingUnit(e,u),false,'No escape before withdrawal begins');e.time=65;prepareEscape(e);block.x=650;block.y=550;assert.ok(escapeStatus(e).blocked);assert.ok(departEscapingUnit(e,u));assert.ok(u.active);assert.equal(u.order,'hold','Blocked regiments can fight while waiting');block.order='withdraw';assert.equal(escapeStatus(e).blocked,false);departEscapingUnit(e,u);assert.ok(u.escaped);assert.equal(u.active,false);e.checkOutcome();assert.equal(e.outcome,'defeat','Escaped units cannot produce the all-enemies-gone victory');
const routed=fresh(), r=routed.formations.find(u=>u.id==='rall');routed.route(r);routed.time=70;prepareEscape(routed);r.x=680;r.y=625;assert.equal(departEscapingUnit(routed,r),false);assert.equal(escapeStatus(routed).escaped,0);
const token=fresh();token.formations.find(u=>u.id==='knox').x=680;token.formations.find(u=>u.id==='knox').y=625;assert.equal(escapeStatus(token).blocked,false,'Artillery alone cannot block');let m=token.formations.find(u=>u.id==='mercer');m.x=680;m.y=625;m.strength=140;assert.equal(escapeStatus(token).blocked,false);m.strength=200;assert.ok(escapeStatus(token).blocked);m.cohesion=13;assert.equal(escapeStatus(token).blocked,false);
const cap=fresh();cap.time=155;cap.checkOutcome();assert.equal(cap.outcome,'defeat','Running out the clock without escapes is insufficient');
const allBroken=fresh();for(const u of allBroken.formations.filter(u=>u.side==='crown'))allBroken.route(u);allBroken.checkOutcome();assert.equal(allBroken.outcome,'victory');
assert.equal(new TrentonEngine(1,'brandywine').objectiveStatus().escape,null);
const limited=fresh();for(const u of limited.formations.filter(u=>u.side==='crown')){if(u.id==='knyphausen'){u.strength=450;u.active=false;u.escaped=true;u.status='withdrawn';}else limited.route(u);}limited.checkOutcome();assert.equal(limited.outcome,'victory');assert.match(battleDebrief(limited.snapshot()),/450 enemy troops escaped/);
console.log('Trenton escape passed: active interception, idle failure, opening time, blocked departure, strength gates, routed exclusion, terminal ordering and frame parity.');
