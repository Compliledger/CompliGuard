import { useRef, useEffect, useState, useCallback } from 'react';

interface TextPressureProps {
  text: string;
  className?: string;
  minWeight?: number;
  maxWeight?: number;
  radius?: number;
}

const TextPressure = ({
  text,
  className = '',
  minWeight = 100,
  maxWeight = 900,
  radius = 150,
}: TextPressureProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [weights, setWeights] = useState<number[]>(text.split('').map(() => minWeight));
  const mousePos = useRef({ x: -1000, y: -1000 });
  const rafId = useRef<number>(0);

  const updateWeights = useCallback(() => {
    if (!containerRef.current) return;
    const spans = containerRef.current.querySelectorAll<HTMLSpanElement>('span[data-char]');
    const newWeights: number[] = [];

    spans.forEach((span) => {
      const rect = span.getBoundingClientRect();
      const charCenterX = rect.left + rect.width / 2;
      const charCenterY = rect.top + rect.height / 2;

      const dx = mousePos.current.x - charCenterX;
      const dy = mousePos.current.y - charCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const proximity = Math.max(0, 1 - distance / radius);
      const weight = minWeight + (maxWeight - minWeight) * proximity;
      newWeights.push(Math.round(weight));
    });

    setWeights(newWeights);
    rafId.current = requestAnimationFrame(updateWeights);
  }, [minWeight, maxWeight, radius]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mousePos.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    rafId.current = requestAnimationFrame(updateWeights);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, [updateWeights]);

  const chars = text.split('');

  return (
    <div ref={containerRef} className={`select-none ${className}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {chars.map((char, i) => (
        <span
          key={i}
          data-char
          style={{
            fontWeight: weights[i] || minWeight,
            transition: 'font-weight 0.05s ease-out',
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : undefined,
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

export default TextPressure;
