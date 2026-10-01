import { BATTLE_DESTINATIONS, INITIAL_STATE, METRIC_DEFINITIONS, SCENARIOS } from './campaign.js';

export const STORAGE_KEY = 'titans-of-war:revolution:campaign';
export const SAVE_VERSION = 6;

const METRIC_IDS = new Set(METRIC_DEFINITIONS.map((metric) => metric.id));
const SCENARIO_BY_ID = new Map(SCENARIOS.map((scenario) => [scenario.id, scenario]));
const BATTLE_IDS = new Set(Object.keys(BATTLE_DESTINATIONS));
const BATTLE_RESULTS = new Set(['victory', 'defeat', 'withdrawal']);
const clone = (value) => JSON.parse(JSON.stringify(value));
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isFiniteMetric = (value) => Number.isFinite(value) && value >= 0 && value <= 100;
const validDeltaMap = (value) => isRecord(value) && Object.entries(value).every(([key, delta]) => METRIC_IDS.has(key) && Number.isFinite(delta) && Math.abs(delta) <= 100);

export function freshCampaign() { return clone(INITIAL_STATE); }

export function saveCampaign(state, storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    if (!target) return { ok: false, error: 'Browser storage is unavailable. Export the campaign to keep a copy.' };
    target.setItem(STORAGE_KEY, JSON.stringify({ version: SAVE_VERSION, state }));
    return { ok: true, error: '' };
  } catch {
    return { ok: false, error: 'The campaign could not be saved in this browser. Export it to keep a copy.' };
  }
}

function validateFlags(flags) {
  return isRecord(flags) && Object.entries(flags).every(([key, value]) =>
    key.length > 0 && key.length <= 80 && (typeof value === 'boolean' || typeof value === 'string' && value.length <= 80 || Number.isFinite(value))
  );
}

function validateHistoryEntry(entry) {
  if (!isRecord(entry) || typeof entry.scenarioId !== 'string' || typeof entry.choiceId !== 'string' || typeof entry.title !== 'string' || entry.title.length > 240) return false;
  const battleId = entry.scenarioId.endsWith('_battle') ? entry.scenarioId.slice(0, -7) : null;
  if (battleId) return BATTLE_IDS.has(battleId) && BATTLE_RESULTS.has(entry.choiceId) && validDeltaMap(entry.effects || {});
  const scenario = SCENARIO_BY_ID.get(entry.scenarioId);
  if (!scenario || !scenario.choices.some((choice) => choice.id === entry.choiceId)) return false;
  return validDeltaMap(entry.effects || {})
    && (entry.nominalEffects === undefined || validDeltaMap(entry.nominalEffects))
    && (entry.pressure === undefined || validDeltaMap(entry.pressure))
    && (entry.modifiers === undefined || Array.isArray(entry.modifiers) && entry.modifiers.every((note) => typeof note === 'string' && note.length <= 500));
}

function validationError(state) {
  if (!isRecord(state)) return 'Save state must be an object.';
  if (!SCENARIO_BY_ID.has(state.scenarioId)) return 'Save references an unknown campaign scenario.';
  if (!Number.isInteger(state.turn) || state.turn < 1 || state.turn > SCENARIOS.length + 1) return 'Campaign turn is outside the supported range.';
  if (!isRecord(state.metrics) || ![...METRIC_IDS].every((id) => isFiniteMetric(state.metrics[id])) || Object.keys(state.metrics).some((id) => !METRIC_IDS.has(id))) return 'Campaign metrics must be finite values from 0 to 100.';
  if (!validateFlags(state.flags)) return 'Campaign flags are malformed.';
  if (!Array.isArray(state.history) || state.history.length > SCENARIOS.length * 2 || !state.history.every(validateHistoryEntry)) return 'Campaign decision history is malformed.';
  if (state.pendingBattle !== false && !BATTLE_IDS.has(state.pendingBattle)) return 'Save references an unknown pending battle.';
  if (state.battleResult !== null && state.battleResult !== undefined && !BATTLE_RESULTS.has(state.battleResult)) return 'Save contains an unknown battle result.';
  if (typeof state.completed !== 'boolean') return 'Campaign completion state is malformed.';
  if (state.completed && state.pendingBattle) return 'A completed campaign cannot contain a pending battle.';
  return '';
}

export function migrateCampaign(payload) {
  if (!isRecord(payload) || !isRecord(payload.state)) return null;
  const sourceVersion = Number(payload.version || 1);
  if (!Number.isInteger(sourceVersion) || sourceVersion < 1 || sourceVersion > SAVE_VERSION) return null;
  if (sourceVersion === SAVE_VERSION && validationError(payload.state)) return null;
  const state = {
    ...freshCampaign(), ...payload.state,
    metrics: { ...INITIAL_STATE.metrics, ...(isRecord(payload.state.metrics) ? payload.state.metrics : {}) },
    flags: isRecord(payload.state.flags) ? { ...payload.state.flags } : payload.state.flags,
    history: payload.state.history,
  };
  if (sourceVersion <= 3 && state.completed && state.scenarioId === 'winter_reckoning') { state.scenarioId = 'philadelphia_campaign'; state.completed = false; }
  if (sourceVersion <= 4 && state.completed && state.scenarioId === 'french_alliance') { state.scenarioId = 'valley_forge_crisis'; state.completed = false; }
  if (sourceVersion <= 5 && state.completed && state.scenarioId === 'coalition_reckoning') { state.scenarioId = 'frontier_strategy'; state.completed = false; }
  if (validationError(state)) return null;
  state.version = SAVE_VERSION;
  return state;
}

export function loadCampaign(storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    if (!target) return null;
    const serialized = target.getItem(STORAGE_KEY); return serialized ? migrateCampaign(JSON.parse(serialized)) : null;
  }
  catch { return null; }
}

export function clearCampaign(storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    if (!target) return { ok: false, error: 'Browser storage is unavailable.' };
    target.removeItem(STORAGE_KEY); return { ok: true, error: '' };
  }
  catch { return { ok: false, error: 'The stored campaign could not be cleared.' }; }
}

export function serializeCampaign(state) {
  return JSON.stringify({ product: 'Titans of War: Revolution', exportedAt: new Date().toISOString(), version: SAVE_VERSION, state }, null, 2);
}

export function importCampaignResult(text) {
  let payload;
  try { payload = JSON.parse(text); }
  catch { return { state: null, error: 'The selected file is not valid JSON.' }; }
  if (payload?.product !== undefined && payload.product !== 'Titans of War: Revolution') return { state: null, error: 'The selected file belongs to a different product.' };
  const state = migrateCampaign(payload);
  if (!state) return { state: null, error: validationError(payload?.state) || 'The save version or structure is not compatible.' };
  return { state, error: '' };
}

export function importCampaign(text) { return importCampaignResult(text).state; }
