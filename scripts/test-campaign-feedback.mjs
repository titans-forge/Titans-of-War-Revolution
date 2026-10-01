import assert from 'node:assert/strict';
import {INITIAL_STATE,SCENARIOS,applyChoice,applyBattleResult,previewChoice} from '../src/game/campaign.js';
import {serializeCampaign,importCampaign} from '../src/game/storage.js';
const initial=()=>structuredClone(INITIAL_STATE),scenario=SCENARIOS[0],choice=scenario.choices[0];
const stressed={...initial(),turn:4,metrics:{...INITIAL_STATE.metrics,army:80,supply:20}};
assert.deepEqual(previewChoice(stressed,scenario,choice).effects,{army:3.5,supply:-6,support:-3,congress:3});assert.equal(previewChoice(stressed,scenario,choice).limited,true);
const poor={...initial(),turn:4,metrics:{army:0,supply:0,support:0,credit:0,congress:0,foreign:0}};
assert.deepEqual(previewChoice(poor,scenario,choice).effects,{army:9,supply:0,support:0,congress:1});
for(const value of [0,79,80,89,90,99,100])for(const result of ['victory','defeat','withdrawal']){
 const state=initial();for(const id in state.metrics)state.metrics[id]=value;
 const next=applyBattleResult(state,'trenton',result),entry=next.history.at(-1);
 for(const [id,delta] of Object.entries(entry.effects))assert.ok(Math.abs(delta-Math.round((next.metrics[id]-state.metrics[id])*10)/10)<1e-8);
}
let choices=0,battles=0,paths=0;
for(let policy=0;policy<3;policy++)for(const outcome of ['victory','defeat','withdrawal']){
 let state=initial(),steps=0;
 while(!state.completed){
  assert.ok(steps++<40,'campaign must terminate');const scenario=SCENARIOS.find(s=>s.id===state.scenarioId);assert.ok(scenario);
  const choice=scenario.choices[policy%scenario.choices.length],before=JSON.stringify(state),preview=previewChoice(state,scenario,choice);
  assert.equal(JSON.stringify(state),before,'preview never mutates live/save state');const next=applyChoice(state,scenario,choice);
  for(const [id,delta] of Object.entries(preview.effects))assert.ok(Math.abs(delta-Math.round((next.metrics[id]-state.metrics[id])*10)/10)<.11);
  state=importCampaign(serializeCampaign(next));assert.ok(state,'decision roundtrip');choices++;
  if(state.pendingBattle){const id=state.pendingBattle;state=applyBattleResult(state,id,outcome);state=importCampaign(serializeCampaign(state));assert.ok(state&&!state.pendingBattle,'resolved battle roundtrip');battles++;}
 }
 assert.ok(state.completed);paths++;
}
console.log(`Campaign feedback passed: capped gains, shortages, exhausted resources, actual battle deltas, ${paths} complete campaign routes, ${choices} decisions and ${battles} battle handoffs with save/import roundtrips.`);
