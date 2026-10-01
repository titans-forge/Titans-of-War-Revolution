const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// Reuse the original individual gunners, with measured leg paths in atlas pixels.
// Upper bodies and the rammer/lintstock are not part of the leg deformation.
export const ARTILLERY_TRAVEL_SPRITES=[
 {frame:{x:967,y:5,width:363,height:493},hip:285,ground:490,left:[1075,997],right:[1163,1210],tool:true},
 {frame:{x:265,y:523,width:297,height:476},hip:800,ground:993,left:[365,295],right:[491,512]},
 {frame:{x:968,y:503,width:416,height:495},hip:789,ground:991,left:[1038,1010],right:[1110,1165]},
].map((s,index)=>({...s,key:'artillery-atlas',runtimeKey:`artillery-travel-${index+1}`,padding:2,atlasFrame:index+1}));
export function artilleryTravelWeights(sprite,x,y) {
 const t=Math.max(0,Math.min(1,(y-sprite.hip)/(sprite.ground-sprite.hip)));
 const leg=smooth(sprite.hip,sprite.hip+90,y);
 // The sponge staff passes between the legs; leave its entire shaft rigid.
 const tool=sprite.tool? smooth(35,80,Math.abs(x-(1102+(485-y)*.45))):1;
 const weight=path=>(1-smooth(29,62,Math.abs(x-(path[0]+(path[1]-path[0])*t))))*leg*tool;
 return {left:weight(sprite.left),right:weight(sprite.right)};
}
export function artilleryTravelState(unit,phase,figurePhase=0,startPhase=phase) {
 if(!unit?.active||unit.type!=='artillery'||!['steady','routed'].includes(unit.status)||!unit.moving||!Number.isFinite(phase)||!Number.isFinite(startPhase))return null;
 const p=phase+(Number.isFinite(figurePhase)?figurePhase:0),entry=smooth(0,.8,Math.max(0,phase-startPhase));
 const direction=unit.order==='fallback'?-1:1;
 const foot=p=>({x:.9*Math.sin(p)*entry*direction,y:-.5*Math.max(0,Math.cos(p))*entry});
 return {left:foot(p),right:foot(p+Math.PI)};
}
export function artilleryTravelOffset(weights,state) {
 if(!state)return {x:0,y:0};
 return {x:weights.left*state.left.x+weights.right*state.right.x,y:weights.left*state.left.y+weights.right*state.right.y};
}
export function artilleryTravelGeometry(sprite) {
 const f=sprite.frame,p=sprite.padding,width=f.width+2*p,height=f.height+2*p,factor=34/f.height;
 const pivot={x:f.width/2+p,y:f.height+p},vertices=[],uvs=[],samples=[];
 // A regular source-space grid resolves boot outlines without allocating on updates.
 const cols=16,rows=20;
 const add=(u,v)=>{const x=u*width-p+f.x,y=v*height-p+f.y;const localX=u*width-pivot.x,localY=v*height-pivot.y;
  vertices.push(localX,-localY);uvs.push(u,v);samples.push({x:localX,y:localY,weights:artilleryTravelWeights(sprite,x,y)});};
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  const u=c/cols,v=r/rows,uu=(c+1)/cols,vv=(r+1)/rows;add(u,v);add(u,vv);add(uu,v);add(uu,v);add(u,vv);add(uu,vv);
 }
 return {vertices,uvs,samples,width,height,pivot,factor};
}
