import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {chooseCrownTarget,crownTargetScore,CROWN_TARGET_WEIGHTS} from '../src/battle/enemyCoordination.js';
const battles=['trenton','bunker_hill','long_island','brandywine','saratoga','monmouth','cowpens'];
const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const enemies=e=>e.formations.filter(u=>u.side==='continental'&&u.active&&u.status!=='routed');
const crowns=e=>e.formations.filter(u=>u.side==='crown'&&u.active&&u.status!=='routed'&&!u.retiring).sort((a,b)=>a.id.localeCompare(b.id));
const baseline=(unit,targets,assigned)=>[...targets].sort((a,b)=>{const score=enemy=>gap(unit,enemy)+(assigned.get(enemy.id)||0)*170-(unit.targetId===enemy.id?65:0)-(unit.type==='cavalry'&&enemy.type==='artillery'?90:0);return score(a)-score(b)||a.id.localeCompare(b.id);})[0]||null;
const assignments=(engine,chooser,options)=>{const targets=enemies(engine),assigned=new Map(),result=new Map();for(const unit of crowns(engine)){const target=chooser(unit,targets,assigned,options);if(!target)continue;result.set(unit.id,target.id);assigned.set(target.id,(assigned.get(target.id)||0)+1);}return result;};

assert.deepEqual(CROWN_TARGET_WEIGHTS,{assigned:170,retained:65,cavalryArtillery:90});
for(const battle of battles){const engine=new TrentonEngine(23,battle);assert.deepEqual(assignments(engine,chooseCrownTarget),assignments(engine,baseline),`${battle}: noncontact scoring exactly matches the prior policy`);}

{
  const engine=new TrentonEngine(2302,'trenton'),unit=crowns(engine)[0],[contact,distant]=enemies(engine);
  Object.assign(unit,{x:600,y:300,targetId:distant.id});Object.assign(contact,{x:694,y:300});Object.assign(distant,{x:720,y:300});
  const assigned=new Map([[contact.id,4]]),isContact=(a,b)=>a===unit&&b===contact;
  assert.equal(baseline(unit,[contact,distant],assigned).id,distant.id);
  assert.equal(chooseCrownTarget(unit,[contact,distant],assigned,{isContact}).id,contact.id,'four prior assignments cannot pull a formation out of legal contact');
}

{
  const unit={id:'crown',side:'crown',type:'infantry',x:500,y:300,targetId:'contact-b'};
  const a={id:'contact-a',side:'continental',type:'infantry',x:590,y:300},b={id:'contact-b',side:'continental',type:'infantry',x:500,y:345},distant={id:'distant',side:'continental',type:'infantry',x:510,y:300};
  const contacts=new Set([a.id,b.id]);
  assert.equal(chooseCrownTarget(unit,[a,b,distant],new Map([[b.id,1]]),{isContact:(_u,e)=>contacts.has(e.id)}).id,a.id,'legacy spreading applies among crowded contacts');
}

assert.equal(chooseCrownTarget(null,[]),null);assert.equal(chooseCrownTarget({id:'x'},null),null);
assert.ok(Number.isFinite(crownTargetScore({x:0,y:0,type:'infantry'},{id:'y',x:10,y:0,type:'infantry'},3)));
{
  const engine=new TrentonEngine(17810117,'cowpens'),reserve=engine.formations.find(u=>u.id==='washington-cavalry'),retiring=engine.formations.find(u=>u.id==='tarleton-legion');retiring.retiring=true;
  assert.equal(enemies(engine).some(u=>u.id===reserve.id),false);assert.equal(crowns(engine).some(u=>u.id===retiring.id),false);assert.equal(reserve.active,false);assert.equal(retiring.retiring,true);
}
console.log('Enemy coordination passed: exact seven-battle noncontact equivalence, strict crowded-contact shortlist, deterministic contact spreading and Cowpens lifecycle safety.');
