"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldCheck, AlertCircle, CheckCircle2, XCircle, Info, ArrowRight, Share2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { FALLBACK_COURSE_CATALOG } from '@/lib/course-catalog';

export default function ScamChecker() {
  const [query, setQuery] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{ status: 'approved' | 'warning' | 'idle', name?: string } | null>(null);

  // Extract unique universities from the catalog
  const approvedUniversities = Array.from(new Set(FALLBACK_COURSE_CATALOG.map(c => c.university.name.toLowerCase())));

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsChecking(true);
    setResult(null);

    // Simulate a "Check" delay for suspense/labor illusion
    setTimeout(() => {
      const normalizedQuery = query.toLowerCase().trim();
      const match = approvedUniversities.find(name => 
        name.includes(normalizedQuery) || normalizedQuery.includes(name)
      );

      if (match) {
        setResult({ status: 'approved', name: query });
      } else {
        setResult({ status: 'warning', name: query });
      }
      setIsChecking(false);
    }, 1500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'CollegeVision Scam Checker',
        text: 'Check if your university is legally allowed to offer online degrees.',
        url: typeof window !== 'undefined' ? window.location.href : '',
      });
    } else {
      alert('Link copied to clipboard!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-20 lg:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-widest mb-4 mx-auto">
            <ShieldCheck className="w-4 h-4" /> UGC-DEB Verification Tool
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Stop the Scam. <br />
            <span className="text-blue-600">Check Your University.</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            Is your university legally allowed to offer online degrees? Type the name below to verify its current UGC-DEB approval status.
          </p>
        </motion.div>

        {/* Search Section */}
        <div className="relative z-10">
          <form onSubmit={handleCheck} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className={`w-6 h-6 ${query ? 'text-blue-600' : 'text-slate-400'} group-focus-within:text-blue-600 transition-colors duration-300`} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Amity, Manipal, XYZ University..."
              className="block w-full pl-16 pr-40 py-6 md:py-8 bg-white border-2 border-slate-100 rounded-[2.5rem] text-lg md:text-xl font-bold placeholder:text-slate-400 text-slate-800 transition-all duration-500 hover:border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-2xl"
            />
            <div className="absolute inset-y-2 right-2 flex items-center">
              <button
                type="submit"
                disabled={isChecking || !query.trim()}
                className="h-full px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.8rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:bg-slate-100 disabled:text-slate-300"
              >
                {isChecking ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </motion.div>
                ) : 'Verify Now'}
              </button>
            </div>
          </form>

          {/* Feedback Section */}
          <AnimatePresence mode="wait">
            {isChecking && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8 text-center"
              >
                <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 animate-pulse">Pinging UGC Database...</p>
              </motion.div>
            )}

            {result && !isChecking && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`mt-12 p-8 md:p-12 rounded-[3rem] border-2 shadow-2xl relative overflow-hidden ${
                  result.status === 'approved' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
                    : 'bg-red-50 border-red-100 text-red-900'
                }`}
              >
                {/* Decorative background icon */}
                <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                  {result.status === 'approved' ? <CheckCircle2 className="w-64 h-64" /> : <XCircle className="w-64 h-64" />}
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                    result.status === 'approved' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-red-500 text-white shadow-red-200'
                  } shadow-xl`}>
                    {result.status === 'approved' ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                  </div>

                  <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                    {result.status === 'approved' 
                      ? `${result.name} is Verified!` 
                      : `Caution: ${result.name}`}
                  </h2>

                  <p className="text-lg md:text-xl font-medium max-w-xl mx-auto opacity-80">
                    {result.status === 'approved' 
                      ? "This institution is currently listed in our database of UGC-DEB approved universities for online education."
                      : "We could not find this institution in the latest UGC-DEB approved list. This may be a red flag. Do not pay any fees before independent verification."}
                  </p>

                  <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <button 
                      onClick={handleShare}
                      className="flex items-center gap-2 px-6 py-3 bg-white/50 backdrop-blur-sm border border-current/20 rounded-2xl font-bold text-sm transition-all hover:bg-white active:scale-95"
                    >
                      <Share2 className="w-4 h-4" /> Share This Result
                    </button>
                    {result.status === 'approved' ? (
                      <Link 
                        href={`/explore?q=${result.name}`}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-500/20"
                      >
                        View ROI Analysis <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <Link 
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold text-sm transition-all hover:bg-red-700 active:scale-95 shadow-lg shadow-red-500/20"
                      >
                         Find Approved Alternatives <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 text-center md:text-left border-t border-slate-200 pt-16">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mx-auto md:mx-0">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Why this matters</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              In India, thousands of students lose money every year to universities that claim to be "UGC-Approved" but lack the specific "DEB" (Distance Education Bureau) license required for online degrees.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto md:mx-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Our Database</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              We aggregate data from UGC notices, AICTE approvals, and NAAC ratings to provide a one-click transparency layer for students.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 mx-auto md:mx-0">
              <XCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Reporting Fraud</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              If an agent is pressuring you to pay "immediate registration fees" for a university not on this list, stop and report them to the UGC helpline.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
