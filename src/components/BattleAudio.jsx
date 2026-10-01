import { useEffect, useRef, useState } from 'react';
import { BattleSound } from '../battle/battleSound.js';
export function BattleAudio({ snapshot, speed }) {
  const sound=useRef(null);
  if(!sound.current)sound.current=new BattleSound();
  const [enabled,setEnabled]=useState(false),[volume,setVolume]=useState(45),[error,setError]=useState('');
  const [visible,setVisible]=useState(()=>!document.hidden);
  useEffect(()=>{
    const changed=()=>{setVisible(!document.hidden);if(document.hidden)sound.current.silence();};
    document.addEventListener('visibilitychange',changed);
    return()=>{document.removeEventListener('visibilitychange',changed);sound.current.dispose();};
  },[]);
  useEffect(()=>{sound.current.sync(snapshot,visible&&speed>0&&snapshot?.outcome==='undecided');},[snapshot,speed,visible,enabled]);
  return <div className="battle-audio">
    <button aria-pressed={enabled} onClick={async()=>{
      if(enabled){sound.current.disable();setEnabled(false);return;}
      const ready=await sound.current.enable();setEnabled(ready);setError(ready?'':'Audio could not start. Try enabling it again.');
    }}>{enabled?'Mute battle sound':'Enable battle sound'}</button>
    <label>Effects volume <input aria-label="Effects volume" type="range" min="0" max="100" value={volume} onChange={event=>{const value=Number(event.target.value);setVolume(value);sound.current.setVolume(value/100);}} /></label>
    {error&&<small role="status">{error}</small>}
  </div>;
}
