import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, XCircle, Loader2, ExternalLink, ShieldCheck } from 'lucide-react';
import { verifyEvidenceHash, VerifyResult } from '@/lib/api';

const HashVerifier = () => {
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async () => {
    if (!hash.trim()) return;
    setLoading(true);
    setSearched(true);
    const res = await verifyEvidenceHash(hash.trim());
    setResult(res);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="h-4 w-4 text-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">On-Chain Verification</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Paste any evidence hash to verify if it exists on the Sepolia smart contract.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={hash}
          onChange={(e) => { setHash(e.target.value); setSearched(false); setResult(null); }}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          placeholder="0x..."
          className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/20 transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleVerify}
          disabled={loading || !hash.trim()}
          className="flex items-center gap-1.5 bg-foreground text-background rounded-xl px-4 py-2.5 text-xs font-semibold disabled:opacity-50 transition-opacity"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          Verify
        </motion.button>
      </div>

      <AnimatePresence>
        {searched && !loading && result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${
              result.existsOnChain
                ? 'bg-compliance-green/5 border-compliance-green/20'
                : 'bg-compliance-red/5 border-compliance-red/20'
            }`}>
              {result.existsOnChain ? (
                <CheckCircle className="h-5 w-5 text-compliance-green shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-compliance-red shrink-0 mt-0.5" />
              )}
              <div className="space-y-1.5 min-w-0">
                <p className={`text-sm font-semibold ${result.existsOnChain ? 'text-compliance-green' : 'text-compliance-red'}`}>
                  {result.existsOnChain ? 'Verified On-Chain' : 'Not Found On-Chain'}
                </p>
                <p className="text-xs text-muted-foreground break-all font-mono">{result.evidenceHash}</p>
                {result.existsOnChain && (
                  <a
                    href={result.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
                  >
                    View on Etherscan <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HashVerifier;
