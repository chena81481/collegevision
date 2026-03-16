"use client";

import React, { useState } from "react";
import { Filter, ChevronDown, CheckSquare, Square, SlidersHorizontal, Trash2 } from "lucide-react";

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
  resultCount: number;
}

const ACCREDITATIONS = ["UGC", "AICTE", "NAAC A++", "NAAC A+", "NAAC A"];
const CITIES = ["Delhi NCR", "Bangalore", "Mumbai", "Pune", "Jaipur"];
const DURATIONS = [2, 3, 4, 5];

export function FilterSidebar({ onFilterChange, resultCount }: FilterSidebarProps) {
  const [selectedAcc, setSelectedAcc] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [emiOnly, setEmiOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(300000);

  const toggleAccreditation = (acc: string) => {
    setSelectedAcc(prev => 
      prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]
    );
  };

  const clearAll = () => {
    setSelectedAcc([]);
    setSelectedCities([]);
    setEmiOnly(false);
    setMaxPrice(300000);
  };

  return (
    <div className="w-full flex-shrink-0 lg:w-72 space-y-6 glass-panel bg-white/5 border border-white/10 rounded-[28px] p-6 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
      
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Filter className="w-5 h-5 text-violet-400" />
          Filters
        </div>
        <button 
          onClick={clearAll}
          className="text-xs font-semibold text-foreground/50 hover:text-red-400 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      {/* Results Meta */}
      <div className="text-sm font-medium text-foreground/70 bg-white/5 py-2 px-3 rounded-xl border border-white/5">
        Showing <span className="font-bold text-white">{resultCount}</span> Universities
      </div>

      {/* Accreditations Section */}
      <div className="space-y-4 pt-2">
        <h4 className="font-bold flex items-center justify-between cursor-pointer group">
          Approvals & Grades
          <ChevronDown className="w-4 h-4 text-foreground/50 group-hover:text-foreground transition-colors" />
        </h4>
        <div className="space-y-2">
          {ACCREDITATIONS.map((acc) => {
            const isSelected = selectedAcc.includes(acc);
            return (
              <label key={acc} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-violet-600 border-violet-500' : 'bg-black/20 border-white/20 group-hover:border-white/40'}`}>
                    {isSelected && <CheckSquare className="w-4 h-4 text-white p-0.5" />}
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-foreground/70 group-hover:text-foreground'}`}>
                    {acc}
                  </span>
                </div>
                {/* Mock counts */}
                <span className="text-xs text-foreground/40 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {Math.floor(Math.random() * 50) + 10}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Budget Slider */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <h4 className="font-bold flex items-center justify-between">
          Max Yearly Fees
          <SlidersHorizontal className="w-4 h-4 text-foreground/50" />
        </h4>
        <div className="space-y-4">
          <input 
            type="range" 
            min="50000" 
            max="500000" 
            step="10000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-xs font-bold text-foreground/60">
            <span>₹50k</span>
            <span className="bg-violet-500/20 text-violet-400 px-2 py-1 rounded-md border border-violet-500/30">
              Up to ₹{(maxPrice / 100000).toFixed(1)}L
            </span>
          </div>
        </div>
      </div>

      {/* EMI Toggle */}
      <div className="pt-6 border-t border-white/10">
        <label className="flex items-center justify-between cursor-pointer group p-3 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-colors">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">EMI Available</span>
            <span className="text-xs text-foreground/50">Zero-cost options</span>
          </div>
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emiOnly ? 'bg-violet-600' : 'bg-white/20'}`}>
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={emiOnly}
              onChange={() => setEmiOnly(!emiOnly)}
            />
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emiOnly ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </label>
      </div>

    </div>
  );
}
