import { useEffect, useRef } from 'react';
export function BattleGuide({ definition, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    if (!element.open) element.showModal();
    return () => { if (element.open) element.close(); if (previous?.isConnected) previous.focus(); };
  }, []);
  return <dialog ref={dialog} className="battle-guide" aria-labelledby="battle-guide-title" onCancel={(event) => {event.preventDefault();onClose();}}>
    <button autoFocus className="guide-close" onClick={onClose}>Close guide</button>
    <h2 id="battle-guide-title">Command guide</h2>
    <p>The battle is paused. Plan your orders, then resume when ready.</p>
    <ol>
      <li><strong>Coordinate your force.</strong> Select each formation from the roster. Assign an enemy with Attack target; one brigade advancing alone can be overwhelmed. Orders can be issued while paused. The selected formation shows a destination ring and dashed order line. The line indicates your order. Formations pass around friendly ranks when space permits; an occupied destination makes them hold nearby until it clears. Fall back and Withdraw remain available to disengage. Click open ground to move; Shift-click moves even when another formation covers the destination.</li>
      <li><strong>Keep support close.</strong> Artillery can support an infantry attack. Assign a target to bring it into range; protect it with infantry.</li>
      <li><strong>Control the fire.</strong> Fire at will uses maximum range. Effective range waits until the enemy is closer. Hold fire saves ammunition; Volley requests one loaded shot. The weapon readout shows loading and queued volleys. Close combat interrupts musket fire; a queued volley waits until the formation is clear and can fire.</li>
      <li><strong>Preserve cohesion.</strong> Fall back moves a formation rearward, facing the enemy, and holds it on the field. It stops firing during the move. After reaching safe ground, Reform needs eight uninterrupted seconds to restore cohesion. Withdraw sends a formation off the field; routed units cannot take orders.</li>
      <li><strong>Read the objective.</strong> {definition.repulseObjective ? 'Rout two of the three enemy columns and preserve at least half your starting infantry/cavalry strength on the field through the deadline. Your routed and withdrawing troops do not count. Routing every enemy formation wins immediately. Casualties alone do not satisfy this objective. Commit the reserve and assign new targets after routs.' : definition.counterattackObjective ? 'Deliver the opening fire with both forward formations, then use Fall back to rally them at their marked positions. Keep Howard inside the Continental line and use Washington to cover the withdrawal and counterattack. Follow the live stage counters. Withdraw leaves the field and cannot complete the rally stage. Breaking the entire enemy army also wins.' : definition.escape ? 'Hessian regiments attempt an organized withdrawal after the displayed countdown. Put enough fighting infantry inside the southern perimeter to block departure, and keep attacking until every remaining regiment breaks. Routed troops count as defeated; organized escapes count against your allowance. Blocking the road alone cannot win at the time limit.' : definition.defenseObjective ? 'Keep a sufficient garrison inside the marked position while the enemy is in firing range. Enemy occupation pauses progress. If the objective requires holding through the deadline, completing the defense timer alone does not win. Support tired defenders before they break; the required fighting strength excludes routed and withdrawing troops. Breaking every enemy formation also wins.' : definition.evacuation?.kind === 'road' ? 'Defend the marked ford approaches with the required garrison under pressure. After completing the delaying action, use Withdraw to save enough troops through the circular Chester Road exit. Formations route around the mapped river and through its marked crossing; allow time for the longer march. An enemy inside its outer perimeter blocks departure. Routed troops do not count; breaking the enemy army remains a victory.' : definition.evacuation ? 'Delay the enemy on the forward ground, then use Withdraw to evacuate enough surviving troops. The screen timer and evacuation count are both required. Early arrivals wait for boats; routed troops do not count. Breaking every enemy formation remains an alternative victory.' : 'Breaking every enemy formation wins immediately. Otherwise the displayed time limit and loss threshold determine the result. Keeping troops alive alone may not meet the objective.'}</li>
    </ol>
    <h3>{definition.title}</h3>
    <ul>{definition.orders.map(order => <li key={order}>{order}</li>)}</ul>
    <p>Start at 1× speed. Pause often to review all formations, especially when reserves arrive.</p>
    <button onClick={onClose}>Return to the field</button>
  </dialog>;
}
export function formationAdvice(unit) {
  if (!unit) return null;
  if (!unit.active) return unit.entered ? 'This formation has left the field and cannot receive orders.' : 'This reserve has not arrived. Command it when it enters the field.';
  if (unit.status === 'routed') return 'Formation broken: it is retreating automatically and cannot take orders.';
  if (unit.cohesion < 30 || unit.morale < 30) return 'Formation under strain. Consider moving away, then Reform on safe ground, or Withdraw before it breaks.';
  if (unit.ammunition === 0) return 'Out of ammunition. This formation cannot fire; preserve it or use another formation to engage.';
  if (unit.ammunition < 10) return 'Ammunition is running low. Use Effective range or Hold fire to conserve shots.';
  return null;
}
