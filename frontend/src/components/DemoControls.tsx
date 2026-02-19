import { useState, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, RefreshCw, Clock, Loader2, CheckCircle, AlertTriangle, XCircle,
  Copy, Check, ExternalLink, Anchor, ChevronDown, ChevronUp, Beaker, Info
} from 'lucide-react';
import { switchScenario, runComplianceCheck, fetchComplianceHistory, RunResult } from '@/lib/api';
import { ComplianceStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export type DemoPhase = 'idle' | 'scenario_set' | 'running' | 'done' | 'anchored';

interface DemoControlsProps {
  onStatusUpdate?: () => void;
  onPhaseChange?: (phase: DemoPhase, detail?: string) => void;
}

const scenarios = [
  { id: 'healthy' as const, label: 'Healthy', icon: CheckCircle, color: 'bg-compliance-green', textColor: 'text-compliance-green' },
  { id: 'at_risk' as const, label: 'At Risk', icon: AlertTriangle, color: 'bg-compliance-yellow', textColor: 'text-compliance-yellow' },
  { id: 'non_compliant' as const, label: 'Non-Compliant', icon: XCircle, color: 'bg-compliance-red', textColor: 'text-compliance-red' },
];

const progressSteps = [
  'Fetching reserves (Confidential HTTP)…',
  'Evaluating policy…',
  'Generating evidence hash…',
  'Anchoring report on Sepolia…',
];

const DemoControls = forwardRef<HTMLDivElement, DemoControlsProps>(({ onStatusUpdate, onPhaseChange }, ref) => {
  const { toast } = useToast();
  const [activeScenario, setActiveScenario] = useState<string>('healthy');
  const [scenarioLoading, setScenarioLoading] = useState<string | null>(null);
  const [anchor, setAnchor] = useState(false);
  const [running, setRunning] = useState(false);
  const [progressIdx, setProgressIdx] = useState(-1);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [history, setHistory] = useState<ComplianceStatus[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(true);

  // Step 1: Pick scenario
  const handleScenario = async (scenario: 'healthy' | 'at_risk' | 'non_compliant') => {
    setScenarioLoading(scenario);
    await switchScenario(scenario);
    setActiveScenario(scenario);
    setScenarioLoading(null);
    setRunResult(null);
    onPhaseChange?.('scenario_set', scenario.toUpperCase().replace('_', ' '));
    toast({
      title: `Scenario set to ${scenario.toUpperCase().replace('_', ' ')}`,
      description: 'Now toggle Anchor and click "Run Compliance Check".',
    });
    onStatusUpdate?.();
  };

  // Step 2: Run compliance check with progress
  const handleRun = useCallback(async () => {
    setRunning(true);
    setRunResult(null);
    setProgressIdx(0);
    onPhaseChange?.('running', progressSteps[0]);

    const totalSteps = anchor ? 4 : 3;
    for (let i = 0; i < totalSteps; i++) {
      setProgressIdx(i);
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    }

    const result = await runComplianceCheck(anchor);
    setRunResult(result);
    setRunning(false);
    setProgressIdx(-1);

    if (result) {
      const isAnchored = !!result.txHash;
      onPhaseChange?.(isAnchored ? 'anchored' : 'done', result.status);

      toast({
        title: isAnchored ? 'Compliance Report Anchored' : `Status: ${result.status}`,
        description: isAnchored
          ? `Transaction submitted to Sepolia. Ratio: ${result.reserveRatio.toFixed(3)}x`
          : `Reserve ratio: ${result.reserveRatio.toFixed(3)}x | ${result.policyVersion}`,
      });
    }
    onStatusUpdate?.();
  }, [anchor, toast, onStatusUpdate]);

  // Step 5: Load history
  const handleHistory = async () => {
    setHistoryLoading(true);
    const data = await fetchComplianceHistory(5);
    setHistory(data);
    setHistoryOpen(true);
    setHistoryLoading(false);
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusColors: Record<string, string> = {
    GREEN: 'text-compliance-green',
    YELLOW: 'text-compliance-yellow',
    RED: 'text-compliance-red',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* ── 3-Step Demo Guide Banner ── */}
      <motion.div
        layout
        className="glass-card border-primary/20 overflow-hidden"
      >
        <button
          onClick={() => setGuideOpen(!guideOpen)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-primary/[0.03] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Beaker className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground">3-Step Demo</span>
            <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">For judges</span>
          </div>
          <motion.div animate={{ rotate: guideOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </button>
        <AnimatePresence>
          {guideOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 space-y-3 border-t border-border/30 pt-3">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">1</span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Pick Scenario</p>
                    <p className="text-[11px] text-muted-foreground">Choose Healthy, At Risk, or Non-Compliant.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">2</span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Toggle "Anchor On-Chain"</p>
                    <p className="text-[11px] text-muted-foreground">Turn ON to submit report to Sepolia.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">3</span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Click Run Compliance Check</p>
                    <p className="text-[11px] text-muted-foreground">Watch: Confidential HTTP fetch, policy evaluation, evidence hash generation, on-chain submission.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Main Controls Card ── */}
      <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Play className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">Demo Controls</span>
        </div>
        <span className="text-[10px] text-muted-foreground/50">Interactive</span>
      </div>

      {/* ── STEP 1: Scenario Buttons ── */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">1. Pick a Scenario</p>
        <div className="flex flex-wrap gap-2">
          {scenarios.map((s) => {
            const Icon = s.icon;
            const isActive = activeScenario === s.id;
            const isLoading = scenarioLoading === s.id;
            return (
              <motion.button
                key={s.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleScenario(s.id)}
                disabled={scenarioLoading !== null || running}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all disabled:opacity-50 ${
                  isActive
                    ? `${s.color} text-white`
                    : 'bg-secondary text-foreground hover:bg-accent'
                }`}
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
                {s.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── STEP 2: Run Compliance Check ── */}
      <div className="space-y-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">2. Run Compliance Check</p>

        {/* Anchor toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-foreground">Anchor on-chain</span>
          </div>
          <button
            onClick={() => setAnchor(!anchor)}
            disabled={running}
            className={`relative w-9 h-5 rounded-full transition-colors ${anchor ? 'bg-primary' : 'bg-secondary'}`}
          >
            <motion.div
              className={`absolute top-0.5 w-4 h-4 rounded-full ${anchor ? 'bg-primary-foreground' : 'bg-muted-foreground'}`}
              animate={{ left: anchor ? '18px' : '2px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Run button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleRun}
          disabled={running}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-bold disabled:opacity-70 transition-opacity shadow-lg shadow-primary/20"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {running ? 'Running…' : 'Run Compliance Check'}
        </motion.button>

        {/* Progress steps */}
        <AnimatePresence>
          {running && progressIdx >= 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5 overflow-hidden"
            >
              {progressSteps.slice(0, anchor ? 4 : 3).map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {i < progressIdx ? (
                    <CheckCircle className="h-3.5 w-3.5 text-compliance-green shrink-0" />
                  ) : i === progressIdx ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-foreground shrink-0" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />
                  )}
                  <span className={i <= progressIdx ? 'text-foreground' : 'text-muted-foreground/40'}>
                    {step}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── STEP 3 + 4: Results + Proof ── */}
      <AnimatePresence>
        {runResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 border-t border-border/50 pt-4"
          >
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">3. Results</p>

            {/* Status + Ratio */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/30 rounded-xl p-3 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                <p className={`text-lg font-bold ${statusColors[runResult.status] || 'text-foreground'}`}>
                  {runResult.status}
                </p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-3 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Reserve Ratio</p>
                <p className="text-lg font-bold text-foreground font-mono">{runResult.reserveRatio.toFixed(3)}x</p>
              </div>
            </div>

            {/* Proof fields */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">4. Verification Proof</p>

              {/* Evidence Hash */}
              <div className="flex items-center justify-between bg-secondary/30 rounded-xl p-3">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Evidence Hash</p>
                  <p className="text-xs font-mono text-foreground truncate">{runResult.evidenceHash}</p>
                </div>
                <button onClick={() => handleCopy(runResult.evidenceHash, 'hash')} className="shrink-0 ml-2 h-7 w-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-accent transition-colors">
                  {copiedField === 'hash' ? <Check className="h-3 w-3 text-compliance-green" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                </button>
              </div>

              {/* Policy + Timestamp */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary/30 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Policy Version</p>
                  <p className="text-xs font-mono text-foreground">{runResult.policyVersion}</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Check (UTC)</p>
                  <p className="text-xs font-mono text-foreground">
                    {new Date(runResult.checkedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' })}
                  </p>
                </div>
              </div>

              {/* TX Hash (if anchor enabled) */}
              {runResult.txHash && (
                <>
                  {/* Anchored confirmation banner */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 bg-compliance-green/10 border border-compliance-green/20 rounded-xl p-3"
                  >
                    <CheckCircle className="h-5 w-5 text-compliance-green shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-compliance-green">Compliance Report Anchored</p>
                      <p className="text-[10px] text-muted-foreground">Transaction submitted to Sepolia testnet</p>
                    </div>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${runResult.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1.5 bg-compliance-green/20 hover:bg-compliance-green/30 text-compliance-green text-[10px] font-bold rounded-lg px-3 py-1.5 transition-colors"
                    >
                      View TX <ExternalLink className="h-3 w-3" />
                    </a>
                  </motion.div>

                  {/* TX Hash row */}
                  <div className="flex items-center justify-between bg-secondary/30 rounded-xl p-3">
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">TX Hash</p>
                      <p className="text-xs font-mono text-foreground truncate">{runResult.txHash}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button onClick={() => handleCopy(runResult.txHash!, 'tx')} className="h-7 w-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-accent transition-colors">
                        {copiedField === 'tx' ? <Check className="h-3 w-3 text-compliance-green" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                      </button>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${runResult.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-7 w-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-accent transition-colors"
                      >
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STEP 5: History ── */}
      <div className="space-y-2 border-t border-border/50 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">5. History</p>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStatusUpdate}
              className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh Status
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleHistory}
              disabled={historyLoading}
              className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1 transition-colors disabled:opacity-50"
            >
              {historyLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
              Load History
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {historyOpen && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5 overflow-hidden"
            >
              {history.map((entry, i) => {
                const time = new Date(entry.timestamp);
                return (
                  <div
                    key={entry.timestamp + i}
                    className="flex items-center justify-between bg-secondary/30 rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${statusColors[entry.status] || 'text-foreground'}`}>
                        {entry.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                      {entry.evidenceHash?.slice(0, 12)}…
                    </span>
                  </div>
                );
              })}
              <button
                onClick={() => setHistoryOpen(false)}
                className="flex items-center justify-center gap-1 w-full text-[10px] text-muted-foreground hover:text-foreground py-1"
              >
                Collapse <ChevronUp className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>{/* end main controls card */}
    </motion.div>
  );
});

DemoControls.displayName = 'DemoControls';

export default DemoControls;
