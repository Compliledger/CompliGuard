import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Zap, Play, ArrowRight, X } from 'lucide-react';

const STORAGE_KEY = 'compliGuard_onboarded';

const slides = [
  {
    icon: Shield,
    accent: 'bg-primary/10 text-primary',
    title: 'Welcome to CompliGuard',
    body: 'Real-time compliance monitoring for stablecoin reserves — without exposing sensitive financial data.',
  },
  {
    icon: Lock,
    accent: 'bg-violet-500/10 text-violet-400',
    title: 'Privacy by Design',
    body: '4 deterministic rules run inside a Trusted Execution Environment. Raw reserve data never leaves the confidential boundary.',
  },
  {
    icon: Zap,
    accent: 'bg-emerald-500/10 text-emerald-400',
    title: 'Verified On-Chain',
    body: 'Every evaluation produces a cryptographic evidence hash anchored to Ethereum Sepolia. Auditors verify without trusting anyone.',
  },
  {
    icon: Play,
    accent: 'bg-primary/10 text-primary',
    title: 'Try the Demo',
    body: 'Click "Start Demo" to pick a scenario, run a compliance check, and see results anchored on-chain in real time.',
  },
];

interface OnboardingModalProps {
  onComplete?: () => void;
}

const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
    onComplete?.();
  };

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const current = slides[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative glass-card border-primary/20 max-w-md w-full p-8 space-y-6"
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {/* Slide content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="space-y-5 text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${current.accent}`}>
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-foreground tracking-tight">{current.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleClose}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg shadow-primary/20"
              >
                {step === slides.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;
