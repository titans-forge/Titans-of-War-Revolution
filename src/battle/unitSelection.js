// Coordinates arrive in container-local space: Phaser handles camera and perspective scale.
// Read current child geometry so casualties, formation changes, reload and flag motion track art.
export function containsUnitArt(area, x, y) {
  if (!area || !Array.isArray(area.pieces) || !Number.isFinite(x) || !Number.isFinite(y)) return false;
  return area.pieces.some(piece => {
    if (!piece || piece.visible === false || piece.alpha === 0) return false;
    const width = Math.abs(piece.displayWidth), height = Math.abs(piece.displayHeight);
    if (!Number.isFinite(width) || !Number.isFinite(height) || !width || !height) return false;
    const angle = piece.rotation || 0, cos = Math.cos(angle), sin = Math.sin(angle);
    const dx = x - piece.x, dy = y - piece.y;
    const localX = dx * cos + dy * sin, localY = -dx * sin + dy * cos;
    const left = -width * (piece.originX ?? .5), top = -height * (piece.originY ?? .5);
    const padding = 3;
    return localX >= left-padding && localX <= left+width+padding && localY >= top-padding && localY <= top+height+padding;
  });
}
