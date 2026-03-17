"use client";

import React from 'react';
import { Sparkles, ArrowRight, Wallet, TrendingUp, Clock, Target } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

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
  isLoading?: boolean;
  parsedIntent?: string | null;
}

export default function HeroSearch({ query, setQuery, onSearch, isLoading, parsedIntent }: HeroSearchProps) {
  const posthog = usePostHog();

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    posthog.capture('quick_start_clicked', { suggestion: text });
    // Proactively trigger search if desired, or just let them see it filled
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <form onSubmit={onSearch} className="relative group">
        {/* The AI Input Box */}
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your career goal in plain English..."
          className="w-full px-14 py-5 bg-white border-2 border-slate-100 rounded-3xl text-lg shadow-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
        />
      </form>

      {/* Micro-copy for AI Confidence */}
      <p className="text-center text-slate-400 text-sm mt-3 font-medium">
        AI understands <span className="text-slate-600">budget</span>, <span className="text-slate-600">timeline</span>, and <span className="text-slate-600">career goals</span>.
      </p>

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
