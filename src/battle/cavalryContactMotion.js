const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// Coordinates are ground-relative in a 45px horse+rider presentation.
// Hooves remain planted. The rider and saber move together with the saddle;
// localized neck and tail motion does not bend the rider's face or weapon.
export function cavalryContactWeights(x,y) {
 return {
  upper:1-smooth(-12,-3,y),
  head:smooth(10,18,x)*smooth(-37,-32,y)*(1-smooth(-25,-20,y)),
  tail:(1-smooth(-17,-12,x))*smooth(-31,-24,y)*(1-smooth(-13,-6,y)),
 };
}
export function cavalryContactResponse(contact,time,figurePhase=0) {
 if(!contact||!Number.isFinite(time))return null;
 const phase=Number.isFinite(figurePhase)?figurePhase:0,p=contact.progress||0;
 // The impulse is continuous through guard/prepare/cut/recover boundaries.
 const age=Number.isFinite(contact.age)?contact.age:1;
 const entry=smooth(0,.3,age);
 const reach=smooth(.55,.74,p)*(1-smooth(.74,1,p))*smooth(.3,.65,age);
 return {shift:.65*reach,settle:.18*reach,
  breath:Math.sin(time*1.9+phase)*.08*entry,
  nod:Math.sin(time*2.1+phase)*.13*entry+.42*reach,
  tail:Math.sin(time*2.7+phase)*.22*entry};
}
export function cavalryContactOffset(weights,response) {
 if(!response)return {x:0,y:0};
 return {x:weights.upper*response.shift-weights.head*response.nod*.5+weights.tail*response.tail,
  y:weights.upper*(response.settle+response.breath)+weights.head*response.nod};
}
export function cavalryContactGeometry(sprite) {
 const f=sprite.frame,p=sprite.padding,width=f.width+p*2,height=f.height+p*2;
 const pivot={x:sprite.anchor.x-f.x+p,y:sprite.anchor.y-f.y+p},factor=45/sprite.bodyHeight;
 const minX=-pivot.x*factor,maxX=(width-pivot.x)*factor,minY=-pivot.y*factor,maxY=(height-pivot.y)*factor;
 const xs=[minX,...[-20,-17,-12,0,10,14,18,24].filter(x=>x>minX&&x<maxX),maxX];
 const ys=[minY,...[-40,-37,-32,-25,-20,-12,-6,-3,0].filter(y=>y>minY&&y<maxY),maxY];
 const vertices=[],uvs=[],samples=[];
 const add=(x,y)=>{vertices.push(x/factor,-y/factor);uvs.push((x/factor+pivot.x)/width,(y/factor+pivot.y)/height);samples.push({x,y,weights:cavalryContactWeights(x,y)});};
 for(let r=0;r<ys.length-1;r++)for(let c=0;c<xs.length-1;c++){
  const x=xs[c],xx=xs[c+1],y=ys[r],yy=ys[r+1];add(x,y);add(x,yy);add(xx,y);add(xx,y);add(x,yy);add(xx,yy);
 }
 return {vertices,uvs,samples,width,height,pivot,factor};
}
