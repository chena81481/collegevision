"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface MadLibsSearchProps {
  onSearch: (query: string) => void;
}

const DEGREES = ['MBA', 'MCA', 'BBA', 'BCA', 'B.Com', 'M.Com', 'Data Science'];
const INDUSTRIES = ['Tech', 'Management', 'Marketing', 'Finance', 'Human Resources', 'Operations'];
const BUDGETS = ['Under 2 Lakhs', '2-4 Lakhs', '4-6 Lakhs', 'Premium (Flexible)'];

export default function MadLibsSearch({ onSearch }: MadLibsSearchProps) {
  const [degree, setDegree] = useState(DEGREES[0]);
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [budget, setBudget] = useState(BUDGETS[0]);

  const handleApply = () => {
    const query = `Online ${degree} for career in ${industry} within budget ${budget}`;
    onSearch(query);
  };

  return (
    <div className="w-full bg-white/40 backdrop-blur-xl border border-white/60 p-6 md:p-8 rounded-[2.5rem] shadow-2xl">
      <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-2 text-lg md:text-2xl font-bold text-slate-800 leading-relaxed text-center">
        <span>I want to study</span>
        <select 
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
        >
          {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span>to advance my career in</span>
        <select 
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none"
        >
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <span>with a budget of</span>
        <select 
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="bg-violet-50 text-violet-700 px-3 py-1 rounded-xl border-none focus:ring-2 focus:ring-violet-500 cursor-pointer appearance-none"
        >
          {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <span>.</span>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleApply}
        className="mt-8 mx-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all"
      >
        Find Best Matches <Search className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
