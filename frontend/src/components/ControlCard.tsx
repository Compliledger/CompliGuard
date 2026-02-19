import { useRef, useState } from 'react';
import { ControlResult, ComplianceStatusType } from '@/lib/types';
import { Shield, Clock, AlertTriangle, PieChart } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

interface ControlCardProps {
  control: ControlResult;
  index: number;
}

const controlIcons = {
  RESERVE_RATIO: Shield,
  PROOF_FRESHNESS: Clock,
  ASSET_QUALITY: AlertTriangle,
  ASSET_CONCENTRATION: PieChart,
};

const controlLabels = {
  RESERVE_RATIO: 'Reserve Ratio',
  PROOF_FRESHNESS: 'Proof Freshness',
  ASSET_QUALITY: 'Asset Quality',
  ASSET_CONCENTRATION: 'Concentration',
};

const statusColors: Record<ComplianceStatusType, { bg: string; text: string; border: string; glow: string }> = {
  GREEN: { bg: 'bg-compliance-green/10', text: 'text-compliance-green', border: 'border-compliance-green/30', glow: 'rgba(34,197,94,0.15)' },
  YELLOW: { bg: 'bg-compliance-yellow/10', text: 'text-compliance-yellow', border: 'border-compliance-yellow/30', glow: 'rgba(234,179,8,0.15)' },
  RED: { bg: 'bg-compliance-red/10', text: 'text-compliance-red', border: 'border-compliance-red/30', glow: 'rgba(239,68,68,0.15)' },
};

const ControlCard = ({ control, index }: ControlCardProps) => {
  const Icon = controlIcons[control.controlType] || Shield;
  const label = controlLabels[control.controlType] || control.controlType;
  const colors = statusColors[control.status];
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const progress = control.value !== undefined && control.threshold !== undefined
    ? Math.min((control.value / control.threshold) * 100, 100)
    : 0;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 800,
        boxShadow: isHovered ? `0 20px 40px ${colors.glow}, 0 0 60px ${colors.glow}` : `0 4px 20px ${colors.glow}`,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative glass-card p-5 space-y-3 border ${colors.border} transition-all duration-500 overflow-hidden cursor-default`}
    >
      {/* Spotlight effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500"
        style={{
          opacity: isHovered ? 0.08 : 0,
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(400px circle at ${((x as number) + 0.5) * 100}% ${((y as number) + 0.5) * 100}%, hsl(var(--primary)), transparent 60%)`
          ),
        }}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div
            className={`h-8 w-8 rounded-lg ${colors.bg} flex items-center justify-center`}
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Icon className={`h-4 w-4 ${colors.text}`} />
          </motion.div>
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <motion.div
          className={`h-3 w-3 rounded-full ${control.status === 'GREEN' ? 'bg-compliance-green' : control.status === 'YELLOW' ? 'bg-compliance-yellow' : 'bg-compliance-red'}`}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {control.value !== undefined && control.threshold !== undefined && (
        <div className="relative space-y-2">
          <div className="flex items-baseline gap-2">
            <AnimatedCounter
              value={control.value}
              decimals={control.controlType === 'RESERVE_RATIO' ? 2 : 0}
              suffix={control.controlType === 'RESERVE_RATIO' ? '' : '%'}
              className={`text-2xl font-bold ${colors.text} tabular-nums`}
              duration={1.2}
            />
            <span className="text-xs text-muted-foreground">
              / {control.controlType === 'RESERVE_RATIO' ? control.threshold.toFixed(2) : `${control.threshold}%`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${control.status === 'GREEN' ? 'bg-compliance-green' : control.status === 'YELLOW' ? 'bg-compliance-yellow' : 'bg-compliance-red'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1.2, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      )}

      <p className="relative text-xs text-muted-foreground leading-relaxed">{control.message}</p>
    </motion.div>
  );
};

export default ControlCard;
