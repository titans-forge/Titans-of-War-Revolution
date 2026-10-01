import assert from 'node:assert/strict';
import { containsUnitArt } from '../src/battle/unitSelection.js';

const piece = (x, y, displayWidth, displayHeight, extra = {}) => ({
  x, y, displayWidth, displayHeight, originX: 0.5, originY: 0.5, visible: true, alpha: 1, rotation: 0, ...extra,
});

{
  const battery = { pieces: [
    piece(0, 12, 64, 24, { originY: 1 }),
    piece(-25, -7, 18, 34, { originY: 1 }),
    piece(17, -5, 18, 34, { originY: 1 }),
  ] };
  assert.equal(containsUnitArt(battery, 80, 15), false, 'old 200x110 artillery false-positive must be rejected');
  assert.equal(containsUnitArt(battery, 0, 10), true, 'visible gun selects the battery');
  assert.equal(containsUnitArt(battery, -25, -20), true, 'visible crew selects the battery');
  assert.equal(containsUnitArt(battery, 50, -20), false, 'empty ground between and beyond artillery pieces is not selectable');
}

{
  const line = { pieces: [piece(-30, 0, 10, 20), piece(30, 0, 10, 20)] };
  assert.equal(containsUnitArt(line, -30, 0), true);
  assert.equal(containsUnitArt(line, 0, 0), false, 'a visible gap between formation groups remains ground');

  line.pieces = [piece(-30, 0, 10, 20)];
  assert.equal(containsUnitArt(line, 30, 0), false, 'casualty rebuild removes stale selection geometry');
  line.pieces.push(piece(45, -18, 8, 28, { originY: 1 }));
  assert.equal(containsUnitArt(line, 45, -30), true, 'newly rebuilt standard or figure geometry becomes selectable');
}

{
  const bottomOrigin = { pieces: [piece(10, 20, 12, 24, { originY: 1 })] };
  assert.equal(containsUnitArt(bottomOrigin, 10, 0), true, 'bottom-origin sprite includes visible art above its anchor');
  assert.equal(containsUnitArt(bottomOrigin, 10, 25), false, 'bottom-origin sprite excludes ground below its feet');

  const rotated = { pieces: [piece(0, 0, 40, 8, { rotation: Math.PI / 2 })] };
  assert.equal(containsUnitArt(rotated, 0, 17), true, 'rotation transforms a horizontal piece into its visible vertical extent');
  assert.equal(containsUnitArt(rotated, 17, 0), false, 'rotation does not retain the unrotated wide hit area');
}

{
  const hidden = { pieces: [
    piece(0, 0, 20, 20, { visible: false }),
    piece(30, 0, 20, 20, { alpha: 0 }),
    piece(60, 0, Number.NaN, 20),
    piece(90, 0, 0, 20),
  ] };
  for (const x of [0, 30, 60, 90]) assert.equal(containsUnitArt(hidden, x, 0), false, 'hidden or invalid art cannot select a unit');
  assert.equal(containsUnitArt({ pieces: [] }, 0, 0), false);
  assert.equal(containsUnitArt({ pieces: [] }, Number.NaN, 0), false);
  assert.equal(containsUnitArt({ pieces: [] }, 0, Infinity), false);
  assert.equal(containsUnitArt(null, 0, 0), false, 'invalid hit-area input is safely rejected');
  assert.equal(containsUnitArt({}, 0, 0), false, 'missing piece geometry is safely rejected');
}

console.log('Unit selection passed: art-only battery hits, gaps, rebuilds, origins, rotation, and invalid geometry.');
