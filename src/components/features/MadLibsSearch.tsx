"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, Sparkles } from 'lucide-react';

interface MadLibsSearchProps {
  onSearch: (query: string) => void;
  onUpdate?: (query: string) => void;
}

const DEGREES = ['MBA', 'MCA', 'BBA', 'BCA', 'B.Com', 'M.Com', 'Data Science'];
const BUDGETS = ['₹1 Lakh', '₹2 Lakhs', '₹3 Lakhs', '₹5 Lakhs', 'Premium'];
const EMI_OPTIONS = ['Zero-Cost EMI', 'Standard EMI', 'No EMI'];

export default function MadLibsSearch({ onSearch, onUpdate }: MadLibsSearchProps) {
  const [degree, setDegree] = useState(DEGREES[0]);
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [emi, setEmi] = useState(EMI_OPTIONS[0]);

  // Real-time updates for reactive UI elements
  React.useEffect(() => {
    if (onUpdate) {
      onUpdate(`Online ${degree} with budget under ${budget} and ${emi}`);
    }
  }, [degree, budget, emi, onUpdate]);

  const handleApply = () => {
    const query = `Online ${degree} with budget under ${budget} and ${emi}`;
    onSearch(query);
  };

  const SelectWrapper = ({ value, onChange, options, colorClass }: any) => (
    <div className="relative inline-block group">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none bg-transparent border-b-2 border-slate-200 hover:border-blue-500 font-black text-blue-600 focus:outline-none cursor-pointer pr-6 transition-all duration-300 ${colorClass}`}
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white/60 backdrop-blur-2xl border border-white/80 p-8 md:p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-y-6 gap-x-3 text-xl md:text-3xl font-bold text-slate-800 leading-relaxed text-center">
        <span className="text-slate-500 font-medium">I want an online</span>
        <SelectWrapper 
          value={degree} 
          onChange={setDegree} 
          options={DEGREES} 
          colorClass="text-blue-600 border-blue-100"
        />
        <span className="text-slate-500 font-medium">with a budget under</span>
        <SelectWrapper 
          value={budget} 
          onChange={setBudget} 
          options={BUDGETS} 
          colorClass="text-emerald-600 border-emerald-100"
        />
        <span className="text-slate-500 font-medium">and I need</span>
        <SelectWrapper 
          value={emi} 
          onChange={setEmi} 
          options={EMI_OPTIONS} 
          colorClass="text-violet-600 border-violet-100"
        />
        <span className="text-slate-500 font-medium">.</span>
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -12px rgba(37, 99, 235, 0.3)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleApply}
          className="group relative flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all overflow-hidden"
        >
          <span className="relative z-10">Find Best Matches</span>
          <Search className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
        
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <Sparkles className="w-3 h-3 text-blue-500" /> 
          AI Matcher Active
        </p>
      </div>
    </motion.div>
  );
}
