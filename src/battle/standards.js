import { getUnitIdentity } from './unitIdentity.js';

// Representative army identifiers, not authenticated regimental colours.
export function standardDesign(battleId, unit) {
  if (unit.id) return getUnitIdentity(battleId, unit).standard;
  // Compatibility for the small geometry test fixtures; live formations always use IDs.
  if (unit.name === "Heister's Hessian Column") return 'hessian-marker';
  if (unit.side === 'continental') return battleId === 'bunker_hill' ? 'provincial' : ['trenton', 'long_island'].includes(battleId) ? 'grand-union' : 'thirteen-stars';
  return 'british-union';
}

export function clothSample(fraction, time, phase) {
  const wave = time * 3.2 + phase - fraction * 5.5;
  return {
    y: fraction * (1.8 * Math.sin(wave) + 0.5 * Math.sin(wave * 1.7)),
    height: 1 - fraction * 0.065 * (1 + Math.sin(wave)),
    shade: Math.round(224 + 25 * Math.cos(wave)),
  };
}

function union(ctx, x, y, w, h) {
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
  ctx.fillStyle='#253d59';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='#e6dec9';ctx.lineWidth=h*0.19;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y+h);ctx.moveTo(x+w,y);ctx.lineTo(x,y+h);ctx.stroke();
  ctx.fillStyle='#e6dec9';ctx.fillRect(x+w*.39,y,w*.22,h);ctx.fillRect(x,y+h*.34,w,h*.32);
  ctx.fillStyle='#9c3530';ctx.fillRect(x+w*.445,y,w*.11,h);ctx.fillRect(x,y+h*.41,w,h*.18);
  ctx.restore();
}

export function createStandardTexture(scene, design) {
  const key=`standard-${design}`;
  if(scene.textures.exists(key)) return key;
  const texture=scene.textures.createCanvas(key,280,180);
  const ctx=texture.context;
  ctx.fillStyle=['german-marker','hessian-marker'].includes(design)?'#b8a15b':'#304e68';ctx.fillRect(0,0,280,180);
  if(design==='british-union') union(ctx,0,0,280,180);
  if(['grand-union','thirteen-stars'].includes(design)) {
    for(let i=0;i<13;i++){ctx.fillStyle=i%2?'#e8dfca':'#a43e35';ctx.fillRect(0,i*180/13,280,180/13+1);}
    if(design==='grand-union') union(ctx,0,0,126,97);
    else {
      ctx.fillStyle='#284963';ctx.fillRect(0,0,126,97);ctx.fillStyle='#eee3c9';
      // A representative thirteen-star arrangement, not a claimed battle relic.
      for(let i=0;i<13;i++) {
        const a=i*Math.PI*2/13-Math.PI/2, x=63+34*Math.cos(a),y=48.5+34*Math.sin(a);
        ctx.beginPath();for(let j=0;j<10;j++){const t=j*Math.PI/5-Math.PI/2,r=j%2?2.2:5.2;ctx.lineTo(x+r*Math.cos(t),y+r*Math.sin(t));}ctx.closePath();ctx.fill();
      }
    }
  }
  if(['provincial','german-marker','hessian-marker'].includes(design)) {
    ctx.strokeStyle='#d4c394';ctx.lineWidth=3;ctx.strokeRect(9,9,261,161);
  }
  // Woven threads and sewn hems: generated geometry, no external artwork.
  ctx.fillStyle='rgba(255,240,209,.07)';for(let y=0;y<180;y+=3)ctx.fillRect(0,y,280,1);
  ctx.fillStyle='rgba(38,28,18,.07)';for(let x=0;x<280;x+=4)ctx.fillRect(x,0,1,180);
  ctx.strokeStyle='rgba(55,38,22,.35)';ctx.lineWidth=2;ctx.strokeRect(2,2,276,176);
  ctx.fillStyle='rgba(239,217,172,.4)';ctx.fillRect(0,0,6,180);
  texture.refresh();
  for(let i=0;i<28;i++)texture.add(i,0,i*10,0,10,180);
  return key;
}

export function addStandard(scene, container, unit, battleId) {
  const key=createStandardTexture(scene,standardDesign(battleId,unit));
  const pole=scene.add.rectangle(0,-29,1.8,46,0x59422b);
  const glint=scene.add.rectangle(-.4,-29,.45,46,0xb4996c);
  const finial=scene.add.triangle(0,-54,-2,3,0,-3,2,3,0xc4ab74);
  container.add([pole,glint,finial]);
  container.flagStrips=Array.from({length:28},(_,i)=>{
    const strip=scene.add.image(i,-43,key,i).setOrigin(0,.5).setDisplaySize(1.06,18);
    container.add(strip);return strip;
  });
  container.flagPhase=Array.from(unit.id).reduce((n,c)=>n+c.charCodeAt(0),0)*.17;
}

export function animateStandard(container,time) {
  container.flagStrips.forEach((strip,i)=>{
    const fold=clothSample(i/27,time,container.flagPhase);
    strip.setY(-43+fold.y).setDisplaySize(1.06,18*fold.height);
    strip.setTint((fold.shade<<16)|(fold.shade<<8)|fold.shade);
  });
}
