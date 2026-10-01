// Formation-level visual direction for the existing illustrative unit sheets.
// These records select representative art; they are not uniform reconstructions.
const PROFILES = Object.freeze({
  continental: Object.freeze({ faction: 'continental', infantryProfile: 0, cavalryProfile: 0, coat: 0x315b78, trim: 0xd9b84d, standard: 'thirteen-stars' }),
  provincial: Object.freeze({ faction: 'american-provincial', infantryProfile: 3, cavalryProfile: 0, coat: 0x5f5143, trim: 0xc8b997, standard: 'provincial' }),
  rifle: Object.freeze({ faction: 'american-rifle', infantryProfile: 3, cavalryProfile: 0, coat: 0x53604a, trim: 0xb9ad8b, standard: 'thirteen-stars' }),
  militia: Object.freeze({ faction: 'american-militia', infantryProfile: 3, cavalryProfile: 0, coat: 0x6a5844, trim: 0xb9ad8b, standard: 'thirteen-stars' }),
  british: Object.freeze({ faction: 'british', infantryProfile: 1, cavalryProfile: 2, coat: 0xb43d35, trim: 0xe2d5bb, standard: 'british-union' }),
  grenadier: Object.freeze({ faction: 'british-grenadier', infantryProfile: 5, cavalryProfile: 2, coat: 0xb43d35, trim: 0xe2d5bb, standard: 'british-union' }),
  britishRifle: Object.freeze({ faction: 'british-rifle', infantryProfile: 4, cavalryProfile: 2, coat: 0x53604a, trim: 0xc3b997, standard: 'british-union' }),
  german: Object.freeze({ faction: 'german-auxiliary', infantryProfile: 2, cavalryProfile: 2, coat: 0x263c56, trim: 0xe2d5bb, standard: 'german-marker' }),
});

const FORMATION_PROFILE = Object.freeze({
  'trenton:mercer': 'continental',
  'trenton:sullivan': 'continental',
  'trenton:knox': 'continental',
  'trenton:rall': 'german',
  'trenton:lossberg': 'german',
  'trenton:knyphausen': 'german',
  'bunker_hill:prescott': 'provincial',
  'bunker_hill:stark': 'provincial',
  'bunker_hill:knowles': 'provincial',
  'bunker_hill:howe-right': 'british',
  'bunker_hill:pigot': 'british',
  'bunker_hill:reserve': 'british',
  'long_island:sullivan-brooklyn': 'continental',
  'long_island:stirling': 'continental',
  'long_island:putnam-reserve': 'continental',
  'long_island:heister': 'german',
  'long_island:grant': 'british',
  'long_island:clinton-flank': 'british',
  'brandywine:wayne-ford': 'continental',
  'brandywine:sullivan-right': 'continental',
  'brandywine:greene-reserve': 'continental',
  'brandywine:proctor': 'continental',
  'brandywine:knyphausen-ford': 'german',
  'brandywine:ferguson': 'britishRifle',
  'brandywine:howe-flank': 'british',
  'saratoga:morgan': 'rifle',
  'saratoga:learned': 'continental',
  'saratoga:poor': 'continental',
  'saratoga:lincoln-reserve': 'continental',
  'saratoga:fraser': 'british',
  'saratoga:riedesel': 'german',
  'saratoga:hamilton': 'british',
  'monmouth:lee-advance': 'continental',
  'monmouth:wayne-monmouth': 'continental',
  'monmouth:lafayette-monmouth': 'continental',
  'monmouth:knox-monmouth': 'continental',
  'monmouth:washington-main': 'continental',
  'monmouth:grenadiers-monmouth': 'grenadier',
  'monmouth:cornwallis-monmouth': 'british',
  'monmouth:guards-monmouth': 'british',
  'cowpens:morgan-riflemen': 'rifle',
  'cowpens:pickens-militia': 'militia',
  'cowpens:howard-continentals': 'continental',
  'cowpens:washington-cavalry': 'continental',
  'cowpens:tarleton-legion': 'british',
  'cowpens:seventh-regiment': 'british',
  'cowpens:british-light-infantry': 'british',
  'cowpens:legion-dragoons': 'british',
});

const EARLY_CONTINENTAL_STANDARD = new Set([
  'trenton:mercer', 'trenton:sullivan', 'trenton:knox',
  'long_island:sullivan-brooklyn', 'long_island:stirling', 'long_island:putnam-reserve',
]);

export const UNIT_IDENTITY_PROVENANCE = Object.freeze({
  scope: 'Representative selections from the existing infantry/cavalry sheets, with generated German tricorn green-clad Ferguson rifle textures and representative British grenadier bearskin textures. No regiment-specific uniform reconstruction is claimed.',
  confidence: 'illustrative',
  limitation: 'Faction and broad troop-role identity only. The metadata does not assert regiment-specific coats, facings, headgear, cavalry dress, or surviving colours.',
});

export function formationIdentityKey(battleId, formationId) {
  return `${battleId}:${formationId}`;
}

export function hasUnitIdentity(battleId, formationId) {
  return Object.hasOwn(FORMATION_PROFILE, formationIdentityKey(battleId, formationId));
}

export function getUnitIdentity(battleId, unitOrId) {
  const formationId = typeof unitOrId === 'string' ? unitOrId : unitOrId?.id;
  const key = formationIdentityKey(battleId, formationId);
  const profileName = FORMATION_PROFILE[key];
  if (!profileName) throw new Error(`Unmapped formation visual identity: ${key}`);
  const base = PROFILES[profileName];
  return Object.freeze({
    ...base,
    key,
    formationId,
    profileName,
    standard: EARLY_CONTINENTAL_STANDARD.has(key) ? 'grand-union' : base.standard,
    artBasis: UNIT_IDENTITY_PROVENANCE.confidence,
  });
}

export function mappedUnitIdentityKeys() {
  return Object.keys(FORMATION_PROFILE);
}
