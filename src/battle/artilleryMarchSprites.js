// Complete source cutouts, ground anchors and hip alignment measured after chroma keying.
const bounds=[
 [[40,4,266,365,166,366],[398,1,249,366,522,364],[292,3,292,365,449,365],[883,4,212,367,965,368]],
 [[53,378,249,340,177,715],[413,379,196,339,528,715],[296,381,250,336,450,714],[880,382,147,338,963,717]],
 [[54,731,307,336,163,1064],[407,730,308,337,523,1064],[292,732,334,335,447,1064],[880,732,266,336,963,1065]],
];
export const ARTILLERY_MARCH_SPRITES=bounds.map((row,role)=>row.map(([x,y,width,height,ax,ay],pose)=>{
 const key=`revolution-gunner-march-${pose<2?'a':'b'}-v1`;
 return {key,path:`/images/units/${key}.png`,runtimeKey:`gunner-march-${role}-${pose}`,padding:2,frame:{x,y,width,height},anchor:{x:ax,y:ay},bodyHeight:role===0?363:334};
}));
export function artilleryMarchReady(role,hasTexture){return Number.isInteger(role)&&role>=0&&role<3&&ARTILLERY_MARCH_SPRITES[role].every(s=>hasTexture(s.runtimeKey));}
export function artilleryMarchFrame(unit,travel,phase=0){
 if(!unit?.active||unit.type!=='artillery'||!unit.moving||!['steady','routed'].includes(unit.status)||unit.order==='fallback'||!Number.isFinite(travel))return null;
 const p=travel+(Number.isFinite(phase)?phase:0),cycle=((p%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
 return Math.floor(cycle/(Math.PI/2));
}
export function artilleryMarchPlacement(role,pose,facing){
 const s=ARTILLERY_MARCH_SPRITES[role]?.[pose];if(!s||!Number.isFinite(facing))return null;
 const f=s.frame,p=s.padding,x=(s.anchor.x-f.x+p)/(f.width+2*p);
 return {key:s.runtimeKey,frame:'body',scale:34/s.bodyHeight,originX:Math.cos(facing)<0?1-x:x,originY:(s.anchor.y-f.y+p)/(f.height+2*p)};
}
