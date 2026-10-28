// Regiões exploráveis: monta o mapa a partir de data/chapters.js, desenha o mundo e o tempo atmosférico.
const World = {
  build(chId) {
    const def = CHAPTERS[chId].map;
    const m = { def, w: def.size[0], h: def.size[1], seed: def.seed || 1, land: def.land || null, lakes: def.lakes || [], colliders: [], entities: [], sparkles: [], critters: [] };
    m.walkable = (x, y, r) => {
      if (x < r || y < r || x > m.w - r || y > m.h - r) return false;
      for (const [px, py] of [[x, y], [x + r, y], [x - r, y], [x, y + r], [x, y - r]]) {
        if (m.land && !m.land.some(p => Collision.pointInPoly(px, py, p))) return false;
        if (m.lakes.some(p => Collision.pointInPoly(px, py, p))) return false;
      }
      return true;
    };
    m.onPath = (x, y, pad) => (def.paths || []).some(p => p.pts.some((pt, i) => i > 0 && Collision.distToSegment(x, y, p.pts[i - 1], pt) < (p.w || 46) / 2 + pad));
    m.areaAt = (x, y) => { let t = null; for (const a of def.areas || []) if (Collision.pointInPoly(x, y, a.poly)) t = a.type; return t; };

    const visible = o => (!o.showIf || Progress.done(o.showIf)) && (!o.hideIf || !Progress.done(o.hideIf));
    (def.objects || []).filter(visible).forEach(o => this.add(m, Object.assign({ kind: 'obj' }, o)));
    (def.npcs || []).filter(visible).forEach(o => this.add(m, Object.assign({ kind: 'npc', verb: 'Conversar' }, o)));
    (def.interact || []).filter(visible).forEach(o => this.add(m, Object.assign({ kind: 'int', verb: 'Examinar' }, o)));
    this.scatter(m);
    m.terrain = Art.bakeTerrain(m);

    const r = Art.rng(m.seed + 99);
    if (m.land) for (let i = 0; i < 2000 && m.sparkles.length < 140; i++) {
      const x = r() * m.w, y = r() * m.h;
      if (!m.walkable(x, y, 30)) m.sparkles.push({ x, y, ph: r() * 6.28, l: 6 + r() * 10 });
    }
    for (const l of m.lakes) for (let i = 0; i < 25; i++) {
      const x = r() * m.w, y = r() * m.h;
      if (Collision.pointInPoly(x, y, l)) m.sparkles.push({ x, y, ph: r() * 6.28, l: 4 + r() * 6 });
    }
    const cr = def.critters || {};
    for (let i = 0; i < (cr.butterflies || 0); i++) m.critters.push({ type: 'b', ax: r() * m.w, ay: r() * m.h, ph: r() * 6, col: ['#f2c14e', '#f5f0e6', '#e86a6a', '#7cc4e8'][i % 4] });
    for (let i = 0; i < (cr.birds || 0); i++) m.critters.push({ type: 'bird', x: r() * m.w, y: r() * m.h, vx: 60 + r() * 40, ph: r() * 6 });
    return m;
  },

  add(m, o) {
    const sp = o.sprite && Art.S[o.sprite];
    const s = o.scale || 1;
    const e = Object.assign({ v: 0, top: sp ? (sp.oy - 10) * s : 64 * ((o.char && Art.CHARS[o.char].h) || 1) }, o);
    if (sp && sp.flat) e.flat = true;
    if (sp && sp.layer) e.layer = sp.layer;
    if (e.kind === 'npc') { e.dir = e.dir || 'down'; m.colliders.push({ x: e.x, y: e.y, r: 12 }); }
    const col = o.collide === false ? null : (o.collide || (sp && sp.collide));
    if (col && e.kind !== 'npc') {
      if (col.r) m.colliders.push({ x: e.x, y: e.y + (col.dy || 0) * s, r: col.r * s });
      else m.colliders.push({ x: e.x + col.x * s, y: e.y + col.y * s, w: col.w * s, h: col.h * s });
    }
    m.entities.push(e);
    return e;
  },

  scatter(m) {
    const r = Art.rng(m.seed + 7);
    const hot = m.entities.filter(e => e.kind !== 'obj' || e.sprite === 'station' || e.sprite === 'prefeitura');
    const spawn = m.def.spawn;
    for (const sc of m.def.scatter || []) {
      const [rx, ry, rw, rh] = sc.rect || [0, 0, m.w, m.h];
      const cr = (Art.S[sc.sprite].collide && Art.S[sc.sprite].collide.r) || 10;
      let placed = 0;
      for (let tries = 0; tries < sc.n * 12 && placed < sc.n; tries++) {
        const x = rx + r() * rw, y = ry + r() * rh;
        const s = sc.scale ? sc.scale[0] + r() * (sc.scale[1] - sc.scale[0]) : 1;
        if (!m.walkable(x, y, cr + 6) || m.onPath(x, y, cr + 14)) continue;
        if (sc.areas && !sc.areas.includes(m.areaAt(x, y))) continue;
        if (!sc.areas && m.areaAt(x, y) && !sc.anyArea) continue;
        if (m.colliders.some(c => Collision.hitsCollider(x, y, cr * s + 10, c))) continue;
        if (hot.some(e => Math.hypot(e.x - x, e.y - y) < 90)) continue;
        if (Math.hypot(spawn[0] - x, spawn[1] - y) < 70) continue;
        if ((m.def.clear || []).some(([cx, cy, cw, ch]) => x > cx && x < cx + cw && y > cy && y < cy + ch)) continue;
        const sol = Art.S[sc.sprite].collide;
        this.add(m, { kind: 'obj', sprite: sc.sprite, x, y, v: Math.floor(r() * 6), scale: s, collide: sol ? undefined : false });
        placed++;
      }
    }
  },

  nearest(m, p) {
    let best = null, bd = 1e9;
    for (const e of m.entities) {
      if (e.kind === 'obj') continue;
      const d = Math.hypot(e.x - p.x, (e.y - p.y) * 1.2);
      if (d < (e.range || 64) && d < bd) { best = e; bd = d; }
    }
    return best;
  },

  draw(ctx, m, player, t, wind) {
    const hw = Camera.vw / 2 / Camera.zoom + 4, hh = Camera.vh / 2 / Camera.zoom + 4;
    const sx = Math.max(0, Camera.x - hw), sy = Math.max(0, Camera.y - hh);
    const sw = Math.min(m.w - sx, hw * 2), sh = Math.min(m.h - sy, hh * 2);
    if (m.land) { ctx.fillStyle = '#1d6a8e'; ctx.fillRect(sx - 40, sy - 40, sw + 80, sh + 80); }
    ctx.drawImage(m.terrain, sx, sy, sw, sh, sx, sy, sw, sh);
    // brilho na água
    ctx.lineCap = 'round';
    for (const s of m.sparkles) {
      if (Math.abs(s.x - Camera.x) > hw || Math.abs(s.y - Camera.y) > hh) continue;
      const a = Math.max(0, Math.sin(t * 1.6 + s.ph)) * .7;
      if (a < .05) continue;
      ctx.strokeStyle = `rgba(235,250,255,${a})`; ctx.lineWidth = 2;
      const dx = Math.sin(t * .8 + s.ph) * 4;
      ctx.beginPath(); ctx.moveTo(s.x - s.l / 2 + dx, s.y); ctx.lineTo(s.x + s.l / 2 + dx, s.y); ctx.stroke();
    }
    const vis = e => Math.abs(e.x - Camera.x) < hw + 200 && Math.abs(e.y - Camera.y) < hh + 300;
    for (const e of m.entities) if (e.flat && vis(e)) Art.drawSprite(ctx, e.sprite, e.x, e.y, e.v, t, 0, e.scale || 1);
    const list = m.entities.filter(e => !e.flat && !e.layer && vis(e));
    list.push({ isPlayer: true, y: player.y });
    list.sort((a, b) => a.y - b.y);
    for (const e of list) {
      if (e.isPlayer) { player.draw(ctx, t); continue; }
      if (e.char) {
        if (Math.hypot(player.x - e.x, player.y - e.y) < 130) {
          const dx = player.x - e.x, dy = player.y - e.y;
          e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        }
        Art.character(ctx, e.char, e.x, e.y, e.dir, 0, t + e.x);
      } else if (e.sprite === 'station') drawStation(ctx, e.x, e.y, t);
      else {
        // objeto alto na frente do personagem fica translúcido para ele não sumir
        const sp = Art.S[e.sprite], s = e.scale || 1;
        const hides = sp && e.y > player.y && e.y - sp.oy * s * .9 < player.y - 20 && Math.abs(e.x - player.x) < sp.w * s * .38;
        if (hides) ctx.globalAlpha = .45;
        Art.drawSprite(ctx, e.sprite, e.x, e.y, e.v, t, wind, s, e.id && Progress.done(e.doneFlag || e.id));
        ctx.globalAlpha = 1;
      }
    }
    // criaturas
    for (const c of m.critters) {
      if (c.type === 'b') {
        const x = c.ax + Math.sin(t * .7 + c.ph) * 60, y = c.ay + Math.sin(t * 1.1 + c.ph * 2) * 30 - 18, f = Math.abs(Math.sin(t * 14 + c.ph));
        Art.ell(ctx, x - 3 * f, y, 3 * f + .5, 2.4, c.col); Art.ell(ctx, x + 3 * f, y, 3 * f + .5, 2.4, c.col);
      } else {
        c.x += c.vx * (1 / 60); if (c.x > m.w + 100) c.x = -100;
        const y = c.y + Math.sin(t * .5 + c.ph) * 30, f = Math.sin(t * 8 + c.ph) * 4;
        Art.ell(ctx, c.x + 40, y + 120, 6, 2, 'rgba(20,30,20,.15)');
        ctx.strokeStyle = '#2c2a28'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(c.x - 8, y - f); ctx.quadraticCurveTo(c.x - 3, y - 3, c.x, y); ctx.quadraticCurveTo(c.x + 3, y - 3, c.x + 8, y - f); ctx.stroke();
      }
    }
    for (const e of m.entities) if (e.layer === 'top' && vis(e)) {
      ctx.globalAlpha = .82; Art.drawSprite(ctx, e.sprite, e.x + Math.sin(t * .3 + e.x) * 12, e.y, e.v, t, 0, e.scale || 1); ctx.globalAlpha = 1;
    }
  },
};

// A estação científica é desenhada ao vivo: antena quebrada no início, brilho ao ser reativada.
function drawStation(c, x, y, t) {
  const on = Progress.state && Progress.state.finished;
  const { ell, lin, rrect, poly, soft } = Art;
  c.save(); c.translate(x, y);
  ell(c, 12, 0, 170, 42, 'rgba(22,32,18,.3)');
  ell(c, 0, -4, 150, 36, '#a8a090'); ell(c, 0, -8, 140, 32, '#c4bca8');
  c.fillStyle = lin(c, -120, 0, 120, 0, '#f1ece0', '#d9d2c2', '#a39b8a'); c.fillRect(-120, -120, 240, 112); ell(c, 0, -8, 120, 26, '#a39b8a');
  c.fillStyle = on ? '#9ff2e6' : '#5f7a86';
  for (let i = -100; i < 100; i += 34) { rrect(c, i, -96, 20, 26, 4); c.fill(); }
  c.fillStyle = '#4a3a2a'; rrect(c, -22, -66, 44, 58, 20); c.fill();
  c.fillStyle = on ? '#bff8ef' : '#2e3a40'; rrect(c, -16, -60, 32, 52, 14); c.fill();
  c.beginPath(); c.ellipse(0, -120, 122, 112, 0, Math.PI, Math.PI * 2);
  c.fillStyle = lin(c, -120, -230, 120, -120, '#bfe6ee', '#6aa7b8', '#3d6f80'); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2;
  for (let i = 1; i < 6; i++) { c.beginPath(); c.ellipse(0, -120, 122 * i / 6, 112, 0, Math.PI, Math.PI * 2); c.stroke(); }
  c.beginPath(); c.ellipse(0, -120, 122, 56, 0, Math.PI, Math.PI * 2); c.stroke();
  ell(c, -40, -190, 26, 14, 'rgba(255,255,255,.35)');
  c.strokeStyle = '#5b666d'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -232); c.lineTo(0, -280); c.stroke();
  c.save(); c.translate(0, -282); c.rotate(on ? -.3 : .9);
  c.beginPath(); c.ellipse(0, 0, 26, 12, 0, 0, Math.PI); c.fillStyle = '#d9dee2'; c.fill(); c.restore();
  if (on) {
    soft(c, 0, -282, 80, 'rgba(140,255,230,.7)', .6 + Math.sin(t * 3) * .3);
    c.strokeStyle = 'rgba(140,255,230,.6)'; c.lineWidth = 3;
    for (let k = 0; k < 3; k++) { const rr = ((t * 40 + k * 40) % 120); c.globalAlpha = 1 - rr / 120; c.beginPath(); c.arc(0, -282, rr, 0, Math.PI * 2); c.stroke(); }
    c.globalAlpha = 1;
  } else if (Math.sin(t * 7) > .93) { c.strokeStyle = '#ffe36a'; c.lineWidth = 2; c.beginPath(); c.moveTo(6, -276); c.lineTo(16, -268); c.lineTo(10, -262); c.lineTo(20, -254); c.stroke(); }
  c.restore();
}

// Tempo atmosférico da região: fixo, em ciclo (muda com o tempo) ou por zonas (muda com a posição).
const Weather = {
  w: {}, drops: [], splashes: [], shadows: [], leaves: [], label: '',
  KEYS: ['rain', 'wind', 'clouds', 'fog', 'heat', 'temp', 'humid'],
  init(m) {
    const r = Art.rng(m.seed + 3);
    this.shadows = Array.from({ length: 8 }, () => ({ x: r() * m.w, y: r() * m.h, s: 120 + r() * 160 }));
    this.drops = []; this.splashes = []; this.leaves = [];
  },
  lerp(a, b, k) { const o = Object.assign({}, a); for (const key of this.KEYS) o[key] = (a[key] || 0) + ((b[key] || 0) - (a[key] || 0)) * k; return o; },
  compute(m, p, t) {
    const d = m.def.weather;
    let w = Object.assign({ rain: 0, wind: .2, clouds: .3, fog: 0, heat: 0, temp: 25, humid: 60 }, d.base);
    if (d.cycle) {
      const total = d.cycle.reduce((s, c) => s + c.dur, 0);
      let ph = t % total, i = 0;
      while (ph > d.cycle[i].dur) { ph -= d.cycle[i].dur; i++; }
      const cur = Object.assign({}, w, d.cycle[i]), nxt = Object.assign({}, w, d.cycle[(i + 1) % d.cycle.length]);
      const k = Math.max(0, (ph - (cur.dur - 6)) / 6);
      w = this.lerp(cur, nxt, k * k * (3 - 2 * k));
    }
    if (d.zones) {
      const z = d.zones;
      let i = 0; while (i < z.length - 1 && p.x > z[i + 1].x) i++;
      const a = Object.assign({}, w, z[i]), b = Object.assign({}, w, z[Math.min(i + 1, z.length - 1)]);
      const k = b.x > a.x ? Math.max(0, Math.min(1, (p.x - a.x) / (b.x - a.x))) : 0;
      w = this.lerp(a, b, k);
    }
    if (d.after && Progress.done(d.after.task)) w = Object.assign(w, d.after.set);
    w.tint = d.tint;
    return w;
  },
  describe(w) {
    let s = w.rain > .55 ? 'Chuva forte' : w.rain > .15 ? 'Chuva fraca' : w.clouds > .7 ? 'Nublado' : w.clouds > .4 ? 'Sol entre nuvens' : 'Ensolarado';
    if (w.fog > .25 && w.rain < .15) s = 'Nevoeiro';
    if (w.wind > .65) s += ', vento forte';
    const icon = w.rain > .15 ? 'rain' : w.fog > .25 ? 'fog' : w.clouds > .7 ? 'cloud' : w.clouds > .4 ? 'partly' : 'sun';
    return { text: `${s} · ${Math.round(w.temp)} °C`, icon: w.wind > .65 && w.rain <= .15 ? 'wind' : icon };
  },
  update(dt, m, p, t) {
    const w = this.w = this.compute(m, p, t);
    for (const s of this.shadows) { s.x += (8 + w.wind * 50) * dt; if (s.x - s.s > m.w) s.x = -s.s; }
    const W = Camera.vw, H = Camera.vh, target = Math.round(w.rain * 320);
    while (this.drops.length < target) this.drops.push({ x: Math.random() * W, y: Math.random() * H, s: 600 + Math.random() * 300, l: 10 + Math.random() * 10 });
    if (this.drops.length > target) this.drops.length = target;
    for (const d of this.drops) {
      d.y += d.s * dt; d.x += w.wind * 160 * dt;
      if (d.y > H) { if (Math.random() < .3) this.splashes.push({ x: Math.random() * W, y: Math.random() * H, t: 0 }); d.y = -20; d.x = Math.random() * (W + 200) - 100; }
    }
    this.splashes = this.splashes.filter(s => (s.t += dt) < .35);
    if (w.wind > .5 && this.leaves.length < 14 && Math.random() < dt * 4) this.leaves.push({ x: -20, y: Math.random() * H, vy: (Math.random() - .5) * 40, r: Math.random() * 6 });
    for (const l of this.leaves) { l.x += (120 + w.wind * 260) * dt; l.y += Math.sin(t * 3 + l.r) * 30 * dt + l.vy * dt; l.r += dt * 5; }
    this.leaves = this.leaves.filter(l => l.x < W + 30);
    Sound.setAmbient(w.rain, w.wind);
    const d = this.describe(w);
    if (d.text !== this.label) { this.label = d.text; UI.setWeather(d); }
  },
  drawShadows(ctx) {
    const a = .12 * this.w.clouds;
    if (a < .01) return;
    for (const s of this.shadows) for (let k = 0; k < 3; k++) Art.soft(ctx, s.x + (k - 1) * s.s * .5, s.y + Math.sin(k * 2) * s.s * .2, s.s * .7, `rgba(10,25,40,${a})`);
  },
  drawScreen(ctx, W, H, t) {
    const w = this.w;
    if (w.clouds < .45 && w.rain < .1) { // raios de sol
      ctx.save(); ctx.globalAlpha = .07 * (1 - w.clouds); ctx.fillStyle = '#fff6cc';
      for (let i = 0; i < 4; i++) { const x = ((i * 0.31 + t * .005) % 1) * W * 1.4 - W * .2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 90, 0); ctx.lineTo(x - 200, H); ctx.lineTo(x - 320, H); ctx.fill(); }
      ctx.restore();
    }
    if (this.drops.length) {
      ctx.strokeStyle = 'rgba(205,225,245,.55)'; ctx.lineWidth = 1.3; ctx.beginPath();
      for (const d of this.drops) { ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - w.wind * 5, d.y - d.l); }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(220,235,250,.5)';
      for (const s of this.splashes) { ctx.beginPath(); ctx.ellipse(s.x, s.y, s.t * 26, s.t * 9, 0, 0, 6.28); ctx.stroke(); }
      ctx.fillStyle = `rgba(40,60,80,${w.rain * .18})`; ctx.fillRect(0, 0, W, H);
    }
    for (const l of this.leaves) { ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.r); Art.ell(ctx, 0, 0, 5, 2.2, '#6c9a3a'); ctx.restore(); }
    if (w.fog > .02) {
      for (let i = 0; i < 4; i++) Art.soft(ctx, ((i * .3 + t * .01) % 1.3) * W * 1.1 - W * .15, H * (.2 + i * .2), W * .45, 'rgba(235,240,240,1)', w.fog * .45);
      ctx.fillStyle = `rgba(230,236,236,${w.fog * .18})`; ctx.fillRect(0, 0, W, H);
    }
    if (w.heat > .02) { ctx.fillStyle = `rgba(255,160,60,${w.heat * .16})`; ctx.fillRect(0, 0, W, H); }
    if (w.tint) { ctx.fillStyle = w.tint; ctx.fillRect(0, 0, W, H); }
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .45, W / 2, H / 2, Math.max(W, H) * .75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,15,20,.38)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
};
