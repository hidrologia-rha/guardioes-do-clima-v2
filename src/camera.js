// Câmera suave que acompanha o personagem e não mostra fora do mapa.
const Camera = {
  x: 0, y: 0, zoom: 1, vw: 1, vh: 1,
  resize(w, h) {
    this.vw = w; this.vh = h;
    this.zoom = Math.max(.55, Math.min(2.4, Math.min(h / 560, w / 760)));
  },
  // em telas altas (celular em pé), aproxima para o mapa preencher a tela
  fit(map) { this.zoom = Math.max(this.zoom, this.vw / map.w, this.vh / map.h); },
  clampTo(tx, ty, map) {
    const hw = this.vw / 2 / this.zoom, hh = this.vh / 2 / this.zoom;
    const cx = map.w <= hw * 2 ? map.w / 2 : Math.max(hw, Math.min(map.w - hw, tx));
    const cy = map.h <= hh * 2 ? map.h / 2 : Math.max(hh, Math.min(map.h - hh, ty));
    return [cx, cy];
  },
  snap(tx, ty, map) { this.fit(map); [this.x, this.y] = this.clampTo(tx, ty, map); },
  follow(tx, ty, map, dt) {
    const [cx, cy] = this.clampTo(tx, ty, map);
    const k = 1 - Math.exp(-dt * 6);
    this.x += (cx - this.x) * k; this.y += (cy - this.y) * k;
  },
  apply(ctx) {
    ctx.setTransform(this.zoom * DPR, 0, 0, this.zoom * DPR, (this.vw / 2 - this.x * this.zoom) * DPR, (this.vh / 2 - this.y * this.zoom) * DPR);
  },
  toScreen(x, y) { return [(x - this.x) * this.zoom + this.vw / 2, (y - this.y) * this.zoom + this.vh / 2]; },
  toWorld(sx, sy) { return [(sx - this.vw / 2) / this.zoom + this.x, (sy - this.vh / 2) / this.zoom + this.y]; },
};
let DPR = Math.min(2, window.devicePixelRatio || 1);
