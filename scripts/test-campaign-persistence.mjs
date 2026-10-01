import assert from 'node:assert/strict';
import { applyBattleResult, applyChoice, BATTLE_DESTINATIONS, INITIAL_STATE, SCENARIOS } from '../src/game/campaign.js';
import { campaignEnding, presentScenario, recordedBattle } from '../src/game/campaignNarrative.js';
import { clearCampaign, importCampaign, importCampaignResult, loadCampaign, migrateCampaign, saveCampaign, serializeCampaign, STORAGE_KEY } from '../src/game/storage.js';

const scenarioById = new Map(SCENARIOS.map((scenario) => [scenario.id, scenario]));
const memory = new Map();
const storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: (key) => memory.delete(key) };

let state = applyChoice(INITIAL_STATE, scenarioById.get('concord_aftermath'), scenarioById.get('concord_aftermath').choices[0]);
state = { ...state, scenarioId: 'delaware_gamble', turn: 13 };
state = applyChoice(state, scenarioById.get('delaware_gamble'), scenarioById.get('delaware_gamble').choices[0]);
assert.equal(state.pendingBattle, 'trenton');
assert.deepEqual(importCampaign(serializeCampaign(state)), { ...state, version: 6 });
assert.equal(saveCampaign(state, storage).ok, true);
assert.deepEqual(loadCampaign(storage), { ...state, version: 6 });
assert.equal(clearCampaign(storage).ok, true);
assert.equal(memory.has(STORAGE_KEY), false);

const denied = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); }, removeItem() { throw new Error('denied'); } };
assert.equal(saveCampaign(state, denied).ok, false);
assert.match(saveCampaign(state, denied).error, /Export/);
assert.equal(loadCampaign(denied), null);
assert.equal(clearCampaign(denied).ok, false);
assert.doesNotThrow(() => serializeCampaign(state));

// Some denied/sandboxed origins throw while reading the localStorage getter itself.
const originalStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
try {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new DOMException('denied', 'SecurityError'); } });
  assert.equal(saveCampaign(state).ok, false);
  assert.equal(loadCampaign(), null);
  assert.equal(clearCampaign().ok, false);
} finally {
  if (originalStorageDescriptor) Object.defineProperty(globalThis, 'localStorage', originalStorageDescriptor);
  else delete globalThis.localStorage;
}

const validPayload = JSON.parse(serializeCampaign(state));
const malformedCases = [
  ['invalid JSON', '{', /valid JSON/],
  ['wrong product', JSON.stringify({ ...validPayload, product: 'Another game' }), /different product/],
  ['future version', JSON.stringify({ ...validPayload, version: 999 }), /version|structure/],
  ['unknown scenario', JSON.stringify({ ...validPayload, state: { ...validPayload.state, scenarioId: 'made_up' } }), /unknown campaign scenario/],
  ['wrong metric type', JSON.stringify({ ...validPayload, state: { ...validPayload.state, metrics: { ...validPayload.state.metrics, army: 'high' } } }), /metrics/],
  ['out-of-range metric', JSON.stringify({ ...validPayload, state: { ...validPayload.state, metrics: { ...validPayload.state.metrics, supply: 101 } } }), /metrics/],
  ['unknown metric', JSON.stringify({ ...validPayload, state: { ...validPayload.state, metrics: { ...validPayload.state.metrics, morale: 50 } } }), /metrics/],
  ['missing current metric', JSON.stringify({ ...validPayload, state: { ...validPayload.state, metrics: { army: 50 } } }), /metrics/],
  ['unknown pending battle', JSON.stringify({ ...validPayload, state: { ...validPayload.state, pendingBattle: 'yorktown' } }), /pending battle/],
  ['invalid battle result', JSON.stringify({ ...validPayload, state: { ...validPayload.state, battleResult: 'triumph' } }), /battle result/],
  ['invalid flag value', JSON.stringify({ ...validPayload, state: { ...validPayload.state, flags: { broken: { nested: true } } } }), /flags/],
  ['forged history choice', JSON.stringify({ ...validPayload, state: { ...validPayload.state, history: [{ scenarioId: 'concord_aftermath', choiceId: 'z', title: 'Forged', effects: {} }] } }), /history/],
  ['forged battle history', JSON.stringify({ ...validPayload, state: { ...validPayload.state, history: [{ scenarioId: 'trenton_battle', choiceId: 'perfect', title: 'Forged', effects: {} }] } }), /history/],
  ['completed pending battle', JSON.stringify({ ...validPayload, state: { ...validPayload.state, completed: true } }), /completed campaign/],
];
for (const [label, text, errorPattern] of malformedCases) {
  const result = importCampaignResult(text);
  assert.equal(result.state, null, label);
  assert.match(result.error, errorPattern, label);
}
assert.equal(migrateCampaign(null), null);

for (const scenario of SCENARIOS) {
  assert.equal(new Set(scenario.choices.map((choice) => choice.id)).size, scenario.choices.length, `${scenario.id} has duplicate choice IDs`);
  for (const choice of scenario.choices) {
    const seedState = { ...structuredClone(INITIAL_STATE), scenarioId: scenario.id, turn: Math.min(SCENARIOS.indexOf(scenario) + 1, SCENARIOS.length) };
    const first = applyChoice(seedState, scenario, choice);
    assert.deepEqual(applyChoice(seedState, scenario, choice), first, `${scenario.id}/${choice.id} is nondeterministic`);
    if (choice.battle) assert.equal(first.pendingBattle, choice.battle);
    else if (choice.next) assert.ok(scenarioById.has(first.scenarioId), `${scenario.id}/${choice.id} has unknown destination`);
    else assert.equal(first.completed, true);
  }
}

for (const [battleId, destination] of Object.entries(BATTLE_DESTINATIONS)) {
  for (const outcome of ['victory', 'defeat', 'withdrawal']) {
    const resolved = applyBattleResult(structuredClone(INITIAL_STATE), battleId, outcome);
    assert.equal(resolved.scenarioId, destination);
    assert.equal(resolved.pendingBattle, false);
    assert.equal(recordedBattle(resolved, battleId), outcome);
    assert.deepEqual(applyBattleResult(structuredClone(INITIAL_STATE), battleId, outcome), resolved);
  }
}

for (const trentonState of [
  { ...structuredClone(INITIAL_STATE), flags: { trentonPlan: 'delay' } },
  { ...structuredClone(INITIAL_STATE), flags: { trentonPlan: 'raids' } },
  applyBattleResult(structuredClone(INITIAL_STATE), 'trenton', 'defeat'),
  applyBattleResult(structuredClone(INITIAL_STATE), 'trenton', 'withdrawal'),
]) assert.doesNotMatch(JSON.stringify(presentScenario(trentonState, scenarioById.get('winter_reckoning'))), /Turn victory into credit/);

for (const outcome of [null, 'defeat', 'withdrawal']) {
  const northern = outcome ? applyBattleResult(structuredClone(INITIAL_STATE), 'saratoga', outcome) : structuredClone(INITIAL_STATE);
  assert.doesNotMatch(presentScenario(northern, scenarioById.get('french_alliance')).summary, /^News of Burgoyne.s surrender/);
}

const newYork = applyChoice(structuredClone(INITIAL_STATE), scenarioById.get('chesapeake_convergence'), scenarioById.get('chesapeake_convergence').choices[1]);
const northernFinal = applyChoice(newYork, scenarioById.get('yorktown_siege'), scenarioById.get('yorktown_siege').choices[0]);
assert.match(campaignEnding(northernFinal).title, /uncertain winter/);
assert.doesNotMatch(JSON.stringify(northernFinal.flags), /yorktownVictory/);

console.log(`Campaign persistence passed: ${malformedCases.length} malformed saves rejected, storage failures contained, ${SCENARIOS.reduce((sum, scenario) => sum + scenario.choices.length, 0)} choices and ${Object.keys(BATTLE_DESTINATIONS).length * 3} battle-result paths deterministic.`);
