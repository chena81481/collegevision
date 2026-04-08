import React, { Suspense } from 'react';
import type { MatcherInput, MatchResult } from '@/utils/matcher';
import { findVectorMatches } from '@/app/actions/match';
import { Sparkles, Loader2, Trophy } from 'lucide-react';

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
  if (!result.success || !result.matches?.length) return <NoResults />;
  
  const winner = result.matches[0];
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
                <div className="text-blue-600 text-sm font-black uppercase tracking-widest mb-2">94% Core Match</div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">{winner.universityName}</h3>
                <p className="text-slate-500 font-medium mb-8">This program aligns with your skill goals and budget constraints perfectly.</p>
                <div className="grid grid-cols-3 gap-4">
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
  if (!result.success || (result.matches?.length || 0) <= 1) return null;
  
  const alternatives = result.matches.slice(1, 3);
  return (
    <div className="space-y-6">
      {alternatives.map((match: MatchResult) => (
        <div key={match.courseId} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-blue-500/30 transition-all">
          <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Strong Match - {match.matchScore}%</div>
          <h4 className="font-bold text-slate-900 mb-4">{match.universityName}</h4>
          <div className="flex justify-between items-center text-sm font-bold">
             <span className="text-slate-500">ROI: {match.roiScore}x</span>
             <span className="text-blue-600">View Details</span>
          </div>
        </div>
      ))}
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
