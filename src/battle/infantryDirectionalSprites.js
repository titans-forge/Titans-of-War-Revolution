import {SPECIAL_INFANTRY_SOURCES,SPECIAL_INFANTRY_SPRITES} from './infantrySpecialProfiles.js';
import {INFANTRY_DIAGONAL_SOURCES,INFANTRY_DIAGONAL_SPRITES} from './infantryDiagonalAtlas.js';
import {INFANTRY_DIRECTIONAL_SOURCES,INFANTRY_DIRECTIONAL_SPRITES} from './infantryDirectionalAtlas.js';
export {INFANTRY_DIRECTIONAL_SOURCES,INFANTRY_DIRECTIONAL_SPRITES};
export const ALL_INFANTRY_DIRECTIONAL_SPRITES=[...INFANTRY_DIRECTIONAL_SPRITES,...INFANTRY_DIAGONAL_SPRITES,...SPECIAL_INFANTRY_SPRITES];
const sources=[...INFANTRY_DIRECTIONAL_SOURCES,...INFANTRY_DIAGONAL_SOURCES,...SPECIAL_INFANTRY_SOURCES];
const poses=['carry','fire','reload','guard','thrust'];
const lookup=new Map(ALL_INFANTRY_DIRECTIONAL_SPRITES.map(s=>[`${s.profile}/${s.view}/${s.pose}`,s]));
export function directionalSources(profiles){return sources.filter(s=>profiles.includes(s.profile));}
export function directionalProfileReady(profile,hasTexture){
 return ['front','rear'].every(view=>poses.every(pose=>{const sprite=lookup.get(`${profile}/${view}/${pose}`);return sprite&&hasTexture(sprite.runtimeKey);}));
}
export function directionalSpritePlacement(profile,view,pose,height=36,flipX=false){
 const s=directionalSprite(profile,view,pose);if(!s||!Number.isFinite(height)||height<=0)return null;
 const originX=(s.anchor.x-s.frame.x+s.padding)/(s.frame.width+s.padding*2);
 return {flipX,key:s.runtimeKey,frame:'body',scale:height/s.bodyHeight,originX:flipX?1-originX:originX,originY:(s.anchor.y-s.frame.y+s.padding)/(s.frame.height+s.padding*2)};
}

export function directionalSprite(profile,view,pose='carry'){return lookup.get(`${profile}/${view}/${pose.startsWith('march')?'carry':pose}`)||null;}

export function diagonalProfileReady(profile,hasTexture){return directionalProfileReady(profile,hasTexture)&&['frontDiagonal','rearDiagonal'].every(view=>poses.every(pose=>{const s=directionalSprite(profile,view,pose);return s&&hasTexture(s.runtimeKey);}));}
