import assert from 'node:assert/strict';
import { spaceFriendlyStep } from '../src/battle/formationSpacing.js';

const moving = (id, x, y, target, side = 'continental') => ({ id, x, y, target, side, active: true, status: 'steady', order: 'advance' });

function simulate(units, steps = 240, speed = 2) {
  let minimum = Infinity;
  const histories = new Map(units.map((unit) => [unit.id, [{ x: unit.x, y: unit.y }]]));
  for (let tick = 0; tick < steps; tick += 1) {
    const snapshot = units.map((unit) => ({ ...unit, target: { ...unit.target } }));
    const deltas = snapshot.map((unit) => {
      const dx = unit.target.x - unit.x;
      const dy = unit.target.y - unit.y;
      const gap = Math.hypot(dx, dy);
      if (gap < 0.01) return { x: 0, y: 0 };
      const scale = Math.min(speed, gap) / gap;
      return spaceFriendlyStep(unit, snapshot, { x: dx * scale, y: dy * scale });
    });
    units.forEach((unit, index) => {
      unit.x += deltas[index].x;
      unit.y += deltas[index].y;
      histories.get(unit.id).push({ x: unit.x, y: unit.y });
    });
    for (let i = 0; i < units.length; i += 1) for (let j = i + 1; j < units.length; j += 1) {
      const remainingI = Math.hypot(units[i].target.x - units[i].x, units[i].target.y - units[i].y);
      const remainingJ = Math.hypot(units[j].target.x - units[j].x, units[j].target.y - units[j].y);
      if (Math.max(remainingI, remainingJ) > 70) minimum = Math.min(minimum, Math.hypot(units[i].x - units[j].x, units[i].y - units[j].y));
    }
  }
  return { minimum, histories };
}

{
  const units = [moving('alpha', 100, 260, { x: 500, y: 260 }), moving('bravo', 300, 80, { x: 300, y: 440 })];
  const { minimum, histories } = simulate(units, 320);
  assert.ok(minimum > 12, `crossing paths should avoid an identical center, got ${minimum}`);
  assert.ok(units[0].x > 490 && units[1].y > 430, 'crossing formations must continue through the intersection');
  const alphaOffsets = histories.get('alpha').map((point) => point.y - 260).filter((offset) => Math.abs(offset) > 0.25);
  assert.ok(alphaOffsets.every((offset) => Math.sign(offset) === Math.sign(alphaOffsets[0])), 'avoidance must remain on one side of the commanded path without oscillation');
}

{
  const edge = moving('edge', 100, 45, { x: 500, y: 45 });
  const inside = moving('inside', 170, 47, { x: 500, y: 45 });
  const delta = spaceFriendlyStep(edge, [edge, inside], { x: 2, y: 0 });
  assert.ok(edge.y + delta.y >= 45, 'friendly avoidance cannot steer above the playable area');
  const lower = moving('lower', 100, 635, { x: 500, y: 635 });
  const lowerFriend = moving('lower-friend', 170, 633, { x: 500, y: 635 });
  const lowerDelta = spaceFriendlyStep(lower, [lower, lowerFriend], { x: 2, y: 0 });
  assert.ok(lower.y + lowerDelta.y <= 635, 'friendly avoidance cannot steer below the playable area');
}

{
  const units = [moving('left', 100, 180, { x: 500, y: 300 }), moving('right', 100, 420, { x: 500, y: 300 })];
  const { minimum } = simulate(units, 500);
  assert.ok(minimum > 20, `converging formations should not share a center en route, got ${minimum}`);
  assert.ok(units.every((unit) => Math.hypot(unit.x - unit.target.x, unit.y - unit.target.y) < 4), 'destination fade must allow access to one narrow objective');
}

{
  const mover = moving('mover', 100, 200, { x: 500, y: 200 });
  const held = { ...moving('held', 230, 200, { x: 230, y: 200 }), order: 'hold' };
  const before = { x: held.x, y: held.y };
  const first = spaceFriendlyStep(mover, [mover, held], { x: 2, y: 0 });
  assert.ok(Math.hypot(first.x, first.y) <= 2 + 1e-9 && first.x > 0, 'steering must preserve the movement budget and forward progress');
  simulate([mover, held], 240);
  assert.deepEqual({ x: held.x, y: held.y }, before, 'spacing cannot displace a held formation');
  assert.ok(mover.x > 300, 'a moving formation must steer past a held friend without becoming trapped');
}

{
  const withdrawer = { ...moving('retreat', 200, 200, { x: -90, y: 200 }), order: 'withdraw' };
  const friend = moving('friend', 130, 200, { x: 500, y: 200 });
  assert.deepEqual(spaceFriendlyStep(withdrawer, [withdrawer, friend], { x: -2, y: 0 }), { x: -2, y: 0 }, 'withdrawal movement must be unchanged');
  const retiring = { ...moving('organized-retreat', 200, 200, { x: 500, y: 200 }, 'crown'), retiring: true };
  assert.deepEqual(spaceFriendlyStep(retiring, [retiring, { ...friend, side: 'crown' }], { x: 2, y: 0 }), { x: 2, y: 0 }, 'organized Crown retreat must be unchanged');
  const crownFollower = moving('crown-follower', 130, 200, { x: 500, y: 200 }, 'crown');
  assert.deepEqual(spaceFriendlyStep(crownFollower, [crownFollower, retiring], { x: 2, y: 0 }), { x: 2, y: 0 }, 'retiring troops must not become spacing obstacles');

  const attacker = { ...moving('attack', 200, 200, { x: 300, y: 200 }), order: 'attack' };
  const ally = moving('ally', 250, 200, { x: 350, y: 200 });
  const enemy = moving('enemy', 265, 200, { x: 100, y: 200 }, 'crown');
  assert.deepEqual(spaceFriendlyStep(attacker, [attacker, ally, enemy], { x: 2, y: 0 }), { x: 2, y: 0 }, 'friendly spacing must yield to opposing contact');
}

console.log('Formation spacing tests passed.');
