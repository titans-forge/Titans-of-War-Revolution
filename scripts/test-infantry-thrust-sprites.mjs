import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {inflateSync} from 'node:zlib';
import {INFANTRY_THRUST_SPRITES,contactSpritePlacement} from '../src/battle/infantryContactSprites.js';
import {keyMagentaPixels} from '../src/battle/spriteChroma.js';
const png=fs.readFileSync(new URL('../public/images/units/revolution-infantry-contact-thrust-v1.png',import.meta.url));
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),INFANTRY_THRUST_SPRITES[0].sha256);
const width=png.readUInt32BE(16),height=png.readUInt32BE(20);assert.equal(width,1536);assert.equal(height,1024);assert.equal(png[24],8);assert.equal(png[25],2);assert.equal(png[28],0);
// Decode this RGB PNG to exercise the runtime keyer against the actual atlas,
// including generated variations in the supposedly flat key-color background.
const chunks=[];for(let o=8;o<png.length;){const n=png.readUInt32BE(o),kind=png.toString('ascii',o+4,o+8);if(kind==='IDAT')chunks.push(png.subarray(o+8,o+8+n));o+=n+12;}
const packed=inflateSync(Buffer.concat(chunks)),stride=width*3,rgb=new Uint8Array(stride*height);
const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
for(let y=0;y<height;y++){const start=y*(stride+1),filter=packed[start];assert.ok(filter<=4);for(let x=0;x<stride;x++){const a=x>=3?rgb[y*stride+x-3]:0,b=y?rgb[(y-1)*stride+x]:0,c=y&&x>=3?rgb[(y-1)*stride+x-3]:0;const predict=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter];rgb[y*stride+x]=(packed[start+1+x]+predict)&255;}}
const rgba=new Uint8ClampedArray(width*height*4);for(let i=0;i<width*height;i++){rgba[i*4]=rgb[i*3];rgba[i*4+1]=rgb[i*3+1];rgba[i*4+2]=rgb[i*3+2];rgba[i*4+3]=255;}
keyMagentaPixels(rgba);
for(let y=0;y<height;y++)for(const x of [0,60,750,780,800,1535])assert.equal(rgba[(y*width+x)*4+3],0,`empty gutter is transparent at ${x},${y}`);
const occupied=new Set();
for(const s of INFANTRY_THRUST_SPRITES){const f=s.frame;let count=0;
 for(let y=f.y;y<f.y+f.height;y++)for(let x=f.x;x<f.x+f.width;x++)if(rgba[(y*width+x)*4+3]>32){assert.ok(!occupied.has(y*width+x));occupied.add(y*width+x);count++;}
 assert.ok(count>60000&&count<80000,'complete subject survives keying');
 const right=contactSpritePlacement(s.profile,1,36,0),left=contactSpritePlacement(s.profile,1,36,Math.PI);
 assert.equal(right.key,s.runtimeKey);assert.equal(right.frame,'body');assert.ok(Math.abs(right.originX+left.originX-1)<1e-10);assert.ok(Math.abs(right.originY*(f.height+4)+f.y-2-s.bootLineY)<1e-8);assert.equal(right.scale*s.bodyHeight,36);
 for(const edgeY of [f.y,f.y+f.height-1])for(let x=f.x;x<f.x+f.width;x++)assert.equal(rgba[(edgeY*width+x)*4+3],0,'frame top/bottom has a safe gutter');
}
console.log('Infantry thrust atlas passed: actual RGB decoding/keying, clean gutters, four complete disjoint subjects, hash and mirrored ground registration.');
