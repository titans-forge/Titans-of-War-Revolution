import {FERGUSON_SOURCES,FERGUSON_SPRITES,FERGUSON_TORSO} from './fergusonAtlas.js';
export {FERGUSON_SOURCES,FERGUSON_SPRITES,FERGUSON_TORSO};
const lookup=new Map(FERGUSON_SPRITES.map(s=>[`${s.view}/${s.pose}`,s]));
export function fergusonSprite(view,pose='carry') {
 return lookup.get(`${view}/${pose.startsWith('march')?'carry':pose}`)||null;
}
export function fergusonProfileReady(hasTexture) {
 return ['side','front','rear','frontDiagonal','rearDiagonal'].every(view=>
  ['carry','fire','reload','guard','thrust'].every(pose=>{const s=fergusonSprite(view,pose);return s&&hasTexture(s.runtimeKey);}))
  &&Boolean(FERGUSON_TORSO&&hasTexture(FERGUSON_TORSO.runtimeKey))
  &&['thigh','calf','foot'].every(part=>hasTexture(`revolution-infantry-rig-${part}`));
}
export {resolveInfantryProfile} from './infantrySpecialProfiles.js';
