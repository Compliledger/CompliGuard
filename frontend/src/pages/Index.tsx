import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PrivacyIndicator from '@/components/PrivacyIndicator';
import ScrollReveal, { StaggerContainer, StaggerItem } from '@/components/ScrollReveal';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Workflow, Scale, Brain, ArrowRight, Zap, Eye, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content">

        {/* === HERO === */}
        <section className="relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 dot-grid opacity-30 dark:opacity-10" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

          <div className="relative container-blog py-24 lg:py-36">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full px-4 py-1.5"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-compliance-green animate-pulse" />
                <span className="text-xs font-semibold text-primary tracking-wide">LIVE ON CHAINLINK CRE</span>
              </motion.div>

              {/* Shield icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative inline-block"
              >
                <Shield className="h-16 w-16 mx-auto text-primary" strokeWidth={1.2} />
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
              >
                <span className="gradient-text">Privacy-Preserving</span>
                <br />
                <span className="text-foreground">Compliance Enforcement</span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto"
              >
                Real-time regulatory oversight without exposing sensitive financial data.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              >
                <Button size="lg" asChild className="rounded-xl h-12 px-8 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                  <Link to="/dashboard">
                    View Live Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="rounded-xl h-12 px-8 text-sm font-semibold border-border/50 hover:border-primary/30">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    Read Docs
                    <Eye className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </motion.div>
            </div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex justify-center gap-12 md:gap-20 mt-20"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </motion.div>
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
