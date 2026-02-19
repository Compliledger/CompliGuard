import { useState } from 'react';
import { switchScenario } from '@/lib/api';
import { Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScenarioControlsProps {
  onScenarioChange?: () => void;
}

const scenarios = [
  { id: 'healthy' as const, label: 'Healthy', icon: CheckCircle, bg: 'bg-compliance-green', hoverGlow: 'rgba(34,197,94,0.4)' },
  { id: 'at_risk' as const, label: 'At Risk', icon: AlertTriangle, bg: 'bg-compliance-yellow', hoverGlow: 'rgba(234,179,8,0.4)' },
  { id: 'non_compliant' as const, label: 'Non-Compliant', icon: XCircle, bg: 'bg-compliance-red', hoverGlow: 'rgba(239,68,68,0.4)' },
];

const ScenarioControls = ({ onScenarioChange }: ScenarioControlsProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [active, setActive] = useState<string>('healthy');

  const handleSwitch = async (scenario: 'healthy' | 'at_risk' | 'non_compliant') => {
    setLoading(scenario);
    await switchScenario(scenario);
    setActive(scenario);
    setLoading(null);
    onScenarioChange?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">Demo Controls</span>
        <span className="text-[10px] text-muted-foreground/50">Switch compliance scenarios</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          const isLoading = loading === scenario.id;
          const isActive = active === scenario.id;

          return (
            <motion.button
              key={scenario.id}
              onClick={() => handleSwitch(scenario.id)}
              disabled={loading !== null}
              whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${scenario.hoverGlow}` }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-2 ${scenario.bg} text-white text-xs font-semibold rounded-xl px-5 py-2.5 transition-all duration-300 overflow-hidden disabled:opacity-50`}
            >
              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={isActive ? { x: ['100%', '-100%'] } : {}}
                transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
              />

              <span className="relative flex items-center gap-1.5">
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
                {scenario.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ScenarioControls;
