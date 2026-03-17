"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, ArrowRight, X } from 'lucide-react';

interface ComparisonBarProps {
  selectedCount: number;
  onCompare: () => void;
  onClear: () => void;
}

export default function ComparisonBar({ selectedCount, onCompare, onClear }: ComparisonBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
        >
          <div className="bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 pl-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-black text-sm">{selectedCount} Programs Selected</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Ready for ROI Comparison</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={onClear}
                className="p-3 text-slate-400 hover:text-white transition-colors"
                title="Clear Selection"
              >
                <X className="w-5 h-5" />
              </button>
              <button 
                onClick={onCompare}
                disabled={selectedCount < 2}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all
                  ${selectedCount >= 2 
                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                `}
              >
                Compare Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
