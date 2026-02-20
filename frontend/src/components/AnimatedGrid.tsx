import { useEffect, useRef } from 'react';

interface LightPulse {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

interface AnimatedGridProps {
  className?: string;
}

const AnimatedGrid = ({ className = '' }: AnimatedGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number>(0);
  const mouse = useRef({ x: -1000, y: -1000 });
  const pulses = useRef<LightPulse[]>([]);
  const time = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const GRID = 60;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawnPulse = () => {
      const horizontal = Math.random() > 0.5;
      const hue = Math.random() > 0.5 ? 217 : 142; // blue or green
      if (horizontal) {
        const row = Math.floor(Math.random() * (h / GRID)) * GRID;
        pulses.current.push({
          x: -20,
          y: row,
          vx: 1.5 + Math.random() * 2,
          vy: 0,
          life: 0,
          maxLife: w / (1.5 + Math.random() * 2),
          size: 2 + Math.random() * 2,
          hue,
        });
      } else {
        const col = Math.floor(Math.random() * (w / GRID)) * GRID;
        pulses.current.push({
          x: col,
          y: -20,
          vx: 0,
          vy: 1.5 + Math.random() * 2,
          life: 0,
          maxLife: h / (1.5 + Math.random() * 2),
          size: 2 + Math.random() * 2,
          hue,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouse.current = { x: -1000, y: -1000 };
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Pre-spawn some pulses
    for (let i = 0; i < 6; i++) spawnPulse();

    const render = () => {
      time.current += 0.016;
      ctx.clearRect(0, 0, w, h);

      const isDark = document.documentElement.classList.contains('dark');
      const baseAlpha = isDark ? 0.08 : 0.06;
      const glowAlpha = isDark ? 0.25 : 0.15;

      // ── Draw grid lines ──────────────────────────────────────
      ctx.lineWidth = 0.5;

      // Vertical lines
      for (let x = 0; x <= w; x += GRID) {
        // Mouse proximity glow
        const dx = Math.abs(x - mouse.current.x);
        const proximity = Math.max(0, 1 - dx / 200);
        const alpha = baseAlpha + proximity * glowAlpha;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.strokeStyle = isDark
          ? `rgba(96, 165, 250, ${alpha})`
          : `rgba(59, 130, 246, ${alpha})`;
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= h; y += GRID) {
        const dy = Math.abs(y - mouse.current.y);
        const proximity = Math.max(0, 1 - dy / 200);
        const alpha = baseAlpha + proximity * glowAlpha;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.strokeStyle = isDark
          ? `rgba(96, 165, 250, ${alpha})`
          : `rgba(59, 130, 246, ${alpha})`;
        ctx.stroke();
      }

      // ── Draw intersection glow near mouse ────────────────────
      if (mouse.current.x > 0) {
        const nearCol = Math.round(mouse.current.x / GRID) * GRID;
        const nearRow = Math.round(mouse.current.y / GRID) * GRID;

        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            const ix = nearCol + dx * GRID;
            const iy = nearRow + dy * GRID;
            const dist = Math.sqrt(
              (ix - mouse.current.x) ** 2 + (iy - mouse.current.y) ** 2
            );
            if (dist < 180) {
              const intensity = (1 - dist / 180) ** 2;
              const radius = 2 + intensity * 4;
              const gradient = ctx.createRadialGradient(ix, iy, 0, ix, iy, radius * 4);
              gradient.addColorStop(0, `rgba(96, 165, 250, ${intensity * 0.8})`);
              gradient.addColorStop(0.5, `rgba(96, 165, 250, ${intensity * 0.2})`);
              gradient.addColorStop(1, 'rgba(96, 165, 250, 0)');

              ctx.beginPath();
              ctx.arc(ix, iy, radius * 4, 0, Math.PI * 2);
              ctx.fillStyle = gradient;
              ctx.fill();

              // Bright dot center
              ctx.beginPath();
              ctx.arc(ix, iy, radius * 0.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(147, 197, 253, ${intensity * 0.9})`;
              ctx.fill();
            }
          }
        }
      }

      // ── Draw ambient intersection pulses (random) ────────────
      const pulsePhase = time.current;
      for (let x = GRID; x < w; x += GRID) {
        for (let y = GRID; y < h; y += GRID) {
          // Only some intersections pulse
          const hash = (x * 7 + y * 13) % 37;
          if (hash > 4) continue;
          const phase = pulsePhase * 0.8 + hash;
          const brightness = (Math.sin(phase) + 1) * 0.5;
          if (brightness < 0.3) continue;

          const a = brightness * (isDark ? 0.35 : 0.2);
          const r = 1.5 + brightness * 2;

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = hash % 2 === 0
            ? `rgba(96, 165, 250, ${a})`
            : `rgba(74, 222, 128, ${a})`;
          ctx.shadowColor = hash % 2 === 0
            ? `rgba(96, 165, 250, ${a})`
            : `rgba(74, 222, 128, ${a})`;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // ── Update & draw light pulses ───────────────────────────
      if (Math.random() < 0.03) spawnPulse();

      pulses.current = pulses.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.x > w + 40 || p.y > h + 40 || p.life > p.maxLife) return false;

        const progress = p.life / p.maxLife;
        const fadeIn = Math.min(progress * 5, 1);
        const fadeOut = Math.max(1 - (progress - 0.7) / 0.3, 0);
        const opacity = Math.min(fadeIn, fadeOut);

        const color = p.hue === 217
          ? `rgba(96, 165, 250, ${opacity * 0.9})`
          : `rgba(74, 222, 128, ${opacity * 0.9})`;
        const glowColor = p.hue === 217
          ? `rgba(96, 165, 250, ${opacity * 0.5})`
          : `rgba(74, 222, 128, ${opacity * 0.5})`;

        // Glow trail
        const trailLen = p.vx !== 0 ? 40 : 40;
        const gradient = p.vx !== 0
          ? ctx.createLinearGradient(p.x - trailLen, p.y, p.x, p.y)
          : ctx.createLinearGradient(p.x, p.y - trailLen, p.x, p.y);
        gradient.addColorStop(0, 'rgba(96, 165, 250, 0)');
        gradient.addColorStop(1, glowColor);

        ctx.beginPath();
        if (p.vx !== 0) {
          ctx.moveTo(p.x - trailLen, p.y);
          ctx.lineTo(p.x, p.y);
        } else {
          ctx.moveTo(p.x, p.y - trailLen);
          ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = p.size * 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        return true;
      });

      animationId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
    />
  );
};

export default AnimatedGrid;
