import assert from 'node:assert/strict';
import { applyBattleResult, applyChoice, applyMetricDelta, campaignGrade, campaignReport, INITIAL_STATE, resolveChoiceEffects, SCENARIOS } from '../src/game/campaign.js';
import { TrentonEngine } from '../src/battle/trentonEngine.js';
import { importCampaign, migrateCampaign, SAVE_VERSION, serializeCampaign } from '../src/game/storage.js';

const first = SCENARIOS[0];
const advanced = applyChoice(INITIAL_STATE, first, first.choices[0]);
assert.equal(advanced.scenarioId, 'continental_command');
assert.equal(advanced.metrics.army, 44);
assert.equal(INITIAL_STATE.metrics.army, 34, 'campaign reducer must not mutate initial state');

const resolutionScenario = SCENARIOS.find((scenario) => scenario.id === 'independence_question');
const resolutionState = applyChoice({ ...INITIAL_STATE, flags: { dualPolicy: true } }, resolutionScenario, resolutionScenario.choices[0]);
assert.equal(resolutionState.scenarioId, 'independence_vote');
assert.equal(resolutionState.flags.consensusBuilt, true);
assert.equal(resolutionState.history[0].modifiers.length, 1, 'the 1775 reconciliation choice must affect coalition building');
const independenceVote = SCENARIOS.find((scenario) => scenario.id === 'independence_vote');
const independenceState = applyChoice(resolutionState, independenceVote, independenceVote.choices[0]);
assert.equal(independenceState.scenarioId, 'declaration_publication');
assert.equal(independenceState.flags.declaredIndependence, true);
assert.equal(independenceState.flags.newYorkDoorOpen, true);
assert.equal(independenceState.history.at(-1).modifiers.length, 1, 'consensus building must improve the July 2 vote');
const declarationScenario = SCENARIOS.find((scenario) => scenario.id === 'declaration_publication');
assert.equal(declarationScenario.interlude, true);
assert.equal(declarationScenario.choices.length, 1);
const declarationState = applyChoice(independenceState, declarationScenario, declarationScenario.choices[0]);
assert.equal(declarationState.scenarioId, 'new_york_defense');
assert.equal(declarationState.flags.declarationPublished, true);

const victory = applyBattleResult(INITIAL_STATE, 'trenton', 'victory');
assert.equal(victory.scenarioId, 'winter_reckoning');
assert.equal(victory.metrics.support, 76);
const trentonScenario = SCENARIOS.find((scenario) => scenario.id === 'delaware_gamble');
const trentonPlan = applyChoice(INITIAL_STATE, trentonScenario, trentonScenario.choices[0]);
assert.equal(trentonPlan.pendingBattle, 'trenton');
assert.equal(applyBattleResult(trentonPlan, 'trenton', 'victory').pendingBattle, false);
const bunkerScenario = SCENARIOS.find((scenario) => scenario.id === 'bunker_hill_council');
const bunkerPlan = applyChoice(INITIAL_STATE, bunkerScenario, bunkerScenario.choices[0]);
assert.equal(bunkerPlan.pendingBattle, 'bunker_hill');
assert.equal(applyBattleResult(bunkerPlan, 'bunker_hill', 'withdrawal').scenarioId, 'olive_branch');
const longIslandScenario = SCENARIOS.find((scenario) => scenario.id === 'long_island_council');
const longIslandPlan = applyChoice(INITIAL_STATE, longIslandScenario, longIslandScenario.choices[0]);
assert.equal(longIslandPlan.pendingBattle, 'long_island');
assert.equal(applyBattleResult(longIslandPlan, 'long_island', 'withdrawal').scenarioId, 'brooklyn_evacuation');
const brooklynScenario = SCENARIOS.find((scenario) => scenario.id === 'brooklyn_evacuation');
const brooklynEvacuation = brooklynScenario.choices[0];
assert.deepEqual(resolveChoiceEffects(INITIAL_STATE, brooklynEvacuation), { effects: brooklynEvacuation.effects, appliedModifiers: [] });
const preparedState = { ...INITIAL_STATE, flags: { evacuationPrepared: true } };
const preparedEffects = resolveChoiceEffects(preparedState, brooklynEvacuation);
assert.equal(preparedEffects.effects.army, 13);
assert.equal(preparedEffects.effects.supply, -3);
assert.equal(preparedEffects.appliedModifiers[0].flag, 'evacuationPrepared');
const preparedEvacuation = applyChoice(preparedState, brooklynScenario, brooklynEvacuation);
assert.equal(preparedEvacuation.metrics.army, 47);
assert.equal(preparedEvacuation.history[0].modifiers.length, 1);
const brandywineScenario = SCENARIOS.find((scenario) => scenario.id === 'philadelphia_campaign');
const brandywinePlan = applyChoice(INITIAL_STATE, brandywineScenario, brandywineScenario.choices[0]);
assert.equal(brandywinePlan.pendingBattle, 'brandywine');
assert.equal(applyBattleResult(brandywinePlan, 'brandywine', 'withdrawal').scenarioId, 'northern_department');
const saratogaScenario = SCENARIOS.find((scenario) => scenario.id === 'saratoga_council');
const saratogaPlan = applyChoice(INITIAL_STATE, saratogaScenario, saratogaScenario.choices[0]);
assert.equal(saratogaPlan.pendingBattle, 'saratoga');
assert.equal(applyBattleResult(saratogaPlan, 'saratoga', 'victory').scenarioId, 'french_alliance');
const allianceScenario = SCENARIOS.find((scenario) => scenario.id === 'french_alliance');
assert.equal(applyChoice(INITIAL_STATE, allianceScenario, allianceScenario.choices[0]).scenarioId, 'valley_forge_crisis');
const monmouthScenario = SCENARIOS.find((scenario) => scenario.id === 'monmouth_council');
const monmouthPlan = applyChoice(INITIAL_STATE, monmouthScenario, monmouthScenario.choices[0]);
assert.equal(monmouthPlan.pendingBattle, 'monmouth');
assert.equal(applyBattleResult(monmouthPlan, 'monmouth', 'victory').scenarioId, 'coalition_reckoning');
const coalitionScenario = SCENARIOS.find((scenario) => scenario.id === 'coalition_reckoning');
assert.equal(applyChoice(INITIAL_STATE, coalitionScenario, coalitionScenario.choices[0]).scenarioId, 'frontier_strategy');
const cowpensScenario = SCENARIOS.find((scenario) => scenario.id === 'cowpens_council');
const cowpensPlan = applyChoice(INITIAL_STATE, cowpensScenario, cowpensScenario.choices[0]);
assert.equal(cowpensPlan.pendingBattle, 'cowpens');
assert.equal(applyBattleResult(cowpensPlan, 'cowpens', 'victory').scenarioId, 'carolinas_reckoning');
const yorktownScenario = SCENARIOS.find((scenario) => scenario.id === 'yorktown_siege');
assert.equal(applyChoice(INITIAL_STATE, yorktownScenario, yorktownScenario.choices[0]).completed, true);
assert.equal(campaignGrade({ army: 80, supply: 80, credit: 80, support: 80, foreign: 80, congress: 80 }), 'A');
assert.equal(applyMetricDelta(90, 10), 92, 'positive gains above 90 must have diminishing returns');
assert.equal(applyMetricDelta(90, -10), 80, 'costs must remain fully applied');
const report = campaignReport({ army: 80, supply: 70, credit: 60, support: 75, foreign: 85, congress: 78 }, advanced.history);
assert.equal(report.categories.length, 4);
assert.ok(report.categories.every((category) => /^[A-F]$/.test(category.grade)));

const versionThreeSave = migrateCampaign({ version: 3, state: { ...INITIAL_STATE, scenarioId: 'winter_reckoning', completed: true } });
assert.equal(versionThreeSave.scenarioId, 'philadelphia_campaign');
assert.equal(versionThreeSave.completed, false);
assert.equal(versionThreeSave.version, SAVE_VERSION);
const versionFourSave = migrateCampaign({ version: 4, state: { ...INITIAL_STATE, scenarioId: 'french_alliance', completed: true } });
assert.equal(versionFourSave.scenarioId, 'valley_forge_crisis');
assert.equal(versionFourSave.completed, false);
const versionFiveSave = migrateCampaign({ version: 5, state: { ...INITIAL_STATE, scenarioId: 'coalition_reckoning', completed: true } });
assert.equal(versionFiveSave.scenarioId, 'frontier_strategy');
assert.equal(versionFiveSave.completed, false);
assert.equal(versionFiveSave.version, SAVE_VERSION);
assert.equal(migrateCampaign({ version: 99, state: INITIAL_STATE }), null);
assert.equal(migrateCampaign({ version: 4, state: { ...INITIAL_STATE, scenarioId: 'missing_stage' } }), null);
assert.deepEqual(importCampaign(serializeCampaign(advanced)), migrateCampaign({ version: SAVE_VERSION, state: advanced }));
assert.equal(importCampaign('not json'), null);

const engineA = new TrentonEngine(12);
const engineB = new TrentonEngine(12);
engineA.order('mercer', 'advance');
engineB.order('mercer', 'advance');
for (let index = 0; index < 200; index += 1) {
  engineA.tick(0.1);
  engineB.tick(0.1);
}
assert.deepEqual(engineA.snapshot(), engineB.snapshot(), 'battle snapshots must be deterministic for equal seeds and orders');
assert.ok(engineA.snapshot().formations.every((unit) => unit.strength >= 0));
assert.ok(engineA.snapshot().formations.every((unit) => typeof unit.terrain === 'string'));
const suppliedEngine = new TrentonEngine(12, 'trenton', { metrics: { army: 80, supply: 90, support: 75 }, flags: { steubenSystem: true } });
const neutralMercer = new TrentonEngine(12, 'trenton').snapshot().formations.find((unit) => unit.id === 'mercer');
const suppliedMercer = suppliedEngine.snapshot().formations.find((unit) => unit.id === 'mercer');
assert.ok(suppliedMercer.ammunition > neutralMercer.ammunition, 'campaign supply must change battlefield ammunition');
assert.ok(suppliedMercer.cohesion > neutralMercer.cohesion, 'campaign army quality and reforms must change battlefield cohesion');

const bunkerA = new TrentonEngine(1775, 'bunker_hill');
const bunkerB = new TrentonEngine(1775, 'bunker_hill');
for (let index = 0; index < 120; index += 1) {
  bunkerA.tick(0.1);
  bunkerB.tick(0.1);
}
assert.deepEqual(bunkerA.snapshot(), bunkerB.snapshot(), 'Bunker Hill must also replay deterministically');

const islandA = new TrentonEngine(1776, 'long_island');
const islandB = new TrentonEngine(1776, 'long_island');
assert.equal(islandA.snapshot().formations.find((unit) => unit.id === 'clinton-flank').active, false);
for (let index = 0; index < 290; index += 1) {
  islandA.tick(0.1);
  islandB.tick(0.1);
}
assert.equal(islandA.snapshot().formations.find((unit) => unit.id === 'clinton-flank').active, true);
assert.deepEqual(islandA.snapshot(), islandB.snapshot(), 'Long Island reinforcement timing must replay deterministically');

for (const battleId of ['brandywine', 'saratoga', 'monmouth', 'cowpens']) {
  const firstEngine = new TrentonEngine(1777, battleId);
  const secondEngine = new TrentonEngine(1777, battleId);
  for (let index = 0; index < 180; index += 1) {
    firstEngine.tick(0.1);
    secondEngine.tick(0.1);
  }
  assert.deepEqual(firstEngine.snapshot(), secondEngine.snapshot(), `${battleId} must replay deterministically`);
}

const saratogaReserve = new TrentonEngine(17771007, 'saratoga');
assert.equal(saratogaReserve.snapshot().formations.find((unit) => unit.id === 'lincoln-reserve').active, false);
for (let index = 0; index < 250; index += 1) saratogaReserve.tick(0.1);
assert.equal(saratogaReserve.snapshot().formations.find((unit) => unit.id === 'lincoln-reserve').active, true);

const monmouthReserve = new TrentonEngine(17780628, 'monmouth');
assert.equal(monmouthReserve.snapshot().formations.find((unit) => unit.id === 'washington-main').active, false);
for (let index = 0; index < 210; index += 1) monmouthReserve.tick(0.1);
assert.equal(monmouthReserve.snapshot().formations.find((unit) => unit.id === 'washington-main').active, true);

const cowpensReserve = new TrentonEngine(17810117, 'cowpens');
assert.equal(cowpensReserve.snapshot().formations.find((unit) => unit.id === 'washington-cavalry').active, false);
for (let index = 0; index < 240; index += 1) cowpensReserve.tick(0.1);
assert.equal(cowpensReserve.snapshot().formations.find((unit) => unit.id === 'washington-cavalry').active, true);

console.log('Campaign and Trenton engine tests passed.');
