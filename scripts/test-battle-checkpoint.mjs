import assert from 'node:assert/strict';
import { captureBattleCheckpoint, restoreBattleCheckpoint } from '../src/battle/battleCheckpoint.js';
import { TrentonEngine } from '../src/battle/trentonEngine.js';

const battles = ['trenton', 'bunker_hill', 'long_island', 'brandywine', 'saratoga', 'monmouth', 'cowpens'];
const context = { metrics: { army: 63, supply: 71, support: 58 }, flags: { steubenSystem: true, trentonPlan: 'cross', commandRating: 3 } };
const checkpoints = [0, 20, 50, 90];

function orderedEngine(battleId, seed) {
  const engine = new TrentonEngine(seed, battleId, context);
  const friendlies = engine.formations.filter(unit => unit.side === 'continental' && unit.active);
  const enemy = engine.formations.find(unit => unit.side === 'crown' && unit.active);
  engine.attack(friendlies[0].id, enemy.id);
  if (friendlies[1]) engine.attack(friendlies[1].id, enemy.id);
  if (['brandywine', 'bunker_hill'].includes(battleId)) engine.move(friendlies[0].id, { x: 1080, y: 110 });
  engine.tick(0.03); // Exercise restoration with a partial fixed-step accumulator.
  return engine;
}

function advanceTo(engine, target) {
  let guard = 0;
  while (engine.time < target - 1e-6 && engine.outcome === 'undecided' && guard < 4000) {
    engine.tick(0.1);
    guard += 1;
  }
}

function finish(engine) {
  let guard = 0;
  while (engine.outcome === 'undecided' && guard < 4000) {
    engine.tick(0.1);
    guard += 1;
  }
  assert.notEqual(engine.outcome, 'undecided', `${engine.battleId} must reach a terminal result`);
}

function roundTrip(engine, battleId) {
  const checkpoint = captureBattleCheckpoint(engine);
  const encoded = JSON.stringify(checkpoint);
  assert.ok(encoded.length < 256 * 1024, `${battleId} checkpoint must be bounded`);
  const resumed = restoreBattleCheckpoint(JSON.parse(encoded), battleId, context);
  assert.ok(resumed, `${battleId} checkpoint at ${engine.time}s must restore`);
  assert.deepEqual(captureBattleCheckpoint(resumed), checkpoint, `${battleId} complete mutable state must round-trip`);
  return resumed;
}

for (const [battleIndex, battleId] of battles.entries()) {
  for (const targetTime of checkpoints) {
    const uninterrupted = orderedEngine(battleId, 1700 + battleIndex);
    advanceTo(uninterrupted, targetTime);
    const resumed = roundTrip(uninterrupted, battleId);

    finish(uninterrupted);
    finish(resumed);
    assert.deepEqual(captureBattleCheckpoint(resumed), captureBattleCheckpoint(uninterrupted), `${battleId} restored at ${targetTime}s must finish deterministically`);
  }

  const completed = orderedEngine(battleId, 2700 + battleIndex);
  finish(completed);
  const completedResume = roundTrip(completed, battleId);
  assert.deepEqual(completedResume.snapshot(), completed.snapshot(), `${battleId} terminal checkpoint must restore`);
}

// Keep one continuous mid-flight replay with varied frame lengths, including
// authored route plans that may contain consumed and pending waypoints.
for (const [battleIndex, battleId] of battles.entries()) {
  const uninterrupted = orderedEngine(battleId, 3700 + battleIndex);
  const friendly = uninterrupted.formations.find(unit => unit.side === 'continental' && unit.active);
  const enemy = uninterrupted.formations.find(unit => unit.side === 'crown' && unit.active);
  uninterrupted.attack(friendly.id, enemy.id);
  if (['brandywine', 'bunker_hill'].includes(battleId)) uninterrupted.move(friendly.id, { x: 1080, y: 110 });
  for (let index = 0; index < 137; index += 1) uninterrupted.tick(index % 3 === 0 ? 0.07 : 0.11);

  const resumed = roundTrip(uninterrupted, battleId);
  assert.deepEqual(resumed.snapshot(), uninterrupted.snapshot(), `${battleId} restored snapshot must match`);
  assert.equal(resumed.accumulator, uninterrupted.accumulator);
  assert.deepEqual([...resumed.navigation], [...uninterrupted.navigation], `${battleId} navigation plans must restore`);

  for (let index = 0; index < 240; index += 1) {
    const dt = index % 4 === 0 ? 0.13 : 0.06;
    uninterrupted.tick(dt);
    resumed.tick(dt);
  }
  assert.deepEqual(resumed.snapshot(), uninterrupted.snapshot(), `${battleId} resumed result must remain deterministic`);
}

const valid = captureBattleCheckpoint(new TrentonEngine(12, 'trenton', context));
const reject = mutate => {
  const candidate = JSON.parse(JSON.stringify(valid));
  mutate(candidate);
  assert.equal(restoreBattleCheckpoint(candidate, 'trenton', context), null);
};
reject(value => { value.version = 99; });
reject(value => { value.definitionFingerprint = 'stale'; });
reject(value => { value.time = Infinity; });
reject(value => { value.formations.reverse(); });
reject(value => { value.formations[0].status = 'unknown'; });
reject(value => { value.navigation.push({ id: value.formations[0].id, goal: { x: 1, y: 1 }, points: [] }, { id: value.formations[0].id, goal: { x: 2, y: 2 }, points: [] }); });
reject(value => { value.events[0].extra = true; });
reject(value => { value.extra = true; });
assert.equal(restoreBattleCheckpoint(valid, 'cowpens', context), null, 'battle identity must match');
assert.equal(restoreBattleCheckpoint(valid, 'trenton', { metrics: { army: NaN } }), null, 'malformed campaign context must be rejected');
const pollutedContext = JSON.parse('{"__proto__":{"polluted":true}}');
assert.equal(restoreBattleCheckpoint(valid, 'trenton', pollutedContext), null, 'prototype-pollution keys must be rejected');
assert.equal({}.polluted, undefined);

console.log('Battle checkpoint tests passed for all seven battles.');
