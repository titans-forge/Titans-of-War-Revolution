import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {segmentClear} from '../src/battle/terrainNavigation.js';

const contexts=[
  {metrics:{army:20,supply:20,support:20}},
  {metrics:{army:50,supply:50,support:50}},
  {metrics:{army:80,supply:80,support:80},flags:{steubenSystem:true}},
];

function doctrine(seed=17810117,context=contexts[1],reaction=0,frame=.05){
  const battle=new TrentonEngine(seed,'cowpens',context),fallbackReady={},reserveReady={time:null};
  for(const id of ['morgan-riflemen','pickens-militia'])battle.setFirePolicy(id,'effective');
  for(let ticks=0;ticks<4000&&battle.outcome==='undecided';ticks++){
    const goal=battle.objectiveStatus().counterattack;
    for(const screen of goal.screens)if(screen.shots>=screen.required&&!screen.rallied){
      fallbackReady[screen.id]??=battle.time;
      battle.setFirePolicy(screen.id,'hold');
      if(battle.time-fallbackReady[screen.id]>=reaction)battle.order(screen.id,'fallback');
    }
    const reserve=battle.formations.find(unit=>unit.id==='washington-cavalry');
    if(reserve.active&&reserve.status==='steady'){
      reserveReady.time??=battle.time;
      if(battle.time-reserveReady.time>=reaction&&reserve.order!=='attack'){
        const target=battle.formations.find(unit=>unit.id==='legion-dragoons'&&unit.active&&unit.status==='steady');
        if(target)battle.attack(reserve.id,target.id);
      }
    }
    battle.tick(frame);
  }
  return battle;
}

for(const seed of [1,123,997,17810117,17761226])for(const context of contexts)for(const reaction of [0,3,6]){
  const battle=doctrine(seed,context,reaction);
  const goal=battle.objectiveStatus().counterattack;
  assert.equal(battle.outcome,'victory',`doctrine should tolerate a ${reaction}s reaction delay for seed ${seed}`);
  assert.ok(goal.screens.every(screen=>screen.shots>=2&&screen.rallied),'both screens must fire and rally');
  assert.ok(goal.lineSeconds>=goal.requiredLineSeconds-1e-6&&goal.lineHolding,'Howard must earn and retain the line');
  assert.ok(goal.counterSeconds>=goal.requiredCounterSeconds-1e-6&&goal.counterDamage>=goal.requiredCounterDamage,'Washington must sustain a damaging attack');
  assert.ok(goal.reserveViable&&goal.fighting>=goal.requiredFighting,'the reserve and army must remain viable');
}

{
  const battle=new TrentonEngine(1,'cowpens');
  const screen=battle.formations.find(unit=>unit.id==='morgan-riflemen'),start={x:screen.x,y:screen.y};
  const facing=screen.facing,ammo=screen.ammunition;
  battle.order(screen.id,'fallback');
  assert.ok(segmentClear('cowpens',start,screen.target),'the authored fallback route is legal');
  for(let i=0;i<500&&screen.order==='fallback';i++)battle.advanceUnit(screen,.05);
  assert.ok(screen.x<start.x&&Math.hypot(screen.x-start.x,screen.y-start.y)>50,'Fall back moves on-field toward the authored rally point');
  assert.equal(screen.active,true);
  assert.notEqual(screen.status,'withdrawn','Fall back cannot remove the screen from battle');
  assert.equal(screen.facing,facing,'fallback preserves facing toward the pursuing enemy');
  assert.equal(screen.ammunition,ammo,'movement during fallback cannot fire');
  assert.equal(screen.order,'hold','formation holds automatically on reaching its rally point');
  battle.move(screen.id,{x:350,y:350});
  assert.equal(screen.order,'advance','a rallied formation can be recalled with a move order');
  battle.order(screen.id,'hold');
  assert.equal(screen.order,'hold','the recalled formation accepts hold');
  battle.attack(screen.id,'seventh-regiment');
  assert.equal(screen.order,'attack','the recalled formation can rejoin combat');
}

{
  const prepared=()=>{
    const battle=new TrentonEngine(1,'cowpens'),rule=battle.config.counterattackObjective;
    battle.cowpens={shots:Object.fromEntries(rule.screens.map(id=>[id,rule.volleys])),rallied:Object.fromEntries(rule.screens.map(id=>[id,true])),lineSeconds:rule.holdSeconds,counterSeconds:rule.counterSeconds,counterDamage:rule.counterDamage,reports:{}};
    const reserve=battle.formations.find(unit=>unit.id===rule.reserveId);
    reserve.active=reserve.entered=true;
    return{battle,rule,reserve};
  };
  let {battle,rule,reserve}=prepared(),goal=battle.objectiveStatus().counterattack;
  assert.equal(goal.enemyBroken,0,'regression setup keeps every Crown formation intact');
  assert.equal(goal.complete,true,'an enemy rout is not a redundant hidden victory gate');
  const cases=[
    ['opening volleys',({battle,rule})=>{battle.cowpens.shots[rule.screens[0]]=rule.volleys-1;}],
    ['screen rally',({battle,rule})=>{battle.cowpens.rallied[rule.screens[0]]=false;}],
    ['line duration',({battle,rule})=>{battle.cowpens.lineSeconds=rule.holdSeconds-.1;}],
    ['counterattack duration',({battle,rule})=>{battle.cowpens.counterSeconds=rule.counterSeconds-.1;}],
    ['reserve casualties',({battle,rule})=>{battle.cowpens.counterDamage=rule.counterDamage-.1;}],
    ['Howard position',({battle,rule})=>{battle.formations.find(u=>u.id===rule.lineId).x=rule.lineZone.x1-1;}],
    ['Howard strength',({battle,rule})=>{battle.formations.find(u=>u.id===rule.lineId).strength=Math.ceil(720*rule.lineFraction)-1;}],
    ['Washington viability',({reserve})=>{reserve.status='routed';}],
    ['army strength',({battle,rule,reserve})=>{for(const u of battle.formations.filter(u=>u.side==='continental'&&u.id!==rule.lineId&&u!==reserve))u.status='routed';battle.formations.find(u=>u.id===rule.lineId).strength=Math.ceil(720*rule.lineFraction);}],
  ];
  for(const [name,breakGate] of cases){
    const setup=prepared();breakGate(setup);
    assert.equal(setup.battle.objectiveStatus().counterattack.complete,false,`${name} must independently gate victory`);
  }
}

for(const policy of ['idle','advance','withdraw']){
  const battle=new TrentonEngine(1,'cowpens');
  if(policy!=='idle')for(const unit of battle.formations.filter(unit=>unit.side==='continental'&&unit.active))battle.order(unit.id,policy);
  for(let i=0;i<3000&&battle.outcome==='undecided';i++)battle.tick(.05);
  assert.notEqual(battle.outcome,'victory',`${policy} must not bypass the doctrine objective`);
}

{
  const fine=doctrine(17810117,contexts[1],3,.05),coarse=doctrine(17810117,contexts[1],3,.2);
  assert.equal(fine.outcome,'victory');
  assert.equal(coarse.outcome,'victory');
  assert.ok(Math.abs(fine.time-coarse.time)<=.25,'fixed-step outcome remains stable across render frame sizes');
}

console.log('Cowpens counterattack passed: real volleys, on-field fallback, line/reserve gates, delayed doctrine viability, shortcut rejection, and frame parity.');
