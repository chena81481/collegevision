"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Coins, Target, ArrowRight, BarChart2, Check, Sparkles, AlertTriangle, WalletCards, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CourseMatch } from '@/lib/types';
import ScholarshipBadge from './ScholarshipBadge';
import { LeadCaptureModal } from './LeadCaptureModal';
import Tooltip from '@/components/ui/Tooltip';
import { AlertCircle } from 'lucide-react';

interface OutcomeCardProps {
  course: CourseMatch;
  categoryLabel?: string;
  isTopMatch?: boolean;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

function OutcomeCard({ course, categoryLabel, isTopMatch, onSelect, isSelected }: OutcomeCardProps) {
  const router = useRouter();

  const handleViewDetails = async () => {
    const sessionId =
      typeof window !== 'undefined'
        ? localStorage.getItem('college_vision_journey_id') || crypto.randomUUID()
        : null;

    if (typeof window !== 'undefined' && sessionId) {
      localStorage.setItem('college_vision_journey_id', sessionId);
    }

    try {
      await fetch('/api/student/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventType: 'DETAIL_VIEW',
          eventName: 'UNIVERSITY_DETAILS_OPENED',
          pagePath: `/${course.category.toLowerCase()}/${course.universitySlug}`,
          metadata: {
            course_id: course.id,
            university_slug: course.universitySlug,
            university_name: course.universityName,
            course_name: course.courseName,
            source: 'homepage_match_card',
          },
        }),
      });
    } catch (error) {
      console.error('Failed to track university detail view:', error);
    }

    router.push(`/${course.category.toLowerCase()}/${course.universitySlug}`);
  };
  
  // Financial Adjustment: scholarship reduction
  const finalFee = course.qualifiedScholarship 
    ? course.totalFeeInr - course.qualifiedScholarship.amountSaved 
    : course.totalFeeInr;

  // Logic: Break-even Calculation (Years to recoup investment assuming 10% salary attribution)
  const breakEvenYears = course.aiPaybackMonths
    ? (course.aiPaybackMonths / 12).toFixed(1)
    : (finalFee / ((course.avgCtcInr || 600000) * 0.1)).toFixed(1);
  
  // Logic: 8-Year Wealth Generation (Salary * 8 - Fee)
  const projectedEarnings = Math.round(((course.avgCtcInr || 600000) * 8 - finalFee) / 100000);
  
  // Updated ROI Display (Simplified for demonstration)
  const effectiveRoi = course.aiRoiScore ?? (course.qualifiedScholarship 
    ? Math.round((course.roi || 0) * (1 + (course.qualifiedScholarship.discountPercentage / 100)))
    : course.roi);

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      layout
      className={`relative bg-white border-2 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all flex flex-col h-full ${
        isSelected ? 'border-blue-600 ring-4 ring-blue-600/10' : 'border-slate-100'
      } ${isTopMatch ? 'md:col-span-2 lg:col-span-3 border-blue-200 bg-gradient-to-br from-white via-white to-blue-50/30' : ''}`}
    >
      {categoryLabel && (
        <div className={`absolute -top-4 left-8 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-20 flex items-center gap-2 ${
          isTopMatch ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
        }`}>
          {isTopMatch ? <Sparkles className="w-3 h-3 text-yellow-400" /> : <TrendingUp className="w-3 h-3" />}
          {categoryLabel}
        </div>
      )}
      {isSelected && (
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg z-20">
          <Check className="w-4 h-4" />
        </div>
      )}
      {/* Header */}
      <div className="mb-8 items-start flex justify-between">
        <div className="flex-1 mr-4">
          <h3 className="text-xl font-black text-slate-900 leading-tight">{course.universityName}</h3>
          <p className="text-sm font-bold text-slate-400 mt-1">{course.courseName}</p>
          {course.generatedByAi && (
            <span className="mt-3 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-blue-700">
              Gemini-expanded option
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
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

      {/* Scholarship Highlight - Phase 5 */}
      {course.qualifiedScholarship && (
        <div className="mb-8">
          <ScholarshipBadge {...course.qualifiedScholarship} />
        </div>
      )}

      {/* Data Narrative Arc */}
      <div className="space-y-6 mb-10">
        {course.decisionSummary && (
          <div className="rounded-[2rem] border border-blue-100 bg-blue-50/70 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-500 mb-2">Decision Brief</p>
            <p className="text-sm font-semibold leading-relaxed text-slate-700">{course.decisionSummary}</p>
          </div>
        )}

        {course.aiRoiSummary && (
          <div className="rounded-[2rem] border border-violet-100 bg-violet-50/80 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600">AI ROI Read</p>
              {course.aiOutcomeBand && (
                <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-violet-700 shadow-sm">
                  {course.aiOutcomeBand}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold leading-relaxed text-slate-700">{course.aiRoiSummary}</p>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 relative">
             <Coins className="w-6 h-6" />
             {course.qualifiedScholarship && <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />}
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Investment</p>
            <div className="flex items-center gap-2">
              <p className={`text-xl font-black ${course.qualifiedScholarship ? 'text-slate-400 line-through text-lg' : 'text-slate-900'}`}>
                ₹{course.totalFeeInr.toLocaleString('en-IN')}
              </p>
              {course.qualifiedScholarship && (
                <p className="text-xl font-black text-emerald-600">
                  ₹{finalFee.toLocaleString('en-IN')}
                </p>
              )}
            </div>
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
            <div className="flex items-center gap-1">
              <p className="text-base font-black text-blue-900">{effectiveRoi}%</p>
              {course.qualifiedScholarship && <Sparkles className="w-3 h-3 text-emerald-400" />}
            </div>
            {course.aiRoiScore && (
              <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-blue-500">AI adjusted</p>
            )}
          </div>
        </div>

        {/* Admission Conditions / Explainer */}
        {course.admissionConditions && course.admissionConditions.length > 0 && (
          <div className="mb-6 p-4 bg-slate-50 rounded-3xl border border-slate-100/50">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Check className="w-3 h-3 text-blue-600" /> Eligibility Insights
            </p>
            <div className="flex flex-col gap-1.5">
              {course.admissionConditions.map((cond: string, idx: number) => (
                <p key={idx} className="text-[10px] font-bold text-slate-600 leading-tight">
                  <span className="text-blue-500 mr-1.5">•</span> {cond}
                </p>
              ))}
            </div>
          </div>
        )}

        {course.matchReasons && course.matchReasons.length > 0 && (
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-700">
              <ShieldCheck className="h-3 w-3" /> Why This Match Works
            </p>
            <div className="flex flex-col gap-2">
              {course.matchReasons.slice(0, 3).map((reason) => (
                <p key={reason} className="text-[11px] font-bold leading-snug text-emerald-900">
                  <span className="mr-1.5 text-emerald-500">•</span>{reason}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <WalletCards className="h-3 w-3" /> Affordability Signal
            </p>
            <p className="text-sm font-black text-slate-900">
              {course.monthlyEmiEstimate
                ? `Approx. INR ${course.monthlyEmiEstimate.toLocaleString('en-IN')} / month on zero-cost EMI`
                : "No zero-cost EMI estimate surfaced for this option"}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <Target className="h-3 w-3" /> Best For
            </p>
            <p className="text-sm font-black text-slate-900">{course.recommendedFor || "Outcome-focused learners"}</p>
          </div>
        </div>

        {course.cautionFlags && course.cautionFlags.length > 0 && (
          <div className="flex justify-end pt-2">
            <Tooltip content={
              <div className="space-y-2">
                <p className="border-b border-white/20 pb-1 mb-1 font-black text-amber-400 uppercase tracking-widest text-[8px]">Review Required</p>
                {course.cautionFlags.map((flag, i) => (
                  <p key={i} className="flex gap-2 leading-tight">
                    <span className="text-amber-500">•</span> {flag}
                  </p>
                ))}
              </div>
            }>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-700 hover:bg-amber-100 transition-colors cursor-help">
                <AlertCircle className="w-3 h-3" /> {course.cautionFlags.length} Warning{course.cautionFlags.length > 1 ? 's' : ''}
              </div>
            </Tooltip>
          </div>
        )}
      </div>

      {/* The "Earnings Multiple" Narrative */}
      <div className="mb-10 p-5 bg-slate-900 rounded-[2rem] text-center relative overflow-hidden group/box">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/box:translate-x-full transition-transform duration-1000" />
         <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">8-Year Wealth Projection</p>
         <p className="text-white font-black text-lg">
           ₹{(finalFee / 100000).toFixed(1)}L becomes <span className="text-emerald-400">₹{projectedEarnings}+L</span>
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
        {course.generatedByAi ? (
          <LeadCaptureModal
            defaultUniversityName={course.universityName}
            defaultCourseName={course.courseName}
            trigger={
              <button
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                Verify & Apply <ArrowRight className="w-4 h-4" />
              </button>
            }
          />
        ) : (
          <button 
            onClick={handleViewDetails}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            View Details <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface RealDataMatchesProps {
  results: CourseMatch[] | null;
  parsedFilters: {
    maxBudgetInr?: number | null;
    degreeKeyword?: string | null;
    careerGoal?: string | null;
  } | null;
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
          <div className="flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-5 py-2.5 rounded-full text-blue-700 text-sm font-bold shadow-sm">
              <Target className="w-4 h-4 text-blue-600 animate-pulse" />
              Based on 15,000+ graduate outcomes tracked since 2020
            </div>

            <LeadCaptureModal 
              title="Save Your Perfect Shortlist"
              description="Enter your email to receive this custom ROI analysis and save these matches for later."
              buttonText="SAVE MY SHORTLIST"
              trigger={
                <button className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-black text-white rounded-full font-black text-sm transition-all shadow-xl hover:-translate-y-1 active:scale-95 group">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  💾 SAVE MY SHORTLIST
                </button>
              }
            />
          </div>
          <p className="mt-8 text-sm font-medium text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Each recommendation now explains why it fits, what could block it, and how affordability changes under EMI or scholarship scenarios.
          </p>
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
              {parsedFilters.careerGoal && (
                <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full">
                  Goal: {parsedFilters.careerGoal}
                </span>
              )}
          </div>
        )}

        {/* The Match Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {displayResults.map((course, index) => {
            let label = "";
            if (index === 0) label = "Best Overall Match";
            else if (course.roi === Math.max(...displayResults.map(c => c.roi || 0))) label = "ROI Leader";
            else if (course.durationMonths === Math.min(...displayResults.map(c => c.durationMonths || 999))) label = "Fastest Completion";
            else if (course.approvals.includes("NAAC A++")) label = "Safest Approvals";
            
            return (
              <OutcomeCard 
                key={course.id}
                course={course}
                categoryLabel={label}
                isTopMatch={index === 0}
                onSelect={onSelect}
                isSelected={selectedIds.has(course.id)}
              />
            );
          })}
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
