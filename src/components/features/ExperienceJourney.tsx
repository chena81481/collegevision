"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, Rocket, Clock, PlayCircle } from 'lucide-react';

const JOURNEY_STEPS = [
  {
    number: "01",
    title: "Share Your Reality",
    description: 'What you type: "I have ₹2L budget, can dedicate 10 hrs/week, want tech skills"',
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

export default function ExperienceJourney() {
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
              {/* This would be your GIF or Video of the UI in action */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-white">
                  <PlayCircle className="w-16 h-16 text-blue-500 group-hover:scale-110 transition-transform cursor-pointer" />
                  <span className="font-bold text-sm tracking-widest uppercase">Watch 15-Sec Demo</span>
                </div>
              </div>
              
              {/* Fake UI Overlay to make it feel real */}
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
