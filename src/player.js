// Personagem controlado pelo jogador. Move eixo a eixo para deslizar ao encostar em obstáculos.
class Player {
  constructor(x, y) { this.x = x; this.y = y; this.dir = 'down'; this.walk = 0; this.moving = false; this.speed = 175; this.r = 11; }
  update(dt, map) {
    const a = Input.axis();
    this.moving = !!(a.x || a.y);
    if (!this.moving) { this.walk = 0; return; }
    this.dir = Math.abs(a.x) > Math.abs(a.y) ? (a.x > 0 ? 'right' : 'left') : (a.y > 0 ? 'down' : 'up');
    const nx = this.x + a.x * this.speed * dt, ny = this.y + a.y * this.speed * dt;
    if (!Collision.blocked(map, nx, this.y, this.r)) this.x = nx;
    if (!Collision.blocked(map, this.x, ny, this.r)) this.y = ny;
    this.walk += dt * 11;
  }
  draw(ctx, t) { Art.character(ctx, 'player', this.x, this.y, this.dir, this.walk, t); }
}
