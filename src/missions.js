// Objetivos do capítulo atual. Uma tarefa pode depender de várias sub-tarefas (needs).
const Missions = {
  chapter() { return CHAPTERS[Progress.state.chapter]; },
  taskDone(t) { return t.needs ? t.needs.every(id => Progress.done(id)) : Progress.done(t.id); },
  count(t) { return t.needs ? ` (${t.needs.filter(id => Progress.done(id)).length}/${t.needs.length})` : ''; },
  current() { return this.chapter().tasks.find(t => !this.taskDone(t)) || null; },
  // id da entidade para onde a seta de objetivo aponta
  target() {
    const t = this.current();
    if (!t) return null;
    if (t.needs) { const i = t.needs.findIndex(id => !Progress.done(id)); return t.targets[i]; }
    return t.target;
  },
  onChange() { UI.updateHUD(true); },
};
