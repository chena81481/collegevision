"use client";

import React from 'react';

export default function TopTrustRibbon() {
  return (
    <div className="w-full bg-slate-900 py-2.5 px-4 overflow-hidden relative z-[60]">
      <div className="max-w-7xl mx-auto flex justify-center md:justify-between items-center text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Trusted by 52,000+ Students
          </span>
          <span className="hidden md:block opacity-30">|</span>
          <span className="hidden md:flex items-center gap-1.5">
            Verified Govt. Data (2026)
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span>0% Processing Fees</span>
          <span className="opacity-30">|</span>
          <span className="text-blue-400">Official University Partner</span>
        </div>
      </div>
    </div>
  );
}
