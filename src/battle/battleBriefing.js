export function startingAmmunition(selected,definition){
 const original=definition?.formations?.find(u=>u.id===selected?.id);
 if(!original||!Number.isFinite(selected?.initialAmmunition))return null;
 return {actual:selected.initialAmmunition,standard:original.ammunition??(original.type==='artillery'?24:70)};
}
export const CAMPAIGN_CHECKPOINT_NOTE='Campaign battles checkpoint locally about once a second and after orders. Reloads restore paused. Return to the campaign to record the result. Exported campaign files do not include battle positions.';
