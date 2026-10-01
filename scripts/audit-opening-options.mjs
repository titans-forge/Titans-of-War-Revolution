import {TrentonEngine} from '../src/battle/trentonEngine.js';
const rows=[];
for(const advanceAt of [3,6,9,12])for(const delay of [0,3,6,9])for(const seed of [17761226,17760827,49])for(const resources of [19,50,75]){
 const e=new TrentonEngine(seed,'monmouth',{metrics:{army:resources===19?35:resources,supply:resources,support:resources===19?40:resources}});e.config={...e.config,enemyAdvanceAt:advanceAt};let issued=false,reserve=false;
 while(e.outcome==='undecided'&&e.time<145){if(!issued&&e.time>=delay){e.order('lee-advance','reform');e.move('wayne-monmouth',{x:520,y:275});e.move('lafayette-monmouth',{x:520,y:415});issued=true;}if(!reserve&&e.time>=30+delay){e.move('washington-main',{x:430,y:345});reserve=true;}e.tick(.05);}
 rows.push({advanceAt,delay,seed,resources,outcome:e.outcome,objective:e.objectiveStatus(),lee:e.formations.filter(u=>u.id==='lee-advance').map(u=>({status:u.status,order:u.order,reformRemaining:u.reformRemaining}))});
}
console.log(JSON.stringify(rows,null,2));
