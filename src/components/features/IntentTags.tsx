"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Wallet, CreditCard, Target } from 'lucide-react';

interface IntentTagsProps {
  tokens: { type: string; value: string }[];
}

export default function IntentTags({ tokens }: IntentTagsProps) {
  if (tokens.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'Degree': return <GraduationCap className="w-3 h-3" />;
      case 'Budget': return <Wallet className="w-3 h-3" />;
      case 'Finance': return <CreditCard className="w-3 h-3" />;
      case 'Career': return <Target className="w-3 h-3" />;
      default: return null;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'Degree': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Budget': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Finance': return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'Career': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4 min-h-[32px]">
      <AnimatePresence>
        {tokens.map((token, i) => (
          <motion.div
            key={`${token.type}-${token.value}`}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${getColor(token.type)}`}
          >
            {getIcon(token.type)}
            <span className="opacity-60">{token.type}:</span>
            <span>{token.value}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
