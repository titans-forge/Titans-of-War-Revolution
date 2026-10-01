import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {inFormationContact} from '../src/battle/formationContact.js';

const place=(unit,x,y)=>Object.assign(unit,{x,y,target:{x,y},order:'hold',status:'steady',active:true,moving:false});

{
  const battle=new TrentonEngine(41,'trenton');
  const crown=battle.formations.find(u=>u.id==='rall'),contact=battle.formations.find(u=>u.id==='mercer'),distant=battle.formations.find(u=>u.id==='sullivan');
  for(const unit of battle.formations)unit.active=[crown,contact,distant].includes(unit);
  place(crown,500,300);place(contact,590,300);place(distant,820,420);
  crown.targetId=distant.id;
  assert.ok(inFormationContact(crown,contact));
  battle.time=10;battle.nextCrownDecision=0;battle.updateCrownOrders();
  assert.equal(crown.targetId,contact.id,'a Crown formation switches from a distant assignment to the enemy physically in contact');
  battle.nextCrownDecision=0;battle.updateCrownOrders();
  assert.equal(crown.targetId,contact.id,'the real engine retains its live contact target on the next decision');
}

{
  const battle=new TrentonEngine(42,'trenton');
  const crown=battle.formations.find(u=>u.id==='rall'),contact=battle.formations.find(u=>u.id==='mercer'),ranged=battle.formations.find(u=>u.id==='sullivan');
  for(const unit of battle.formations)unit.active=[crown,contact,ranged].includes(unit);
  place(crown,500,300);place(contact,590,300);place(ranged,500,450);
  crown.targetId=ranged.id;crown.facing=Math.PI/2;crown.reload=0;crown.firePolicy='free';
  const ammo=crown.ammunition,rangedStrength=ranged.strength,contactStrength=contact.strength;
  battle.nextCrownDecision=1e9;battle.tick(.05);
  assert.equal(crown.ammunition,ammo,'a formation in melee cannot fire at another assigned target');
  assert.equal(ranged.strength,rangedStrength,'the elsewhere target takes no hidden ranged damage');
  assert.ok(contact.strength<contactStrength,'physical contact still resolves melee damage');
}

console.log('Coordination integration passed: live contact retention and no ranged fire away from melee.');
