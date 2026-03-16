"use client";

import { TrendingUp, Target, Award, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function OutcomePredictor({ probability, universityName }: { probability: number, universityName: string }) {
  const getLevelColor = (p: number) => {
    if (p >= 80) return "text-emerald-500 bg-emerald-500";
    if (p >= 50) return "text-blue-500 bg-blue-500";
    return "text-amber-500 bg-amber-500";
  };

  const getLevelText = (p: number) => {
    if (p >= 80) return "High Chance of Admission";
    if (p >= 50) return "Strong Candidate";
    return "Competitive Admission";
  };

  return (
    <Card className="rounded-3xl border-slate-200 overflow-hidden bg-white shadow-lg group hover:shadow-xl transition-all">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-900 text-white">
                 <Target className="h-4 w-4" />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Predictive Outcome</div>
                 <div className="text-xs font-black text-slate-900">{universityName}</div>
              </div>
           </div>
           <Award className="h-5 w-5 text-emerald-500" />
        </div>

        <div className="space-y-3">
           <div className="flex justify-between items-end">
              <div className="text-3xl font-black text-slate-900 leading-none">{probability}%</div>
              <div className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", getLevelColor(probability).replace('bg-', 'border-').replace('text-', 'text-'))}>
                 {getLevelText(probability)}
              </div>
           </div>
           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                 className={cn("h-full transition-all duration-1000", getLevelColor(probability).split(' ')[1])} 
                 style={{ width: `${probability}%` }} 
              />
           </div>
        </div>

        <div className="pt-2 flex items-start gap-2 text-[9px] font-bold text-slate-400 leading-normal">
           <Info className="h-3 w-3 shrink-0" />
           AI analysis based on academic profile, document verification, and historic admission benchmarks for {universityName}.
        </div>
      </CardContent>
    </Card>
  );
}
