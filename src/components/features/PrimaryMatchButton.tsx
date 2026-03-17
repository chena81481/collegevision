"use client";

import React from 'react';
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import { usePostHog } from 'posthog-js/react';

interface PrimaryMatchButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  isLoading?: boolean;
}

export default function PrimaryMatchButton({ onClick, isLoading }: PrimaryMatchButtonProps) {
  const posthog = usePostHog();

  const handleClick = (e: React.MouseEvent) => {
    posthog.capture('hero_primary_cta_clicked');
    if (onClick) onClick(e);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 mt-8">
      {/* 1. High-Hierarchy Pulsing Button */}
      <motion.button
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, 1.02, 1],
          boxShadow: [
            "0px 0px 0px rgba(59, 130, 246, 0)",
            "0px 0px 20px rgba(59, 130, 246, 0.4)",
            "0px 0px 0px rgba(59, 130, 246, 0)"
          ]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        disabled={isLoading}
        className="w-full md:w-[600px] h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-2xl flex items-center justify-center gap-3 text-xl font-black shadow-2xl transition-colors relative overflow-hidden group"
      >
        {/* Animated Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        
        <span>{isLoading ? 'Analyzing...' : 'See Your Perfect Match'}</span>
        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </motion.button>

      {/* 2. Real-Time Social Proof Counter */}
      <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
               <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
            </div>
          ))}
        </div>
        <span className="flex items-center gap-1.5 ml-1">
          <Users className="w-4 h-4 text-emerald-500" />
          <span className="text-slate-900">52,481</span> students matched so far
        </span>
      </div>

      {/* 3. Reassurance Micro-copy */}
      <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">
        100% Free • No Credit Card Required • Official University Data
      </p>
    </div>
  );
}
