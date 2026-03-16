"use client";

import React from 'react';
import { CheckCircle2, ShieldCheck, ArrowRight, TrendingUp, Info } from 'lucide-react';
import Link from 'next/link';
import { useFeatureFlagVariantKey } from 'posthog-js/react';

interface MatchCardProps {
  course: any;
  isTopMatch?: boolean;
}

export default function MatchCard({ course, isTopMatch }: MatchCardProps) {
  const ctaVersion = useFeatureFlagVariantKey('match-card-cta-test');
  const percentage = course.matchScore || 0;
  
  // SVG Circle Logic
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`group relative w-full rounded-[32px] overflow-hidden transition-all duration-500 ${
      isTopMatch 
        ? 'bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 shadow-xl shadow-emerald-500/10 scale-[1.02]' 
        : 'bg-white border border-slate-200 hover:shadow-lg'
    }`}>
      
      {isTopMatch && (
        <div className="absolute top-4 right-6 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse z-10">
          Perfect Match
        </div>
      )}

      <div className="p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Match Meter (SVG) */}
          <div className="relative shrink-0 flex flex-col items-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                className={isTopMatch ? 'text-emerald-500' : 'text-blue-500'}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className={`text-2xl font-black ${isTopMatch ? 'text-emerald-600' : 'text-slate-900'}`}>
                {percentage}%
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">AI Score</span>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-2 shrink-0">
                <img src={course.logoUrl || '/logo.png'} alt="University Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{course.name}</h3>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{course.universityName}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {course.matchReasons?.slice(0, 2).map((reason: string) => (
                <span key={reason} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {reason}
                </span>
              ))}
            </div>

            {/* "Why it fits you" Transparency Box */}
            <div className={`p-4 rounded-2xl border ${isTopMatch ? 'bg-emerald-500/5 border-emerald-100' : 'bg-blue-50/50 border-blue-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <Info className={`w-4 h-4 ${isTopMatch ? 'text-emerald-600' : 'text-blue-600'}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isTopMatch ? 'text-emerald-700' : 'text-blue-700'}`}>Why this fits you</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    This selection matches 95% of your career goals and falls comfortably within your chosen budget stretch. 
                    The {course.roi?.totalReturnsFiveYears ? 'high potential ROI' : 'approval status'} makes this a safe premium choice.
                </p>
            </div>
          </div>

          {/* ROI Stats & CTA */}
          <div className="shrink-0 w-full md:w-auto space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated 5-Yr Returns</div>
              <div className="text-2xl font-black text-emerald-600">
                ₹{(course.roi?.totalReturnsFiveYears / 100000).toFixed(1)}L
              </div>
              <div className="flex items-center justify-center gap-1 mt-1 text-emerald-700/60 font-bold text-[10px]">
                 <TrendingUp className="w-3 h-3" /> High ROI Potential
              </div>
            </div>

            <Link href={`/${course.category?.toLowerCase() || 'online-degrees'}/${course.universitySlug || '#'}`} className="block">
              <button className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                isTopMatch 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-900 hover:bg-black text-white'
              }`}>
                {ctaVersion === 'variant' ? 'View ROI Analysis' : 'Apply through AI'} 
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
