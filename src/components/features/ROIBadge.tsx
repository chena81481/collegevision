"use client";

import React from "react";
import { TrendingUp, Award, AlertCircle } from "lucide-react";
import { getROIRating } from "@/lib/roi-calculator";

interface ROIBadgeProps {
  score: number;
  className?: string;
}

export function ROIBadge({ score, className = "" }: ROIBadgeProps) {
  const rating = getROIRating(score);

  const configs = {
    high: {
      label: "High ROI",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
    moderate: {
      label: "Good ROI",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]",
      icon: <Award className="w-3.5 h-3.5" />,
    },
    low: {
      label: "Low ROI",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      glow: "",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[rating];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider backdrop-blur-md transition-all hover:scale-105 ${config.color} ${config.glow} ${className}`}>
      {config.icon}
      {config.label}
    </div>
  );
}
