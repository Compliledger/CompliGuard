import { motion } from 'framer-motion';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerChildren?: number;
  gradient?: boolean;
}

const TextReveal = ({
  text,
  className = '',
  delay = 0,
  staggerChildren = 0.04,
  gradient = false,
}: TextRevealProps) => {
  const chars = text.split('');

  const container = {
    hidden: {},
    visible: {
      transition: {
        delay,
        staggerChildren,
      },
    },
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 40,
      filter: 'blur(12px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 120,
      },
    },
  };

  return (
    <motion.span
      className={`inline-block ${gradient ? 'gradient-text' : ''} ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          variants={child}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default TextReveal;
