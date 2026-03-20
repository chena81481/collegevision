"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { University } from "@/lib/mockData";
import { Star, MapPin, CheckCircle, TrendingUp, Clock, Users, ShieldCheck, ArrowRight, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { calculateROI } from "@/lib/roi-calculator";
import { ROIBadge } from "./ROIBadge";

interface UniversityCardProps {
  university: University;
  onCompareToggle: (uni: University) => void;
  isCompared: boolean;
}

export function UniversityCard({ university, onCompareToggle, isCompared }: UniversityCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("saved_matches")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", university.id)
          .single();
        if (data) setIsSaved(true);
      }
    };
    checkSaved();
  }, [university.id]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please sign in to save universities!");
      router.push("/login");
      return;
    }

    if (isSaved) {
      const { error } = await supabase
        .from("saved_matches")
        .delete()
        .eq("user_id", user.id)
        .eq("course_id", university.id);
      if (!error) setIsSaved(false);
    } else {
      const { error } = await supabase
        .from("saved_matches")
        .insert({ user_id: user.id, course_id: university.id });
      if (!error) setIsSaved(true);
    }
  };

  return (
    <div className="group relative w-full rounded-[28px] overflow-hidden glass-panel bg-white/5 dark:bg-zinc-950/40 border border-white/10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:border-white/20">
      
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${university.brandColor} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 z-0`} />

      <div className="relative z-10 flex flex-col md:flex-row p-6 gap-6">
        
        {/* Left: Logo & Core Info */}
        <div className="flex flex-col items-start gap-4 md:w-1/3 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6">
          <div className="flex items-start justify-between w-full">
            <div className="h-16 w-16 min-w-16 rounded-2xl overflow-hidden bg-white/10 p-1 border border-white/5 shadow-md">
              <img 
                src={university.logo} 
                alt={`${university.name} logo`}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            
            {/* Rating & Save Badge */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className={`p-1.5 rounded-lg border transition-all ${
                  isSaved
                    ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20"
                    : "bg-white/10 border-white/10 text-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30"
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-bold border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Star className="w-4 h-4 fill-current" />
                {university.rating.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold leading-tight group-hover:text-white transition-colors">
              {university.name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-foreground/60">
              <MapPin className="w-3.5 h-3.5" />
              {university.location}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-auto">
            {university.accreditations.map((acc) => (
              <span key={acc} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-foreground/70">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {acc}
              </span>
            ))}
          </div>
        </div>

        {/* Middle: Stats & Metrics */}
        <div className="flex-1 grid grid-cols-2 gap-y-6 gap-x-4 pb-4 md:pb-0 border-b md:border-b-0 border-white/10">
          
          <div className="space-y-1">
            <p className="text-xs text-foreground/50 uppercase tracking-wider font-semibold">1st Year Fees</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black">₹{university.feesPerYear.toLocaleString('en-IN')}</span>
            </div>
            {university.emiAvailable && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                <CheckCircle className="w-3 h-3" /> EMI Ready
              </span>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs text-foreground/50 uppercase tracking-wider font-semibold">Placement Rate</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-indigo-400">{university.placementPercentage}%</span>
              {(() => {
                const roi = calculateROI({
                  totalFee: university.feesPerYear * university.durationYears,
                  avgCTC: Math.round((university.feesPerYear * university.durationYears * 1.8) / 10000) * 10000,
                  durationMonths: university.durationYears * 12,
                  placementRate: university.placementPercentage,
                  isOnline: true,
                });
                return <ROIBadge score={roi.roiScore} />;
              })()}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-foreground/50 uppercase tracking-wider font-semibold">Course Duration</p>
            <div className="flex items-center gap-1.5 text-foreground/90 font-medium">
              <Clock className="w-4 h-4 text-foreground/60" />
              {university.durationYears} Years
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-foreground/50 uppercase tracking-wider font-semibold">Students Enrolled</p>
            <div className="flex items-center gap-1.5 text-foreground/90 font-medium">
              <Users className="w-4 h-4 text-foreground/60" />
              {(university.studentsCount / 1000).toFixed(1)}k+ Active
            </div>
          </div>

        </div>

        {/* Right: Actions */}
        <div className="flex flex-col md:w-[200px] gap-3 justify-center border-l-0 md:border-l border-white/10 md:pl-6">
          <button 
            onClick={() => onCompareToggle(university)}
            className={`w-full py-2.5 rounded-xl border font-semibold text-sm transition-all duration-300 ${
              isCompared 
                ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" 
                : "bg-white/5 border-white/10 text-foreground hover:bg-white/10"
            }`}
          >
            {isCompared ? "✓ Added to Compare" : "+ Add to Compare"}
          </button>
          
          <Link href={`/universities/${university.id}`} className="w-full">
            <button className="w-full py-2.5 rounded-xl bg-foreground text-background font-bold text-sm shadow-xl hover:shadow-white/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              View Profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          {university.admissionStatus === "closing_soon" && (
            <div className="text-center text-xs font-bold text-orange-400 animate-pulse mt-1">
              Admissions Closing Soon!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
