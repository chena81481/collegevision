"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BarChart3, TrendingUp, CheckCircle, Info, Filter, Search, BadgeIndianRupee, ShieldCheck } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import type { CourseMatch } from '@/lib/types';
import { parseIntentFromQuery } from '@/lib/intent-utils';

interface DynamicMatchSidebarProps {
  isSearching: boolean;
  results: CourseMatch[] | null;
  query?: string;
}

export default function DynamicMatchSidebar({ isSearching, results, query }: DynamicMatchSidebarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const posthog = usePostHog();

  const loadingSteps = [
    "Parsing budget constraints...",
    "Filtering UGC-DEB and NAAC approvals...",
    "Analyzing ROI against historical data...",
    "Generating personalized shortlist..."
  ];

  // Cycle through loading steps
  useEffect(() => {
    if (!isSearching) {
      setLoadingStep(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [isSearching, loadingSteps.length]);

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

  useEffect(() => {
    if (isSearching || (results && results.length > 0)) return;

    const timer = window.setInterval(() => {
      setPreviewIndex((current) => (current + 1) % 3);
    }, 2800);

    return () => window.clearInterval(timer);
  }, [isSearching, results]);

  const activeResults = results || [];
  const previewPrompts = [
    'online mba under 2 lakh with emi',
    'online mca with strong placements in tech',
    'bba degree with scholarship support',
  ];
  const previewCards = [
    { name: 'Amity Online', fit: '94% fit', detail: 'High ROI and zero-cost EMI support', accent: 'bg-emerald-500' },
    { name: 'Jain Online', fit: '91% fit', detail: 'Balanced fee, approvals, and flexibility', accent: 'bg-sky-500' },
    { name: 'LPU Online', fit: '89% fit', detail: 'Budget-safe with faster admission flow', accent: 'bg-violet-500' },
  ];

  return (
    <div className="w-full h-full min-h-[450px] bg-slate-50 rounded-[3rem] border border-slate-200 shadow-inner p-6 flex flex-col overflow-hidden relative">
      <AnimatePresence mode="wait">
        
        {/* 1. INITIAL EMPTY STATE (Before User Interacts) */}
        {!isSearching && activeResults.length === 0 && (!query || query.length <= 3) && (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-xl overflow-hidden flex-1 flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-200">AI Match Preview</p>
                    <h3 className="mt-1 text-lg font-black">Tell CollegeVision what matters</h3>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-blue-200" />
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                    Example Search
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={previewPrompts[previewIndex]}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35 }}
                      className="mt-2 text-sm font-bold text-slate-800"
                    >
                      {previewPrompts[previewIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="mt-4 space-y-3">
                  {previewCards.map((card, index) => (
                    <motion.div
                      key={card.name}
                      animate={{
                        scale: previewIndex === index ? 1 : 0.97,
                        opacity: previewIndex === index ? 1 : 0.58,
                        y: previewIndex === index ? 0 : 4,
                      }}
                      transition={{ duration: 0.35 }}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{card.name}</h4>
                          <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black text-white ${card.accent}`}>
                          {card.fit}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-auto pt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      <BadgeIndianRupee className="w-3.5 h-3.5" />
                      Budget Logic
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-800">Fees and EMI scored before ranking.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Trust Layer
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-800">Approvals and fit reasons appear instantly.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. LOADING STATE (After 'Match Me' Click) */}
        {(isSearching || (query && query.length > 3 && activeResults.length === 0)) && (
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
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 animate-pulse">
                {isSearching ? '✨ Smart matching in progress' : '🧠 AI is brainstorming...'}
              </h3>
              
              <div className="h-4 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={isSearching ? loadingStep : 'brainstorming'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs text-blue-600 font-bold"
                  >
                    {isSearching 
                      ? loadingSteps[loadingStep] 
                      : `Parsing requirements for "${query}"`}
                  </motion.p>
                </AnimatePresence>
              </div>
              
              {!isSearching && query && query.length > 3 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4 pt-4 border-t border-blue-50">
                  {parseIntentFromQuery(query).map((token, i) => (
                    <motion.span 
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg border border-blue-100"
                    >
                      {token.type}: {token.value}
                    </motion.span>
                  ))}
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-lg animate-pulse">
                    Parsing...
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 3. INTERACTIVE MATCH RESULTS */}
        {!isSearching && activeResults.length > 0 && (
          <motion.div 
            key="results"
            initial={{ x: 50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
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
