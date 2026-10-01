// Original procedural effects; no recordings, network calls or musical assets.
export function synthesizeEffect(kind, sampleRate = 44100, seed = 17) {
  const duration = kind === 'cannon' ? 1.6 : kind === 'metal' ? .34 : .55;
  const samples = new Float32Array(Math.ceil(sampleRate * duration));
  let random = seed >>> 0, low = 0;
  for (let i=0;i<samples.length;i++) {
    random=(Math.imul(random,1664525)+1013904223)>>>0;
    const noise=random/2147483648-1, t=i/sampleRate;
    low += .08*(noise-low);
    const attack=Math.min(1,t/.002);
    let value;
    if(kind==='cannon') value=.8*low*Math.exp(-t*3.3)+.24*Math.sin(2*Math.PI*(62*t-12*t*t))*Math.exp(-t*5)+.3*noise*Math.exp(-t*65);
    else if(kind==='metal') value=(Math.sin(t*2*Math.PI*1271)*.2+Math.sin(t*2*Math.PI*2093)*.13+Math.sin(t*2*Math.PI*3187)*.06)*Math.exp(-t*19)+noise*.1*Math.exp(-t*100);
    else value=noise*.55*Math.exp(-t*45)+low*.65*Math.exp(-t*10)+Math.sin(t*2*Math.PI*165)*.12*Math.exp(-t*26);
    samples[i]=Math.max(-.9,Math.min(.9,value*attack));
  }
  return samples;
}
export class BattleSound {
  constructor() { this.enabled=false;this.volume=.45;this.voices=new Set();this.serials=new Map();this.lastMetal=-10;this.lastShot=-10;this.running=false; }
  async enable() {
    try {
      if(!this.context) {
        const AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;
        if(!AudioContext)return false;
        this.context=new AudioContext();
        this.master=this.context.createGain();this.master.gain.value=0;
        this.limiter=this.context.createDynamicsCompressor();
        this.master.connect(this.limiter);this.limiter.connect(this.context.destination);
        this.buffers={};
        for(const kind of ['musket','cannon','metal']) {
          const data=synthesizeEffect(kind,this.context.sampleRate);
          const buffer=this.context.createBuffer(1,data.length,this.context.sampleRate);buffer.copyToChannel(data,0);this.buffers[kind]=buffer;
        }
      }
      await this.context.resume();
      this.enabled=this.context.state==='running';return this.enabled;
    } catch {this.enabled=false;return false;}
  }
  silence() {
    if(this.master)this.master.gain.value=0;
    for(const voice of [...this.voices])voice.stop();
    this.voices.clear();
  }
  setVolume(value) {this.volume=Math.max(0,Math.min(1,value));if(this.master)this.master.gain.value=this.enabled&&this.running?this.volume:0;}
  disable() {this.enabled=false;this.silence();}
  play(kind,x) {
    if(!this.enabled||!this.running||!this.volume||this.context?.state!=='running'||this.voices.size>=10)return;
    const source=this.context.createBufferSource(),gain=this.context.createGain(),pan=this.context.createStereoPanner();
    source.buffer=this.buffers[kind];gain.gain.value=kind==='cannon'?.65:kind==='metal'?.2:.45;
    pan.pan.value=Math.max(-.75,Math.min(.75,(x/1200-.5)*1.5));
    source.connect(gain);gain.connect(pan);pan.connect(this.master);
    this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();gain.disconnect();pan.disconnect();};
    source.start();
  }
  sync(snapshot,running) {
    this.running=running;
    if(!running)this.silence();
    if(!snapshot)return;
    const now=this.context?.currentTime||0;
    if(this.master)this.master.gain.value=this.enabled&&running?this.volume:0;
    for(const unit of snapshot.formations) {
      const previous=this.serials.get(unit.id);this.serials.set(unit.id,unit.volleySerial);
      if(previous!==undefined&&unit.volleySerial>previous&&now-this.lastShot>.065) {
        this.play(unit.type==='artillery'?'cannon':'musket',unit.x);this.lastShot=now;
      }
    }
    const contact=snapshot.formations.find(unit=>unit.active&&unit.engaged);
    if(contact&&now-this.lastMetal>.6) {this.play('metal',contact.x);this.lastMetal=now;}
  }
  dispose() {this.disable();this.context?.close().catch(()=>{});}
}
