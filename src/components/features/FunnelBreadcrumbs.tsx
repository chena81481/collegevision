"use client";

import React, { useState, useEffect } from 'react';
import { Check, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = ["Goals", "Matches", "Comparison", "Application"];

interface FunnelBreadcrumbsProps {
  currentStep: number;
}

export default function FunnelBreadcrumbs({ currentStep }: FunnelBreadcrumbsProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Threshold to detect when it hits the top (Navbar is 64px)
      setIsSticky(window.scrollY > 120);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`w-full bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-[64px] z-40 transition-all duration-300 ${isSticky ? 'py-2 shadow-lg' : 'py-4 md:py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
        
        {/* Progress Steps */}
        <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar py-1">
          {STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2 shrink-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold border-2 transition-all duration-300
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

        {/* Sticky Trust Badge */}
        <div className={`flex items-center gap-2 shrink-0 transition-all duration-500 ${isSticky ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 hidden md:flex'}`}>
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest whitespace-nowrap">0 Spam Calls</span>
          </div>
          
          <AnimatePresence>
            {isSticky && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden lg:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest whitespace-nowrap">AI Verified</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
