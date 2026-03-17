"use client";

import React from 'react';
import { Sparkles, IndianRupee, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScholarshipBadgeProps {
  name: string;
  amountSaved: number;
  discountPercentage: number;
  criteria: string;
}

export default function ScholarshipBadge({ name, amountSaved, discountPercentage, criteria }: ScholarshipBadgeProps) {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 relative overflow-hidden group shadow-sm"
    >
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-100/30 blur-2xl rounded-full" />
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-tight line-clamp-1">{name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Qualified</span>
               <span className="text-[10px] font-bold text-emerald-700">{discountPercentage}% Discount Enabled</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between mt-4 relative z-10">
        <div>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Instant Wealth Grant</p>
          <div className="flex items-baseline gap-1 text-emerald-900">
            <IndianRupee className="w-3.5 h-3.5 stroke-[3]" />
            <span className="text-2xl font-black tracking-tighter animate-pulse">
              {amountSaved.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-sm p-2 rounded-xl border border-emerald-100/50 cursor-help group/tooltip">
          <Info className="w-4 h-4 text-emerald-400" />
          <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 leading-relaxed font-medium">
            <span className="block font-black text-emerald-400 mb-1 uppercase tracking-widest">Eligibility Criteria</span>
            {criteria}
          </div>
        </div>
      </div>
      
      {/* Sparkle micro-animations */}
      <motion.div 
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0.5, 1.2, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-2 right-12 text-emerald-400"
      >
        <Sparkles className="w-3 h-3" />
      </motion.div>
    </motion.div>
  );
}
