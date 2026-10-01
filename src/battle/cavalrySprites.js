// Four illustrated movement poses per mounted identity. The RGB source is
// keyed only in runtime textures; original source pixels are retained.
const DATA = [[[23, 16, 418, 397, 235], [450, 15, 408, 397, 653], [882, 15, 421, 400, 1091], [1314, 16, 422, 399, 1528]], [[23, 441, 416, 398, 235], [451, 441, 410, 398, 653], [883, 439, 421, 402, 1091], [1317, 439, 421, 401, 1528]]];
export const CAVALRY_TROT_SPRITES = Object.freeze(DATA.map((poses, side) => Object.freeze(poses.map(([x,y,width,height,anchorX], frameIndex) => Object.freeze({
 profile: side * 2, frameIndex, key: 'revolution-cavalry-trot-v1',
 path: '/images/units/revolution-cavalry-trot-v1.png',
 sha256: '527080673a645d29e6e3ce37833f0104721bd2dbe767b56a9c38d73aef8d62c3', width:1774, height:887, chroma:'magenta', padding:2,
 frame:Object.freeze({x:x-4,y:y-4,width:width+8,height:height+8}),
 alphaBounds:Object.freeze({x,y,width,height}), bodyHeight:height,
 groundAnchor:Object.freeze({x:anchorX,y:y+height-1}),
 runtimeKey:`revolution-cavalry-trot-${side}-${frameIndex}`,
})))));

export function cavalrySpritePlacement(profile, frameIndex, bodyHeight, facing) {
 if (![0,2].includes(profile) || ![0,1,2,3].includes(frameIndex) || !Number.isFinite(bodyHeight) || bodyHeight<=0 || !Number.isFinite(facing)) return null;
 const s=CAVALRY_TROT_SPRITES[profile/2][frameIndex], f=s.frame;
 const x=(s.groundAnchor.x-f.x+s.padding)/(f.width+2*s.padding);
 return {key:s.runtimeKey,frame:'body',scale:bodyHeight/s.bodyHeight,
  originX:Math.cos(facing)>=0?x:1-x,originY:(s.groundAnchor.y-f.y+s.padding)/(f.height+2*s.padding)};
}
