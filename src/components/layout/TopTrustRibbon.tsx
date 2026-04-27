import { motion } from 'framer-motion';

const TRUST_SIGNALS = [
  "Trusted by 52,000+ Students",
  "Verified Govt. Data (2026)",
  "0% Processing Fees",
  "Official University Partner",
  "UGC-DEB Accredited Programs",
  "100% Admission Support"
];

export default function TopTrustRibbon() {
  return (
    <div className="w-full bg-slate-900 py-2 px-4 overflow-hidden relative z-[60] border-b border-white/5">
      <div className="max-w-7xl mx-auto relative flex items-center h-5">
        <motion.div 
          initial={{ x: "0%" }}
          animate={{ x: "-50%" }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex items-center gap-12 whitespace-nowrap"
        >
          {/* Double content for seamless looping */}
          {[...TRUST_SIGNALS, ...TRUST_SIGNALS].map((signal, i) => (
            <div key={i} className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              {signal}
            </div>
          ))}
        </motion.div>
        
        {/* Gradient overlays for fade effect */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10" />
      </div>
    </div>
  );
}
