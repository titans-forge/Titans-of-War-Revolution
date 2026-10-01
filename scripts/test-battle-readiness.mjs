import{INITIAL_STATE,SCENARIOS,applyBattleResult,applyChoice}from'../src/game/campaign.js';import{presentScenario}from'../src/game/campaignNarrative.js';import{serializeCampaign,importCampaign}from'../src/game/storage.js';
import assert from 'node:assert/strict';import fs from 'node:fs';
import{TrentonEngine}from'../src/battle/trentonEngine.js';import{startingAmmunition}from'../src/battle/battleBriefing.js';import{objectiveSummary}from'../src/battle/objectiveSummary.js';
const run=(e,n)=>{for(let i=0;i<Math.round(n/.05);i++)e.tick(.05);};const rows=[];
for(const supply of [0,19,50,100])for(const army of [20,50,80]){
 const context={metrics:{army,supply,support:55}},e=new TrentonEngine(17760827,'long_island',context);
 const allowance=startingAmmunition(e.formations[0],e.config);assert.equal(allowance.standard,70);assert.equal(allowance.actual,Math.round(70*(.75+supply/200)));
 const before=JSON.stringify(e.snapshot());const header=objectiveSummary(e.objectiveStatus());assert.match(header,/Boats in 45s/);assert.equal(JSON.stringify(e.snapshot()),before);
 run(e,30);for(const u of e.formations.filter(u=>u.side==='continental'))e.order(u.id,'withdraw');run(e,130);assert.equal(e.outcome,'withdrawal');const evac=e.objectiveStatus().evacuation;assert.ok(evac.saved>=evac.required&&evac.screenSeconds>=evac.requiredScreen);
 const t=new TrentonEngine(17761226,'trenton',context);t.attack('mercer','rall');t.attack('knox','rall');t.attack('sullivan','lossberg');run(t,45);t.move('sullivan',{x:650,y:550});t.attack('mercer','knyphausen');t.attack('knox','knyphausen');run(t,160);assert.equal(t.outcome,'victory');assert.equal(t.objectiveStatus().escape.escaped,0);
 rows.push({supply,army,ammunition:allowance.actual,longIsland:e.outcome,saved:Math.floor(evac.saved),trenton:t.outcome,escaped:0});
}
for(const id of ['bunker_hill','long_island','trenton','brandywine','saratoga','monmouth','cowpens']){
 const e=new TrentonEngine(1,id);for(const u of e.formations.filter(u=>u.side==='continental')){const a=startingAmmunition(u,e.config);assert.equal(a.actual,a.standard,'neutral practice matches standard load');}
 assert.ok(objectiveSummary(e.objectiveStatus()).length>0);
}
const boats=new TrentonEngine(1,'long_island');boats.time=45;assert.match(objectiveSummary(boats.objectiveStatus()),/Boats available/);
const road=new TrentonEngine(1,'brandywine');const enemy=road.formations.find(u=>u.side==='crown');enemy.x=road.config.evacuation.exitX;enemy.y=road.config.evacuation.exitY;assert.match(objectiveSummary(road.objectiveStatus()),/Chester Road blocked/);
assert.equal(startingAmmunition(null,boats.config),null);assert.equal(startingAmmunition({id:'unknown',initialAmmunition:5},boats.config),null);
if(process.env.READINESS_REPORT)fs.writeFileSync(process.env.READINESS_REPORT,JSON.stringify(rows,null,2)+'\n');
console.log('Battle readiness passed: 24 active-order campaign-context simulations, exact starting loads across seven battles, boat countdown/readiness, blocked road and unchanged objective state.');

const base=SCENARIOS.find(s=>s.id==='brooklyn_evacuation');
const won=applyBattleResult(structuredClone(INITIAL_STATE),'long_island','withdrawal'),restored=importCampaign(serializeCampaign(won)),dispatch=presentScenario(restored,base);
assert.equal(dispatch.title,'After the East River Crossing');assert.doesNotMatch(dispatch.summary,/enclosed|trapped/);assert.ok(dispatch.choices.every(c=>!/^Evacuate/.test(c.title)));
for(let i=0;i<3;i++){assert.deepEqual(dispatch.choices[i].effects,base.choices[i].effects);const result=applyChoice(restored,base,base.choices[i]);assert.equal(result.history.at(-1).title,dispatch.choices[i].title);assert.equal(result.scenarioId,'new_jersey_retreat');assert.ok(importCampaign(serializeCampaign(result)));}
assert.match(presentScenario(applyBattleResult(structuredClone(INITIAL_STATE),'long_island','victory'),base).summary,/won the engagement/);
assert.equal(presentScenario(INITIAL_STATE,base).title,base.title);assert.equal(presentScenario(applyBattleResult(structuredClone(INITIAL_STATE),'long_island','defeat'),base).title,base.title);
console.log('Post-evacuation continuity passed: recorded withdrawal and victory, unchanged unplayed/defeat dispatches, stable costs and save-compatible follow-up choices.');
