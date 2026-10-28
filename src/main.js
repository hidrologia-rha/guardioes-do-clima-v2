// Inicialização e tela inicial.
const Main = {
  showTitle() {
    document.getElementById('screen-title').hidden = false;
    document.getElementById('btn-continue').disabled = !Progress.hasSave();
    TitleScene.start();
    document.getElementById('btn-new').focus();
  },
  hideTitle() { document.getElementById('screen-title').hidden = true; TitleScene.stop(); },
  start(chId, pos) {
    Sound.init();
    UI.fade(() => {
      this.hideTitle();
      Game.load(chId, pos);
      const ch = CHAPTERS[chId];
      if (ch.onEnter && !Progress.done(chId + '_entered')) { Progress.complete(chId + '_entered'); Game.runScript(ch.onEnter); }
    });
  },
};

window.addEventListener('DOMContentLoaded', () => {
  applySettings();
  Art.preloadImages();
  Input.init(); UI.init(); Dialogue.init(); Game.init();

  document.getElementById('btn-new').onclick = () => {
    const go = () => { Progress.newGame(); Main.start('prologo'); };
    if (!Progress.hasSave()) return go();
    UI.openModal(root => {
      root.innerHTML = `<h2 id="panel-title">Começar um novo jogo?</h2><p>Já existe uma expedição salva neste navegador. Um novo jogo apaga esse progresso.</p>
        <div class="panel-actions"><button class="btn no">Cancelar</button><button class="btn btn-primary yes">Começar do zero</button></div>`;
      root.querySelector('.no').onclick = () => UI.closeModal();
      root.querySelector('.yes').onclick = () => { UI.closeModal(); go(); };
    }, { narrow: true });
  };
  document.getElementById('btn-continue').onclick = () => {
    if (!Progress.loadSaved()) { UI.toast('Não encontrei um jogo salvo.', '!'); return; }
    Main.start(Progress.state.chapter, Progress.state.pos);
  };
  document.getElementById('btn-settings-title').onclick = () => UI.settings();
  document.getElementById('btn-about').onclick = () => UI.about();
  Main.showTitle();
});
