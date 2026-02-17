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
        className="inline-flex items-center gap-2.5 bg-primary/5 border border-primary/15 px-4 py-2.5 rounded-xl text-sm text-primary group"
      >
        <div className="relative">
          <Lock className="h-4 w-4 shrink-0" />
          <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="font-medium">Sensitive data sealed via Chainlink Confidential HTTP</span>
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
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-t-2xl" />

      {/* Background glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />

      <div className="relative flex items-start gap-5">
        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
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
