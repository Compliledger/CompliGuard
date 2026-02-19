import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PrivacyIndicator from '@/components/PrivacyIndicator';
import ScrollReveal, { StaggerContainer, StaggerItem } from '@/components/ScrollReveal';
import LiquidBackground from '@/components/LiquidBackground';
import TextPressure from '@/components/TextPressure';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Workflow, Scale, Brain, ArrowRight, Zap, Lock, FileCheck, Hash, Clock, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Workflow,
    title: 'CRE Orchestrates',
    description: 'Chainlink CRE fetches reserve attestation data via Confidential HTTP inside a Trusted Execution Environment.',
  },
  {
    icon: Scale,
    title: 'Rules Decide',
    description: 'Deterministic policy engine evaluates reserve ratio, data freshness, asset quality, and concentration limits.',
  },
  {
    icon: Brain,
    title: 'AI Explains',
    description: 'Natural language reasoning generates human-readable compliance summaries (advisory only, never authoritative).',
  },
];

const techBadges = [
  { label: 'Chainlink CRE', icon: Zap },
  { label: 'Confidential HTTP', icon: Lock },
  { label: 'Deterministic Policy Engine', icon: Scale },
  { label: 'AI Reasoning Layer', icon: Brain },
];

const artifacts = [
  { icon: Shield, title: 'Compliance Status', desc: 'GREEN / YELLOW / RED verdict' },
  { icon: Hash, title: 'Evidence Hash', desc: 'SHA-256 proof of evaluation' },
  { icon: FileCheck, title: 'Policy Version', desc: 'Immutable rule set reference' },
  { icon: Clock, title: 'Timestamp', desc: 'UTC evaluation timestamp' },
  { icon: BarChart3, title: 'Control Results', desc: '4 independent rule outcomes' },
  { icon: Lock, title: 'Privacy Guarantee', desc: 'Raw data never leaves TEE' },
];

const stats = [
  { value: '4', label: 'On-Chain Reports' },
  { value: '100%', label: 'Data Privacy' },
  { value: '< 30s', label: 'Evaluation Time' },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content">

        {/* === HERO === */}
        <section className="relative overflow-hidden min-h-[90vh] flex flex-col justify-center">
          {/* Liquid Ether WebGL Background */}
          <LiquidBackground />

          {/* Gradient overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background pointer-events-none z-[1]" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent pointer-events-none z-[1]" />

          <div className="relative container-blog py-28 lg:py-40 z-[2]">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 border border-border/50 rounded-full px-4 py-1.5 bg-background/50 backdrop-blur-sm"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-compliance-green animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground tracking-wide">LIVE ON ETHEREUM SEPOLIA</span>
              </motion.div>

              {/* TextPressure Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
                  <TextPressure
                    text="CompliGuard"
                    className="text-foreground"
                    minWeight={200}
                    maxWeight={900}
                    radius={200}
                  />
                </h1>
                <p className="text-2xl md:text-3xl font-light text-muted-foreground mt-3 tracking-tight">
                  Privacy-Preserving Compliance
                </p>
              </motion.div>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto"
              >
                Deterministic compliance monitoring for stablecoin reserves using Chainlink CRE with cryptographic evidence and full privacy preservation.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
              >
                <Button size="lg" asChild className="rounded-xl h-12 px-8 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90">
                  <Link to="/dashboard">
                    View Live Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="rounded-xl h-12 px-8 text-sm font-semibold border-border hover:bg-accent">
                  <a href="https://sepolia.etherscan.io/address/0xf9BaAE04C412c23BC750E79C84A19692708E71b9" target="_blank" rel="noopener noreferrer">
                    View Contract
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </motion.div>
            </div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex justify-center gap-16 md:gap-24 mt-24"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 uppercase tracking-wider font-medium">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* === HOW IT WORKS (Six-Stage Pipeline style) === */}
        <section className="relative border-t border-border/50">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="container-blog py-24">
            <ScrollReveal>
              <div className="text-center mb-16 space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">How It Works</h2>
                <p className="text-muted-foreground max-w-lg mx-auto text-sm">
                  CRE orchestrates. Rules decide. AI explains. Privacy is enforced by design.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto" staggerDelay={0.15}>
              {steps.map((step, i) => (
                <StaggerItem key={i}>
                  <div className="relative glass-card p-7 space-y-4 group hover:border-foreground/10 transition-all duration-500 h-full">
                    {/* Number */}
                    <div className="text-[11px] font-mono font-bold text-muted-foreground/40 tracking-widest">
                      0{i + 1}
                    </div>

                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent border border-border/50 group-hover:bg-foreground/5 transition-colors duration-500">
                      <step.icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                    </div>

                    <h3 className="font-semibold text-foreground text-base tracking-tight">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                    {/* Connector arrow */}
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                        <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* === GENERATED ARTIFACTS === */}
        <section className="relative border-t border-border/50">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="container-blog py-24">
            <ScrollReveal>
              <div className="text-center mb-16 space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Generated Artifacts</h2>
                <p className="text-muted-foreground max-w-lg mx-auto text-sm">
                  Every evaluation produces these on-chain and off-chain outputs.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto" staggerDelay={0.08}>
              {artifacts.map((item) => (
                <StaggerItem key={item.title}>
                  <div className="glass-card p-5 flex items-start gap-4 group hover:border-foreground/10 transition-all duration-300">
                    <div className="h-10 w-10 rounded-lg bg-accent border border-border/50 flex items-center justify-center shrink-0 group-hover:bg-foreground/5 transition-colors">
                      <item.icon className="h-4.5 w-4.5 text-foreground" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
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
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="container-blog py-20">
            <ScrollReveal>
              <div className="text-center mb-12 space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Built With</h2>
              </div>
            </ScrollReveal>

            <StaggerContainer className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto" staggerDelay={0.08}>
              {techBadges.map((badge) => (
                <StaggerItem key={badge.label}>
                  <div className="flex items-center gap-2.5 glass-card px-5 py-3 hover:border-foreground/10 transition-all duration-300 cursor-default group">
                    <badge.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-foreground">{badge.label}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* === CTA BOTTOM === */}
        <section className="border-t border-border/50 relative">
          <div className="container-blog py-20">
            <ScrollReveal>
              <div className="text-center space-y-6 max-w-xl mx-auto">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  View live compliance status, verify on-chain reports, and explore the deterministic policy engine in action.
                </p>
                <Button size="lg" asChild className="rounded-xl h-12 px-8 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90">
                  <Link to="/dashboard">
                    Open Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Index;
