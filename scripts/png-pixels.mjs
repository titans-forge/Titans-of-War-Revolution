import assert from 'node:assert/strict';
import {inflateSync} from 'node:zlib';
// Minimal lossless decoder for the generated non-interlaced RGB8 assets.
export function decodeRGBPNG(png){
const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
assert.equal(png[24],8);assert.equal(png[25],2);assert.equal(png[28],0);
const chunks=[];for(let o=8;o<png.length;){const n=png.readUInt32BE(o),kind=png.toString('ascii',o+4,o+8);if(kind==='IDAT')chunks.push(png.subarray(o+8,o+8+n));o+=n+12;}
const packed=inflateSync(Buffer.concat(chunks)),stride=width*3,rgb=new Uint8Array(stride*height);
const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
for(let y=0;y<height;y++){const start=y*(stride+1),filter=packed[start];assert.ok(filter<=4);for(let x=0;x<stride;x++){const a=x>=3?rgb[y*stride+x-3]:0,b=y?rgb[(y-1)*stride+x]:0,c=y&&x>=3?rgb[(y-1)*stride+x-3]:0;const predict=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter];rgb[y*stride+x]=(packed[start+1+x]+predict)&255;}}
const rgba=new Uint8ClampedArray(width*height*4);for(let i=0;i<width*height;i++){rgba[i*4]=rgb[i*3];rgba[i*4+1]=rgb[i*3+1];rgba[i*4+2]=rgb[i*3+2];rgba[i*4+3]=255;}
return {width,height,rgba};
}
