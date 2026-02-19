import { Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface PrivacyIndicatorProps {
  compact?: boolean;
}

const PrivacyIndicator = ({ compact = false }: PrivacyIndicatorProps) => {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-primary group overflow-hidden"
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-xl p-[1px] overflow-hidden">
          <motion.div
            className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,hsl(var(--primary))_360deg)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-[1px] rounded-[11px] bg-background" />
        </div>

        <div className="relative flex items-center gap-2.5">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Lock className="h-4 w-4 shrink-0" />
            </motion.div>
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-medium">Sensitive data sealed via Chainlink Confidential HTTP</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative glass-card p-8 overflow-hidden group"
    >
      {/* Animated gradient accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Background glow */}
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        animate={{
          backgroundColor: ['hsl(var(--primary) / 0.05)', 'hsl(var(--primary) / 0.12)', 'hsl(var(--primary) / 0.05)'],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative flex items-start gap-5">
        <motion.div
          className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <ShieldCheck className="h-6 w-6 text-primary" />
        </motion.div>
        <div className="space-y-2">
          <h3 className="font-bold text-foreground text-lg tracking-tight">Privacy Guarantee</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
            Sensitive reserve data is sealed using Chainlink Confidential HTTP. API keys, balances, and composition details never appear in logs, calldata, or public storage.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyIndicator;
