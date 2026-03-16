"use client";

import { useState, useEffect } from "react";
import { 
  Trophy, Medal, Star, 
  ArrowUp, TrendingUp, DollarSign 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PerformanceLeaderboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/counselors/stats");
        const data = await res.json();
        // Sort by wonValue descending
        setStats(data.sort((a: any, b: any) => b.wonValue - a.wonValue));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return null;

  return (
    <Card className="rounded-3xl border-slate-200 bg-white shadow-xl overflow-hidden">
      <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/30">
        <div>
          <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Performance Leaderboard</CardTitle>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Monthly Revenue Ranking</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-yellow-100 flex items-center justify-center">
           <Trophy className="h-5 w-5 text-yellow-600" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-50">
          {stats.slice(0, 5).map((c, index) => (
            <div key={c.id} className="p-6 px-8 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm",
                  index === 0 ? "bg-yellow-100 text-yellow-600 ring-4 ring-yellow-50" : 
                  index === 1 ? "bg-slate-200 text-slate-600 ring-4 ring-slate-50" :
                  index === 2 ? "bg-orange-100 text-orange-600 ring-4 ring-orange-50" :
                  "bg-slate-50 text-slate-400"
                )}>
                  {index === 0 ? <Medal className="h-5 w-5" /> : index + 1}
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">{c.name}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.conversionRate.toFixed(1)}% Conversion</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-base font-black text-slate-900 flex items-center justify-end gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  {(c.wonValue / 1000).toFixed(1)}K
                </div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center justify-end gap-1">
                   <TrendingUp className="h-3 w-3" /> Peak Performance
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
