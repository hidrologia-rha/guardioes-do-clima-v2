// Arte procedural: todo o mundo é pintado em Canvas 2D com camadas, gradientes e sombras suaves.
// Para trocar por ilustrações, basta registrar a imagem em data/asset-manifest.js (mesmo nome do sprite).
const Art = (() => {
  const TAU = Math.PI * 2;

  function rng(seed) {
    let s = (seed * 2654435761) >>> 0 || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function hex(h) { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); }
  function shade(h, amt) {
    const [r, g, b] = hex(h);
    const f = v => Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }
  function lin(c, x0, y0, x1, y1, ...cols) {
    const g = c.createLinearGradient(x0, y0, x1, y1);
    cols.forEach((col, i) => g.addColorStop(i / (cols.length - 1), col));
    return g;
  }
  function ell(c, x, y, rx, ry, fill) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fillStyle = fill; c.fill(); }
  function shadow(c, x, y, rx, ry, a = 0.28) { ell(c, x, y, rx, ry, `rgba(22,32,18,${a})`); }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); }
  function poly(c, pts, fill, stroke, lw = 1) {
    c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
  }
  function soft(c, x, y, r, col, a = 1) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalAlpha = a; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.globalAlpha = 1;
  }

  // Copa pintada em camadas: sombra -> meio-tom -> luz (sol vindo da esquerda/alto).
  function canopy(c, r, cx, cy, rw, rh, cols, n) {
    const layer = (count, dx, dy, sc, col, hi) => {
      for (let i = 0; i < count; i++) {
        const a = r() * TAU, d = Math.sqrt(r());
        const x = cx + dx + Math.cos(a) * d * rw * sc, y = cy + dy + Math.sin(a) * d * rh * sc;
        const rad = (0.28 + r() * 0.22) * rw * (sc + 0.2);
        const g = c.createRadialGradient(x - rad * .3, y - rad * .4, rad * .1, x, y, rad);
        g.addColorStop(0, hi); g.addColorStop(1, col);
        c.fillStyle = g; c.beginPath(); c.ellipse(x, y, rad, rad * .88, 0, 0, TAU); c.fill();
      }
    };
    layer(n, 3, 6, 1, cols[0], cols[1]);
    layer(Math.ceil(n * .7), -rw * .08, -rh * .1, .8, cols[1], cols[2]);
    layer(Math.ceil(n * .4), -rw * .2, -rh * .28, .5, cols[2], cols[3]);
    for (let i = 0; i < n * .8; i++) ell(c, cx - rw * .3 + (r() - .5) * rw, cy - rh * .4 + (r() - .5) * rh * .8, 1.5 + r() * 2, 1.2 + r() * 1.5, cols[3]);
  }
  function trunk(c, x0, h, w, col) {
    c.beginPath(); c.moveTo(x0 - w, 0); c.quadraticCurveTo(x0 - w * .6, -h * .5, x0 - w * .5, -h);
    c.lineTo(x0 + w * .5, -h); c.quadraticCurveTo(x0 + w * .6, -h * .5, x0 + w, 0); c.closePath();
    c.fillStyle = lin(c, x0 - w, 0, x0 + w, 0, shade(col, .15), col, shade(col, -.35)); c.fill();
  }

  const GREENS = ['#2c5424', '#3f7a32', '#62a446', '#a4d77a'];
  const DARKGREENS = ['#1c3d1c', '#2b5a2a', '#478a3c', '#86c066'];

  // ---------- Catálogo de sprites ----------
  // w,h: tamanho; ox,oy: ponto de apoio (base). collide: círculo {r,dy} ou retângulo {x,y,w,h} relativo à base.
  const S = {
    tree_round: { w: 130, h: 160, ox: 65, oy: 145, sway: 1, collide: { r: 13 }, draw(c, r) {
      shadow(c, 6, 0, 44, 14); trunk(c, 0, 55, 8, '#6b4a2e');
      canopy(c, r, 0, -82, 50, 42, GREENS, 14);
    } },
    tree_tropical: { w: 180, h: 200, ox: 90, oy: 185, sway: .7, collide: { r: 16 }, draw(c, r) {
      shadow(c, 8, 0, 62, 18, .32); trunk(c, 0, 70, 11, '#5b3d26');
      c.strokeStyle = '#3d2a18'; c.lineWidth = 3; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-22, 8); c.moveTo(9, 0); c.lineTo(22, 7); c.stroke();
      canopy(c, r, 0, -108, 70, 56, DARKGREENS, 20);
      c.strokeStyle = 'rgba(70,110,40,.8)'; c.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) { const x = -40 + r() * 80; c.beginPath(); c.moveTo(x, -80); c.quadraticCurveTo(x + 6, -50, x - 2, -35 - r() * 20); c.stroke(); }
    } },
    palm: { w: 170, h: 180, ox: 70, oy: 165, sway: 1.6, collide: { r: 10 }, draw(c, r) {
      shadow(c, 20, 0, 40, 12, .25);
      const tx = 22, ty = -118;
      c.lineCap = 'round';
      for (let i = 0; i < 14; i++) {
        const t0 = i / 14, t1 = (i + 1) / 14;
        const p = t => [tx * t * t, ty * t];
        const [x0, y0] = p(t0), [x1, y1] = p(t1);
        c.strokeStyle = i % 2 ? '#8b6a43' : '#a17d52'; c.lineWidth = 10 - t0 * 3;
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
      }
      const fr = (ang, len, col) => {
        c.save(); c.translate(tx, ty); c.rotate(ang);
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .5, -18, len, 10); c.quadraticCurveTo(len * .5, -2, 0, 0);
        c.fillStyle = col; c.fill();
        c.strokeStyle = 'rgba(20,50,20,.5)'; c.lineWidth = 1;
        for (let k = 1; k < 9; k++) { const x = len * k / 9, y = -14 * Math.sin(Math.PI * k / 9) + 6 * k / 9; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6, y + 9); c.stroke(); }
        c.restore();
      };
      for (let i = 0; i < 9; i++) fr(i / 9 * TAU + r() * .3, 58 + r() * 14, i % 2 ? '#3d7a34' : '#4f9440');
      for (let i = 0; i < 5; i++) fr(i / 5 * TAU + .4, 44, '#7cbf55');
      ell(c, tx - 4, ty + 6, 5, 5, '#6b4a1e'); ell(c, tx + 4, ty + 5, 5, 5, '#7d5a26');
    } },
    pine: { w: 100, h: 170, ox: 50, oy: 158, sway: .6, collide: { r: 11 }, draw(c, r) {
      shadow(c, 6, 0, 30, 10); trunk(c, 0, 30, 6, '#5a3d27');
      for (let i = 0; i < 4; i++) {
        const y = -22 - i * 30, w = 42 - i * 8;
        poly(c, [[-w, y], [0, y - 52], [w, y]], '#2f5a35');
        poly(c, [[-w, y], [0, y - 52], [-w * .1, y]], '#4b8a4a');
        poly(c, [[-w * .5, y - 8], [0, y - 52], [-w * .2, y - 6]], '#6fae64');
      }
    } },
    tree_dry: { w: 130, h: 140, ox: 65, oy: 128, sway: .4, collide: { r: 9 }, draw(c, r) {
      shadow(c, 4, 0, 34, 10, .2);
      c.lineCap = 'round';
      const br = (x, y, a, len, w, d) => {
        const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
        c.strokeStyle = d > 2 ? '#7b6a58' : '#8f7c66'; c.lineWidth = w;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (r() - .5) * 10, (y + y2) / 2, x2, y2); c.stroke();
        if (d < 4) { br(x2, y2, a - .5 - r() * .3, len * .7, w * .65, d + 1); br(x2, y2, a + .4 + r() * .3, len * .68, w * .65, d + 1); }
        else for (let i = 0; i < 3; i++) ell(c, x2 + (r() - .5) * 8, y2 + (r() - .5) * 8, 2.5, 1.8, r() < .5 ? '#8c9a5a' : '#a7a46a');
      };
      br(0, 0, -Math.PI / 2 + (r() - .5) * .3, 42, 8, 0);
    } },
    cactus: { w: 70, h: 120, ox: 35, oy: 110, collide: { r: 9 }, draw(c) {
      shadow(c, 4, 0, 20, 7);
      const col = (x, y, w, h) => { rrect(c, x, y, w, h, w / 2); c.fillStyle = lin(c, x, 0, x + w, 0, '#7fb76a', '#4c8a46', '#2f5e33'); c.fill(); c.strokeStyle = 'rgba(20,50,20,.35)'; c.lineWidth = 1; for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(x + w * i / 3, y + 4); c.lineTo(x + w * i / 3, y + h - 3); c.stroke(); } };
      col(-8, -95, 16, 95);
      col(-26, -70, 12, 36); rrect(c, -22, -40, 20, 10, 5); c.fillStyle = '#4c8a46'; c.fill();
      col(14, -78, 12, 40); rrect(c, 4, -44, 20, 10, 5); c.fillStyle = '#3f7a3c'; c.fill();
      ell(c, 0, -96, 5, 3, '#f2d35a');
    } },
    shrub: { w: 70, h: 55, ox: 35, oy: 48, collide: null, draw(c, r) { shadow(c, 3, 0, 24, 7, .22); canopy(c, r, 0, -18, 24, 16, GREENS, 7); } },
    flower_bush: { w: 70, h: 55, ox: 35, oy: 48, collide: null, draw(c, r) {
      shadow(c, 3, 0, 24, 7, .22); canopy(c, r, 0, -18, 24, 16, GREENS, 6);
      const cols = ['#f2c14e', '#e86a6a', '#f5f0e6', '#c58ae0'];
      const col = cols[Math.floor(r() * cols.length)];
      for (let i = 0; i < 10; i++) ell(c, (r() - .5) * 40, -18 + (r() - .5) * 24, 2.6, 2.6, col);
    } },
    dry_shrub: { w: 60, h: 45, ox: 30, oy: 40, collide: null, draw(c, r) {
      shadow(c, 2, 0, 20, 6, .18); c.lineCap = 'round';
      for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (r() - .5) * 2.2; c.strokeStyle = r() < .5 ? '#8a7454' : '#a08a62'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * (18 + r() * 10), Math.sin(a) * (18 + r() * 12)); c.stroke(); }
      for (let i = 0; i < 12; i++) ell(c, (r() - .5) * 34, -10 - r() * 18, 2, 1.5, r() < .5 ? '#7d8a4a' : '#9a9a5a');
    } },
    fern: { w: 60, h: 44, ox: 30, oy: 38, collide: null, draw(c, r) {
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI + i / 8 * Math.PI, len = 18 + r() * 8;
        c.strokeStyle = i % 2 ? '#3f7d34' : '#5c9c45'; c.lineWidth = 4; c.lineCap = 'round';
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(Math.cos(a) * len * .6, Math.sin(a) * len * .9 - 6, Math.cos(a) * len, Math.sin(a) * len * .7); c.stroke();
      }
    } },
    rock: { w: 70, h: 50, ox: 35, oy: 40, collide: { r: 14 }, draw(c, r) {
      shadow(c, 4, 0, 26, 8);
      const j = () => (r() - .5) * 6;
      poly(c, [[-24 + j(), 0], [-20 + j(), -18], [-4 + j(), -28], [16 + j(), -22], [24 + j(), -4], [14, 2]], '#8a867a');
      poly(c, [[-20, -18], [-4, -28], [16, -22], [2, -14]], '#b4afa2');
      poly(c, [[16, -22], [24, -4], [14, 2], [6, -10]], '#6c695f');
      ell(c, -8, -20, 4, 2, 'rgba(255,255,255,.25)');
    } },
    rock_big: { w: 120, h: 90, ox: 60, oy: 76, collide: { r: 32 }, draw(c, r) {
      shadow(c, 6, 0, 48, 14);
      poly(c, [[-46, 0], [-42, -38], [-14, -62], [24, -56], [46, -24], [40, 2]], '#86827a');
      poly(c, [[-42, -38], [-14, -62], [24, -56], [4, -34], [-22, -30]], '#b3ad9f');
      poly(c, [[24, -56], [46, -24], [40, 2], [14, -14], [4, -34]], '#68645a');
      c.strokeStyle = 'rgba(40,35,30,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-20, -30); c.lineTo(-10, -8); c.stroke();
      canopy(c, r, -30, -4, 12, 6, GREENS, 3);
    } },
    mountain: { w: 340, h: 320, ox: 170, oy: 290, collide: { r: 105, dy: -20 }, draw(c, r) {
      const px = (r() - .5) * 40, ph = 250 + r() * 30;
      shadow(c, 20, 0, 160, 40, .3);
      poly(c, [[-160, 0], [-110, -70], [px - 30, -ph * .8], [px, -ph], [px + 40, -ph * .78], [120, -80], [165, 0]], '#7b7466');
      poly(c, [[-160, 0], [-110, -70], [px - 30, -ph * .8], [px, -ph], [px - 10, -ph * .5], [-40, -30], [-20, 0]], '#a39a87');
      poly(c, [[px, -ph], [px + 40, -ph * .78], [120, -80], [165, 0], [40, 0], [px + 10, -ph * .5]], '#5d5850');
      poly(c, [[px - 30, -ph * .8], [px, -ph], [px + 40, -ph * .78], [px + 22, -ph * .72], [px + 8, -ph * .8], [px - 8, -ph * .7]], '#f4f6f8');
      poly(c, [[px, -ph], [px + 40, -ph * .78], [px + 22, -ph * .72]], '#cdd5de');
      c.strokeStyle = 'rgba(40,35,30,.3)'; c.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const x = -100 + r() * 220; c.beginPath(); c.moveTo(px + (x - px) * .2, -ph * .7); c.lineTo(x, -20 - r() * 30); c.stroke(); }
      for (let i = 0; i < 9; i++) canopy(c, r, -150 + r() * 300, -8 - r() * 30, 16, 10, DARKGREENS, 3);
    } },
    cloud_bank: { w: 300, h: 160, ox: 150, oy: 120, layer: 'top', collide: null, draw(c, r) {
      for (let i = 0; i < 16; i++) {
        const x = (r() - .5) * 220, y = -40 + (r() - .5) * 60, rad = 30 + r() * 30;
        const g = c.createRadialGradient(x - 8, y - 12, 4, x, y, rad);
        g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.7, 'rgba(225,232,240,.85)'); g.addColorStop(1, 'rgba(190,200,215,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill();
      }
    } },
    house: { w: 160, h: 150, ox: 80, oy: 128, collide: { x: -58, y: -46, w: 116, h: 46 }, draw(c, r) {
      const walls = ['#ead9b8', '#d8b48a', '#cfe0d4'][Math.floor(r() * 3)];
      shadow(c, 8, 0, 70, 14);
      rrect(c, -56, -62, 112, 62, 3); c.fillStyle = lin(c, -56, 0, 56, 0, shade(walls, .1), walls, shade(walls, -.15)); c.fill();
      rrect(c, -12, -38, 24, 38, 3); c.fillStyle = '#6a4326'; c.fill();
      ell(c, 7, -18, 1.8, 1.8, '#e8c25a');
      [-38, 22].forEach(x => { rrect(c, x, -46, 18, 16, 2); c.fillStyle = '#9fd1e0'; c.fill(); c.strokeStyle = '#6a4326'; c.lineWidth = 2; c.stroke(); });
      poly(c, [[-70, -58], [-46, -118], [46, -118], [70, -58]], '#b4553a');
      poly(c, [[-70, -58], [-46, -118], [0, -118], [-6, -58]], '#c9694a');
      c.strokeStyle = 'rgba(80,30,20,.35)'; c.lineWidth = 1.5;
      for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(-70 + i * 2.6, -58 - i * 10); c.lineTo(70 - i * 2.6, -58 - i * 10); c.stroke(); }
    } },
    building: { w: 170, h: 290, ox: 85, oy: 262, collide: { x: -72, y: -64, w: 144, h: 64 }, draw(c, r, v) {
      drawBuilding(c, r, v, false);
    } },
    building_green: { w: 170, h: 290, ox: 85, oy: 262, collide: { x: -72, y: -64, w: 144, h: 64 }, draw(c, r, v) {
      drawBuilding(c, r, v, true);
    } },
    prefeitura: { w: 280, h: 260, ox: 140, oy: 230, collide: { x: -125, y: -70, w: 250, h: 70 }, draw(c) {
      shadow(c, 10, 0, 130, 18);
      poly(c, [[-125, -150], [125, -150], [125, -220], [-125, -220]], '#e3dccb');
      rrect(c, -125, -150, 250, 150, 2); c.fillStyle = lin(c, 0, -150, 0, 0, '#f2ead6', '#d8ccb0'); c.fill();
      for (let i = 0; i < 6; i++) { rrect(c, -105 + i * 40, -140, 14, 140, 4); c.fillStyle = '#fbf7ec'; c.fill(); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-95 + i * 40, -140, 4, 140); }
      poly(c, [[-135, -150], [0, -195], [135, -150]], '#c9b996', 'rgba(0,0,0,.2)');
      rrect(c, -18, -60, 36, 60, 4); c.fillStyle = '#5b3a22'; c.fill();
      c.strokeStyle = '#555'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -195); c.lineTo(0, -240); c.stroke();
      poly(c, [[0, -240], [26, -233], [0, -226]], '#2b8a4a');
    } },
    tent: { w: 130, h: 100, ox: 65, oy: 84, collide: { r: 34, dy: -10 }, draw(c) {
      shadow(c, 6, 0, 56, 12);
      poly(c, [[-50, 0], [0, -72], [10, -72], [58, -4]], '#d9732f');
      poly(c, [[0, -72], [10, -72], [58, -4], [16, 0]], '#a9541f');
      poly(c, [[-50, 0], [0, -72], [16, 0]], '#ef8e3e');
      poly(c, [[-14, 0], [0, -40], [10, 0]], '#4a2a14');
      c.strokeStyle = '#6a4326'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -72); c.lineTo(0, -82); c.stroke();
    } },
    board: { w: 90, h: 100, ox: 45, oy: 90, collide: { r: 16 }, draw(c) {
      shadow(c, 3, 0, 30, 7);
      c.fillStyle = '#6a4326'; c.fillRect(-30, -30, 5, 30); c.fillRect(25, -30, 5, 30);
      rrect(c, -36, -82, 72, 54, 4); c.fillStyle = '#7a4f2c'; c.fill();
      rrect(c, -31, -77, 62, 44, 2); c.fillStyle = '#f8f1dc'; c.fill();
      ell(c, -16, -62, 7, 7, '#f2b33d');
      ell(c, 8, -60, 12, 7, '#b9c7d6'); ell(c, 16, -63, 8, 6, '#cbd6e2');
      c.strokeStyle = '#4a7ab0'; c.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(4 + i * 5, -52); c.lineTo(1 + i * 5, -44); c.stroke(); }
      c.fillStyle = '#2c2116'; c.fillRect(-25, -40, 30, 2); c.fillRect(-25, -36, 20, 2);
    } },
    totem: { w: 70, h: 120, ox: 35, oy: 108, collide: { r: 18 }, draw(c) {
      shadow(c, 4, 0, 26, 8);
      poly(c, [[-20, 0], [-16, -96], [16, -96], [20, 0]], '#9c9483');
      poly(c, [[2, 0], [2, -96], [16, -96], [20, 0]], '#7d7668');
      rrect(c, -12, -86, 22, 30, 3); c.fillStyle = '#1f6f6c'; c.fill();
      c.fillStyle = '#9ff2e6'; for (let i = 0; i < 5; i++) c.fillRect(-9 + i * 4, -62 - i * 3 - (i % 2) * 4, 3, 4 + i * 3 + (i % 2) * 4);
      c.fillStyle = '#e9e1cf'; c.fillRect(-14, -46, 26, 4); c.fillRect(-14, -38, 26, 4); c.fillRect(-14, -30, 26, 4);
      c.fillStyle = '#b5452f'; c.fillRect(-14, -46, 5, 4); c.fillStyle = '#2b7a4b'; c.fillRect(-6, -38, 5, 4);
    } },
    table_notes: { w: 90, h: 70, ox: 45, oy: 56, collide: { r: 22 }, draw(c) {
      shadow(c, 3, 0, 36, 8);
      c.fillStyle = '#5b3a22'; c.fillRect(-30, -24, 4, 24); c.fillRect(26, -24, 4, 24);
      poly(c, [[-36, -24], [-30, -40], [30, -40], [36, -24]], '#8a5a34');
      c.fillStyle = '#6a4326'; c.fillRect(-36, -24, 72, 5);
      poly(c, [[-24, -27], [-20, -37], [-2, -37], [-4, -27]], '#fbf6e8');
      poly(c, [[2, -28], [5, -38], [22, -36], [20, -26]], '#f1e3c0');
      c.strokeStyle = '#4a7ab0'; c.lineWidth = 1; c.beginPath(); c.moveTo(-20, -33); c.lineTo(-8, -33); c.moveTo(-20, -30); c.lineTo(-10, -30); c.stroke();
      ell(c, 26, -42, 5, 5, '#f2b33d');
    } },
    abrigo: { w: 60, h: 100, ox: 30, oy: 90, collide: { r: 15 }, draw(c) {
      shadow(c, 4, 0, 22, 6);
      c.fillStyle = '#e9e6dc'; [-16, 12].forEach(x => c.fillRect(x, -40, 4, 40));
      rrect(c, -20, -78, 40, 40, 2); c.fillStyle = lin(c, -20, 0, 20, 0, '#ffffff', '#e8e6df', '#c9c6bd'); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1;
      for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(-18, -74 + i * 4.6); c.lineTo(18, -72 + i * 4.6); c.stroke(); }
      poly(c, [[-24, -78], [0, -88], [24, -78]], '#f4f2ea', 'rgba(0,0,0,.2)');
    } },
    pluviometro: { w: 40, h: 90, ox: 20, oy: 80, collide: { r: 9 }, draw(c) {
      shadow(c, 2, 0, 12, 4);
      c.fillStyle = '#7a5a3a'; c.fillRect(-3, -40, 6, 40);
      rrect(c, -9, -70, 18, 32, 3); c.fillStyle = lin(c, -9, 0, 9, 0, '#e6eef2', '#aebcc4', '#7e8d96'); c.fill();
      ell(c, 0, -70, 11, 4, '#5f6d75'); ell(c, 0, -70, 8, 2.5, '#2e3a40');
      rrect(c, -5, -60, 10, 18, 2); c.fillStyle = 'rgba(70,140,220,.6)'; c.fill();
    } },
    anemometro: { w: 70, h: 130, ox: 35, oy: 118, live: 1, collide: { r: 8 }, draw(c, r, v, t, wind) {
      shadow(c, 2, 0, 12, 4);
      c.fillStyle = '#7d8a92'; c.fillRect(-2, -100, 4, 100);
      const a0 = t * (2 + wind * 10);
      for (let k = 0; k < 3; k++) {
        const a = a0 + k * TAU / 3, x = Math.cos(a) * 22, y = -102 + Math.sin(a) * 7;
        c.strokeStyle = '#5b666d'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -102); c.lineTo(x, y); c.stroke();
        ell(c, x, y, 6, 5, Math.sin(a) > 0 ? '#cfd8de' : '#93a1aa');
      }
      ell(c, 0, -102, 4, 3, '#3e4a50');
    } },
    biruta: { w: 80, h: 110, ox: 25, oy: 100, live: 1, collide: { r: 6 }, draw(c, r, v, t, wind) {
      shadow(c, 2, 0, 10, 3);
      c.fillStyle = '#6d7a82'; c.fillRect(-2, -90, 4, 90);
      const len = 22 + wind * 26, droop = (1 - wind) * 22;
      for (let i = 0; i < 5; i++) {
        const x0 = 2 + i * len / 5, x1 = 2 + (i + 1) * len / 5;
        const w0 = 8 - i * 1.2, w1 = 8 - (i + 1) * 1.2;
        const y0 = -86 + droop * (i / 5) ** 1.5 + Math.sin(t * 8 + i) * 1.5, y1 = -86 + droop * ((i + 1) / 5) ** 1.5 + Math.sin(t * 8 + i + 1) * 1.5;
        poly(c, [[x0, y0 - w0], [x1, y1 - w1], [x1, y1 + w1], [x0, y0 + w0]], i % 2 ? '#f5f1e6' : '#e0582f');
      }
    } },
    higrometro: { w: 40, h: 80, ox: 20, oy: 72, collide: { r: 8 }, draw(c) {
      shadow(c, 2, 0, 10, 3);
      c.fillStyle = '#7a5a3a'; c.fillRect(-3, -40, 6, 40);
      ell(c, 0, -52, 14, 14, '#c9a24a'); ell(c, 0, -52, 11, 11, '#fbf6e8');
      c.strokeStyle = '#b5452f'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -52); c.lineTo(7, -58); c.stroke();
    } },
    thermo_post: { w: 50, h: 100, ox: 18, oy: 88, live: 1, collide: { r: 8 }, draw(c, r, v, t) {
      shadow(c, 2, 0, 12, 4);
      c.fillStyle = '#7a5a3a'; c.fillRect(-4, -70, 8, 70);
      rrect(c, -3, -66, 6, 34, 3); c.fillStyle = '#fbf6e8'; c.fill();
      c.fillStyle = '#d0402c'; c.fillRect(-1.2, -56, 2.4, 22); ell(c, 0, -32, 3.5, 3.5, '#d0402c');
      c.fillStyle = '#6a4326'; c.fillRect(-1, -88, 2, 20);
      const f = Math.sin(t * 6) * 3;
      poly(c, [[1, -88], [22, -83 + f], [1, -76]], '#f2b33d');
    } },
    station_mini: { w: 70, h: 120, ox: 35, oy: 108, collide: { r: 14 }, draw(c) {
      shadow(c, 4, 0, 22, 6);
      c.fillStyle = '#8a969c'; c.fillRect(-2, -96, 4, 96);
      poly(c, [[-24, -78], [6, -88], [10, -70], [-20, -60]], '#2a4b6e', '#c9d4dc', 1.5);
      c.strokeStyle = 'rgba(200,220,240,.5)'; c.beginPath(); c.moveTo(-9, -83); c.lineTo(-5, -65); c.stroke();
      rrect(c, -10, -44, 20, 22, 2); c.fillStyle = '#f2f0ea'; c.fill(); c.fillStyle = '#2b7a4b'; c.fillRect(-6, -40, 4, 3);
      for (let k = 0; k < 3; k++) { const a = k * TAU / 3; ell(c, Math.cos(a) * 12, -100 + Math.sin(a) * 4, 4, 3, '#cfd8de'); }
    } },
    console: { w: 80, h: 110, ox: 40, oy: 96, live: 1, collide: { r: 18 }, draw(c, r, v, t, w, on) {
      shadow(c, 4, 0, 28, 8);
      poly(c, [[-24, 0], [-18, -46], [18, -46], [24, 0]], '#8e8778');
      poly(c, [[4, 0], [4, -46], [18, -46], [24, 0]], '#6f695d');
      poly(c, [[-22, -46], [-14, -56], [14, -56], [22, -46]], '#b2aa98');
      const col = on ? '120,240,160' : '120,230,255';
      const p = .6 + Math.sin(t * 3) * .25;
      soft(c, 0, -74, 34, `rgba(${col},.55)`, p);
      poly(c, [[0, -96], [10, -76], [0, -60], [-10, -76]], `rgba(${col},.9)`);
      poly(c, [[0, -96], [10, -76], [0, -76]], 'rgba(255,255,255,.55)');
    } },
    fountain: { w: 120, h: 90, ox: 60, oy: 70, live: 1, collide: { r: 40, dy: -16 }, draw(c, r, v, t) {
      ell(c, 0, -14, 50, 22, '#a7a090'); ell(c, 0, -18, 44, 18, '#5fa6c4'); ell(c, -10, -22, 20, 6, 'rgba(255,255,255,.3)');
      c.fillStyle = '#b8b09e'; c.fillRect(-5, -50, 10, 32); ell(c, 0, -50, 12, 5, '#cbc3b0');
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t; ell(c, Math.cos(a) * 14, -46 + ((t * 40 + i * 9) % 26), 1.6, 2.5, 'rgba(220,245,255,.85)'); }
    } },
    bench: { w: 70, h: 50, ox: 35, oy: 40, collide: { x: -26, y: -10, w: 52, h: 10 }, draw(c) {
      shadow(c, 2, 0, 28, 5); c.fillStyle = '#4a3a2a'; c.fillRect(-24, -14, 4, 14); c.fillRect(20, -14, 4, 14);
      c.fillStyle = '#9a6a3c'; c.fillRect(-28, -18, 56, 6); c.fillRect(-28, -30, 56, 5); c.fillRect(-28, -38, 56, 5);
    } },
    lamp: { w: 40, h: 110, ox: 20, oy: 100, collide: { r: 5 }, draw(c) {
      shadow(c, 2, 0, 8, 3); c.fillStyle = '#3b4248'; c.fillRect(-2, -90, 4, 90); rrect(c, -7, -100, 14, 12, 3); c.fill(); ell(c, 0, -90, 5, 3, '#ffe9a6');
    } },
    car: { w: 90, h: 60, ox: 45, oy: 46, collide: { x: -36, y: -18, w: 72, h: 18 }, draw(c, r) {
      const col = ['#c8402f', '#2f6fa8', '#e8c43a', '#e9e6dc', '#3a8a5a'][Math.floor(r() * 5)];
      shadow(c, 2, 0, 40, 8);
      rrect(c, -38, -26, 76, 22, 8); c.fillStyle = lin(c, 0, -26, 0, -4, shade(col, .2), col, shade(col, -.3)); c.fill();
      rrect(c, -22, -40, 42, 18, 7); c.fillStyle = shade(col, .1); c.fill();
      rrect(c, -18, -37, 16, 11, 3); c.fillStyle = '#9fd1e0'; c.fill(); rrect(c, 2, -37, 15, 11, 3); c.fill();
      ell(c, -24, -4, 7, 7, '#222'); ell(c, 24, -4, 7, 7, '#222');
    } },
    cisterna: { w: 70, h: 70, ox: 35, oy: 58, collide: { r: 24, dy: -8 }, draw(c) {
      shadow(c, 4, 0, 30, 8);
      c.fillStyle = lin(c, -26, 0, 26, 0, '#f4f2ea', '#d8d4c8', '#a9a497'); c.fillRect(-26, -40, 52, 36); ell(c, 0, -4, 26, 8, '#a9a497');
      ell(c, 0, -40, 26, 8, '#e9e6dc'); ell(c, 0, -40, 10, 3, '#8a867a');
    } },
    soil_dark: { w: 70, h: 40, ox: 35, oy: 22, flat: 1, collide: null, draw(c, r) {
      ell(c, 0, 0, 30, 14, '#3a2818'); ell(c, -4, -2, 22, 9, '#4e3522');
      for (let i = 0; i < 10; i++) ell(c, (r() - .5) * 44, (r() - .5) * 16, 3, 1.5, r() < .5 ? '#6b8a3a' : '#8a5a2a');
      c.fillStyle = '#8a8f96'; c.fillRect(20, -16, 3, 20); poly(c, [[16, 4], [26, 4], [24, 12], [18, 12]], '#a9b0b8');
    } },
    soil_light: { w: 70, h: 40, ox: 35, oy: 22, flat: 1, collide: null, draw(c, r) {
      ell(c, 0, 0, 30, 14, '#b08a55'); ell(c, -4, -2, 22, 9, '#c9a46a');
      for (let i = 0; i < 14; i++) ell(c, (r() - .5) * 44, (r() - .5) * 16, 2, 1.5, r() < .5 ? '#e4d0a0' : '#8f7a5a');
      c.fillStyle = '#8a8f96'; c.fillRect(20, -16, 3, 20); poly(c, [[16, 4], [26, 4], [24, 12], [18, 12]], '#a9b0b8');
    } },
    playground: { w: 120, h: 100, ox: 60, oy: 80, collide: { x: -50, y: -20, w: 100, h: 20 }, draw(c) {
      shadow(c, 4, 0, 54, 10);
      c.strokeStyle = '#8a9198'; c.lineWidth = 4; c.beginPath(); c.moveTo(-50, 0); c.lineTo(-40, -60); c.lineTo(-10, -60); c.lineTo(0, 0); c.stroke();
      c.strokeStyle = '#6d747a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-30, -60); c.lineTo(-30, -22); c.moveTo(-20, -60); c.lineTo(-20, -22); c.stroke();
      c.fillStyle = '#c8402f'; c.fillRect(-33, -22, 16, 4);
      poly(c, [[10, -50], [24, -50], [56, -2], [44, -2]], '#e8c43a'); c.fillStyle = '#8a9198'; c.fillRect(8, -50, 4, 50);
    } },
    flat_dock: { w: 90, h: 200, ox: 45, oy: 0, flat: 1, draw(c) {
      c.fillStyle = 'rgba(0,30,40,.25)'; c.fillRect(-36, 8, 76, 190);
      for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#a77b4c' : '#b98b58'; c.fillRect(-38, i * 12, 76, 11); }
      c.fillStyle = '#6a4326'; [-40, 34].forEach(x => { for (let i = 0; i < 4; i++) c.fillRect(x, 10 + i * 50, 6, 10); });
    } },
    flat_boat: { w: 120, h: 70, ox: 60, oy: 35, flat: 1, draw(c) {
      ell(c, 4, 6, 52, 18, 'rgba(0,30,40,.25)');
      c.beginPath(); c.moveTo(-50, 0); c.quadraticCurveTo(0, -26, 54, 0); c.quadraticCurveTo(0, 26, -50, 0); c.fillStyle = '#c0583a'; c.fill();
      c.beginPath(); c.moveTo(-42, 0); c.quadraticCurveTo(0, -18, 46, 0); c.quadraticCurveTo(0, 18, -42, 0); c.fillStyle = '#8a5a34'; c.fill();
      c.fillStyle = '#a77b4c'; c.fillRect(-10, -12, 6, 24); c.fillRect(14, -10, 6, 20);
    } },
    flat_bridge: { w: 140, h: 90, ox: 70, oy: 45, flat: 1, draw(c) {
      c.fillStyle = 'rgba(0,30,40,.3)'; c.fillRect(-66, -36, 136, 80);
      for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#a77b4c' : '#b98b58'; c.fillRect(-70 + i * 11.6, -40, 11, 80); }
      c.fillStyle = '#6a4326'; c.fillRect(-70, -44, 140, 6); c.fillRect(-70, 38, 140, 6);
    } },
    flat_crosswalk: { w: 90, h: 90, ox: 45, oy: 45, flat: 1, draw(c) { c.fillStyle = 'rgba(245,245,240,.85)'; for (let i = 0; i < 6; i++) c.fillRect(-40, -40 + i * 15, 80, 8); } },
  };

  function drawBuilding(c, r, v, green) {
    const cols = ['#c9b79a', '#9fb7c4', '#d6a183', '#b9c49a', '#d8cfc0'];
    const col = cols[v % cols.length], fh = 120 + (v * 37 % 80);
    shadow(c, 14, 0, 80, 16, .32);
    rrect(c, -72, -fh, 144, fh, 2); c.fillStyle = lin(c, -72, 0, 72, 0, shade(col, .12), col, shade(col, -.2)); c.fill();
    for (let y = -fh + 14; y < -26; y += 26) for (let x = -60; x < 60; x += 24) {
      c.fillStyle = r() < .2 ? '#ffe9a6' : '#7fa9bd'; c.fillRect(x, y, 14, 16);
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x, y, 5, 16);
    }
    rrect(c, -12, -28, 24, 28, 2); c.fillStyle = '#4a3a2a'; c.fill();
    rrect(c, -72, -fh - 64, 144, 64, 2); c.fillStyle = green ? '#6a9a46' : shade(col, .25); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 3; c.strokeRect(-70, -fh - 62, 140, 60);
    if (green) canopy(c, r, 0, -fh - 32, 60, 22, GREENS, 12);
    else {
      c.fillStyle = '#9aa1a6'; c.fillRect(-50, -fh - 46, 22, 16); c.fillRect(20, -fh - 40, 30, 20);
      c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-50, -fh - 30, 22, 4);
    }
  }

  // ---------- Cache de sprites ----------
  const cache = new Map();
  const images = {};
  function preloadImages() {
    const man = (typeof ASSET_MANIFEST !== 'undefined' && ASSET_MANIFEST.sprites) || {};
    for (const [name, def] of Object.entries(man)) {
      if (!def || !def.src) continue;
      const img = new Image(); img.src = def.src;
      img.onload = () => { images[name] = { img, def }; };
    }
  }
  function cached(name, variant) {
    const key = name + ':' + variant;
    let e = cache.get(key);
    if (e) return e;
    const sp = S[name], k = 2;
    const cv = document.createElement('canvas'); cv.width = sp.w * k; cv.height = sp.h * k;
    const c = cv.getContext('2d'); c.scale(k, k); c.translate(sp.ox, sp.oy);
    sp.draw(c, rng(variant * 977 + name.length * 31 + 7), variant, 0, 0);
    e = cv; cache.set(key, e);
    return e;
  }
  function drawSprite(c, name, x, y, variant = 0, t = 0, wind = 0, scale = 1, extra) {
    const sp = S[name];
    if (!sp) return;
    const im = images[name];
    c.save(); c.translate(x, y);
    if (scale !== 1) c.scale(scale, scale);
    if (sp.sway && wind) c.transform(1, 0, Math.sin(t * 1.7 + x * .013 + variant) * .03 * wind * sp.sway, 1, 0, 0);
    if (im) c.drawImage(im.img, -im.def.ox, -im.def.oy, im.def.w, im.def.h);
    else if (sp.live) sp.draw(c, rng(variant * 977 + 7), variant, t, wind, extra);
    else c.drawImage(cached(name, variant), -sp.ox, -sp.oy, sp.w, sp.h);
    c.restore();
  }

  // ---------- Personagens ----------
  const CHARS = {
    player: { name: 'Você', skin: '#e0ac7e', hair: '#3b2416', style: 'short', top: '#e2742f', top2: '#b9541a', pants: '#33506e', hat: 'cap', hatCol: '#2f7f86', pack: '#8a5a2b' },
    luna: { name: 'Luna', skin: '#b7794f', hair: '#1e1410', style: 'curly', top: '#f3f2ec', top2: '#c9cfc8', pants: '#2b3a4a', coat: 1, scarf: '#2aa39a', goggles: 1, h: 1.05 },
    joaquim: { name: 'Seu Joaquim', skin: '#a8714a', hair: '#d8d4cc', style: 'bald', beard: '#d8d4cc', top: '#3f6e9e', top2: '#2d5278', pants: '#6b5a42', hat: 'straw' },
    cida: { name: 'Dona Cida', skin: '#8a5a3c', hair: '#2a1a12', style: 'bun', top: '#b5452f', top2: '#8a3020', pants: '#4b3b2a', hat: 'scarf', hatCol: '#e5b33a' },
    iara: { name: 'Iara', skin: '#b97c55', hair: '#141010', style: 'braid', top: '#4f7a3a', top2: '#3a5c2a', pants: '#5a4632', hat: 'none' },
    benedito: { name: 'Seu Benedito', skin: '#6e4630', hair: '#e9e6df', style: 'short', beard: '#e9e6df', top: '#d9cfa6', top2: '#b3a77e', pants: '#5d4b38', hat: 'straw' },
    marina: { name: 'Eng. Marina', skin: '#f0c9a4', hair: '#a8552a', style: 'ponytail', top: '#3a6fa0', top2: '#2a5078', pants: '#2f3a46', hat: 'helmet', hatCol: '#f2c230', vest: '#f28a2e' },
    teo: { name: 'Téo', skin: '#d69a6c', hair: '#2b1b10', style: 'short', top: '#e7c53a', top2: '#c4a22a', pants: '#3c6e9e', hat: 'cap', hatCol: '#c8402f', h: .78 },
  };

  function character(c, id, x, y, dir = 'down', walk = 0, t = 0, opts = {}) {
    const d = CHARS[id];
    const s = opts.noScale ? 1 : (d.h || 1);
    c.save(); c.translate(x, y); c.scale(s, s);
    if (!opts.noShadow) shadow(c, 0, 0, 13, 5, .3);
    const sw = Math.sin(walk), moving = walk !== 0;
    const bob = moving ? Math.abs(Math.sin(walk)) * 2 : Math.sin(t * 2.2) * .6;
    const side = dir === 'left' || dir === 'right';
    if (dir === 'left') c.scale(-1, 1);
    // pernas
    const leg = (lx, ly) => { rrect(c, lx, ly, 6, 16, 3); c.fillStyle = d.pants; c.fill(); ell(c, lx + 3, ly + 15, 4.2, 2.4, '#3a2a1e'); };
    if (side) { leg(-4 + sw * 4, -16); leg(-2 - sw * 4, -16); }
    else { leg(-7, -16 - Math.max(0, sw) * 2.5); leg(1, -16 - Math.max(0, -sw) * 2.5); }
    c.translate(0, -bob);
    // mochila atrás
    if (d.pack && dir === 'up') { rrect(c, -9, -36, 18, 20, 5); c.fillStyle = d.pack; c.fill(); }
    if (d.pack && side) { rrect(c, -15, -35, 8, 18, 4); c.fillStyle = d.pack; c.fill(); }
    // braços
    const arm = (ax, a, col) => { c.save(); c.translate(ax, -33); c.rotate(a); rrect(c, -2.5, 0, 5, 16, 2.5); c.fillStyle = col; c.fill(); ell(c, 0, 16, 2.8, 2.8, d.skin); c.restore(); };
    if (side) arm(1, sw * .6, d.top2);
    else { arm(-11, .12 + sw * .35, d.top2); arm(11, -.12 - sw * .35, d.top2); }
    // tronco
    rrect(c, -10, -36, 20, d.coat ? 26 : 22, 7);
    c.fillStyle = lin(c, -10, -36, 10, -14, d.top, d.top2); c.fill();
    if (d.coat && dir === 'down') { c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -30); c.lineTo(0, -11); c.stroke(); }
    if (d.vest) { rrect(c, -10, -34, 20, 16, 5); c.fillStyle = d.vest; c.fill(); c.fillStyle = '#f4f2ea'; c.fillRect(-10, -26, 20, 2); }
    if (d.pack && dir === 'down') { c.fillStyle = shade(d.pack, -.2); c.fillRect(-8, -35, 3, 14); c.fillRect(5, -35, 3, 14); }
    if (d.scarf) { rrect(c, -10, -38, 20, 6, 3); c.fillStyle = d.scarf; c.fill(); if (dir !== 'up') { c.fillRect(side ? 2 : 3, -34, 4, 9); } }
    // cabeça
    const hy = -47;
    if (d.style === 'braid' && dir !== 'down') { c.strokeStyle = d.hair; c.lineWidth = 5; c.beginPath(); c.moveTo(side ? -8 : 0, hy + 4); c.quadraticCurveTo(side ? -14 : 2, hy + 18, side ? -10 : 0, hy + 26); c.stroke(); }
    if (d.style === 'ponytail' && dir !== 'down') ell(c, side ? -12 : 0, hy + 6, 4.5, 9, d.hair);
    ell(c, 0, hy, 11.5, 11.5, lin(c, -10, hy - 10, 10, hy + 10, shade(d.skin, .12), d.skin, shade(d.skin, -.12)));
    if (d.style === 'curly') {
      const curls = dir === 'up' ? 16 : 11;
      for (let i = 0; i < curls; i++) {
        const a = Math.PI + (i / (curls - 1)) * (dir === 'up' ? TAU : Math.PI) - (side ? .5 : 0);
        ell(c, Math.cos(a) * 12, hy - 2 + Math.sin(a) * 11 * (dir === 'up' ? 1 : .9), 6, 6, i % 2 ? d.hair : shade(d.hair, .15));
      }
      if (dir === 'up') ell(c, 0, hy, 12, 12, d.hair);
    } else if (d.style === 'bald') {
      ell(c, side ? -6 : -9, hy + 1, 3.5, 5, d.hair); if (!side) ell(c, 9, hy + 1, 3.5, 5, d.hair);
    } else {
      c.beginPath(); c.ellipse(0, hy - 3, 12.5, dir === 'up' ? 12 : 9.5, 0, Math.PI, TAU); c.fillStyle = d.hair; c.fill();
      if (dir === 'up') ell(c, 0, hy + 1, 12, 9, d.hair);
      if (side) ell(c, -7, hy - 1, 6, 8, d.hair);
      if (d.style === 'bun') ell(c, side ? -8 : 0, hy - 13, 6, 5, d.hair);
    }
    // rosto
    if (dir === 'down') {
      ell(c, -4.2, hy + 1, 1.8, 2.3, '#2a1a10'); ell(c, 4.2, hy + 1, 1.8, 2.3, '#2a1a10');
      ell(c, -3.7, hy, .6, .6, '#fff'); ell(c, 4.7, hy, .6, .6, '#fff');
      ell(c, -7, hy + 5, 2.2, 1.3, 'rgba(230,110,90,.35)'); ell(c, 7, hy + 5, 2.2, 1.3, 'rgba(230,110,90,.35)');
      c.strokeStyle = '#6a3a2a'; c.lineWidth = 1; c.beginPath(); c.arc(0, hy + 4.5, 2.4, .2, Math.PI - .2); c.stroke();
    } else if (side) {
      ell(c, 5.5, hy + 1, 1.7, 2.2, '#2a1a10'); ell(c, 6, hy, .55, .55, '#fff');
      ell(c, 11.5, hy + 3, 1.6, 1.4, shade(d.skin, -.08));
      ell(c, 4, hy + 5.5, 2, 1.2, 'rgba(230,110,90,.3)');
    }
    if (d.beard && dir !== 'up') { c.beginPath(); c.ellipse(side ? 4 : 0, hy + 8, side ? 6 : 8, 5, 0, 0, Math.PI); c.fillStyle = d.beard; c.fill(); }
    if (d.goggles && dir !== 'up') { c.fillStyle = '#5b4834'; c.fillRect(-11, hy - 8, 22, 3); ell(c, side ? 4 : -4, hy - 7, 3.6, 3, '#9fe0dc'); if (!side) ell(c, 4, hy - 7, 3.6, 3, '#9fe0dc'); }
    // chapéus
    if (d.hat === 'cap') {
      c.beginPath(); c.ellipse(0, hy - 5, 12, 9, 0, Math.PI, TAU); c.fillStyle = d.hatCol; c.fill();
      if (dir === 'down') ell(c, 0, hy - 5, 11, 3.2, shade(d.hatCol, -.25));
      else if (side) ell(c, 10, hy - 5, 7, 2.6, shade(d.hatCol, -.25));
    } else if (d.hat === 'straw') {
      ell(c, 0, hy - 6, 19, 6, '#d9b45a'); c.beginPath(); c.ellipse(0, hy - 7, 10, 9, 0, Math.PI, TAU); c.fillStyle = '#e8c870'; c.fill();
      c.fillStyle = '#8a5a2b'; c.fillRect(-10, hy - 9, 20, 2.5);
    } else if (d.hat === 'helmet') {
      c.beginPath(); c.ellipse(0, hy - 5, 13, 11, 0, Math.PI, TAU); c.fillStyle = d.hatCol; c.fill(); ell(c, 0, hy - 5, 14.5, 3, shade(d.hatCol, -.15));
      ell(c, -4, hy - 11, 3, 2, 'rgba(255,255,255,.4)');
    } else if (d.hat === 'scarf') {
      c.beginPath(); c.ellipse(0, hy - 3, 13, 11, 0, Math.PI, TAU); c.fillStyle = d.hatCol; c.fill();
      c.fillStyle = shade(d.hatCol, -.2); for (let i = -9; i < 10; i += 6) ell(c, i, hy - 8, 1.4, 1.4, '#b5452f');
    }
    c.restore();
  }

  function portrait(canvas, id) {
    const c = canvas.getContext('2d');
    c.clearRect(0, 0, canvas.width, canvas.height);
    if (!CHARS[id]) { // narrador / objeto: ícone de caderno
      c.save(); c.translate(canvas.width / 2, canvas.height / 2); c.scale(2.4, 2.4); iconShape(c, 'caderneta'); c.restore();
      return;
    }
    c.save(); c.translate(canvas.width / 2, canvas.height * 1.42); c.scale(4.4, 4.4);
    character(c, id, 0, 0, 'down', 0, 0, { noScale: 1, noShadow: 1 });
    c.restore();
  }

  // ---------- Ícones de itens ----------
  function iconShape(c, id) {
    if (id === 'caderneta') {
      rrect(c, -26, -32, 52, 64, 6); c.fillStyle = '#7a4f2c'; c.fill();
      rrect(c, -20, -28, 44, 56, 4); c.fillStyle = '#f6ecd4'; c.fill();
      c.fillStyle = '#7a4f2c'; c.fillRect(-26, -32, 10, 64);
      ell(c, 6, -8, 9, 9, '#f2b33d'); ell(c, 12, 2, 10, 6, '#b9c7d6');
      c.fillStyle = '#5b4834'; c.fillRect(-10, 14, 26, 2.5); c.fillRect(-10, 20, 18, 2.5);
      c.fillStyle = '#b5452f'; c.fillRect(18, -32, 5, 18);
      return;
    }
    if (id === 'termometro_portatil') {
      rrect(c, -7, -34, 14, 56, 7); c.fillStyle = '#fbf6e8'; c.fill(); c.strokeStyle = '#7a4f2c'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#d0402c'; c.fillRect(-2.5, -20, 5, 40); ell(c, 0, 24, 9, 9, '#d0402c');
      return;
    }
    const cols = { modulo_atmosfera: '#7cc4e8', modulo_agua: '#3f8fe0', modulo_paisagens: '#6cbf5a', modulo_cidades: '#f2a03d', nucleo: '#f5e27a' };
    const col = cols[id] || '#ccc';
    poly(c, [[0, -36], [30, -18], [30, 18], [0, 36], [-30, 18], [-30, -18]], '#5b6670');
    poly(c, [[0, -30], [24, -15], [24, 15], [0, 30], [-24, 15], [-24, -15]], '#8a96a0');
    const g = c.createRadialGradient(-4, -6, 2, 0, 0, 20); g.addColorStop(0, '#fff'); g.addColorStop(.35, col); g.addColorStop(1, shade(col, -.4));
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, 17, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 22, -2.4, -1.2); c.stroke();
  }
  function icon(canvas, id) {
    const c = canvas.getContext('2d');
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.save(); c.translate(canvas.width / 2, canvas.height / 2); c.scale(canvas.width / 90, canvas.width / 90);
    soft(c, 0, 0, 44, 'rgba(255,230,150,.6)');
    iconShape(c, id); c.restore();
  }

  // ---------- Terreno pintado (pré-renderizado uma vez por região) ----------
  const AREA = {
    sand: ['#e6cf98', '#efdcaa', '#d6ba80'], rock: ['#8f8a7e', '#a29d90', '#77736a'],
    dry: ['#c9a86a', '#d8b97c', '#b38f58'], asphalt: ['#55585c', '#5f6266', '#4a4d51'],
    sidewalk: ['#bdb6a6', '#c9c2b2', '#aea797'], plaza: ['#cfc2a2', '#d9cdb0', '#bfb293'],
    forest: ['#3d5c2a', '#33502a', '#4b6c33'], park: ['#6fa84c', '#7cb555', '#62983f'],
    field: ['#b3b05c', '#c2bd68', '#a3a250'], highland: ['#82995c', '#90a868', '#71894f'],
    lush: ['#4f8a3a', '#5c9a44', '#447a33'],
  };
  function tracePoly(c, pts) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); }
  function tracePath(c, pts) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); }

  function paintArea(c, r, poly, type, w, h) {
    const [base, light, dark] = AREA[type];
    c.save(); c.lineJoin = 'round';
    tracePoly(c, poly); c.strokeStyle = base; c.globalAlpha = .45; c.lineWidth = 26; c.stroke();
    c.globalAlpha = 1; c.fillStyle = base; c.fill();
    c.clip();
    const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const n = Math.min(900, ((x1 - x0) * (y1 - y0)) / 2500);
    for (let i = 0; i < n; i++) soft(c, x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 20 + r() * 60, r() < .5 ? light : dark, .45);
    if (type === 'dry') {
      c.strokeStyle = 'rgba(110,80,40,.35)'; c.lineWidth = 1.2;
      for (let i = 0; i < n * .6; i++) { let x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - .5) * 30; y += (r() - .5) * 30; c.lineTo(x, y); } c.stroke(); }
    }
    if (type === 'asphalt' || type === 'rock' || type === 'sand') for (let i = 0; i < n * 8; i++) { c.fillStyle = r() < .5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)'; c.fillRect(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 2, 2); }
    if (type === 'plaza' || type === 'sidewalk') {
      c.strokeStyle = 'rgba(90,70,50,.18)'; c.lineWidth = 1;
      for (let x = x0; x < x1; x += 28) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke(); }
      for (let y = y0; y < y1; y += 28) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
    }
    if (type === 'forest') for (let i = 0; i < n * 4; i++) ell(c, x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 2.5, 1.4, ['#6b5a2a', '#8a6a2a', '#2a4020'][Math.floor(r() * 3)]);
    if (type === 'park') { c.globalAlpha = .08; for (let x = x0; x < x1; x += 40) { c.fillStyle = (x / 40) % 2 ? '#fff' : '#000'; c.fillRect(x, y0, 20, y1 - y0); } c.globalAlpha = 1; }
    c.restore();
  }

  function paintPath(c, r, p) {
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    const w = p.w || 46;
    if (p.style === 'road') {
      tracePath(c, p.pts); c.strokeStyle = '#bdb6a6'; c.lineWidth = w + 34; c.stroke();
      c.strokeStyle = '#9a9384'; c.lineWidth = w + 6; c.stroke();
      c.strokeStyle = '#505357'; c.lineWidth = w; c.stroke();
      c.setLineDash([24, 20]); c.strokeStyle = '#e8c43a'; c.lineWidth = 3; c.stroke();
    } else {
      const col = p.style === 'stone' ? ['#a89a7e', '#d4c8ad', '#e4dac2'] : ['#a3855a', '#c9ab7a', '#d8bd8c'];
      tracePath(c, p.pts); c.strokeStyle = col[0]; c.globalAlpha = .5; c.lineWidth = w + 10; c.stroke();
      c.globalAlpha = 1; c.strokeStyle = col[1]; c.lineWidth = w; c.stroke();
      c.strokeStyle = col[2]; c.lineWidth = w * .45; c.globalAlpha = .5; c.stroke(); c.globalAlpha = 1;
      for (let i = 0; i < p.pts.length - 1; i++) {
        const [ax, ay] = p.pts[i], [bx, by] = p.pts[i + 1], L = Math.hypot(bx - ax, by - ay);
        for (let k = 0; k < L / 6; k++) { const t = r(); ell(c, ax + (bx - ax) * t + (r() - .5) * w * .8, ay + (by - ay) * t + (r() - .5) * w * .8, 1.6 + r() * 2, 1.2 + r(), r() < .5 ? 'rgba(90,70,40,.35)' : 'rgba(255,250,230,.4)'); }
      }
    }
    c.restore();
  }

  function paintWater(c, r, poly, deep) {
    c.save(); c.lineJoin = 'round';
    tracePoly(c, poly);
    const xs = poly.map(p => p[1]);
    c.fillStyle = lin(c, 0, Math.min(...xs), 0, Math.max(...xs), deep ? '#2c7ea0' : '#3f97b5', deep ? '#1f6585' : '#2f86a6'); c.fill();
    c.strokeStyle = 'rgba(160,230,240,.55)'; c.lineWidth = 10; c.stroke();
    c.strokeStyle = 'rgba(90,70,40,.5)'; c.lineWidth = 3; c.stroke();
    c.restore();
  }

  function bakeTerrain(m) {
    const cv = document.createElement('canvas'); cv.width = m.w; cv.height = m.h;
    const c = cv.getContext('2d'), r = rng(m.seed), def = m.def;
    const ground = AREA[def.ground || 'lush'];
    if (m.land) {
      c.fillStyle = lin(c, 0, 0, m.w, m.h, '#2f8db0', '#1d6a8e'); c.fillRect(0, 0, m.w, m.h);
      for (let i = 0; i < 160; i++) soft(c, r() * m.w, r() * m.h, 30 + r() * 90, r() < .5 ? '#3fa2c0' : '#195c7c', .35);
      c.lineJoin = 'round';
      for (const p of m.land) { tracePoly(c, p); c.strokeStyle = 'rgba(140,225,235,.45)'; c.lineWidth = 80; c.stroke(); c.strokeStyle = 'rgba(160,235,240,.6)'; c.lineWidth = 46; c.stroke(); }
      for (const p of m.land) { tracePoly(c, p); c.strokeStyle = '#e6cf98'; c.lineWidth = 34; c.stroke(); c.fillStyle = ground[0]; c.fill(); }
      c.save(); c.beginPath(); for (const p of m.land) { p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); } c.clip();
    } else { c.fillStyle = ground[0]; c.fillRect(0, 0, m.w, m.h); c.save(); }
    for (let i = 0; i < m.w * m.h / 3000; i++) soft(c, r() * m.w, r() * m.h, 25 + r() * 70, r() < .5 ? ground[1] : ground[2], .5);
    for (const a of def.areas || []) paintArea(c, r, a.poly, a.type, m.w, m.h);
    for (const l of m.lakes) paintWater(c, r, l, false);
    for (const p of def.paths || []) paintPath(c, r, p);
    // detalhes: tufos de grama, flores, pedrinhas
    const det = def.details || {};
    for (let i = 0; i < (det.grass || 0); i++) {
      const x = r() * m.w, y = r() * m.h;
      if (!m.walkable(x, y, 4) || m.onPath(x, y, 10)) continue;
      const at = m.areaAt(x, y);
      if (at && !['park', 'forest', 'highland', 'field', 'lush'].includes(at)) continue;
      c.strokeStyle = r() < .5 ? 'rgba(40,80,30,.6)' : 'rgba(150,200,100,.6)'; c.lineWidth = 1.4;
      for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x + k * 2, y); c.lineTo(x + k * 2 + (r() - .5) * 6, y - 5 - r() * 6); c.stroke(); }
    }
    const fcols = det.flowerCols || ['#f2c14e', '#f5f0e6', '#e86a6a', '#c58ae0'];
    for (let i = 0; i < (det.flowers || 0); i++) {
      const x = r() * m.w, y = r() * m.h;
      if (!m.walkable(x, y, 4) || m.onPath(x, y, 12) || m.areaAt(x, y)) continue;
      ell(c, x, y, 2.4, 2, fcols[Math.floor(r() * fcols.length)]);
    }
    for (let i = 0; i < (det.pebbles || 0); i++) {
      const x = r() * m.w, y = r() * m.h;
      if (!m.walkable(x, y, 4)) continue;
      ell(c, x, y, 2 + r() * 2, 1.5 + r(), r() < .5 ? 'rgba(80,70,60,.4)' : 'rgba(230,220,200,.5)');
    }
    c.restore();
    for (const f of def.flats || []) drawSprite(c, f.sprite, f.x, f.y, f.v || 0);
    return cv;
  }

  return { rng, shade, soft, ell, lin, poly, rrect, S, CHARS, drawSprite, character, portrait, icon, bakeTerrain, preloadImages, TAU };
})();
