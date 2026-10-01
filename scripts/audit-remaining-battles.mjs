import {TrentonEngine} from '../src/battle/trentonEngine.js';
const contexts={strained:{metrics:{army:35,supply:19,support:40}},neutral:{metrics:{army:50,supply:50,support:50}},prepared:{metrics:{army:75,supply:75,support:65}}};
const policy=process.argv.find(a=>a.startsWith('--policy='))?.split('=')[1] || 'recovery';
if(!['baseline','adaptive','recovery'].includes(policy))throw new Error('Unknown audit policy');
const rows=[];
for(const battle of ['bunker_hill','brandywine','saratoga','monmouth','cowpens'])for(const [context,resources] of Object.entries(contexts))for(const seed of [17761226,17760827,49])for(const delay of [0,3,6]){
 const e=new TrentonEngine(seed,battle,resources),done=new Set(),ready={};
 if(battle==='cowpens')for(const id of ['morgan-riflemen','pickens-militia'])e.setFirePolicy(id,'effective');
 const once=(key,fn)=>{if(!done.has(key)){fn();done.add(key);}};
 let blockedSamples=0;
 while(e.time<200&&e.outcome==='undecided'){
  if(e.time>=delay){
   if(battle==='bunker_hill')once('support',()=>e.move('knowles',{x:575,y:360}));
   if(battle==='brandywine'&&e.time>=50+delay)once('withdraw',()=>{for(const u of e.formations.filter(u=>u.side==='continental'))e.order(u.id,'withdraw');});
   if(battle==='saratoga'){
    once('attack',()=>{e.attack('morgan','fraser');e.attack('learned','riedesel');e.attack('poor','hamilton');});
    if(e.time>=24+delay)once('reserve',()=>e.attack('lincoln-reserve','riedesel'));
   }
   if(battle==='monmouth'){
    once('line',()=>{e.order('lee-advance',policy==='recovery' && delay ? 'hold' : 'reform');e.move('wayne-monmouth',{x:520,y:275});e.move('lafayette-monmouth',{x:520,y:415});});
    const reserve=e.formations.find(u=>u.id==='washington-main');
    if(reserve.active&&e.time>=30+delay)once('reserve',()=>e.move(reserve.id,{x:430,y:345}));
   }
   if(battle==='cowpens'){
    const goal=e.objectiveStatus().counterattack;
    for(const screen of goal.screens)if(screen.shots>=screen.required&&!screen.rallied){ready[screen.id]??=e.time;e.setFirePolicy(screen.id,'hold');if(e.time-ready[screen.id]>=delay)once(screen.id,()=>e.order(screen.id,'fallback'));}
    const reserve=e.formations.find(u=>u.id==='washington-cavalry');
    if(reserve.active&&reserve.status==='steady'){ready.reserve??=e.time;if(e.time-ready.reserve>=delay)once('reserve',()=>e.attack(reserve.id,'legion-dragoons'));}
   }
  }
  if(battle==='saratoga'&&policy!=='baseline')for(const u of e.formations.filter(u=>u.side==='continental'&&u.active&&u.status==='steady'&&(u.order==='attack'||policy==='recovery'&&u.order==='hold'))){const t=e.formations.find(t=>t.id===u.targetId);if(u.order==='hold'||!t?.active||t.status==='routed'){const next=e.formations.filter(t=>t.side==='crown'&&t.active&&t.status!=='routed').sort((a,b)=>Math.hypot(a.x-u.x,a.y-u.y)-Math.hypot(b.x-u.x,b.y-u.y))[0];if(next)e.attack(u.id,next.id);}}
  e.tick(.05);if(e.formations.some(u=>u.active&&u.navigationBlocked))blockedSamples++;
 }
 rows.push({policy,battle,context,seed,delay,outcome:e.outcome,time:+e.time.toFixed(2),objective:e.objectiveStatus(),blockedSamples,terminalBlocked:e.formations.filter(u=>u.active&&u.navigationBlocked).map(u=>u.id)});
}
console.log(JSON.stringify(rows,null,2));
