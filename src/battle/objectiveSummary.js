export function objectiveSummary(goal) {
  if(goal.repulse){const r=goal.repulse;return `${Math.ceil(goal.remaining)}s left · Columns broken ${r.broken}/${r.requiredBroken} · Fighting troops ${Math.floor(r.fighting)}/${r.requiredArmy} · Hold through deadline`;}
  if(goal.counterattack){const c=goal.counterattack;return `${Math.ceil(goal.remaining)}s left · ${c.phase} · Opening fire ${c.screens.map(s=>`${s.shots}/${s.required}`).join(" + ")} · Rallied ${c.screens.filter(s=>s.rallied).length}/${c.screens.length}`;}
  if(goal.escape){const e=goal.escape;return `${Math.ceil(goal.remaining)}s left · Escaped ${Math.ceil(e.escaped)}/${e.allowed} maximum · ${e.open ? 'Escape underway' : `Escape in ${Math.ceil(e.opensIn)}s`} · Road ${e.blocked ? 'blocked' : 'open'}`;}
  if(goal.defense){const d=goal.defense;return `${Math.ceil(goal.remaining)}s left · ${d.label} ${Math.floor(d.seconds+1e-6)}/${d.requiredSeconds}s · ${d.state}`;}
  if(goal.evacuation){const e=goal.evacuation;return `${Math.ceil(goal.remaining)}s left · ${e.screenLabel} ${Math.floor(e.screenSeconds+1e-6)}/${e.requiredScreen}s · Saved ${Math.floor(e.saved)}/${e.required} troops · ${e.blocked ? e.exitLabel+' blocked' : e.ready ? e.exitLabel+' available' : e.exitLabel+' in '+Math.ceil(e.opensIn)+'s'}`;}
  return `${Math.ceil(goal.remaining)}s left · ${goal.resisting} enemy formations resisting · ${Math.round(goal.losses*100)}% / ${Math.round(goal.threshold*100)}% timed loss target`;
}
