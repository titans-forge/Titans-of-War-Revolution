export const TUTORIAL_STEPS = [
  'select',
  'move',
  'target',
  'effective-fire',
  'volley',
  'reform',
  'fallback',
  'ready',
];

export function freshTutorialProgress(initialSelectedId = null) {
  return { step: 0, initialSelectedId, completed: false };
}

const selectedUnit = (snapshot, selectedId) => snapshot?.formations?.find((unit) => unit.id === selectedId && unit.side === 'continental');
const acceptedForSelected = (event, selectedId) => event?.accepted === true && event.unitId === selectedId;

export function advanceTutorial(progress, event, snapshot, selectedId, speed = 0) {
  if (!event || progress.completed) return progress;
  const unit = selectedUnit(snapshot, selectedId);
  if (!unit?.active || unit.status !== 'steady') return progress;
  if (Number.isFinite(event.battleTime) && event.battleTime !== snapshot?.time) return progress;
  let accepted = false;

  switch (TUTORIAL_STEPS[progress.step]) {
    case 'select':
      accepted = event.type === 'select' && event.accepted === true && event.unitId === selectedId
        && event.unitId !== progress.initialSelectedId;
      break;
    case 'move':
      accepted = acceptedForSelected(event, selectedId) && event.type === 'ground-move'
        && Number.isFinite(event.target?.x) && Number.isFinite(event.target?.y) && event.order === 'advance';
      break;
    case 'target':
      accepted = acceptedForSelected(event, selectedId) && event.type === 'target'
        && typeof event.targetId === 'string' && event.targetId.length > 0 && event.order === 'attack';
      break;
    case 'effective-fire':
      accepted = acceptedForSelected(event, selectedId) && event.type === 'fire-policy'
        && event.policy === 'effective' && event.confirmedPolicy === 'effective';
      break;
    case 'volley':
      accepted = acceptedForSelected(event, selectedId) && event.type === 'order'
        && event.order === 'volley' && event.volleyRequested === true;
      break;
    case 'reform':
      accepted = speed === 0 && acceptedForSelected(event, selectedId) && event.type === 'order'
        && event.order === 'reform' && event.reformRemaining > 0 && event.safeGround === true;
      break;
    case 'fallback':
      accepted = acceptedForSelected(event, selectedId) && event.type === 'order'
        && event.order === 'fallback' && event.confirmedOrder === 'fallback';
      break;
    default:
      return progress;
  }

  if (!accepted) return progress;
  const step = progress.step + 1;
  return { ...progress, step, completed: TUTORIAL_STEPS[step] === 'ready' };
}

export function tutorialStepId(progress) {
  return TUTORIAL_STEPS[progress.step] || 'ready';
}
