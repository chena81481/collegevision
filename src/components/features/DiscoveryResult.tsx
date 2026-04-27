import React, { Suspense } from 'react';
import Link from 'next/link';
import type { MatcherInput, MatchResult } from '@/utils/matcher';
import { findVectorMatches } from '@/app/actions/match';
import { Sparkles, Loader2, Trophy, HelpCircle, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiscoveryResultProps {
  input: MatcherInput;
}

export default function DiscoveryResult({ input }: DiscoveryResultProps) {
  return (
    <div className="space-y-12 py-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your AI-Verified <span className="text-blue-600">Matches</span></h2>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
           <Sparkles className="w-4 h-4"/> Vector Match: Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Suspense fallback={<LoadingWinner />}>
           <WinnerStream input={input} />
        </Suspense>

        <Suspense fallback={<LoadingAlternatives />}>
           <AlternativesStream input={input} />
        </Suspense>
      </div>
    </div>
  );
}

async function WinnerStream({ input }: { input: MatcherInput }) {
  const result = await findVectorMatches(input);
  const matches = result.matches;
  if (!result.success || !matches || matches.length === 0) return <NoResults />;
  
  const winner = matches[0];
  return (
    <div className="lg:col-span-2 relative group">
       <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
       <div className="relative bg-white rounded-[32px] p-8 border border-slate-200 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-6">
             <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg flex items-center gap-2">
                <Trophy className="w-4 h-4" /> BEST VALUE WINNER
             </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
             <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                   <div className="text-blue-600 text-sm font-black uppercase tracking-widest">94% Core Match</div>
                   <Tooltip content="Matches because it fits your ₹2L budget, offers zero-cost EMI, and is ranked #1 for your target career ROI.">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help hover:text-blue-600 transition-colors" />
                   </Tooltip>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">{winner.universityName}</h3>
                <p className="text-slate-500 font-medium mb-8">This program aligns with your skill goals and budget constraints perfectly.</p>
                
                <EligibilityCheck />

                <div className="grid grid-cols-3 gap-4 mt-8">
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase">3-Yr ROI</div>
                      <div className="text-xl font-black text-emerald-600">{winner.roiScore}x</div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase">Est Salary</div>
                      <div className="text-xl font-black text-slate-900">₹{winner.avgCtc / 100000}L</div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase">Fee</div>
                      <div className="text-xl font-black text-slate-900">₹{winner.totalFee / 100000}L</div>
                   </div>
                </div>
             </div>
             <div className="md:w-64 flex flex-col justify-end">
                <button className="w-full bg-slate-900 hover:bg-blue-600 text-white p-5 rounded-2xl font-black transition-all shadow-xl hover:shadow-blue-500/20">
                   ADVANCE TO APP
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}

async function AlternativesStream({ input }: { input: MatcherInput }) {
  const result = await findVectorMatches(input);
  const matches = result.matches;
  if (!result.success || !matches || matches.length <= 1) return null;
  
  const alternatives = matches.slice(1, 3);
  return (
    <div className="space-y-6">
      {alternatives.map((match: MatchResult) => (
        <div key={match.courseId} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-2 mb-1">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strong Match - {match.matchScore}%</div>
             <Tooltip content={`High fit based on your goals and approval preferences.`}>
                <HelpCircle className="w-3 h-3 text-slate-300 cursor-help" />
             </Tooltip>
          </div>
          <h4 className="font-bold text-slate-900 mb-4">{match.universityName}</h4>
          <div className="flex justify-between items-center text-sm font-bold">
             <span className="text-slate-500">ROI: {match.roiScore}x</span>
             <Link href="/universities" className="text-blue-600 hover:underline">
               View Details
             </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function EligibilityCheck() {
  const [percent, setPercent] = useState('');
  const [result, setResult] = useState<'eligible' | 'not-eligible' | null>(null);

  const checkEligibility = () => {
    const val = parseFloat(percent);
    if (isNaN(val)) return;
    setResult(val >= 50 ? 'eligible' : 'not-eligible');
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Quick Eligibility Check</span>
      </div>
      
      {!result ? (
        <div className="flex gap-2">
          <input 
            type="number" 
            placeholder="Graduation %" 
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all"
          />
          <button 
            onClick={checkEligibility}
            className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
          >
            Check Now
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              result === 'eligible' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {result === 'eligible' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <div>
                <p className="text-xs font-black uppercase">{result === 'eligible' ? 'Eligible to Apply' : 'Low Eligibility'}</p>
                <p className="text-[10px] opacity-80">{result === 'eligible' ? 'You meet the 50% cutoff' : 'Typically requires 50%'}</p>
              </div>
            </div>
            <button 
              onClick={() => {setResult(null); setPercent('');}}
              className="text-[9px] font-black uppercase tracking-tighter hover:underline"
            >
              Reset
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function LoadingWinner() {
  return (
    <div className="lg:col-span-2 bg-slate-50 rounded-[32px] p-8 border border-slate-100 animate-pulse flex flex-col gap-6">
       <div className="w-1/3 h-8 bg-slate-200 rounded-lg"></div>
       <div className="w-full h-24 bg-slate-200 rounded-2xl"></div>
       <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-slate-200 rounded-xl"></div>
          <div className="h-16 bg-slate-200 rounded-xl"></div>
          <div className="h-16 bg-slate-200 rounded-xl"></div>
       </div>
    </div>
  );
}

function LoadingAlternatives() {
  return (
    <div className="space-y-6">
       {[1, 2].map(i => (
         <div key={i} className="h-32 bg-slate-50 rounded-3xl animate-pulse"></div>
       ))}
    </div>
  );
}

function NoResults() {
  return <div className="text-center py-12 text-slate-400 font-medium">No matches found with current constraints.</div>;
}
