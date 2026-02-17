import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import MetadataPanel from '@/components/MetadataPanel';
import PrivacyIndicator from '@/components/PrivacyIndicator';
import ControlCard from '@/components/ControlCard';
import ScenarioControls from '@/components/ScenarioControls';
import { fetchComplianceStatus } from '@/lib/api';
import { ComplianceStatus } from '@/lib/types';
import { Loader2, AlertTriangle, Brain, Activity, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POLL_INTERVAL = 30000;

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

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background effects */}
      <div className="fixed inset-0 dot-grid opacity-20 dark:opacity-5 pointer-events-none" />

      <Header />

      <main id="main-content" className="container-blog py-10 md:py-14 space-y-8 relative">
        {/* Title row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Compliance Dashboard</h1>
            <p className="text-sm text-muted-foreground">Real-time compliance monitoring</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 bg-secondary/80 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-2">
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
            </div>
          </div>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 glass-card border-compliance-yellow/30 px-5 py-4 text-sm text-foreground overflow-hidden"
            >
              <div className="h-8 w-8 rounded-lg bg-compliance-yellow/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-compliance-yellow" />
              </div>
              <span>API temporarily unavailable. {data ? 'Showing last known status.' : error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Privacy indicator */}
            <PrivacyIndicator compact />

            {/* Status badge */}
            <StatusBadge status={data.status} />

            {/* Controls Grid */}
            {data.controls && data.controls.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.controls.map((control, i) => (
                  <ControlCard key={control.controlType} control={control} index={i} />
                ))}
              </div>
            )}

            {/* AI Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card p-7 space-y-3 group hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">AI Explanation</span>
                <span className="text-[10px] font-medium text-muted-foreground/50 ml-auto uppercase tracking-wider">Advisory Only</span>
              </div>
              <p className="text-base text-foreground leading-relaxed">{data.explanation}</p>
            </motion.div>

            {/* Metadata */}
            <MetadataPanel
              timestamp={data.timestamp}
              policyVersion={data.policyVersion}
              evidenceHash={data.evidenceHash}
            />

            {/* Demo Scenario Controls */}
            <ScenarioControls onScenarioChange={load} />
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
