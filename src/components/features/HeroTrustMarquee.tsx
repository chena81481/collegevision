"use client";

import React from 'react';
import { motion } from 'framer-motion';

const TRUST_SIGNALS = [
  "Trusted by 52,000+ Students",
  "Verified Govt. Data (2026)",
  "0% Processing Fees",
  "Official University Partner",
  "UGC-DEB Accredited",
  "100% Admission Support"
];

export default function HeroTrustMarquee() {
  return (
    <div className="w-full overflow-hidden py-4">
      <div className="relative flex items-center">
        <motion.div 
          initial={{ x: "0%" }}
          animate={{ x: "-50%" }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex items-center gap-16 whitespace-nowrap"
        >
          {/* Double content for seamless looping */}
          {[...TRUST_SIGNALS, ...TRUST_SIGNALS].map((signal, i) => (
            <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              <div className="w-1.5 h-1.5 bg-blue-500/40 rounded-full" />
              {signal}
            </div>
          ))}
        </motion.div>
        
        {/* Gradient overlays for fade effect (Hero compatibility) */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
      </div>
    </div>
  );
}
