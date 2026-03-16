"use client";

import { useState, useEffect } from "react";
import { 
  Users, TrendingUp, Briefcase, 
  CheckCircle2, Clock, ChevronRight,
  ShieldCheck, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReassignDialog } from "./ReassignDialog";

export function CounselorManagement() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/counselors/stats");
        const data = await res.json();
        setStats(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((c) => (
          <Card key={c.id} className="rounded-3xl border-slate-200 overflow-hidden hover:shadow-xl transition-all group">
            <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                        {c.name[0]}
                     </div>
                     <div>
                        <CardTitle className="text-base font-black text-slate-900">{c.name}</CardTitle>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{c.role}</p>
                     </div>
                  </div>
                  <Badge variant="outline" className="bg-white text-[10px] font-bold uppercase tracking-tighter">
                     {c.activeLeads} Active
                  </Badge>
               </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                     <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                        <TrendingUp className="h-3 w-3" /> Conversion
                     </div>
                     <div className="text-lg font-black text-emerald-700">{c.conversionRate.toFixed(1)}%</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                     <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">
                        <Briefcase className="h-3 w-3" /> Volume
                     </div>
                     <div className="text-lg font-black text-blue-700">₹{(c.wonValue / 1000000).toFixed(1)}M</div>
                  </div>
               </div>

               <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                     <Clock className="h-3.5 w-3.5 text-slate-300" />
                     <span className="text-xs font-bold text-slate-500">{c.pendingTasks} Tasks Due</span>
                  </div>
                  <button 
                    onClick={() => setSelectedCounselor(c)}
                    className="flex items-center gap-1 text-[11px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
                  >
                    Manage Workload <ChevronRight className="h-3 w-3" />
                  </button>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCounselor && (
        <ReassignDialog 
          sourceCounselor={selectedCounselor} 
          allCounselors={stats.filter(s => s.id !== selectedCounselor.id)}
          onClose={() => setSelectedCounselor(null)}
          onSuccess={() => {
            setSelectedCounselor(null);
            window.location.reload(); // Simple refresh for now
          }}
        />
      )}
    </div>
  );
}
