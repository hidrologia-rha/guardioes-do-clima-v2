// Interface HTML: HUD, painéis (missões, diário, mochila, mapa, pausa, configurações, relatório) e telas.
const ICONS = {
  flag: '<svg viewBox="0 0 24 24"><path d="M5 21V4" stroke="#4a2f19" stroke-width="2" stroke-linecap="round"/><path d="M6 4h11l-2 4 2 4H6z" fill="#d0402c"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 5c3-1 6-1 8 1v14c-2-2-5-2-8-1z" fill="#2aa39a"/><path d="M20 5c-3-1-6-1-8 1v14c2-2 5-2 8-1z" fill="#176f6c"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="13" rx="4" fill="#8a5a2b"/><path d="M8 8a4 4 0 0 1 8 0" stroke="#4a2f19" stroke-width="2" fill="none"/><rect x="9" y="12" width="6" height="4" rx="1" fill="#f2b33d"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" fill="#f2d9a0" stroke="#7a4f2c" stroke-width="1.5"/><path d="M9 4v14M15 6v14" stroke="#7a4f2c"/><circle cx="17" cy="10" r="2" fill="#d0402c"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" fill="#4a2f19"/><rect x="14" y="5" width="4" height="14" rx="1" fill="#4a2f19"/></svg>',
};
const WICONS = {
  sun: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="7" fill="#f6c94a"/><g stroke="#f6c94a" stroke-width="2.5" stroke-linecap="round">' + [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="${16 + Math.cos(a * Math.PI / 180) * 10}" y1="${16 + Math.sin(a * Math.PI / 180) * 10}" x2="${16 + Math.cos(a * Math.PI / 180) * 14}" y2="${16 + Math.sin(a * Math.PI / 180) * 14}"/>`).join('') + '</g></svg>',
  partly: '<svg viewBox="0 0 32 32"><circle cx="12" cy="12" r="6" fill="#f6c94a"/><ellipse cx="19" cy="20" rx="9" ry="6" fill="#eef3f6"/><ellipse cx="14" cy="21" rx="6" ry="5" fill="#fff"/></svg>',
  cloud: '<svg viewBox="0 0 32 32"><ellipse cx="17" cy="17" rx="11" ry="7" fill="#cfd8de"/><ellipse cx="12" cy="18" rx="7" ry="6" fill="#e8eef2"/></svg>',
  rain: '<svg viewBox="0 0 32 32"><ellipse cx="17" cy="12" rx="11" ry="7" fill="#b9c4cc"/><g stroke="#7cc4e8" stroke-width="2.5" stroke-linecap="round"><line x1="10" y1="21" x2="8" y2="27"/><line x1="16" y1="21" x2="14" y2="27"/><line x1="22" y1="21" x2="20" y2="27"/></g></svg>',
  fog: '<svg viewBox="0 0 32 32"><g stroke="#e8eef2" stroke-width="3" stroke-linecap="round"><line x1="5" y1="11" x2="27" y2="11"/><line x1="8" y1="17" x2="24" y2="17"/><line x1="5" y1="23" x2="27" y2="23"/></g></svg>',
  wind: '<svg viewBox="0 0 32 32"><g stroke="#e8eef2" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M4 12h16a4 4 0 1 0-4-4"/><path d="M4 18h21a3.5 3.5 0 1 1-3.5 3.5"/><path d="M4 24h10"/></g></svg>',
};

const UI = {
  modalClose: null,

  init() {
    document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = ICONS[el.dataset.icon]);
    document.querySelectorAll('.hud-btn').forEach(b => b.onclick = () => { Sound.sfx('open'); this.panel(b.dataset.panel); });
    document.getElementById('panel-close').onclick = () => this.closeModal();
    document.getElementById('modal').addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); this.closeModal(); } });
  },
  modalOpen() { return !document.getElementById('modal').hidden; },
  openModal(build, opts = {}) {
    if (this.modalOpen()) this.closeModal();
    const m = document.getElementById('modal'), panel = m.querySelector('.panel'), root = document.getElementById('panel-content');
    panel.classList.toggle('narrow', !!opts.narrow);
    document.getElementById('panel-close').hidden = opts.closable === false;
    this.modalClose = opts.onClose || null;
    this.modalClosable = opts.closable !== false;
    root.innerHTML = '';
    m.hidden = false;
    build(root);
    panel.scrollTop = 0;
    const f = root.querySelector('button, [tabindex]'); if (f && !opts.noFocus) f.focus({ preventScroll: true });
  },
  closeModal(force) {
    if (!this.modalOpen() || (!this.modalClosable && !force)) return;
    document.getElementById('modal').hidden = true;
    document.getElementById('panel-content').innerHTML = '';
    const cb = this.modalClose; this.modalClose = null;
    if (cb) cb();
  },
  toast(html, ico = '★') {
    const t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = `<span class="t-ico" aria-hidden="true">${ico}</span><span>${html}</span>`;
    document.getElementById('toasts').appendChild(t);
    setTimeout(() => t.remove(), 3800);
  },
  caption(text) {
    const el = document.createElement('div'); el.className = 'caption'; el.textContent = `[${text}]`;
    const box = document.getElementById('captions'); box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => el.remove(), 2400);
  },
  fade(fn) {
    const f = document.getElementById('fade');
    f.classList.add('on');
    setTimeout(() => { fn(); setTimeout(() => f.classList.remove('on'), 80); }, 460);
  },
  showHUD(on) { document.getElementById('hud').hidden = !on; Input.showTouch(on); },
  updateHUD(pulse) {
    const ch = Missions.chapter();
    document.getElementById('hud-chapter').textContent = `${ch.label} · ${ch.title}`;
    const t = Missions.current();
    document.getElementById('hud-objective').textContent = t ? t.text + Missions.count(t) : (ch.next ? 'Capítulo concluído! Abra o mapa (M) para seguir viagem.' : 'Campanha concluída! Explore à vontade.');
    if (pulse) { const o = document.querySelector('.hud-objective'); o.classList.remove('pulse'); void o.offsetWidth; o.classList.add('pulse'); }
  },
  setWeather(d) { document.getElementById('hud-weather').innerHTML = `${WICONS[d.icon]}<span><b>Tempo agora:</b> ${d.text}</span>`; },

  panel(name) {
    if (Game.busy && name !== 'pause') return;
    ({ missions: () => this.missions(), journal: () => this.journal(), inventory: () => this.inventory(), map: () => this.map(), pause: () => this.pause() })[name]();
  },

  missions() {
    const ch = Missions.chapter(), cur = Missions.current();
    this.openModal(root => {
      root.innerHTML = `<span class="tag">${ch.label}</span><h2 id="panel-title">${ch.title}</h2><p class="lead">${ch.synopsis}</p>
        <h3>Missões</h3><ul class="task-list">${ch.tasks.map(t => {
          const done = Missions.taskDone(t), now = t === cur;
          return `<li class="${done ? 'done' : now ? 'current' : ''}"><span class="task-mark">${done ? '✓' : now ? '▶' : '○'}</span><span>${t.text}${Missions.count(t)}${now ? ' <small>(objetivo atual — siga a seta dourada)</small>' : ''}</span></li>`;
        }).join('')}</ul>
        <h3>Campanha</h3><ul class="task-list">${CHAPTER_ORDER.map(id => {
          const c = CHAPTERS[id], s = Progress.state;
          const st = s.completed.includes(id) ? '✓' : s.unlocked.includes(id) ? '▶' : '🔒︎';
          return `<li class="${s.completed.includes(id) ? 'done' : ''}"><span class="task-mark">${st}</span><span>${c.label}: ${c.title}</span></li>`;
        }).join('')}</ul>`;
    });
  },

  journal(selected) {
    const s = Progress.state;
    const ids = Object.keys(EDU.concepts);
    let cur = selected || s.journal[s.journal.length - 1] || 'records';
    this.openModal(root => {
      const draw = () => {
        let idx = `<button data-id="records" aria-current="${cur === 'records'}">📋︎ Registros de campo</button>`, last = '';
        for (const id of ids) {
          const c = EDU.concepts[id];
          if (c.chapter !== last) { idx += `<div class="jchap">${CHAPTERS[c.chapter].label}</div>`; last = c.chapter; }
          const has = s.journal.includes(id);
          idx += `<button data-id="${id}" ${has ? '' : 'disabled'} aria-current="${cur === id}">${has ? c.title : '??? — descubra jogando'}</button>`;
        }
        let page;
        if (cur === 'records') {
          const rec = Object.entries(s.records);
          page = `<h3>Registros de campo</h3><p class="lead">Medições que você fez durante a expedição (dados fictícios didáticos).</p>
            ${rec.length ? `<table class="records-table"><tr><th>Onde</th><th>Medição</th></tr>${rec.map(([k, v]) => `<tr><td>${EDU.records[k] || k}</td><td>${v}</td></tr>`).join('')}</table>` : '<p>Nenhuma medição ainda. Examine instrumentos para registrar dados.</p>'}`;
        } else {
          const c = EDU.concepts[cur];
          page = `<span class="tag">Conceito</span><h3>${c.title}</h3>${c.text}${c.figure ? Figures.html(c.figure) : ''}`;
        }
        root.innerHTML = `<h2 id="panel-title">Diário científico</h2><div class="journal"><nav class="journal-index" aria-label="Conceitos">${idx}</nav><article class="journal-page">${page}</article></div>
          <p class="fict">${s.journal.length} de ${ids.length} conceitos registrados.</p>`;
        root.querySelectorAll('.journal-index button').forEach(b => b.onclick = () => { cur = b.dataset.id; Sound.sfx('page'); draw(); root.querySelector(`[data-id="${cur}"]`).focus(); });
      };
      draw();
    });
  },

  inventory() {
    this.openModal(root => {
      root.innerHTML = `<h2 id="panel-title">Mochila</h2><p class="lead">Os módulos recuperados vão religar o Coração do Clima.</p><div class="inv-grid"></div>`;
      const g = root.querySelector('.inv-grid');
      for (const [id, it] of Object.entries(EDU.items)) {
        const has = Progress.state.items.includes(id);
        const d = document.createElement('div'); d.className = 'inv-item' + (has ? '' : ' locked');
        d.innerHTML = `<canvas width="192" height="192" aria-hidden="true"></canvas><b>${has ? it.name : '???'}</b><small>${has ? it.desc : 'Ainda não encontrado.'}</small>`;
        Art.icon(d.querySelector('canvas'), id);
        g.appendChild(d);
      }
    });
  },

  map(forced) {
    const s = Progress.state;
    const POS = { prologo: [450, 360], cap1: [205, 175], cap2: [790, 160], cap3: [225, 455], cap4: [795, 455], cap5: [545, 300] };
    const blob = (cx, cy, rx, ry, seed) => {
      const r = Art.rng(seed), n = 14, pts = [];
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = .78 + r() * .35; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
      let d = `M${(pts[0][0] + pts[n - 1][0]) / 2},${(pts[0][1] + pts[n - 1][1]) / 2}`;
      pts.forEach((p, i) => { const q = pts[(i + 1) % n]; d += ` Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)},${((p[1] + q[1]) / 2).toFixed(1)}`; });
      return d + 'Z';
    };
    const island = (cx, cy, rx, ry, seed, fill) => `<path d="${blob(cx, cy, rx + 16, ry + 14, seed)}" fill="#e9d6a0" opacity=".9"/><path d="${blob(cx, cy, rx, ry, seed)}" fill="${fill}" stroke="#5b7a3a" stroke-width="2"/>`;
    const peaks = (x, y, n) => Array.from({ length: n }, (_, i) => `<path d="M${x + i * 26 - 20} ${y + 18} L${x + i * 26} ${y - 22} L${x + i * 26 + 20} ${y + 18}Z" fill="#8a8272"/><path d="M${x + i * 26 - 7} ${y - 8} L${x + i * 26} ${y - 22} L${x + i * 26 + 7} ${y - 8}Z" fill="#fff"/>`).join('');
    const trees = (x, y, n, col) => Array.from({ length: n }, (_, i) => `<circle cx="${x + (i % 4) * 16}" cy="${y + Math.floor(i / 4) * 13}" r="9" fill="${col}"/>`).join('');
    const svg = `<svg viewBox="0 0 1000 600" role="img" aria-label="Mapa do arquipélago de Aurora">
      <defs><radialGradient id="sea" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#5fb4cf"/><stop offset="1" stop-color="#1d5f80"/></radialGradient></defs>
      <rect width="1000" height="600" fill="url(#sea)"/>
      ${Array.from({ length: 40 }, (_, i) => `<path d="M${(i * 137) % 980} ${(i * 89) % 590} q8 -5 16 0 t16 0" stroke="#bfe6f0" stroke-opacity=".45" fill="none" stroke-width="2"/>`).join('')}
      ${island(450, 335, 130, 95, 3, '#7fae5a')}${island(205, 175, 120, 80, 8, '#86b860')}
      ${island(790, 165, 140, 90, 11, '#7a9f56')}${island(225, 460, 135, 85, 21, '#6f9a4a')}${island(800, 455, 130, 85, 5, '#a3a58e')}
      <path d="${blob(270, 465, 60, 60, 4)}" fill="#c9a86a" opacity=".85"/>
      ${peaks(760, 150, 4)}${trees(160, 440, 8, '#2f6a2a')}${trees(170, 150, 4, '#3f7a32')}
      ${[[760, 430], [790, 440], [820, 425], [845, 445], [775, 470], [810, 475]].map(([x, y]) => `<rect x="${x}" y="${y - 22}" width="20" height="30" fill="#c9b79a" stroke="#6a5a4a"/>`).join('')}
      <g fill="none" stroke="#fff3c8" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round">
        <path d="M450 360 Q300 260 205 175"/><path d="M205 175 Q500 80 790 160"/><path d="M790 160 Q500 330 225 455"/><path d="M225 455 Q520 560 795 455"/><path d="M795 455 Q700 330 545 300"/></g>
      <g transform="translate(930 80)"><circle r="34" fill="#f6ecd4" stroke="#7a4f2c" stroke-width="2"/><path d="M0 -28 L7 0 L0 28 L-7 0Z" fill="#b5452f"/><path d="M0 0 L7 0 L0 28 L-7 0Z" fill="#4a2f19"/><text y="-36" text-anchor="middle" font-size="14" font-weight="bold" fill="#fff">N</text></g>
      <text x="40" y="570" font-family="Palatino Linotype, Georgia, serif" font-size="30" fill="#fff3c8">Arquipélago de Aurora</text>
      ${CHAPTER_ORDER.map(id => {
        const [x, y] = POS[id], c = CHAPTERS[id];
        const done = s.completed.includes(id), open = s.unlocked.includes(id);
        const col = done ? '#f2b33d' : open ? '#24948d' : '#8a8a8a';
        return `<g class="map-node ${open ? '' : 'locked'}" data-id="${id}" tabindex="0" role="button" aria-label="${c.title}: ${done ? 'concluído' : open ? 'disponível' : 'bloqueado'}">
          ${open && !done ? `<circle r="26" cx="${x}" cy="${y}" fill="none" stroke="#bff8ef" stroke-width="3"><animate attributeName="r" values="22;34;22" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite"/></circle>` : ''}
          <circle class="ring" r="20" cx="${x}" cy="${y}" fill="${col}" stroke="#fff" stroke-width="3"/>
          <text x="${x}" y="${y + 6}" text-anchor="middle" font-size="16" font-weight="bold" fill="#fff">${done ? '✓' : open ? c.mapNum : ''}</text>
          ${open ? '' : `<path d="M${x - 7} ${y - 1}h14v10h-14z M${x - 4} ${y - 1}v-4a4 4 0 0 1 8 0v4" fill="#fff" stroke="#fff" stroke-width="1.5"/>`}
          <rect x="${x - 95}" y="${y + 26}" width="190" height="26" rx="13" fill="rgba(246,236,212,.92)" stroke="#7a4f2c"/>
          <text x="${x}" y="${y + 44}" text-anchor="middle" font-size="14" fill="#2c2116" font-weight="bold">${c.title}</text></g>`;
      }).join('')}</svg>`;
    this.openModal(root => {
      root.innerHTML = `<h2 id="panel-title">Mapa do arquipélago</h2><p class="lead">${forced ? 'Escolha o próximo destino da expedição.' : 'Toque em um local disponível para viajar. Seu progresso fica salvo.'}</p>
        <div class="map-wrap">${svg}</div><div class="map-legend"><span>● dourado: concluído</span><span>● verde-azulado: disponível</span><span>● cinza com cadeado: bloqueado</span></div>`;
      root.querySelectorAll('.map-node').forEach(n => {
        const go = () => {
          const id = n.dataset.id;
          if (!s.unlocked.includes(id)) { this.toast('Esse lugar ainda está bloqueado. Conclua os capítulos anteriores.', '🔒︎'); return; }
          this.closeModal(); Game.travel(id);
        };
        n.addEventListener('click', go);
        n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
    });
  },

  pause() {
    this.openModal(root => {
      root.innerHTML = `<h2 id="panel-title">Pausa</h2><div class="pause-menu">
        <button class="btn btn-primary" data-a="resume">Continuar jogando</button>
        <button class="btn" data-a="save">Salvar agora</button>
        <button class="btn" data-a="settings">Configurações</button>
        <button class="btn" data-a="report">Relatório de aprendizagem</button>
        <button class="btn" data-a="help">Controles</button>
        <button class="btn btn-ghost" data-a="menu" style="color:var(--wood-dark);border-color:var(--wood)">Voltar ao menu inicial</button></div>
        <p class="fict" style="text-align:center">O jogo salva sozinho a cada missão concluída.</p>`;
      root.querySelector('.pause-menu').onclick = e => {
        const a = e.target.dataset.a; if (!a) return;
        if (a === 'resume') this.closeModal();
        if (a === 'save') { this.toast(Progress.save() ? 'Jogo salvo neste navegador.' : 'Não foi possível salvar (armazenamento bloqueado).', '💾︎'); }
        if (a === 'settings') this.settings(() => this.pause());
        if (a === 'report') this.report();
        if (a === 'help') this.help();
        if (a === 'menu') { Progress.save(); this.closeModal(); Game.toTitle(); }
      };
    }, { narrow: true });
  },

  help() {
    this.openModal(root => {
      root.innerHTML = `<h2 id="panel-title">Controles</h2><div class="help-keys">
        <kbd>W A S D</kbd><span>ou setas: andar</span><kbd>E</kbd><span>ou Espaço / Enter: conversar, examinar e avançar diálogos</span>
        <kbd>Q</kbd><span>Missões</span><kbd>J</kbd><span>Diário científico</span><kbd>I</kbd><span>Mochila</span><kbd>M</kbd><span>Mapa</span><kbd>Esc</kbd><span>Pausa / fechar janela</span></div>
        <p>Em telas de toque, use o controle circular para andar e o botão <b>E</b> para interagir.</p>
        <p>A <b>seta dourada</b> mostra onde está o próximo objetivo.</p>`;
    }, { narrow: true });
  },

  settings(back) {
    this.openModal(root => {
      root.innerHTML = `<h2 id="panel-title">Configurações</h2><div class="settings">
        <label>Música e sons do ambiente <input type="range" min="0" max="1" step=".05" data-k="music" value="${Settings.music}"></label>
        <label>Efeitos sonoros <input type="range" min="0" max="1" step=".05" data-k="sfx" value="${Settings.sfx}"></label>
        <label>Velocidade do texto <select data-k="textSpeed">${[['slow', 'Lenta'], ['normal', 'Normal'], ['fast', 'Rápida'], ['instant', 'Instantânea']].map(([v, l]) => `<option value="${v}" ${Settings.textSpeed === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label>Legendas para sons <input type="checkbox" data-k="captions" ${Settings.captions ? 'checked' : ''}></label>
        <label>Texto maior <input type="checkbox" data-k="bigText" ${Settings.bigText ? 'checked' : ''}></label>
        <label>Reduzir animações <input type="checkbox" data-k="reduceMotion" ${Settings.reduceMotion ? 'checked' : ''}></label></div>
        <div class="panel-actions"><button class="btn btn-primary ok">Pronto</button></div>`;
      root.querySelectorAll('[data-k]').forEach(el => el.addEventListener('input', () => {
        Settings[el.dataset.k] = el.type === 'checkbox' ? el.checked : el.type === 'range' ? +el.value : el.value;
        applySettings();
      }));
      root.querySelector('.ok').onclick = () => back ? back() : this.closeModal();
    }, { narrow: true });
  },

  about() {
    this.openModal(root => {
      root.innerHTML = `<h2 id="panel-title">Para professores</h2>
        <p><b>Guardiões do Clima</b> é uma aventura de exploração para o 6º ano. O estudante investiga fenômenos, lê instrumentos, faz experimentos e usa evidências para decidir — em vez de apenas responder perguntas.</p>
        <h3>Habilidades da BNCC trabalhadas</h3><ul>${EDU.bncc.map(b => `<li><b>${b.code}</b> — ${b.text}</li>`).join('')}</ul>
        <h3>Como funciona</h3><p>Prólogo + 5 capítulos (cerca de 60–90 minutos no total). Erros geram pistas e novas tentativas, sem punição. O progresso fica salvo no próprio navegador, sem cadastro e sem internet.</p>
        <p>Ao final há um <b>relatório formativo</b> (também disponível no menu de pausa) com atividades concluídas, conceitos que merecem revisão e sugestões de estudo.</p>
        <p class="fict">Todos os dados meteorológicos e as regiões do arquipélago são fictícios e simplificados para fins didáticos. A documentação completa está na pasta <code>docs/</code>.</p>`;
    });
  },

  chapterComplete(ch, onNext) {
    this.openModal(root => {
      root.innerHTML = `<div class="reward-card"><span class="tag">${ch.label} concluído</span><h2 id="panel-title" style="margin-right:0">${ch.title}</h2>
        <canvas width="320" height="320" aria-hidden="true"></canvas><p><b>${EDU.items[ch.reward].name}</b> recuperado!</p>
        <p class="lead">${ch.outro}</p><div class="concepts">${ch.concepts.map(c => `<span class="tag">${EDU.concepts[c].title}</span>`).join('')}</div>
        <div class="panel-actions" style="justify-content:center"><button class="btn btn-sun j">Ver diário</button><button class="btn btn-primary go">${ch.next ? 'Abrir o mapa ▸' : 'Continuar ▸'}</button></div></div>`;
      Art.icon(root.querySelector('canvas'), ch.reward);
      root.querySelector('.go').onclick = () => { this.closeModal(); onNext(); };
      root.querySelector('.j').onclick = () => this.journal(ch.concepts[0]);
    }, { narrow: true });
  },

  report() {
    const rep = Progress.report();
    const statusTxt = { good: 'Bons indícios de compreensão', review: 'Vale revisar', todo: 'Ainda não praticado' };
    this.openModal(root => {
      root.innerHTML = `<span class="tag">Relatório formativo</span><h2 id="panel-title">Relatório de aprendizagem</h2>
        <p class="report-note">Este relatório mostra <b>pistas</b> do que aconteceu durante o jogo. Concluir uma atividade não significa dominar o conteúdo: converse com seu professor ou sua professora e continue estudando.</p>
        <div class="report-section"><h3>Atividades</h3><ul class="report-list">${rep.acts.map(a => `<li class="${!a.done ? 'todo' : a.errors >= 2 ? 'review' : 'good'}">${a.done ? '✓' : '○'} <b>${a.title}</b> — ${!a.done ? 'não realizada' : a.errors === 0 ? 'concluída sem precisar de dicas' : `concluída após ${a.errors} ${a.errors === 1 ? 'dica' : 'dicas'}`}</li>`).join('')}</ul></div>
        <div class="report-section"><h3>Conceitos</h3><ul class="report-list">${rep.concepts.map(c => `<li class="${c.status}"><b>${c.title}</b>: ${statusTxt[c.status]}</li>`).join('')}</ul></div>
        <div class="report-section"><h3>Recomendações de estudo</h3><ul class="report-list">${(() => {
          const recs = rep.concepts.filter(c => c.status !== 'good').map(c => `<li class="review"><b>${c.title}:</b> ${EDU.concepts[c.id].review}</li>`);
          return (recs.length ? recs : [`<li class="good">Você concluiu as atividades com poucas dicas. Para aprofundar: ${EDU.extraStudy}</li>`]).join('');
        })()}</ul></div>
        <div class="panel-actions"><button class="btn print">Imprimir / salvar PDF</button><button class="btn btn-primary ok">Fechar</button></div>`;
      root.querySelector('.print').onclick = () => window.print();
      root.querySelector('.ok').onclick = () => this.closeModal();
    });
  },

  showEnd() {
    let el = document.getElementById('screen-end');
    if (!el) { el = document.createElement('section'); el.id = 'screen-end'; el.className = 'screen'; document.body.appendChild(el); }
    el.hidden = false;
    el.innerHTML = `<div class="end-box"><span class="tag">Fim da campanha</span><h2>O Coração do Clima voltou a bater!</h2>
      ${EDU.ending.map(p => `<p>${p}</p>`).join('')}
      <div class="panel-actions" style="justify-content:center"><button class="btn btn-sun rep">Relatório de aprendizagem</button><button class="btn btn-primary cont">Continuar explorando</button><button class="btn menu">Menu inicial</button></div></div>`;
    el.querySelector('.rep').onclick = () => this.report();
    el.querySelector('.cont').onclick = () => { el.hidden = true; this.showHUD(true); };
    el.querySelector('.menu').onclick = () => { el.hidden = true; Game.toTitle(); };
  },
};

// Fundo animado da tela inicial: arquipélago ao entardecer.
const TitleScene = {
  raf: null,
  start() {
    const cv = document.getElementById('title-bg'), c = cv.getContext('2d');
    const r = Art.rng(42);
    const clouds = Array.from({ length: 7 }, () => ({ x: r(), y: .08 + r() * .3, s: .6 + r() * .8, v: .004 + r() * .006 }));
    const birds = Array.from({ length: 5 }, () => ({ x: r(), y: .2 + r() * .2, ph: r() * 6 }));
    const frame = now => {
      const t = now / 1000, W = cv.width = innerWidth, H = cv.height = innerHeight;
      c.fillStyle = Art.lin(c, 0, 0, 0, H, '#3c6f9a', '#e9a66a', '#f6d28a'); c.fillRect(0, 0, W, H);
      Art.soft(c, W * .72, H * .5, H * .5, 'rgba(255,230,160,.9)'); Art.ell(c, W * .72, H * .52, H * .07, H * .07, '#fff1c4');
      for (const cl of clouds) {
        const x = ((cl.x + t * cl.v) % 1.3) * W * 1.1 - W * .2, y = cl.y * H;
        for (let k = 0; k < 5; k++) Art.ell(c, x + k * 40 * cl.s, y + Math.sin(k * 2) * 8 * cl.s, 60 * cl.s, 26 * cl.s, `rgba(255,${235 - k * 6},${215 - k * 10},.55)`);
      }
      const hz = H * .62;
      c.fillStyle = Art.lin(c, 0, hz, 0, H, '#d38a5a', '#2c5f7c', '#173f58'); c.fillRect(0, hz, W, H - hz);
      for (let i = 0; i < 60; i++) { const x = (i * 97.3 + t * 12) % W, y = hz + 8 + (i * 31) % (H - hz); c.fillStyle = `rgba(255,220,170,${.15 + .25 * Math.max(0, Math.sin(t * 2 + i))})`; c.fillRect(x, y, 18, 2); }
      const isl = (cx, w, h, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(cx - w, hz + 2); c.quadraticCurveTo(cx - w * .5, hz - h, cx, hz - h * 1.1); c.quadraticCurveTo(cx + w * .4, hz - h * .8, cx + w, hz + 2); c.fill(); };
      isl(W * .15, W * .2, H * .12, '#5a6f6a'); isl(W * .88, W * .18, H * .22, '#4d5e5c');
      isl(W * .5, W * .35, H * .08, '#2f4a3a');
      c.fillStyle = '#2f4a3a'; Art.ell(c, W * .5, hz - H * .09, W * .03, H * .045, '#3f6f80'); c.fillRect(W * .5 - 1.5, hz - H * .2, 3, H * .07);
      for (const b of birds) { const x = ((b.x + t * .02) % 1.2) * W, y = b.y * H + Math.sin(t + b.ph) * 10, f = Math.sin(t * 7 + b.ph) * 5; c.strokeStyle = '#2c2a28'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 9, y - f); c.quadraticCurveTo(x - 3, y - 3, x, y); c.quadraticCurveTo(x + 3, y - 3, x + 9, y - f); c.stroke(); }
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  },
  stop() { cancelAnimationFrame(this.raf); },
};
