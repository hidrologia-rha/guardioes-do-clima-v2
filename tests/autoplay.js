// Roteiro de teste automatizado no navegador: joga a campanha usando as mesmas funções da interface.
// Uso (console do navegador, com o jogo aberto via servidor local):
//   await import('/tests/autoplay.js'); await AutoPlay.chapter('cap1');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const until = async (fn, ms = 20000) => { const t0 = Date.now(); while (!fn()) { if (Date.now() - t0 > ms) throw new Error('tempo esgotado'); await sleep(80); } };
const $ = s => document.querySelector('#panel-content ' + s);
const $$ = s => [...document.querySelectorAll('#panel-content ' + s)];
const clickText = (sel, txt) => { const b = $$(sel).find(b => b.textContent.includes(txt)); if (!b) throw new Error('botão não encontrado: ' + txt); b.click(); };
const lastPrimary = () => $$('.btn-primary').pop().click();

const AutoPlay = {
  log: [],
  async talk() { for (let i = 0; i < 60 && Dialogue.active; i++) { if (Dialogue.waitingChoice) document.querySelector('#dlg-choices button').click(); else Dialogue.advance(); await sleep(30); } },

  async quiz(ch, wrongFirst) {
    for (const q of ch.questions) {
      await sleep(60);
      const okT = q.options.find(o => o.ok).t;
      if (wrongFirst) { const w = $$('.opt').find(b => !b.textContent.includes(okT)); if (w) w.click(); await sleep(40); }
      clickText('.opt', okT); await sleep(60); lastPrimary();
    }
  },
  async orografia(lab) {
    $('[data-k="hum"] [data-v="alta"]').click(); $('.run').click();
    for (const st of lab.steps) {
      if (st.until === 'lowObserved') { await until(() => !$('.lab-steps .opt')); $('[data-k="hum"] [data-v="baixa"]').click(); continue; }
      if (st.until) continue;
      await until(() => $('.lab-steps .opt'));
      clickText('.lab-steps .opt', st.quiz.options.find(o => o.ok).t); await sleep(50);
      $$('.lab-steps .btn-primary').pop().click(); await sleep(50);
    }
    await until(() => $('.lab-steps .panel-actions .btn-primary')); $('.lab-steps .panel-actions .btn-primary').click();
  },
  async cidade(lab, plan) {
    const cv = $('canvas'), r = cv.getBoundingClientRect(), rows = lab.grid.length, cols = lab.grid[0].length;
    const tool = k => $(`.tool[data-k="${k}"]`).click();
    const cell = (y, x) => cv.dispatchEvent(new MouseEvent('click', { clientX: r.left + (x + .5) * r.width / cols, clientY: r.top + (y + .5) * r.height / rows }));
    $('.present').click(); await sleep(50); // primeiro: plano vazio deve ser recusado com dica
    this.log.push('dica plano vazio: ' + $('.fb').innerText.slice(0, 60));
    for (const [key, t] of Object.entries(plan)) { tool(t); const [y, x] = key.split(',').map(Number); cell(y, x); await sleep(30); }
    if (lab.goals.rainTest) { $('.rain').click(); await until(() => !$('.rain').disabled, 8000); }
    $('.present').click(); await sleep(80); lastPrimary();
  },
  async solve(wrongFirst) {
    await sleep(120);
    const title = document.getElementById('panel-title').textContent;
    const ch = Object.values(CHALLENGES).find(c => c.title === title), lab = Object.values(LABS).find(l => l.title === title);
    if (lab && lab.type === 'orografia') return this.orografia(lab);
    if (lab && lab.type === 'cidade') return this.cidade(lab, { '0,2': 'trees', '0,3': 'trees', '1,2': 'trees', '1,3': 'trees', '3,1': 'perm', '3,4': 'perm', '0,0': 'roof', '1,0': 'roof' });
    if (!ch) { const go = $('.go'); if (go) return go.click(); throw new Error('painel desconhecido: ' + title); }
    if (ch.type === 'info') return lastPrimary();
    if (ch.type === 'quiz') return this.quiz(ch, wrongFirst);
    if (ch.type === 'sort') {
      for (const card of $$('.sort-cards .card')) {
        const it = ch.items.find(i => i.t === card.querySelector('p').textContent), cat = ch.categories.find(c => c.id === it.cat);
        [...card.querySelectorAll('button')].find(b => b.textContent === (cat.short || cat.label)).click();
      }
      await sleep(60); return lastPrimary();
    }
    if (ch.type === 'order') { for (const it of ch.items) clickText('.order-pool button', it.t); $('.check').click(); await sleep(60); return lastPrimary(); }
    if (ch.type === 'evidence') { for (const b of $$('.opt')) if (b._it.ok) b.click(); $('.check').click(); await sleep(60); return lastPrimary(); }
  },
  // Caminha até a entidade (teleporte curto) e interage até o roteiro terminar.
  async visit(id, wrongFirst) {
    const e = Game.map.entities.find(e => e.id === id);
    const p = Game.player;
    for (const [dx, dy] of [[0, 30], [0, 45], [30, 10], [-30, 10], [0, -30]]) { p.x = e.x + dx; p.y = e.y + dy; if (!Collision.blocked(Game.map, p.x, p.y, p.r)) break; }
    await sleep(60);
    Game.interact(e);
    for (let k = 0; k < 40; k++) {
      await sleep(100);
      if (Dialogue.active) await this.talk();
      else if (UI.modalOpen()) { if ($('.map-wrap')) return; await this.solve(wrongFirst); }
      else if (!Game.busy) return;
    }
  },
  ROUTES: {
    prologo: ['luna', 'painel', 'arquivo', 'luna', 'coracao'],
    cap1: ['luna', 'abrigo', 'pluviometro', 'anemometro', 'joaquim', 'registros', 'luna'],
    cap2: ['luna', 'alt0', 'alt1', 'alt2', 'lab', 'mirante', 'cida', 'luna'],
    cap3: ['luna', 'estF', 'estS', 'soloF', 'soloS', 'iara', 'benedito', 'analise', 'luna'],
    cap4: ['luna', 'mparque', 'mrua', 'mestac', 'luna', 'marina', 'luna'],
    cap5: ['luna', 'console1', 'console2', 'console3', 'coracao'],
  },
  async chapter(id, wrongFirst = false) {
    if (Progress.state.chapter !== id) { Game.travel(id); await sleep(900); }
    await this.talk();
    for (const e of this.ROUTES[id]) await this.visit(e, wrongFirst);
    return { chapter: id, completed: [...Progress.state.completed], missing: Missions.current() && Missions.current().text };
  },
};
window.AutoPlay = AutoPlay;
export default AutoPlay;
