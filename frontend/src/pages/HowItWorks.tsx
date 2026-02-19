import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Shield, ArrowRight, Lock, Zap, Scale, Brain, Hash,
  FileCheck, Globe, Database, Eye, CheckCircle, ArrowDown, Sparkles
} from 'lucide-react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/* ─── Data ──────────────────────────────────────────────────────────────── */

const pipelineSteps = [
  {
    id: 'fetch',
    label: 'Confidential HTTP',
    sublabel: 'Chainlink CRE',
    icon: Globe,
    iconColor: 'text-blue-400',
    ring: 'ring-blue-500/20',
    glow: 'shadow-blue-500/20',
    bg: 'bg-blue-500/10',
    accent: 'blue',
    description: 'CRE fetches reserve attestation data from custodian APIs via Confidential HTTP inside a Trusted Execution Environment.',
    detail: 'Raw financial data (asset values, compositions, custodian details) enters the confidential boundary. It never leaves.',
  },
  {
    id: 'evaluate',
    label: 'Policy Engine',
    sublabel: '4 Deterministic Rules',
    icon: Scale,
    iconColor: 'text-violet-400',
    ring: 'ring-violet-500/20',
    glow: 'shadow-violet-500/20',
    bg: 'bg-violet-500/10',
    accent: 'violet',
    description: 'Four compliance controls evaluate the data: reserve ratio, proof freshness, asset quality, and concentration limits.',
    detail: 'Worst-of aggregation: if ANY control is RED, overall status is RED. Rules are deterministic — same input always produces same output.',
  },
  {
    id: 'hash',
    label: 'Evidence Hash',
    sublabel: 'SHA-256 Commitment',
    icon: Hash,
    iconColor: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
    glow: 'shadow-emerald-500/20',
    bg: 'bg-emerald-500/10',
    accent: 'emerald',
    description: 'A cryptographic hash of the evaluation evidence is generated. This proves what was evaluated without revealing the data.',
    detail: 'The hash commits to: input data hashes, control statuses, timestamp, and policy version. It\'s a zero-knowledge proof of evaluation.',
  },
  {
    id: 'ai',
    label: 'AI Reasoning',
    sublabel: 'Advisory Only',
    icon: Brain,
    iconColor: 'text-amber-400',
    ring: 'ring-amber-500/20',
    glow: 'shadow-amber-500/20',
    bg: 'bg-amber-500/10',
    accent: 'amber',
    description: 'Natural language explanation generated from policy output. References GENIUS Act and CLARITY Act frameworks.',
    detail: 'The AI agent CANNOT modify severity. It only explains. If it fails, the system degrades gracefully with fallback explanations.',
  },
  {
    id: 'anchor',
    label: 'On-Chain Anchor',
    sublabel: 'Ethereum Sepolia',
    icon: FileCheck,
    iconColor: 'text-cyan-400',
    ring: 'ring-cyan-500/20',
    glow: 'shadow-cyan-500/20',
    bg: 'bg-cyan-500/10',
    accent: 'cyan',
    description: 'Status + evidence hash are written to a smart contract on Sepolia. Anyone can verify the proof on Etherscan.',
    detail: 'Contract: 0xf9BaAE...E71b9. Stores status enum, evidence hash (bytes32), policy version, timestamp, and control count.',
  },
];

const privacyBoundary = {
  inside: ['Raw reserve values ($105M)', 'Asset compositions (T-Bills 50%, Cash 25%)', 'Custodian identities', 'Liability breakdowns'],
  outside: ['GREEN / YELLOW / RED status', 'Evidence hash (SHA-256)', 'Policy version (1.0.0)', 'Evaluation timestamp', 'Control pass/fail count', 'AI explanation (no raw data)'],
};

const controls = [
  { name: 'Reserve Ratio', threshold: '≥ 1.02x', desc: 'Reserves must exceed liabilities by 2%+', icon: Database, pct: 85 },
  { name: 'Proof Freshness', threshold: '≤ 6 hours', desc: 'Attestation data must be recent', icon: Zap, pct: 92 },
  { name: 'Asset Quality', threshold: '≤ 30% risky', desc: 'Portfolio risk must stay within limits', icon: Shield, pct: 78 },
  { name: 'Concentration', threshold: '≤ 75% single', desc: 'No single asset can dominate reserves', icon: Scale, pct: 65 },
];

/* ─── Animated Pipeline Step ────────────────────────────────────────────── */

const PipelineStep = ({ step, index, total }: { step: typeof pipelineSteps[0]; index: number; total: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const Icon = step.icon;

  return (
    <div ref={ref} className="relative">
      {/* Animated connector line */}
      {index < total - 1 && (
        <div className="absolute left-7 top-[76px] bottom-0 w-px z-0 overflow-hidden">
          <motion.div
            initial={{ height: 0 }}
            animate={isInView ? { height: '100%' } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="w-full bg-gradient-to-b from-primary/30 via-primary/15 to-transparent"
          />
          {/* Flowing particle */}
          {isInView && (
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-1.5 h-6 rounded-full bg-primary/50 blur-[2px]"
              initial={{ top: 0, opacity: 0 }}
              animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, delay: 0.8, repeat: Infinity, repeatDelay: 2 }}
            />
          )}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex gap-5 pb-12 z-10"
      >
        {/* Icon node */}
        <div className="shrink-0 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
            whileHover={{ scale: 1.15, rotate: 5 }}
            className={`relative w-14 h-14 rounded-2xl ${step.bg} ring-1 ${step.ring} flex items-center justify-center shadow-lg ${step.glow} cursor-default`}
          >
            <Icon className={`h-6 w-6 ${step.iconColor}`} strokeWidth={1.5} />
            {/* Pulse ring */}
            <motion.div
              className={`absolute inset-0 rounded-2xl ring-1 ${step.ring}`}
              animate={isInView ? { scale: [1, 1.4], opacity: [0.4, 0] } : {}}
              transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
            />
          </motion.div>
          {/* Stage number */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-2 text-[9px] font-bold text-muted-foreground/30 tracking-widest"
          >
            0{index + 1}
          </motion.span>
        </div>

        {/* Content card */}
        <motion.div
          whileHover={{ y: -2, borderColor: 'hsl(var(--primary) / 0.2)' }}
          transition={{ duration: 0.3 }}
          className="glass-card p-6 flex-1 space-y-3 overflow-hidden relative group"
        >
          {/* Shimmer on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none translate-x-[-100%] group-hover:translate-x-[100%]" style={{ transition: 'transform 0.7s, opacity 0.7s' }} />

          <div className="flex items-center gap-3 flex-wrap">
            <motion.span
              initial={{ width: 0 }}
              animate={isInView ? { width: 'auto' } : {}}
              transition={{ delay: 0.3 }}
              className="overflow-hidden whitespace-nowrap text-[10px] font-bold text-muted-foreground/40 tracking-widest"
            >
              STAGE {index + 1}
            </motion.span>
            <h3 className="text-lg font-bold text-foreground tracking-tight">{step.label}</h3>
            <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2.5 py-0.5">{step.sublabel}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

          {/* Expandable detail */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={isInView ? { opacity: 1, height: 'auto' } : {}}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-muted-foreground/60 leading-relaxed border-t border-border/30 pt-3">{step.detail}</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ─── Animated Control Card ─────────────────────────────────────────────── */

const ControlCard = ({ ctrl, index }: { ctrl: typeof controls[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = ctrl.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass-card p-6 space-y-4 hover:border-primary/20 transition-colors duration-300 group cursor-default"
    >
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.15, rotate: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"
        >
          <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </motion.div>
        <div>
          <h3 className="text-sm font-bold text-foreground">{ctrl.name}</h3>
          <p className="text-[10px] text-primary font-mono font-bold">{ctrl.threshold}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{ctrl.desc}</p>
      {/* Animated threshold bar */}
      <div className="space-y-1">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: `${ctrl.pct}%` } : {}}
            transition={{ duration: 1, delay: index * 0.12 + 0.3, ease: 'easeOut' }}
            className="h-full bg-primary/60 rounded-full"
          />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground/40">
          <span>0</span>
          <span className="text-primary font-bold">Threshold</span>
          <span>MAX</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Floating Particle ─────────────────────────────────────────────────── */

const FloatingOrb = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <motion.div
    className={`absolute rounded-full pointer-events-none ${className}`}
    animate={{
      y: [0, -20, 0, 15, 0],
      x: [0, 10, -10, 5, 0],
      opacity: [0.3, 0.6, 0.3],
    }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* ─── Main Page ─────────────────────────────────────────────────────────── */

const HowItWorks = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content">

        {/* ═══ HERO ═══ */}
        <section ref={heroRef} className="relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-30 dark:opacity-10" />

          {/* Floating orbs */}
          <FloatingOrb className="w-72 h-72 bg-primary/5 blur-[100px] top-1/4 left-1/3" delay={0} />
          <FloatingOrb className="w-48 h-48 bg-violet-500/5 blur-[80px] top-1/2 right-1/4" delay={2} />
          <FloatingOrb className="w-32 h-32 bg-cyan-500/5 blur-[60px] bottom-1/4 left-1/4" delay={4} />

          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative container-blog py-24 lg:py-36 text-center space-y-8">
            {/* Animated badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full px-4 py-1.5"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </motion.div>
              <span className="text-xs font-semibold text-primary tracking-wide">ARCHITECTURE DEEP DIVE</span>
            </motion.div>

            {/* Headline with stagger */}
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
              >
                <span className="gradient-text">How CompliGuard Works</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                A 5-stage pipeline that evaluates stablecoin compliance without exposing a single byte of raw financial data.
              </motion.p>
            </div>

            {/* Animated scroll hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="pt-4"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex flex-col items-center gap-1 text-muted-foreground/40"
              >
                <span className="text-[10px] tracking-widest uppercase">Scroll to explore</span>
                <ArrowDown className="h-4 w-4" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ PIPELINE ═══ */}
        <section className="border-t border-border/50 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="container-blog py-20">
            {/* Section header */}
            <SectionHeader
              tag="DATA FLOW"
              title="The Pipeline"
              subtitle="Each stage processes data and passes only non-sensitive outputs to the next."
            />

            <div className="max-w-3xl mx-auto space-y-0 mt-14">
              {pipelineSteps.map((step, i) => (
                <PipelineStep key={step.id} step={step} index={i} total={pipelineSteps.length} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRIVACY BOUNDARY ═══ */}
        <section className="border-t border-border/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-compliance-red/20 to-transparent" />
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/3 rounded-full blur-[120px] pointer-events-none" />

          <div className="container-blog py-20 relative">
            <SectionHeader
              tag="CRITICAL"
              tagColor="text-compliance-red"
              title="The Privacy Boundary"
              subtitle="This is the core innovation. Raw financial data stays inside the TEE. Only verdicts and proofs leave."
            />

            <PrivacyColumns />
          </div>
        </section>

        {/* ═══ CONTROLS ═══ */}
        <section className="border-t border-border/50 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="container-blog py-20">
            <SectionHeader
              tag="POLICY ENGINE"
              title="4 Compliance Controls"
              subtitle="Deterministic rules. Same input = same output. No AI influence on severity."
            />

            <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto mt-12">
              {controls.map((ctrl, i) => (
                <ControlCard key={ctrl.name} ctrl={ctrl} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="border-t border-border/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
          <div className="container-blog py-20 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-8"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block"
              >
                <Shield className="h-12 w-12 text-primary mx-auto" strokeWidth={1.2} />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">See It In Action</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Pick a scenario, run a compliance check, and verify the proof on Etherscan — all in under 30 seconds.
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" asChild className="rounded-xl h-14 px-10 text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                  <Link to="/dashboard">
                    Open Live Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

/* ─── Reusable Section Header with scroll animation ─────────────────────── */

const SectionHeader = ({ tag, tagColor, title, subtitle }: { tag: string; tagColor?: string; title: string; subtitle: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="text-center space-y-4">
      <motion.span
        initial={{ opacity: 0, letterSpacing: '0.3em' }}
        animate={isInView ? { opacity: 1, letterSpacing: '0.2em' } : {}}
        transition={{ duration: 0.6 }}
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${tagColor || 'text-primary'}`}
      >
        {tag}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-3xl md:text-4xl font-bold text-foreground tracking-tight"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-muted-foreground max-w-xl mx-auto"
      >
        {subtitle}
      </motion.p>
    </div>
  );
};

/* ─── Animated Privacy Columns ──────────────────────────────────────────── */

const PrivacyColumns = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mt-12">
      {/* INSIDE TEE */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card p-6 space-y-4 border-compliance-red/20 relative overflow-hidden group"
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          animate={isInView ? { boxShadow: ['inset 0 0 0px transparent', 'inset 0 0 30px hsl(var(--compliance-red) / 0.05)', 'inset 0 0 0px transparent'] } : {}}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="flex items-center gap-2.5 relative">
          <motion.div
            animate={isInView ? { rotate: [0, -10, 0] } : {}}
            transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatDelay: 4 }}
            className="h-8 w-8 rounded-lg bg-compliance-red/10 flex items-center justify-center"
          >
            <Lock className="h-4 w-4 text-compliance-red" />
          </motion.div>
          <div>
            <p className="text-sm font-bold text-foreground">Inside TEE (Never Exposed)</p>
            <p className="text-[10px] text-compliance-red font-semibold uppercase tracking-wider">Confidential</p>
          </div>
        </div>
        <div className="space-y-2 relative">
          {privacyBoundary.inside.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-2 bg-compliance-red/5 rounded-lg px-3 py-2.5"
            >
              <Lock className="h-3 w-3 text-compliance-red shrink-0" />
              <span className="text-xs text-muted-foreground">{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Arrow between columns (desktop) */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.5, type: 'spring' }}
        className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background border border-border items-center justify-center shadow-lg"
      >
        <ArrowRight className="h-4 w-4 text-primary" />
      </motion.div>

      {/* OUTSIDE */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card p-6 space-y-4 border-compliance-green/20 relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          animate={isInView ? { boxShadow: ['inset 0 0 0px transparent', 'inset 0 0 30px hsl(var(--compliance-green) / 0.05)', 'inset 0 0 0px transparent'] } : {}}
          transition={{ duration: 3, delay: 1.5, repeat: Infinity }}
        />
        <div className="flex items-center gap-2.5 relative">
          <motion.div
            animate={isInView ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 2, delay: 0.8, repeat: Infinity, repeatDelay: 4 }}
            className="h-8 w-8 rounded-lg bg-compliance-green/10 flex items-center justify-center"
          >
            <Eye className="h-4 w-4 text-compliance-green" />
          </motion.div>
          <div>
            <p className="text-sm font-bold text-foreground">Published (Verifiable)</p>
            <p className="text-[10px] text-compliance-green font-semibold uppercase tracking-wider">On-Chain + Dashboard</p>
          </div>
        </div>
        <div className="space-y-2 relative">
          {privacyBoundary.outside.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-2 bg-compliance-green/5 rounded-lg px-3 py-2.5"
            >
              <CheckCircle className="h-3 w-3 text-compliance-green shrink-0" />
              <span className="text-xs text-foreground">{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HowItWorks;
