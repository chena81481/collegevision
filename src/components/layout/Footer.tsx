"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-black/50 backdrop-blur-3xl border-t border-white/5 pt-16 pb-8 px-4 sm:px-6 lg:px-8 mt-24 relative overflow-hidden">
      
      {/* Dynamic Background Glow */}
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[300px] rounded-full bg-gradient-to-t from-violet-600/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-24 relative z-10">
        
        {/* Brand Area */}
        <div className="flex-1 space-y-6">
          <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter">
            <GraduationCap className="h-8 w-8 text-violet-500" />
            <span>College<span className="text-violet-500">Vision</span></span>
          </Link>
          <p className="text-foreground/60 max-w-sm text-sm leading-relaxed">
            The intelligent University Aggregator. Stop guessing, start calculating your ROI, and let AI build your perfect academic journey.
          </p>
          <div className="flex gap-4 pt-2">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
              <a key={idx} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-foreground/50 hover:bg-violet-600/20 hover:text-violet-400 hover:border-violet-500/30 transition-all">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Links Area */}
        <div className="flex-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
           
           <div className="space-y-4">
             <h4 className="font-bold tracking-wider text-sm">Platform</h4>
             <ul className="space-y-3 text-sm text-foreground/60">
               <li><Link href="/universities" className="hover:text-violet-400 transition-colors">Directory</Link></li>
               <li><Link href="/explore" className="hover:text-violet-400 transition-colors">Discovery Match</Link></li>
               <li><Link href="/student/counseling" className="hover:text-violet-400 transition-colors">Career Experts</Link></li>
               <li><Link href="#" className="hover:text-violet-400 transition-colors text-emerald-400 flex items-center gap-1">True ROI Engine<span className="px-1.5 bg-white/10 rounded uppercase text-[8px] font-black">Pro</span></Link></li>
             </ul>
           </div>

           <div className="space-y-4">
             <h4 className="font-bold tracking-wider text-sm">Legal & Trust</h4>
             <ul className="space-y-3 text-sm text-foreground/60">
               <li><a href="#" className="hover:text-white transition-colors">Verification Process</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Student Guarantee</a></li>
             </ul>
           </div>

           <div className="space-y-4 col-span-2 sm:col-span-1">
             <h4 className="font-bold tracking-wider text-sm flex items-center gap-2">Ready? <span className="animate-pulse">🚀</span></h4>
             <p className="text-sm text-foreground/60">Join 50k+ students verifying their future today.</p>
             <Link href="/student/dashboard" className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Student Hub <ArrowRight className="w-4 h-4" />
             </Link>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-foreground/40 gap-4 relative z-10">
        <p>© 2026 CollegeVision AI. All rights strictly reserved.</p>
        <div className="flex gap-4">
           <span>UGC Approved Data</span>
           <span className="w-1 h-1 rounded-full bg-foreground/20 self-center" />
           <span>100% Verified Reviews</span>
        </div>
      </div>

    </footer>
  );
}
