"use client";

import { Check, Circle, Clock, Send, Award, Landmark, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: "NEW_LEAD", label: "Discovery", icon: Circle },
  { id: "CONTACTED", label: "Counseling", icon: Clock },
  { id: "PROPOSAL", label: "Shortlisting", icon: Send },
  { id: "APPLIED", label: "Application", icon: FileCheck },
  { id: "OFFER", label: "Offer", icon: Award },
  { id: "WON", label: "Enrolled", icon: Landmark },
];

export function StudentTimeline({ currentStatus, applications = [] }: { currentStatus: string, applications?: any[] }) {
  // Map LeadStatus to our Timeline stages
  const statusMap: Record<string, number> = {
    "NEW_LEAD": 0,
    "CONTACTED": 1,
    "PROPOSAL": 2,
    "WON": 5,
    "LOST": -1
  };

  // If they have applications, they might be in "Applied" or "Offer" stages
  let activeIndex = statusMap[currentStatus] ?? 0;
  if (applications.some(a => a.status === "APPLIED")) activeIndex = Math.max(activeIndex, 3);
  if (applications.some(a => a.status === "OFFER_RECEIVED")) activeIndex = Math.max(activeIndex, 4);

  return (
    <div className="w-full py-8">
      <div className="relative flex justify-between">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-1000" 
          style={{ width: `${(activeIndex / (STAGES.length - 1)) * 100}%` }}
        />

        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          
          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center group">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                  isCompleted ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : 
                  isActive ? "bg-white border-4 border-blue-600 text-blue-600 scale-125 shadow-xl" : 
                  "bg-white border-2 border-slate-200 text-slate-400"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div className="mt-4 text-center">
                <div 
                   className={cn(
                     "text-[10px] font-black uppercase tracking-widest transition-colors",
                     isActive ? "text-blue-600" : "text-slate-400"
                   )}
                >
                  {stage.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
