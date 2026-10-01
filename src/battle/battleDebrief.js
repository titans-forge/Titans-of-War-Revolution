export function battleDebrief(snapshot) {
  if(snapshot.objective.escape){
    const e=snapshot.objective.escape;
    const result=snapshot.outcome==='victory' ? 'The interception objective was achieved.' : snapshot.outcome==='withdrawal' ? 'The army withdrew before completing the interception.' : 'The interception objective was not met.';
    return `${result} ${Math.ceil(e.escaped)} enemy troops escaped in good order against a maximum of ${e.allowed}; ${snapshot.objective.resisting} enemy formation${snapshot.objective.resisting === 1 ? '' : 's'} still resisting. ${e.escaped>e.allowed ? 'Too many troops reached the southern exit.' : snapshot.outcome==='defeat'&&snapshot.objective.remaining<=0 ? 'Time expired before the remaining regiments broke.' : ''}`.trim();
  }
  if (snapshot.outcome === 'victory' && snapshot.objective.resisting === 0) return 'Every enemy formation has routed or left the field.';
  if (snapshot.objective.repulse) {
    const r=snapshot.objective.repulse;
    const result=snapshot.outcome==='victory' ? 'The reconnaissance was repulsed.' : snapshot.outcome==='withdrawal' ? 'The army withdrew before completing the repulse.' : 'The repulse objective was not met.';
    return `${result} Enemy columns broken ${r.broken}/${r.requiredBroken}; fighting troops ${Math.floor(r.fighting)}/${r.requiredArmy}. ${[r.broken<r.requiredBroken&&'Too few enemy columns broke.',r.fighting<r.requiredArmy&&'Too few troops remain fighting on the field.'].filter(Boolean).join(' ')}`.trim();
  }
  if (snapshot.objective.counterattack) {
    const c=snapshot.objective.counterattack;
    const result=snapshot.outcome==='victory' ? 'The defense and counterattack objective was achieved.' : snapshot.outcome==='withdrawal' ? 'The army left the field before completing the counterattack.' : 'The defense and counterattack objective was not met.';
    const missing=[!c.openingComplete && 'Opening fire incomplete.',!c.regrouped && 'Both screens must rally on the field.',!c.lineHolding && 'Howard no longer holds the Continental line.',!c.reserveViable && 'Washington must remain unbroken on the field.',c.fighting<c.requiredFighting && 'Too few troops remain fighting.'].filter(Boolean).join(' ');
    return `${result} Opening fire ${c.screens.map(s=>`${s.shots}/${s.required}`).join(' + ')}; screens rallied ${c.screens.filter(s=>s.rallied).length}/${c.screens.length}; line held ${Math.floor(c.lineSeconds+1e-6)}/${c.requiredLineSeconds}s; reserve engagement ${Math.floor(c.counterSeconds+1e-6)}/${c.requiredCounterSeconds}s with ${Math.floor(c.counterDamage)}/${c.requiredCounterDamage} enemy casualties inflicted. ${missing}`.trim();
  }
  if (snapshot.objective.defense) {
    const d = snapshot.objective.defense;
    const result = snapshot.outcome === 'victory' ? 'Defensive objective achieved.' : snapshot.outcome === 'withdrawal' ? 'The army withdrew before completing the defense.' : 'The defensive objective was not met.';
    return `${result} ${d.label} defended ${Math.floor(d.seconds+1e-6)}/${d.requiredSeconds} seconds; garrison ${Math.floor(d.strength)}/${d.requiredGarrison}; fighting troops ${Math.floor(d.fighting)}/${d.requiredArmy}. ${[d.seconds < d.requiredSeconds-1e-6 && 'The required defense time was not completed.', d.contested && 'Enemy troops contest the position.', d.strength < d.requiredGarrison && 'The position no longer has a sufficient garrison.', d.fighting < d.requiredArmy && 'Too few troops remain fighting on the field.'].filter(Boolean).join(' ')}`.trim();
  }
  if (snapshot.objective.evacuation) {
    const e=snapshot.objective.evacuation;
    return `${snapshot.outcome === 'withdrawal' ? e.kind === 'road' ? 'The army reached the Chester Road in good order.' : 'Organized evacuation completed.' : 'The evacuation objective was not met.'} ${e.screenLabel} held ${Math.floor(e.screenSeconds + 1e-6)}/${e.requiredScreen} seconds; ${Math.floor(e.saved)}/${e.required} troops saved. ${e.screenSeconds < e.requiredScreen - 1e-6 ? 'The delaying action was too short.' : ''} ${e.saved < e.required ? `Too few troops reached ${e.kind === 'road' ? 'the Chester Road' : 'the boats'} in good order.` : ''}`.trim();
  }
  if (snapshot.outcome === 'withdrawal' && snapshot.objective.remaining > 0) return 'Your remaining fighting formations left the field; at least one infantry or cavalry formation withdrew with surviving troops.';
  if (snapshot.objective.remaining <= 0) {
    const actual=Math.round(snapshot.objective.losses*100), target=Math.round(snapshot.objective.threshold*100);
    return `Time expired. Enemy losses were ${actual}% against a ${target}% threshold. ${snapshot.outcome === 'defeat' ? 'The required threshold was not reached.' : 'The required threshold was reached while a fighting formation remained.'}`;
  }
  const artilleryRemains = snapshot.formations?.some(unit => unit.side === 'continental' && unit.type === 'artillery' && unit.active && unit.status !== 'routed');
  const progress = snapshot.objective.losses >= snapshot.objective.threshold ? ' The enemy loss target was reached, but a fighting formation also had to survive until the deadline.' : '';
  return `No unbroken infantry or cavalry formation remains available.${progress}${artilleryRemains ? ' Surviving artillery alone cannot hold the field.' : ''}`;
}
