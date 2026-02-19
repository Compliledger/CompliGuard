import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface ReserveGaugeProps {
  reserveValue?: number;
  liabilityValue?: number;
  ratio?: number;
  status?: string;
}

const ReserveGauge = ({ reserveValue, liabilityValue, ratio, status }: ReserveGaugeProps) => {
  const displayRatio = ratio || (reserveValue && liabilityValue ? reserveValue / liabilityValue : 1.0);
  const reserveM = reserveValue ? (reserveValue / 1_000_000).toFixed(0) : '105';
  const liabilityM = liabilityValue ? (liabilityValue / 1_000_000).toFixed(0) : '100';

  const ratioPercent = Math.min(Math.max(displayRatio * 100, 80), 130);
  const barWidth = Math.min(((ratioPercent - 80) / 50) * 100, 100);

  const statusColor = status === 'RED'
    ? 'text-compliance-red'
    : status === 'YELLOW'
    ? 'text-compliance-yellow'
    : 'text-compliance-green';

  const barColor = status === 'RED'
    ? 'bg-compliance-red'
    : status === 'YELLOW'
    ? 'bg-compliance-yellow'
    : 'bg-compliance-green';

  const barGlow = status === 'RED'
    ? 'shadow-compliance-red/30'
    : status === 'YELLOW'
    ? 'shadow-compliance-yellow/30'
    : 'shadow-compliance-green/30';

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Reserve Health</span>
      </div>

      {/* Ratio display */}
      <div className="text-center space-y-1">
        <motion.p
          key={displayRatio}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-4xl font-bold font-mono tracking-tight ${statusColor}`}
        >
          {displayRatio.toFixed(3)}x
        </motion.p>
        <p className="text-xs text-muted-foreground">Reserve Ratio</p>
      </div>

      {/* Gauge bar */}
      <div className="space-y-2">
        <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
          {/* Threshold markers */}
          <div className="absolute left-[40%] top-0 bottom-0 w-px bg-compliance-yellow/40 z-10" title="1.00x" />
          <div className="absolute left-[44%] top-0 bottom-0 w-px bg-compliance-green/40 z-10" title="1.02x" />

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className={`absolute inset-y-0 left-0 rounded-full ${barColor} shadow-lg ${barGlow}`}
          />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono">
          <span>0.80x</span>
          <span>1.00x</span>
          <span>1.02x</span>
          <span>1.30x</span>
        </div>
      </div>

      {/* Reserve vs Liability bars */}
      <div className="space-y-3 pt-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-compliance-green" />
              <span className="text-xs font-medium text-foreground">Reserves</span>
            </div>
            <span className="text-xs font-bold font-mono text-foreground">${reserveM}M</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-full bg-compliance-green/70 rounded-full"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Liabilities</span>
            </div>
            <span className="text-xs font-bold font-mono text-foreground">${liabilityM}M</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${liabilityValue && reserveValue ? (liabilityValue / reserveValue) * 100 : 95}%` }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="h-full bg-muted-foreground/30 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReserveGauge;
