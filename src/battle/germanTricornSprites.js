// Approved standalone textures for the representative German auxiliary profile.
// Registration uses measured hat-to-boot body height, never musket dimensions.
const COMMON_BODY_HEIGHT = 1131;

export const GERMAN_TRICORN_SPRITES = Object.freeze({
  provenance: Object.freeze({
    scope: 'Representative German auxiliary game art matched to the existing illustrative sheets.',
    limitation: 'Not a regiment-specific uniform reconstruction. Firing and carry are posed states, not full animation cycles.',
  }),
  commonBodyHeight: COMMON_BODY_HEIGHT,
  fire: Object.freeze({
    key: 'german-tricorn-fire-v2', path: '/images/units/german-tricorn-fire-v2.png',
    width: 1254, height: 1254, sha256: '707f50e7ada355ad50e8494a519f1bc9ef82273aab6b661099c41b92a68f916d',
    frame: Object.freeze({x:121,y:50,width:1127,height:1147}),
    bodyTopY: 58, bootLineY: 1188, bodyHeight: 1131,
    bootAnchor: Object.freeze({x:477,y:1188}), origin: Object.freeze({x:477/1254,y:1188/1254}), scaleToCommonBody: 1,
  }),
  carry: Object.freeze({
    key: 'german-tricorn-carry-v2', path: '/images/units/german-tricorn-carry-v2.png',
    width: 1254, height: 1254, sha256: '9bc864f2bd295b3543494ca2d55831d1945726aa1cc74e3b2d7cd3101301e64e',
    frame: Object.freeze({x:394,y:4,width:469,height:1241}),
    bodyTopY: 174, bootLineY: 1236, bodyHeight: 1063,
    bootAnchor: Object.freeze({x:635,y:1236}), origin: Object.freeze({x:635/1254,y:1236/1254}), scaleToCommonBody: COMMON_BODY_HEIGHT/1063,
  }),
});

export function germanTricornSprite(state) {
  if (!['carry','fire'].includes(state)) throw new Error(`Unknown German tricorn sprite state: ${state}`);
  return GERMAN_TRICORN_SPRITES[state];
}

// Eight transparent pixels around the measured meaningful bounds keep the hit
// frame tight while preserving the complete weapon. Asset pixels stay unchanged.
export function germanSpritePlacement(state,bodyHeight,facing) {
  const sprite=germanTricornSprite(state),f=sprite.frame;
  const x=(sprite.bootAnchor.x-f.x)/f.width;
  return {key:sprite.key,frame:'body',scale:bodyHeight/sprite.bodyHeight,
    originX:Math.cos(facing)>=0?x:1-x,originY:(sprite.bootAnchor.y-f.y)/f.height};
}
