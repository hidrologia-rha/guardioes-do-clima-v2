// Áudio sintetizado com WebAudio: nenhum arquivo externo é necessário.
const Sound = {
  ctx: null, musicGain: null, sfxGain: null, rainGain: null, windGain: null, musicTimer: null,

  // Navegadores só liberam áudio depois de um gesto do usuário.
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = this.ctx = new AC();
    this.musicGain = ctx.createGain(); this.musicGain.connect(ctx.destination);
    this.sfxGain = ctx.createGain(); this.sfxGain.connect(ctx.destination);
    // ruído branco reaproveitado para chuva e vento
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const mk = (type, freq, q) => {
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(f); f.connect(g); g.connect(this.musicGain); src.start();
      return g;
    };
    this.rainGain = mk('highpass', 1800, 0.4);
    this.windGain = mk('bandpass', 380, 0.8);
    this.applyVolumes();
    this.startMusic();
  },
  applyVolumes() {
    if (!this.ctx) return;
    this.musicGain.gain.value = Settings.music * 0.6;
    this.sfxGain.gain.value = Settings.sfx;
  },
  setAmbient(rain, wind) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.rainGain.gain.setTargetAtTime(rain * 0.35, t, 0.8);
    this.windGain.gain.setTargetAtTime(0.03 + wind * 0.22, t, 0.8);
  },
  tone(freq, dur, type = 'sine', vol = 0.25, when = 0, dest = this.sfxGain) {
    const ctx = this.ctx, t = ctx.currentTime + when;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.03, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  },
  // Música ambiente generativa e calma (escala pentatônica).
  startMusic() {
    const scale = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];
    let step = 0;
    this.musicTimer = setInterval(() => {
      if (!this.ctx || document.hidden) return;
      step++;
      if (step % 8 === 0) this.tone(scale[Math.floor(Math.random() * 3)] / 2, 3.5, 'triangle', 0.06, 0, this.musicGain);
      if (Math.random() < 0.55) this.tone(scale[Math.floor(Math.random() * scale.length)], 1.8, 'sine', 0.045, 0, this.musicGain);
    }, 650);
  },
  CAPTIONS: { ok: 'som de acerto', error: 'som suave de tentativa', pickup: 'som de item recebido', reward: 'fanfarra de conquista', page: 'página virando', open: '', talk: '' },
  sfx(name) {
    if (Settings.captions && this.CAPTIONS[name]) UI.caption(this.CAPTIONS[name]);
    if (!this.ctx) return;
    const T = (...a) => this.tone(...a);
    switch (name) {
      case 'ok': T(523, .18, 'triangle', .22); T(659, .18, 'triangle', .22, .1); T(784, .35, 'triangle', .22, .2); break;
      case 'error': T(330, .22, 'sine', .18); T(262, .3, 'sine', .15, .14); break;
      case 'pickup': T(880, .12, 'square', .08); T(1175, .25, 'triangle', .15, .08); break;
      case 'reward': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => T(f, .4, 'triangle', .2, i * .13)); break;
      case 'page': T(1400, .06, 'sine', .06); T(900, .08, 'sine', .05, .05); break;
      case 'open': T(660, .07, 'sine', .1); break;
      case 'talk': T(500 + Math.random() * 200, .04, 'sine', .04); break;
      case 'step': T(120, .05, 'sine', .04); break;
    }
  },
};
