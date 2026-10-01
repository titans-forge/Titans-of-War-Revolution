import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {STRUCTURE_FOOTPRINTS} from '../src/battle/structureFootprints.js';
import {lineOfFireClear,blockingStructure} from '../src/battle/lineOfFire.js';
function keepInfantry(engine,a,b){
 for(const side of ['continental','crown']){
 const guard=engine.formations.find(u=>u.side===side&&u!==a&&u!==b);
 Object.assign(guard,{active:true,type:'infantry',x:side==='continental'?60:1140,y:610,order:'hold',target:{x:side==='continental'?60:1140,y:610},ammunition:0});
 }
}
let cases=0;
for(const [id,[s]] of Object.entries(STRUCTURE_FOOTPRINTS))for(const type of ['infantry','artillery']){
 const e=new TrentonEngine(47,id);const a=e.formations.find(u=>u.side==='continental'),b=e.formations.find(u=>u.side==='crown');
 for(const u of e.formations)u.active=u===a||u===b;keepInfantry(e,a,b);e.nextCrownDecision=1e9;
 Object.assign(a,{x:(s.x1+s.x2)/2,y:s.y1-50,type,order:'hold',target:{x:(s.x1+s.x2)/2,y:s.y1-50},volleyRequested:true});
 Object.assign(b,{x:a.x,y:s.y2+50,order:'hold',target:{x:a.x,y:s.y2+50}});
 assert.equal(blockingStructure(id,a,b)?.id,s.id);assert.equal(lineOfFireClear(id,a,b),false);
 const before={ammo:a.ammunition,reload:a.reload,volley:a.volleySerial,strength:b.strength};
 e.fire(a,b,100);
 assert.deepEqual({ammo:a.ammunition,reload:a.reload,volley:a.volleySerial,strength:b.strength},before,'blocked direct fire has no side effects');assert.equal(a.volleyRequested,true);
 for(let i=0;i<60;i++)e.tick(.05);
 assert.equal(a.ammunition,before.ammo);assert.equal(b.strength,before.strength);assert.equal(a.order,'hold');assert.equal(a.volleyRequested,true);
 e.attack(a.id,b.id);
 for(let i=0;i<1000&&a.volleySerial===before.volley&&e.outcome==='undecided';i++)e.tick(.05);
 assert.ok(a.volleySerial>before.volley,`${id}/${type}: player attack reaches a clear shot`);
 assert.ok(lineOfFireClear(id,a,b));assert.ok(b.strength<before.strength);
 cases++;
 // Enemy must advance despite already being within its normal standoff range.
 const ai=new TrentonEngine(48,id);const blue=ai.formations.find(u=>u.side==='continental'),red=ai.formations.find(u=>u.side==='crown');
 for(const u of ai.formations)u.active=u===blue||u===red;
 Object.assign(blue,{x:(s.x1+s.x2)/2,y:s.y1-50,order:'hold',target:{x:(s.x1+s.x2)/2,y:s.y1-50}});
 Object.assign(red,{x:blue.x,y:s.y2+50,type,order:'hold',target:{x:blue.x,y:s.y2+50}});
 keepInfantry(ai,blue,red);
 ai.time=40;ai.nextCrownDecision=0;ai.updateCrownOrders();assert.equal(red.order,'advance');
 for(let i=0;i<1000&&!red.volleySerial&&ai.outcome==='undecided';i++)ai.tick(.05);
 assert.ok(red.volleySerial>0,`${id}/${type}: AI escapes blocked firing lane`);
}
assert.equal(lineOfFireClear('trenton',{x:NaN,y:0},{x:10,y:10}),false);
assert.equal(lineOfFireClear('brandywine',{x:310,y:425},{x:380,y:425}),true,'river water does not block bullets');
const s=STRUCTURE_FOOTPRINTS.trenton[0];assert.equal(lineOfFireClear('trenton',{x:s.x1-1,y:s.y1},{x:s.x2+1,y:s.y1}),false,'grazing wall blocks shot');
console.log(`Building fire passed: ${cases} infantry/artillery cases, queued fire preservation, stationary Hold, player and enemy repositioning, grazing walls and open water.`);
