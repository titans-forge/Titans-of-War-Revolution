import assert from 'node:assert/strict';
import {constrainFormationStep,footprintDistance,inFormationContact} from '../src/battle/formationContact.js';
import {TrentonEngine} from '../src/battle/trentonEngine.js';

const unit=(id,side,x,y,extra={})=>({id,side,x,y,active:true,status:'steady',type:'infantry',formationMode:'line',order:'advance',...extra});

for(const offset of [-10,10]){
  const mover=unit('mover','continental',400,300),blocker=unit('blocker','continental',492,300+offset);
  const result=constrainFormationStep(mover,[mover,blocker],{x:10,y:0},{x:600,y:300});
  assert.ok(result.step.y*offset<0,`sidestep must turn outward from a blocker at y offset ${offset}`);
}

{
  const mover=unit('mover','continental',400,300),blocker=unit('blocker','continental',493,300);
  const verticalOnly=(_from,to)=>Math.abs(to.x-mover.x)<1e-7;
  const result=constrainFormationStep(mover,[mover,blocker],{x:10,y:0},{x:600,y:300},verticalOnly);
  assert.ok(Math.abs(result.step.x)<1e-7&&Math.abs(result.step.y-10)<1e-7,'bounded search reaches the legal +90 degree sidestep without exceeding the step');
}

{
  const mover=unit('blue','continental',400,300),hostile=unit('red','crown',495,300);
  const result=constrainFormationStep(mover,[mover,hostile],{x:10,y:0},{x:hostile.x,y:hostile.y});
  const arrived={...mover,x:mover.x+result.step.x,y:mover.y+result.step.y};
  assert.ok(result.step.x>0&&result.step.x<10,'hostile approach keeps the legal partial step instead of stopping early or clipping through');
  assert.ok(footprintDistance(arrived,hostile)>=1-1e-8);
  assert.ok(inFormationContact(arrived,hostile),'the legal boundary step enters the contact tolerance');
}

{
  const battle=new TrentonEngine(2,'trenton'),mover=battle.formations.find(u=>u.id==='mercer'),holder=battle.formations.find(u=>u.id==='sullivan');
  for(const other of battle.formations)if(other!==mover&&other!==holder)other.active=false;
  Object.assign(mover,{x:400,y:300,target:{x:494,y:300},order:'advance',fatigue:23});
  Object.assign(holder,{x:494,y:300,target:{x:494,y:300},order:'hold'});
  battle.advanceUnit(mover,1);
  assert.equal(mover.waitingFor,holder.id);
  assert.equal(mover.moving,false);
  assert.equal(mover.fatigue,23,'waiting behind an occupied destination cannot accrue marching fatigue');
}

for(const bad of [NaN,Infinity,-Infinity]){
  const mover=unit('finite','continental',400,300);
  const result=constrainFormationStep(mover,[mover],{x:bad,y:1},{x:500,y:300});
  assert.deepEqual(result.step,{x:0,y:0});
}

console.log('Contact guardrails passed: outward and 90-degree turns, hostile boundary clipping, waiting fatigue, and finite failure.');
