import assert from 'node:assert/strict';
import { TrentonEngine } from '../src/battle/trentonEngine.js';

const context = { metrics: { army: 50, supply: 19, support: 55 } };
const runFor = (engine, seconds) => {
  for (let step = 0; step < Math.round(seconds / 0.05); step += 1) engine.tick(0.05);
};

function withdrawAt(seed, orderTime) {
  const engine = new TrentonEngine(seed, 'long_island', context);
  runFor(engine, orderTime);
  const orderedStrength = Object.fromEntries(engine.formations
    .filter((unit) => unit.side === 'continental')
    .map((unit) => [unit.id, Math.round(unit.strength)]));

  for (const unit of engine.formations.filter((entry) => entry.side === 'continental')) {
    engine.order(unit.id, 'withdraw');
  }
  runFor(engine, 130 - orderTime);

  const continentals = engine.formations.filter((unit) => unit.side === 'continental');
  assert.equal(engine.outcome, 'withdrawal', `seed ${seed}, order at ${orderTime}s`);
  assert.deepEqual(continentals.map((unit) => unit.id), [
    'sullivan-brooklyn',
    'stirling',
    'putnam-reserve',
  ]);
  assert.ok(continentals.every((unit) => unit.evacuated && unit.status === 'withdrawn'),
    `every ordered formation completes evacuation for seed ${seed}, order at ${orderTime}s`);
  assert.equal(engine.objectiveStatus().evacuation.saved,
    continentals.reduce((total, unit) => total + unit.strength, 0));

  return {
    seed,
    orderTime,
    orderedStrength,
    completedAt: Number(engine.time.toFixed(2)),
    formations: Object.fromEntries(continentals.map((unit) => [unit.id, Math.round(unit.strength)])),
    saved: Math.round(engine.objectiveStatus().evacuation.saved),
  };
}

const traces = [];
for (const seed of [17760827, 17761226]) {
  const at29 = withdrawAt(seed, 29);
  const at30 = withdrawAt(seed, 30);
  // Bound sensitivity to half a percent of the starting force. Wider house
  // detours change exposure by a few troops, without a completion cliff.
  assert.ok(Math.abs(at29.saved - at30.saved) <= (920+1050+780)*.005,
    `one second changes combat losses gradually for seed ${seed}: ${at29.saved} vs ${at30.saved}`);
  traces.push(at29, at30);
}

function objectiveBoundary({ savedIds, pending = 'withdraw', pendingStatus = 'steady', atDeadline = false }) {
  const engine = new TrentonEngine(17760827, 'long_island', context);
  engine.screenSeconds = engine.config.evacuation.screenSeconds;
  for (const unit of engine.formations.filter((entry) => entry.side === 'continental')) {
    if (savedIds.includes(unit.id)) {
      unit.active = false;
      unit.status = 'withdrawn';
      unit.evacuated = true;
    } else {
      unit.order = pending;
      unit.status = pendingStatus;
    }
  }
  engine.time = atDeadline ? engine.config.timeLimit : engine.config.timeLimit - 1;
  engine.checkOutcome();
  return engine;
}

const earnedAtDeadline = objectiveBoundary({
  savedIds: ['sullivan-brooklyn', 'putnam-reserve'],
  atDeadline: true,
});
assert.equal(earnedAtDeadline.objectiveStatus().evacuation.saved, 1700);
assert.equal(earnedAtDeadline.outcome, 'withdrawal',
  'an earned evacuation remains a withdrawal when another formation is in transit at the deadline');

const shortAtDeadline = objectiveBoundary({ savedIds: ['sullivan-brooklyn'], atDeadline: true });
assert.equal(shortAtDeadline.objectiveStatus().evacuation.saved, 920);
assert.equal(shortAtDeadline.outcome, 'defeat',
  'the deadline does not waive the saved-troop requirement');

const cancelled = objectiveBoundary({
  savedIds: ['sullivan-brooklyn', 'putnam-reserve'],
  pending: 'hold',
});
assert.equal(cancelled.objectiveStatus().evacuation.withdrawing, 0);
assert.equal(cancelled.outcome, 'withdrawal',
  'cancelling the remaining Withdraw order permits early completion');

const routed = objectiveBoundary({
  savedIds: ['sullivan-brooklyn', 'putnam-reserve'],
  pendingStatus: 'routed',
});
assert.equal(routed.objectiveStatus().evacuation.withdrawing, 0);
assert.equal(routed.outcome, 'withdrawal',
  'a routed formation is not treated as an organized withdrawal in transit');

console.log(JSON.stringify(traces, null, 2));
console.log('Withdrawal completion passed: all ordered formations finish at 29s/30s, earned deadline results remain withdrawals, and unsatisfied, cancelled, and routed boundaries are explicit.');
