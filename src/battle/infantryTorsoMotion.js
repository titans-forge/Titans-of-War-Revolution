const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// Localized cloth motion. The face, shoulder, musket and gripping hand stay
// fixed; only the free sleeve/hand and lower coat are allowed to flex.
export function torsoMotionWeights(u,v,layout=null) {
 if((layout==='ferguson'||layout==='right-weapon'))return {arm:smooth(.22,.4,u)*(1-smooth(.62,.75,u))*smooth(.67,.85,v),coat:(1-smooth(.22,.4,u))*smooth(.79,.98,v)};
 return {arm:smooth(.65,.88,u)*smooth(.48,.8,v),coat:(1-smooth(.52,.68,u))*smooth(.79,.98,v)};
}
export function torsoMotionOffset(weights,phase) {
 if(!Number.isFinite(phase))return {x:0,y:0};
 return {x:.55*Math.sin(phase)*weights.arm+.35*Math.sin(phase-.5)*weights.coat,
  y:.10*(1-Math.cos(phase))*weights.arm+.12*Math.sin(phase-.5)*weights.coat};
}
export function torsoMeshGeometry(sprite) {
 const width=sprite.frame.width+sprite.padding*2,height=sprite.frame.height+sprite.padding*2;
 const pivot={x:sprite.pivot.x-sprite.frame.x+sprite.padding,y:sprite.pivot.y-sprite.frame.y+sprite.padding};
 const xs=(sprite.motionLayout==='ferguson'||sprite.motionLayout==='right-weapon')?[0,.22,.4,.62,.75,.88,1]:[0,.35,.52,.65,.78,.88,1],ys=[0,.35,.48,.65,.79,.88,1];
 const vertices=[],uvs=[],samples=[];
 for(let row=0;row<ys.length-1;row++)for(let col=0;col<xs.length-1;col++) {
  for(const [dx,dy] of [[0,0],[1,0],[0,1],[1,0],[1,1],[0,1]]) {
   const u=xs[col+dx],v=ys[row+dy],x=u*width-pivot.x,y=v*height-pivot.y;
   vertices.push(x,-y);uvs.push(u,v);samples.push({x,y,weights:torsoMotionWeights(u,v,sprite.motionLayout)});
  }
 }
 return {width,height,pivot,vertices,uvs,samples};
}
