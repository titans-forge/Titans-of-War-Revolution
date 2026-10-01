export function cavalryContactCycle(unit,time,figurePhase=0,since=time,inFront=false) {
 if(!unit?.active||unit.type!=='cavalry'||unit.status!=='steady'||!unit.engaged||unit.moving||['withdraw','fallback'].includes(unit.order)||!Number.isFinite(time)||!Number.isFinite(since))return null;
 const age=Math.max(0,time-since);
 if(!inFront||age<.3)return {frame:0,stage:'guard',progress:0,age};
 const variation=Number.isFinite(figurePhase)?figurePhase:0;
 const duration=2+.15*Math.sin(variation),phase=(((age-.3)/duration+variation*.13)%1+1)%1;
 return phase<.55?{frame:0,stage:'guard',progress:phase,age}:phase<.65?{frame:0,stage:'prepare',progress:phase,age}:phase<.83?{frame:1,stage:'cut',progress:phase,age}:{frame:0,stage:'recover',progress:phase,age};
}
export function artilleryHaulFrame(unit,travel) {
 if(!unit?.active||unit.type!=='artillery'||unit.status!=='steady'||!unit.moving||unit.engaged||unit.order==='fallback'||!Number.isFinite(travel)||!(unit.initialStrength>0))return null;
 // Three authored workers replace the first three visible crew. A depleted
 // crew uses the individual figures so hauling cannot conjure extra men.
 if(Math.round(5*unit.strength/unit.initialStrength)<3)return null;
 return Math.floor(((travel%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/Math.PI);
}
