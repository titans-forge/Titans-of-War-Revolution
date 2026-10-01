import {repulseStatus} from './repulseObjective.js';
import {blockingStructure,lineOfFireClear,clearFiringPosition} from './lineOfFire.js';
import {structuresFor} from './structureFootprints.js';
import {constrainFormationStep,inFormationContact} from './formationContact.js';
import {chooseCrownTarget} from './enemyCoordination.js';
import {planMeleeExchange} from './meleeExchange.js';
import {cowpensStatus,updateCowpens,recordCowpensFire,recordCowpensDamage} from './cowpensObjective.js';
import {resolveDestination, routeTo, segmentClear, withdrawalDestination} from './terrainNavigation.js';
import {spaceFriendlyStep} from './formationSpacing.js';
import {escapeStatus, prepareEscape, departEscapingUnit} from './escapeObjective.js';
import { evacuationStatus, updateScreen, atEvacuationExit } from './evacuation.js';
import { defenseStatus, updateDefense } from './defenseObjective.js';
import { BUNKER_REDOUBT, getBattleDefinition } from './battleDefinitions.js';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const TERRAIN_ZONES = {
  bunker_hill: [
    BUNKER_REDOUBT,
    { label: 'Rail fence', x1: 350, x2: 705, y1: 410, y2: 500, move: 0.9, defense: 1.13 },
  ],
  long_island: [
    { label: 'Wooded heights', x1: 380, x2: 1080, y1: 40, y2: 580, move: 0.76, defense: 1.1 },
    { label: 'Brooklyn works', x1: 245, x2: 415, y1: 145, y2: 535, move: 0.82, defense: 1.22 },
  ],
  brandywine: [
    { label: 'Brandywine ford', x1: 485, x2: 590, y1: 455, y2: 570, move: 0.62, defense: 1.04 },
    { label: 'Wooded slope', x1: 0, x2: 430, y1: 0, y2: 300, move: 0.8, defense: 1.1 },
  ],
  saratoga: [
    { label: 'Bemis Heights', x1: 180, x2: 680, y1: 80, y2: 585, move: 0.86, defense: 1.18 },
    { label: 'Wood line', x1: 680, x2: 980, y1: 0, y2: 680, move: 0.8, defense: 1.08 },
  ],
  monmouth: [
    { label: 'Broken ground', x1: 420, x2: 610, y1: 0, y2: 680, move: 0.7, defense: 1.08 },
    { label: 'Hedgerow', x1: 610, x2: 790, y1: 250, y2: 520, move: 0.84, defense: 1.12 },
  ],
  cowpens: [
    { label: 'Wooded rear', x1: 0, x2: 430, y1: 330, y2: 680, move: 0.78, defense: 1.08 },
    { label: 'Low rise', x1: 320, x2: 760, y1: 190, y2: 500, move: 0.94, defense: 1.08 },
  ],
  trenton: [
    { label: 'Town streets', x1: 680, x2: 1120, y1: 80, y2: 500, move: 0.78, defense: 1.12 },
    { label: 'Frozen creek bank', x1: 0, x2: 1200, y1: 500, y2: 625, move: 0.72, defense: 1.05 },
  ],
};

export const TRENTON_WORLD = { width: 1200, height: 680 };

function seededNoise(seed) {
  let value = seed >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 0xffffffff;
}

export class TrentonEngine {
  constructor(seed = 17761226, battleId = 'trenton', campaignContext = {}) {
    this.config = getBattleDefinition(battleId);
    this.battleId = battleId;
    this.seed = seed;
    this.time = 0;
    this.accumulator = 0;
    this.nextCrownDecision = 0;
    this.navigation = new Map();
    this.outcome = 'undecided';
    this.events = [{ time: 0, type: 'objective', message: this.config.openingMessage }];
    this.campaignContext = campaignContext;
    const metrics = campaignContext.metrics || {};
    const armyDelta = ((metrics.army ?? 50) - 50) * 0.1;
    const supportDelta = ((metrics.support ?? 50) - 50) * 0.06;
    const ammunitionFactor = 0.75 + (metrics.supply ?? 50) / 200;
    this.formations = this.config.formations.map((unit) => ({
      ...unit,
      morale: unit.side === 'continental' ? clamp(unit.morale + armyDelta + supportDelta) : unit.morale,
      cohesion: unit.side === 'continental' ? clamp(unit.cohesion + armyDelta * 0.8 + (campaignContext.flags?.steubenSystem ? 4 : 0)) : unit.cohesion,
      initialStrength: unit.strength,
      fatigue: unit.side === 'continental' ? 20 : 5,
      ammunition: Math.round((unit.ammunition ?? (unit.type === 'artillery' ? 24 : 70)) * (unit.side === 'continental' ? ammunitionFactor : 1)),
      initialAmmunition: Math.round((unit.ammunition ?? (unit.type === 'artillery' ? 24 : 70)) * (unit.side === 'continental' ? ammunitionFactor : 1)),
      formationMode: unit.type === 'artillery' ? 'battery' : 'line',
      target: { x: unit.x, y: unit.y },
      order: 'hold',
      status: 'steady',
      reload: 0,
      firePolicy: 'free',
      targetId: null,
      volleyRequested: false,
      volleySerial: 0,
      facing: unit.side === 'continental' ? 0 : Math.PI,
      active: unit.active !== false,
      entered: unit.active !== false,
      moving: false,
      reformRemaining: 0,
    }));
  }

  nearestEnemy(unit) {
    return this.formations
      .filter((other) => other.side !== unit.side && other.active && other.status !== 'routed')
      .sort((a, b) => distance(unit, a) - distance(unit, b))[0];
  }

  combatTarget(unit) {
    return this.formations.find(other => other.id === unit.targetId && other.side !== unit.side && other.active && other.status !== 'routed') || this.nearestEnemy(unit);
  }

  reformBlocked(unit) {
    if (!unit.active || unit.status !== 'steady' || unit.order !== 'reform') return false;
    const enemy = this.combatTarget(unit);
    return !!enemy && distance(unit, enemy) <= 240;
  }

  attack(id, targetId) {
    const unit = this.formations.find(entry => entry.id === id && entry.side === 'continental' && entry.active && entry.status !== 'routed');
    const target = this.formations.find(entry => entry.id === targetId && entry.side === 'crown' && entry.active && entry.status !== 'routed');
    if (!unit || !target || this.outcome !== 'undecided') return;
    unit.navigationBlocked = false;
    unit.waitingFor = null;
    unit.targetId = targetId;
    unit.order = 'attack';
    unit.reformRemaining = 0;
    unit.volleyRequested = false;
    unit.target = this.approachPoint(unit, target);
  }

  terrainAt(unit) {
    const zone = (TERRAIN_ZONES[this.battleId] || []).find((entry) => unit.x >= entry.x1 && unit.x <= entry.x2 && unit.y >= entry.y1 && unit.y <= entry.y2);
    return zone || { label: 'Open ground', move: 1, defense: 1 };
  }

  move(id, point) {
    if (this.outcome !== 'undecided') return;
    const unit = this.formations.find((entry) => entry.id === id && entry.side === 'continental' && entry.active && entry.status !== 'routed');
    if (!unit || !Number.isFinite(point?.x) || !Number.isFinite(point?.y)) return;
    unit.reformRemaining = 0;
    unit.volleyRequested = false;
    unit.targetId = null;
    unit.target = resolveDestination(this.battleId, { x: clamp(point.x, 55, TRENTON_WORLD.width - 55), y: clamp(point.y, 45, TRENTON_WORLD.height - 45) }, {...unit,navigationMargin:12});
    if (!unit.target) { unit.target={x:unit.x,y:unit.y}; unit.navigationBlocked=true; unit.order="hold"; return; }
    unit.navigationBlocked = false;
    unit.waitingFor = null;
    unit.facing = Math.atan2(unit.target.y - unit.y, unit.target.x - unit.x);
    unit.order = 'advance';
  }

  order(id, order) {
    const unit = this.formations.find((entry) => entry.id === id && entry.side === 'continental' && entry.active && entry.status !== 'routed');
    if (!unit || this.outcome !== 'undecided') return;
    if (!['advance', 'hold', 'reform', 'fallback', 'withdraw', 'volley'].includes(order)) return;
    if (order === 'volley') {
      // A fire order never shortens the weapon's reload cycle.
      if (unit.order === 'withdraw' || unit.order === 'reform') return;
      unit.navigationBlocked = false;
      unit.waitingFor = null;
      unit.volleyRequested = true;
      unit.firePolicy = 'hold';
      unit.order = 'hold';
      unit.target = { x: unit.x, y: unit.y };
      const enemy = this.nearestEnemy(unit);
      if (enemy) unit.facing = Math.atan2(enemy.y - unit.y, enemy.x - unit.x);
      return;
    }
    if (order === 'reform' && unit.reformRemaining > 0) return;
    unit.navigationBlocked = false;
    unit.waitingFor = null;
    unit.volleyRequested = false;
    unit.targetId = null;
    unit.order = order;
    unit.reformRemaining = order === 'reform' ? 8 : 0;
    unit.target = { x: unit.x, y: unit.y };
    if (order === 'advance') {
      const enemy = this.nearestEnemy(unit);
      if (enemy) unit.target = this.approachPoint(unit, enemy);
    }
    if (order === 'fallback') {
      const point=this.config.counterattackObjective?.fallback?.[id] || {x:clamp(unit.x-160,55,1145),y:unit.y};
      unit.target=resolveDestination(this.battleId,point) || {x:unit.x,y:unit.y};
    }
    if (order === 'withdraw') unit.target = this.config.evacuation?.kind === 'road' ? {x: this.config.evacuation.exitX, y: this.config.evacuation.exitY} : withdrawalDestination(this.battleId,unit);
  }

  approachPoint(unit, enemy) {
    const gap = Math.max(1, distance(unit, enemy));
    const standOff = unit.type === 'artillery' ? (unit.firePolicy === 'effective' ? 230 : 300) : unit.type === 'cavalry' ? 48 : unit.side==='crown' && this.config.enemyStandOff ? this.config.enemyStandOff : unit.firePolicy === 'effective' ? 120 : 150;
    if (!lineOfFireClear(this.battleId,unit,enemy)) return clearFiringPosition(this.battleId,unit,enemy,standOff) || {x:unit.x,y:unit.y};
    if (gap <= standOff) return { x: unit.x, y: unit.y };
    return { x: enemy.x + (unit.x - enemy.x) / gap * standOff, y: enemy.y + (unit.y - enemy.y) / gap * standOff };
  }

  setFormation(id, mode) {
    const unit = this.formations.find((entry) => entry.id === id && entry.side === 'continental' && entry.active && entry.type === 'infantry');
    if (!unit || unit.status === 'routed' || this.outcome !== 'undecided' || unit.formationMode === mode || !['line', 'column', 'open'].includes(mode)) return;
    unit.formationMode = mode;
    this.navigation.delete(unit.id);
    unit.frontage = mode === 'line' ? 200 : mode === 'column' ? 100 : 240;
    unit.cohesion = clamp(unit.cohesion - 2);
  }

  setFirePolicy(id, policy) {
    const unit = this.formations.find(entry => entry.id === id && entry.side === 'continental' && entry.active && entry.status !== 'routed');
    if (!unit || this.outcome !== 'undecided' || !['free', 'effective', 'hold'].includes(policy)) return;
    unit.firePolicy = policy;
    unit.volleyRequested = false;
  }

  objectiveStatus() {
    const crown = this.formations.filter(unit => unit.side === 'crown');
    const losses = 1 - crown.reduce((sum, unit) => sum + unit.strength, 0) / crown.reduce((sum, unit) => sum + unit.initialStrength, 0);
    const resisting = crown.filter(unit => unit.status !== 'routed' && unit.status !== 'withdrawn' && (unit.active || !unit.entered)).length;
    return { remaining: Math.max(0, this.config.timeLimit - this.time), losses, threshold: this.config.holdVictoryLoss, resisting, total: crown.length, timedResult: this.config.holdOutcome || 'withdrawal', evacuation: evacuationStatus(this), defense: defenseStatus(this), escape: escapeStatus(this), counterattack: cowpensStatus(this), repulse: repulseStatus(this) };
  }

  tick(dt) {
    if (!Number.isFinite(dt) || dt <= 0 || this.outcome !== 'undecided') return;
    this.accumulator += dt;
    while (this.accumulator >= 0.05 - 1e-9 && this.outcome === 'undecided') {
      this.accumulator -= 0.05;
      this.step(0.05);
    }
  }

  step(dt) {
    if (this.outcome !== 'undecided') return;
    this.time += dt;
    this.activateReinforcements();
    prepareEscape(this);
    updateScreen(this, dt);
    for (const unit of this.formations) {
      unit.engaged = false;
      if (!unit.active) continue;
      if (unit.morale < 18 || unit.cohesion < 14 || unit.strength < unit.initialStrength * 0.18) this.route(unit);
      if (unit.status === 'routed') {
        this.advanceUnit(unit, dt);
        continue;
      }
      if (unit.order === 'attack') {
        const target = this.formations.find(other => other.id === unit.targetId && other.active && other.status !== 'routed');
        if (target) unit.target = this.approachPoint(unit, target);
        else { unit.targetId = null; unit.order = 'hold'; unit.target = { x: unit.x, y: unit.y }; }
      }
      unit.reload = Math.max(0, unit.reload - dt);
      this.advanceUnit(unit, dt);
      const enemy = this.combatTarget(unit);
      if (unit.order === 'reform') {
        // Recovery requires eight uninterrupted seconds away from close combat.
        if (!this.reformBlocked(unit)) {
          unit.reformRemaining = Math.max(0, unit.reformRemaining - dt);
          if (unit.reformRemaining === 0) {
            unit.cohesion = clamp(unit.cohesion + 12);
            unit.morale = clamp(unit.morale + 4);
            unit.fatigue = clamp(unit.fatigue - 4);
            unit.order = 'hold';
          }
        } else unit.reformRemaining = 8;
        continue;
      }
      if (!unit.active || unit.order === 'withdraw' || unit.order === 'fallback' || !enemy) continue;
      if (!unit.moving) unit.facing = Math.atan2(enemy.y - unit.y, enemy.x - unit.x);
      const range = distance(unit, enemy);
      const limit = unit.type === 'artillery' ? 390 : unit.type === 'cavalry' ? 105 : 210;
      const fireAllowed = unit.volleyRequested || unit.firePolicy === 'free' || (unit.firePolicy === 'effective' && range <= limit * 0.65);
      // Close combat occupies the formation, even when its assigned ranged
      // target is a different enemy. A queued volley waits until contact clears.
      const inMelee = this.formations.some(other => inFormationContact(unit, other) && segmentClear(this.battleId, unit, other));
      if (fireAllowed && !inMelee && Math.cos(Math.atan2(enemy.y - unit.y, enemy.x - unit.x) - unit.facing) >= 0.5 && range <= limit && unit.reload <= 0 && unit.ammunition > 0) this.fire(unit, enemy, range);

      if (unit.morale < 18 || unit.cohesion < 14 || unit.strength < unit.initialStrength * 0.18) this.route(unit);
    }
    // Resolve from the same pre-contact strengths, sharing each formation's
    // outgoing effort across its opponents instead of multiplying its damage.
    const fighting = this.formations.filter(unit => unit.active && unit.status !== 'routed');
    const damage = new Map();
    const contact = planMeleeExchange(fighting, (a,b) => inFormationContact(a,b) && segmentClear(this.battleId,a,b));
    for (const [a,b] of contact.pairs) a.engaged = b.engaged = true;
    for (const {attacker,defender,effort} of contact.exchanges) {
      const loss = (2.5 + attacker.strength / 420) * (attacker.side === 'crown' ? 1.08 : 1) * (attacker.type === 'cavalry' ? 1.28 : 1) * dt * effort / this.terrainAt(defender).defense;
      const received = damage.get(defender) || { strength: 0, morale: 0, cohesion: 0 };
      recordCowpensDamage(this,attacker,Math.min(defender.strength,loss));
      received.strength += loss; received.morale += 2.4 * dt * effort; received.cohesion += 3.2 * dt * effort;
      damage.set(defender, received);
    }
    for (const [unit, loss] of damage) {
      unit.strength = Math.max(0, unit.strength - loss.strength);
      unit.morale = clamp(unit.morale - loss.morale);
      unit.cohesion = clamp(unit.cohesion - loss.cohesion);
      if (unit.morale < 18 || unit.cohesion < 14 || unit.strength < unit.initialStrength * 0.18) this.route(unit);
    }
    this.updateCrownOrders();
    updateDefense(this, dt);
    updateCowpens(this, dt);
    this.checkOutcome();
  }

  navigationTarget(unit) {
    if (!['brandywine','bunker_hill'].includes(this.battleId) && !structuresFor(this.battleId).length) return unit.target;
    const clearance={...unit,navigationMargin:12};
    const goal = resolveDestination(this.battleId, unit.target, clearance);
    if (!goal) return null;
    unit.target={...goal};
    if (segmentClear(this.battleId, unit, goal, clearance)) { this.navigation.delete(unit.id); return goal; }
    let plan = this.navigation.get(unit.id);
    if (!plan || distance(plan.goal,goal) >= 12 || !plan.points.length || !segmentClear(this.battleId,unit,plan.points[0],clearance)) {
      plan = {goal, points: routeTo(this.battleId,unit,goal,clearance) || []};
      this.navigation.set(unit.id,plan);
    }
    // Yielding can carry a formation beyond a corner waypoint. Continue to a
    // later visible waypoint instead of turning back into the passing ranks.
    for(let i=plan.points.length-1;i>0;i--)if(segmentClear(this.battleId,unit,plan.points[i],clearance)){plan.points.splice(0,i);break;}
    while(plan.points.length && distance(unit,plan.points[0]) < .1) plan.points.shift();
    return plan.points[0] || null;
  }

  advanceUnit(unit, dt) {
    if (departEscapingUnit(this, unit)) return;
    const evacuation = this.config.evacuation;
    if (evacuation && unit.side === 'continental' && unit.order === 'withdraw' && unit.status !== 'routed' && atEvacuationExit(unit, evacuation)) {
      if (evacuation.kind !== 'road') unit.x = evacuation.exitX;
      unit.moving = false;
      if (this.time >= evacuation.opensAt && !evacuationStatus(this).blocked) {
        unit.active = false; unit.status = 'withdrawn'; unit.evacuated = true;
        this.events.push({ time: this.time, type: 'withdrawal', message: `${unit.name} has ${evacuation.kind === 'road' ? 'reached the Chester Road' : 'evacuated'} with ${Math.round(unit.strength)} troops.` });
      }
      return;
    }
    unit.navigationBlocked = false;
    unit.waitingFor = null;
    if (unit.order === 'hold' || unit.order === 'reform') { unit.moving = false; return; }
    const target = this.navigationTarget(unit);
    if (!target) { unit.moving = false; unit.navigationBlocked = true; return; }
    const gap = distance(unit, target);
    unit.moving = false;
    if (gap < 0.1 && unit.order === 'fallback') { unit.order='hold'; return; }
    if (gap < 0.1 || unit.order === 'hold' || unit.order === 'reform') return;
    const speedBase = unit.type === 'artillery' ? 17 : unit.type === 'cavalry' ? 54 : unit.formationMode === 'column' ? 42 : 30;
    const speed = speedBase * (unit.order==='fallback' ? .92 : 1) * (1 - unit.fatigue / 190) * this.terrainAt(unit).move;
    let step = Math.min(gap, speed * dt);
    unit.moving = step > 0.01;
    if(unit.order!=='fallback')unit.facing = Math.atan2(target.y - unit.y, target.x - unit.x);
    let spacedStep=spaceFriendlyStep(unit,this.formations,{x:(target.x-unit.x)/gap*step,y:(target.y-unit.y)/gap*step});
    if (!segmentClear(this.battleId,unit,{x:unit.x+spacedStep.x,y:unit.y+spacedStep.y},unit)) {
      spacedStep={x:(target.x-unit.x)/gap*step,y:(target.y-unit.y)/gap*step};
      if (!segmentClear(this.battleId,unit,{x:unit.x+spacedStep.x,y:unit.y+spacedStep.y},unit)) { unit.moving=false;unit.navigationBlocked=true;return; }
    }
    const contactStep=constrainFormationStep(unit,this.formations,spacedStep,target,(a,b)=>b.x>=55&&b.x<=1145&&b.y>=45&&b.y<=635&&segmentClear(this.battleId,a,b,unit));
    spacedStep=contactStep.step;
    unit.waitingFor=contactStep.waitingFor;
    unit.moving=Math.hypot(spacedStep.x,spacedStep.y)>.01;
    unit.x += spacedStep.x;
    unit.y += spacedStep.y;
    if(unit.moving&&unit.order!=='fallback')unit.facing=Math.atan2(spacedStep.y,spacedStep.x);
    if(unit.moving)unit.fatigue = clamp(unit.fatigue + dt * 0.25);
    if (unit.order === 'withdraw' && (unit.x < -65 || unit.x > TRENTON_WORLD.width + 65 || unit.y < -65 || unit.y > TRENTON_WORLD.height + 65)) {
      unit.active = false;
      unit.moving = false;
      if (unit.status !== 'routed') unit.status = 'withdrawn';
      this.events.push({ time: this.time, type: 'withdrawal', message: `${unit.name} has left the field.` });
    }
  }

  fire(attacker, defender, range) {
    // A moving battery cannot discharge. Keep a requested volley queued until
    // it halts; rejected fire must not consume ammunition or reset the reload.
    if (!lineOfFireClear(this.battleId,attacker,defender) || (attacker.type === 'artillery' && attacker.moving)) return;
    attacker.volleyRequested = false;
    attacker.reload = attacker.type === 'artillery' ? 3.2 : 1.8;
    attacker.ammunition -= 1;
    attacker.volleySerial += 1;
    const rangeFactor = clamp(1 - range / (attacker.type === 'artillery' ? 600 : 360), 0.25, 1);
    const posture = attacker.formationMode === 'line' ? 1.15 : attacker.formationMode === 'open' ? 0.82 : 0.92;
    const surprise = this.battleId === 'trenton' && attacker.side === 'continental' && this.time < 38 ? 1.28 : 1;
    const noise = 0.82 + seededNoise(this.seed + attacker.volleySerial * 31 + Math.round(this.time)) * 0.36;
    const loss = Math.max(1, Math.round((attacker.type === 'artillery' ? 20 : 9) * rangeFactor * posture * surprise * noise / this.terrainAt(defender).defense));
    recordCowpensFire(this,attacker,range);
    recordCowpensDamage(this,attacker,Math.min(defender.strength,loss));
    defender.strength = Math.max(0, defender.strength - loss);
    defender.cohesion = clamp(defender.cohesion - loss * 0.18 - (surprise > 1 ? 2 : 0));
    defender.morale = clamp(defender.morale - loss * 0.1 - (surprise > 1 ? 1.5 : 0));
  }

  updateCrownOrders() {
    if (this.time < this.nextCrownDecision) return;
    this.nextCrownDecision = this.time + 2;
    const enemies = this.formations.filter(unit => unit.side === 'continental' && unit.active && unit.status !== 'routed');
    const assigned = new Map();
    for (const unit of this.formations.filter(entry => entry.side === 'crown' && entry.active && entry.status !== 'routed').sort((a,b) => a.id.localeCompare(b.id))) {
      if (unit.retiring) continue;
      if (!enemies.length) { unit.order = 'hold'; unit.targetId = null; continue; }
      // Discourage every regiment pursuing the same nearest opponent. Retain
      // an existing assignment unless another approach is materially better.
      const enemy = chooseCrownTarget(unit, enemies, assigned, {
        isContact: (attacker, defender) => inFormationContact(attacker, defender) && segmentClear(this.battleId, attacker, defender),
      });
      assigned.set(enemy.id, (assigned.get(enemy.id) || 0) + 1);
      unit.targetId = enemy.id;
      const range = distance(unit, enemy);
      if (this.time > (unit.advanceAt ?? this.config.enemyAdvanceAt) && (!lineOfFireClear(this.battleId,unit,enemy) || range > (unit.type === 'artillery' ? 320 : unit.type === 'cavalry' ? 55 : (this.config.enemyStandOff ? this.config.enemyStandOff+2 : 180)))) {
        unit.order = 'advance';
        unit.target = this.approachPoint(unit, enemy);
        unit.facing = Math.atan2(enemy.y - unit.y, enemy.x - unit.x);
      } else {
        unit.order = 'hold';
        unit.target = { x: unit.x, y: unit.y };
      }
    }
  }

  activateReinforcements() {
    for (const reinforcement of this.config.reinforcements || []) {
      const unit = this.formations.find((entry) => entry.id === reinforcement.id);
      if (!unit || unit.entered || this.time < reinforcement.at) continue;
      unit.active = true;
      unit.entered = true;
      unit.order = reinforcement.order || 'advance';
      this.events.push({ time: this.time, type: 'reinforcement', message: reinforcement.message });
    }
  }

  route(unit) {
    if (unit.status === 'routed') return;
    unit.status = 'routed';
    unit.order = 'withdraw';
    unit.target = withdrawalDestination(this.battleId,unit);
    this.events.push({ time: this.time, type: 'route', message: `${unit.name} has broken from the field.` });
  }

  checkOutcome() {
    const crown = this.formations.filter((unit) => unit.side === 'crown');
    const continentals = this.formations.filter((unit) => unit.side === 'continental');
    const crownActive = crown.some((unit) => unit.status !== 'routed' && unit.status !== 'withdrawn' && (unit.active || !unit.entered));
    const continentalActive = continentals.some((unit) => (unit.active || !unit.entered) && unit.status !== 'routed' && unit.status !== 'withdrawn' && unit.type !== 'artillery');
    if (this.config.escape) {
      const goal=escapeStatus(this);
      if(goal.escaped>goal.allowed)this.outcome='defeat';
      else if(!crownActive)this.outcome='victory';
      else if(!continentalActive)this.outcome=continentals.some(u=>u.status==='withdrawn'&&u.type!=='artillery') ? 'withdrawal' : 'defeat';
      else if(this.time>=this.config.timeLimit)this.outcome='defeat';
      return;
    }
    if (!crownActive) this.outcome = 'victory';
    else if (this.config.counterattackObjective) {
      const goal=cowpensStatus(this);
      if(goal.complete)this.outcome="victory";
      else if(!continentalActive)this.outcome=continentals.some(u=>u.status==="withdrawn"&&u.type!=="artillery") ? "withdrawal" : "defeat";
      else if(this.time>=this.config.timeLimit)this.outcome="defeat";
    }
    else if (this.config.evacuation) {
      const goal = evacuationStatus(this);
      const earned = goal.saved >= goal.required && goal.screenSeconds >= goal.requiredScreen - 1e-6;
      if (earned && (goal.withdrawing === 0 || this.time >= this.config.timeLimit)) this.outcome = 'withdrawal';
      else if (!continentalActive || this.time >= this.config.timeLimit) this.outcome = 'defeat';
    }
    else if (this.config.defenseObjective) {
      const goal = defenseStatus(this);
      if ((!goal.requireUntilDeadline || this.time >= this.config.timeLimit) && goal.holding && goal.seconds >= goal.requiredSeconds - 1e-6 && goal.fighting >= goal.requiredArmy) this.outcome = 'victory';
      else if (!continentalActive) this.outcome = continentals.some(unit => unit.status === 'withdrawn' && unit.type !== 'artillery') ? 'withdrawal' : 'defeat';
      else if (this.time >= this.config.timeLimit) this.outcome = 'defeat';
    }
    else if (this.config.repulseObjective) {
      if (!continentalActive) this.outcome = continentals.some(u=>u.status==='withdrawn'&&u.type!=='artillery') ? 'withdrawal' : 'defeat';
      else if (this.time >= this.config.timeLimit) this.outcome = repulseStatus(this).ready ? 'victory' : 'defeat';
    }
    else if (!continentalActive) this.outcome = continentals.some((unit) => unit.status === 'withdrawn' && unit.type !== 'artillery') ? 'withdrawal' : 'defeat';
    else if (this.time >= this.config.timeLimit) {
      const crownLoss = 1 - crown.reduce((sum, unit) => sum + unit.strength, 0) / crown.reduce((sum, unit) => sum + unit.initialStrength, 0);
      this.outcome = crownLoss >= this.config.holdVictoryLoss ? (this.config.holdOutcome || 'withdrawal') : 'defeat';
    }
  }

  snapshot() {
    const sideLoss = (side) => {
      const units = this.formations.filter((unit) => unit.side === side);
      return 1 - units.reduce((sum, unit) => sum + unit.strength, 0) / units.reduce((sum, unit) => sum + unit.initialStrength, 0);
    };
    return {
      time: this.time,
      outcome: this.outcome,
      objective: this.objectiveStatus(),
      formations: this.formations.map((unit) => ({ ...unit, reformBlocked: this.reformBlocked(unit), fireObstacle: blockingStructure(this.battleId,unit,this.combatTarget(unit))?.id || null, terrain: this.terrainAt(unit).label, target: { ...unit.target } })),
      continentalLossRate: sideLoss('continental'),
      crownLossRate: sideLoss('crown'),
      events: [...this.events],
    };
  }
}
