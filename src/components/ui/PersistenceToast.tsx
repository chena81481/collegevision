"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X, ArrowRight } from 'lucide-react';

interface PersistenceToastProps {
  isVisible: boolean;
  onResume: () => void;
  onDismiss: () => void;
}

export default function PersistenceToast({ isVisible, onResume, onDismiss }: PersistenceToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="fixed bottom-8 right-8 z-[60] w-full max-w-sm"
        >
          <div className="bg-white rounded-[2rem] p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
            
            <button 
              onClick={onDismiss}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-900 font-black text-sm pr-6">Pick up where you left off?</p>
                <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed">
                  We saved your last AI matching profile. Want to see your results again?
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={onResume}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                Resume Session <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
