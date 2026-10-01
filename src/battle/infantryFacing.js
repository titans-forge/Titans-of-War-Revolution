import {infantryPose} from './infantryAnimation.js';
import {infantryActionFrame} from './infantryActionFrames.js';
import {infantryContactCycle} from './infantryContactCycle.js';

// Four authored directions. A dead band keeps a formation from flickering
// between atlases while pathfinding makes small corrections near a diagonal.
export function infantryFacing(facing,previous=null) {
  if(!Number.isFinite(facing))return 'side';
  const vertical=Math.abs(Math.sin(facing));
  const candidate=Math.sin(facing)>=0?'front':'rear';
  if(previous===candidate && vertical>=.70)return candidate;
  return vertical>=.82?candidate:'side';
}

// Shares the side-view state selectors. No extra animation clocks, damage,
// timers or reload logic can drift from the simulation when the camera view changes.
export function directionalInfantryPose(unit,travel,time,figurePhase=0,since=time,inFront=false) {
  if(!unit?.active || unit.type!=='infantry' || !['steady','routed'].includes(unit.status))return null;
  const action=infantryActionFrame(unit,travel,figurePhase);
  if(action?.kind==='march')return `march${action.frame}`;
  if(action?.kind==='contact')return infantryContactCycle(unit,time,figurePhase,since,inFront)?.frame===1?'thrust':'guard';
  const pose=infantryPose(unit,figurePhase);
  return pose==='fire'||pose==='ready'?'fire':pose==='reload'?'reload':pose==='contact'?'guard':'carry';
}
