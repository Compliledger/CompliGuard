import { motion } from 'framer-motion';
import { Shield, Lock, Zap, Brain, Scale, Eye, Fingerprint, Database } from 'lucide-react';

interface OrbitingIconsProps {
  className?: string;
}

const orbitItems = [
  { icon: Lock, label: 'Privacy', color: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20' },
  { icon: Zap, label: 'CRE', color: 'text-blue-400', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20' },
  { icon: Brain, label: 'AI', color: 'text-violet-400', bg: 'bg-violet-500/10', glow: 'shadow-violet-500/20' },
  { icon: Scale, label: 'Rules', color: 'text-cyan-400', bg: 'bg-cyan-500/10', glow: 'shadow-cyan-500/20' },
  { icon: Eye, label: 'Monitor', color: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20' },
  { icon: Fingerprint, label: 'Verify', color: 'text-rose-400', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/20' },
  { icon: Database, label: 'Chain', color: 'text-teal-400', bg: 'bg-teal-500/10', glow: 'shadow-teal-500/20' },
];

const OrbitingIcons = ({ className = '' }: OrbitingIconsProps) => {
  const radius = 155;

  return (
    <div className={`relative w-[380px] h-[380px] ${className}`}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border border-border/20" />

      {/* Dashed orbit path */}
      <motion.div
        className="absolute rounded-full border border-dashed border-primary/15"
        style={{ inset: 35 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      />

      {/* Concentric pulse rings */}
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border border-primary/8"
          style={{ inset: 60 + ring * 25 }}
          animate={{
            scale: [1, 1.04, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3.5,
            delay: ring * 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Central shield with glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Glow backdrop */}
          <motion.div
            className="absolute -inset-8 bg-primary/15 blur-3xl rounded-full"
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [0.9, 1.2, 0.9],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <Shield className="relative h-16 w-16 text-primary drop-shadow-lg" strokeWidth={1.2} />
        </motion.div>
      </div>

      {/* Orbiting icons */}
      {orbitItems.map((item, i) => {
        const angle = (360 / orbitItems.length) * i;
        return (
          <motion.div
            key={item.label}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: -18,
              marginTop: -18,
            }}
            animate={{
              x: [
                Math.cos((angle * Math.PI) / 180) * radius,
                Math.cos(((angle + 360) * Math.PI) / 180) * radius,
              ],
              y: [
                Math.sin((angle * Math.PI) / 180) * radius,
                Math.sin(((angle + 360) * Math.PI) / 180) * radius,
              ],
            }}
            transition={{
              duration: 24,
              delay: i * 0.4,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <motion.div
              className="relative group cursor-default"
              whileHover={{ scale: 1.25 }}
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 2.5 + i * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${item.bg} backdrop-blur-md border border-border/40 shadow-lg ${item.glow}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[9px] font-semibold text-muted-foreground whitespace-nowrap tracking-wide">
                {item.label}
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default OrbitingIcons;
