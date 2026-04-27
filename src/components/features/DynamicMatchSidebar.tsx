"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BarChart3, TrendingUp, CheckCircle, Info, Filter, Search, BadgeIndianRupee, ShieldCheck, HelpCircle } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import type { CourseMatch } from '@/lib/types';
import { parseIntentFromQuery } from '@/lib/intent-utils';
import Tooltip from '@/components/ui/Tooltip';

interface DynamicMatchSidebarProps {
  isSearching: boolean;
  results: CourseMatch[] | null;
  query?: string;
}

export default function DynamicMatchSidebar({ isSearching, results, query }: DynamicMatchSidebarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isReacting, setIsReacting] = useState(false);
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

  // Reactive "Thinking" pulse when query updates in real-time
  useEffect(() => {
    if (!query || query.length <= 3 || isSearching || (results && results.length > 0)) return;
    
    setIsReacting(true);
    const timer = setTimeout(() => setIsReacting(false), 800);
    return () => clearTimeout(timer);
  }, [query, isSearching, results]);

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
        {!isSearching && activeResults.length === 0 && (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            <div className={`rounded-[2.5rem] border transition-all duration-500 overflow-hidden flex-1 flex flex-col ${isReacting ? 'border-blue-400 shadow-2xl shadow-blue-500/20 bg-blue-50/10' : 'border-slate-200 bg-white shadow-xl'}`}>
              <div className={`px-5 py-4 border-b transition-colors duration-500 ${isReacting ? 'bg-blue-600 border-blue-500' : 'bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 border-slate-100'} text-white`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.24em] transition-colors ${isReacting ? 'text-blue-100' : 'text-blue-200'}`}>
                      {isReacting ? 'AI is Processing...' : 'AI Match Preview'}
                    </p>
                    <h3 className="mt-1 text-lg font-black">
                      {isReacting ? 'Evaluating Options' : 'Tell CollegeVision what matters'}
                    </h3>
                  </div>
                  <motion.div 
                    animate={isReacting ? { rotate: 360, scale: [1, 1.2, 1] } : {}}
                    transition={isReacting ? { duration: 0.8, repeat: Infinity } : {}}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${isReacting ? 'bg-white/20' : 'bg-white/10'}`}
                  >
                    <Sparkles className={`w-5 h-5 transition-colors ${isReacting ? 'text-white' : 'text-blue-200'}`} />
                  </motion.div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className={`rounded-2xl border transition-all duration-500 px-4 py-3 ${isReacting ? 'border-blue-200 bg-blue-50 shadow-sm' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <Search className={`w-3.5 h-3.5 ${isReacting ? 'text-blue-500 animate-pulse' : ''}`} />
                    {query ? 'Current Goal' : 'Example Search'}
                  </div>
                  
                  <div className="min-h-[1.5rem] mt-2">
                    {query ? (
                       <div className="flex flex-wrap gap-1.5">
                         {parseIntentFromQuery(query).map((token, i) => (
                           <motion.span 
                             key={`${token.value}-${i}`}
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border transition-colors ${
                               isReacting ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
                             }`}
                           >
                             {token.value}
                           </motion.span>
                         ))}
                       </div>
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={previewPrompts[previewIndex]}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.35 }}
                          className="text-sm font-bold text-slate-800"
                        >
                          {previewPrompts[previewIndex]}
                        </motion.p>
                      </AnimatePresence>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {previewCards.map((card, index) => (
                    <motion.div
                      key={card.name}
                      animate={{
                        scale: isReacting ? 1.02 : (query ? 1 : (previewIndex === index ? 1 : 0.97)),
                        opacity: isReacting ? 0.9 : (query ? 0.8 : (previewIndex === index ? 1 : 0.58)),
                        y: isReacting ? 0 : (query ? 0 : (previewIndex === index ? 0 : 4)),
                        borderColor: isReacting && index === 0 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(226, 232, 240, 1)'
                      }}
                      transition={{ duration: 0.35 }}
                      className="rounded-2xl border bg-white p-4 relative"
                    >
                      {isReacting && index === 0 && (
                        <div className="absolute inset-0 bg-blue-500/5 animate-pulse rounded-2xl" />
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{card.name}</h4>
                          <p className="mt-1 text-xs text-slate-500">
                            {isReacting ? 'Recalculating fit score...' : card.detail}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black text-white transition-all ${isReacting ? 'bg-blue-600 scale-110' : card.accent}`}>
                            {isReacting ? '...' : card.fit}
                          </span>
                          {!isReacting && (
                            <Tooltip content={`High fit score based on ${card.detail.toLowerCase()}.`}>
                              <HelpCircle className="w-3 h-3 text-slate-300" />
                            </Tooltip>
                          )}
                        </div>
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
                  <Tooltip content="Score based on ROI, degree level alignment, and budget fit.">
                    <HelpCircle className="w-3 h-3 text-blue-400 cursor-help" />
                  </Tooltip>
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
