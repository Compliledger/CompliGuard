import { Shield, Github, FileText, ExternalLink } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const Footer = () => {
  return (
    <footer className="relative border-t border-border/50 overflow-hidden" role="contentinfo">
      {/* Subtle gradient top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container-blog py-16">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2.5">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground tracking-tight">CompliGuard</span>
            </div>

            {/* Hackathon info */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Built for Chainlink Convergence Hackathon
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
                  Risk &amp; Compliance
                </span>
                <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
                  Privacy (Confidential HTTP)
                </span>
              </div>
            </div>

            {/* Links */}
            <div className="flex justify-center gap-8">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 group"
              >
                <Github className="h-4 w-4 group-hover:text-primary transition-colors" />
                GitHub
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 group"
              >
                <FileText className="h-4 w-4 group-hover:text-primary transition-colors" />
                Docs
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            {/* Divider */}
            <div className="w-16 h-px bg-border mx-auto" />

            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} CompliGuard · Privacy-preserving compliance enforcement
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};

export default Footer;
