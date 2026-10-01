import assert from 'node:assert/strict';
import { SCENARIOS, INITIAL_STATE, applyChoice, applyBattleResult } from '../src/game/campaign.js';
import { recordedBattle, presentScenario, campaignEnding } from '../src/game/campaignNarrative.js';
import { serializeCampaign, importCampaign } from '../src/game/storage.js';
const base=id=>SCENARIOS.find(s=>s.id===id);
for(const result of ['victory','defeat','withdrawal']) {
  let s=applyBattleResult(INITIAL_STATE,'trenton',result);
  s=applyBattleResult(s,'saratoga','victory'); // A later victory must not overwrite Trenton's record.
  assert.equal(recordedBattle(s,'trenton'),result);
  const scene=presentScenario(s,base('winter_reckoning'));
  assert.equal(scene.choices[1].title==='Turn victory into credit',result==='victory');
  const next=applyChoice(s,base('winter_reckoning'),base('winter_reckoning').choices[1]);
  assert.equal(next.history.at(-1).title,scene.choices[1].title);
  assert.equal(next.history.at(-1).nominalEffects.foreign,result==='victory'?8:3);
}
for(const plan of ['delay','raids']) {
  const s={...INITIAL_STATE,flags:{trentonPlan:plan}};
  assert.equal(presentScenario(s,base('winter_reckoning')).choices[1].title,'Seek credit for rebuilding');
}
for(const result of ['defeat','withdrawal']) {
  const s=applyBattleResult(INITIAL_STATE,'saratoga',result);
  assert.ok(!presentScenario(s,base('french_alliance')).summary.startsWith('News of Burgoyne’s surrender'));
}
const north=applyChoice(INITIAL_STATE,base('chesapeake_convergence'),base('chesapeake_convergence').choices[1]);
const restored=importCampaign(serializeCampaign(north));
assert.equal(presentScenario(restored,base('yorktown_siege')).title,'The Northern Commitment');
for(const choice of base('yorktown_siege').choices) {
  const end=applyChoice(restored,base('yorktown_siege'),choice);
  assert.equal(end.completed,true);
  assert.ok(!end.flags.yorktownVictory && !end.flags.yorktownStormed && !end.flags.yorktownTerms);
  assert.match(campaignEnding(end).title,/uncertain winter/);
  assert.ok(end.history.at(-1).title.includes('New York')||/outposts|allied plan/.test(end.history.at(-1).title));
}
assert.equal(base('winter_reckoning').choices[1].title,'Turn victory into credit','Base history content not mutated');
assert.match(campaignEnding(INITIAL_STATE).title,/reckoning/);
console.log('Campaign narrative passed: specific battle records, bypass/defeat dispatches, reducer/UI parity, northern branch and save round-trip.');
