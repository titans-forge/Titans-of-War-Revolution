import assert from 'node:assert/strict';
import { planMeleeExchange } from '../src/battle/meleeExchange.js';
import { TrentonEngine } from '../src/battle/trentonEngine.js';
import { inFormationContact } from '../src/battle/formationContact.js';

const unit = (id,side,extra={}) => ({id,side,type:'infantry',order:'hold',...extra});
const blue=unit('blue','continental'), red=unit('red','crown');

const duel=planMeleeExchange([blue,red],()=>true);
assert.deepEqual(duel.pairs,[[blue,red]],'one legal contact is retained');
assert.deepEqual(duel.exchanges.map(x=>[x.attacker.id,x.defender.id,x.effort]),[
  ['blue','red',1],['red','blue',1]
],'one-on-one melee is unchanged');

const reds=[1,2,3].map(n=>unit(`red${n}`,'crown'));
const many=planMeleeExchange([blue,...reds],(a,b)=>a===blue||b===blue);
assert.equal(many.pairs.length,3,'all simultaneous contacts remain engaged');
assert.deepEqual(many.exchanges.filter(x=>x.attacker===blue).map(x=>x.effort),[1/3,1/3,1/3]);
assert.equal(many.exchanges.filter(x=>x.attacker===blue).reduce((n,x)=>n+x.effort,0),1,
  'one formation has one shared outgoing effort budget');
for(const enemy of reds) assert.equal(many.exchanges.find(x=>x.attacker===enemy)?.effort,1,
  'each independently attacking opponent retains its own outgoing effort');

const twoBlue=[unit('b1','continental'),unit('b2','continental')];
const mesh=planMeleeExchange([...twoBlue,...reds.slice(0,2)],()=>true);
for(const attacker of [...twoBlue,...reds.slice(0,2)]) {
  const total=mesh.exchanges.filter(x=>x.attacker===attacker).reduce((n,x)=>n+x.effort,0);
  assert.equal(total,1,`${attacker.id} effort remains bounded in a many-to-many contact`);
}

const gun=unit('gun','continental',{type:'artillery'});
const leaving=unit('leaving','continental',{order:'withdraw'});
const exclusions=planMeleeExchange([gun,leaving,red],(a,b)=>a.side!==b.side);
assert.equal(exclusions.pairs.length,2,'non-striking formations still receive melee and become engaged');
assert.equal(exclusions.exchanges.some(x=>x.attacker===gun||x.attacker===leaving),false,
  'artillery and withdrawing formations produce no melee damage');
assert.equal(exclusions.exchanges.filter(x=>x.attacker===red).reduce((n,x)=>n+x.effort,0),1,
  'eligible opponent shares effort across non-striking defenders');

const blocked=planMeleeExchange([blue,red],()=>false);
assert.deepEqual(blocked,{pairs:[],exchanges:[]},'terrain-blocked contact produces no engagement or attack');
assert.deepEqual(planMeleeExchange([blue,unit('friend','continental')],()=>true),{pairs:[],exchanges:[]},
  'friendly formations never exchange melee damage');
assert.deepEqual(planMeleeExchange(null,()=>true),{pairs:[],exchanges:[]},'invalid formation input is inert');
assert.deepEqual(planMeleeExchange([blue,red],null),{pairs:[],exchanges:[]},'invalid contact predicate is inert');

// The existing coefficient is deliberately outside the helper. Scaling every
// damage channel by effort preserves a duel and bounds an attacker's aggregate.
const baseLoss=4.25, morale=2.4, cohesion=3.2;
for(const field of [[baseLoss,'strength'],[morale,'morale'],[cohesion,'cohesion']]) {
  const [amount,label]=field;
  assert.equal(duel.exchanges.filter(x=>x.attacker===blue).reduce((n,x)=>n+amount*x.effort,0),amount,`${label} duel unchanged`);
  assert.equal(many.exchanges.filter(x=>x.attacker===blue).reduce((n,x)=>n+amount*x.effort,0),amount,`${label} aggregate bounded`);
}

function actualEngineLoss(contactCount) {
  const battle=new TrentonEngine(7,'trenton');
  const attacker=battle.formations.find(u=>u.id==='mercer');
  const defenders=battle.formations.filter(u=>u.side==='crown').slice(0,contactCount);
  const positions=[[590,300],[500,346],[500,254]];
  for(const formation of battle.formations) formation.active=formation===attacker||defenders.includes(formation);
  Object.assign(attacker,{x:500,y:300,target:{x:500,y:300},order:'hold',ammunition:0});
  defenders.forEach((defender,index)=>Object.assign(defender,{x:positions[index][0],y:positions[index][1],target:{x:positions[index][0],y:positions[index][1]},order:'hold',ammunition:0}));
  battle.nextCrownDecision=1e9;
  assert.equal(defenders.filter(defender=>inFormationContact(attacker,defender)).length,contactCount);
  const before=defenders.reduce((sum,defender)=>sum+defender.strength,0);
  battle.tick(.05);
  return before-defenders.reduce((sum,defender)=>sum+defender.strength,0);
}
const actualDuelLoss=actualEngineLoss(1), actualThreeLoss=actualEngineLoss(3);
assert.ok(Math.abs(actualDuelLoss-actualThreeLoss)<1e-9,
  `actual engine must share one attacker's effort (duel ${actualDuelLoss}, three contacts ${actualThreeLoss})`);

console.log('melee exchange tests passed');
