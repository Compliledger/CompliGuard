import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, CheckCircle, AlertCircle, Loader2, Link2 } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import TypewriterText from './TypewriterText';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface OnChainReport {
  status: 'GREEN' | 'YELLOW' | 'RED';
  statusCode: number;
  evidenceHash: string;
  policyVersion: string;
  timestamp: string;
  controlCount: number;
}

interface OnChainData {
  contractAddress: string;
  network: string;
  chainId: number;
  reportCount: number;
  latestReport: OnChainReport | null;
  explorerUrl: string;
}

export function OnChainVerification() {
  const [data, setData] = useState<OnChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOnChainData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/onchain/summary`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to fetch on-chain data');
        }
      } catch (err) {
        setError('Unable to connect to blockchain');
      } finally {
        setLoading(false);
      }
    };

    fetchOnChainData();
    const interval = setInterval(fetchOnChainData, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    GREEN: 'text-green-500',
    YELLOW: 'text-yellow-500',
    RED: 'text-red-500'
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Connecting to Sepolia...</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent animate-[shimmer_2s_infinite]" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <span className="text-muted-foreground">{error}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 relative overflow-hidden group"
    >
      {/* Animated top accent */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--compliance-green)), transparent)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.15, rotate: 15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Link2 className="h-5 w-5 text-primary" />
          </motion.div>
          <h3 className="font-semibold text-foreground">On-Chain Verification</h3>
          <motion.span
            className="text-[10px] font-bold bg-compliance-green/15 text-compliance-green px-2.5 py-1 rounded-full uppercase tracking-wider"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            LIVE
          </motion.span>
        </div>
        <motion.a
          href={data?.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          whileHover={{ x: 2 }}
        >
          View on Etherscan <ExternalLink className="h-3 w-3" />
        </motion.a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">Network</p>
          <p className="font-mono text-sm text-foreground font-medium">Sepolia</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">Reports</p>
          <AnimatedCounter
            value={data?.reportCount || 0}
            className="font-mono text-sm text-foreground font-bold"
            duration={1}
          />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">Contract</p>
          <p className="font-mono text-xs text-foreground truncate" title={data?.contractAddress}>
            <TypewriterText
              text={`${data?.contractAddress?.slice(0, 10)}...${data?.contractAddress?.slice(-8)}`}
              speed={20}
              cursor={false}
            />
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">Chain ID</p>
          <AnimatedCounter
            value={data?.chainId || 0}
            className="font-mono text-sm text-foreground font-medium"
            duration={0.8}
          />
        </div>
      </div>

      {data?.latestReport && (
        <motion.div
          className="border-t border-border/50 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle className="h-4 w-4 text-compliance-green" />
            </motion.div>
            <span className="text-sm font-semibold text-foreground">Latest On-Chain Report</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Status</p>
              <motion.p
                className={`font-bold ${statusColors[data.latestReport.status]}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {data.latestReport.status}
              </motion.p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Controls</p>
              <AnimatedCounter
                value={data.latestReport.controlCount}
                className="font-mono font-medium text-foreground"
                duration={0.6}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Policy</p>
              <p className="font-mono text-foreground">{data.latestReport.policyVersion}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Timestamp</p>
              <p className="font-mono text-xs text-foreground">
                {new Date(data.latestReport.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="col-span-2 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Evidence Hash</p>
              <p className="font-mono text-xs text-foreground break-all">
                <TypewriterText text={data.latestReport.evidenceHash} speed={15} cursor={false} />
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
