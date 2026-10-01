const length = (x, y) => Math.hypot(x, y);

const DEFAULTS = {
  separation: 96,
  lookAhead: 3,
  maxSteerRatio: 0.25,
  destinationFade: 70,
  contactRange: 74,
  minX: 55,
  maxX: 1145,
  minY: 45,
  maxY: 635,
};

function canSteer(unit) {
  return unit?.active !== false
    && unit.status !== 'routed'
    && unit.retiring !== true
    && (unit.order === 'advance' || unit.order === 'attack');
}

function pairSide(unit, friend) {
  return String(unit.id).localeCompare(String(friend.id)) < 0 ? -1 : 1;
}

/**
 * Return a bounded movement delta that sidesteps converging friendly centers.
 * The helper never mutates units and never moves a stationary formation.
 */
export function spaceFriendlyStep(unit, formations, desiredStep, options = {}) {
  const settings = { ...DEFAULTS, ...options };
  const stepLength = length(desiredStep?.x || 0, desiredStep?.y || 0);
  if (!canSteer(unit) || stepLength <= 0.0001) return { x: desiredStep?.x || 0, y: desiredStep?.y || 0 };

  const targetDistance = length((unit.target?.x ?? unit.x) - unit.x, (unit.target?.y ?? unit.y) - unit.y);
  const fadeRatio = Math.min(1, targetDistance / Math.max(1, settings.destinationFade));
  const fade = targetDistance <= stepLength ? 0 : fadeRatio * fadeRatio;
  if (fade <= 0.001) return { x: desiredStep.x, y: desiredStep.y };

  // Friendly spacing must not prevent the last movement into opposing contact.
  const enemyClose = formations.some((other) => other !== unit
    && other.active !== false
    && other.status !== 'routed'
    && other.side !== unit.side
    && length(other.x - unit.x, other.y - unit.y) <= settings.contactRange + stepLength);
  if (enemyClose) return { x: desiredStep.x, y: desiredStep.y };

  const forwardX = desiredStep.x / stepLength;
  const forwardY = desiredStep.y / stepLength;
  const lateralX = -forwardY;
  const lateralY = forwardX;
  let steer = 0;

  for (const friend of formations) {
    if (friend === unit || friend.active === false || friend.status === 'routed' || friend.retiring === true || friend.side !== unit.side) continue;
    const relativeX = friend.x - unit.x;
    const relativeY = friend.y - unit.y;
    const friendTargetX = (friend.target?.x ?? friend.x) - friend.x;
    const friendTargetY = (friend.target?.y ?? friend.y) - friend.y;
    const friendGap = length(friendTargetX, friendTargetY);
    const friendMoves = canSteer(friend) && friendGap > 0.001;
    const friendStepX = friendMoves ? friendTargetX / friendGap * stepLength : 0;
    const friendStepY = friendMoves ? friendTargetY / friendGap * stepLength : 0;
    const relativeVelocityX = friendStepX - desiredStep.x;
    const relativeVelocityY = friendStepY - desiredStep.y;
    const velocitySquared = relativeVelocityX ** 2 + relativeVelocityY ** 2;
    const horizon = settings.separation / stepLength * settings.lookAhead;
    const closestTick = velocitySquared > 0.0001
      ? Math.max(0, Math.min(horizon, -(relativeX * relativeVelocityX + relativeY * relativeVelocityY) / velocitySquared))
      : 0;
    const closestX = relativeX + relativeVelocityX * closestTick;
    const closestY = relativeY + relativeVelocityY * closestTick;
    const closestDistance = length(closestX, closestY);
    if (closestDistance >= settings.separation) continue;

    const urgency = 1 - closestTick / Math.max(1, horizon);
    const influence = (1 - closestDistance / settings.separation) * urgency * urgency;
    steer += pairSide(unit, friend) * influence;
  }

  if (Math.abs(steer) <= 0.0001) return { x: desiredStep.x, y: desiredStep.y };
  const normalized = Math.max(-1, Math.min(1, steer));
  const lateralRatio = normalized * settings.maxSteerRatio * fade;
  const scale = stepLength / Math.hypot(1, lateralRatio);
  // Rotate the requested movement without increasing its length or reversing progress.
  const steeredX = forwardX * scale + lateralX * lateralRatio * scale;
  const steeredY = forwardY * scale + lateralY * lateralRatio * scale;
  return {
    x: Math.max(settings.minX, Math.min(settings.maxX, unit.x + steeredX)) - unit.x,
    y: Math.max(settings.minY, Math.min(settings.maxY, unit.y + steeredY)) - unit.y,
  };
}
