"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getROIRating } from "@/lib/roi-calculator";
import { cn } from "@/lib/utils";

interface ROIBadgeProps {
  roiScore: number;
  className?: string;
}

export function ROIBadge({ roiScore, className }: ROIBadgeProps) {
  const rating = getROIRating(roiScore);

  const configs = {
    high: {
      label: "🎯 High ROI",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: <TrendingUp className="w-3 h-3" />,
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    },
    moderate: {
      label: "🔥 Moderate ROI",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: <TrendingUp className="w-3 h-3" />,
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    },
    low: {
      label: "⚠️ Low ROI",
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: <Minus className="w-3 h-3" />,
      glow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]",
    },
  };

  const config = configs[rating];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all duration-300",
        config.color,
        config.glow,
        className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </motion.div>
  );
}
