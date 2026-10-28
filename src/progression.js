// Estado do jogador, recompensas, diário e relatório de aprendizagem.
const Settings = Object.assign({
  music: 0.5, sfx: 0.7, textSpeed: 'normal', reduceMotion: false, captions: true, bigText: false,
}, Persistence.loadSettings() || {});

function applySettings() {
  document.documentElement.classList.toggle('reduce-motion', !!Settings.reduceMotion);
  document.documentElement.classList.toggle('big-text', !!Settings.bigText);
  Persistence.saveSettings(Settings);
  if (typeof Sound !== 'undefined') Sound.applyVolumes();
}

const Progress = {
  state: null,

  fresh() {
    return {
      version: 1, chapter: 'prologo', pos: null,
      tasks: {}, items: [], journal: [], records: {}, attempts: {},
      completed: [], unlocked: ['prologo'], finished: false, startedAt: Date.now(),
    };
  },
  newGame() { this.state = this.fresh(); this.save(); },
  loadSaved() {
    const s = Persistence.load();
    if (!s || s.version !== 1 || !CHAPTERS[s.chapter]) return false;
    this.state = Object.assign(this.fresh(), s);
    return true;
  },
  hasSave() { const s = Persistence.load(); return !!(s && s.version === 1); },
  save() {
    if (!this.state) return false;
    if (typeof Game !== 'undefined' && Game.player) this.state.pos = [Math.round(Game.player.x), Math.round(Game.player.y)];
    return Persistence.save(this.state);
  },

  done(id) { return !!this.state.tasks[id]; },
  complete(id) {
    if (this.state.tasks[id]) return false;
    this.state.tasks[id] = true;
    this.save();
    Missions.onChange();
    return true;
  },
  addItem(id) {
    if (this.state.items.includes(id)) return;
    this.state.items.push(id);
    this.save();
    const it = EDU.items[id];
    UI.toast(`Item recebido: <b>${it.name}</b>`, '✦');
    Sound.sfx('pickup');
  },
  unlockJournal(id) {
    if (this.state.journal.includes(id)) return;
    this.state.journal.push(id);
    this.save();
    UI.toast(`Novo registro no Diário: <b>${EDU.concepts[id].title}</b>`, '✎');
    Sound.sfx('page');
  },
  record(key, value) { this.state.records[key] = value; this.save(); },
  recordAttempt(activityId, errors) {
    const prev = this.state.attempts[activityId];
    // guarda a primeira conclusão: é ela que mostra como foi a descoberta
    if (!prev) this.state.attempts[activityId] = { errors, at: Date.now() };
    this.save();
  },
  completeChapter(id) {
    const s = this.state;
    if (!s.completed.includes(id)) s.completed.push(id);
    const next = CHAPTERS[id].next;
    if (next && !s.unlocked.includes(next)) s.unlocked.push(next);
    this.save();
  },

  // Relatório formativo: só "indícios", nunca "domínio".
  report() {
    const acts = Object.entries(ACTIVITIES).map(([id, a]) => {
      const at = this.state.attempts[id];
      return { id, title: a.title, concepts: a.concepts, done: !!at, errors: at ? at.errors : null };
    });
    const concepts = Object.keys(EDU.concepts).map(cid => {
      const related = acts.filter(a => a.concepts.includes(cid));
      if (!related.length) return null;
      const doneAll = related.every(a => a.done);
      const struggled = related.some(a => a.done && a.errors >= 2);
      const status = !related.some(a => a.done) ? 'todo' : (struggled || !doneAll) ? 'review' : 'good';
      return { id: cid, title: EDU.concepts[cid].title, status, related };
    }).filter(Boolean);
    return { acts, concepts };
  },
};
