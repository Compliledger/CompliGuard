import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sliders, RotateCcw, Play, Loader2 } from 'lucide-react';
import { getSimulationState, updateSimulation, resetSimulation, SimulationState } from '@/lib/api';

interface SimulationPanelProps {
  onUpdate?: () => void;
}

const sliders = [
  { key: 'reserveMultiplier' as const, label: 'Reserve Ratio', min: 0.8, max: 1.3, step: 0.01, unit: 'x', desc: 'Reserves / Liabilities' },
  { key: 'attestationAgeHours' as const, label: 'Proof Age', min: 0, max: 48, step: 1, unit: 'h', desc: 'Hours since last attestation' },
  { key: 'riskyAssetPercentage' as const, label: 'Risky Assets', min: 0, max: 60, step: 1, unit: '%', desc: 'Percentage of risky assets' },
  { key: 'concentrationPercentage' as const, label: 'Concentration', min: 10, max: 100, step: 1, unit: '%', desc: 'Max single-asset concentration' },
];

const SimulationPanel = ({ onUpdate }: SimulationPanelProps) => {
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const fetchState = useCallback(async () => {
    const s = await getSimulationState();
    if (s) setState(s);
    setLoading(false);
  }, []);

  useEffect(() => { fetchState(); }, [fetchState]);

  const handleChange = (key: keyof SimulationState, value: number) => {
    if (!state) return;
    setState({ ...state, [key]: value });
  };

  const handleApply = async () => {
    if (!state) return;
    setApplying(true);
    await updateSimulation(state);
    onUpdate?.();
    setApplying(false);
  };

  const handleReset = async () => {
    setApplying(true);
    await resetSimulation();
    await fetchState();
    onUpdate?.();
    setApplying(false);
  };

  const handleToggleDisallowed = async () => {
    if (!state) return;
    const next = { ...state, includeDisallowedAsset: !state.includeDisallowedAsset };
    setState(next);
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading simulation state...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sliders className="h-4 w-4 text-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">Custom Simulation</span>
        </div>
        <span className="text-[10px] text-muted-foreground/50">Tune compliance parameters</span>
      </div>

      <div className="space-y-4">
        {sliders.map((s) => {
          const val = state?.[s.key] as number ?? 0;
          return (
            <div key={s.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">{s.label}</label>
                <span className="text-xs font-mono font-bold text-foreground tabular-nums">
                  {s.key === 'reserveMultiplier' ? val.toFixed(2) : val}{s.unit}
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={val}
                onChange={(e) => handleChange(s.key, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-foreground
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              />
              <p className="text-[10px] text-muted-foreground/60">{s.desc}</p>
            </div>
          );
        })}

        {/* Disallowed asset toggle */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs font-medium text-foreground">Include Disallowed Asset</p>
            <p className="text-[10px] text-muted-foreground/60">Add a restricted asset to the reserve</p>
          </div>
          <button
            onClick={handleToggleDisallowed}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              state?.includeDisallowedAsset ? 'bg-compliance-red' : 'bg-secondary'
            }`}
          >
            <motion.div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-foreground"
              animate={{ left: state?.includeDisallowedAsset ? '22px' : '2px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleApply}
          disabled={applying}
          className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background rounded-xl py-2.5 text-xs font-semibold disabled:opacity-50 transition-opacity"
        >
          {applying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          Run Evaluation
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          disabled={applying}
          className="flex items-center justify-center gap-1.5 border border-border rounded-xl px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SimulationPanel;
