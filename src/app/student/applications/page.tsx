"use client";

import React, { useState } from "react";
import { CheckCircle2, CircleDashed, FileText, ChevronRight, MessageCircle } from "lucide-react";
import { MOCK_UNIVERSITIES } from "@/lib/mockData";

export default function ApplicationsTracker() {
  const [activeApp, setActiveApp] = useState(0);
  
  // Mock Applications
  const apps = [
    {
      university: MOCK_UNIVERSITIES[0],
      course: "MBA in Finance",
      appliedOn: "Oct 12, 2024",
      status: "under_review",
      steps: [
        { name: "Application Received", completed: true, date: "12 Oct, 10:30 AM", notes: "All base details verified." },
        { name: "Document Verification", completed: true, date: "14 Oct, 02:15 PM", notes: "12th and Grad marksheets approved via OCR." },
        { name: "University Evaluation", completed: false, active: true, date: "In Progress", notes: "Counselor reviewing your profile." },
        { name: "Offer Letter", completed: false, active: false, date: "Expected by 20 Oct", notes: "Downloadable PDF once approved." },
        { name: "Seat Booking", completed: false, active: false, date: "-", notes: "Pay admission fee to lock seat." }
      ]
    },
    {
      university: MOCK_UNIVERSITIES[1],
      course: "PGPG in Marketing",
      appliedOn: "Oct 15, 2024",
      status: "docs_needed",
      steps: [
        { name: "Application Received", completed: true, date: "15 Oct, 09:00 AM", notes: "Base details verified." },
        { name: "Document Verification", completed: false, active: true, date: "Action Required", notes: "Please re-upload Aadhar Card (Blurred image)." },
        { name: "University Evaluation", completed: false, active: false, date: "-", notes: "" },
        { name: "Offer Letter", completed: false, active: false, date: "-", notes: "" },
        { name: "Seat Booking", completed: false, active: false, date: "-", notes: "" }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 animate-fade-in-up">
      
      {/* Left List */}
      <div className="w-full lg:w-1/3 space-y-4">
        <h1 className="text-3xl font-black mb-6">Applications</h1>
        
        {apps.map((app, idx) => (
          <div 
            key={idx}
            onClick={() => setActiveApp(idx)}
            className={`p-4 rounded-3xl border cursor-pointer transition-all duration-300 ${
              activeApp === idx 
                ? "bg-violet-600/10 border-violet-500/30 glass-panel shadow-lg" 
                : "bg-white/5 border-white/10 hover:bg-white/10 opacity-70 hover:opacity-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <img src={app.university.logo} alt={app.university.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate">{app.university.name}</h4>
                <p className="text-xs text-foreground/50">{app.course}</p>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-wider">
                  {app.status === "docs_needed" ? (
                    <span className="text-yellow-400">Action Required</span>
                  ) : (
                    <span className="text-blue-400">Under Review</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

      </div>

      {/* Right Details & Tracker Timeline */}
      <div className="w-full lg:w-2/3">
        <div className="glass-panel border border-white/10 rounded-[32px] p-6 sm:p-10 relative overflow-hidden bg-background/50">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <img src={apps[activeApp].university.logo} className="w-16 h-16 rounded-2xl object-cover" alt="Logo"/>
              <div>
                <h2 className="text-2xl font-black">{apps[activeApp].university.name}</h2>
                <p className="text-foreground/70 font-medium">{apps[activeApp].course}</p>
              </div>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold border border-white/10 transition-colors">
              <MessageCircle className="w-4 h-4 text-violet-400" />
              Chat Support
            </button>
          </div>

          {/* Vertical Timeline (Swiggy UI Style) */}
          <div className="relative pl-6 lg:pl-10 pb-8 space-y-8 z-10">
            {/* Connecting Vertical Line */}
            <div className="absolute top-2 bottom-6 left-[35px] lg:left-[51px] w-0.5 bg-white/10" />

            {apps[activeApp].steps.map((step, idx) => (
              <div key={idx} className="relative flex items-start gap-6 group">
                
                {/* Node */}
                <div className="relative z-10 mt-1">
                  {step.completed ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : step.active ? (
                    <div className="w-6 h-6 rounded-full bg-background border-4 border-violet-500 flex items-center justify-center relative">
                       {/* Pulse ring */}
                       <div className="absolute inset-0 rounded-full border-4 border-violet-500 animate-ping opacity-50" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-background border-[3px] border-white/20 flex items-center justify-center">
                      <CircleDashed className="w-3 h-3 text-white/20" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <h4 className={`text-lg font-bold ${step.active ? 'text-violet-400' : step.completed ? 'text-white' : 'text-foreground/50'}`}>
                      {step.name}
                    </h4>
                    <span className="text-xs font-bold text-foreground/40">{step.date}</span>
                  </div>
                  
                  {step.notes && (
                    <div className={`mt-2 text-sm ${step.active ? 'text-foreground/90' : 'text-foreground/50'}`}>
                      {step.notes}
                      
                      {/* Interactive Step Action (If needed) */}
                      {step.active && apps[activeApp].status === "docs_needed" && idx === 1 && (
                        <div className="mt-4 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5" />
                            <span className="text-sm font-bold">Please re-upload Aadhar Card</span>
                          </div>
                          <button className="px-5 py-2 bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-transform">
                            Upload Now
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
