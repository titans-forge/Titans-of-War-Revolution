import {structuresFor} from './structureFootprints.js';
import { BATTLE_DEFINITIONS } from './battleDefinitions.js';
import { TrentonEngine } from './trentonEngine.js';

export const BATTLE_CHECKPOINT_VERSION = 1;

const MAX_BYTES = 256 * 1024;
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const OUTCOMES = new Set(['undecided', 'victory', 'withdrawal', 'defeat']);
const ORDERS = new Set(['advance', 'hold', 'reform', 'fallback', 'withdraw', 'attack']);
const STATUSES = new Set(['steady', 'routed', 'withdrawn']);
const MODES = new Set(['line', 'column', 'open', 'battery']);
const POLICIES = new Set(['free', 'effective', 'hold']);

const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const finite = (value, min = -Number.MAX_VALUE, max = Number.MAX_VALUE) => Number.isFinite(value) && value >= min && value <= max;
const exactKeys = (value, keys) => plainObject(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const point = value => exactKeys(value, ['x', 'y']) && finite(value.x, -10000, 10000) && finite(value.y, -10000, 10000);

function safeTree(value, depth = 0) {
  if (depth > 12) return false;
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return typeof value !== 'string' || value.length <= 10000;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= 1000 && value.every(entry => safeTree(entry, depth + 1));
  if (!plainObject(value)) return false;
  const keys = Object.keys(value);
  return keys.length <= 1000 && keys.every(key => !FORBIDDEN_KEYS.has(key) && key.length <= 200 && safeTree(value[key], depth + 1));
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (plainObject(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

function fingerprint(value) {
  const text = canonical(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

const battleFingerprint = (id,config) => structuresFor(id).length ? fingerprint({config,structures:structuresFor(id)}) : fingerprint(config);

const clone = value => JSON.parse(JSON.stringify(value));

function contextValid(context) {
  if (!plainObject(context) || !safeTree(context)) return false;
  if (Object.hasOwn(context, 'metrics')) {
    if (!plainObject(context.metrics)) return false;
    if (!Object.keys(context.metrics).every(key => ['army', 'support', 'supply', 'credit', 'foreign', 'congress'].includes(key) && finite(context.metrics[key], -1000, 1000))) return false;
  }
  if (!Object.hasOwn(context, 'flags')) return true;
  return plainObject(context.flags) && Object.entries(context.flags).every(([key, value]) =>
    key.length > 0 && key.length <= 80 && !FORBIDDEN_KEYS.has(key)
      && (typeof value === 'boolean' || typeof value === 'string' && value.length <= 80 || finite(value, -1000000, 1000000))
  );
}

function formationValid(saved, baseline) {
  if (!plainObject(saved) || !safeTree(saved) || saved.id !== baseline.id || saved.name !== baseline.name || saved.side !== baseline.side || saved.type !== baseline.type) return false;
  const numeric = ['x', 'y', 'strength', 'morale', 'cohesion', 'initialStrength', 'fatigue', 'ammunition', 'initialAmmunition', 'frontage', 'reload', 'volleySerial', 'facing', 'reformRemaining'];
  if (!numeric.every(key => finite(saved[key], key === 'x' || key === 'y' ? -10000 : key === 'facing' ? -Math.PI * 2 : 0, key === 'facing' ? Math.PI * 2 : 1000000))) return false;
  if (!Number.isInteger(saved.volleySerial) || !Number.isInteger(saved.ammunition) || !Number.isInteger(saved.initialAmmunition)) return false;
  if (!point(saved.target) || !ORDERS.has(saved.order) || !STATUSES.has(saved.status) || !MODES.has(saved.formationMode) || !POLICIES.has(saved.firePolicy)) return false;
  if (![saved.active, saved.entered, saved.moving, saved.volleyRequested].every(value => typeof value === 'boolean')) return false;
  for (const key of ['engaged', 'navigationBlocked', 'evacuated', 'retiring', 'escaped']) if (Object.hasOwn(saved, key) && typeof saved[key] !== 'boolean') return false;
  for (const key of ['targetId', 'waitingFor']) if (saved[key] !== null && saved[key] !== undefined && typeof saved[key] !== 'string') return false;
  return Object.keys(saved).every(key => Object.hasOwn(baseline, key) || ['engaged', 'navigationBlocked', 'waitingFor', 'evacuated', 'retiring', 'escaped'].includes(key));
}

function objectiveValid(value) {
  if (!exactKeys(value, ['screenSeconds', 'defenseSeconds', 'escapeStarted', 'cowpens'])) return false;
  if (value.screenSeconds !== null && !finite(value.screenSeconds, 0, 100000)) return false;
  if (value.defenseSeconds !== null && !finite(value.defenseSeconds, 0, 100000)) return false;
  if (value.escapeStarted !== null && typeof value.escapeStarted !== 'boolean') return false;
  if (value.cowpens === null) return true;
  if (!exactKeys(value.cowpens, ['shots', 'rallied', 'lineSeconds', 'counterSeconds', 'counterDamage', 'reports'])) return false;
  const { shots, rallied, reports } = value.cowpens;
  if (![shots, rallied, reports].every(plainObject)) return false;
  if (!Object.values(shots).every(entry => Number.isInteger(entry) && finite(entry, 0, 100))) return false;
  if (![...Object.values(rallied), ...Object.values(reports)].every(entry => typeof entry === 'boolean')) return false;
  return [value.cowpens.lineSeconds, value.cowpens.counterSeconds, value.cowpens.counterDamage].every(entry => finite(entry, 0, 1000000));
}

export function captureBattleCheckpoint(engine) {
  try {
    if (!(engine instanceof TrentonEngine) || !BATTLE_DEFINITIONS[engine.battleId]) return null;
    const checkpoint = {
      version: BATTLE_CHECKPOINT_VERSION,
      battleId: engine.battleId,
      definitionFingerprint: battleFingerprint(engine.battleId,engine.config),
      seed: engine.seed,
      accumulator: engine.accumulator,
      time: engine.time,
      nextCrownDecision: engine.nextCrownDecision,
      outcome: engine.outcome,
      formations: clone(engine.formations),
      navigation: [...engine.navigation.entries()].map(([id, plan]) => ({ id, goal: clone(plan.goal), points: clone(plan.points) })),
      events: clone(engine.events),
      objectiveProgress: {
        screenSeconds: engine.screenSeconds ?? null,
        defenseSeconds: engine.defenseSeconds ?? null,
        escapeStarted: engine.escapeStarted ?? null,
        cowpens: engine.cowpens ? clone(engine.cowpens) : null,
      },
    };
    const json = JSON.stringify(checkpoint);
    return json.length <= MAX_BYTES && safeTree(checkpoint) ? checkpoint : null;
  } catch {
    return null;
  }
}

export function restoreBattleCheckpoint(checkpoint, battleId, campaignContext = {}) {
  try {
    const keys = ['version', 'battleId', 'definitionFingerprint', 'seed', 'accumulator', 'time', 'nextCrownDecision', 'outcome', 'formations', 'navigation', 'events', 'objectiveProgress'];
    if (!exactKeys(checkpoint, keys) || !safeTree(checkpoint) || JSON.stringify(checkpoint).length > MAX_BYTES) return null;
    if (checkpoint.version !== BATTLE_CHECKPOINT_VERSION || checkpoint.battleId !== battleId || !BATTLE_DEFINITIONS[battleId] || checkpoint.definitionFingerprint !== battleFingerprint(battleId,BATTLE_DEFINITIONS[battleId])) return null;
    // A terminal result can interrupt the fixed-step loop and legitimately
    // leave more than one step in the accumulator from the caller's last dt.
    if (!Number.isInteger(checkpoint.seed) || !finite(checkpoint.seed, -0x80000000, 0xffffffff) || !finite(checkpoint.accumulator, 0, 1000) || !finite(checkpoint.time, 0, 100000) || !finite(checkpoint.nextCrownDecision, 0, 100002) || !OUTCOMES.has(checkpoint.outcome) || !contextValid(campaignContext)) return null;

    const engine = new TrentonEngine(checkpoint.seed, battleId, clone(campaignContext));
    if (!Array.isArray(checkpoint.formations) || checkpoint.formations.length !== engine.formations.length) return null;
    if (!checkpoint.formations.every((unit, index) => formationValid(unit, engine.formations[index]))) return null;
    const ids = new Set(engine.formations.map(unit => unit.id));
    if (ids.size !== engine.formations.length || checkpoint.formations.some((unit, index) => unit.id !== engine.formations[index].id)) return null;

    if (!Array.isArray(checkpoint.navigation) || checkpoint.navigation.length > ids.size) return null;
    const navigationIds = new Set();
    for (const entry of checkpoint.navigation) {
      if (!exactKeys(entry, ['id', 'goal', 'points']) || !ids.has(entry.id) || navigationIds.has(entry.id) || !point(entry.goal) || !Array.isArray(entry.points) || entry.points.length > 100 || !entry.points.every(point)) return null;
      navigationIds.add(entry.id);
    }
    if (!Array.isArray(checkpoint.events) || checkpoint.events.length > 1000 || !checkpoint.events.every(event => exactKeys(event, ['time', 'type', 'message']) && finite(event.time, 0, checkpoint.time + 1e-6) && typeof event.type === 'string' && event.type.length <= 40 && typeof event.message === 'string' && event.message.length <= 2000)) return null;
    if (!objectiveValid(checkpoint.objectiveProgress)) return null;

    engine.accumulator = checkpoint.accumulator;
    engine.time = checkpoint.time;
    engine.nextCrownDecision = checkpoint.nextCrownDecision;
    engine.outcome = checkpoint.outcome;
    engine.formations = clone(checkpoint.formations);
    engine.navigation = new Map(checkpoint.navigation.map(entry => [entry.id, { goal: clone(entry.goal), points: clone(entry.points) }]));
    engine.events = clone(checkpoint.events);
    if (checkpoint.objectiveProgress.screenSeconds !== null) engine.screenSeconds = checkpoint.objectiveProgress.screenSeconds;
    if (checkpoint.objectiveProgress.defenseSeconds !== null) engine.defenseSeconds = checkpoint.objectiveProgress.defenseSeconds;
    if (checkpoint.objectiveProgress.escapeStarted !== null) engine.escapeStarted = checkpoint.objectiveProgress.escapeStarted;
    if (checkpoint.objectiveProgress.cowpens !== null) engine.cowpens = clone(checkpoint.objectiveProgress.cowpens);
    return engine;
  } catch {
    return null;
  }
}
