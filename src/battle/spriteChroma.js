// Runtime support for the explicitly magenta-backed thrust atlas. Existing
// RGBA artwork bypasses this path. The source image is kept unchanged on disk.
export function keyMagentaPixels(rgba) {
  for(let i=0;i<rgba.length;i+=4) {
    const r=rgba[i],g=rgba[i+1],b=rgba[i+2];
    const excess=Math.min(r,b)-g;
    // Reds, blues, skin, buff linen and neutral highlights are not key colors.
    if(excess<=35 || r<65 || b<65)continue;
    if(excess>=190) {rgba[i+3]=0;continue;}
    // Resolve antialiased mixtures of foreground and key color. Removing the
    // key contribution also avoids a pink fringe around the cutout.
    const alpha=Math.max(0,Math.min(1,1-excess/255));
    rgba[i]=Math.max(0,Math.min(255,(r-255*(1-alpha))/alpha));
    rgba[i+1]=Math.max(0,Math.min(255,g/alpha));
    rgba[i+2]=Math.max(0,Math.min(255,(b-255*(1-alpha))/alpha));
    rgba[i+3]=Math.round(rgba[i+3]*alpha);
  }
  return rgba;
}
