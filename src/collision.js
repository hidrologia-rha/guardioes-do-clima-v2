// Colisões simples: personagem é um círculo; terreno são polígonos; objetos são círculos ou retângulos.
const Collision = {
  pointInPoly(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  },
  distToSegment(px, py, [ax, ay], [bx, by]) {
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  },
  hitsCollider(x, y, r, c) {
    if (c.r) return Math.hypot(x - c.x, y - c.y) < c.r + r;
    const nx = Math.max(c.x, Math.min(x, c.x + c.w)), ny = Math.max(c.y, Math.min(y, c.y + c.h));
    return Math.hypot(x - nx, y - ny) < r;
  },
  blocked(map, x, y, r) {
    if (!map.walkable(x, y, r)) return true;
    return map.colliders.some(c => this.hitsCollider(x, y, r, c));
  },
};
