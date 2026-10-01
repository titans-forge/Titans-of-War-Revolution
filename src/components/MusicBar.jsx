import { useEffect, useRef, useState } from 'react';
import { MUSIC_TRACKS, MusicPlayer } from '../game/music.js';
import { BattleDialog } from './BattleDialog.jsx';
const VOLUME_KEY='revolution-music-volume-v1';
export function MusicBar() {
  const audio=useRef(null), player=useRef(null);
  const [state,setState]=useState({index:0,enabled:false,error:''});
  const [settings,setSettings]=useState(false);
  const [volume,setVolume]=useState(()=>{try{const raw=localStorage.getItem(VOLUME_KEY),n=Number(raw);return raw!==null&&Number.isFinite(n)?Math.max(0,Math.min(100,n)):25;}catch{return 25;}});
  useEffect(()=>{
    const music=new MusicPlayer(audio.current,setState);player.current=music;music.volume(volume/100);music.visibility(!document.hidden);
    const visibility=()=>music.visibility(!document.hidden);
    document.addEventListener('visibilitychange',visibility);
    return()=>{document.removeEventListener('visibilitychange',visibility);music.dispose();player.current=null;};
  },[]);
  const track=MUSIC_TRACKS[state.index];
  return <>
    <nav className="music-bar" aria-label="Music controls">
      <button onClick={()=>state.enabled?player.current?.pause():player.current?.play()} aria-pressed={state.enabled}>{state.enabled?'Pause music':'Play music'}</button>
      <span className="music-track" title={track.title}>{track.title}</span>
      <button onClick={()=>setSettings(true)}>Music settings</button>
      <audio ref={audio} preload="none" />
    </nav>
    {state.error&&<div className="music-error" role="status">{state.error}</div>}
    {settings&&<BattleDialog title="Music settings" onClose={()=>setSettings(false)}>
      <p>Full instrumental recordings. Music continues between scenes and pauses when this tab is hidden.</p>
      <label className="music-setting">Track<select aria-label="Music track" value={state.index} onChange={e=>player.current?.select(Number(e.target.value))}>{MUSIC_TRACKS.map((t,i)=><option key={t.file} value={i}>{t.title}</option>)}</select></label>
      <label className="music-setting">Music volume · {volume}%<input aria-label="Music volume" type="range" min="0" max="100" value={volume} onChange={e=>{const v=Number(e.target.value);setVolume(v);player.current?.volume(v/100);try{localStorage.setItem(VOLUME_KEY,String(v));}catch{}}}/></label>
      <button onClick={()=>player.current?.select((state.index+1)%MUSIC_TRACKS.length)}>Next track</button>
      <p>Battle effects have their own volume control in the formation panel.</p>
      <h3>Recording credits</h3>
      {MUSIC_TRACKS.map(t=><p key={t.file}><strong>{t.title}</strong><br/>{t.performer} · {t.rights}. <a href={t.source} target="_blank" rel="noreferrer">Recording source</a></p>)}
    </BattleDialog>}
  </>;
}
