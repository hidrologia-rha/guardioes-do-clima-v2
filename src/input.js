// Teclado + joystick virtual. "pressed" guarda toques únicos até o fim do quadro.
const Input = {
  keys: new Set(), pressed: new Set(), joy: { x: 0, y: 0 }, touch: false,

  init() {
    const typing = e => /INPUT|SELECT|TEXTAREA/.test(e.target.tagName);
    addEventListener('keydown', e => {
      if (typing(e)) return;
      const k = e.key.toLowerCase();
      if (!this.keys.has(k)) this.pressed.add(k);
      this.keys.add(k);
      if (Game.mode === 'play' && !UI.modalOpen() && /^(arrow\w+| )$/.test(k)) e.preventDefault();
      Sound.init();
    });
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => this.keys.clear());
    addEventListener('pointerdown', () => Sound.init(), { once: false, passive: true });

    this.touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const stick = document.getElementById('stick'), knob = document.getElementById('knob');
    let id = null;
    const move = e => {
      const r = stick.getBoundingClientRect();
      let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
      this.joy = { x: Math.abs(x) < .15 ? 0 : x, y: Math.abs(y) < .15 ? 0 : y };
      knob.style.transform = `translate(${x * 40}px, ${y * 40}px)`;
    };
    stick.addEventListener('pointerdown', e => { id = e.pointerId; try { stick.setPointerCapture(id); } catch (err) { /* ponteiro já liberado */ } move(e); });
    stick.addEventListener('pointermove', e => { if (e.pointerId === id) move(e); });
    const end = () => { id = null; this.joy = { x: 0, y: 0 }; knob.style.transform = ''; };
    stick.addEventListener('pointerup', end); stick.addEventListener('pointercancel', end);
    document.getElementById('btn-act').addEventListener('pointerdown', e => { e.preventDefault(); this.pressed.add('e'); });
  },
  showTouch(on) { document.getElementById('touch').hidden = !(on && this.touch); },
  axis() {
    const k = this.keys;
    let x = (k.has('arrowright') || k.has('d') ? 1 : 0) - (k.has('arrowleft') || k.has('a') ? 1 : 0) + this.joy.x;
    let y = (k.has('arrowdown') || k.has('s') ? 1 : 0) - (k.has('arrowup') || k.has('w') ? 1 : 0) + this.joy.y;
    const l = Math.hypot(x, y);
    if (l > 1) { x /= l; y /= l; }
    return { x, y };
  },
  consume(...names) {
    for (const n of names) if (this.pressed.has(n)) { this.pressed.delete(n); return true; }
    return false;
  },
  endFrame() { this.pressed.clear(); },
};
