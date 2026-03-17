"use client";

import React from 'react';
import { Check } from "lucide-react";

const STEPS = ["Goals", "Matches", "Comparison", "Application"];

interface FunnelBreadcrumbsProps {
  currentStep: number;
}

export default function FunnelBreadcrumbs({ currentStep }: FunnelBreadcrumbsProps) {
  return (
    <div className="w-full py-6 flex justify-center bg-white border-b border-slate-100 sticky top-[104px] z-40">
      <div className="flex items-center gap-2 md:gap-4">
        {STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors duration-300
                ${i < currentStep ? "bg-emerald-500 border-emerald-500 text-white" : 
                  i === currentStep ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-400"}`}>
                {i < currentStep ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors duration-300
                ${i === currentStep ? "text-slate-900" : "text-slate-400"}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-4 md:w-8 h-[2px] transition-colors duration-300 ${i < currentStep ? "bg-emerald-500" : "bg-slate-100"}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
