"use client";

import React from 'react';
import { Check } from "lucide-react";

const STEPS = ["Goals", "Matches", "Comparison", "Application"];

interface FunnelBreadcrumbsProps {
  currentStep: number;
}

export default function FunnelBreadcrumbs({ currentStep }: FunnelBreadcrumbsProps) {
  return (
    <div className="w-full bg-white border-b border-slate-100 sticky top-[64px] md:top-[104px] z-40 overflow-x-auto custom-scrollbar shadow-sm">
      <div className="flex items-center justify-start md:justify-center min-w-max px-6 py-4 md:py-6 mx-auto gap-3 md:gap-4">
        {STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold border-2 transition-colors duration-300
                ${i < currentStep ? "bg-emerald-500 border-emerald-500 text-white" : 
                  i === currentStep ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-400"}`}>
                {i < currentStep ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-[9px] md:text-xs font-black uppercase tracking-widest transition-colors duration-300 whitespace-nowrap
                ${i === currentStep ? "text-slate-900" : "text-slate-400"}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-4 md:w-8 h-[2px] shrink-0 transition-colors duration-300 ${i < currentStep ? "bg-emerald-500" : "bg-slate-100"}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
