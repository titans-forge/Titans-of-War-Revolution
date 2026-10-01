// Campaign dispatches describe this playthrough; historical primers remain separate.
export function recordedBattle(state, id) {
  return state.history?.findLast(entry => entry.scenarioId === `${id}_battle`)?.choiceId || null;
}
export function presentScenario(state, base) {
  const scenario = { ...base, choices: base.choices.map(choice => ({ ...choice })) };
  if (base.id === 'brooklyn_evacuation') {
    const result=recordedBattle(state,'long_island');
    if(result==='withdrawal'){
      scenario.title='After the East River Crossing';scenario.location='Continental camps, Manhattan';
      scenario.summary='Your delaying action succeeded and the required troops crossed the East River. The saved formations now need rest, supplies and new positions. Decide how to use the army you preserved.';
      const followups=[
        ['Reorganize the evacuated army','Restore the surviving formations, account for stores and prepare an orderly defense of Manhattan.',{brooklynEvacuated:true}],
        ['Prepare an immediate counterstroke','Commit the exhausted survivors to renewed operations across the river, accepting the cost of an early offensive.',{manhattanCounterstroke:true}],
        ['Prioritize troops over replacement stores','Concentrate on restoring the soldiers while writing off lost equipment and accepting the financial cost.',{menBeforeStores:true}],
      ];
      scenario.choices=scenario.choices.map((choice,index)=>({...choice,title:followups[index][0],text:followups[index][1],flags:followups[index][2]}));
    }else if(result==='victory'){
      scenario.summary='Your force won the engagement on Long Island, but British naval control still threatens the army’s position across the East River. Decide whether to use the time gained for an evacuation or risk another day on the Brooklyn lines.';
    }
  }
  if (base.id === 'winter_reckoning') {
    const result = recordedBattle(state, 'trenton');
    if (result !== 'victory') {
      scenario.title = 'A Winter Army to Preserve';
      scenario.summary = result === 'defeat' ? 'The attack at Trenton failed. Rebuild the surviving army and restore confidence without claiming a victory your force did not win.' : result === 'withdrawal' ? 'Your army disengaged at Trenton. Winter quarters, enlistments and honest dispatches now matter more than promises of a decisive victory.' : state.flags?.trentonPlan === 'raids' ? 'Scattered raids kept pressure on the posts, but your main army did not fight the battle of Trenton. Decide how to sustain resistance through winter.' : 'You delayed the attack at Trenton. The army has avoided that gamble, but there is no battlefield victory to present to creditors.';
      scenario.choices[1] = { ...scenario.choices[1], title: 'Seek credit for rebuilding', text: 'Present an honest account of the army’s condition and seek support for another campaign.', effects: { credit: 4, foreign: 3, army: -2 } };
    }
  }
  if (base.id === 'french_alliance' && recordedBattle(state,'saratoga') !== 'victory') {
    scenario.title = 'Negotiating for French Support';
    scenario.summary = recordedBattle(state,'saratoga') === 'defeat' ? 'Your force was defeated at Bemis Heights. The commissioners must negotiate from that setback, using the wider war and France’s interests to argue for assistance. Your command has not secured Burgoyne’s surrender.' : 'Your northern strategy avoided a decisive battlefield victory at Bemis Heights. The commissioners must turn continued resistance and diplomatic preparation into French support; a surrender has not been established by your campaign record.';
  }
  if (base.id === 'yorktown_siege' && state.flags?.newYorkPriority) {
    scenario.title = 'The Northern Commitment'; scenario.location = 'Allied headquarters near New York';
    scenario.actor = 'Continental council of war';
    scenario.summary = 'You kept the main effort against New York. Your army has not joined the historical concentration at Yorktown. Decide how to sustain the northern position as the campaign season closes.';
    scenario.choices = [
      {id:'a',advisor:'professional',title:'Prepare winter lines outside New York',text:'Preserve the army, consolidate the camps and acknowledge that the war remains unresolved.',effects:{army:5,supply:-3,support:-3},flags:{northernWinter:true},next:null},
      {id:'b',advisor:'firebrand',title:'Press the outposts before winter',text:'Risk a limited offensive to maintain pressure without claiming a decisive siege victory.',effects:{army:-7,supply:-6,support:5},flags:{northernPressure:true},next:null},
      {id:'c',advisor:'diplomat',title:'Rebuild the allied plan for another campaign',text:'Repair coordination and seek credit for a future combined operation.',effects:{foreign:5,credit:3,supply:-2},flags:{northernDiplomacy:true},next:null},
    ];
  }
  return scenario;
}
export function campaignEnding(state) {
  if (state.flags?.newYorkPriority) return { place:'New York front · October 1781', title:'The northern army enters another uncertain winter.', text:'You maintained the northern commitment. This campaign ends without a recorded decisive surrender at Yorktown. The ledger assesses the army and political resources you preserved for an unresolved war.' };
  if (state.flags?.yorktownVictory || state.flags?.yorktownTerms) return {place:'Yorktown · October 1781',title:'Your siege campaign reaches its settlement.',text:'Your final council chose a coordinated siege or negotiated terms. This is the strategic resolution of your campaign, not a separately played tactical siege. The ledger records what your command preserved and consumed.'};
  if (state.flags?.yorktownStormed) return {place:'Yorktown · October 1781',title:'Your assault closes a costly campaign.',text:'You chose an immediate general assault and paid its recorded cost. The campaign does not simulate that siege tactically or establish an automatic surrender; your command is judged by the resources and institutions left standing.'};
  return {place:'Campaign assessment · October 1781',title:'Your campaign reaches its reckoning.',text:'Review the decisions and recorded outcomes below. Completion of the timeline does not itself establish a decisive military victory.'};
}
