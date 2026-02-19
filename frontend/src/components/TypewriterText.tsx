import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  cursor?: boolean;
}

const TypewriterText = ({ text, speed = 30, className = '', cursor = true }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayText}
      {cursor && (
        <motion.span
          animate={{ opacity: done ? [1, 0] : 1 }}
          transition={{ duration: 0.5, repeat: done ? Infinity : 0, repeatType: 'reverse' }}
          className="inline-block w-[2px] h-[1em] bg-current ml-0.5 align-text-bottom"
        />
      )}
    </span>
  );
};

export default TypewriterText;
