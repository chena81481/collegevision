"use client";

import React from "react";
import { calculateROI, ROIInput, formatFeeINR, formatROIScore } from "@/lib/roi-calculator";
import { TrendingUp, AlertTriangle, Clock, Coins, ArrowRight } from "lucide-react";

interface ROIBreakdownProps {
  input: ROIInput;
}

export function ROIBreakdown({ input }: ROIBreakdownProps) {
  const result = calculateROI(input);
  
  const metrics = [
    {
      label: "Total Cost",
      value: formatFeeINR(result.totalCost),
      sub: "Incl. Hidden Fees & Interest",
      icon: <Coins className="w-5 h-5 text-rose-400" />,
      color: "bg-rose-500/10 border-rose-500/20",
    },
    {
      label: "5-Year Potential Gain",
      value: formatFeeINR(result.salaryGain),
      sub: "Expected Salary Growth",
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      color: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Risk Adjustment",
      value: `-${formatFeeINR(result.riskPenalty)}`,
      sub: `${input.placementRate}% Placement Rate`,
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      color: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Payback Period",
      value: `${result.paybackMonths.toFixed(1)} Months`,
      sub: "To recover total cost",
      icon: <Clock className="w-5 h-5 text-blue-400" />,
      color: "bg-blue-500/10 border-blue-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className={`p-4 rounded-2xl border ${m.color} glass-panel transition-all hover:scale-[1.02]`}>
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-xl bg-black/20">
                {m.icon}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{m.label}</p>
                <p className="text-xl font-black text-foreground">{m.value}</p>
              </div>
            </div>
            <p className="text-xs font-medium text-foreground/50">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 glass-panel">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-black text-white flex items-center gap-2">
              ROI Score: <span className="text-violet-300">{formatROIScore(result.roiScore)}</span>
            </h4>
            <p className="text-sm text-white/60 font-medium">Net annual value addition to your career</p>
          </div>
          <div className="hidden sm:block">
             <div className="px-4 py-2 rounded-full bg-white/10 text-xs font-black text-white border border-white/20 uppercase tracking-widest">
               Financial Grade
             </div>
          </div>
        </div>
        
        <div className="relative w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]" 
            style={{ width: `${Math.min(100, (result.roiScore / 1000000) * 100)}%` }} 
          />
        </div>
      </div>
    </div>
  );
}
