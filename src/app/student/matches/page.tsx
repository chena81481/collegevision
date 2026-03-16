"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, TrendingUp, Briefcase } from "lucide-react";
import { MOCK_UNIVERSITIES } from "@/lib/mockData";
import { UniversityCard } from "@/components/features/UniversityCard";
import Link from "next/link";

export default function AIMatchesPage() {
  const [showWizard, setShowWizard] = useState(false);
  
  // Dummy AI calculation
  const topMatches = MOCK_UNIVERSITIES.slice(0, 3).map((uni, idx) => ({
    ...uni,
    matchScore: 98 - (idx * 3), // 98%, 95%, 92%
    matchReason: idx === 0 
      ? "Strong placement record in Finance matching your career goals."  
      : idx === 1 
      ? "Fits perfectly within your zero-cost EMI budget requirement."
      : "High alumni density in your preferred city (Delhi NCR)."
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            AI Recommendations
          </h1>
          <p className="text-foreground/70 mt-1 max-w-xl">
            These universities are mathematically curated for you based on your academic profile, budget constraints, and post-degree career aspirations.
          </p>
        </div>
        
        <button 
          onClick={() => setShowWizard(!showWizard)}
          className="px-6 py-3 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform flex items-center gap-2"
        >
          {showWizard ? "Close Wizard" : "Retake Match Quiz"}
        </button>
      </div>

      {showWizard ? (
        <div className="glass-panel p-8 rounded-[32px] border border-white/10 relative overflow-hidden bg-background/50">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-violet-900/40 via-transparent to-transparent pointer-events-none" />
           <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8 py-8">
              <h2 className="text-3xl font-black">Let's refine your path.</h2>
              
              <div className="space-y-6 text-left">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground/70">What is your primary career goal?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Corporate Leadership", "Tech Architecture", "Entrepreneurship", "Government Services"].map(btn => (
                      <button key={btn} className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-violet-600/20 hover:border-violet-500/30 transition-colors text-sm font-medium">{btn}</button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <label className="text-sm font-bold text-foreground/70">Max Budget per Year (in Lakhs)</label>
                  <input type="range" min="1" max="10" className="w-full accent-violet-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  <div className="flex justify-between text-xs font-bold text-foreground/50"><span>₹1L</span><span>₹10L+</span></div>
                </div>
              </div>

              <button 
                onClick={() => setShowWizard(false)}
                className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl transition-transform active:scale-95 text-lg"
              >
                Generate New Matches
              </button>
           </div>
        </div>
      ) : (
        <div className="space-y-8">
          {topMatches.map((uni, idx) => (
             <div key={uni.id} className="relative group">
                {/* Custom AI Reason Badge attached to UniversityCard */}
                <div className="absolute -top-4 left-6 z-20 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-lg flex items-center gap-2 border border-white/20 transform group-hover:-translate-y-1 transition-transform">
                  <Sparkles className="w-3 h-3 text-yellow-300" /> 
                  {uni.matchScore}% Match Score: {uni.matchReason}
                </div>
                
                {/* Reusing existing University Card, wrapped slightly for pure display */}
                <div className="pt-4 border-2 border-transparent group-hover:border-violet-500/30 rounded-[32px] transition-colors">
                  <UniversityCard 
                    university={uni} 
                    onCompareToggle={() => {}} 
                    isCompared={false} 
                  />
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
