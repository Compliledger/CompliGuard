import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import MetadataPanel from '@/components/MetadataPanel';
import PrivacyIndicator from '@/components/PrivacyIndicator';
import ControlCard from '@/components/ControlCard';
import ScenarioControls from '@/components/ScenarioControls';
import { OnChainVerification } from '@/components/OnChainVerification';
import AuroraBackground from '@/components/AuroraBackground';
import GradientText from '@/components/GradientText';
import { fetchComplianceStatus } from '@/lib/api';
import { ComplianceStatus } from '@/lib/types';
import { Loader2, AlertTriangle, Brain, Activity } from 'lucide-react';
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
    ? 'from-red-400 via-neutral-400 to-red-400'
    : data?.status === 'YELLOW'
    ? 'from-yellow-400 via-neutral-400 to-yellow-400'
    : 'from-white via-neutral-500 to-white';

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

            {/* Status badge */}
            <motion.div variants={fadeUp}>
              <StatusBadge status={data.status} />
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

            {/* Demo Scenario Controls */}
            <motion.div variants={fadeUp}>
              <ScenarioControls onScenarioChange={load} />
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
    </div>
  );
};

export default Dashboard;
