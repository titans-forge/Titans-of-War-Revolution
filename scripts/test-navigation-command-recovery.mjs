import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {issueCommand} from '../src/battle/commandReceipt.js';

const battle=new TrentonEngine(1,'brandywine'),unit=battle.formations.find(u=>u.id==='wayne-ford');
unit.navigationBlocked=true;
assert.equal(issueCommand(battle,unit.id,'ground-move',{x:NaN,y:300}),null);
assert.equal(unit.navigationBlocked,true,'ignored malformed move preserves the prior failure state');
const move=issueCommand(battle,unit.id,'ground-move',{x:700,y:230});
assert.ok(move?.accepted,'a valid retry is acknowledged immediately while paused');
assert.equal(unit.navigationBlocked,false);

unit.navigationBlocked=true;
assert.equal(issueCommand(battle,unit.id,'target','missing'),null);
assert.equal(unit.navigationBlocked,true,'ignored target preserves the prior failure state');
assert.ok(issueCommand(battle,unit.id,'target','ferguson')?.accepted);
assert.equal(unit.navigationBlocked,false,'accepted attack clears stale navigation failure');

unit.navigationBlocked=true;
assert.equal(issueCommand(battle,unit.id,'order','missing'),null);
assert.equal(unit.navigationBlocked,true,'ignored order preserves the prior failure state');
assert.ok(issueCommand(battle,unit.id,'order','hold')?.accepted);
assert.equal(unit.navigationBlocked,false,'accepted order clears stale navigation failure');

console.log('Navigation command recovery passed: valid retries clear stale failure immediately; invalid commands preserve it.');
