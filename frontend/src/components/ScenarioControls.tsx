import { useState } from 'react';
import { switchScenario } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScenarioControlsProps {
  onScenarioChange?: () => void;
}

const scenarios = [
  { id: 'healthy' as const, label: 'Healthy', icon: CheckCircle, color: 'bg-compliance-green hover:bg-compliance-green/90' },
  { id: 'at_risk' as const, label: 'At Risk', icon: AlertTriangle, color: 'bg-compliance-yellow hover:bg-compliance-yellow/90' },
  { id: 'non_compliant' as const, label: 'Non-Compliant', icon: XCircle, color: 'bg-compliance-red hover:bg-compliance-red/90' },
];

const ScenarioControls = ({ onScenarioChange }: ScenarioControlsProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSwitch = async (scenario: 'healthy' | 'at_risk' | 'non_compliant') => {
    setLoading(scenario);
    await switchScenario(scenario);
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
        <span className="text-[10px] text-muted-foreground/50">For video recording</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          const isLoading = loading === scenario.id;

          return (
            <Button
              key={scenario.id}
              size="sm"
              onClick={() => handleSwitch(scenario.id)}
              disabled={loading !== null}
              className={`${scenario.color} text-white text-xs font-medium rounded-lg px-4 py-2 transition-all duration-200`}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Icon className="h-3.5 w-3.5 mr-1.5" />
              )}
              {scenario.label}
            </Button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ScenarioControls;
