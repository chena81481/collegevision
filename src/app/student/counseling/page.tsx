"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Calendar,
  MessageCircle,
  Calculator,
  Info,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Landmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const admissionsMoments = [
  {
    id: "shortlist",
    eyebrow: "Step 01",
    title: "Shortlist smarter, not louder",
    description:
      "Your counselor narrows the right universities by budget, eligibility, placement outcomes, and scholarship odds.",
    metric: "3-5 best-fit universities",
    accent: "from-sky-500 via-cyan-400 to-emerald-300",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    icon: CheckCircle2,
  },
  {
    id: "docs",
    eyebrow: "Step 02",
    title: "Documents prepared before review",
    description:
      "We check transcripts, ID proof, and work history early so the university review moves without last-minute friction.",
    metric: "48-hour document readiness",
    accent: "from-fuchsia-500 via-rose-400 to-orange-300",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    icon: FileCheck,
  },
  {
    id: "offer",
    eyebrow: "Step 03",
    title: "Offer, finance, and admission closure",
    description:
      "Once the offer lands, we help you lock EMI, fee-waiver eligibility, and final enrollment without chasing multiple teams.",
    metric: "Single counselor-led handoff",
    accent: "from-violet-600 via-indigo-500 to-sky-400",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    icon: Landmark,
  },
];

export default function CounselingAndEMIPage() {
  const [loanAmount, setLoanAmount] = useState(250000);
  const [tenureYears, setTenureYears] = useState(3);
  const [interestRate] = useState(8.5);
  const [activeMoment, setActiveMoment] = useState(0);

  const r = interestRate / 12 / 100;
  const n = tenureYears * 12;
  const emi = loanAmount * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveMoment((current) => (current + 1) % admissionsMoments.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  const moment = admissionsMoments[activeMoment];
  const MomentIcon = moment.icon;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-3">
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-white">
          <Video className="h-8 w-8 text-sky-400" />
          Counseling, Admission, and Finance
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-white/65 md:text-base">
          Book an expert session, see how your admission journey moves stage by stage, and estimate an EMI plan before you commit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#07111f] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.28),transparent_38%)]" />

          <AnimatePresence mode="wait">
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -22 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={moment.image} alt={moment.title} className="h-full w-full object-cover opacity-75" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/45 to-transparent" />
                <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${moment.accent}`} />

                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur-md">
                  <MomentIcon className="h-4 w-4 text-white" />
                  <span className="text-[11px] font-black uppercase tracking-[0.24em] text-white/85">{moment.eyebrow}</span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                  <div className="max-w-lg">
                    <h2 className="text-2xl font-black leading-tight text-white md:text-3xl">{moment.title}</h2>
                    <p className="mt-3 max-w-md text-sm leading-6 text-white/75">{moment.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 grid gap-5 border-t border-white/10 bg-black/20 p-5 md:grid-cols-[1fr_auto] md:items-end md:p-7">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-300/85">What happens in this stage</p>
              <p className="mt-2 text-lg font-bold text-white">{moment.metric}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {admissionsMoments.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMoment(index)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                      index === activeMoment
                        ? "border-white/30 bg-white text-slate-900"
                        : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {item.eyebrow}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setActiveMoment((current) => (current - 1 + admissionsMoments.length) % admissionsMoments.length)
                }
                className="rounded-full border border-white/10 bg-white/5 p-3 text-white transition-colors hover:bg-white/10"
                aria-label="Previous admission stage"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveMoment((current) => (current + 1) % admissionsMoments.length)}
                className="rounded-full border border-white/10 bg-white/5 p-3 text-white transition-colors hover:bg-white/10"
                aria-label="Next admission stage"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 px-5 py-5 md:px-7">
            <div className="grid gap-3 sm:grid-cols-2">
              <button className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-sm font-black text-slate-900 transition-transform hover:-translate-y-0.5">
                <Calendar className="h-4 w-4" />
                Book Free Strategy Call
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-bold text-white transition-colors hover:bg-white/10">
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6 rounded-[32px] border border-white/10 bg-zinc-950/85 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:p-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 text-2xl font-bold text-white">
              <Calculator className="h-6 w-6 text-emerald-400" />
              EMI Calculator
            </h3>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300">
              Zero Cost Option
            </span>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                alt="Counselor"
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-300/80">Assigned Counselor</p>
                <h4 className="mt-1 text-lg font-bold text-white">Priya Desai</h4>
                <p className="text-sm text-white/60">Admissions, scholarships, and financing support</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                <Video className="mx-auto mb-1 h-4 w-4" />
                Video Session
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                <PhoneCall className="mx-auto mb-1 h-4 w-4" />
                Instant Callback
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-bold text-white">
                <label className="text-white/60">Total Course Fee</label>
                <span className="text-xl font-black text-emerald-300">Rs {loanAmount.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="1500000"
                step="10000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-emerald-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-bold text-white">
                <label className="text-white/60">Tenure</label>
                <span className="text-lg text-white">{tenureYears} years</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-sky-500"
              />
            </div>

            <div className="rounded-[28px] border border-white/8 bg-black/35 p-5">
              <div className="border-b border-white/10 pb-4">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">Estimated monthly EMI</p>
                <p className="mt-2 text-3xl font-black text-white">Rs {Math.round(emi).toLocaleString("en-IN")}</p>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
                <p className="text-xs leading-6 text-violet-100/85">
                  Students who finalize through counselor support can unlock partner-led fee benefits. That can offset the{" "}
                  <span className="font-bold text-white">{interestRate}% interest</span> and move this closer to a{" "}
                  <span className="font-bold text-emerald-300">zero-cost EMI</span> structure.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
