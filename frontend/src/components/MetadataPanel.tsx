import { useState } from 'react';
import { Copy, Check, Clock, FileText, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TypewriterText from './TypewriterText';

interface MetadataPanelProps {
  timestamp: string;
  policyVersion: string;
  evidenceHash: string;
}

const MetadataCard = ({
  icon: Icon,
  label,
  children,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    className="glass-card p-5 group hover:border-primary/20 transition-all duration-300"
  >
    <div className="flex items-center gap-2 mb-3">
      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">{label}</span>
    </div>
    {children}
  </motion.div>
);

const MetadataPanel = ({ timestamp, policyVersion, evidenceHash }: MetadataPanelProps) => {
  const [copied, setCopied] = useState(false);

  const date = new Date(timestamp);
  const formattedTime = `${date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })} • ${date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZone: 'UTC',
  })} UTC`;

  const isStale = Date.now() - new Date(timestamp).getTime() > 3600000;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(evidenceHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetadataCard icon={Clock} label="Last Check" delay={0}>
        <div className="flex items-center gap-2">
          <p className="text-sm text-foreground font-medium">{formattedTime}</p>
          {isStale && (
            <span className="text-compliance-yellow text-xs flex items-center gap-1" title="Data may be stale">
              ⚠ Stale
            </span>
          )}
        </div>
      </MetadataCard>

      <MetadataCard icon={FileText} label="Policy Version" delay={0.1}>
        <p className="text-sm text-foreground font-mono font-semibold">{policyVersion}</p>
      </MetadataCard>

      <MetadataCard icon={Hash} label="Evidence Hash" delay={0.2}>
        <div className="flex items-center gap-2">
          <p className="text-xs text-foreground font-mono truncate flex-1">
            <TypewriterText text={`${evidenceHash.slice(0, 20)}...`} speed={25} cursor={false} />
          </p>
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={handleCopy}
            className="h-7 w-7 rounded-lg bg-secondary/80 border border-border/50 flex items-center justify-center shrink-0 hover:border-primary/30 transition-colors"
            aria-label="Copy hash to clipboard"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Check className="h-3 w-3 text-compliance-green" />
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </MetadataCard>
    </div>
  );
};

export default MetadataPanel;
