import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AuroraBackgroundProps {
  status?: 'GREEN' | 'YELLOW' | 'RED';
}

const statusGradients = {
  GREEN: {
    colors: ['#22c55e', '#10b981', '#3b82f6', '#0ea5e9'],
    opacity: 0.12,
  },
  YELLOW: {
    colors: ['#eab308', '#d97706', '#3b82f6', '#6366f1'],
    opacity: 0.10,
  },
  RED: {
    colors: ['#ef4444', '#dc2626', '#3b82f6', '#8b5cf6'],
    opacity: 0.11,
  },
};

const AuroraBackground = ({ status = 'GREEN' }: AuroraBackgroundProps) => {
  const gradient = statusGradients[status];

  const blobs = useMemo(() => [
    { x: '10%', y: '20%', size: 600, delay: 0 },
    { x: '60%', y: '10%', size: 500, delay: 2 },
    { x: '30%', y: '60%', size: 450, delay: 4 },
    { x: '80%', y: '50%', size: 550, delay: 1 },
    { x: '50%', y: '80%', size: 400, delay: 3 },
  ], []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {blobs.map((blob, i) => (
        <motion.div
          key={`${status}-${i}`}
          className="absolute rounded-full"
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle, ${gradient.colors[i % gradient.colors.length]}44 0%, transparent 70%)`,
            filter: 'blur(80px)',
            opacity: gradient.opacity,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 1.2, 0.9, 1.1, 0.8],
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
            opacity: [gradient.opacity * 0.6, gradient.opacity, gradient.opacity * 0.8, gradient.opacity, gradient.opacity * 0.6],
          }}
          transition={{
            duration: 12 + i * 2,
            delay: blob.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AuroraBackground;
