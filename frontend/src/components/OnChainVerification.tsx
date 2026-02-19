import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, CheckCircle, AlertCircle, Loader2, Link2 } from 'lucide-react';

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
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Connecting to Sepolia...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-xl p-6"
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
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">On-Chain Verification</h3>
          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
            LIVE
          </span>
        </div>
        <a
          href={data?.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          View on Etherscan <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Network</p>
          <p className="font-mono text-sm">Sepolia</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Reports</p>
          <p className="font-mono text-sm">{data?.reportCount || 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Contract</p>
          <p className="font-mono text-xs truncate" title={data?.contractAddress}>
            {data?.contractAddress?.slice(0, 10)}...{data?.contractAddress?.slice(-8)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Chain ID</p>
          <p className="font-mono text-sm">{data?.chainId}</p>
        </div>
      </div>

      {data?.latestReport && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Latest On-Chain Report</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className={`font-semibold ${statusColors[data.latestReport.status]}`}>
                {data.latestReport.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Controls</p>
              <p className="font-mono">{data.latestReport.controlCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Policy</p>
              <p className="font-mono">{data.latestReport.policyVersion}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Timestamp</p>
              <p className="font-mono text-xs">
                {new Date(data.latestReport.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Evidence Hash</p>
              <p className="font-mono text-xs break-all">{data.latestReport.evidenceHash}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
