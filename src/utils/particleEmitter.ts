// Particle types and global emitter for high-performance canvas effects

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity?: number;
  shape?: 'circle' | 'square' | 'spark';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  size: number;
}

export interface ElectricArc {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
  color: string;
}

class ParticleManager {
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private electricArcs: ElectricArc[] = [];
  private isFreezing: boolean = false;

  public setFreezing(freezing: boolean) {
    this.isFreezing = freezing;
  }

  // 1. Sparks on correct letter hit
  public emitLetterHitSparks(x: number, y: number, color: string = '#00f0ff') {
    const count = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        color,
        alpha: 1,
        decay: 2.2 + Math.random() * 1.5,
        gravity: 40,
        shape: 'spark',
      });
    }
  }

  // 2. Neon explosion on enemy defeated
  public emitExplosion(x: number, y: number, primaryColor: string = '#00f0ff') {
    const count = 30 + Math.floor(Math.random() * 15);
    const palette = [primaryColor, '#ffffff', '#ffaa00', '#00ff66', '#ff007f'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 260;
      const col = palette[Math.floor(Math.random() * palette.length)];
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: col,
        alpha: 1,
        decay: 1.2 + Math.random() * 1.2,
        gravity: 80,
        shape: Math.random() > 0.5 ? 'circle' : 'square',
      });
    }
  }

  // 3. Floating Reward text (+25G, +150 PTS)
  public emitFloatingText(x: number, y: number, text: string, color: string = '#ffaa00', size: number = 18) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      x: x + (Math.random() - 0.5) * 20,
      y,
      text,
      color,
      alpha: 1,
      vy: -55,
      size,
    });
  }

  // 4. Tesla electric arc
  public emitElectricArc(x1: number, y1: number, x2: number, y2: number, color: string = '#a855f7') {
    this.electricArcs.push({
      id: Math.random().toString(),
      x1,
      y1,
      x2,
      y2,
      alpha: 1,
      color,
    });
  }

  // Update and render all particles on canvas
  public updateAndRender(ctx: CanvasRenderingContext2D, width: number, height: number, dt: number) {
    ctx.clearRect(0, 0, width, height);

    // If freezing, occasionally spawn falling ice crystals
    if (this.isFreezing && Math.random() < 0.4) {
      this.particles.push({
        x: Math.random() * width,
        y: -10,
        vx: (Math.random() - 0.5) * 30,
        vy: 40 + Math.random() * 60,
        size: 2 + Math.random() * 3,
        color: '#bae6fd',
        alpha: 0.9,
        decay: 0.25,
        gravity: 0,
        shape: 'spark',
      });
    }

    // Render Electric Arcs
    for (let i = this.electricArcs.length - 1; i >= 0; i--) {
      const arc = this.electricArcs[i];
      arc.alpha -= dt * 4;
      if (arc.alpha <= 0) {
        this.electricArcs.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.strokeStyle = arc.color;
      ctx.shadowColor = arc.color;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      ctx.globalAlpha = arc.alpha;

      ctx.beginPath();
      ctx.moveTo(arc.x1, arc.y1);
      // Lightning zig-zag
      const steps = 5;
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const curX = arc.x1 + (arc.x2 - arc.x1) * t + (Math.random() - 0.5) * 25;
        const curY = arc.y1 + (arc.y2 - arc.y1) * t + (Math.random() - 0.5) * 25;
        ctx.lineTo(curX, curY);
      }
      ctx.lineTo(arc.x2, arc.y2);
      ctx.stroke();
      ctx.restore();
    }

    // Render Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      p.alpha -= p.decay * dt;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      if (p.shape === 'spark') {
        ctx.fillRect(p.x - p.size, p.y - 1, p.size * 2, 2);
      } else if (p.shape === 'square') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Render Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.alpha -= dt * 1.3;

      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `bold ${ft.size}px 'Orbitron', 'JetBrains Mono', sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 10;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  public clear() {
    this.particles = [];
    this.floatingTexts = [];
    this.electricArcs = [];
  }
}

export const particleManager = new ParticleManager();
