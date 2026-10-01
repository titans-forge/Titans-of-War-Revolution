import {FERGUSON_SOURCES,FERGUSON_SPRITES,FERGUSON_TORSO} from './fergusonAtlas.js';
import {GRENADIER_SOURCES,GRENADIER_SPRITES,GRENADIER_TORSO} from './grenadierAtlas.js';

// A new uniform must stay coherent across every action and walking part.
// Keep the previous complete profile available while loading or on failure.
const profiles=new Map([
 [4,{fallback:3,sources:FERGUSON_SOURCES,sprites:FERGUSON_SPRITES,torso:FERGUSON_TORSO}],
 [5,{fallback:1,sources:GRENADIER_SOURCES,sprites:GRENADIER_SPRITES,torso:GRENADIER_TORSO}],
]);
const views=['side','front','rear','frontDiagonal','rearDiagonal'];
const poses=['carry','fire','reload','guard','thrust'];
export const SPECIAL_INFANTRY_IDS=[...profiles.keys()];
export const SPECIAL_INFANTRY_SOURCES=[...profiles.values()].flatMap(p=>p.sources);
export const SPECIAL_INFANTRY_SPRITES=[...profiles.values()].flatMap(p=>p.sprites);
export function specialInfantryProfile(profile){return profiles.get(profile)||null;}
export function infantryProfileLoadSet(profile){
 const special=profiles.get(profile);return special?[profile,special.fallback]:[profile];
}
export function specialInfantryProfileReady(profile,hasTexture){
 const p=profiles.get(profile);if(!p)return false;
 return views.every(view=>poses.every(pose=>p.sprites.some(s=>s.view===view&&s.pose===pose&&hasTexture(s.runtimeKey))))
  &&Boolean(p.torso&&hasTexture(p.torso.runtimeKey))
  &&['thigh','calf','foot'].every(part=>hasTexture(`revolution-infantry-rig-${part}`));
}
export function resolveInfantryProfile(profile,hasTexture){
 const p=profiles.get(profile);return p&&!specialInfantryProfileReady(profile,hasTexture)?p.fallback:profile;
}
