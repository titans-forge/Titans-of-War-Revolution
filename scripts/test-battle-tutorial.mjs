import assert from 'node:assert/strict';
import { advanceTutorial, freshTutorialProgress, tutorialStepId } from '../src/game/tutorialProgress.js';

const formations = [
  { id: 'mercer', side: 'continental', active: true, status: 'steady' },
  { id: 'sullivan', side: 'continental', active: true, status: 'steady' },
  { id: 'rall', side: 'crown', active: true, status: 'steady' },
];
const snapshot = { formations };
let progress = freshTutorialProgress('mercer');
const unchanged = (event, selected = 'mercer', speed = 0) => assert.deepEqual(advanceTutorial(progress, event, snapshot, selected, speed), progress);

unchanged({ type: 'select', unitId: 'sullivan', accepted: false }, 'sullivan');
unchanged({ type: 'select', unitId: 'mercer', accepted: true });
progress = advanceTutorial(progress, { type: 'select', unitId: 'sullivan', accepted: true }, snapshot, 'sullivan');
assert.equal(tutorialStepId(progress), 'move');

unchanged({ type: 'ground-move', unitId: 'sullivan', accepted: true, target: { x: NaN, y: 300 }, order: 'advance' }, 'sullivan');
progress = advanceTutorial(progress, { type: 'ground-move', unitId: 'sullivan', accepted: true, target: { x: 420, y: 300 }, order: 'advance' }, snapshot, 'sullivan');
assert.equal(tutorialStepId(progress), 'target');

progress = advanceTutorial(progress, { type: 'target', unitId: 'sullivan', targetId: 'rall', accepted: true, order: 'attack' }, snapshot, 'sullivan');
assert.equal(tutorialStepId(progress), 'effective-fire');
progress = advanceTutorial(progress, { type: 'fire-policy', unitId: 'sullivan', policy: 'effective', confirmedPolicy: 'effective', accepted: true }, snapshot, 'sullivan');
assert.equal(tutorialStepId(progress), 'volley');

unchanged({ type: 'order', unitId: 'sullivan', order: 'volley', volleyRequested: false, accepted: true }, 'sullivan');
progress = advanceTutorial(progress, { type: 'order', unitId: 'sullivan', order: 'volley', volleyRequested: true, accepted: true }, snapshot, 'sullivan');
assert.equal(tutorialStepId(progress), 'reform');

unchanged({ type: 'order', unitId: 'sullivan', order: 'reform', reformRemaining: 8, safeGround: true, accepted: true }, 'sullivan', 1);
unchanged({ type: 'order', unitId: 'sullivan', order: 'reform', reformRemaining: 8, safeGround: false, accepted: true }, 'sullivan');
progress = advanceTutorial(progress, { type: 'order', unitId: 'sullivan', order: 'reform', reformRemaining: 8, safeGround: true, accepted: true }, snapshot, 'sullivan');
assert.equal(tutorialStepId(progress), 'fallback');

unchanged({ type: 'order', unitId: 'sullivan', order: 'withdraw', confirmedOrder: 'withdraw', accepted: true }, 'sullivan');
progress = advanceTutorial(progress, { type: 'order', unitId: 'sullivan', order: 'fallback', confirmedOrder: 'fallback', accepted: true }, snapshot, 'sullivan');
assert.equal(tutorialStepId(progress), 'ready');
assert.equal(progress.completed, true);
assert.deepEqual(advanceTutorial(progress, { type: 'order', unitId: 'sullivan', order: 'withdraw', accepted: true }, snapshot, 'sullivan'), progress);

console.log('Battle tutorial passed: seven confirmed checkpoints, rejected fake/unsafe actions, truthful fallback and Withdraw boundary.');
