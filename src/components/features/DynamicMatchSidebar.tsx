"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BarChart3, TrendingUp, CheckCircle, Info, Filter } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import type { CourseMatch } from '@/lib/types';

interface DynamicMatchSidebarProps {
  isSearching: boolean;
  results: CourseMatch[] | null;
}

export default function DynamicMatchSidebar({ isSearching, results }: DynamicMatchSidebarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const posthog = usePostHog();

  // Reset index when fresh results arrive
  useEffect(() => {
    setCurrentIndex(0);
    if (results && results.length > 0) {
      posthog.capture('Sidebar_Match_Viewed', { 
        match_count: results.length,
        top_match: results[0].universityName 
      });
    }
  }, [results, posthog]);

  const activeResults = results || [];

  return (
    <div className="w-full h-full min-h-[450px] bg-slate-50 rounded-[3rem] border border-slate-200 shadow-inner p-6 flex flex-col overflow-hidden relative">
      <AnimatePresence mode="wait">
        
        {/* 1. INITIAL EMPTY STATE (Before User Interacts) */}
        {!isSearching && activeResults.length === 0 && (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-4"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800">Your AI-Profile is empty</h3>
            <p className="text-sm text-slate-500 max-w-[200px]">Enter your goals on the left to see matches with 98% ROI accuracy.</p>
          </motion.div>
        )}

        {/* 2. LOADING STATE (After 'Match Me' Click) */}
        {isSearching && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-6"
          >
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 animate-pulse">✨ Smart matching in progress</h3>
              <p className="text-xs text-slate-500">Analyzing placement data & fee structures...</p>
            </div>
          </motion.div>
        )}

        {/* 3. INTERACTIVE MATCH RESULTS */}
        {!isSearching && activeResults.length > 0 && (
          <motion.div 
            key="results"
            initial={{ x: 50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col h-full"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top AI Match</span>
              <button className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                <Filter className="w-3 h-3" /> Filters
              </button>
            </div>

            {/* Match Card Carousel */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-6 flex-grow flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {activeResults[currentIndex].matchScore}% Match Score
                </div>
                <button className="text-slate-300 hover:text-blue-600 transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">{activeResults[currentIndex].universityName}</h4>
              <p className="text-sm text-slate-500 mb-4">{activeResults[currentIndex].courseName}</p>

              {/* Why Matched Logic Label */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mb-1">
                  <CheckCircle className="w-3 h-3" /> Why this match?
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Fits your requirements for <span className="font-bold">{activeResults[currentIndex].degreeLevel}</span> with <span className="font-bold">{activeResults[currentIndex].roi}% projected ROI</span>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Total Fee</span>
                  <p className="text-sm font-bold text-slate-900">₹{(activeResults[currentIndex].totalFeeInr / 100_000).toFixed(1)}L</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Avg Placement</span>
                  <p className="text-sm font-bold text-slate-900">
                    {activeResults[currentIndex].avgCtcInr 
                      ? `₹${(activeResults[currentIndex].avgCtcInr! / 100_000).toFixed(1)} LPA` 
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => posthog.capture('Sidebar_Compare_Clicked', { university: activeResults[currentIndex].universityName })}
                className="mt-auto w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Add to Comparison <BarChart3 className="w-4 h-4" />
              </button>
            </div>

            {/* Carousel Navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {activeResults.slice(0, 5).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'}`} 
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
