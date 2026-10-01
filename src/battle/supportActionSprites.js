const cavalryData=[
 [{x:124,y:5,width:522,height:496,anchorX:385,anchorY:494},{x:851,y:9,width:559,height:491,anchorX:1112,anchorY:494}],
 [{x:123,y:508,width:523,height:494,anchorX:385,anchorY:996},{x:851,y:511,width:560,height:492,anchorX:1112,anchorY:996}],
];
const make=(data,key,runtimeKey,bodyHeight)=>Object.freeze({key,path:`/images/units/${key}.png`,runtimeKey,padding:2,
 frame:{x:data.x,y:data.y,width:data.width,height:data.height},anchor:{x:data.anchorX,y:data.anchorY},bodyHeight});
export const CAVALRY_CONTACT_SPRITES=cavalryData.map((row,side)=>row.map((data,pose)=>make(data,'revolution-cavalry-contact-v1',`cavalry-contact-${side}-${pose}`,480)));
export const ARTILLERY_HAUL_SPRITES=[
 {x:68,y:6,width:1287,height:486,anchorX:864,anchorY:467},
 {x:55,y:507,width:1300,height:491,anchorX:864,anchorY:969},
].map((data,pose)=>make(data,'revolution-artillery-haul-v1',`artillery-haul-${pose}`,974));
function placement(s,size,facing) {
 if(!s||!Number.isFinite(size)||size<=0||!Number.isFinite(facing))return null;
 const x=(s.anchor.x-s.frame.x+s.padding)/(s.frame.width+s.padding*2);
 return {key:s.runtimeKey,frame:'body',scale:size/s.bodyHeight,originX:Math.cos(facing)>=0?x:1-x,
  originY:(s.anchor.y-s.frame.y+s.padding)/(s.frame.height+s.padding*2)};
}
export function cavalryContactPlacement(profile,pose,height,facing) {
 return [0,2].includes(profile)&&[0,1].includes(pose)?placement(CAVALRY_CONTACT_SPRITES[profile/2][pose],height,facing):null;
}
export function artilleryHaulPlacement(pose,facing) {
 return [0,1].includes(pose)?placement(ARTILLERY_HAUL_SPRITES[pose],64,facing):null;
}

export function cavalryContactReady(profile,hasTexture){return [0,2].includes(profile)&&CAVALRY_CONTACT_SPRITES[profile/2].every(s=>hasTexture(s.runtimeKey));}

export function artilleryHaulReady(hasTexture){return ARTILLERY_HAUL_SPRITES.every(s=>hasTexture(s.runtimeKey));}
