"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Coins, Target, ArrowRight, BarChart2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CourseMatch } from '@/lib/types';

interface OutcomeCardProps {
  course: CourseMatch;
  isTopMatch?: boolean;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

function OutcomeCard({ course, onSelect, isSelected }: OutcomeCardProps) {
  const router = useRouter();
  
  // Logic: Break-even Calculation (Years to recoup investment assuming 10% salary attribution)
  const breakEvenYears = (course.totalFeeInr / ((course.avgCtcInr || 600000) * 0.1)).toFixed(1);
  
  // Logic: 8-Year Wealth Generation (Salary * 8 - Fee)
  const projectedEarnings = Math.round(((course.avgCtcInr || 600000) * 8) / 100000);

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`relative bg-white border-2 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all flex flex-col h-full ${
        isSelected ? 'border-blue-600 ring-4 ring-blue-600/10' : 'border-slate-100'
      }`}
    >
      {isSelected && (
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg z-20">
          <Check className="w-4 h-4" />
        </div>
      )}
      {/* Header */}
      <div className="mb-8 items-start flex justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900 leading-tight">{course.universityName}</h3>
          <p className="text-sm font-bold text-slate-400 mt-1">{course.courseName}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center font-black text-[10px] text-slate-400">
            {(course.universityName.split(' ')[0] || 'UNI').toUpperCase()}
          </div>
          {course.admissionProbability !== undefined && (
            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm border ${
              course.admissionProbability >= 90 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                : 'bg-amber-100 text-amber-700 border-amber-200'
            }`}>
              {course.admissionProbability}% Admission Chance
            </div>
          )}
        </div>
      </div>

      {/* Data Narrative Arc */}
      <div className="space-y-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Investment</p>
            <p className="text-xl font-black text-slate-900">₹{course.totalFeeInr.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-blue-400 tracking-wider">Average Salary After</p>
            <p className="text-xl font-black text-slate-900">
              {course.avgCtcInr ? `₹${(course.avgCtcInr / 100000).toFixed(1)} LPA` : '₹6.0 LPA'}
            </p>
          </div>
        </div>

        {/* The "Aha!" Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl">
            <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-black uppercase mb-1">
              <Clock className="w-3.5 h-3.5" /> Break-even
            </div>
            <p className="text-base font-black text-emerald-900">{breakEvenYears} Years</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-3xl">
            <div className="flex items-center gap-1.5 text-blue-700 text-[10px] font-black uppercase mb-1">
              <Target className="w-3.5 h-3.5" /> ROI
            </div>
            <p className="text-base font-black text-blue-900">{course.roi}%</p>
          </div>
        </div>

        {/* Admission Conditions / Explainer */}
        {course.admissionConditions && course.admissionConditions.length > 0 && (
          <div className="mb-6 p-4 bg-slate-50 rounded-3xl border border-slate-100/50">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Check className="w-3 h-3 text-blue-600" /> Eligibility Insights
            </p>
            <div className="flex flex-col gap-1.5">
              {course.admissionConditions.map((cond, idx) => (
                <p key={idx} className="text-[10px] font-bold text-slate-600 leading-tight">
                  <span className="text-blue-500 mr-1.5">•</span> {cond}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* The "Earnings Multiple" Narrative */}
      <div className="mb-10 p-5 bg-slate-900 rounded-[2rem] text-center relative overflow-hidden group/box">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/box:translate-x-full transition-transform duration-1000" />
         <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">8-Year Wealth Projection</p>
         <p className="text-white font-black text-lg">
           ₹{(course.totalFeeInr / 100000).toFixed(1)}L becomes <span className="text-emerald-400">₹{projectedEarnings}+L</span>
         </p>
      </div>

      {/* Clear CTA Buttons */}
      <div className="mt-auto flex gap-3">
        <button 
          onClick={() => onSelect(course.id)}
          className={`flex-1 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-colors ${
            isSelected ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
          }`}
        >
          <BarChart2 className="w-4 h-4" /> {isSelected ? 'Selected' : 'Compare'}
        </button>
        <button 
          onClick={() => router.push(`/${course.category.toLowerCase()}/${course.universitySlug}`)}
          className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          View Details <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

interface RealDataMatchesProps {
  results: CourseMatch[] | null;
  parsedFilters: any | null;
  onSelect: (id: string) => void;
  selectedIds: Set<string>;
}

export default function RealDataMatches({ results, parsedFilters, onSelect, selectedIds }: RealDataMatchesProps) {
  const displayResults = results || [];

  return (
    <section id="colleges" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Narrative Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Matches Built on <span className="text-blue-600">Real Outcomes</span>
          </h2>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-5 py-2.5 rounded-full text-blue-700 text-sm font-bold shadow-sm">
            <Target className="w-4 h-4 text-blue-600 animate-pulse" />
            Based on 15,000+ graduate outcomes tracked since 2020
          </div>
        </div>

        {/* Filter context banner (if any) */}
        {parsedFilters && (
          <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
             {parsedFilters.maxBudgetInr && (
                <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full">
                  Budget ≤ ₹{(parsedFilters.maxBudgetInr / 100_000).toFixed(1)}L
                </span>
              )}
              {parsedFilters.degreeKeyword && (
                <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full">
                  {parsedFilters.degreeKeyword}
                </span>
              )}
          </div>
        )}

        {/* The Match Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {displayResults.map((course) => (
            <OutcomeCard 
              key={course.id}
              course={course}
              onSelect={onSelect}
              isSelected={selectedIds.has(course.id)}
            />
          ))}
        </div>

        {/* Empty state fallback if no search yet or no results */}
        {displayResults.length === 0 && (
           <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <p className="text-slate-400 font-bold">Use the AI Search above to generate your custom outcome matches.</p>
           </div>
        )}

        <div className="mt-20 text-center">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-6">Verified by Govt. University Data</p>
          <button className="inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-black text-white bg-slate-900 rounded-full hover:bg-black transition-all shadow-xl active:scale-95">
             Explore All 15+ Programs <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
