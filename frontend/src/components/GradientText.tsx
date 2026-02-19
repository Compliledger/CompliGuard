import { motion } from 'framer-motion';

interface GradientTextProps {
  children: string;
  className?: string;
  gradient?: string;
}

const GradientText = ({
  children,
  className = '',
  gradient = 'from-blue-400 via-cyan-300 to-blue-400',
}: GradientTextProps) => {
  const words = children.split(' ');

  return (
    <span className={`inline-flex flex-wrap gap-x-2 ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.5,
            delay: i * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_6s_ease-in-out_infinite]`}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

export default GradientText;
