const TAU=Math.PI*2;
const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
// Project a distance-driven foot cycle into the screen's depth axis. In the
// support half the foot travels against the body; the passing foot lifts.
export function depthFoot(phase,view='front') {
 const cycle=((phase%TAU)+TAU)%TAU/TAU,direction=view.startsWith('rear')?-1:1,diagonal=view.endsWith('Diagonal');
 let distance,lift=0,spread=0;
 if(cycle<.5)distance=2*(1-cycle*4);
 else {const t=(cycle-.5)*2,ease=t*t*(3-2*t);distance=2*(-1+ease*2);lift=Math.sin(t*Math.PI)*2.2;spread=Math.sin(t*Math.PI)*.18;}
 return {y:direction*distance*(diagonal?Math.SQRT1_2:1)-lift,x:diagonal?distance*Math.SQRT1_2:spread};
}
// Weights are measured in the shared 36-pixel body coordinate system and
// cached with the geometry, not recomputed for every vertex on every frame.
export function depthMotionWeights(x,y,view='front',layout=null) {
 const diagonal=view.endsWith('Diagonal'),rear=view.startsWith('rear'),hip=diagonal?-12:-15;
 const equipment=diagonal?smooth(3.2,6.2,Math.abs(x)):smooth(2.8,3.4,Math.abs(x));
 const mask=1-equipment*(1-smooth(-12,-8,y));
 const right=diagonal?smooth(-2.4,2.4,x):smooth(-.35,.35,x);
 const leg=smooth(hip,-5,y)*mask;
 const knee=smooth(hip,-9,y)*(1-smooth(-8,-5,y))*mask;
 // The free sleeve lies opposite the musket in the frontal sheets. In the
 // rear diagonal sheet the musket is behind it: protect that vertical strip.
 const rearLeftArm=layout==='rear-left-arm';
 const side=rear&&!rearLeftArm?x:-x;
 const armX=diagonal&&rear&&!rearLeftArm?smooth(5,5.8,side):smooth(diagonal?1.5:3.2,diagonal?3.1:4.8,side);
 const arm=armX*smooth(diagonal&&rear?-23:-28,diagonal&&rear?-20:-22,y)*(1-smooth(-16,-13,y));
 return {leg,knee,right,arm,diagonal,rear};
}
export function depthStrideState(phase,view='front') {
 if(!Number.isFinite(phase))return null;
 const passing=p=>{const t=(((p%TAU)+TAU)%TAU/TAU-.5)*2;return t>0?Math.sin(Math.PI*t)**2:0;};
 return {a:depthFoot(phase,view),b:depthFoot(phase+Math.PI,view),ka:passing(phase),kb:passing(phase+Math.PI),arm:Math.sin(phase+.35)};
}
export function weightedDepthOffset(w,state) {
 if(!state||(!w.leg&&!w.knee&&!w.arm))return {x:0,y:0};
 const {a,b,ka,kb}=state,r=w.right;
 const bend=ka*(1-r)+kb*r;
 const bendX=w.diagonal?.65:.25;
 // Knee flex peaks during the passing step and vanishes at the ankle and
 // hip. Feet retain their support trajectory, while the calf changes angle.
 return {x:(a.x*(1-r)+(w.diagonal?b.x:-b.x)*r)*w.leg
   +bendX*(ka*(1-r)+(w.diagonal?kb:-kb)*r)*w.knee
   +(w.rear?-1:1)*state.arm*.42*w.arm,
  y:(a.y*(1-r)+b.y*r)*w.leg-.55*bend*w.knee
   +state.arm*.18*w.arm};
}
export function depthMotionOffset(x,y,phase,view='front',layout=null) {
 return weightedDepthOffset(depthMotionWeights(x,y,view,layout),depthStrideState(phase,view));
}
export function depthMeshGeometry(sprite) {
 const f=sprite.frame,p=sprite.padding,width=f.width+p*2,height=f.height+p*2;
 const pivot={x:sprite.anchor.x-f.x+p,y:sprite.anchor.y-f.y+p},factor=36/sprite.bodyHeight;
 const minX=-pivot.x*factor,maxX=(width-pivot.x)*factor,minY=-pivot.y*factor,maxY=(height-pivot.y)*factor;
 const diagonal=sprite.view.endsWith('Diagonal');
 const columns=diagonal?[-5.8,-5,-3.2,-2.4,0,2.4,3.2,5,5.8]:[-5,-3.4,-2,-.35,.35,2,3.4,5];
 const rows=diagonal?[-28,-22,-16,-12,-9,-8,-3,0]:[-28,-22,-16,-15,-9,-8,-3,0];
 const xs=[minX,...columns.filter(x=>x>minX&&x<maxX),maxX];
 const ys=[minY,...rows.filter(y=>y>minY&&y<maxY),maxY];
 const vertices=[],uvs=[],samples=[];
 const add=(x,y)=>{vertices.push(x/factor,-y/factor);uvs.push((x/factor+pivot.x)/width,(y/factor+pivot.y)/height);samples.push({x,y,weights:depthMotionWeights(x,y,sprite.view,sprite.motionLayout)});};
 for(let r=0;r<ys.length-1;r++)for(let c=0;c<xs.length-1;c++){
  const x=xs[c],xx=xs[c+1],y=ys[r],yy=ys[r+1];add(x,y);add(x,yy);add(xx,y);add(xx,y);add(x,yy);add(xx,yy);
 }
 return {vertices,uvs,samples,width,height,pivot,factor};
}
