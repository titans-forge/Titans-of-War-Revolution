import assert from 'node:assert/strict';
import {battleDebrief} from '../src/battle/battleDebrief.js';
const objective={resisting:2,remaining:0,losses:.14,threshold:.24};
assert.match(battleDebrief({outcome:'defeat',objective}),/14% against a 24%/);
assert.match(battleDebrief({outcome:'victory',objective:{...objective,losses:.26}}),/threshold was reached/);
assert.match(battleDebrief({outcome:'victory',objective:{...objective,resisting:0}}),/Every enemy formation/);
assert.match(battleDebrief({outcome:'defeat',objective:{...objective,remaining:10}}),/No unbroken infantry/);
assert.match(battleDebrief({outcome:'withdrawal',objective:{...objective,remaining:10}}),/left the field/);
console.log('Battle debrief reasons passed.');

const earlyDefeat = battleDebrief({outcome:'defeat',objective:{...objective,remaining:30,losses:.44,threshold:.34}});
assert.match(earlyDefeat,/loss target was reached.*survive until the deadline/);
assert.doesNotMatch(earlyDefeat,/Surviving artillery/);
assert.match(battleDebrief({outcome:'defeat',objective:{...objective,remaining:30},formations:[{side:'continental',type:'artillery',active:true,status:'steady'}]}),/Surviving artillery/);

{
  const counterattack={screens:[{shots:2,required:2,rallied:true},{shots:2,required:2,rallied:true}],openingComplete:true,regrouped:true,lineHolding:true,reserveViable:true,lineSeconds:16,requiredLineSeconds:16,counterSeconds:6,requiredCounterSeconds:6,counterDamage:19,requiredCounterDamage:12,fighting:1252,requiredFighting:770};
  const goal={...objective,remaining:82,counterattack};
  const won=battleDebrief({outcome:'victory',objective:goal});
  assert.match(won,/counterattack objective was achieved/);
  assert.match(won,/screens rallied 2\/2; line held 16\/16s/);
  assert.doesNotMatch(won,/loss.*threshold|Every enemy formation/,'a command-objective victory must not claim enemy annihilation');
  const failed=battleDebrief({outcome:'defeat',objective:{...goal,counterattack:{...counterattack,lineHolding:false,reserveViable:false}}});
  assert.match(failed,/Howard no longer holds/);assert.match(failed,/Washington must remain unbroken/);
  assert.match(battleDebrief({outcome:'withdrawal',objective:goal}),/army left the field/);
}
