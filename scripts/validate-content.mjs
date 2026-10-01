import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { BATTLE_DESTINATIONS, METRIC_DEFINITIONS, PRIMERS, PRIMER_BY_SCENARIO, SCENARIOS } from '../src/game/campaign.js';
import { BATTLE_DEFINITIONS } from '../src/battle/battleDefinitions.js';
import { CAMPAIGN_SCENES, SCENE_BY_SCENARIO } from '../src/game/scenes.js';

const scenarioIds = new Set();
const metricIds = new Set(METRIC_DEFINITIONS.map((metric) => metric.id));
const battleIds = new Set(Object.keys(BATTLE_DEFINITIONS));

for (const scenario of SCENARIOS) {
  assert.ok(scenario.id && !scenarioIds.has(scenario.id), `Scenario id must be unique: ${scenario.id}`);
  scenarioIds.add(scenario.id);
  assert.ok(scenario.title && scenario.summary && scenario.context, `${scenario.id} needs complete display copy`);
  assert.equal(scenario.choices?.length, scenario.interlude ? 1 : 3, `${scenario.id} has an invalid number of choices`);
  assert.ok(PRIMER_BY_SCENARIO[scenario.id]?.length, `${scenario.id} needs at least one historical primer`);
  assert.ok(CAMPAIGN_SCENES[SCENE_BY_SCENARIO[scenario.id]], `${scenario.id} needs an explicit campaign scene`);

  for (const primerId of PRIMER_BY_SCENARIO[scenario.id]) {
    assert.ok(PRIMERS[primerId], `${scenario.id} references unknown primer ${primerId}`);
  }
  for (const choice of scenario.choices) {
    assert.ok(choice.next !== undefined || choice.battle, `${scenario.id}:${choice.id} has no destination`);
    assert.ok(!choice.next || SCENARIOS.some((candidate) => candidate.id === choice.next), `${scenario.id}:${choice.id} points to unknown scenario ${choice.next}`);
    assert.ok(!choice.battle || battleIds.has(choice.battle), `${scenario.id}:${choice.id} points to unknown battle ${choice.battle}`);
    for (const metricId of Object.keys(choice.effects || {})) assert.ok(metricIds.has(metricId), `${scenario.id}:${choice.id} changes unknown metric ${metricId}`);
    for (const modifier of choice.modifiers || []) {
      assert.ok(typeof modifier.flag === 'string' && modifier.flag.length > 0, `${scenario.id}:${choice.id} has a modifier without a flag`);
      assert.ok(typeof modifier.note === 'string' && modifier.note.length > 0, `${scenario.id}:${choice.id} has a modifier without an explanation`);
      assert.ok(Object.keys(modifier.effects || {}).length > 0, `${scenario.id}:${choice.id}:${modifier.flag} has no effects`);
      for (const metricId of Object.keys(modifier.effects || {})) assert.ok(metricIds.has(metricId), `${scenario.id}:${choice.id}:${modifier.flag} changes unknown metric ${metricId}`);
    }
  }
}

for (const scene of Object.values(CAMPAIGN_SCENES)) {
  assert.ok(existsSync(resolve('public', scene.image.replace(/^\//, ''))), `Missing campaign image ${scene.image}`);
}

for (const battle of Object.values(BATTLE_DEFINITIONS)) {
  assert.ok(existsSync(resolve('public/images/battles', `${battle.id.replace('_', '-')}.webp`)), `Missing battlefield image for ${battle.id}`);
}

for (const [battleId, destination] of Object.entries(BATTLE_DESTINATIONS)) {
  assert.ok(battleIds.has(battleId), `Battle destination references unknown battle ${battleId}`);
  assert.ok(scenarioIds.has(destination), `Battle ${battleId} returns to unknown scenario ${destination}`);
}

const reachable = new Set([SCENARIOS[0].id]);
for (let changed = true; changed;) {
  changed = false;
  for (const scenario of SCENARIOS.filter((candidate) => reachable.has(candidate.id))) {
    for (const choice of scenario.choices) {
      const destination = choice.battle ? BATTLE_DESTINATIONS[choice.battle] : choice.next;
      if (destination && !reachable.has(destination)) {
        reachable.add(destination);
        changed = true;
      }
    }
  }
}

assert.deepEqual([...scenarioIds].filter((id) => !reachable.has(id)), [], 'Every scenario must be reachable from the opening');
assert.ok(SCENARIOS.at(-1).choices.every((choice) => choice.next === null), 'Final scenario choices must complete the campaign');

console.log(`Validated ${SCENARIOS.length} scenarios, ${battleIds.size} battles, and ${Object.keys(PRIMERS).length} primers.`);
