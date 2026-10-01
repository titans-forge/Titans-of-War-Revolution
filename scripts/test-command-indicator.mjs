import assert from 'node:assert/strict';
import { commandIndicator } from '../src/battle/commandIndicator.js';
import { TrentonEngine } from '../src/battle/trentonEngine.js';

const unit = (overrides = {}) => ({
  id: 'mercer', name: "Mercer's Brigade", side: 'continental', active: true,
  status: 'steady', order: 'advance', x: 100, y: 200,
  target: { x: 300, y: 220 }, moving: true, engaged: false, ...overrides,
});

{
  const marching = commandIndicator(unit(), 'undecided');
  assert.deepEqual({ x: marching.x, y: marching.y, label: marching.label, drawLine: marching.drawLine },
    { x: 300, y: 220, label: 'Destination', drawLine: true });
  assert.equal(marching.showLabel,true);

  const arrived = commandIndicator(unit({ x: 299, y: 220, moving: false }), 'undecided');
  assert.equal(arrived.label, 'At destination');
  assert.equal(arrived.drawLine, false, 'arrival clears the dashed travel line while retaining destination feedback');
}

{
  const enemy = { id: 'rall', name: "Rall's Regiment", side: 'crown', active: true, status: 'steady', x: 500, y: 250 };
  const attacker = unit({ order: 'attack', targetId: enemy.id, target: { x: 420, y: 240 } });
  let indicator = commandIndicator(attacker, 'undecided', [attacker, enemy]);
  assert.deepEqual({ x: indicator.x, y: indicator.y, label: indicator.label }, { x: 500, y: 250, label: "Attack: Rall's Regiment" });
  enemy.x = 540;
  enemy.y = 275;
  indicator = commandIndicator(attacker, 'undecided', [attacker, enemy]);
  assert.deepEqual({ x: indicator.x, y: indicator.y }, { x: 540, y: 275 }, 'attack indicator follows the live target instead of a stale approach point');
  for (const moving of [true,false]) {
    const contact = commandIndicator({...attacker,moving,engaged:true},'undecided',[enemy]);
    assert.equal(contact.showLabel,false,'moving and stationary cavalry contact must both clear the battlefield attack text');
    assert.equal(contact.label,"Attack: Rall's Regiment",'the sidebar retains the exact target');
  }
  assert.equal(commandIndicator({...attacker,moving:true,engaged:false},'undecided',[enemy]).showLabel,true,'the attack label returns after contact clears');
  enemy.active = false;
  assert.equal(commandIndicator(attacker, 'undecided', [attacker, enemy]), null, 'departed target clears attack indicator immediately');
  enemy.active = true;
  enemy.status = 'routed';
  assert.equal(commandIndicator(attacker, 'undecided', [attacker, enemy]), null, 'routed target clears attack indicator immediately');
}

{
  for (const order of ['hold', 'reform']) assert.equal(commandIndicator(unit({ order }), 'undecided'), null, `${order} has no destination indicator`);
  assert.equal(commandIndicator(unit({ status: 'routed' }), 'undecided'), null);
  assert.equal(commandIndicator(unit({ active: false }), 'undecided'), null);
  assert.equal(commandIndicator(unit({ side: 'crown' }), 'undecided'), null);
  for (const outcome of ['victory', 'defeat', 'withdrawal']) assert.equal(commandIndicator(unit(), outcome), null, `${outcome} clears command art`);
}

{
  assert.equal(commandIndicator(null, 'undecided'), null);
  assert.equal(commandIndicator(unit({ x: Number.NaN }), 'undecided'), null);
  assert.equal(commandIndicator(unit({ y: Infinity }), 'undecided'), null);
  assert.equal(commandIndicator(unit({ target: null }), 'undecided'), null);
  assert.equal(commandIndicator(unit({ target: { x: Number.NaN, y: 20 } }), 'undecided'), null);
}

{
  const west = commandIndicator(unit({ order: 'withdraw', target: { x: -90, y: -40 } }), 'undecided');
  assert.deepEqual({ x: west.x, y: west.y, label: west.label }, { x: 12, y: 20, label: 'Withdrawal destination' });
  const east = commandIndicator(unit({ order: 'withdraw', target: { x: 1290, y: 900 } }), 'undecided');
  assert.deepEqual({ x: east.x, y: east.y }, { x: 1188, y: 650 }, 'off-field withdrawal target is clamped to a visible map endpoint');
  const waiting = commandIndicator(unit({ order: 'withdraw', x: 170, y: 610, target: { x: 170, y: 610 }, moving: false }), 'undecided');
  assert.equal(waiting.label, 'Waiting at exit');
  assert.equal(waiting.drawLine, false);
}

{
  const held = commandIndicator(unit({ x: 220, y: 220, target: { x: 220, y: 220 }, moving: false, engaged: true }), 'undecided');
  assert.equal(held.label, 'In combat at destination', 'stationary engagement must explain why advance is not progressing');
  assert.equal(held.drawLine, false);
  assert.equal(held.showLabel,false,'combat status remains available to the sidebar without covering the fighting figures');
}

console.log('Command indicator passed: arrival, live attacks, clear states, finite geometry, withdrawal clamps, and combat hold.');

// Reproduce the browser playthrough: a friendly queue and enemy contact can
// coexist. Combat must not be described as merely waiting for a friendly unit.
{
  const battle=new TrentonEngine(17761226,'bunker_hill');
  for(const u of battle.formations)if(u.side==='continental')battle.order(u.id,'advance');
  let held;
  for(let i=0;i<700&&!held;i++) {
    battle.tick(.05);
    held=battle.formations.find(u=>u.side==='continental'&&u.engaged&&!u.moving&&u.waitingFor);
  }
  assert.ok(held,'real battle reaches simultaneous friendly blockage and combat');
  const indicator=commandIndicator(held,battle.outcome,battle.formations);
  assert.match(indicator.label,/combat/);
  assert.doesNotMatch(indicator.label,/waiting for/);
  held.engaged=false;
  assert.match(commandIndicator(held,battle.outcome,battle.formations).label,/waiting for/,'ordinary friendly queue remains explained after combat clears');
}

{
  const fallingBack=commandIndicator(unit({order:'fallback',target:{x:55,y:200}}),'undecided');
  assert.equal(fallingBack.label,'Fall back · remain on the field');
  assert.equal(fallingBack.drawLine,true);
  const northernExit=commandIndicator(unit({order:'withdraw',target:{x:700,y:-90}}),'undecided');
  assert.equal(northernExit.y,20,'northward withdrawal remains visible at the map edge');
}
