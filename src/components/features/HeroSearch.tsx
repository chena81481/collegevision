"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';
import HeroTrustMarquee from './HeroTrustMarquee';
import MadLibsSearch from './MadLibsSearch';

interface HeroSearchProps {
  setQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  parsedIntent?: string | null;
}

export default function HeroSearch({ setQuery, onSearch, parsedIntent }: HeroSearchProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <MadLibsSearch 
        onSearch={(q) => {
          setQuery(q);
          // Using a micro-task to ensure state is updated before triggering search
          setTimeout(() => {
            onSearch(new Event('submit') as any);
          }, 0);
        }} 
        onUpdate={setQuery}
      />
      
      {/* Micro-copy for AI Confidence */}
      <p className="text-center text-slate-400 text-[10px] md:text-xs mt-8 font-medium uppercase tracking-widest">
        Our engine analyzes <span className="text-blue-600 font-black">15,000+ data points</span> instantly to understand your goals.
      </p>

      {/* Decluttered Trust Marquee */}
      <div className="mt-8">
        <HeroTrustMarquee />
      </div>

      {/* Intent Feedback Chip */}
      {parsedIntent && (
        <div className="flex justify-center mt-6">
          <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-100 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
              AI Matching for: <span className="text-slate-900">{parsedIntent}</span>
            </p>
          </div>
        </div>
      )}

      {/* 3. Reassurance Micro-copy */}
      <p className="text-[11px] text-slate-400 uppercase tracking-widest font-black text-center mt-8">
        🔒 Search anonymously. 0 Spam Calls. • 100% Free
      </p>
    </div>
  );
}
