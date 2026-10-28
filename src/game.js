// Laço principal, troca de regiões, interações e a API usada pelos roteiros dos capítulos.
const Game = {
  canvas: null, ctx: null, map: null, player: null, t: 0, mode: 'title', busy: false, near: null, last: 0,

  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    addEventListener('resize', () => this.resize());
    this.resize();
    this.canvas.addEventListener('click', e => {
      if (this.mode !== 'play' || this.busy) return;
      const [wx, wy] = Camera.toWorld(e.clientX, e.clientY);
      const ent = this.map.entities.find(en => en.kind !== 'obj' && Math.hypot(en.x - wx, en.y - en.top / 2 - wy) < Math.max(40, en.top / 2));
      if (ent && Math.hypot(ent.x - this.player.x, ent.y - this.player.y) < 110) this.interact(ent);
      else if (ent) UI.toast('Chegue mais perto para interagir.', '➜');
    });
    requestAnimationFrame(ts => this.loop(ts));
  },
  resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = innerWidth * DPR; this.canvas.height = innerHeight * DPR;
    Camera.resize(innerWidth, innerHeight);
    if (this.map) Camera.snap(this.player.x, this.player.y, this.map);
  },

  // Carrega uma região. pos = posição salva (opcional).
  load(chId, pos) {
    Progress.state.chapter = chId;
    this.map = World.build(chId);
    const [x, y] = pos || this.map.def.spawn;
    this.player = new Player(x, y);
    if (Collision.blocked(this.map, x, y, this.player.r)) [this.player.x, this.player.y] = this.map.def.spawn;
    Weather.init(this.map);
    Camera.snap(this.player.x, this.player.y, this.map);
    this.mode = 'play';
    UI.showHUD(true); UI.updateHUD();
    Progress.save();
  },
  travel(chId) {
    UI.fade(() => {
      this.load(chId);
      const ch = CHAPTERS[chId];
      UI.toast(`<b>${ch.label}</b> — ${ch.title}`, '⚑');
      if (ch.onEnter && !Progress.done(chId + '_entered')) { Progress.complete(chId + '_entered'); this.runScript(ch.onEnter); }
    });
  },
  // Recria entidades da região (ex.: árvores plantadas aparecem depois do laboratório).
  refresh() {
    const p = this.player;
    this.map = World.build(Progress.state.chapter);
    if (Collision.blocked(this.map, p.x, p.y, p.r)) [p.x, p.y] = this.map.def.spawn;
  },
  toTitle() {
    UI.closeModal(true);
    this.mode = 'title'; this.map = null; UI.showHUD(false);
    Main.showTitle();
  },

  interact(ent) {
    const ch = Missions.chapter();
    const script = ch.scripts && ch.scripts[ent.id];
    if (script) this.runScript(script);
    else if (ent.say) this.runScript(api => api.say(ent.say));
  },
  async runScript(fn) {
    if (this.busy) return;
    this.busy = true;
    try { await fn(this.api); }
    catch (err) { console.error(err); }
    finally { this.busy = false; }
  },

  api: {
    say: id => Dialogue.play(id),
    challenge: id => Challenges.run(id),
    lab: id => Lab.run(id),
    done: id => Progress.done(id),
    all: (...ids) => ids.every(id => Progress.done(id)),
    complete: id => Progress.complete(id),
    journal: id => Progress.unlockJournal(id),
    item: id => Progress.addItem(id),
    record: (k, v) => { Progress.record(k, v); UI.toast(`Medição registrada no Diário: <b>${v}</b>`, '✎'); },
    refresh: () => Game.refresh(),
    wait: ms => new Promise(r => setTimeout(r, ms)),
    finishChapter: () => Game.finishChapter(),
    ending: () => Game.ending(),
  },

  finishChapter() {
    const ch = Missions.chapter();
    Progress.addItem(ch.reward);
    Progress.completeChapter(Progress.state.chapter);
    Sound.sfx('reward');
    return new Promise(res => UI.chapterComplete(ch, () => { if (ch.next) UI.map(true); res(); }));
  },
  async ending() {
    Progress.state.finished = true;
    Progress.completeChapter('cap5');
    Progress.addItem('nucleo');
    Sound.sfx('reward');
    await this.api.wait(2200);
    await Dialogue.play('c5_final');
    UI.showHUD(false);
    UI.showEnd();
  },

  loop(ts) {
    // passos de no máximo 50 ms: computadores lentos não deixam o jogo em câmera lenta nem atravessam paredes
    let acc = Math.min(.25, (ts - this.last) / 1000 || 0); this.last = ts;
    if (this.mode === 'play') {
      for (; acc > 0; acc -= .05) { this.update(Math.min(.05, acc)); Input.endFrame(); }
      this.draw();
    }
    Input.endFrame();
    requestAnimationFrame(t => this.loop(t));
  },
  update(dt) {
    this.t += dt;
    Dialogue.update(dt);
    const modal = UI.modalOpen(), endOn = document.getElementById('screen-end') && !document.getElementById('screen-end').hidden;
    if (Dialogue.active) {
      if (Input.consume('e', ' ', 'enter')) Dialogue.advance();
    } else if (!modal && !endOn) {
      if (Input.consume('escape', 'p')) UI.panel('pause');
      else if (Input.consume('j')) UI.panel('journal');
      else if (Input.consume('i')) UI.panel('inventory');
      else if (Input.consume('m')) UI.panel('map');
      else if (Input.consume('q')) UI.panel('missions');
      if (!this.busy) {
        this.player.update(dt, this.map);
        this.near = World.nearest(this.map, this.player);
        if (this.near && Input.consume('e', ' ', 'enter')) this.interact(this.near);
      }
    }
    if (this.busy || modal) this.player.walk = 0;
    Camera.follow(this.player.x, this.player.y, this.map, dt);
    Weather.update(dt, this.map, this.player, this.t);
  },
  draw() {
    const c = this.ctx, W = Camera.vw, H = Camera.vh;
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.fillStyle = '#16232b'; c.fillRect(0, 0, W, H);
    Camera.apply(c);
    World.draw(c, this.map, this.player, this.t, Weather.w.wind || 0);
    Weather.drawShadows(c);
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    Weather.drawScreen(c, W, H, this.t);
    this.drawMarkers(c, W, H);
  },
  // Seta dourada do objetivo + aviso de interação, em coordenadas de tela (texto sempre nítido).
  drawMarkers(c, W, H) {
    const tid = Missions.target();
    const target = tid && this.map.entities.find(e => e.id === tid);
    if (target && !Dialogue.active) {
      let [sx, sy] = Camera.toScreen(target.x, target.y - target.top);
      const on = sx > 20 && sx < W - 20 && sy > 20 && sy < H - 20;
      if (on) {
        const b = Math.sin(this.t * 4) * 5;
        c.fillStyle = '#f2b33d'; c.strokeStyle = '#6a3f0a'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(sx, sy - 6 + b); c.lineTo(sx - 11, sy - 22 + b); c.lineTo(sx - 4, sy - 22 + b); c.lineTo(sx - 4, sy - 34 + b); c.lineTo(sx + 4, sy - 34 + b); c.lineTo(sx + 4, sy - 22 + b); c.lineTo(sx + 11, sy - 22 + b); c.closePath(); c.fill(); c.stroke();
      } else {
        // seta na borda da tela apontando para o alvo
        const a = Math.atan2(sy - H / 2, sx - W / 2), m = 46;
        const k = Math.min(Math.abs((W / 2 - m) / (Math.cos(a) || 1e-6)), Math.abs((H / 2 - m) / (Math.sin(a) || 1e-6)));
        const fx = W / 2 + Math.cos(a) * k, fy = Math.max(150, H / 2 + Math.sin(a) * k);
        c.save(); c.translate(fx, fy); c.rotate(a);
        Art.ell(c, 0, 0, 22, 22, 'rgba(40,25,10,.55)');
        c.fillStyle = '#f2b33d'; c.beginPath(); c.moveTo(16, 0); c.lineTo(-8, -11); c.lineTo(-3, 0); c.lineTo(-8, 11); c.closePath(); c.fill();
        c.restore();
      }
    }
    const n = this.near;
    if (n && !this.busy && !UI.modalOpen()) {
      const [sx, sy] = Camera.toScreen(n.x, n.y - n.top);
      const label = `${n.verb}: ${n.label}`;
      c.font = 'bold 15px Trebuchet MS';
      const w = c.measureText(label).width + 44, x = sx - w / 2, y = sy - (target === n ? 66 : 34);
      c.fillStyle = 'rgba(246,236,212,.96)'; c.strokeStyle = '#7a4f2c'; c.lineWidth = 2;
      Art.rrect(c, x, y, w, 30, 15); c.fill(); c.stroke();
      Art.rrect(c, x + 5, y + 4, 22, 22, 6); c.fillStyle = '#f2b33d'; c.fill();
      c.fillStyle = '#4a2f00'; c.fillText(Input.touch ? '☝' : 'E', x + (Input.touch ? 8 : 11), y + 20);
      c.fillStyle = '#2c2116'; c.fillText(label, x + 34, y + 20);
    }
  },
};
