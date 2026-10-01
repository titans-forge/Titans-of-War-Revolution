// Place smoke on the occupied firing edge after the engine reports a volley.
export function directionalVolleySamples(unit,figures,view,scale=1,flipX=false) {
 if(!unit?.active || unit.type!=='infantry' || !['front','rear','frontDiagonal','rearDiagonal'].includes(view) || !figures?.length)return [];
 const diagonal=view.endsWith('Diagonal'),sign=flipX?-1:1,vertical=view.startsWith('rear')?-1:1;
 const nx=diagonal?sign*Math.SQRT1_2:0,ny=vertical*(diagonal?Math.SQRT1_2:1);
 const edge=Math.max(...figures.map(f=>f.x*nx+f.y*ny));
 const spacingX=unit.formationMode==='open'?16:unit.formationMode==='column'?10:11,spacingY=unit.formationMode==='open'?15:12;
 const band=Math.abs(nx)*spacingX+Math.abs(ny)*spacingY+.1;
 const rank=figures.filter(f=>edge-f.x*nx-f.y*ny<=band).sort((a,b)=>(a.x*-ny+a.y*nx)-(b.x*-ny+b.y*nx));
 const count=Math.min(5,rank.length),selected=[];
 for(let i=0;i<count;i++){
  const f=rank[Math.round(i*(rank.length-1)/Math.max(1,count-1))],height=f.height*.9;
  selected.push({x:unit.x+(f.x+(diagonal?sign*height*.47:view==='rear'?-3:0))*scale,y:unit.y+(f.y-height*.84)*scale,dx:nx*18*scale,dy:ny*18*scale});
 }
 return selected;
}
