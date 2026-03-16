"use client";

import { useState, useEffect } from "react";
import { 
  Users, TrendingUp, Search, Bell, 
  ArrowUpRight, Clock, Activity, Loader2,
  LayoutDashboard, GraduationCap, BarChart3, ShieldCheck, BookOpen
} from "lucide-react";
import { StatsGrid } from "@/components/crm/StatsGrid";
import { AnalyticsCharts } from "@/components/crm/AnalyticsCharts";
import { GlobalSearch } from "@/components/crm/GlobalSearch";
import { TaskManager } from "@/components/crm/TaskManager";
import { NotificationCenter } from "@/components/crm/NotificationCenter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AdminOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics/overview');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();

    // Key shortcut for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-bold italic tracking-widest text-sm uppercase">Calculating Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 max-w-[1600px] mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="p-4 flex-1 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 mt-4 px-2">Counselor Desk</div>
          <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600/10 text-blue-400 transition-colors text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </div>
          <a href="/admin/pipeline" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
            <Users className="w-4 h-4" /> Lead Pipeline
          </a>
          <a href="/admin/reports" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
            <BarChart3 className="w-4 h-4" /> Advanced Reports
          </a>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
            <GraduationCap className="w-4 h-4" /> Universities
          </button>
          <a href="/admin/knowledge" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
            <BookOpen className="w-4 h-4" /> Knowledge Base
          </a>
          <a href="/admin/settings/counselors" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium border-t border-slate-100 pt-4 mt-2">
            <ShieldCheck className="w-4 h-4" /> Staff Governance
          </a>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-400 hover:text-slate-600 transition-all text-sm font-bold shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span>Search (⌘K)</span>
          </button>
          <div className="bg-emerald-50 text-emerald-700 font-bold text-xs p-2 px-4 rounded-xl flex items-center gap-2 border border-emerald-100 italic shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             Live Sync Enabled
          </div>
        </div>
      </div>

      <StatsGrid stats={data.stats} />

      <AnalyticsCharts data={data.distribution} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" /> Recent Counselor Activity
              </CardTitle>
              <button className="text-[10px] font-bold text-blue-600 py-1 px-3 bg-blue-50 rounded-lg uppercase tracking-wider">View Log</button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50">
                  {data.recentActivities.map((act: any) => (
                    <div key={act.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-lg ring-4 ring-slate-50">
                          {act.counselor?.name[0] || 'A'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {act.counselor?.name || 'System'} <span className="text-slate-400 font-medium text-xs mx-1">logged</span> {act.description}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                             <Clock className="h-3 w-3" /> {new Date(act.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-300" />
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <TaskManager counselorId="c1" />
           
           <Card className="rounded-2xl border-slate-200 bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-purple-600 transition-all duration-700" />
              <CardHeader className="p-6 relative z-10">
                 <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Conversion Insight</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 relative z-10 space-y-6">
                 <div className="space-y-2">
                   <p className="text-xs font-medium text-slate-400 italic">Historical Average</p>
                   <div className="text-4xl font-black">{data.stats.conversionRate}%</div>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">Pipeline Fill</div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(data.stats.activeLeads / data.stats.totalLeads) * 100}%` }} />
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      <GlobalSearch 
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </div>
  );
}
