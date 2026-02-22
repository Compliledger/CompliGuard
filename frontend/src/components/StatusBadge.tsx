import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type OverallStatus = 'HEALTHY' | 'AT_RISK' | 'NON_COMPLIANT' | 'GREEN' | 'YELLOW' | 'RED';

interface StatusBadgeProps {
  status: OverallStatus;
}

const statusConfig = {
  HEALTHY: {
    label: 'Healthy',
    subline: 'All controls passed — no enforcement actions required',
    icon: CheckCircle,
    bgClass: 'bg-compliance-green/10 dark:bg-compliance-green/5',
    textClass: 'text-compliance-green',
    borderClass: 'border-compliance-green/30',
    glowColor: 'hsl(var(--compliance-green) / 0.15)',
    ringColor: 'hsl(var(--compliance-green) / 0.3)',
  },
  AT_RISK: {
    label: 'At Risk',
    subline: 'Review recommended — one or more controls need attention',
    icon: AlertTriangle,
    bgClass: 'bg-compliance-yellow/10 dark:bg-compliance-yellow/5',
    textClass: 'text-compliance-yellow',
    borderClass: 'border-compliance-yellow/30',
    glowColor: 'hsl(var(--compliance-yellow) / 0.15)',
    ringColor: 'hsl(var(--compliance-yellow) / 0.3)',
  },
  NON_COMPLIANT: {
    label: 'Non-Compliant',
    subline: 'Enforcement action required immediately',
    icon: XCircle,
    bgClass: 'bg-compliance-red/10 dark:bg-compliance-red/5',
    textClass: 'text-compliance-red',
    borderClass: 'border-compliance-red/30',
    glowColor: 'hsl(var(--compliance-red) / 0.15)',
    ringColor: 'hsl(var(--compliance-red) / 0.3)',
  },
  GREEN: {
    label: 'Healthy',
    subline: 'All controls passed — no enforcement actions required',
    icon: CheckCircle,
    bgClass: 'bg-compliance-green/10 dark:bg-compliance-green/5',
    textClass: 'text-compliance-green',
    borderClass: 'border-compliance-green/30',
    glowColor: 'hsl(var(--compliance-green) / 0.15)',
    ringColor: 'hsl(var(--compliance-green) / 0.3)',
  },
  YELLOW: {
    label: 'At Risk',
    subline: 'Review recommended — one or more controls need attention',
    icon: AlertTriangle,
    bgClass: 'bg-compliance-yellow/10 dark:bg-compliance-yellow/5',
    textClass: 'text-compliance-yellow',
    borderClass: 'border-compliance-yellow/30',
    glowColor: 'hsl(var(--compliance-yellow) / 0.15)',
    ringColor: 'hsl(var(--compliance-yellow) / 0.3)',
  },
  RED: {
    label: 'Non-Compliant',
    subline: 'Enforcement action required immediately',
    icon: XCircle,
    bgClass: 'bg-compliance-red/10 dark:bg-compliance-red/5',
    textClass: 'text-compliance-red',
    borderClass: 'border-compliance-red/30',
    glowColor: 'hsl(var(--compliance-red) / 0.15)',
    ringColor: 'hsl(var(--compliance-red) / 0.3)',
  },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative p-10 rounded-2xl border-2 text-center ${config.bgClass} ${config.borderClass} overflow-hidden`}
      style={{ boxShadow: `0 0 60px ${config.glowColor}` }}
    >
      {/* Pulse ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className={`w-24 h-24 rounded-full border-2 ${config.borderClass}`}
          animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
        />
      </div>

      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon className={`h-14 w-14 mx-auto mb-5 ${config.textClass}`} strokeWidth={1.5} />
      </motion.div>

      <p className={`text-3xl md:text-4xl font-bold ${config.textClass} tracking-tight`}>
        {config.label}
      </p>

      <p className="text-sm text-muted-foreground mt-2 font-medium">
        {config.subline}
      </p>

      <p className="text-xs text-muted-foreground/60 mt-3 font-medium uppercase tracking-widest">
        Compliance Status
      </p>
    </motion.div>
  );
};

export default StatusBadge;
