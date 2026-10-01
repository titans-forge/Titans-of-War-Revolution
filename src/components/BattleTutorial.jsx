import { useEffect, useRef, useState } from 'react';
import { advanceTutorial, freshTutorialProgress, TUTORIAL_STEPS, tutorialStepId } from '../game/tutorialProgress.js';
import './BattleTutorial.css';

const COPY = {
  select: ['Select another formation', 'Use Your formations or click a friendly formation. Different units can receive separate orders while the battle is paused.'],
  move: ['Move on the field', 'Click open ground to give the selected formation a real movement order. The destination marker confirms the order.'],
  target: ['Assign an enemy', 'Choose an active enemy under Attack target. The formation will approach that target when time runs.'],
  'effective-fire': ['Set fire discipline', 'Choose Effective range. The formation will conserve ammunition until the enemy is closer.'],
  volley: ['Request a volley', 'Use Volley. This requests one loaded shot; it does not promise that a shot has fired or hit.'],
  reform: ['Issue Reform while safe', 'While paused and away from the enemy, use Reform. Recovery needs eight uninterrupted seconds on safe ground after time resumes.'],
  fallback: ['Order an on-field fallback', 'Use Fall back. The formation moves rearward while facing the enemy, does not fire while moving, and holds when it reaches its fallback position.'],
  ready: ['Ready for battle', 'Fall back keeps a formation on the field. Withdraw sends it off the field and it cannot return. Resume when you are ready to command the battle.'],
};

export function BattleTutorial({ snapshot, selectedId, event, speed = 0, onCheckpoint, onDismiss }) {
  const [progress, setProgress] = useState(() => freshTutorialProgress(selectedId));
  const previousStep = useRef(progress.step);
  const processedSequence = useRef(null);

  useEffect(() => {
    if (!event || event.sequence === processedSequence.current) return;
    processedSequence.current = event.sequence;
    setProgress((current) => advanceTutorial(current, event, snapshot, selectedId, speed));
  }, [event, selectedId, snapshot, speed]);

  useEffect(() => {
    if (progress.step === previousStep.current) return;
    previousStep.current = progress.step;
    onCheckpoint?.(tutorialStepId(progress));
  }, [onCheckpoint, progress]);

  const id = tutorialStepId(progress);
  const [title, instruction] = COPY[id];
  return <aside className="battle-tutorial" aria-labelledby="battle-tutorial-title" aria-live="polite">
    <div className="battle-tutorial-head">
      <div><span>Command practice</span><strong>{Math.min(progress.step + 1, TUTORIAL_STEPS.length)} / {TUTORIAL_STEPS.length}</strong></div>
      <button onClick={onDismiss} aria-label="Dismiss command practice">Dismiss</button>
    </div>
    <h2 id="battle-tutorial-title">{title}</h2>
    <p>{instruction}</p>
    <progress max={TUTORIAL_STEPS.length - 1} value={progress.step}>{progress.step} of {TUTORIAL_STEPS.length - 1}</progress>
    {progress.completed && <button className="tutorial-ready" onClick={onDismiss}>Ready for battle</button>}
  </aside>;
}
