import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { fetchComplianceHistory } from '@/lib/api';
import { ComplianceStatus } from '@/lib/types';

const statusIcons = {
  GREEN: CheckCircle,
  YELLOW: AlertTriangle,
  RED: XCircle,
};

const statusColors = {
  GREEN: 'text-compliance-green bg-compliance-green/10 border-compliance-green/20',
  YELLOW: 'text-compliance-yellow bg-compliance-yellow/10 border-compliance-yellow/20',
  RED: 'text-compliance-red bg-compliance-red/10 border-compliance-red/20',
};

const ComplianceHistory = () => {
  const [history, setHistory] = useState<ComplianceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await fetchComplianceHistory(20);
      setHistory(data);
      setLoading(false);
    };
    load();
  }, []);

  const visibleItems = expanded ? history : history.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">Evaluation History</span>
        </div>
        <span className="text-[10px] text-muted-foreground/50">{history.length} evaluations</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-secondary/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No evaluations recorded yet. Run a compliance check to see history.</p>
      ) : (
        <>
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {visibleItems.map((entry, i) => {
                const Icon = statusIcons[entry.status];
                const colors = statusColors[entry.status];
                const time = new Date(entry.timestamp);

                return (
                  <motion.div
                    key={entry.timestamp + i}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${colors} overflow-hidden`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">{entry.status}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{entry.explanation}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {history.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-center gap-1.5 w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? (
                <>Show Less <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>Show {history.length - 5} More <ChevronDown className="h-3 w-3" /></>
              )}
            </button>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ComplianceHistory;
