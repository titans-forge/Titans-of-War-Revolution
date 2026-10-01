import {applyBattleResult} from './campaign.js';
import {loadCampaign,saveCampaign,SAVE_VERSION} from './storage.js';
export const BATTLE_STORAGE_KEY='titans-of-war:revolution:battle';
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
export const campaignBattleKey=state=>JSON.stringify(stable({...state,version:SAVE_VERSION}));
const target=s=>s===undefined?globalThis.localStorage:s;
export function loadBattleProgress(campaign,storage){
 try{
  const raw=target(storage)?.getItem(BATTLE_STORAGE_KEY);
  if(!raw)return {checkpoint:null,error:''};
  if(raw.length>2_000_000)throw Error('oversized');
  const value=JSON.parse(raw);
  if(value?.version!==1)throw Error('version');
  if(value.campaignKey!==campaignBattleKey(campaign))return {checkpoint:null,error:''};
  if(!value.checkpoint?.engine || typeof value.checkpoint.selectedId!=='string')throw Error('invalid');
  return {checkpoint:value.checkpoint,error:''};
 }catch{return {checkpoint:null,error:'The local battle checkpoint could not be read. This battle starts from deployment.'};}
}
export function saveBattleProgress(campaign,checkpoint,storage){
 if(!checkpoint?.engine)return {ok:false,error:'Battle checkpoint could not be created. Keep this battle open to preserve progress.'};
 try{
  const s=target(storage);
  if(!s)throw Error('unavailable');
  // A stale tab may not replace another campaign or resurrect a resolved battle.
  const current=loadCampaign(s);
  if(!current || !current.pendingBattle || campaignBattleKey(current)!==campaignBattleKey(campaign))return {ok:false,error:'Battle checkpoint not saved: the stored campaign has changed. Reload to continue the current campaign.'};
  const serialized=JSON.stringify({version:1,campaignKey:campaignBattleKey(campaign),checkpoint});
  if(serialized.length>2_000_000)throw Error('oversized');
  s.setItem(BATTLE_STORAGE_KEY,serialized);
  return {ok:true,error:''};
 }catch{return {ok:false,error:'Battle checkpoint could not be saved in this browser. Reloading may lose recent battle progress.'};}
}
export function clearBattleProgress(storage){
 try{target(storage)?.removeItem(BATTLE_STORAGE_KEY);return true;}catch{return false;}
}

export function resolveCampaignBattle(campaign,result,storage){
 try{
  const current=loadCampaign(target(storage));
  if(!current || !current.pendingBattle || campaignBattleKey(current)!==campaignBattleKey(campaign))return {ok:false,error:'The stored campaign changed. This result was not applied. Reload to continue the current campaign.'};
  const state=applyBattleResult(campaign,campaign.pendingBattle,result);
  const saved=saveCampaign(state,target(storage));
  if(!saved.ok)return {ok:false,error:'The battle result could not be saved. Keep this page open and try returning to the campaign again.'};
  clearBattleProgress(storage);
  return {ok:true,state,error:''};
 }catch{return {ok:false,error:'The battle result could not be saved. Keep this page open and try again.'};}
}
