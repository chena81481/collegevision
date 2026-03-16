"use client";

import React, { useState } from "react";
import { University } from "@/lib/mockData";
import { 
  Star, MapPin, CheckCircle, ShieldCheck, Download, PlayCircle, Users, ExternalLink, Briefcase, TrendingUp,
  Video, ThumbsUp, Sparkles, UserCheck, Shield
} from "lucide-react";

interface ProfileProps {
  university: University;
}

export function UniversityProfileContent({ university }: ProfileProps) {
  const [viewMode, setViewMode] = useState<"student" | "parent">("student");

  // Calculate Mock True ROI Metrics
  const totalCost = university.feesPerYear * university.durationYears;
  const expectedSalary = Math.round((totalCost * 1.8) / 10000) * 10000; // Mock 180% ROI
  const breakEvenMonths = Math.round((totalCost / (expectedSalary / 12)) * 10) / 10;

  return (
    <>
      {/* DYNAMIC THEMING ENGINE: Background gradients adapt to the university's brand color */}
      <div className="fixed inset-0 pointer-events-none -z-10 transition-colors duration-1000">
        <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br ${university.brandColor} opacity-[0.07] blur-[120px] mix-blend-screen transition-all duration-1000`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl ${university.brandColor} opacity-[0.05] blur-[100px] mix-blend-screen transition-all duration-1000`} />
      </div>

      {/* Mode Toggle Switch */}
      <div className="flex justify-center mb-12 animate-fade-in-up">
        <div className="glass-panel p-1.5 rounded-full border border-white/10 flex items-center bg-black/40 backdrop-blur-3xl shadow-2xl relative">
          
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[140px] md:w-[160px] rounded-full transition-transform duration-500 ease-spring ${
              viewMode === "student" ? "translate-x-0" : "translate-x-full"
            } bg-gradient-to-r ${university.brandColor}`}
          />
          
          <button 
            onClick={() => setViewMode("student")}
            className={`relative z-10 w-[140px] md:w-[160px] py-3 text-sm font-bold rounded-full transition-colors flex items-center justify-center gap-2 ${
              viewMode === "student" ? "text-white" : "text-foreground/50 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" /> Student Mode
          </button>
          
          <button 
            onClick={() => setViewMode("parent")}
            className={`relative z-10 w-[140px] md:w-[160px] py-3 text-sm font-bold rounded-full transition-colors flex items-center justify-center gap-2 ${
              viewMode === "parent" ? "text-white" : "text-foreground/50 hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4" /> Parent Mode
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-start mb-12 animate-fade-in-up">
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[32px] overflow-hidden bg-white/10 p-2 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] shrink-0 group">
              <img src={university.logo} alt={university.name} className="w-full h-full object-cover rounded-[24px] group-hover:scale-105 transition-transform" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-2">
                {university.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base font-medium text-foreground/70">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {university.location}</span>
                <span className="w-1 h-1 rounded-full bg-foreground/30" />
                <span className="flex items-center gap-1.5 text-yellow-500"><Star className="w-4 h-4 fill-current" /> {university.rating} / 5.0</span>
                <span className="w-1 h-1 rounded-full bg-foreground/30" />
                <span className="flex items-center gap-1.5 text-emerald-400"><Users className="w-4 h-4" /> {(university.studentsCount / 1000).toFixed(1)}k+ Students</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {university.accreditations.map(acc => (
              <div key={acc} className="glass-panel px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {acc} Approved
              </div>
            ))}
          </div>
          
          <p className="text-lg text-foreground/80 leading-relaxed max-w-3xl">
            Experience world-class education with {university.name}. Ranked among the top institutions in {university.location.split(',')[0]} for outstanding placement records and modern hybrid-learning facilities.
          </p>
        </div>

        {/* Quick Apply Card */}
        <div className={`w-full lg:w-1/3 glass-panel bg-gradient-to-br ${university.brandColor} bg-opacity-10 p-1 rounded-[32px] relative overflow-hidden shadow-2xl transition-all duration-500`}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl z-0" />
          <div className="relative z-10 p-6 sm:p-8 flex flex-col gap-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Estimated Total Fees</p>
              <h2 className="text-4xl font-black text-white">₹{totalCost.toLocaleString('en-IN')}</h2>
              {university.emiAvailable && (
                <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full mt-2 border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" /> No Cost EMI Available
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <button className={`w-full py-4 rounded-2xl bg-gradient-to-r ${university.brandColor} text-white font-black shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] transition-transform flex justify-center items-center gap-2`}>
                Start Application <ExternalLink className="w-5 h-5" />
              </button>
              <button className="w-full py-4 rounded-2xl glass-panel bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-colors flex justify-center items-center gap-2">
                <Download className="w-5 h-5" /> Download Brochure
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conditionally Rendered Grids by viewMode */}
      <div className="animate-fade-in-up">
        {viewMode === "student" ? (
          <div className="space-y-16">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Virtual Campus Tour */}
              <div className="glass-panel rounded-[32px] overflow-hidden border border-white/10 relative group h-[400px]">
                <img 
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80" 
                  alt="Campus Tour" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform border border-white/20">
                    <PlayCircle className="w-10 h-10 text-white fill-white/20" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">360° Virtual Campus Tour</h3>
                    <p className="text-white/80 font-medium">Explore classrooms, labs, and hostels before applying.</p>
                  </div>
                </div>
              </div>

              {/* Tech Stack & Campus Life */}
              <div className="glass-panel rounded-[32px] border border-white/10 p-8 space-y-8 bg-white/5">
                 <h3 className="text-2xl font-bold">Campus Life & Tech</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">💻</div>
                      <h4 className="font-bold">Next-Gen Labs</h4>
                      <p className="text-sm text-foreground/50 mt-1">AI & Robotics centers open 24/7.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">🚀</div>
                      <h4 className="font-bold">Hackathons</h4>
                      <p className="text-sm text-foreground/50 mt-1">4 major national events hosted yearly.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">🌍</div>
                      <h4 className="font-bold">Global Exchange</h4>
                      <p className="text-sm text-foreground/50 mt-1">Tie-ups with 50+ foreign universities.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">🎸</div>
                      <h4 className="font-bold">Cultural Fests</h4>
                      <p className="text-sm text-foreground/50 mt-1">Massive annual music & arts festivals.</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Reviews & Ratings 2.0 (Video + AI Summaries) */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-400 fill-current" /> Reviews & Ratings 2.0
              </h3>
              
              <div className="flex flex-col lg:flex-row gap-8">
                 {/* AI Summary Sidebar */}
                 <div className="w-full lg:w-1/3">
                    <div className="glass-panel p-6 rounded-3xl border border-violet-500/30 bg-violet-600/10 space-y-6">
                       <h4 className="font-bold flex items-center gap-2 text-violet-300">
                         <Sparkles className="w-5 h-5 text-yellow-400" /> AI Review Analysis
                       </h4>
                       <p className="text-sm text-violet-200/80">Based on 1,240 verified student reviews across Google and our platform.</p>
                       
                       <div className="space-y-4">
                         <div className="space-y-2">
                           <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Pros</p>
                           <ul className="text-sm text-white/90 space-y-1 list-disc pl-4 marker:text-emerald-500">
                             <li>Excellent modern infrastructure</li>
                             <li>Highly approachable faculty</li>
                             <li>Strong campus placement cell</li>
                           </ul>
                         </div>
                         <div className="space-y-2 pt-2">
                           <p className="text-xs font-bold uppercase tracking-wider text-rose-400">Cons</p>
                           <ul className="text-sm text-white/90 space-y-1 list-disc pl-4 marker:text-rose-500">
                             <li>Hostel fees are slightly high</li>
                             <li>Strict attendance rules (75% mandatory)</li>
                           </ul>
                         </div>
                       </div>
                    </div>
                 </div>

                 {/* Video Reviews Layout */}
                 <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: "Aditi S.", role: "B.Tech CSE '25", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", title: "Best Coding Culture" },
                      { name: "Rohan M.", role: "MBA Finance '24", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", title: "Placements exceeded expectations!" },
                    ].map((review) => (
                      <div key={review.name} className="glass-panel rounded-[24px] overflow-hidden border border-white/10 group cursor-pointer relative shadow-lg">
                        <div className="h-40 bg-zinc-800 relative">
                           <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=80" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt="review cover" />
                           <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                               <Video className="w-6 h-6 text-white" />
                             </div>
                           </div>
                           <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-black text-[10px] font-black rounded-full flex items-center gap-1 shadow-md uppercase tracking-wider">
                             <UserCheck className="w-3 h-3" /> Verified Student
                           </div>
                        </div>
                        <div className="p-4 flex gap-3">
                           <img src={review.img} className="w-10 h-10 rounded-full object-cover border border-white/20" alt={review.name}/>
                           <div>
                             <h4 className="font-bold text-sm text-white line-clamp-1">"{review.title}"</h4>
                             <p className="text-xs text-foreground/50 mt-0.5">{review.name} • {review.role}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
            
          </div>
        ) : (
          <div className="space-y-16">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* True ROI Engine Widget */}
              <div className="glass-panel rounded-[32px] p-8 border border-white/10 flex flex-col bg-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-emerald-400" /> True ROI Engine™
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold tracking-wider uppercase backdrop-blur-md">Live Data</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1">
                    <p className="text-xs text-foreground/50 uppercase font-semibold tracking-wider">Total Cost</p>
                    <p className="text-xl font-bold text-red-400 flex items-baseline gap-1">₹{(totalCost/100000).toFixed(2)}L <span className="text-xs font-normal">total</span></p>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1">
                    <p className="text-xs text-foreground/50 uppercase font-semibold tracking-wider">Avg. Starting Salary</p>
                    <p className="text-xl font-bold text-emerald-400 flex items-baseline gap-1">₹{(expectedSalary/100000).toFixed(2)}L <span className="text-xs font-normal">/ yr</span></p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="relative w-full h-8 bg-zinc-800 rounded-full overflow-hidden mb-4 border border-white/5 shadow-inner">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-yellow-500" style={{ width: '35%' }} />
                    <div className="absolute top-0 left-[35%] h-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: '65%' }} />
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:24px_24px] pointer-events-none" />
                  </div>
                  <p className="text-lg font-bold text-center">
                    Estimated Break-Even Time: <span className="font-black text-emerald-400">{breakEvenMonths} Months</span>
                  </p>
                  <p className="text-sm text-foreground/50 text-center mt-2 font-medium">
                    Based on verified salary data of {university.placementPercentage}% placed graduates.
                  </p>
                </div>
              </div>

              {/* Security & Approvals */}
              <div className="glass-panel rounded-[32px] border border-white/10 p-8 space-y-8 bg-white/5">
                 <h3 className="text-2xl font-bold flex items-center gap-3">
                   <ShieldCheck className="w-6 h-6 text-blue-400" /> Approvals & Safety
                 </h3>
                 <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-black/20 border border-emerald-500/20 flex gap-4 items-center">
                       <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
                       <div>
                         <h4 className="font-bold text-white">Government Approved</h4>
                         <p className="text-sm text-foreground/60 mt-0.5">Fully recognized by UGC, AICTE, and Ministry of Education.</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex gap-4 items-center">
                       <ShieldCheck className="w-8 h-8 text-blue-400 shrink-0" />
                       <div>
                         <h4 className="font-bold text-white">Campus Safety Rating: 4.8/5</h4>
                         <p className="text-sm text-foreground/60 mt-0.5">24/7 CCTV surveillance, secured hostels, and anti-ragging squad active.</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex gap-4 items-center">
                       <ThumbsUp className="w-8 h-8 text-yellow-500 shrink-0" />
                       <div>
                         <h4 className="font-bold text-white">No Hidden Fees Guarantee</h4>
                         <p className="text-sm text-foreground/60 mt-0.5">Transparent fee structure with exact breakdown supplied upfront.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Live LinkedIn Alumni Feed (Social Proof) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-blue-400" /> Recent Alumni Placements
                </h3>
                <span className="text-sm font-bold text-blue-400 flex items-center gap-1 cursor-pointer hover:underline">Powered by LinkedIn <ExternalLink className="w-3 h-3"/></span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "Priya Sharma", role: "Software Engineer at Google", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
                  { name: "Rahul Verma", role: "Product Manager at Amazon", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80" },
                  { name: "Neha Gupta", role: "Data Scientist at Microsoft", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" }
                ].map((alumni) => (
                  <div key={alumni.name} className="glass-panel p-6 rounded-[24px] border border-white/10 flex items-center gap-4 hover:border-blue-500/30 transition-colors cursor-pointer shadow-lg group">
                    <img src={alumni.img} alt={alumni.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-blue-400/50 transition-colors" />
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground text-sm group-hover:text-blue-300 transition-colors">{alumni.name}</h4>
                      <p className="text-xs text-foreground/60 mt-1">{alumni.role}</p>
                      <p className="text-[10px] uppercase font-bold text-blue-400 mt-2 tracking-wider flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> Verified Graduate
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

    </>
  );
}
