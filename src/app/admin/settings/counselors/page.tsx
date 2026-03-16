import { CounselorManagement } from "@/components/crm/CounselorManagement";
import { PerformanceLeaderboard } from "@/components/crm/PerformanceLeaderboard";
import { Users, ShieldCheck, TrendingUp } from "lucide-react";

export default function CounselorSettings() {
  return (
    <div className="max-w-[1600px] mx-auto px-8 py-10 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Internal Admin</span>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Staff Governance</h1>
          <p className="text-slate-500 font-medium">Manage counselor workloads, performance metrics, and staff assignments.</p>
        </div>

        <div className="flex gap-4">
           <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4 px-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                 <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Staff</div>
                 <div className="text-lg font-black text-slate-900 tracking-tighter">12 Counselors</div>
              </div>
           </div>
           <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4 px-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                 <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Efficiency</div>
                 <div className="text-lg font-black text-slate-900 tracking-tighter">74.2%</div>
              </div>
           </div>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <CounselorManagement />
        </div>
        <div>
          <PerformanceLeaderboard />
        </div>
      </section>
    </div>
  );
}
