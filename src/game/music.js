import { publicAsset } from './publicAsset.js';
export const MUSIC_TRACKS = [
  { title: 'Bach · Goldberg Variations: Aria', file: '/audio/bach-goldberg-aria.mp3', performer: 'Kimiko Ishizaka', rights: 'CC0 recording', source: 'https://opengoldbergvariations.org/' },
  { title: 'Handel · Water Music: Sarabande', file: '/audio/handel-water-music-sarabande.mp3', performer: 'United States Marine Band, Marine Chamber Orchestra', rights: 'Public-domain federal recording', source: "https://commons.wikimedia.org/wiki/File:Handel's_Water_Music_-_16._Sarabande_-_Chamber_Orchestra_-_United_States_Marine_Band.opus" },
];
export class MusicPlayer {
  constructor(audio, notify = () => {}) {
    this.audio=audio; this.notify=notify; this.index=0; this.enabled=false; this.visible=true; this.generation=0; this.disposed=false;
    audio.preload='none'; audio.volume=.25;
    this.ended=()=>{if(this.enabled)this.select((this.index+1)%MUSIC_TRACKS.length);};
    this.failed=()=>{if(!this.disposed){this.enabled=false;this.generation++;audio.pause();this.emit('Music could not load. Choose another track or try Play music again.');}};
    audio.addEventListener('ended',this.ended); audio.addEventListener('error',this.failed);
  }
  emit(error='') {this.notify({index:this.index,enabled:this.enabled,error});}
  async play() {
    if(this.disposed)return;
    this.enabled=true; this.emit();
    if(!this.visible)return;
    const generation=++this.generation;
    if(!this.audio.getAttribute('src'))this.audio.src=publicAsset(MUSIC_TRACKS[this.index].file);
    try {await this.audio.play();}
    catch {if(generation===this.generation&&!this.disposed){this.enabled=false;this.emit('Music could not start. Press Play music to try again.');}}
    if(!this.enabled||!this.visible||this.disposed)this.audio.pause();
  }
  pause() {this.enabled=false;this.generation++;this.audio.pause();this.emit();}
  select(index) {
    if(!Number.isInteger(index)||index<0||index>=MUSIC_TRACKS.length)return;
    this.generation++;this.audio.pause();this.index=index;this.audio.src=publicAsset(MUSIC_TRACKS[index].file);this.audio.load();this.emit();
    if(this.enabled)this.play();
  }
  visibility(visible) {this.visible=visible;this.generation++;if(!visible)this.audio.pause();else if(this.enabled)this.play();}
  volume(value) {if(Number.isFinite(value))this.audio.volume=Math.min(1,Math.max(0,value));}
  dispose() {this.disposed=true;this.enabled=false;this.generation++;this.audio.pause();this.audio.removeEventListener('ended',this.ended);this.audio.removeEventListener('error',this.failed);this.audio.removeAttribute('src');this.audio.load();}
}
