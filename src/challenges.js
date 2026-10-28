// Desafios: quiz com figura, classificar, ordenar, selecionar evidências e fichas informativas.
// Erro -> pista contextual e nova tentativa. Acerto -> explicação. Nenhuma punição.
const Challenges = {
  run(id) {
    const ch = CHALLENGES[id];
    return new Promise(resolve => {
      let errors = 0, finished = false;
      const fail = () => { errors++; Sound.sfx('error'); };
      const done = () => {
        finished = true;
        if (ch.type !== 'info') Progress.recordAttempt(id, errors);
        if (ch.concepts) ch.concepts.forEach(c => Progress.unlockJournal(c));
        UI.closeModal(); resolve(true);
      };
      UI.openModal(root => {
        root.innerHTML = `<div class="ch-head"><span class="tag">${ch.kind || 'Desafio'}</span></div>
          <h2 id="panel-title">${ch.title}</h2>${ch.prompt ? `<p class="ch-prompt">${ch.prompt}</p>` : ''}<div class="ch-body"></div>`;
        const body = root.querySelector('.ch-body');
        const finishBtn = label => {
          const a = document.createElement('div'); a.className = 'panel-actions';
          a.innerHTML = `<button class="btn btn-primary">${label || 'Continuar ▸'}</button>`;
          a.querySelector('button').onclick = done; body.appendChild(a); a.querySelector('button').focus();
        };
        this[ch.type](body, ch, fail, finishBtn);
      }, { onClose: () => { if (!finished) resolve(false); }, wide: true });
    });
  },

  // ---------- Tipos ----------
  info(body, ch, fail, finish) {
    body.innerHTML = `<div class="ch-layout ${ch.figure ? '' : 'single'}">${ch.figure ? Figures.html(ch.figure) : ''}<div>${ch.text}</div></div>`;
    finish(ch.button || 'Entendi ▸');
  },

  quiz(body, ch, fail, finish) {
    let i = 0;
    const step = () => {
      const q = ch.questions[i];
      const fig = q.figure || (i === 0 || q.keepFigure !== false ? ch.figure : null);
      body.innerHTML = `<div class="ch-layout ${fig ? '' : 'single'}">${fig ? Figures.html(fig) : ''}<div class="q-area"></div></div>`;
      Challenges.question(body.querySelector('.q-area'), q, ch.questions.length > 1 ? `Pergunta ${i + 1} de ${ch.questions.length}` : '', fail, () => {
        if (++i >= ch.questions.length) { finish('Concluir ▸'); return; }
        const a = document.createElement('div'); a.className = 'panel-actions';
        a.innerHTML = `<button class="btn btn-primary">Próxima pergunta ▸</button>`;
        body.querySelector('.q-area').appendChild(a);
        a.querySelector('button').onclick = step;
        a.querySelector('button').focus();
      });
    };
    step();
  },

  // Uma pergunta de múltipla escolha. Reutilizada pelos laboratórios.
  question(el, q, stepLabel, fail, onRight) {
    el.innerHTML = `${stepLabel ? `<div class="q-step">${stepLabel}</div>` : ''}<p class="q-text">${q.q}</p><div class="options"></div><div class="fb"></div>`;
    const opts = el.querySelector('.options'), fb = el.querySelector('.fb');
    const order = q.keepOrder ? q.options : shuffle(q.options.slice());
    order.forEach(o => {
      const b = document.createElement('button');
      b.className = 'opt'; b.innerHTML = `<span class="mark" aria-hidden="true">○</span><span>${o.t}</span>`;
      b.onclick = () => {
        if (o.ok) {
          b.classList.add('right'); b.querySelector('.mark').textContent = '✓';
          opts.querySelectorAll('.opt').forEach(x => x.disabled = true);
          fb.innerHTML = `<div class="feedback ok"><span class="fb-ico">✓</span><div><b>Isso mesmo!</b> ${o.why || q.why || ''}</div></div>`;
          Sound.sfx('ok'); onRight();
        } else {
          b.classList.add('wrong', 'shake'); b.disabled = true; b.querySelector('.mark').textContent = '✗';
          fb.innerHTML = `<div class="feedback hint"><span class="fb-ico">?</span><div><b>Ainda não.</b> ${o.hint || q.hint || 'Observe a figura de novo e tente outra opção.'}</div></div>`;
          fail();
        }
      };
      opts.appendChild(b);
    });
  },

  sort(body, ch, fail, finish) {
    body.innerHTML = `${ch.figure ? Figures.html(ch.figure) : ''}<div class="sort-bins"></div><p class="lead">Escolha a categoria certa para cada cartão:</p><div class="sort-cards"></div><div class="fb"></div>`;
    const bins = body.querySelector('.sort-bins'), cards = body.querySelector('.sort-cards'), fb = body.querySelector('.fb');
    ch.categories.forEach(c => {
      const d = document.createElement('div'); d.className = 'bin'; d.dataset.cat = c.id;
      d.innerHTML = `<h4>${c.label}</h4><small>${c.desc || ''}</small>`; bins.appendChild(d);
    });
    let left = ch.items.length;
    shuffle(ch.items.slice()).forEach(it => {
      const card = document.createElement('div'); card.className = 'card';
      card.innerHTML = `<p>${it.t}</p><div class="card-actions"></div>`;
      ch.categories.forEach(c => {
        const b = document.createElement('button'); b.className = 'btn btn-small'; b.textContent = c.short || c.label;
        b.onclick = () => {
          if (c.id === it.cat) {
            const p = document.createElement('div'); p.className = 'placed'; p.innerHTML = `✓ ${it.t}`;
            bins.querySelector(`[data-cat="${c.id}"]`).appendChild(p);
            card.remove(); Sound.sfx('ok');
            fb.innerHTML = `<div class="feedback ok"><span class="fb-ico">✓</span><div>${it.why}</div></div>`;
            if (--left === 0) { fb.innerHTML += `<div class="feedback ok"><span class="fb-ico">★</span><div>${ch.wrap || 'Todos os cartões estão no lugar certo!'}</div></div>`; finish(); }
          } else {
            card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
            fb.innerHTML = `<div class="feedback hint"><span class="fb-ico">?</span><div><b>“${it.t}”</b> — ${it.hint}</div></div>`;
            fail();
          }
        };
        card.querySelector('.card-actions').appendChild(b);
      });
      cards.appendChild(card);
    });
  },

  order(body, ch, fail, finish) {
    body.innerHTML = `<div class="ch-layout ${ch.figure ? '' : 'single'}">${ch.figure ? Figures.html(ch.figure) : ''}
      <div><p class="lead">Toque nas etapas na ordem certa. Toque em uma caixa preenchida para tirá-la.</p>
      <div class="order-slots"></div><div class="order-pool"></div>
      <div class="panel-actions"><button class="btn btn-sun check">Verificar ordem</button></div><div class="fb"></div></div></div>`;
    const slotsEl = body.querySelector('.order-slots'), pool = body.querySelector('.order-pool'), fb = body.querySelector('.fb');
    const slots = ch.items.map(() => null);
    const draw = () => {
      slotsEl.innerHTML = ''; pool.innerHTML = '';
      slots.forEach((it, i) => {
        const s = document.createElement('button'); s.className = 'slot' + (it ? ' filled' : '');
        s.textContent = it ? it.t : '…'; s.setAttribute('aria-label', `Posição ${i + 1}: ${it ? it.t : 'vazia'}`);
        s.onclick = () => { if (it) { slots[i] = null; draw(); } };
        slotsEl.appendChild(s);
      });
      shuffleOnce(ch).forEach(it => {
        if (slots.includes(it)) return;
        const b = document.createElement('button'); b.className = 'btn btn-small'; b.textContent = it.t;
        b.onclick = () => { const k = slots.indexOf(null); if (k >= 0) { slots[k] = it; draw(); } };
        pool.appendChild(b);
      });
    };
    draw();
    body.querySelector('.check').onclick = () => {
      if (slots.includes(null)) { fb.innerHTML = `<div class="feedback hint"><span class="fb-ico">?</span><div>Coloque todas as etapas antes de verificar.</div></div>`; return; }
      const wrongAt = slots.findIndex((it, i) => it !== ch.items[i]);
      [...slotsEl.children].forEach((s, i) => s.classList.add(slots[i] === ch.items[i] ? 'right' : 'wrong'));
      if (wrongAt < 0) {
        Sound.sfx('ok');
        body.querySelector('.check').disabled = true;
        fb.innerHTML = `<div class="feedback ok"><span class="fb-ico">✓</span><div>${ch.why}</div></div>`;
        finish();
      } else {
        fail();
        fb.innerHTML = `<div class="feedback hint"><span class="fb-ico">?</span><div>As caixas marcadas com ✗ cor de tijolo estão fora do lugar. ${slots[wrongAt].hint || ch.hint}</div></div>`;
        [...slotsEl.children].forEach((s, i) => { s.textContent = (slots[i] === ch.items[i] ? '✓ ' : '✗ ') + slots[i].t; });
      }
    };
  },

  evidence(body, ch, fail, finish) {
    body.innerHTML = `<div class="ch-layout ${ch.figure ? '' : 'single'}">${ch.figure ? Figures.html(ch.figure) : ''}
      <div><div class="feedback hint"><span class="fb-ico">❝</span><div><b>Afirmação:</b> ${ch.claim}</div></div>
      <p class="lead">Marque <b>todas</b> as evidências que ajudam a explicar a afirmação:</p>
      <div class="options"></div><div class="panel-actions"><button class="btn btn-sun check">Verificar</button></div><div class="fb"></div></div></div>`;
    const opts = body.querySelector('.options'), fb = body.querySelector('.fb');
    const sel = new Set();
    shuffle(ch.items.slice()).forEach(it => {
      const b = document.createElement('button'); b.className = 'opt'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="mark" aria-hidden="true">☐</span><span>${it.t}</span>`;
      b.onclick = () => {
        sel.has(it) ? sel.delete(it) : sel.add(it);
        b.classList.toggle('selected', sel.has(it)); b.setAttribute('aria-pressed', sel.has(it));
        b.querySelector('.mark').textContent = sel.has(it) ? '☑' : '☐';
      };
      b._it = it; opts.appendChild(b);
    });
    body.querySelector('.check').onclick = () => {
      const wrongPick = [...sel].find(it => !it.ok), missing = ch.items.find(it => it.ok && !sel.has(it));
      if (!wrongPick && !missing) {
        opts.querySelectorAll('.opt').forEach(b => { b.disabled = true; if (b._it.ok) { b.classList.add('right'); b.querySelector('.mark').textContent = '✓'; } });
        body.querySelector('.check').disabled = true;
        fb.innerHTML = `<div class="feedback ok"><span class="fb-ico">✓</span><div>${ch.why}</div></div>`;
        Sound.sfx('ok'); finish();
      } else {
        fail();
        fb.innerHTML = `<div class="feedback hint"><span class="fb-ico">?</span><div>${wrongPick ? `<b>“${wrongPick.t}”</b> — ${wrongPick.hint}` : `Falta pelo menos uma evidência. ${missing.hint}`}</div></div>`;
      }
    };
  },
};

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// embaralha uma vez por desafio, para os botões não pularem de lugar a cada clique
function shuffleOnce(ch) { return ch._pool || (ch._pool = shuffle(ch.items.slice())); }

// ---------- Figuras (SVG/HTML) usadas nos desafios e no diário ----------
const Figures = {
  html(f) {
    const inner = this[f.kind](f);
    return `<figure class="figure">${inner}${f.caption ? `<figcaption>${f.caption}</figcaption>` : ''}</figure>`;
  },
  table(f) {
    return `<table class="data-table"><thead><tr>${f.head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead>
      <tbody>${f.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  },
  row(f) { return `<div class="fig-row">${f.items.map(x => this[x.kind](x) + (x.caption ? `<div class="cap">${x.caption}</div>` : '')).map(h => `<div>${h}</div>`).join('')}</div>`; },
  image(f) { return f.svg; },

  thermometer(f) {
    const v = f.value, y = t => 250 - (t + 10) * 4.5;
    let ticks = '';
    for (let t = -10; t <= 40; t += 2) ticks += `<line x1="${t % 10 ? 92 : 86}" x2="100" y1="${y(t)}" y2="${y(t)}" stroke="#5b4834" stroke-width="${t % 10 ? 1 : 2}"/>` + (t % 10 ? '' : `<text x="80" y="${y(t) + 5}" text-anchor="end" font-size="14" fill="#2c2116">${t}</text>`);
    return `<svg viewBox="0 0 220 300" width="200" role="img" aria-label="Termômetro marcando ${v} graus Celsius">
      <rect x="40" y="10" width="140" height="280" rx="16" fill="#f4f2ea" stroke="#7a4f2c" stroke-width="3"/>
      ${ticks}<text x="150" y="40" font-size="18" fill="#2c2116" text-anchor="middle">°C</text>
      <rect x="104" y="20" width="16" height="240" rx="8" fill="#fff" stroke="#9a9384" stroke-width="2"/>
      <rect x="108" y="${y(v)}" width="8" height="${262 - y(v)}" fill="#d0402c"/>
      <circle cx="112" cy="268" r="14" fill="#d0402c" stroke="#9a2a1a" stroke-width="2"/>
      <line x1="122" x2="170" y1="${y(v)}" y2="${y(v)}" stroke="#176f6c" stroke-dasharray="4 3" stroke-width="2"/>
      <text x="172" y="${y(v) + 5}" font-size="13" fill="#176f6c">topo</text></svg>`;
  },
  raingauge(f) {
    const v = f.value, y = mm => 260 - mm * 8;
    let ticks = '';
    for (let m = 0; m <= 25; m++) ticks += `<line x1="${m % 5 ? 132 : 126}" x2="140" y1="${y(m)}" y2="${y(m)}" stroke="#2c2116" stroke-width="${m % 5 ? 1 : 2}"/>` + (m % 5 ? '' : `<text x="146" y="${y(m) + 5}" font-size="14" fill="#2c2116">${m}</text>`);
    return `<svg viewBox="0 0 220 300" width="200" role="img" aria-label="Pluviômetro com ${v} milímetros de água">
      <path d="M50 20 L170 20 L130 50 L90 50 Z" fill="#aebcc4" stroke="#5f6d75" stroke-width="2"/>
      <rect x="80" y="50" width="60" height="215" rx="6" fill="#eef4f6" stroke="#5f6d75" stroke-width="3"/>
      <rect x="83" y="${y(v)}" width="54" height="${262 - y(v)}" fill="#5aa7e0" opacity=".8"/>
      <path d="M83 ${y(v)} q13 -4 27 0 t27 0" fill="none" stroke="#2f6fa8" stroke-width="2"/>
      ${ticks}<text x="110" y="290" text-anchor="middle" font-size="14" fill="#2c2116">milímetros (mm)</text></svg>`;
  },
  anemometer(f) {
    return `<svg viewBox="0 0 320 240" width="300" role="img" aria-label="Anemômetro girando e biruta apontando para o oeste">
      <rect width="320" height="240" rx="12" fill="#cfe9f5"/>
      <path d="M0 200 h320 v40 h-320z" fill="#7fae5a"/>
      <g transform="translate(90 70)"><line x1="0" y1="0" x2="0" y2="140" stroke="#5b666d" stroke-width="5"/>
        <g class="spin"><line x1="-40" y1="0" x2="40" y2="0" stroke="#5b666d" stroke-width="3"/><line x1="0" y1="-14" x2="0" y2="14" stroke="#5b666d" stroke-width="3"/>
        <circle cx="-40" cy="0" r="10" fill="#cfd8de" stroke="#5b666d"/><circle cx="40" cy="0" r="10" fill="#93a1aa" stroke="#5b666d"/>
        <animateTransform attributeName="transform" type="scale" values="1 1;-1 1;1 1" dur="0.8s" repeatCount="indefinite"/></g></g>
      <text x="90" y="232" text-anchor="middle" font-size="14" fill="#2c2116">Anemômetro</text>
      <g transform="translate(230 70)"><line x1="0" y1="0" x2="0" y2="140" stroke="#5b666d" stroke-width="5"/>
        <path d="M0 -12 L-70 -5 L-70 5 L0 12 Z" fill="#e0582f"/><path d="M-28 -9 L-42 -8 L-42 8 L-28 9Z" fill="#f5f1e6"/><path d="M-56 -6.5 L-70 -5 L-70 5 L-56 6.5Z" fill="#f5f1e6"/></g>
      <text x="230" y="232" text-anchor="middle" font-size="14" fill="#2c2116">Biruta</text>
      <text x="300" y="30" text-anchor="end" font-size="14" fill="#2c2116">mar ➜ leste</text><text x="20" y="30" font-size="14" fill="#2c2116">oeste</text>
      <text x="160" y="120" text-anchor="middle" font-size="14" fill="#176f6c">≈ 30 km/h</text></svg>`;
  },
  hygrometer(f) {
    const a = -Math.PI * .75 + (f.value / 100) * Math.PI * 1.5;
    let ticks = '';
    for (let v = 0; v <= 100; v += 10) { const t = -Math.PI * .75 + v / 100 * Math.PI * 1.5; ticks += `<line x1="${110 + Math.sin(t) * 70}" y1="${120 - Math.cos(t) * 70}" x2="${110 + Math.sin(t) * 82}" y2="${120 - Math.cos(t) * 82}" stroke="#2c2116" stroke-width="2"/><text x="${110 + Math.sin(t) * 58}" y="${125 - Math.cos(t) * 58}" font-size="11" text-anchor="middle">${v}</text>`; }
    return `<svg viewBox="0 0 220 220" width="200" role="img" aria-label="Higrômetro marcando ${f.value} por cento de umidade">
      <circle cx="110" cy="120" r="95" fill="#c9a24a"/><circle cx="110" cy="120" r="86" fill="#fbf6e8"/>${ticks}
      <line x1="110" y1="120" x2="${110 + Math.sin(a) * 66}" y2="${120 - Math.cos(a) * 66}" stroke="#b5452f" stroke-width="4" stroke-linecap="round"/>
      <circle cx="110" cy="120" r="6" fill="#2c2116"/><text x="110" y="175" text-anchor="middle" font-size="14">umidade relativa (%)</text></svg>`;
  },
  // Climograma: barras = chuva (mm), linha = temperatura (°C)
  climograph(f) {
    const M = 'JFMAMJJASOND'.split(''), W = 360, H = 230, x0 = 40, y0 = 190, bw = 22;
    const maxR = f.maxRain || 400, maxT = 40;
    const bars = f.rain.map((r, i) => `<rect x="${x0 + i * 26 + 2}" y="${y0 - r / maxR * 160}" width="${bw}" height="${r / maxR * 160}" fill="#5aa7e0"><title>${r} mm</title></rect>`).join('');
    const pts = f.temp.map((t, i) => `${x0 + i * 26 + 13},${y0 - t / maxT * 160}`).join(' ');
    let axis = '';
    for (let r = 0; r <= maxR; r += maxR / 4) axis += `<text x="${x0 - 4}" y="${y0 - r / maxR * 160 + 4}" font-size="10" text-anchor="end">${r}</text><line x1="${x0}" x2="${x0 + 312}" y1="${y0 - r / maxR * 160}" y2="${y0 - r / maxR * 160}" stroke="#000" stroke-opacity=".08"/>`;
    for (let t = 0; t <= maxT; t += 10) axis += `<text x="${x0 + 316}" y="${y0 - t / maxT * 160 + 4}" font-size="10">${t}°</text>`;
    return `<svg viewBox="0 0 ${W + 20} ${H + 20}" role="img" aria-label="Climograma de ${f.title}">
      <text x="${(W + 20) / 2}" y="16" text-anchor="middle" font-size="14" font-weight="bold" fill="#4a2f19">${f.title}</text>
      ${axis}${bars}<polyline points="${pts}" fill="none" stroke="#d0402c" stroke-width="3"/>
      ${f.temp.map((t, i) => `<circle cx="${x0 + i * 26 + 13}" cy="${y0 - t / maxT * 160}" r="3" fill="#d0402c"/>`).join('')}
      ${M.map((m, i) => `<text x="${x0 + i * 26 + 13}" y="${y0 + 14}" font-size="11" text-anchor="middle">${m}</text>`).join('')}
      <rect x="${x0}" y="${H - 6}" width="12" height="10" fill="#5aa7e0"/><text x="${x0 + 16}" y="${H + 3}" font-size="11">chuva (mm)</text>
      <line x1="${x0 + 120}" x2="${x0 + 140}" y1="${H - 1}" y2="${H - 1}" stroke="#d0402c" stroke-width="3"/><text x="${x0 + 144}" y="${H + 3}" font-size="11">temperatura média (°C)</text></svg>`;
  },
  bars(f) {
    const max = f.max || Math.max(...f.items.map(i => i.v)) * 1.15, W = 360, bh = 34;
    return `<svg viewBox="0 0 ${W} ${f.items.length * (bh + 12) + 10}" role="img" aria-label="Gráfico de barras">
      ${f.items.map((it, i) => { const w = (it.v - (f.min || 0)) / (max - (f.min || 0)) * 200, y = 6 + i * (bh + 12); return `
        <text x="120" y="${y + bh / 2 + 5}" text-anchor="end" font-size="13">${it.label}</text>
        <rect x="128" y="${y}" width="${w}" height="${bh}" rx="6" fill="${it.col || '#e0582f'}"/>
        <text x="${134 + w}" y="${y + bh / 2 + 5}" font-size="14" font-weight="bold">${it.v}${f.unit || ''}</text>`; }).join('')}</svg>`;
  },
  watercycle() {
    const n = (x, y, k) => `<g><circle cx="${x}" cy="${y}" r="15" fill="#4a2f19"/><text x="${x}" y="${y + 6}" font-size="16" fill="#fff" text-anchor="middle" font-weight="bold">${k}</text></g>`;
    return `<svg viewBox="0 0 420 280" role="img" aria-label="Paisagem com mar, nuvens, montanha e rio, com quatro pontos numerados">
      <defs><linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3ef"/><stop offset="1" stop-color="#e2f2f8"/></linearGradient></defs>
      <rect width="420" height="280" fill="url(#wsky)"/><circle cx="50" cy="45" r="24" fill="#f2c14e"/>
      <path d="M0 220 Q60 210 130 222 L130 280 L0 280Z" fill="#2f86a6"/>
      <path d="M120 230 L250 90 L300 140 L420 120 L420 280 L120 280Z" fill="#7fae5a"/><path d="M250 90 L270 110 L240 115Z" fill="#fff"/>
      <path d="M300 160 Q240 200 200 240 Q170 262 130 250" fill="none" stroke="#3f97b5" stroke-width="7"/>
      <g fill="#fff" stroke="#c6d3dd"><ellipse cx="190" cy="60" rx="50" ry="20"/><ellipse cx="225" cy="52" rx="30" ry="18"/><ellipse cx="160" cy="58" rx="28" ry="14"/></g>
      <g stroke="#3f7fc0" stroke-width="2">${[0, 1, 2, 3, 4].map(i => `<line x1="${200 + i * 14}" y1="${85}" x2="${194 + i * 14}" y2="${110}"/>`).join('')}</g>
      <g stroke="#fff" stroke-width="2" stroke-dasharray="3 5" fill="none"><path d="M60 210 q8 -40 0 -80 q-8 -30 30 -60"/><path d="M95 212 q8 -40 0 -80 q-8 -30 40 -70"/></g>
      ${n(40, 195, 'A')}${n(185, 30, 'B')}${n(285, 105, 'C')}${n(190, 255, 'D')}</svg>`;
  },
};
