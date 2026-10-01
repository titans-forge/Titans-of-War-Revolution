import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';

function encounter() {
 const battle=new TrentonEngine(17761226,'trenton');
 const shooter=battle.formations.find(u=>u.id==='mercer');
 const contact=battle.formations.find(u=>u.id==='rall');
 const distant=battle.formations.find(u=>u.id==='lossberg');
 for(const u of battle.formations)u.active=[shooter,contact,distant].includes(u);
 for(const [u,x] of [[shooter,400],[contact,494],[distant,590]])Object.assign(u,{x,y:300,order:'hold',target:{x,y:300},reload:0,firePolicy:'hold'});
 battle.nextCrownDecision=1e9;
 shooter.targetId=distant.id;shooter.firePolicy='free';shooter.facing=0;
 return {battle,shooter,contact,distant};
}
{
 const {battle,shooter,contact,distant}=encounter(),ammo=shooter.ammunition,targetStrength=distant.strength;
 battle.tick(.05);
 assert.equal(shooter.engaged,true);
 assert.equal(shooter.ammunition,ammo,'a formation fighting one opponent cannot shoot a different assigned target');
 assert.equal(distant.strength,targetStrength,'the distant target receives no simultaneous melee volley');
 assert.ok(shooter.strength<shooter.initialStrength&&contact.strength<contact.initialStrength,'mutual close combat still resolves');
}
{
 const {battle,shooter,contact}=encounter();shooter.volleyRequested=true;shooter.firePolicy='hold';
 const ammo=shooter.ammunition;battle.tick(.05);
 assert.equal(shooter.ammunition,ammo,'a requested volley cannot bypass physical contact');
 assert.equal(shooter.volleyRequested,true,'the pending single shot is retained while engaged');
 Object.assign(contact,{x:900,y:500,target:{x:900,y:500}});
 battle.tick(.05);
 assert.equal(shooter.ammunition,ammo-1,'the loaded volley can fire once contact clears');
 assert.equal(shooter.volleyRequested,false);
}
for(const status of ['routed','withdrawn']){
 const {battle,shooter,contact}=encounter();contact.status=status;
 if(status==='withdrawn')contact.active=false;
 const ammo=shooter.ammunition;battle.tick(.05);
 assert.equal(shooter.ammunition,ammo-1,`${status} troops do not prevent a valid distant shot`);
}
console.log('Melee fire discipline passed: no simultaneous ranged volley at a separate target, retained requested shot, contact clearance, inactive/routed exclusions.');
{
 const battle=new TrentonEngine(1,'brandywine');
 for(const u of battle.formations){u.active=false;u.entered=true;}
 const a=battle.formations.find(u=>u.id==='wayne-ford'),b=battle.formations.find(u=>u.id==='knyphausen-ford');
 Object.assign(a,{x:709.58,y:615.23,active:true,order:'hold',target:{x:709.58,y:615.23},firePolicy:'free',reload:0});
 Object.assign(b,{x:730.42,y:569.77,active:true,order:'hold',target:{x:730.42,y:569.77},firePolicy:'free',reload:0});
 battle.nextCrownDecision=1e9;
 const ammo=[a.ammunition,b.ammunition];battle.tick(.05);
 assert.deepEqual([a.ammunition,b.ammunition],ammo.map(n=>n-1),'an impassable river separates melee but does not prevent a valid musket shot across it');
 assert.equal(a.engaged,false);assert.equal(b.engaged,false);
}
