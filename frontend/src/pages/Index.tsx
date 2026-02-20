import { useRef, lazy, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PrivacyIndicator from '@/components/PrivacyIndicator';
import ScrollReveal, { StaggerContainer, StaggerItem } from '@/components/ScrollReveal';
import OrbitingIcons from '@/components/OrbitingIcons';
import AnimatedBorder from '@/components/AnimatedBorder';
const PixelBlast = lazy(() => import('@/components/PixelBlast'));
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Workflow, Scale, Brain, ArrowRight, Zap, Eye, Lock, AlertTriangle, CheckCircle, X, Clock, FileCheck, DollarSign } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const steps = [
  {
    icon: Workflow,
    title: 'CRE Orchestrates',
    description: 'Chainlink CRE fetches reserve attestation data via Confidential HTTP.',
    accent: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: Scale,
    title: 'Rules Decide',
    description: 'Deterministic policy engine evaluates: reserve ratio, data freshness, asset quality.',
    accent: 'from-violet-500/20 to-purple-500/20',
  },
  {
    icon: Brain,
    title: 'AI Explains',
    description: 'Natural language reasoning (advisory only, never authoritative).',
    accent: 'from-emerald-500/20 to-teal-500/20',
  },
];

const techBadges = [
  { label: 'Chainlink CRE', icon: Zap },
  { label: 'Confidential HTTP', icon: Lock },
  { label: 'Deterministic Policy Engine', icon: Scale },
  { label: 'AI Reasoning Layer', icon: Brain },
];

const stats = [
  { value: '< 30s', label: 'Evaluation Time' },
  { value: '100%', label: 'Data Privacy' },
  { value: '24/7', label: 'Monitoring' },
];

const comparisonRows = [
  { feature: 'Data Exposure', traditional: 'Full financial data shared with auditors', compliGuard: 'Zero — raw data never leaves TEE', tradIcon: AlertTriangle, guardIcon: Shield },
  { feature: 'Frequency', traditional: 'Quarterly manual audits', compliGuard: 'Real-time (< 30 seconds)', tradIcon: Clock, guardIcon: Zap },
  { feature: 'Verifiability', traditional: 'PDF report, trust-based', compliGuard: 'On-chain evidence hash, cryptographic', tradIcon: FileCheck, guardIcon: CheckCircle },
  { feature: 'Cost', traditional: '$50K–$500K per audit cycle', compliGuard: 'Automated, near-zero marginal cost', tradIcon: DollarSign, guardIcon: DollarSign },
];

const Index = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content">

        {/* === HERO === */}
        <section ref={heroRef} className="relative overflow-hidden min-h-[100vh] flex items-center">
          {/* PixelBlast background */}
          <Suspense fallback={null}>
            <PixelBlast
              color="#0061ff"
              pixelSize={3}
              patternScale={2}
              patternDensity={1}
              speed={0.5}
              enableRipples={true}
              rippleSpeed={0.3}
              rippleThickness={0.1}
              edgeFade={0.4}
              variant="square"
            />
          </Suspense>

          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
            className="relative w-full z-[3]"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
              <div className="grid lg:grid-cols-[1fr,auto] gap-16 lg:gap-20 items-center">
                {/* Left — Text content (glassmorphism card) */}
                <div className="space-y-7 max-w-2xl bg-background/5 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-[0_8px_60px_-12px_rgba(0,0,0,0.4)]">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <AnimatedBorder>
                      <div className="flex items-center gap-2.5 px-4 py-1.5">
                        <div className="relative h-2 w-2">
                          <div className="absolute inset-0 rounded-full bg-compliance-green animate-ping opacity-75" />
                          <div className="relative rounded-full h-2 w-2 bg-compliance-green" />
                        </div>
                        <span className="text-[11px] font-semibold text-primary tracking-widest">LIVE ON CHAINLINK CRE</span>
                      </div>
                    </AnimatedBorder>
                  </motion.div>

                  {/* Headline */}
                  <div>
                    <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-bold tracking-tight leading-[1.08]">
                      <motion.span
                        className="gradient-text block"
                        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      >
                        Privacy-Preserving
                      </motion.span>
                      <motion.span
                        className="text-foreground block"
                        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        Compliance Enforcement
                      </motion.span>
                    </h1>
                  </div>

                  {/* Subheading — blur-in */}
                  <motion.p
                    initial={{ opacity: 0, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.7, delay: 1.2 }}
                    className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg"
                  >
                    Real-time regulatory oversight without exposing sensitive financial data.
                    Powered by Chainlink CRE with deterministic rules, AI reasoning, and on-chain anchoring.
                  </motion.p>

                  {/* CTA buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                    className="flex flex-wrap gap-4 pt-1"
                  >
                    <Button size="lg" asChild className="group rounded-xl h-12 px-8 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all duration-300 hover:scale-[1.02]">
                      <Link to="/dashboard">
                        View Live Dashboard
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild className="rounded-xl h-12 px-8 text-sm font-semibold border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                      <a href="https://github.com/Compliledger/CompliGuard" target="_blank" rel="noopener noreferrer">
                        Read Docs
                        <Eye className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </motion.div>

                  {/* Stats — glassmorphism pills */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                    className="flex gap-4 sm:gap-5 pt-3 flex-wrap"
                  >
                    {stats.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.9 + i * 0.12, duration: 0.4 }}
                        className="bg-white/[0.05] backdrop-blur-md border border-white/[0.08] rounded-2xl px-5 py-3"
                      >
                        <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-[0.2em] font-medium">{stat.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Right — Orbiting icons visual (glassmorphism card) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="hidden lg:flex justify-center items-center"
                >
                  <OrbitingIcons />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* === THE PROBLEM === */}
        <section className="relative border-t border-border/50">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-compliance-red/20 to-transparent" />

          <div className="container-blog py-24">
            <ScrollReveal>
              <div className="text-center mb-16 space-y-4">
                <span className="text-xs font-semibold text-compliance-red uppercase tracking-[0.2em]">THE PROBLEM</span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Compliance Is Broken</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Stablecoin issuers must prove <strong className="text-foreground">$100B+ in reserves</strong> to regulators.
                  Today, this requires exposing proprietary financial data — asset compositions, custodian relationships, treasury strategies.
                  Full disclosure or no compliance. <strong className="text-foreground">There's no middle ground.</strong>
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="glass-card max-w-4xl mx-auto p-8 space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-3 border-b border-border/50">
                  <div></div>
                  <div className="flex items-center justify-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-compliance-red" /> Traditional Audit</div>
                  <div className="flex items-center justify-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> CompliGuard</div>
                </div>
                {comparisonRows.map((row) => (
                  <div key={row.feature} className="grid grid-cols-3 gap-4 items-center">
                    <p className="text-sm font-semibold text-foreground">{row.feature}</p>
                    <div className="flex items-start gap-2 bg-compliance-red/5 rounded-xl p-3">
                      <X className="h-4 w-4 text-compliance-red shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{row.traditional}</p>
                    </div>
                    <div className="flex items-start gap-2 bg-compliance-green/5 rounded-xl p-3">
                      <CheckCircle className="h-4 w-4 text-compliance-green shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground leading-relaxed">{row.compliGuard}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* === HOW IT WORKS === */}
        <section className="relative border-t border-border/50">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="container-blog py-24">
            <ScrollReveal>
              <div className="text-center mb-16 space-y-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">ARCHITECTURE</span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">How It Works</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  CRE orchestrates. Rules decide. AI explains. Privacy is enforced by design.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerDelay={0.15}>
              {steps.map((step, i) => (
                <StaggerItem key={i}>
                  <div className="relative glass-card p-8 text-center space-y-5 group hover:border-primary/20 transition-all duration-500 h-full">
                    {/* Number */}
                    <div className="absolute top-4 right-4 text-[10px] font-bold text-muted-foreground/40 tracking-widest">
                      0{i + 1}
                    </div>

                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${step.accent} border border-border/50 group-hover:scale-110 transition-transform duration-500`}>
                      <step.icon className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                    </div>

                    <h3 className="font-bold text-foreground text-lg tracking-tight">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                    {/* Connector arrow (not on last) */}
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                        <ArrowRight className="h-5 w-5 text-border" />
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* === PRIVACY GUARANTEE === */}
        <section className="container-blog py-20">
          <div className="max-w-3xl mx-auto">
            <PrivacyIndicator />
          </div>
        </section>

        {/* === TECH STACK === */}
        <section className="border-t border-border/50 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="container-blog py-20">
            <ScrollReveal>
              <div className="text-center mb-12 space-y-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">POWERED BY</span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Tech Stack</h2>
              </div>
            </ScrollReveal>

            <StaggerContainer className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto" staggerDelay={0.08}>
              {techBadges.map((badge) => (
                <StaggerItem key={badge.label}>
                  <div className="flex items-center gap-2.5 glass-card px-5 py-3 hover:border-primary/20 transition-all duration-300 cursor-default group">
                    <badge.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    <span className="text-sm font-medium text-foreground">{badge.label}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Index;
