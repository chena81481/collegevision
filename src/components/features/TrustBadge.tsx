"use client";

import React from 'react';
import { ShieldCheck, Clock, ExternalLink, Info } from 'lucide-react';

interface TrustBadgeProps {
  lastVerified?: string;
  source?: string;
  isUgcApproved?: boolean;
}

export default function TrustBadge({ 
  lastVerified = "4 hours ago", 
  source = "Official UGC-DEB Portal",
  isUgcApproved = true
}: TrustBadgeProps) {
  return (
    <div className="relative group mt-4">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative flex flex-col sm:flex-row items-center gap-4 p-4 md:p-5 bg-zinc-950/90 border border-emerald-500/30 rounded-2xl backdrop-blur-xl">
        
        {/* Shield Icon with Pulse */}
        <div className="shrink-0 relative">
          <div className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-20 animate-pulse"></div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center relative z-10">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Info Content */}
        <div className="flex-1 space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Verified Data Engine</h4>
            {isUgcApproved && (
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-tighter">
                UGC Approved
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-500/70" />
              Last verified: <span className="text-white">{lastVerified}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Info className="w-3.5 h-3.5 text-blue-500/70" />
              Source: <span className="text-white underline decoration-blue-500/30 underline-offset-4">{source}</span>
            </div>
          </div>
        </div>

        {/* Verification Link */}
        <button className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group/btn">
          <span className="text-xs font-bold text-white">View Proof</span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-emerald-400 transition-colors" />
        </button>
      </div>
    </div>
  );
}
