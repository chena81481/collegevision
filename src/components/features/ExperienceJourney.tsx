"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Clock, Search, Sparkles, BadgeIndianRupee, CheckCircle2 } from 'lucide-react';

const JOURNEY_STEPS = [
  {
    number: "01",
    title: "Share Your Reality",
    description: 'Select your goals: "I want an online MBA with budget under ₹2L and I need Zero-Cost EMI"',
    time: "1 minute",
    emoji: "🎯",
    bg: "bg-blue-50",
    iconColor: "text-blue-600"
  },
  {
    number: "02",
    title: "See AI-Verified Matches",
    description: "What you get: 3-5 universities that fit YOUR criteria (not random data)",
    time: "15 seconds",
    emoji: "✨",
    metric: "94% match accuracy",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600"
  },
  {
    number: "03",
    title: "Get Zero-Friction Applications",
    description: "What happens: Direct application link + deadline alerts for your favorite courses.",
    time: "30 seconds",
    emoji: "🚀",
    bg: "bg-purple-50",
    iconColor: "text-purple-600"
  }
];

const DEMO_FRAMES = [
  {
    id: 'search',
    label: 'Step 1',
    title: 'Student shares goals',
    subtitle: 'Degree, budget, and EMI preference',
    accent: 'from-sky-500 to-cyan-400',
    chip: 'AI Intake',
  },
  {
    id: 'matches',
    label: 'Step 2',
    title: 'CollegeVision ranks best-fit options',
    subtitle: 'ROI, approvals, EMI, and decision reasons',
    accent: 'from-emerald-500 to-teal-400',
    chip: 'Verified Matches',
  },
  {
    id: 'apply',
    label: 'Step 3',
    title: 'Counselor-ready application flow',
    subtitle: 'Shortlist, documents, and fee planning in one path',
    accent: 'from-violet-500 to-fuchsia-400',
    chip: 'Apply Faster',
  },
];

export default function ExperienceJourney() {
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveFrame((current) => (current + 1) % DEMO_FRAMES.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden border-y border-slate-100">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Your Path to the Right Degree
          </h2>
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm shadow-xl shadow-blue-200">
            <Clock className="w-4 h-4" /> Takes Less Than 2 Minutes
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: The Steps */}
          <div className="space-y-12">
            {JOURNEY_STEPS.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex gap-6 group"
              >
                {/* Step Indicator */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-2xl ${step.bg} ${step.iconColor} flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 transition-transform`}>
                    {step.number}
                  </div>
                  {i < JOURNEY_STEPS.length - 1 && <div className="w-0.5 h-full bg-slate-200 mt-4" />}
                </div>

                {/* Step Content */}
                <div className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{step.title} {step.emoji}</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-200 rounded text-slate-500 font-sans">
                      {step.time}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-3 max-w-md">
                    {step.description}
                  </p>
                  {step.metric && (
                    <div className="inline-block bg-emerald-100 text-emerald-700 text-[11px] font-black px-2 py-1 rounded-md">
                      {step.metric}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Side: The Experience Demo */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative"
          >
            <div className="aspect-video bg-slate-900 rounded-[2rem] shadow-2xl border-[8px] border-slate-800 overflow-hidden relative group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_30%)]" />

              <div className="absolute inset-0 p-4 md:p-5 text-white">
                <div className="h-full rounded-[1.35rem] border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">15 sec live flow</div>
                  </div>

                  <div className="grid h-[calc(100%-57px)] grid-cols-[1.05fr_0.95fr]">
                    <div className="border-r border-white/10 bg-slate-950/40 p-4 md:p-5">
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-300/80">Student Query</div>
                      <motion.div
                        key={DEMO_FRAMES[activeFrame].id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-[13px] font-bold leading-relaxed">
                          <span className="text-white/40 font-medium">I want an</span>
                          <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300">Online MBA</span>
                          <span className="text-white/40 font-medium">with budget under</span>
                          <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-300">₹2 Lakhs</span>
                          <span className="text-white/40 font-medium">and I need</span>
                          <span className="px-2 py-0.5 bg-violet-500/20 border border-violet-500/30 rounded text-violet-300">Zero-Cost EMI</span>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                          {["UGC-DEB", "ROI Focused", "Working Professional"].map((tag) => (
                            <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white/40 border border-white/5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {DEMO_FRAMES.map((frame, index) => (
                          <button
                            key={frame.id}
                            onClick={() => setActiveFrame(index)}
                            className={`rounded-2xl border px-3 py-2 text-left transition-all ${
                              activeFrame === index
                                ? "border-white/25 bg-white/15"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/45">{frame.label}</div>
                            <div className="mt-1 text-xs font-bold text-white/80">{frame.chip}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900/70 via-slate-950 to-slate-900 p-4 md:p-5">
                      <motion.div
                        key={`${DEMO_FRAMES[activeFrame].id}-panel`}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.45 }}
                        className="h-full rounded-[1.25rem] border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300/85">Demo Output</div>
                            <h3 className="mt-2 text-lg font-black leading-tight">{DEMO_FRAMES[activeFrame].title}</h3>
                          </div>
                          <div className={`rounded-full bg-gradient-to-r px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white ${DEMO_FRAMES[activeFrame].accent}`}>
                            {DEMO_FRAMES[activeFrame].chip}
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-white/65">{DEMO_FRAMES[activeFrame].subtitle}</p>

                        <div className="mt-5 space-y-3">
                          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm font-bold">
                                <Sparkles className="w-4 h-4 text-emerald-300" />
                                Amity Online MBA
                              </div>
                              <span className="text-[11px] font-black text-emerald-300">94% fit</span>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-[11px] text-white/70">
                              <span className="flex items-center gap-1"><BadgeIndianRupee className="w-3.5 h-3.5" /> 1.8L total fee</span>
                              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> EMI available</span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Why it matched</div>
                            <ul className="mt-2 space-y-2 text-xs text-white/70">
                              <li>Strong ROI for a budget-capped MBA search</li>
                              <li>Recognized approval stack for safer selection</li>
                              <li>Fee plan supports working professionals</li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: ["0%", "100%"] }} 
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="h-full bg-blue-500" 
                />
              </div>
            </div>

            {/* Float Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Status</p>
                <p className="text-sm font-bold text-slate-900">Application Ready</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
