// Two representative marching poses per infantry profile. Frame 0 is a wide
// stride; frame 1 is a passing step with a raised trailing heel.
const ATLAS=[
  {key:'revolution-infantry-march-a-v1',path:'/images/units/revolution-infantry-march-a-v1.png',sha256:'739d144aa35971fb40c901b98c882a1cf3170efff23cfa9cb671d4ed4f31afc7'},
  {key:'revolution-infantry-march-b-v1',path:'/images/units/revolution-infantry-march-b-v1.png',sha256:'9f634a1e66a9c3c6b8e0cc60e06ad6d9c95185a31128cd310fffacca3eba0c7a'},
];
const DATA=[
 [
  [{x:238,y:14,width:261,height:620},{x:246,y:22,width:245,height:609},103,630,422],
  [{x:867,y:14,width:260,height:620},{x:875,y:22,width:244,height:609},104,630,1050],
  [{x:239,y:634,width:271,height:605},{x:247,y:636,width:255,height:595},714,1230,428],
  [{x:870,y:634,width:271,height:605},{x:878,y:637,width:255,height:594},719,1230,1062],
 ],[
  [{x:233,y:0,width:252,height:636},{x:241,y:7,width:236,height:627},73,633,431],
  [{x:821,y:2,width:253,height:632},{x:829,y:10,width:237,height:624},74,633,1012],
  [{x:235,y:636,width:255,height:614},{x:243,y:638,width:239,height:604},701,1241,437],
  [{x:824,y:634,width:248,height:617},{x:832,y:634,width:232,height:609},707,1242,1024],
 ]];

export const INFANTRY_MARCH_SPRITES=Object.freeze(DATA.map((poses,frameIndex)=>Object.freeze(poses.map((d,profile)=>Object.freeze({
 profile,frameIndex,...ATLAS[frameIndex],width:1254,height:1254,frame:Object.freeze(d[0]),alphaBounds:Object.freeze(d[1]),
 runtimeKey:`${ATLAS[frameIndex].key}-profile-${profile}`,padding:2,
 bodyTopY:d[2],bootLineY:d[3],bodyHeight:d[3]-d[2]+1,bootAnchor:Object.freeze({x:d[4],y:d[3]}),
})))));

export function infantryMarchSprite(profile,frameIndex){return [0,1,2,3].includes(profile)&&[0,1].includes(frameIndex)?INFANTRY_MARCH_SPRITES[frameIndex][profile]:null;}
export function marchSpritePlacement(profile,frameIndex,bodyHeight,facing){
 const s=infantryMarchSprite(profile,frameIndex);if(!s||!Number.isFinite(bodyHeight)||bodyHeight<=0||!Number.isFinite(facing))return null;
 const f=s.frame,x=(s.bootAnchor.x-f.x+s.padding)/(f.width+2*s.padding);
 return {key:s.runtimeKey,frame:'body',scale:bodyHeight/s.bodyHeight,originX:Math.cos(facing)>=0?x:1-x,
  originY:(s.bootAnchor.y-f.y+s.padding)/(f.height+2*s.padding)};
}
