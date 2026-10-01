import assert from 'node:assert/strict';
import { constrainFormationStep, footprintDistance, inFormationContact } from '../src/battle/formationContact.js';
import { TrentonEngine } from '../src/battle/trentonEngine.js';

const unit = (id, side, x, y, extra = {}) => ({
  id, side, x, y, active: true, status: 'steady', type: 'infantry', formationMode: 'line', order: 'advance', ...extra,
});
const finiteStep = (result) => Number.isFinite(result.step.x) && Number.isFinite(result.step.y);
const magnitude = (step) => Math.hypot(step.x, step.y);

// Two formations converging on one occupied destination must not interpenetrate.
{
  const holder = unit('a-holder', 'continental', 500, 300, { order: 'hold' });
  const mover = unit('b-mover', 'continental', 400, 300);
  const result = constrainFormationStep(mover, [mover, holder], { x: 12, y: 0 }, { x: holder.x, y: holder.y });
  assert.ok(finiteStep(result));
  assert.ok(footprintDistance({ ...mover, x: mover.x + result.step.x, y: mover.y + result.step.y }, holder) >= 1 - 1e-8);
}

// Head-on friendly passage chooses deterministic legal sidesteps.
{
  const left = unit('left', 'continental', 400, 300);
  const right = unit('right', 'continental', 500, 300);
  const a = constrainFormationStep(left, [left, right], { x: 12, y: 0 }, { x: 600, y: 300 });
  left.x += a.step.x;
  left.y += a.step.y;
  const b = constrainFormationStep(right, [left, right], { x: -12, y: 0 }, { x: 300, y: 300 });
  assert.ok(finiteStep(a) && finiteStep(b));
  assert.ok(magnitude(a.step) <= 12 + 1e-8 && magnitude(b.step) <= 12 + 1e-8, 'contact avoidance cannot exceed the requested step budget');
  const jointlyMovedRight = { ...right, x: right.x + b.step.x, y: right.y + b.step.y };
  assert.ok(footprintDistance(left, jointlyMovedRight) >= 1 - 1e-8, 'sequential head-on steps cannot create overlap');
}

// The real engine resolves a head-on friendly passage without overlap, teleport, or deadlock.
{
  const engine = new TrentonEngine(22, 'trenton');
  const left = engine.formations.find((entry) => entry.id === 'mercer');
  const right = engine.formations.find((entry) => entry.id === 'sullivan');
  for (const other of engine.formations) if (other !== left && other !== right) other.active = false;
  Object.assign(left, { x: 400, y: 300, target: { x: 600, y: 300 }, order: 'advance', fatigue: 0 });
  Object.assign(right, { x: 500, y: 300, target: { x: 300, y: 300 }, order: 'advance', fatigue: 0 });
  let crossed = false;
  for (let frame = 0; frame < 500; frame += 1) {
    const beforeLeft = { x: left.x, y: left.y };
    const beforeRight = { x: right.x, y: right.y };
    engine.advanceUnit(left, 0.05);
    engine.advanceUnit(right, 0.05);
    assert.ok(Math.hypot(left.x - beforeLeft.x, left.y - beforeLeft.y) <= 1.51, 'left formation respects the frame step budget');
    assert.ok(Math.hypot(right.x - beforeRight.x, right.y - beforeRight.y) <= 1.51, 'right formation respects the frame step budget');
    assert.ok(footprintDistance(left, right) >= 1 - 1e-8, `real-engine overlap on frame ${frame}`);
    if (left.x > right.x) { crossed = true; break; }
  }
  assert.equal(crossed, true, 'head-on friendly formations eventually pass instead of deadlocking');
}

// A mover waiting for a stationary occupied goal can resume once the blocker leaves.
{
  const holder = unit('holder', 'continental', 494, 300, { order: 'hold' });
  const mover = unit('mover', 'continental', 400, 300);
  const blocked = constrainFormationStep(mover, [mover, holder], { x: 10, y: 0 }, { x: 494, y: 300 });
  assert.equal(magnitude(blocked.step), 0);
  assert.equal(blocked.waitingFor, holder.id);
  holder.active = false;
  const resumed = constrainFormationStep(mover, [mover, holder], { x: 10, y: 0 }, { x: 494, y: 300 });
  assert.ok(magnitude(resumed.step) > 0);
  assert.equal(resumed.waitingFor, null);
}

// Hostile fronts stop movement at contact instead of allowing simultaneous attacks to cross.
{
  const blue = unit('blue', 'continental', 400, 300);
  const red = unit('red', 'crown', 500, 300);
  for (let frame = 0; frame < 8 && !inFormationContact(blue, red); frame += 1) {
    const blueStep = constrainFormationStep(blue, [blue, red], { x: 2, y: 0 }, { x: red.x, y: red.y });
    blue.x += blueStep.step.x; blue.y += blueStep.step.y;
    const redStep = constrainFormationStep(red, [blue, red], { x: -2, y: 0 }, { x: blue.x, y: blue.y });
    red.x += redStep.step.x; red.y += redStep.step.y;
    assert.ok(blue.x < red.x, 'hostile fronts cannot cross');
    assert.ok(footprintDistance(blue, red) >= 1 - 1e-8, 'hostile fronts cannot overlap');
  }
  assert.ok(inFormationContact(blue, red), 'opposing advances eventually reach combat contact');
}

// Existing overlap can separate gradually, without a corrective teleport.
{
  const a = unit('a', 'continental', 400, 300);
  const b = unit('b', 'continental', 410, 300);
  const before = footprintDistance(a, b);
  const result = constrainFormationStep(a, [a, b], { x: -4, y: 0 }, { x: 300, y: 300 });
  const after = footprintDistance({ ...a, x: a.x + result.step.x, y: a.y + result.step.y }, b);
  assert.ok(after > before);
  assert.ok(magnitude(result.step) <= 4 + 1e-8);
}

// Fallback and withdrawal are never trapped by friendly contact.
for (const order of ['fallback', 'withdraw']) {
  const retreat = unit(`retreat-${order}`, 'continental', 400, 300, { order });
  const blocker = unit(`blocker-${order}`, 'continental', 410, 300, { order: 'hold' });
  const desired = { x: -8, y: 0 };
  assert.deepEqual(constrainFormationStep(retreat, [retreat, blocker], desired, { x: 200, y: 300 }), { step: desired, waitingFor: null });
}

// Terrain rejection remains authoritative over contact sidesteps.
{
  const mover = unit('terrain-mover', 'continental', 400, 300);
  const blocker = unit('terrain-blocker', 'continental', 495, 300);
  const clear = (_unit, point) => point.y === 300 && point.x <= 405;
  const result = constrainFormationStep(mover, [mover, blocker], { x: 10, y: 0 }, { x: 600, y: 300 }, clear);
  assert.equal(magnitude(result.step), 0);
  assert.equal(result.waitingFor, blocker.id);
}

// Public module guards must never pass malformed coordinates into engine state.
{
  const mover = unit('malformed', 'continental', 400, 300);
  for (const desired of [{ x: NaN, y: 1 }, { x: Infinity, y: 0 }, { x: 1, y: -Infinity }]) {
    const result = constrainFormationStep(mover, [mover], desired, { x: 500, y: 300 });
    assert.ok(finiteStep(result), `malformed desired step must fail closed: ${JSON.stringify(desired)}`);
    assert.equal(magnitude(result.step), 0);
  }
}

console.log('Formation contact passed: destinations, passage, yielding, hostile fronts, overlap exit, retreat, budget, terrain and finite guards.');
