import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import MetadataPanel from '@/components/MetadataPanel';
import PrivacyIndicator from '@/components/PrivacyIndicator';
import ControlCard from '@/components/ControlCard';
import { OnChainVerification } from '@/components/OnChainVerification';
import AuroraBackground from '@/components/AuroraBackground';
import GradientText from '@/components/GradientText';
import DemoControls, { DemoPhase } from '@/components/DemoControls';
import HashVerifier from '@/components/HashVerifier';
import ComplianceHistory from '@/components/ComplianceHistory';
import OnboardingModal from '@/components/OnboardingModal';
import ReserveGauge from '@/components/ReserveGauge';
import ReportDownload from '@/components/ReportDownload';
import { fetchComplianceStatus } from '@/lib/api';
import { ComplianceStatus } from '@/lib/types';
import { Loader2, AlertTriangle, Brain, Activity, Play, CheckCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POLL_INTERVAL = 30000;

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const Dashboard = () => {
  const [data, setData] = useState<ComplianceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [lastFetch, setLastFetch] = useState(Date.now());
  const [demoPhase, setDemoPhase] = useState<DemoPhase>('idle');
  const [demoDetail, setDemoDetail] = useState<string>('');
  const demoRef = useRef<HTMLDivElement>(null);

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePhaseChange = (phase: DemoPhase, detail?: string) => {
    setDemoPhase(phase);
    setDemoDetail(detail || '');
  };

  const load = useCallback(async () => {
    try {
      const result = await fetchComplianceStatus();
      setData(result);
      setError(null);
      setLastFetch(Date.now());
    } catch (e: any) {
      setError(e.message || 'Failed to fetch compliance status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastFetch) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastFetch]);

  const statusGradient = data?.status === 'RED'
    ? 'from-red-400 via-blue-400 to-red-400'
    : data?.status === 'YELLOW'
    ? 'from-yellow-400 via-blue-400 to-yellow-400'
    : 'from-blue-400 via-cyan-300 to-blue-400';

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated aurora background that shifts with status */}
      <AuroraBackground status={data?.status || 'GREEN'} />

      {/* Subtle dot grid overlay */}
      <div className="fixed inset-0 dot-grid opacity-10 dark:opacity-[0.03] pointer-events-none z-[1]" />

      <Header />

      <main id="main-content" className="container-blog py-10 md:py-14 space-y-8 relative z-10">
        {/* Title row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <GradientText gradient={statusGradient}>Compliance Dashboard</GradientText>
            </h1>
            <p className="text-sm text-muted-foreground">Real-time privacy-preserving compliance monitoring</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Download Report */}
            {data && <ReportDownload data={data} />}

            {/* START DEMO button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToDemo}
              className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-5 py-2 text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
            >
              <Play className="h-3.5 w-3.5" />
              Start Demo
            </motion.button>

            {/* Live indicator */}
            <motion.div
              className="flex items-center gap-2 bg-secondary/80 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-compliance-green" />
                <div className="absolute inset-0 h-2 w-2 rounded-full bg-compliance-green animate-ping opacity-75" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Refreshing
                  </span>
                ) : (
                  `Updated ${secondsAgo}s ago`
                )}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Demo status line */}
        <AnimatePresence mode="wait">
          {demoPhase !== 'idle' && (
            <motion.div
              key={demoPhase}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium ${
                demoPhase === 'scenario_set'
                  ? 'bg-primary/5 border border-primary/15 text-primary'
                  : demoPhase === 'running'
                  ? 'bg-compliance-yellow/5 border border-compliance-yellow/15 text-compliance-yellow'
                  : demoPhase === 'anchored'
                  ? 'bg-compliance-green/5 border border-compliance-green/15 text-compliance-green'
                  : 'bg-primary/5 border border-primary/15 text-primary'
              }`}
            >
              {demoPhase === 'scenario_set' && (
                <>
                  <Zap className="h-4 w-4 shrink-0" />
                  <span>Scenario: <strong>{demoDetail}</strong> — Toggle anchor and click Run</span>
                </>
              )}
              {demoPhase === 'running' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span>Running compliance check…</span>
                </>
              )}
              {demoPhase === 'done' && (
                <>
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>Evaluation complete — Status: <strong>{demoDetail}</strong></span>
                </>
              )}
              {demoPhase === 'anchored' && (
                <>
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>Report anchored on Sepolia — Status: <strong>{demoDetail}</strong></span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="flex items-center gap-3 glass-card border-compliance-yellow/30 px-5 py-4 text-sm text-foreground overflow-hidden"
            >
              <div className="h-8 w-8 rounded-lg bg-compliance-yellow/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-compliance-yellow" />
              </div>
              <span>API temporarily unavailable. {data ? 'Showing last known status.' : error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skeleton loading */}
        {loading && !data && (
          <div className="space-y-6">
            <div className="h-6 w-48 bg-secondary/50 rounded-lg animate-pulse" />
            <div className="h-48 w-full bg-secondary/30 rounded-2xl animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-36 bg-secondary/30 rounded-2xl animate-pulse relative overflow-hidden" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {data && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Privacy indicator */}
            <motion.div variants={fadeUp}>
              <PrivacyIndicator compact />
            </motion.div>

            {/* Status badge + Reserve Gauge row */}
            <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <StatusBadge status={data.status} />
              </div>
              <ReserveGauge status={data.status} />
            </motion.div>

            {/* Controls Grid */}
            {data.controls && data.controls.length > 0 && (
              <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.controls.map((control, i) => (
                  <ControlCard key={control.controlType} control={control} index={i} />
                ))}
              </motion.div>
            )}

            {/* AI Explanation */}
            <motion.div
              variants={fadeUp}
              className="glass-card p-7 space-y-3 group hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle shimmer on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="relative flex items-center gap-2.5">
                <motion.div
                  className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center"
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Brain className="h-3.5 w-3.5 text-primary" />
                </motion.div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">AI Explanation</span>
                <span className="text-[10px] font-medium text-muted-foreground/50 ml-auto uppercase tracking-wider">Advisory Only</span>
              </div>
              <p className="relative text-base text-foreground leading-relaxed">{data.explanation}</p>
            </motion.div>

            {/* Metadata */}
            <motion.div variants={fadeUp}>
              <MetadataPanel
                timestamp={data.timestamp}
                policyVersion={data.policyVersion}
                evidenceHash={data.evidenceHash}
              />
            </motion.div>

            {/* On-Chain Verification (REAL blockchain data) */}
            <motion.div variants={fadeUp}>
              <OnChainVerification />
            </motion.div>

            {/* Demo Controls — unified judge-testable panel */}
            <motion.div variants={fadeUp}>
              <DemoControls ref={demoRef} onStatusUpdate={load} onPhaseChange={handlePhaseChange} />
            </motion.div>

            {/* Hash Verifier — interactive */}
            <motion.div variants={fadeUp}>
              <HashVerifier />
            </motion.div>

            {/* Compliance History Timeline */}
            <motion.div variants={fadeUp}>
              <ComplianceHistory />
            </motion.div>
          </motion.div>
        )}

        {!data && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 space-y-4"
          >
            <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">No compliance data available.</p>
          </motion.div>
        )}
      </main>

      <Footer />

      {/* First-visit onboarding */}
      <OnboardingModal onComplete={scrollToDemo} />
    </div>
  );
};

export default Dashboard;
