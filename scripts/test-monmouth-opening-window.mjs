import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
function run(seed,delay,dt=.05,policy='defend'){
 const e=new TrentonEngine(seed,'monmouth',{metrics:{army:50,supply:50,support:50}});let ordered=false,reserve=false;
 while(e.outcome==='undecided'&&e.time<140){
  if(policy==='defend'){
   if(!ordered&&e.time>=delay-1e-6){e.order('lee-advance','reform');e.move('wayne-monmouth',{x:520,y:275});e.move('lafayette-monmouth',{x:520,y:415});ordered=true;}
   if(!reserve&&e.time>=30+delay-1e-6){e.move('washington-main',{x:430,y:345});reserve=true;}
  }else if(policy==='withdraw'&&!ordered){for(const u of e.formations.filter(u=>u.side==='continental'&&u.active))e.order(u.id,'withdraw');ordered=true;}
  e.tick(dt);
 }
 return e;
}
const traces=[];
for(const seed of [1,123,49,17780628,17761226])for(const delay of [0,3,6,9]){
 const e=run(seed,delay);traces.push({seed,delay,outcome:e.outcome,fighting:Math.floor(e.objectiveStatus().defense.fighting)});
 assert.equal(e.outcome,'victory',`seed ${seed}, reaction ${delay}s`);
 assert.ok(e.time>=e.config.timeLimit,'defense still lasts through the deadline');
 assert.ok(e.objectiveStatus().defense.fighting>=e.objectiveStatus().defense.requiredArmy);
}
for(const policy of ['idle','withdraw'])assert.notEqual(run(49,0,.05,policy).outcome,'victory',`${policy} must not win from added opening time`);
const fine=run(49,6),coarse=run(49,6,.2);assert.deepEqual(fine.snapshot(),coarse.snapshot());
console.log(JSON.stringify(traces));
console.log('Monmouth opening window passed: 20 delayed defense plans, idle/withdrawal rejection and frame parity.');
