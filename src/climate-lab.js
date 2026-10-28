// Laboratórios interativos: chuva orográfica (relevo) e planejamento urbano (ilha de calor e escoamento).
// Todos os números são didáticos e simplificados; a interface avisa isso ao estudante.

// ---------- Modelo da cidade (lógica pura, testada em tests/city-model.test.js) ----------
const CityModel = {
  BASE: {
    r: { name: 'Rua asfaltada', temp: 32, run: .9 }, h: { name: 'Rua asfaltada', temp: 32, run: .9 },
    p: { name: 'Estacionamento', temp: 34, run: .95 }, b: { name: 'Prédio', temp: 31, run: .9 },
    g: { name: 'Área verde', temp: 25, run: .2, cool: .5 },
  },
  TOOLS: {
    trees: { name: 'Plantar árvores', cost: 2, col: '#4c8a37', on: { r: { temp: 28, run: .7, cool: .5 }, h: { temp: 28, run: .7, cool: .5 }, p: { temp: 25, run: .25, cool: 1 } } },
    roof: { name: 'Telhado verde', cost: 2, col: '#8fbf5a', on: { b: { temp: 29, run: .5 } } },
    perm: { name: 'Piso permeável', cost: 1, col: '#b9b08a', on: { r: { temp: 30, run: .5 }, h: { temp: 30, run: .5 }, p: { temp: 31, run: .4 } } },
    shade: { name: 'Toldo de sombra', cost: 1, col: '#e9d9a6', on: { p: { temp: 30, run: .95 }, r: { temp: 30, run: .9 }, h: { temp: 30, run: .9 } } },
  },
  // grid: lista de strings; mods: { "linha,coluna": ferramenta }
  evaluate(grid, mods) {
    const cells = [];
    let cost = 0;
    grid.forEach((row, y) => [...row].forEach((base, x) => {
      const tool = mods[`${y},${x}`];
      const p = Object.assign({ base, tool, x, y }, this.BASE[base], tool ? this.TOOLS[tool].on[base] : null);
      if (tool) cost += this.TOOLS[tool].cost;
      cells.push(p);
    }));
    const at = (x, y) => cells.find(c => c.x === x && c.y === y);
    for (const c of cells) {
      let cool = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = at(c.x + dx, c.y + dy); if (n && n.cool) cool += n.cool; }
      c.final = c.temp - Math.min(2, cool);
    }
    const avg = cells.reduce((s, c) => s + c.final, 0) / cells.length;
    const run = cells.reduce((s, c) => s + c.run, 0) / cells.length;
    return { cells, avgTemp: Math.round(avg * 10) / 10, runoff: Math.round(run * 100), cost };
  },
};

const Lab = {
  run(id) {
    const cfg = LABS[id];
    return new Promise(resolve => {
      let finished = false, errors = 0;
      const ctx = {
        cfg, fail: () => { errors++; Sound.sfx('error'); },
        done: () => {
          finished = true; Progress.recordAttempt(id, errors);
          (cfg.concepts || []).forEach(c => Progress.unlockJournal(c));
          UI.closeModal(); resolve(true);
        },
      };
      UI.openModal(root => this[cfg.type](root, ctx), {
        wide: true,
        onClose: () => { if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; if (!finished) resolve(false); },
      });
    });
  },
  finishButton(el, ctx) {
    const a = document.createElement('div'); a.className = 'panel-actions';
    a.innerHTML = '<button class="btn btn-primary">Concluir experimento ▸</button>';
    a.querySelector('button').onclick = ctx.done; el.appendChild(a); a.querySelector('button').focus();
  },

  // ---------- Laboratório de Nuvens (chuva orográfica) ----------
  orografia(root, ctx) {
    const cfg = ctx.cfg;
    root.innerHTML = `<span class="tag">Laboratório</span><h2 id="panel-title">${cfg.title}</h2><p class="lead">${cfg.intro}</p>
      <div class="lab"><div><canvas width="720" height="400" aria-label="Simulação: ar úmido vindo do mar sobe a montanha"></canvas>
        <div class="lab-controls">
          <div><span class="seg-label">Umidade do ar</span><div class="seg" data-k="hum"><button data-v="baixa">Baixa</button><button data-v="media">Média</button><button data-v="alta">Alta</button></div></div>
          <div><span class="seg-label">Altura da montanha</span><div class="seg" data-k="mt"><button data-v="media">Média (1.000 m)</button><button data-v="alta">Alta (2.000 m)</button></div></div>
          <button class="btn btn-sun run">▶ Soprar o vento do mar</button>
        </div><p class="fict">Simulação didática simplificada: valores aproximados, só para comparar situações.</p></div>
      <div class="lab-steps"></div></div>`;
    const cv = root.querySelector('canvas'), c = cv.getContext('2d');
    const s = { hum: 'media', mt: 'media', running: false, parcels: [], drops: [], rainW: 0, rainL: 0, lowTime: 0, spawn: 0, t: 0 };
    const segs = root.querySelectorAll('.seg');
    const syncSeg = () => segs.forEach(g => g.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', s[g.dataset.k] === b.dataset.v)));
    segs.forEach(g => g.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      s[g.dataset.k] = b.dataset.v; s.rainW = s.rainL = 0; s.lowTime = 0; s.parcels = []; s.drops = []; syncSeg();
    }));
    syncSeg();
    const runBtn = root.querySelector('.run');
    runBtn.onclick = () => { s.running = !s.running; runBtn.textContent = s.running ? '❚❚ Pausar o vento' : '▶ Soprar o vento do mar'; };

    const MPP = 8, SEA = 330, PEAK = 380;
    const hpx = () => (s.mt === 'alta' ? 2000 : 1000) / MPP;
    const ground = x => {
      const u = (x - PEAK) / 230;
      return Math.abs(u) < 1 ? SEA - hpx() * Math.cos(u * Math.PI / 2) ** 2 : SEA;
    };
    const COND = { alta: 400, media: 1100, baixa: 2600 }, WATER = { alta: 1, media: .7, baixa: .35 };
    const tempAt = alt => Math.round(26 - .65 * alt / 100);

    // passos guiados
    const stepsEl = root.querySelector('.lab-steps');
    let si = 0;
    const UNTIL = { rainHigh: () => s.hum === 'alta' && s.rainW >= 25, lowObserved: () => s.hum === 'baixa' && s.lowTime > 6 };
    const renderSteps = () => {
      const st = cfg.steps[si];
      const doneList = cfg.steps.slice(0, si).map(x => `<li class="step-done">✓ ${x.short}</li>`).join('');
      stepsEl.innerHTML = `<h3>Roteiro do experimento</h3><ol class="goal-list">${doneList}</ol>${st ? `<p class="step-now">${st.text || ''}</p><div class="q-area"></div>` : ''}`;
      if (!st) { stepsEl.insertAdjacentHTML('beforeend', `<div class="feedback ok"><span class="fb-ico">★</span><div>${cfg.wrap}</div></div>`); this.finishButton(stepsEl, ctx); return; }
      if (st.quiz) Challenges.question(stepsEl.querySelector('.q-area'), st.quiz, '', ctx.fail, () => {
        const a = document.createElement('div'); a.className = 'panel-actions';
        a.innerHTML = '<button class="btn btn-primary">Próximo passo ▸</button>';
        a.querySelector('button').onclick = () => { si++; renderSteps(); };
        stepsEl.appendChild(a);
      });
    };
    renderSteps();

    let last = performance.now();
    const frame = now => {
      // passos fixos: a simulação anda no mesmo ritmo mesmo se o computador desenhar poucos quadros
      let acc = Math.min(.5, (now - last) / 1000); last = now;
      for (; acc > 0; acc -= .05) step(Math.min(.05, acc));
      const st = cfg.steps[si];
      if (st && st.until && UNTIL[st.until]()) { Sound.sfx('ok'); si++; renderSteps(); }
      draw();
      this.raf = requestAnimationFrame(frame);
    };
    const step = dt => {
      s.t += dt;
      if (s.running) {
        if (s.hum === 'baixa') s.lowTime += dt;
        s.spawn -= dt;
        if (s.spawn <= 0) { s.spawn = .14; s.parcels.push({ x: -10, off: 10 + Math.random() * 26, water: WATER[s.hum], cloud: 0, up: true }); }
        for (const p of s.parcels) {
          p.x += 85 * dt;
          const y = ground(p.x) - p.off, alt = (SEA - y) * MPP;
          p.up = p.x < PEAK;
          if (p.up && alt > COND[s.hum] && p.water > .05) {
            p.cloud = Math.min(1, p.cloud + dt * 2);
            if (Math.random() < dt * 5 * p.water) { s.drops.push({ x: p.x + (Math.random() - .5) * 10, y: y + 6 }); p.water -= .045; }
          } else if (!p.up && alt < COND[s.hum] + 300) p.cloud = Math.max(0, p.cloud - dt * 1.5);
        }
        s.parcels = s.parcels.filter(p => p.x < 740);
        for (const d of s.drops) { d.y += 260 * dt; if (d.y >= ground(d.x)) { d.hit = 1; d.x < PEAK ? s.rainW++ : s.rainL++; } }
        s.drops = s.drops.filter(d => !d.hit);
      }
    };
    const draw = () => {
      c.fillStyle = Art.lin(c, 0, 0, 0, 400, '#8fc9ea', '#d9eef6'); c.fillRect(0, 0, 720, 400);
      Art.ell(c, 670, 100, 26, 26, '#f6d26a');
      c.fillStyle = Art.lin(c, 0, SEA, 0, 400, '#3f97b5', '#1f6585'); c.fillRect(0, SEA, 160, 70);
      c.beginPath(); c.moveTo(140, 400);
      for (let x = 140; x <= 720; x += 4) c.lineTo(x, ground(x));
      c.lineTo(720, 400); c.closePath();
      c.fillStyle = Art.lin(c, 0, 0, 720, 0, '#5d9a45', '#6aa84c', '#8a8a5a', '#c9a86a', '#d8b97c'); c.fill();
      for (let x = 170; x < 360; x += 22) Art.ell(c, x, ground(x) - 6, 9, 8, '#2f6a2a');
      for (let x = 430; x < 700; x += 46) Art.ell(c, x, ground(x) - 4, 5, 4, '#8a8a4a');
      if (s.mt === 'alta') Art.poly(c, [[PEAK - 30, ground(PEAK - 30)], [PEAK, ground(PEAK)], [PEAK + 30, ground(PEAK + 30)]], '#f4f6f8');
      // nível de condensação
      const cy = SEA - COND[s.hum] / MPP;
      if (cy > 20) {
        c.setLineDash([8, 6]); c.strokeStyle = 'rgba(23,111,108,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, cy); c.lineTo(720, cy); c.stroke(); c.setLineDash([]);
        c.fillStyle = '#176f6c'; c.font = 'bold 13px Trebuchet MS'; c.fillText(`nível de condensação (≈ ${COND[s.hum]} m)`, 8, cy - 6);
      } else { c.fillStyle = '#176f6c'; c.font = 'bold 13px Trebuchet MS'; c.fillText('ar seco: só condensaria muito acima da montanha', 8, 26); }
      for (const p of s.parcels) {
        const y = ground(p.x) - p.off;
        if (p.cloud > .05) for (let k = 0; k < 3; k++) Art.ell(c, p.x + (k - 1) * 7, y - 4 + (k % 2) * 3, 9 * p.cloud + 3, 7 * p.cloud + 2, `rgba(255,255,255,${.6 + p.cloud * .35})`);
        else Art.ell(c, p.x, y, 4, 4, p.up ? 'rgba(80,150,220,.55)' : 'rgba(230,140,60,.6)');
      }
      c.strokeStyle = '#2f6fa8'; c.lineWidth = 1.5; c.beginPath();
      for (const d of s.drops) { c.moveTo(d.x, d.y); c.lineTo(d.x - 1, d.y - 7); } c.stroke();
      c.fillStyle = '#2c2116'; c.font = 'bold 14px Trebuchet MS';
      c.fillText('BARLAVENTO (lado do vento)', 150, 390); c.fillText('SOTAVENTO', 520, 390);
      c.fillText('vento do mar ➜', 10, SEA - 40);
      const summitAlt = s.mt === 'alta' ? 2000 : 1000;
      const tag = (x, y, txt) => { c.fillStyle = 'rgba(255,250,235,.92)'; Art.rrect(c, x - 4, y - 16, c.measureText(txt).width + 8, 22, 6); c.fill(); c.fillStyle = '#b5452f'; c.fillText(txt, x, y); };
      tag(20, SEA - 12, '26 °C ao nível do mar');
      tag(PEAK - 60, ground(PEAK) - 14, `${tempAt(summitAlt)} °C no topo (${summitAlt} m)`);
      c.fillStyle = '#2c2116'; c.font = '13px Trebuchet MS';
      tag(360, 30, `Chuva (simulação): barlavento ${Math.round(s.rainW / 3)} mm · sotavento ${Math.round(s.rainL / 3)} mm`);
    };
    this.raf = requestAnimationFrame(frame);
  },

  // ---------- Planejamento urbano ----------
  cidade(root, ctx) {
    const cfg = ctx.cfg, grid = cfg.grid, mods = {};
    const S = 100, COLS = grid[0].length, ROWS = grid.length;
    let tool = 'trees', thermal = false, rainTested = false, rainAnim = 0;
    const base = CityModel.evaluate(grid, {});
    root.innerHTML = `<span class="tag">Laboratório</span><h2 id="panel-title">${cfg.title}</h2><p class="lead">${cfg.intro}</p>
      <div class="lab"><div><canvas width="${COLS * S}" height="${ROWS * S}" aria-label="Mapa de quadras da cidade. Escolha uma ferramenta e toque em uma quadra."></canvas>
        <div class="lab-controls"><button class="btn btn-small thermal" aria-pressed="false">🌡 Visão térmica</button>
        ${cfg.goals.rainTest ? '<button class="btn btn-small rain">☔ Testar chuva forte</button>' : ''}</div>
        <p class="fict">Modelo didático com temperaturas fictícias às 14h de um dia de verão. Ele simplifica a realidade para comparar escolhas.</p></div>
      <div><div class="indicators"></div><h3>Ferramentas</h3><div class="tools"></div>
        <h3>Metas do plano</h3><ul class="goal-list"></ul>
        <div class="panel-actions"><button class="btn btn-primary present">Apresentar plano</button></div><div class="fb"></div></div></div>`;
    const cv = root.querySelector('canvas'), c = cv.getContext('2d');
    const toolsEl = root.querySelector('.tools');
    const tools = Object.assign({}, CityModel.TOOLS, { erase: { name: 'Desfazer quadra', cost: 0, col: '#fff' } });
    Object.entries(tools).forEach(([k, t]) => {
      const b = document.createElement('button'); b.className = 'tool'; b.dataset.k = k;
      const where = t.on ? Object.keys(t.on).map(x => ({ r: 'ruas', h: '', p: 'estacionamentos', b: 'prédios' }[x])).filter(Boolean).join(', ') : 'remove uma mudança';
      b.innerHTML = `<span class="sw" style="background:${t.col}"></span><span>${t.name}<br><small>${t.cost ? `custo ${t.cost} · ` : ''}${where}</small></span>`;
      b.onclick = () => { tool = k; syncTools(); };
      toolsEl.appendChild(b);
    });
    const syncTools = () => toolsEl.querySelectorAll('.tool').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === tool));
    syncTools();
    const fb = root.querySelector('.fb');
    const hint = (msg, ok) => { fb.innerHTML = `<div class="feedback ${ok ? 'ok' : 'hint'}"><span class="fb-ico">${ok ? '✓' : '?'}</span><div>${msg}</div></div>`; };

    const state = () => CityModel.evaluate(grid, mods);
    const goalsMet = ev => ({
      temp: base.avgTemp - ev.avgTemp >= cfg.goals.temp - 1e-9,
      runoff: cfg.goals.runoff == null || ev.runoff <= cfg.goals.runoff,
      rain: !cfg.goals.rainTest || rainTested,
    });
    const refresh = () => {
      const ev = state(), g = goalsMet(ev), dT = Math.round((ev.avgTemp - base.avgTemp) * 10) / 10;
      root.querySelector('.indicators').innerHTML = `
        <div class="ind"><small>Temperatura média</small><b>${ev.avgTemp.toFixed(1)} °C</b><span class="delta">${dT <= 0 ? '▼' : '▲'} ${Math.abs(dT).toFixed(1)} °C</span></div>
        <div class="ind"><small>Água da chuva que escoa</small><b>${ev.runoff}%</b><span class="delta">antes: ${base.runoff}%</span></div>
        <div class="ind"><small>Orçamento restante</small><b>${cfg.budget - ev.cost}</b><span class="delta">de ${cfg.budget}</span></div>`;
      root.querySelector('.goal-list').innerHTML = `
        <li class="${g.temp ? 'met' : ''}">Baixar a temperatura média em pelo menos ${cfg.goals.temp.toFixed(1)} °C</li>
        ${cfg.goals.runoff != null ? `<li class="${g.runoff ? 'met' : ''}">Deixar no máximo ${cfg.goals.runoff}% da chuva escoando pela superfície</li>` : ''}
        ${cfg.goals.rainTest ? `<li class="${g.rain ? 'met' : ''}">Testar o plano com uma chuva forte</li>` : ''}`;
      draw(ev);
    };

    cv.addEventListener('click', e => {
      const r = cv.getBoundingClientRect();
      const x = Math.floor((e.clientX - r.left) / r.width * COLS), y = Math.floor((e.clientY - r.top) / r.height * ROWS);
      const key = `${y},${x}`, b = grid[y][x];
      if (tool === 'erase') { if (mods[key]) { delete mods[key]; rainTested = false; Sound.sfx('open'); } refresh(); return; }
      const t = CityModel.TOOLS[tool];
      if (!t.on[b]) { hint(`<b>${t.name}</b> não pode ser usado em: ${CityModel.BASE[b].name.toLowerCase()}. Escolha outra quadra.`); return; }
      const ev = state(), already = mods[key] ? CityModel.TOOLS[mods[key]].cost : 0;
      if (ev.cost - already + t.cost > cfg.budget) { hint('O orçamento acabou. Use “Desfazer quadra” para trocar uma escolha por outra.'); return; }
      mods[key] = tool; rainTested = false; Sound.sfx('open'); fb.innerHTML = ''; refresh();
    });
    root.querySelector('.thermal').onclick = e => { thermal = !thermal; e.currentTarget.setAttribute('aria-pressed', thermal); refresh(); };
    const rainBtn = root.querySelector('.rain');
    if (rainBtn) rainBtn.onclick = () => {
      rainAnim = .001; rainBtn.disabled = true;
      const t0 = performance.now();
      const anim = now => {
        rainAnim = Math.min(1, (now - t0) / 2600); draw(state());
        if (rainAnim < 1) this.raf = requestAnimationFrame(anim);
        else { rainTested = true; rainBtn.disabled = false; const ev = state(); hint(`Resultado do teste: <b>${ev.runoff}%</b> da água escorreu pelas ruas (antes eram ${base.runoff}%). As poças azuis mostram onde a água não consegue infiltrar.`, ev.runoff <= (cfg.goals.runoff ?? 100)); refresh(); }
      };
      this.raf = requestAnimationFrame(anim);
    };
    root.querySelector('.present').onclick = () => {
      const ev = state(), g = goalsMet(ev);
      if (g.temp && g.runoff && g.rain) { Sound.sfx('ok'); hint(cfg.wrap, true); root.querySelector('.present').disabled = true; this.finishButton(root.querySelector('.fb'), ctx); return; }
      ctx.fail();
      if (!g.temp) hint(cfg.hints.temp);
      else if (!g.runoff) hint(cfg.hints.runoff);
      else hint('Falta testar o plano com uma chuva forte: use o botão ☔.');
    };

    const r = Art.rng(5);
    const draw = ev => {
      c.clearRect(0, 0, cv.width, cv.height);
      for (const cell of ev.cells) {
        const x = cell.x * S, y = cell.y * S, look = cell.tool ? cell.base + '_' + cell.tool : cell.base;
        drawCell(c, look, x, y, S, cell, r);
        if (thermal) {
          const k = Math.max(0, Math.min(1, (cell.final - 24) / 11));
          c.fillStyle = `rgba(${Math.round(60 + 195 * k)},${Math.round(170 - 110 * k)},${Math.round(200 - 170 * k)},.5)`; c.fillRect(x, y, S, S);
          c.font = 'bold 22px Trebuchet MS'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.65)';
          c.strokeText(`${cell.final.toFixed(0)}°`, x + S / 2, y + S / 2 + 8); c.fillStyle = '#fff'; c.fillText(`${cell.final.toFixed(0)}°`, x + S / 2, y + S / 2 + 8); c.textAlign = 'left';
        }
        if (rainAnim > 0) { const p = rainAnim * cell.run; if (p > .3) Art.ell(c, x + S / 2, y + S * .7, S * .42 * p, S * .16 * p, 'rgba(70,140,220,.55)'); }
      }
      c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 1;
      for (let i = 1; i < COLS; i++) { c.beginPath(); c.moveTo(i * S, 0); c.lineTo(i * S, cv.height); c.stroke(); }
      for (let i = 1; i < ROWS; i++) { c.beginPath(); c.moveTo(0, i * S); c.lineTo(cv.width, i * S); c.stroke(); }
      if (rainAnim > 0 && rainAnim < 1) {
        c.strokeStyle = 'rgba(200,225,250,.7)'; c.beginPath();
        for (let i = 0; i < 220; i++) { const x = Math.random() * cv.width, y = Math.random() * cv.height; c.moveTo(x, y); c.lineTo(x - 3, y - 14); }
        c.stroke();
      }
    };
    refresh();
  },
};

// Quadra vista de cima (planta ilustrada).
function drawCell(c, look, x, y, S, cell, r) {
  const { ell, rrect } = Art;
  c.save(); c.translate(x, y);
  c.beginPath(); c.rect(0, 0, S, S); c.clip();
  const asphalt = () => { c.fillStyle = '#5a5d61'; c.fillRect(0, 0, S, S); };
  const lane = () => {
    c.setLineDash([12, 10]); c.strokeStyle = '#e8c43a'; c.lineWidth = 3; c.beginPath();
    if (cell.base === 'h') { c.moveTo(0, S / 2); c.lineTo(S, S / 2); } else { c.moveTo(S / 2, 0); c.lineTo(S / 2, S); }
    c.stroke(); c.setLineDash([]);
  };
  const tree = (tx, ty, s) => Art.drawSprite(c, 'tree_round', tx, ty, Math.floor(tx + ty) % 5, 0, 0, s);
  const grass = () => { c.fillStyle = '#6fa84c'; c.fillRect(0, 0, S, S); for (let i = 0; i < 30; i++) ell(c, (i * 37) % S, (i * 53) % S, 6, 4, i % 2 ? '#7cb555' : '#62983f'); };
  switch (look) {
    case 'r': case 'h': asphalt(); lane(); break;
    case 'r_trees': case 'h_trees': asphalt(); lane(); tree(18, 40, .38); tree(82, 90, .38); break;
    case 'r_perm': case 'h_perm': case 'p_perm':
      c.fillStyle = '#7fa25a'; c.fillRect(0, 0, S, S); c.fillStyle = '#c9c0a2';
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) c.fillRect(i * 16.6 + 2, j * 16.6 + 2, 13, 13);
      break;
    case 'r_shade': case 'h_shade': asphalt(); lane(); c.fillStyle = 'rgba(233,217,166,.85)'; for (let i = 0; i < 4; i++) c.fillRect(8, 10 + i * 22, S - 16, 12); break;
    case 'p': case 'p_shade':
      c.fillStyle = '#6a6d71'; c.fillRect(0, 0, S, S);
      c.strokeStyle = '#eee'; c.lineWidth = 2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(i * 25, 0); c.lineTo(i * 25, 40); c.moveTo(i * 25, 60); c.lineTo(i * 25, S); c.stroke(); }
      [['#c8402f', 6, 6], ['#2f6fa8', 56, 66], ['#e9e6dc', 31, 64]].forEach(([col, cx, cy]) => { rrect(c, cx, cy, 14, 28, 4); c.fillStyle = col; c.fill(); });
      if (look === 'p_shade') { c.fillStyle = 'rgba(233,217,166,.9)'; for (let i = 0; i < 4; i++) c.fillRect(4, 6 + i * 24, S - 8, 14); c.fillStyle = 'rgba(181,69,47,.6)'; for (let i = 0; i < 4; i++) c.fillRect(4, 6 + i * 24, S - 8, 3); }
      break;
    case 'p_trees': grass(); c.fillStyle = '#d8c9a2'; c.fillRect(0, 44, S, 12); tree(25, 40, .42); tree(72, 36, .42); tree(48, 92, .42); break;
    case 'b': case 'b_roof':
      c.fillStyle = '#a19a8e'; c.fillRect(0, 0, S, S); c.fillStyle = look === 'b' ? '#c9c2b4' : '#6a9a46'; c.fillRect(8, 8, S - 16, S - 16);
      if (look === 'b') { c.fillStyle = '#8e969c'; c.fillRect(20, 20, 22, 18); c.fillRect(58, 56, 26, 22); }
      else for (let i = 0; i < 28; i++) ell(c, 14 + (i * 29) % (S - 28), 14 + (i * 47) % (S - 28), 7, 6, i % 3 ? '#4c8a37' : '#8fbf5a');
      break;
    case 'g': grass(); tree(30, 50, .45); tree(70, 85, .4); break;
  }
  c.restore();
}
