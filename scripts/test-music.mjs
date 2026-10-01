import assert from 'node:assert/strict';
import {MusicPlayer,MUSIC_TRACKS} from '../src/game/music.js';
class AudioFake {
 constructor(){this.listeners={};this.src='';this.paused=true;this.plays=0;}
 addEventListener(n,f){this.listeners[n]=f;} removeEventListener(n){delete this.listeners[n];}
 getAttribute(){return this.src;} removeAttribute(){this.src='';}
 play(){this.plays++;this.paused=false;return this.reject?Promise.reject(new Error('blocked')):Promise.resolve();}
 pause(){this.paused=true;} load(){}
}
const audio=new AudioFake();let state;const p=new MusicPlayer(audio,s=>state=s);
assert.equal(audio.plays,0,'no unsolicited autoplay or preload');assert.equal(audio.preload,'none');
await p.play();assert.equal(audio.paused,false);assert.match(audio.src,/^\.\/audio\//);
p.visibility(false);assert.equal(audio.paused,true);assert.equal(p.enabled,true);
p.visibility(true);assert.equal(audio.paused,false);
p.pause();p.visibility(false);p.visibility(true);assert.equal(audio.paused,true,'user pause survives tab visibility');
p.select(1);assert.equal(p.index,1);assert.equal(audio.paused,true,'selection does not enable paused music');
await p.play();audio.listeners.ended();assert.equal(p.index,0,'advance and wrap without repeating one track');
p.volume(2);assert.equal(audio.volume,1);p.volume(-3);assert.equal(audio.volume,0);p.volume(NaN);assert.equal(audio.volume,0);
audio.reject=true;await p.play();assert.equal(p.enabled,false);assert.ok(state.error);
audio.reject=false;await p.play();assert.equal(state.error,'');audio.listeners.error();assert.equal(p.enabled,false);
p.dispose();assert.equal(audio.src,'');assert.deepEqual(audio.listeners,{});assert.equal(audio.paused,true);
let resolve;const delayed=new AudioFake();delayed.play=()=>new Promise(r=>resolve=r);const race=new MusicPlayer(delayed);const pending=race.play();race.pause();resolve();await pending;assert.equal(delayed.paused,true);
assert.equal(MUSIC_TRACKS.length,2);
console.log('Music lifecycle passed: opt-in playback, independent volume, playlist wrap, visibility, failure recovery, pause race and cleanup.');
