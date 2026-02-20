import { useEffect, useRef, useState } from 'react';

interface SpotlightCursorProps {
  className?: string;
  size?: number;
  color?: string;
}

const SpotlightCursor = ({ className = '', size = 400, color = 'hsl(217 91% 60%)' }: SpotlightCursorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setOpacity(1);
    };

    const handleMouseLeave = () => {
      setOpacity(0);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 1 }}
    >
      <div
        className="absolute rounded-full transition-opacity duration-500"
        style={{
          width: size,
          height: size,
          left: pos.x - size / 2,
          top: pos.y - size / 2,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: opacity * 0.08,
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
      />
    </div>
  );
};

export default SpotlightCursor;
