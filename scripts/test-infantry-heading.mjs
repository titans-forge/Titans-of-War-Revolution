import assert from 'node:assert/strict';
import {infantryHeading,infantryHeadingPresentation} from '../src/battle/infantryHeading.js';
const names=['e','se','s','sw','w','nw','n','ne'];
for(let i=0;i<8;i++)for(const revolutions of [-3,-1,0,1,4])assert.equal(infantryHeading(i*Math.PI/4+revolutions*Math.PI*2),names[i]);
for(let i=0;i<8;i++){const boundary=i*Math.PI/4+Math.PI/8;for(let offset=-.06;offset<=.06;offset+=.01){assert.equal(infantryHeading(boundary+offset,names[i]),names[i]);assert.equal(infantryHeading(boundary+offset,names[(i+1)%8]),names[(i+1)%8]);}assert.equal(infantryHeading(boundary+.08,names[i]),names[(i+1)%8]);}
assert.equal(infantryHeading(NaN),'e');assert.equal(infantryHeading(0,'bad'),'e');
for(const [a,b] of [['se','sw'],['ne','nw']]){assert.equal(infantryHeadingPresentation(a).view,infantryHeadingPresentation(b).view);assert.equal(infantryHeadingPresentation(a).flipX,false);assert.equal(infantryHeadingPresentation(b).flipX,true);}
assert.equal(infantryHeadingPresentation('s').view,'front');assert.equal(infantryHeadingPresentation('n').view,'rear');
// A complete turn visits every sector exactly once; jitter inside an overlap
// does not create additional transitions, and opposite orders turn immediately.
let previous='e',visited=new Set([previous]),transitions=0;for(let angle=0;angle<Math.PI*2;angle+=.01){const next=infantryHeading(angle,previous);if(next!==previous)transitions++;visited.add(next);previous=next;}assert.equal(visited.size,8);assert.equal(transitions,8);
assert.equal(infantryHeading(Math.PI/4+Math.PI,'se'),'nw');
console.log('Eight-way heading passed: full rotations, all sector boundaries, jitter dead bands, diagonal mirrors and immediate reversal.');
