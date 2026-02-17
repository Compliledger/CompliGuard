import { ControlResult, ComplianceStatusType } from '@/lib/types';
import { Shield, Clock, AlertTriangle, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

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

const statusColors: Record<ComplianceStatusType, { bg: string; text: string; border: string }> = {
  GREEN: { bg: 'bg-compliance-green/10', text: 'text-compliance-green', border: 'border-compliance-green/30' },
  YELLOW: { bg: 'bg-compliance-yellow/10', text: 'text-compliance-yellow', border: 'border-compliance-yellow/30' },
  RED: { bg: 'bg-compliance-red/10', text: 'text-compliance-red', border: 'border-compliance-red/30' },
};

const ControlCard = ({ control, index }: ControlCardProps) => {
  const Icon = controlIcons[control.controlType] || Shield;
  const label = controlLabels[control.controlType] || control.controlType;
  const colors = statusColors[control.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`glass-card p-5 space-y-3 border ${colors.border} hover:border-primary/20 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`h-8 w-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${colors.text}`} />
          </div>
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <div className={`h-3 w-3 rounded-full ${colors.bg.replace('/10', '')} ${colors.text}`}>
          <div className={`h-3 w-3 rounded-full ${control.status === 'GREEN' ? 'bg-compliance-green' : control.status === 'YELLOW' ? 'bg-compliance-yellow' : 'bg-compliance-red'}`} />
        </div>
      </div>

      {control.value !== undefined && control.threshold !== undefined && (
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${colors.text}`}>
            {control.controlType === 'RESERVE_RATIO' ? control.value.toFixed(2) : `${control.value.toFixed(0)}%`}
          </span>
          <span className="text-xs text-muted-foreground">
            / {control.controlType === 'RESERVE_RATIO' ? control.threshold.toFixed(2) : `${control.threshold}%`} threshold
          </span>
        </div>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">{control.message}</p>
    </motion.div>
  );
};

export default ControlCard;
