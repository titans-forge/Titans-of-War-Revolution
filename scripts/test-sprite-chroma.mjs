import assert from 'node:assert/strict';
import {keyMagentaPixels} from '../src/battle/spriteChroma.js';
const key=[255,0,255,255],nearKey=[248,5,250,255];
for(const color of [key,nearKey,[225,25,225,255]])assert.equal(keyMagentaPixels(Uint8ClampedArray.from(color))[3],0);
for(const color of [[180,30,40,255],[30,45,85,255],[225,215,185,255],[220,165,135,255],[30,30,30,255],[255,255,255,255],[100,75,40,255]])assert.deepEqual([...keyMagentaPixels(Uint8ClampedArray.from(color))],color,'uniform/skin colors remain untouched');
// A half-covered neutral pixel composited over magenta should recover its
// foreground color and coverage rather than retain an opaque pink fringe.
const edge=keyMagentaPixels(Uint8ClampedArray.from([153,25,153,255]));
assert.ok(Math.abs(edge[3]-127)<2);assert.ok(Math.abs(edge[0]-50)<2);assert.ok(Math.abs(edge[1]-50)<2);assert.ok(Math.abs(edge[2]-50)<2);
assert.equal(keyMagentaPixels(Uint8ClampedArray.from([255,0,255,0]))[3],0);
console.log('Sprite chroma passed: background removal, antialiased edge recovery, and representative uniform/skin preservation.');
