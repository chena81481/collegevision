"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, ArrowRight, AlertTriangle } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-black/50 backdrop-blur-3xl border-t border-white/5 pt-16 pb-8 px-4 sm:px-6 lg:px-8 mt-24 relative overflow-hidden">
      
      {/* Dynamic Background Glow */}
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[300px] rounded-full bg-gradient-to-t from-violet-600/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-24 relative z-10">
        
        {/* Brand Area */}
        <div className="flex-1 space-y-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xl group-hover:scale-110 transition-transform">
              <img src="/icon.png" alt="CollegeVision Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-2xl tracking-tighter">College<span className="text-blue-500">Vision</span></span>
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
        <div className="flex-[3] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
           
           <div className="space-y-4">
             <h4 className="font-bold tracking-wider text-sm">Programs</h4>
             <ul className="space-y-3 text-sm text-foreground/60">
               <li><Link href="/online-mba" className="hover:text-blue-400 transition-colors">Online MBA</Link></li>
               <li><Link href="/online-mca" className="hover:text-blue-400 transition-colors">Online MCA</Link></li>
               <li><Link href="/online-bba" className="hover:text-blue-400 transition-colors">Online BBA</Link></li>
               <li><Link href="/online-bca" className="hover:text-blue-400 transition-colors">Online BCA</Link></li>
             </ul>
           </div>

           <div className="space-y-4">
             <h4 className="font-bold tracking-wider text-sm">Universities</h4>
             <ul className="space-y-3 text-sm text-foreground/60">
               <li><Link href="/universities" className="hover:text-blue-400 transition-colors">All Universities</Link></li>
               <li><Link href="/universities/amity-online" className="hover:text-blue-400 transition-colors">Amity Online</Link></li>
               <li><Link href="/universities/jain-online" className="hover:text-blue-400 transition-colors">Jain Online</Link></li>
               <li><Link href="/universities/lpu-online" className="hover:text-blue-400 transition-colors">LPU Online</Link></li>
             </ul>
           </div>

           <div className="space-y-4">
             <h4 className="font-bold tracking-wider text-sm">Rankings</h4>
             <ul className="space-y-3 text-sm text-foreground/60">
               <li><Link href="/rankings/best-online-mba-colleges-in-india-2026" className="hover:text-blue-400 transition-colors">Best Online MBA</Link></li>
               <li><Link href="/rankings/best-online-mca-colleges-in-india-2026" className="hover:text-blue-400 transition-colors">Best Online MCA</Link></li>
               <li><Link href="/rankings/best-online-bba-colleges-in-india-2026" className="hover:text-blue-400 transition-colors">Best Online BBA</Link></li>
               <li><Link href="/rankings/best-online-bca-colleges-in-india-2026" className="hover:text-blue-400 transition-colors">Best Online BCA</Link></li>
             </ul>
           </div>

           <div className="space-y-4">
             <h4 className="font-bold tracking-wider text-sm">Resources</h4>
             <ul className="space-y-3 text-sm text-foreground/60">
               <li><Link href="/blog/ugc-deb-approved-online-universities-guide" className="hover:text-blue-400 transition-colors">UGC-DEB Guide</Link></li>
               <li><Link href="/compare" className="hover:text-blue-400 transition-colors">Compare Tool</Link></li>
               <li><Link href="/blog" className="hover:text-blue-400 transition-colors">Career Blog</Link></li>
               <li><Link href="/faq" className="hover:text-blue-400 transition-colors">FAQs</Link></li>
             </ul>
           </div>

           <div className="space-y-4">
             <h4 className="font-bold tracking-wider text-sm">Company</h4>
             <ul className="space-y-3 text-sm text-foreground/60">
               <li><Link href="/faq" className="hover:text-blue-400 transition-colors">About Us</Link></li>
               <li><Link href="/faq" className="hover:text-blue-400 transition-colors">Contact</Link></li>
               <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
               <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">LinkedIn</a></li>
               <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Instagram</a></li>
             </ul>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-foreground/40 gap-6 relative z-10">
        <p>© 2026 CollegeVision AI. All rights strictly reserved.</p>
        
        <div className="flex flex-wrap items-center justify-center gap-6">
           <button className="flex items-center gap-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-full border border-rose-500/20 transition-all font-black uppercase tracking-widest active:scale-95 group">
              <AlertTriangle className="w-3.5 h-3.5 group-hover:animate-bounce" /> Report Spam Call
           </button>
           
           <div className="flex gap-4 items-center">
              <span>UGC Approved Data</span>
              <span className="w-1 h-1 rounded-full bg-foreground/20 self-center" />
              <span>100% Verified Reviews</span>
           </div>
        </div>
      </div>

    </footer>
  );
}
