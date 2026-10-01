// Representative reload poses matched to the existing four infantry profiles.
// Registration uses measured hat-to-boot body height, independent of musket span.
const KEY = 'revolution-infantry-reload-v1';
const PATH = '/images/units/revolution-infantry-reload-v1.png';

const makeProfile = (profile, frame, alphaBounds, bodyTopY, bootLineY, bootAnchorX) => Object.freeze({
  profile, key: KEY, path: PATH, width: 1254, height: 1254,
  sha256: '2144e3d222f9ed412d459a30378e4ad5fd40522691faa6a0ff85fef64a247498',
  frame: Object.freeze(frame), alphaBounds: Object.freeze(alphaBounds),
  bodyTopY, bootLineY, bodyHeight: bootLineY-bodyTopY+1,
  bootAnchor: Object.freeze({x:bootAnchorX,y:bootLineY}),
});

export const INFANTRY_RELOAD_SPRITES = Object.freeze({
  provenance: Object.freeze({
    scope: 'Representative reload poses matched to the existing four illustrative infantry profiles.',
    limitation: 'Broad visual identities only; no regiment-specific reconstruction or complete reload animation is claimed.',
  }),
  0: makeProfile(0,{x:144,y:20,width:481,height:612},{x:152,y:28,width:465,height:596},28,623,324),
  1: makeProfile(1,{x:762,y:27,width:484,height:602},{x:770,y:35,width:468,height:586},35,620,943),
  2: makeProfile(2,{x:147,y:636,width:475,height:601},{x:155,y:644,width:459,height:585},644,1228,324),
  3: makeProfile(3,{x:755,y:647,width:495,height:590},{x:763,y:655,width:479,height:574},655,1228,934),
});

export function infantryReloadSprite(profile) {
  return [0,1,2,3].includes(profile) ? INFANTRY_RELOAD_SPRITES[profile] : null;
}

export function reloadSpritePlacement(profile,bodyHeight,facing) {
  const sprite=infantryReloadSprite(profile);
  if(!sprite || !Number.isFinite(bodyHeight) || bodyHeight <= 0 || !Number.isFinite(facing))return null;
  const frame=sprite.frame;
  const x=(sprite.bootAnchor.x-frame.x)/frame.width;
  return {key:sprite.key,frame:`reload-${profile}`,scale:bodyHeight/sprite.bodyHeight,
    originX:Math.cos(facing)>=0?x:1-x,originY:(sprite.bootAnchor.y-frame.y)/frame.height};
}
