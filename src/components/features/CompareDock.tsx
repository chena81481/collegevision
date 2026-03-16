"use client";

import React from "react";
import { University } from "@/lib/mockData";
import { X, ArrowRight, Layers } from "lucide-react";
import Link from "next/link";

interface CompareDockProps {
  selectedUniversties: University[];
  onRemove: (uni: University) => void;
}

export function CompareDock({ selectedUniversties, onRemove }: CompareDockProps) {
  if (selectedUniversties.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up pointer-events-none">
      <div className="container mx-auto max-w-5xl pointer-events-auto">
        <div className="glass-panel bg-zinc-950/80 backdrop-blur-2xl border border-white/20 p-4 rounded-3xl shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-500/20 text-violet-400 rounded-2xl hidden md:block">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">Compare Universities</h4>
              <p className="text-sm text-foreground/50">{selectedUniversties.length} / 4 Selected</p>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center md:justify-start gap-4">
            {/* Render 4 slots (filled or empty) */}
            {[0, 1, 2, 3].map((index) => {
              const uni = selectedUniversties[index];
              return (
                <div 
                  key={index}
                  className="relative w-14 h-14 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center overflow-visible transition-all duration-300"
                >
                  {uni ? (
                    <>
                      <img 
                        src={uni.logo} 
                        alt={uni.name} 
                        className="w-full h-full object-cover rounded-xl p-0.5 bg-white/10"
                      />
                      <button 
                        onClick={() => onRemove(uni)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <span className="text-2xl font-black text-white/10">+</span>
                  )}
                </div>
              );
            })}
          </div>

          <Link href="/compare" className="w-full md:w-auto mt-2 md:mt-0">
            <button 
              disabled={selectedUniversties.length < 2}
              className="w-full relative group px-6 py-4 bg-white text-black font-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/10 hover:shadow-2xl hover:scale-105 transition-all overflow-hidden flex items-center justify-center gap-2"
            >
              {/* Button sweep animation */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
              {selectedUniversties.length < 2 ? "Select at least 2" : "Compare Now"}
              {selectedUniversties.length >= 2 && <ArrowRight className="w-5 h-5" />}
            </button>
          </Link>

        </div>
      </div>
    </div>
  );
}
