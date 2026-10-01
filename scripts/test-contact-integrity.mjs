import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';

const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

{
  const battle=new TrentonEngine(19,'trenton');
  const a=battle.formations.find(u=>u.id==='mercer'),b=battle.formations.find(u=>u.id==='rall');
  for(const unit of battle.formations)unit.active=unit===a||unit===b;
  Object.assign(a,{x:400,y:340,target:{x:400,y:340},order:'hold'});
  Object.assign(b,{x:800,y:340,target:{x:800,y:340},order:'hold'});
  Object.assign(a,{order:'advance',target:{x:800,y:340}});
  Object.assign(b,{order:'advance',target:{x:400,y:340}});
  battle.nextCrownDecision=1e9;
  let previous=new Map([[a.id,{x:a.x,y:a.y}],[b.id,{x:b.x,y:b.y}]]),maxStep=0,min=Infinity,sawContact=false;
  for(let tick=0;tick<500&&battle.outcome==='undecided';tick++){
    battle.tick(.05);min=Math.min(min,gap(a,b));sawContact||=a.engaged&&b.engaged;
    for(const unit of [a,b]){maxStep=Math.max(maxStep,gap(unit,previous.get(unit.id)));previous.set(unit.id,{x:unit.x,y:unit.y});}
  }
  assert.ok(maxStep<=2.7,`contact movement cannot teleport; max step ${maxStep}`);
  assert.ok(min>=59.9,`opposing centers cannot pass through their 60-unit contact stop; min ${min}`);
  assert.ok(a.x<b.x,'opposing formations cannot swap sides through contact');
  assert.ok(sawContact&&a.strength<a.initialStrength&&b.strength<b.initialStrength,'contact remains mutual and damaging');
}

{
  const battle=new TrentonEngine(23,'trenton');
  const a=battle.formations.find(u=>u.id==='mercer'),b=battle.formations.find(u=>u.id==='sullivan');
  const observer=battle.formations.find(u=>u.id==='rall');
  for(const unit of battle.formations)unit.active=unit===a||unit===b||unit===observer;
  Object.assign(observer,{x:1100,y:600,order:'hold',target:{x:1100,y:600}});battle.nextCrownDecision=1e9;
  Object.assign(a,{x:300,y:300,target:{x:300,y:300},order:'hold'});
  Object.assign(b,{x:500,y:100,target:{x:500,y:100},order:'hold'});
  battle.move(a.id,{x:700,y:300});battle.move(b.id,{x:500,y:500});
  let min=Infinity,maxStep=0,prior=new Map([[a.id,{x:a.x,y:a.y}],[b.id,{x:b.x,y:b.y}]]);
  for(let tick=0;tick<500;tick++){
    battle.tick(.05);min=Math.min(min,gap(a,b));
    for(const unit of [a,b]){maxStep=Math.max(maxStep,gap(unit,prior.get(unit.id)));prior.set(unit.id,{x:unit.x,y:unit.y});}
  }
  assert.ok(maxStep<=1.6,`friendly yielding cannot teleport; max step ${maxStep}`);
  assert.ok(min>10,'crossing friendly formations cannot collapse to the same center');
  assert.ok(gap(a,{x:700,y:300})<2&&gap(b,{x:500,y:500})<2,'yielding cannot deadlock crossing commands');
}

console.log('Contact integrity passed: bounded motion, no opposing pass-through, mutual contact, and non-deadlocking friendly crossing.');
