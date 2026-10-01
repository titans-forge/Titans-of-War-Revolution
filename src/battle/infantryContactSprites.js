// Representative guarded close-combat poses matched to the four illustrative
// infantry profiles. The original RGBA guard and keyed thrust remain separate.
const KEY='revolution-infantry-contact-guard-v1',PATH='/images/units/revolution-infantry-contact-guard-v1.png';
const make=(profile,frame,alphaBounds,bodyTopY,bootLineY,bootAnchorX)=>Object.freeze({
  profile,frameIndex:0,key:KEY,path:PATH,width:1254,height:1254,
  sha256:'6c8ec6076c38e93585814ee90fe106710140dcf75be95e659cab7db121182e9a',
  frame:Object.freeze(frame),alphaBounds:Object.freeze(alphaBounds),bodyTopY,bootLineY,
  bodyHeight:bootLineY-bodyTopY+1,bootAnchor:Object.freeze({x:bootAnchorX,y:bootLineY}),
});
export const INFANTRY_CONTACT_SPRITES=Object.freeze({
  provenance:Object.freeze({scope:'Representative guarded close-combat poses for four broad illustrative infantry profiles.',limitation:'One guarded pose only; no regiment-specific reconstruction, firing event, impact, or complete melee cycle is claimed.'}),
  0:make(0,{x:35,y:1,width:612,height:613},{x:43,y:9,width:600,height:591},9,599,210),
  1:make(1,{x:647,y:2,width:607,height:612},{x:653,y:10,width:596,height:589},10,598,818),
  2:make(2,{x:44,y:614,width:611,height:617},{x:52,y:628,width:593,height:595},628,1222,219),
  3:make(3,{x:655,y:614,width:572,height:617},{x:667,y:633,width:552,height:590},633,1222,861),
});
const THRUST_DATA=[
 [{x:108,y:19,width:610,height:495},27,505,284],
 [{x:867,y:18,width:594,height:496},26,505,1050],
 [{x:109,y:519,width:610,height:482},527,992,285],
 [{x:872,y:519,width:543,height:482},527,992,1065],
];
export const INFANTRY_THRUST_SPRITES=Object.freeze(THRUST_DATA.map(([frame,top,bottom,anchor],profile)=>Object.freeze({
 profile,frameIndex:1,key:'revolution-infantry-contact-thrust-v1',runtimeKey:`revolution-infantry-thrust-${profile}`,
 path:'/images/units/revolution-infantry-contact-thrust-v1.png',width:1536,height:1024,chroma:'magenta',padding:2,
 sha256:'ab1a715cceff5c8075785f2922a77b92f57cac1e75b7ade9f2fd74c6e5498d09',
 frame:Object.freeze(frame),bodyTopY:top,bootLineY:bottom,bodyHeight:bottom-top+1,bootAnchor:Object.freeze({x:anchor,y:bottom}),
})));
export function infantryContactSprite(profile,frameIndex=0){
 if(![0,1,2,3].includes(profile))return null;
 return frameIndex===0?INFANTRY_CONTACT_SPRITES[profile]:frameIndex===1?INFANTRY_THRUST_SPRITES[profile]:null;
}
export function contactSpritePlacement(profile,frameIndex,bodyHeight,facing){
  const sprite=infantryContactSprite(profile,frameIndex);
  if(!sprite||!Number.isFinite(bodyHeight)||bodyHeight<=0||!Number.isFinite(facing))return null;
  const f=sprite.frame,p=sprite.padding||0,x=(sprite.bootAnchor.x-f.x+p)/(f.width+2*p);
  return {key:sprite.runtimeKey||sprite.key,frame:frameIndex===1?'body':`contact-${profile}-0`,scale:bodyHeight/sprite.bodyHeight,
    originX:Math.cos(facing)>=0?x:1-x,originY:(sprite.bootAnchor.y-f.y+p)/(f.height+2*p)};
}
