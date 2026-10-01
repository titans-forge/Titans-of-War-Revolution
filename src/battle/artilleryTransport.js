import {artilleryCrewStation} from './artilleryAnimation.js';
const duration=.7;
const haulStation=(index,facing)=>({x:[10,-20,-39][index]*(Math.cos(facing)>=0?1:-1),y:12});
function sample(state,time){
 const t=Math.max(0,Math.min(1,(time-state.since)/duration)),p=t*t*(3-2*t);
 return state.from.map((from,i)=>{const to=state.to[i],dx=to.x-from.x,dy=to.y-from.y;
  return {x:from.x+dx*p,y:from.y+dy*p,facing:Math.atan2(dy,dx),travel:(from.travel||0)+Math.hypot(dx,dy)*p*.42};});
}
// Pure presentation state. Call with simulation time; never gate a move or volley.
export function artilleryTransport(previous,unit,time,wantsHaul){
 const ready=unit?.active&&unit.type==='artillery'&&unit.status==='steady'&&!unit.engaged&&!['fallback','withdraw','reform'].includes(unit.order);
 const desired=ready&&unit.moving&&wantsHaul?'haul':'idle';
 const safe=ready&&(unit.moving||!(unit.reload>0));
 const idle=()=>({mode:'idle',since:time,positions:null});
 if(!safe||!Number.isFinite(time))return idle();
 const deployed=()=>[0,1,2].map(i=>artilleryCrewStation(i,unit.facing,unit.moving));
 const hauling=()=>[0,1,2].map(i=>haulStation(i,unit.facing));
 let state=previous||idle();
 if(state.mode==='gather'||state.mode==='deploy'){
  const positions=sample(state,time),target=state.mode==='gather'?'haul':'idle';
  if(desired!==target){
   state={mode:desired==='haul'?'gather':'deploy',since:time,from:positions,to:desired==='haul'?hauling():deployed()};
  }else if(time-state.since>=duration){state={mode:target,since:time,positions:null};}
 }
 if((state.mode==='idle'&&desired==='haul')||(state.mode==='haul'&&desired==='idle')){
  state={mode:desired==='haul'?'gather':'deploy',since:time,from:state.mode==='haul'?hauling():deployed(),to:desired==='haul'?hauling():deployed()};
 }
 if(state.mode==='gather'||state.mode==='deploy')return {...state,positions:sample(state,time)};
 return state;
}
