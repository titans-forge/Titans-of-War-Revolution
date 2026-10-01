export {objectiveSummary} from '../battle/objectiveSummary.js';
export function BattleObjective({goal}) {
  const e=goal.evacuation, d=goal.defense, escape=goal.escape, c=goal.counterattack, r=goal.repulse;
  return <details className="objective-progress" open><summary>Victory conditions</summary>
    {!escape && <p>Break every enemy formation for a battlefield victory.</p>}
    {r ? <>
    <p>Rout at least {r.requiredBroken} of {r.total} enemy columns and keep {r.requiredArmy} infantry/cavalry troops fighting on the field through the deadline. Routing every enemy formation wins immediately.</p>
    <progress aria-label="Enemy columns broken" value={r.broken} max={r.requiredBroken}/>
    <small>{r.broken}/{r.requiredBroken} columns broken · {Math.floor(r.fighting)}/{r.requiredArmy} fighting troops</small>
    <p>Routed enemies count even after leaving the field. Your routed, withdrawn and withdrawing troops do not count toward the army requirement. Assign a new target after each enemy rout.</p>
    </> : c ? <>
    <p>Win by executing the defense and counterattack before time expires. These stages are a compressed command challenge.</p>
    <ol className="objective-stages">
      {c.screens.map(s=><li key={s.id}><strong>{s.name}</strong><small>Opening fire {s.shots}/{s.required} · {s.rallied ? 'Rallied' : s.shots>=s.required ? 'Use Fall back to reach the rally marker' : 'Hold and use Effective range'}</small></li>)}
      <li><strong>Hold Howard’s Continental line</strong><progress aria-label="Continental line defense" value={c.lineSeconds} max={c.requiredLineSeconds}/><small>{Math.floor(c.lineSeconds+1e-6)}/{c.requiredLineSeconds}s under pressure · {!c.lineHolding ? 'Line needs Howard' : c.lineThreatened ? 'Holding under pressure' : 'Awaiting enemy pressure'} · {Math.floor(c.lineStrength)}/{c.requiredLineStrength} troops</small></li>
      <li><strong>Counterattack with Washington</strong><progress aria-label="Cavalry counterattack" value={c.counterSeconds} max={c.requiredCounterSeconds}/><small>{Math.floor(c.counterSeconds+1e-6)}/{c.requiredCounterSeconds}s engaging · {Math.floor(c.counterDamage)}/{c.requiredCounterDamage} enemy casualties inflicted after the rally</small></li>
    </ol>
    {c.regrouped && c.reserveViable && !c.reserveEngaging && c.counterSeconds<c.requiredCounterSeconds && <p>Washington needs to close with his assigned target. If another enemy is blocking him, assign that nearby enemy instead.</p>}
    <p>Cover the fallback with Washington when he arrives. Keep the rallied screens available; they can hold or rejoin the fight with an assigned target. Keep Howard in position and the reserve unbroken.</p>
    <small>Fighting troops {Math.floor(c.fighting)}/{c.requiredFighting} required</small>
    <p>Fall back keeps a formation in battle. Withdraw removes it. An off-field withdrawal cannot count as a rally.</p>
    </> : escape ? <>
    <p>Break every remaining enemy formation before time expires, while allowing no more than {escape.allowed} troops to escape in good order. Routed formations count as defeated.</p>
    <progress aria-label="Enemy escape allowance used" value={escape.escaped} max={escape.allowed}/>
    <small>{Math.ceil(escape.escaped)} / {escape.allowed} maximum escaped · {escape.open ? 'Escape underway' : `Escape begins in ${Math.ceil(escape.opensIn)}s`}</small>
    <p>Place at least {escape.requiredBlockers} unbroken infantry/cavalry troops inside the dashed southern perimeter to block departure. Artillery and withdrawing troops do not block it. Keep attacking: blocking alone does not win.</p>
    <small>Road {escape.blocked ? 'blocked' : 'open'} · {Math.floor(escape.blockingStrength)} / {escape.requiredBlockers} blocking troops</small>
    <p>After breaking a regiment, assign the next target or move to cover the exit. Shift-click occupied ground to move there.</p>
    </> : d ? <>
    <p>For a defensive victory: hold {d.label.toLowerCase()} under enemy pressure for {d.requiredSeconds} seconds in total, before time expires. Keep at least {d.requiredGarrison} infantry/cavalry troops inside and {d.requiredArmy} still fighting on the field.</p>
    {d.requireUntilDeadline && <p>After earning the defense time, keep the position held through the battle deadline. Completing the timer alone does not win.</p>}
    <progress aria-label={`${d.label} defense`} value={d.seconds} max={d.requiredSeconds}/>
    <small>{Math.floor(d.seconds+1e-6)} / {d.requiredSeconds}s · {d.state}</small>
    <small>Garrison {Math.floor(d.strength)} / {d.requiredGarrison} · Fighting troops {Math.floor(d.fighting)} / {d.requiredArmy}</small>
    <p>Enemy occupation or an insufficient garrison pauses progress; earned time is retained. Routed and withdrawing troops do not count. Formation centers must be inside the corner markers. Shift-click occupied ground to move your selected formation there.</p>
    </> : e ? <>
    <p>For a successful withdrawal: {e.kind==='road' ? `defend the marked ford approaches with at least ${e.requiredGarrison} infantry/cavalry troops` : 'screen the forward ground'} under enemy pressure for {e.requiredScreen} seconds, then save {e.required} surviving infantry/cavalry troops using Withdraw. Routed troops do not count.</p>
    <progress aria-label="Delaying action" value={e.screenSeconds} max={e.requiredScreen}/>
    <small>{e.screenLabel} {Math.floor(e.screenSeconds+1e-6)} / {e.requiredScreen}s · {e.screenState}</small>
    {e.kind==='road' && <small>Defending troops {Math.floor(e.strength)} / {e.requiredGarrison}</small>}
    <progress aria-label="Troops evacuated" value={e.saved} max={e.required}/>
    <small>{Math.floor(e.saved)} / {e.required} saved · {e.blocked ? `${e.exitLabel} blocked by enemy` : e.ready ? `${e.exitLabel} available` : `${e.exitLabel} in ${Math.ceil(e.opensIn)}s`}</small>
    {e.withdrawing>0 && e.saved>=e.required && e.screenSeconds>=e.requiredScreen-1e-6 && <p>Minimum secured. Waiting for {e.withdrawing} ordered {e.withdrawing===1 ? 'formation' : 'formations'} to finish withdrawing, or for the battle deadline.</p>}
    {e.kind==='road' && <p>Withdraw sends each formation to the circular Chester Road marker. Enemy troops within its outer dashed perimeter block departure; waiting troops remain vulnerable. Protect the road with your reserve.</p>}
    </> : <><p>At the time limit: inflict at least {Math.round(goal.threshold*100)}% enemy losses for {goal.timedResult}; otherwise defeat. Keep a non-artillery formation unbroken.</p><progress aria-label="Enemy loss threshold" value={goal.losses} max={goal.threshold}/><small>{Math.round(goal.losses*100)}% enemy losses · {Math.ceil(goal.remaining)} seconds remain</small></>}
  </details>;
}
