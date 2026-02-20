import { ReactNode } from 'react';

interface AnimatedBorderProps {
  children: ReactNode;
  className?: string;
  borderRadius?: string;
  duration?: string;
}

const AnimatedBorder = ({
  children,
  className = '',
  borderRadius = '9999px',
  duration = '3s',
}: AnimatedBorderProps) => {
  return (
    <div
      className={`relative inline-flex ${className}`}
      style={{ borderRadius }}
    >
      {/* Spinning gradient border */}
      <div
        className="absolute -inset-[1px] overflow-hidden"
        style={{ borderRadius }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(from 0deg, transparent, hsl(var(--primary)), hsl(142 71% 45%), hsl(217 91% 70%), transparent)`,
            animation: `spin ${duration} linear infinite`,
          }}
        />
      </div>
      {/* Inner content */}
      <div
        className="relative bg-background/90 dark:bg-card/90 backdrop-blur-sm"
        style={{ borderRadius }}
      >
        {children}
      </div>
    </div>
  );
};

export default AnimatedBorder;
