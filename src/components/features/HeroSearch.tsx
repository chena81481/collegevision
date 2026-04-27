"use client";

import React from 'react';
import { Search, Sparkles, MessageSquare, LayoutGrid, Wallet, TrendingUp, Clock, Target } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroTrustMarquee from './HeroTrustMarquee';
import { parseIntentFromQuery } from '@/lib/intent-utils';
import IntentTags from './IntentTags';
import MadLibsSearch from './MadLibsSearch';

const SUGGESTIONS = [
  { text: "MBA under ₹2L with 0% EMI", icon: <Wallet className="w-3 h-3" /> },
  { text: "B.Sc Data Science (fastest ROI)", icon: <TrendingUp className="w-3 h-3" /> },
  { text: "Part-time MBA (working professionals)", icon: <Clock className="w-3 h-3" /> },
  { text: "₹50K budget courses", icon: <Target className="w-3 h-3" /> }
];

interface HeroSearchProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onSuggestionClick?: (text: string) => void;
  isLoading?: boolean;
  parsedIntent?: string | null;
}

export default function HeroSearch({ query, setQuery, onSearch, onSuggestionClick, isLoading, parsedIntent }: HeroSearchProps) {
  const posthog = usePostHog();
  const [isMadLibs, setIsMadLibs] = React.useState(false);
  const parsedTokens = parseIntentFromQuery(query);

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    posthog.capture('quick_start_clicked', { suggestion: text });
    if (onSuggestionClick) {
      onSuggestionClick(text);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    onSearch(e);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      {/* Mode Toggle */}
      <div className="flex justify-center gap-2 mb-8">
        <button 
          onClick={() => setIsMadLibs(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${!isMadLibs ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Free Text
        </button>
        <button 
          onClick={() => setIsMadLibs(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${isMadLibs ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
        >
          <LayoutGrid className="w-3.5 h-3.5" /> Guided Mode
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isMadLibs ? (
          <motion.div
            key="free-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className={`w-6 h-6 ${query ? 'text-blue-600' : 'text-slate-400'} group-focus-within:text-blue-600 transition-colors duration-300`} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your career goal in plain English..."
                className="block w-full pl-16 pr-36 py-6 md:py-8 bg-white border-2 border-slate-100 rounded-[2.5rem] text-lg md:text-xl font-bold placeholder:text-slate-400 text-slate-800 transition-all duration-500 hover:border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-2xl group-hover:shadow-blue-900/5"
              />
              <div className="absolute inset-y-2 right-2 flex items-center">
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="h-full px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.8rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:bg-slate-100 disabled:text-slate-300"
                >
                  {isLoading ? '...' : 'Search'}
                </button>
              </div>
            </form>

            <IntentTags tokens={parsedTokens} />
          </motion.div>
        ) : (
          <motion.div
            key="mad-libs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MadLibsSearch onSearch={(q) => {
              setQuery(q);
              onSearch(new Event('submit') as any);
            }} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Micro-copy for AI Confidence */}
      <p className="text-center text-slate-400 text-[10px] md:text-xs mt-3 font-medium uppercase tracking-wider">
        Our engine analyzes <span className="text-blue-600 font-black">15,000+ data points</span> instantly to understand your goals.
      </p>

      {/* Decluttered Trust Marquee */}
      <HeroTrustMarquee />

      {/* Intent Feedback Chip */}
      {parsedIntent && (
        <div className="flex justify-center mt-4">
          <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-100 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
              AI Matching for: <span className="text-slate-900">{parsedIntent}</span>
            </p>
          </div>
        </div>
      )}

      {/* 3. Reassurance Micro-copy */}
      <p className="text-[11px] text-slate-400 uppercase tracking-widest font-black text-center mt-4">
        🔒 Search anonymously. 0 Spam Calls. • 100% Free
      </p>

      {/* Quick-Start Conversational Chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSuggestionClick(sug.text)}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-full text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all shadow-sm"
          >
            {sug.icon}
            {sug.text}
          </button>
        ))}
      </div>
    </div>
  );
}
