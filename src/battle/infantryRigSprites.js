import {SPECIAL_INFANTRY_IDS,specialInfantryProfile} from './infantrySpecialProfiles.js';
// Authored cutout parts. Pale manufacturing-style overlap cuffs on the source
// calf and shoe are deliberately outside their runtime frames.
const DATA={
 torso:{frame:{x:183,y:4,width:394,height:713},pivot:{x:385,y:590},scaleX:18.6/475,scaleY:18.6/475},
 thigh:{frame:{x:842,y:196,width:186,height:473},pivot:{x:935,y:245},widthScale:3.5/174,jointLength:375},
 calf:{frame:{x:245,y:810,width:178,height:350},pivot:{x:333,y:815},widthScale:2.6/166,jointLength:339},
 foot:{frame:{x:746,y:977,width:386,height:180},pivot:{x:845,y:989},scaleX:2/161,scaleY:2/161},
};
export const INFANTRY_RIG_SPRITES=Object.freeze(Object.fromEntries(Object.entries(DATA).map(([part,data])=>[part,Object.freeze({
 ...data,part,key:'revolution-infantry-rig-parts-v1',path:'/images/units/revolution-infantry-rig-parts-v1.png',padding:2,
 runtimeKey:`revolution-infantry-rig-${part}`,
})])));

const UNIFORM_PARTS={
 britishTorso:{part:'torso',frame:{x:70,y:4,width:363,height:626},pivot:{x:256,y:532},scaleX:18.6/442,scaleY:18.6/442},
 germanTorso:{part:'torso',frame:{x:525,y:5,width:364,height:624},pivot:{x:711,y:532},scaleX:18.6/442,scaleY:18.6/442},
 militiaTorso:{part:'torso',frame:{x:1001,y:5,width:363,height:620},pivot:{x:1186,y:532},scaleX:18.6/442,scaleY:18.6/442},
 militiaThigh:{part:'thigh',frame:{x:145,y:640,width:183,height:423},pivot:{x:235,y:684},widthScale:3.5/171,jointLength:330},
 militiaCalf:{part:'calf',frame:{x:617,y:654,width:163,height:403},pivot:{x:700,y:695},widthScale:2.6/151,jointLength:320},
 militiaFoot:{part:'foot',frame:{x:1006,y:806,width:388,height:227},pivot:{x:1117,y:848},scaleX:2/178,scaleY:2/178},
};
export const INFANTRY_UNIFORM_PARTS=Object.freeze(Object.fromEntries(Object.entries(UNIFORM_PARTS).map(([name,data])=>[name,Object.freeze({
 ...data,key:'revolution-infantry-uniform-rig-v1',path:'/images/units/revolution-infantry-uniform-rig-v1.png',padding:2,
 runtimeKey:`revolution-infantry-rig-${name}`,
})])));
export const INFANTRY_UNIFORM_RIGS=Object.freeze({
 0:INFANTRY_RIG_SPRITES,
 ...Object.fromEntries(SPECIAL_INFANTRY_IDS.map(profile=>[profile,Object.freeze({...INFANTRY_RIG_SPRITES,torso:specialInfantryProfile(profile).torso})])),
 1:Object.freeze({...INFANTRY_RIG_SPRITES,torso:INFANTRY_UNIFORM_PARTS.britishTorso}),
 2:Object.freeze({...INFANTRY_RIG_SPRITES,torso:INFANTRY_UNIFORM_PARTS.germanTorso}),
 3:Object.freeze({torso:INFANTRY_UNIFORM_PARTS.militiaTorso,thigh:INFANTRY_UNIFORM_PARTS.militiaThigh,calf:INFANTRY_UNIFORM_PARTS.militiaCalf,foot:INFANTRY_UNIFORM_PARTS.militiaFoot}),
});
export function infantryRigSprites(profile=0) {
 return Number.isInteger(profile) ? INFANTRY_UNIFORM_RIGS[profile] || null : null;
}
export function infantryRigTextures(profiles=[0,1,2,3,...SPECIAL_INFANTRY_IDS]) {
 const unique=new Map();
 for(const profile of profiles)for(const part of Object.values(infantryRigSprites(profile)||{}))unique.set(part.runtimeKey,part);
 return [...unique.values()];
}
export function infantryRigSources(profiles) {
 return [...new Map(infantryRigTextures(profiles).map(s=>[s.key,{key:s.key,path:s.path}])).values()];
}
export function rigPartPlacement(part,scale=1,direction=1,length=null,profile=0) {
 const s=infantryRigSprites(profile)?.[part];if(!s||!Number.isFinite(scale)||scale<=0||![1,-1].includes(direction))return null;
 const f=s.frame,p=s.padding,x=(s.pivot.x-f.x+p)/(f.width+p*2);
 if(s.jointLength&&(!Number.isFinite(length)||length<=0))return null;
 return {key:s.runtimeKey,frame:'body',originX:direction>0?x:1-x,originY:(s.pivot.y-f.y+p)/(f.height+p*2),
  scaleX:(s.widthScale||s.scaleX)*scale,scaleY:s.jointLength?length/s.jointLength:s.scaleY*scale};
}
