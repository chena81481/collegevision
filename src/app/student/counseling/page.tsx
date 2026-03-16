"use client";

import React, { useState } from "react";
import { Video, Calendar, MessageCircle, Calculator, Info, PhoneCall } from "lucide-react";

export default function CounselingAndEMIPage() {
  const [loanAmount, setLoanAmount] = useState(250000);
  const [tenureYears, setTenureYears] = useState(3);
  const [interestRate, setInterestRate] = useState(8.5); // Standard Ed Loan
  
  // Basic EMI Calculation
  const r = interestRate / 12 / 100;
  const n = tenureYears * 12;
  const emi = loanAmount * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
  const totalPayment = emi * n;
  
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400 flex items-center gap-3">
          <Video className="w-8 h-8 text-blue-400" />
          Live Counseling & Finance
        </h1>
        <p className="text-foreground/70 mt-1 max-w-xl">
          Schedule a free 1-on-1 video session with verified education experts, or calculate your zero-cost EMI options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Booking Container */}
        <div className="glass-panel p-8 rounded-[32px] border border-white/10 space-y-6 relative overflow-hidden bg-background/50">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
          
          <div className="flex items-center gap-4 border-b border-white/10 pb-6 relative z-10">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" alt="Counselor" className="w-16 h-16 rounded-full object-cover border-2 border-white/20"/>
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Priya Desai</h3>
              <p className="text-sm font-medium text-blue-400">Senior Career Architect</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <h4 className="font-bold">Schedule your session</h4>
            <div className="grid grid-cols-2 gap-4 text-sm font-bold">
              <button className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-600/10 transition-colors">
                <Video className="w-6 h-6 text-foreground/70" />
                In-Browser Video
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-600/10 transition-colors">
                <MessageCircle className="w-6 h-6 text-foreground/70" />
                WhatsApp Chat
              </button>
            </div>

            <div className="pt-4 space-y-3">
               <button className="w-full py-4 text-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-transform flex justify-center items-center gap-2">
                 <Calendar className="w-5 h-5"/>
                 Book Free Slot Now
               </button>
               <button className="w-full py-4 text-center rounded-2xl border border-white/10 hover:bg-white/5 text-foreground font-bold transition-colors flex justify-center items-center gap-2">
                 <PhoneCall className="w-4 h-4"/>
                 Request Instant Callback
               </button>
            </div>
          </div>
        </div>

        {/* EMI Calculator */}
        <div className="glass-panel p-8 rounded-[32px] border border-white/10 space-y-8 bg-zinc-950/80">
          
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="w-6 h-6 text-emerald-400" />
              EMI Calculator
            </h3>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-emerald-500/20">
              Zero Cost Available
            </span>
          </div>

          <div className="space-y-6">
            
            <div className="space-y-3">
              <div className="flex justify-between font-bold">
                <label className="text-foreground/70">Total Course Fee</label>
                <span className="text-emerald-400 text-xl font-black">₹{loanAmount.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" min="50000" max="1500000" step="10000" 
                value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer" 
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between font-bold">
                <label className="text-foreground/70">Tenure (Years)</label>
                <span className="text-white text-lg">{tenureYears} Years</span>
              </div>
              <input 
                type="range" min="1" max="5" step="1" 
                value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-violet-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer" 
              />
            </div>

            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
               <div className="flex justify-between items-center pb-4 border-b border-white/10">
                 <span className="font-bold text-foreground/50">Your Monthly EMI</span>
                 <span className="text-3xl font-black text-white">₹{Math.round(emi).toLocaleString('en-IN')}</span>
               </div>
               
               <div className="flex items-start gap-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                 <Info className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                 <p className="text-xs text-violet-200 leading-relaxed font-medium">
                   Did you know? If you book your admission through our counselor today, our banking partners will waive off the <span className="font-bold">{interestRate}% interest</span> making this a <span className="font-bold underline text-emerald-400">Zero-Cost EMI</span>.
                 </p>
               </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
