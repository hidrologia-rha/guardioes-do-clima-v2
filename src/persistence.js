// Salvamento local (LocalStorage). Toda leitura/escrita protegida: modo privado ou armazenamento bloqueado não quebram o jogo.
const Persistence = {
  KEY: 'guardioes-clima-save-v1',
  SKEY: 'guardioes-clima-settings-v1',
  read(key) {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  },
  write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  },
  load() { return this.read(this.KEY); },
  save(state) { return this.write(this.KEY, state); },
  clear() { try { localStorage.removeItem(this.KEY); } catch (e) { /* sem armazenamento */ } },
  loadSettings() { return this.read(this.SKEY); },
  saveSettings(s) { return this.write(this.SKEY, s); },
};
