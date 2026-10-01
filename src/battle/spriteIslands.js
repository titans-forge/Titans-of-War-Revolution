// Non-destructive atlas extraction. Two complete silhouettes may have
// overlapping rectangular bounds even though their painted pixels are separate.
// Keep only the keyed foreground islands assigned to this sprite's seeds.
export function retainSpriteIslands(rgba,width,height,seeds) {
 const size=width*height,keep=new Uint8Array(size),queue=new Int32Array(size);
 let head=0,tail=0;
 for(const seed of seeds){const x=seed.x,y=seed.y;if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=width||y>=height)continue;const p=y*width+x;if(!keep[p]&&rgba[p*4+3]){keep[p]=1;queue[tail++]=p;}}
 while(head<tail){const p=queue[head++],x=p%width,y=Math.floor(p/width);
  for(let yy=Math.max(0,y-1);yy<=Math.min(height-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(width-1,x+1);xx++){const n=yy*width+xx;if(!keep[n]&&rgba[n*4+3]){keep[n]=1;queue[tail++]=n;}}
 }
 for(let p=0;p<size;p++)if(!keep[p])rgba[p*4+3]=0;
 return rgba;
}
export function spriteIslandSeeds(sprite){return sprite.islands?.map(p=>({x:p.x-sprite.frame.x+sprite.padding,y:p.y-sprite.frame.y+sprite.padding}));}
