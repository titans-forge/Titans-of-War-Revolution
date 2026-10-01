const TURN=Math.PI*2,STEP=Math.PI/4;
const names=['e','se','s','sw','w','nw','n','ne'];
const wrap=a=>((a%TURN)+TURN)%TURN;
const distance=(a,b)=>Math.abs(((a-b+Math.PI+TURN)%TURN)-Math.PI);
const views=['side','frontDiagonal','front','frontDiagonal','side','rearDiagonal','rear','rearDiagonal'];
// Eight view sectors, with four degrees of overlap at each boundary. Retaining
// the previous heading there prevents path corrections from flashing the art.
export function infantryHeading(facing,previous=null) {
 if(!Number.isFinite(facing))return 'e';
 const angle=wrap(facing),old=names.indexOf(previous);
 if(old>=0&&distance(angle,old*STEP)<=STEP/2+.075)return previous;
 return names[Math.round(angle/STEP)%8];
}
export function infantryHeadingPresentation(heading) {
 const index=names.indexOf(heading),i=index<0?0:index;
 return {view:views[i],flipX:i>=3&&i<=5};
}
