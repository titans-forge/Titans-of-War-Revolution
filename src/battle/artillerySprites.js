// Measured full subjects. The working rammer retains the upright man's scale:
// its lower head position is a lean, not a reason to enlarge the whole drawing.
const DATA=[
 [{x:210,y:14,width:553,height:482},350,495,482,{x:762,y:236}],
 [{x:837,y:59,width:675,height:436},1000,494,482,{x:1511,y:222}],
 [{x:211,y:519,width:344,height:467},356,985,467,{x:528,y:714}],
 [{x:880,y:510,width:548,height:480},1025,989,480,{x:1421,y:759}],
];
export const ARTILLERY_ACTION_SPRITES=Object.freeze(DATA.map(([bounds,x,y,bodyHeight,toolTip],frameIndex)=>Object.freeze({
 frameIndex,key:'revolution-artillery-actions-v1',path:'/images/units/revolution-artillery-actions-v1.png',
 sha256:'e35319d8282b6bd2f7d87a4ca4d4aeeadb6e36d4a08180a6202c7c805a54deba',width:1536,height:1024,chroma:'magenta',padding:2,
 alphaBounds:Object.freeze(bounds),frame:Object.freeze({x:bounds.x-6,y:bounds.y-6,width:bounds.width+12,height:bounds.height+12}),
 groundAnchor:Object.freeze({x,y}),bodyHeight,toolTip:Object.freeze(toolTip),runtimeKey:`revolution-artillery-action-${frameIndex}`,
})));

export function artillerySpritePlacement(frameIndex,bodyHeight,facing) {
 if(![0,1,2,3].includes(frameIndex)||!Number.isFinite(bodyHeight)||bodyHeight<=0||!Number.isFinite(facing))return null;
 const s=ARTILLERY_ACTION_SPRITES[frameIndex],f=s.frame;
 const x=(s.groundAnchor.x-f.x+s.padding)/(f.width+2*s.padding);
 return {key:s.runtimeKey,frame:'body',scale:bodyHeight/s.bodyHeight,originX:Math.cos(facing)>=0?x:1-x,
  originY:(s.groundAnchor.y-f.y+s.padding)/(f.height+2*s.padding)};
}
