"use client";

import React, { useState } from "react";
import { MOCK_UNIVERSITIES } from "@/lib/mockData";
import { X, Heart, ShieldCheck, MapPin, Star, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion"; // Would require `npm install framer-motion` usually, simulating with pure CSS + React states for this mockup where possible, or minimal framer usage if pre-installed. We'll use CSS for simplicity to avoid deps.

export default function ExploreSwipePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const unis = MOCK_UNIVERSITIES;
  const currentUni = unis[currentIndex];

  const handleSwipe = (dir: "left" | "right") => {
    setDirection(dir);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300); // match CSS animation duration
  };

  if (currentIndex >= unis.length) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center animate-fade-in-up">
         <div className="w-24 h-24 bg-violet-600/20 rounded-full flex items-center justify-center mb-6 border border-violet-500/30">
            <GraduationCap className="w-12 h-12 text-violet-400" />
         </div>
         <h1 className="text-3xl font-black mb-4">You've seen them all!</h1>
         <p className="text-foreground/70 max-w-md mb-8">
           Our AI has analyzed your preferences based on your swipes. Your personalized matches are ready.
         </p>
         <Link href="/student/matches">
           <button className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl transition-transform active:scale-95 shadow-lg shadow-violet-600/20">
             View AI Matches
           </button>
         </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 transition-colors duration-1000">
        <div className={`absolute top-1/4 left-1/4 w-[50%] h-[50%] rounded-full bg-gradient-to-br ${currentUni.brandColor} opacity-[0.05] blur-[150px] mix-blend-screen transition-all duration-1000`} />
      </div>

      <div className="w-full max-w-md flex flex-col h-[85vh] sm:h-[800px] relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 px-2">
           <Link href="/" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10">
             <ChevronLeft className="w-6 h-6" />
           </Link>
           <h2 className="font-bold text-lg tracking-wider uppercase text-foreground/50">Discovery Mode</h2>
           <div className="p-3 bg-white/5 rounded-full border border-white/10 relative">
             <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
             <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold rounded-full flex items-center justify-center text-white">
               {currentIndex}
             </span>
           </div>
        </div>

        {/* Swipe Card Container */}
        <div className="flex-1 relative w-full perspective-1000">
           
           <div 
             className={`absolute inset-0 w-full h-full glass-panel rounded-[40px] border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 ease-out origin-bottom
               ${direction === 'left' ? '-rotate-12 -translate-x-full opacity-0' : ''}
               ${direction === 'right' ? 'rotate-12 translate-x-full opacity-0' : ''}
               ${direction === null ? 'scale-100 opacity-100' : ''}
             `}
           >
              {/* Image Block */}
              <div className="relative h-[55%] w-full bg-zinc-800">
                 <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover opacity-80" alt="Campus"/>
                 <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                 
                 {/* Swipe Indicators (Overlay) */}
                 {direction === 'left' && <div className="absolute top-8 right-8 border-4 border-rose-500 text-rose-500 text-4xl font-black uppercase tracking-widest px-4 py-1 rounded-xl transform rotate-12 bg-black/50 backdrop-blur-sm">Nope</div>}
                 {direction === 'right' && <div className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 text-4xl font-black uppercase tracking-widest px-4 py-1 rounded-xl transform -rotate-12 bg-black/50 backdrop-blur-sm">Like</div>}

                 <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                    <div>
                      <h3 className="text-3xl font-black text-white drop-shadow-md">{currentUni.name}</h3>
                      <p className="text-white/80 font-medium flex items-center gap-1.5 mt-1 drop-shadow-md">
                        <MapPin className="w-4 h-4" /> {currentUni.location}
                      </p>
                    </div>
                    <img src={currentUni.logo} className="w-16 h-16 rounded-2xl object-cover bg-white p-1 border border-white/20 shadow-xl" alt="logo"/>
                 </div>
              </div>

              {/* Data Block */}
              <div className="p-6 flex flex-col h-[45%] bg-background/50">
                 
                 <div className="flex flex-wrap gap-2 mb-4">
                    {currentUni.accreditations.map(acc => (
                      <span key={acc} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-blue-400" /> {acc}
                      </span>
                    ))}
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-4 flex-1">
                    <div className="p-3 bg-black/20 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                       <p className="text-xs text-foreground/50 uppercase font-bold tracking-wider">Placement</p>
                       <p className="text-xl font-black text-emerald-400">{currentUni.placementPercentage}%</p>
                    </div>
                    <div className="p-3 bg-black/20 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                       <p className="text-xs text-foreground/50 uppercase font-bold tracking-wider">Yearly Fee</p>
                       <p className="text-lg font-black text-rose-400">₹{(currentUni.feesPerYear/1000).toFixed(0)}k</p>
                    </div>
                 </div>

                 <p className="text-sm border-t border-white/10 pt-4 text-foreground/70 line-clamp-2">
                   Known for its {currentUni.rating}★ rated campus life and guaranteed 100% placement assistance in the top 500 Fortune companies.
                 </p>
              </div>

           </div>

           {/* Next Card Preview (Stacked effect) */}
           {currentIndex + 1 < unis.length && (
             <div className="absolute inset-0 w-full h-full glass-panel rounded-[40px] border border-white/10 bg-background/30 -z-10 scale-[0.95] translate-y-4 opacity-50" />
           )}

        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-8">
           <button 
             onClick={() => handleSwipe("left")}
             className="w-16 h-16 rounded-full glass-panel bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-400 transition-all font-black text-foreground drop-shadow-2xl"
           >
             <X className="w-8 h-8" />
           </button>

           <button 
             onClick={() => handleSwipe("right")}
             className="w-16 h-16 rounded-full glass-panel border border-emerald-500/50 bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/40 text-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-110"
           >
             <Heart className="w-8 h-8 fill-current" />
           </button>
        </div>

      </div>

    </div>
  );
}
