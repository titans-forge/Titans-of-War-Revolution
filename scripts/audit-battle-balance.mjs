import {TrentonEngine} from '../src/battle/trentonEngine.js';
const contexts={strained:{metrics:{army:35,supply:19,support:40}},neutral:{metrics:{army:50,supply:50,support:50}},prepared:{metrics:{army:75,supply:75,support:65}}};
const runTo=(e,time)=>{while(e.time<time-1e-6&&e.outcome==='undecided')e.tick(.05);};
const rows=[];
for(const battle of ['trenton','long_island'])for(const [context,resources] of Object.entries(contexts))for(const seed of [17761226,17760827,48])for(const timing of battle==='trenton'?[35,45,55]:[24,29,35,45]){
 const e=new TrentonEngine(seed,battle,resources);
 if(battle==='trenton'){e.attack('mercer','rall');e.attack('knox','rall');e.attack('sullivan','lossberg');}
 runTo(e,timing);
 if(battle==='trenton'){e.move('sullivan',{x:650,y:550});e.attack('mercer','knyphausen');e.attack('knox','knyphausen');}
 else for(const u of e.formations.filter(u=>u.side==='continental'))e.order(u.id,'withdraw');
 runTo(e,180);
 rows.push({battle,context,seed,timing,outcome:e.outcome,time:Number(e.time.toFixed(2)),survivors:Math.round(e.formations.filter(u=>u.side==='continental'&&u.status!=='routed').reduce((n,u)=>n+u.strength,0)),objective:e.objectiveStatus(),blocked:e.formations.filter(u=>u.active&&u.navigationBlocked).map(u=>u.id)});
}
console.log(JSON.stringify(rows,null,2));
