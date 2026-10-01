import assert from 'node:assert/strict';
import { TrentonEngine } from '../src/battle/trentonEngine.js';
import { defenseStatus, updateDefense } from '../src/battle/defenseObjective.js';

const DT = 0.05;
const DEADLINE = 138;
const fresh = (seed = 17780628) => new TrentonEngine(seed, 'monmouth');
const run = (engine, seconds, onStep) => {
  for (let i = 0; i < Math.round(seconds / DT) && engine.outcome === 'undecided'; i += 1) {
    onStep?.(engine);
    engine.tick(DT);
  }
  return engine;
};

function viableDefense(seed = 17780628) {
  const engine = fresh(seed);
  engine.order('lee-advance', 'reform');
  engine.move('wayne-monmouth', { x: 520, y: 275 });
  engine.move('lafayette-monmouth', { x: 520, y: 415 });
  return run(engine, DEADLINE + 1, (battle) => {
    const reserve = battle.formations.find(unit => unit.id === 'washington-main');
    if (reserve.active && reserve.order === 'hold' && reserve.x < 400) battle.move(reserve.id, { x: 430, y: 345 });
    const lee = battle.formations.find(unit => unit.id === 'lee-advance');
    if (lee.active && lee.order === 'hold' && lee.reformRemaining === 0 && lee.x >= 400 && lee.x <= 650 && lee.y >= 240 && lee.y <= 440) {
      // Hold the restored advance force on the main line.
      battle.order(lee.id, 'hold');
    }
  });
}

{
  const engine = fresh();
  assert.equal(engine.config.defenseObjective?.requireUntilDeadline, true, 'Monmouth must require holding through the deadline');
  engine.defenseSeconds = 60;
  const support = engine.formations.find(unit => unit.id === 'wayne-monmouth');
  support.x = 520;
  support.y = 300;
  assert.ok(defenseStatus(engine).holding && defenseStatus(engine).fighting >= defenseStatus(engine).requiredArmy);
  engine.time = DEADLINE - 0.1;
  engine.checkOutcome();
  assert.equal(engine.outcome, 'undecided', 'securing 60 defense seconds cannot end Monmouth before dark');
}

{
  const engine = fresh();
  for (const unit of engine.formations.filter(unit => unit.side === 'crown')) unit.strength *= 0.7;
  engine.time = DEADLINE;
  engine.checkOutcome();
  assert.equal(engine.outcome, 'defeat', 'the former casualty threshold cannot replace the defensive objective');
}

{
  const engine = fresh();
  engine.defenseSeconds = 60;
  const enemy = engine.formations.find(unit => unit.id === 'cornwallis-monmouth');
  const support = engine.formations.find(unit => unit.id === 'wayne-monmouth');
  support.x = 520;
  support.y = 300;
  enemy.x = 600;
  enemy.y = 340;
  engine.time = DEADLINE;
  assert.equal(defenseStatus(engine).contested, true);
  assert.ok(defenseStatus(engine).strength >= defenseStatus(engine).requiredGarrison, 'final-position failure must be caused by contest, not a weak garrison');
  engine.checkOutcome();
  assert.equal(engine.outcome, 'defeat', 'an enemy occupying the main line at dark prevents victory');
}

{
  const engine = fresh();
  const rule = engine.config.defenseObjective;
  const infantry = engine.formations.find(unit => unit.id === 'lee-advance');
  const artillery = engine.formations.find(unit => unit.id === 'knox-monmouth');
  const enemy = engine.formations.find(unit => unit.id === 'cornwallis-monmouth');
  infantry.x = artillery.x = 525;
  infantry.y = artillery.y = 340;
  enemy.x = 720;
  enemy.y = 340;
  infantry.order = 'withdraw';
  const before = defenseStatus(engine).seconds;
  updateDefense(engine, 5);
  assert.equal(defenseStatus(engine).seconds, before, 'withdrawing infantry and artillery cannot earn defense time');
  assert.ok(rule.zone.x1 <= infantry.x && infantry.x <= rule.zone.x2, 'exclusion test must place formations inside the objective');
}

{
  const engine = fresh();
  for (const unit of engine.formations.filter(unit => unit.side === 'crown')) engine.route(unit);
  engine.checkOutcome();
  assert.equal(engine.outcome, 'victory', 'routing every Crown formation remains an immediate alternative victory');
}

{
  for (const seed of [1, 123, 17780628]) {
    const result = viableDefense(seed);
    const goal = defenseStatus(result);
    assert.equal(result.outcome, 'victory', `viable main-line policy should win for seed ${seed}; ended ${result.outcome} with ${goal.seconds.toFixed(1)}s, ${Math.round(goal.fighting)} fighting, state ${goal.state}`);
    assert.ok(result.time >= DEADLINE, 'deadline defense cannot resolve early');
    assert.ok(goal.seconds >= goal.requiredSeconds - 1e-6);
    assert.ok(goal.holding && goal.fighting >= goal.requiredArmy, 'the line and half the army must still hold at dark');
  }
}

console.log('Monmouth defense passed: deadline gate, casualty rejection, final contest, exclusions, rout victory, and viable reserve commitment.');
