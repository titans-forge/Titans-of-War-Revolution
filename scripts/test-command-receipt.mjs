import assert from 'node:assert/strict';
import { TrentonEngine } from '../src/battle/trentonEngine.js';
import { issueCommand } from '../src/battle/commandReceipt.js';
import { advanceTutorial, freshTutorialProgress, tutorialStepId } from '../src/game/tutorialProgress.js';

const engine = new TrentonEngine(17761226, 'trenton');
let selectedId = 'sullivan';
let snapshot = engine.snapshot();
let progress = freshTutorialProgress('mercer');
const advance = (event, speed = 0) => {
  snapshot = engine.snapshot();
  progress = advanceTutorial(progress, event, snapshot, selectedId, speed);
};

advance({ type: 'select', unitId: selectedId, accepted: true, battleTime: snapshot.time });
assert.equal(tutorialStepId(progress), 'move');
advance(issueCommand(engine, selectedId, 'ground-move', { x: 430, y: 315 }));
assert.equal(tutorialStepId(progress), 'target');
advance(issueCommand(engine, selectedId, 'target', 'rall'));
assert.equal(tutorialStepId(progress), 'effective-fire');
advance(issueCommand(engine, selectedId, 'fire-policy', 'effective'));
assert.equal(tutorialStepId(progress), 'volley');
advance(issueCommand(engine, selectedId, 'order', 'volley'));
assert.equal(tutorialStepId(progress), 'reform');
const reform = issueCommand(engine, selectedId, 'order', 'reform');
assert.equal(reform.safeGround, true);
advance(reform);
assert.equal(tutorialStepId(progress), 'fallback');
advance(issueCommand(engine, selectedId, 'order', 'fallback'));
assert.equal(tutorialStepId(progress), 'ready');
assert.equal(progress.completed, true);

const rejected = new TrentonEngine(7, 'trenton');
assert.equal(issueCommand(rejected, 'rall', 'order', 'hold'), null, 'enemy formations cannot receive player commands');
assert.equal(issueCommand(rejected, 'missing', 'order', 'hold'), null);
assert.equal(issueCommand(rejected, 'mercer', 'ground-move', { x: NaN, y: 20 }), null);
const mercer = rejected.formations.find((unit) => unit.id === 'mercer');
assert.equal(issueCommand(rejected, 'mercer', 'ground-move', { x: mercer.x, y: mercer.y }), null, 'zero-distance movement is not acknowledged');
mercer.x = 55;
mercer.y = 45;
mercer.target = { x: 55, y: 45 };
assert.equal(issueCommand(rejected, 'mercer', 'ground-move', { x: -100, y: -100 }), null, 'a clamped destination at the current position is not acknowledged');
assert.equal(issueCommand(rejected, 'mercer', 'target', 'missing'), null);
assert.equal(issueCommand(rejected, 'mercer', 'formation', 'line'), null, 'unchanged formation is not acknowledged');
assert.equal(issueCommand(rejected, 'knox', 'formation', 'column'), null, 'artillery has no infantry formation control');
rejected.order('mercer', 'reform');
assert.equal(issueCommand(rejected, 'mercer', 'order', 'reform'), null, 'an already-running reform is not acknowledged again');
rejected.formations.find((unit) => unit.id === 'sullivan').status = 'routed';
assert.equal(issueCommand(rejected, 'sullivan', 'order', 'hold'), null);
rejected.outcome = 'defeat';
assert.equal(issueCommand(rejected, 'mercer', 'order', 'hold'), null);

const targetReuse = new TrentonEngine(17, 'trenton');
assert.ok(issueCommand(targetReuse, 'sullivan', 'target', 'rall'));
assert.ok(issueCommand(targetReuse, 'sullivan', 'target', 'rall'), 'a repeated order against a valid target is received');
const rall = targetReuse.formations.find((unit) => unit.id === 'rall');
rall.status = 'routed';
assert.equal(issueCommand(targetReuse, 'sullivan', 'target', 'rall'), null, 'a stale routed targetId is not acknowledged');
rall.status = 'steady';
rall.active = false;
assert.equal(issueCommand(targetReuse, 'sullivan', 'target', 'rall'), null, 'an inactive target is not acknowledged');
targetReuse.formations = targetReuse.formations.filter((unit) => unit.id !== 'rall');
assert.equal(issueCommand(targetReuse, 'sullivan', 'target', 'rall'), null, 'a missing target is not acknowledged even when targetId is stale');

const unsafe = new TrentonEngine(8, 'trenton');
const trainee = unsafe.formations.find((unit) => unit.id === 'sullivan');
const enemy = unsafe.formations.find((unit) => unit.id === 'rall');
enemy.x = trainee.x + 100;
enemy.y = trainee.y;
const unsafeReform = issueCommand(unsafe, trainee.id, 'order', 'reform');
assert.equal(unsafeReform.safeGround, false);
let reformProgress = { step: 5, initialSelectedId: 'mercer', completed: false };
reformProgress = advanceTutorial(reformProgress, unsafeReform, unsafe.snapshot(), trainee.id, 0);
assert.equal(tutorialStepId(reformProgress), 'reform');

const validSnapshot = new TrentonEngine(9, 'trenton').snapshot();
const moveProgress = { step: 1, initialSelectedId: 'mercer', completed: false };
const moveEvent = { type: 'ground-move', unitId: 'sullivan', target: { x: 400, y: 300 }, order: 'advance', accepted: true, battleTime: validSnapshot.time };
const missingSnapshot = { ...validSnapshot, formations: validSnapshot.formations.filter((unit) => unit.id !== 'sullivan') };
assert.deepEqual(advanceTutorial(moveProgress, moveEvent, missingSnapshot, 'sullivan'), moveProgress, 'a disappeared selection cannot advance');
assert.deepEqual(advanceTutorial(moveProgress, { ...moveEvent, battleTime: validSnapshot.time - 1 }, validSnapshot, 'sullivan'), moveProgress, 'a stale receipt cannot replay against a newer snapshot');

console.log('Command receipts passed: real Trenton tutorial sequence plus malformed, enemy, routed, ended, unsafe, stale and missing-unit rejection.');
