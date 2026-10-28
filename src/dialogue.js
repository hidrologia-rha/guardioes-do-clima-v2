// Caixa de diálogo com retrato, efeito máquina de escrever, *destaques* e escolhas.
const Dialogue = {
  active: false, lines: [], idx: 0, resolve: null, segs: [], total: 0, shown: 0, waitingChoice: false,
  el: null,

  init() {
    this.el = document.getElementById('dialogue');
    this.el.addEventListener('click', e => { if (!e.target.closest('.dlg-choices')) this.advance(); });
  },
  play(idOrLines) {
    const lines = typeof idOrLines === 'string' ? DIALOGUES[idOrLines] : idOrLines;
    if (!lines) { console.warn('Diálogo inexistente', idOrLines); return Promise.resolve(); }
    return new Promise(res => {
      this.lines = lines.slice(); this.idx = 0; this.resolve = res; this.active = true;
      this.el.hidden = false;
      this.show();
    });
  },
  show() {
    const line = this.lines[this.idx];
    const ch = Art.CHARS[line.who];
    document.getElementById('dlg-name').textContent = line.name || (ch ? ch.name : 'Caderno de campo');
    Art.portrait(document.getElementById('portrait'), line.who);
    // "*texto*" vira destaque
    this.segs = line.text.split('*').map((t, i) => ({ t, b: i % 2 === 1 }));
    this.total = this.segs.reduce((s, x) => s + x.t.length, 0);
    this.shown = Settings.textSpeed === 'instant' ? this.total : 0;
    this.waitingChoice = false;
    document.getElementById('dlg-choices').innerHTML = '';
    document.getElementById('dlg-next').hidden = true;
    if (line.journal) Progress.unlockJournal(line.journal);
    this.render();
  },
  render() {
    let left = Math.floor(this.shown), html = '';
    for (const s of this.segs) {
      const part = s.t.slice(0, Math.max(0, left)); left -= s.t.length;
      const safe = part.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      html += s.b ? `<strong>${safe}</strong>` : safe;
    }
    document.getElementById('dlg-text').innerHTML = html;
    if (this.shown >= this.total) this.finishLine();
  },
  finishLine() {
    const line = this.lines[this.idx];
    if (line.choices && !this.waitingChoice) {
      this.waitingChoice = true;
      const box = document.getElementById('dlg-choices');
      line.choices.forEach((c, i) => {
        const b = document.createElement('button');
        b.className = 'btn btn-small'; b.textContent = `${i + 1}. ${c.text}`;
        b.onclick = () => { this.lines.splice(this.idx + 1, 0, ...c.reply); this.waitingChoice = false; box.innerHTML = ''; this.next(); };
        box.appendChild(b);
      });
      box.querySelector('button').focus();
    } else if (!line.choices) document.getElementById('dlg-next').hidden = false;
  },
  update(dt) {
    if (!this.active || this.shown >= this.total) return;
    const speed = { slow: 28, normal: 50, fast: 95 }[Settings.textSpeed] || 50;
    const before = Math.floor(this.shown);
    this.shown = Math.min(this.total, this.shown + dt * speed);
    if (Math.floor(this.shown) !== before) { if (before % 4 === 0) Sound.sfx('talk'); this.render(); }
  },
  advance() {
    if (!this.active) return;
    if (this.shown < this.total) { this.shown = this.total; this.render(); return; }
    if (this.waitingChoice) return;
    this.next();
  },
  next() {
    this.idx++;
    if (this.idx < this.lines.length) { this.show(); return; }
    this.active = false; this.el.hidden = true;
    const r = this.resolve; this.resolve = null;
    if (r) r();
  },
};
