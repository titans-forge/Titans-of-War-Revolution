import assert from 'node:assert/strict';
import { BATTLE_DEFINITIONS } from '../src/battle/battleDefinitions.js';
import { getUnitIdentity, mappedUnitIdentityKeys } from '../src/battle/unitIdentity.js';
import { standardDesign } from '../src/battle/standards.js';

const formationKeys = [];
for (const [battleId, battle] of Object.entries(BATTLE_DEFINITIONS)) {
  for (const unit of battle.formations) {
    const identity = getUnitIdentity(battleId, unit);
    const key = `${battleId}:${unit.id}`;
    formationKeys.push(key);
    assert.equal(identity.key, key);
    assert.equal(standardDesign(battleId, unit), identity.standard);
    assert.ok(Number.isInteger(identity.infantryProfile));
    assert.ok(Number.isInteger(identity.cavalryProfile));
    assert.equal(identity.artBasis, 'illustrative');
  }
}

assert.deepEqual(mappedUnitIdentityKeys().sort(), formationKeys.sort(), 'identity registry must exactly cover every current formation');
assert.equal(getUnitIdentity('brandywine', 'knyphausen-ford').faction, 'german-auxiliary');
assert.equal(getUnitIdentity('saratoga', 'riedesel').faction, 'german-auxiliary');
assert.equal(getUnitIdentity('saratoga', 'fraser').faction, 'british');
assert.equal(getUnitIdentity('trenton', 'rall').standard, 'german-marker');
assert.throws(() => getUnitIdentity('trenton', 'invented-unit'), /Unmapped formation visual identity/);

console.log(`Unit identity passed: ${formationKeys.length} formations mapped exactly across ${Object.keys(BATTLE_DEFINITIONS).length} battles.`);
