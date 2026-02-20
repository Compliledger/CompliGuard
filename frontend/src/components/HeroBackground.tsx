import { motion } from 'framer-motion';
import AnimatedGrid from './AnimatedGrid';

/**
 * HeroBackground — layered animated background
 * Core: AnimatedGrid canvas (grid lines + light pulses + mouse-reactive intersections)
 * Plus: aurora blobs, meteors, scan line, noise, edge fades.
 */
const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* ── Layer 1: Canvas animated grid with light pulses ──────────── */}
      <AnimatedGrid className="pointer-events-auto" />

      {/* ── Layer 2: Aurora gradient blobs (large, colorful, moving) ── */}
      {[
        { color: 'hsl(217 91% 60%)', x: '20%', y: '15%', w: 650, dx: 50, dy: -30, dur: 14 },
        { color: 'hsl(142 71% 45%)', x: '65%', y: '55%', w: 550, dx: -40, dy: 35, dur: 16 },
        { color: 'hsl(280 70% 55%)', x: '50%', y: '5%', w: 500, dx: 35, dy: 45, dur: 18 },
        { color: 'hsl(200 100% 50%)', x: '5%', y: '65%', w: 450, dx: 25, dy: -50, dur: 20 },
      ].map((blob, i) => (
        <motion.div
          key={`aurora-${i}`}
          className="absolute rounded-full"
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.w,
            height: blob.w,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            filter: 'blur(90px)',
            opacity: 0,
          }}
          animate={{
            x: [0, blob.dx, -blob.dx * 0.5, blob.dx * 0.3, 0],
            y: [0, blob.dy, -blob.dy * 0.7, blob.dy * 0.4, 0],
            opacity: [0.07, 0.16, 0.09, 0.14, 0.07],
            scale: [0.8, 1.15, 0.9, 1.1, 0.8],
          }}
          transition={{
            duration: blob.dur,
            delay: i * 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* ── Layer 3: Meteor / shooting star streaks ──────────────────── */}
      {[
        { startX: -5, startY: 12, angle: 35, delay: 1, dur: 1.6, w: 180 },
        { startX: 25, startY: -5, angle: 42, delay: 4, dur: 1.3, w: 150 },
        { startX: 55, startY: -5, angle: 28, delay: 7, dur: 1.8, w: 200 },
        { startX: 80, startY: -5, angle: 38, delay: 10, dur: 1.4, w: 170 },
        { startX: 40, startY: -5, angle: 33, delay: 14, dur: 1.5, w: 160 },
      ].map((m, i) => (
        <motion.div
          key={`meteor-${i}`}
          className="absolute"
          style={{
            left: `${m.startX}%`,
            top: `${m.startY}%`,
            width: m.w,
            height: 1.5,
            background: `linear-gradient(90deg, hsl(var(--primary) / 0.7), hsl(var(--primary) / 0.2), transparent)`,
            borderRadius: 50,
            transform: `rotate(${m.angle}deg)`,
            boxShadow: '0 0 8px hsl(var(--primary) / 0.4)',
          }}
          animate={{
            x: [0, 900],
            y: [0, 700],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: m.dur,
            delay: m.delay,
            repeat: Infinity,
            repeatDelay: 10 + i * 3,
            ease: 'easeIn',
          }}
        />
      ))}

      {/* ── Layer 4: Horizontal scan line ────────────────────────────── */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.12) 15%, hsl(var(--primary) / 0.3) 50%, hsl(var(--primary) / 0.12) 85%, transparent 100%)',
          boxShadow: '0 0 30px hsl(var(--primary) / 0.12), 0 0 60px hsl(var(--primary) / 0.06)',
        }}
        animate={{ top: ['-2%', '102%'] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* ── Layer 5: Corner accent glows ─────────────────────────────── */}
      <div className="absolute -top-24 -right-24 w-[550px] h-[550px] bg-primary/8 rounded-full blur-[120px]" />
      <div className="absolute -bottom-24 -left-24 w-[450px] h-[450px] bg-compliance-green/8 rounded-full blur-[120px]" />

      {/* ── Layer 6: Noise texture ───────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Layer 7: Edge fades ──────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-background via-background/90 to-transparent z-[2]" />
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-background/60 to-transparent z-[2]" />
    </div>
  );
};

export default HeroBackground;
