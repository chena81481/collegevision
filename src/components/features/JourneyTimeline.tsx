"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Search, FileCheck, ClipboardList, Wallet, GraduationCap, CheckCircle2, Clock } from 'lucide-react';

interface TimelineStep {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  status: 'completed' | 'current' | 'upcoming';
  timeEstimate: string;
}

const DEFAULT_STEPS: TimelineStep[] = [
  {
    id: 'match',
    label: 'AI Match Found',
    sublabel: '98% Eligibility Match',
    icon: Search,
    status: 'completed',
    timeEstimate: 'Instant'
  },
  {
    id: 'verify',
    label: 'Document Verification',
    sublabel: 'Upload Marksheets & ID',
    icon: FileCheck,
    status: 'current',
    timeEstimate: '2-3 Days'
  },
  {
    id: 'entrance',
    label: 'Admission Process',
    sublabel: 'Interview / Assessment',
    icon: ClipboardList,
    status: 'upcoming',
    timeEstimate: '1 Week'
  },
  {
    id: 'fee',
    label: 'Course Fee Payment',
    sublabel: 'Secure your seat',
    icon: Wallet,
    status: 'upcoming',
    timeEstimate: 'Immediate'
  },
  {
    id: 'graduation',
    label: 'Graduation',
    sublabel: 'UGC-DEB Degree Award',
    icon: GraduationCap,
    status: 'upcoming',
    timeEstimate: '2 Years'
  }
];

export default function JourneyTimeline() {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-3xl rounded-full -mr-32 -mt-32" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Academic Roadmap</h3>
            <p className="text-sm font-bold text-slate-500 mt-1">Live journey progress for <span className="text-blue-600">Online MBA</span></p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> High Probablity
          </div>
        </div>

        <div className="space-y-12">
          {DEFAULT_STEPS.map((step, idx) => (
            <div key={step.id} className="relative flex gap-8">
              {/* Vertical Line Connector */}
              {idx !== DEFAULT_STEPS.length - 1 && (
                <div 
                  className={`absolute left-[24px] top-[48px] bottom-[-24px] w-0.5 ${
                    step.status === 'completed' ? 'bg-blue-600' : 'bg-slate-100'
                  }`}
                />
              )}

              {/* Step Icon */}
              <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    step.status === 'completed' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : step.status === 'current'
                        ? 'bg-blue-50 text-blue-600 border-2 border-blue-500 animate-pulse ring-4 ring-blue-500/10'
                        : 'bg-slate-50 text-slate-300 border border-slate-100'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </motion.div>
                
                {step.status === 'completed' && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center p-0.5 shadow-sm border border-slate-100">
                    <CheckCircle2 className="w-full h-full text-emerald-500" />
                  </div>
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-black text-sm tracking-tight ${
                      step.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'
                    }`}>
                      {step.label}
                    </h4>
                    <p className={`text-xs font-bold leading-relaxed mt-0.5 ${
                      step.status === 'upcoming' ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {step.sublabel}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                    step.status === 'upcoming' 
                      ? 'bg-slate-50 border-slate-100 text-slate-300' 
                      : 'bg-blue-50 border-blue-100 text-blue-700'
                  }`}>
                    <Clock className="w-3 h-3" /> {step.timeEstimate}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-12 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-xs transition-all active:scale-[0.98] shadow-xl">
          View Detailed Checklist
        </button>
      </div>
    </div>
  );
}
