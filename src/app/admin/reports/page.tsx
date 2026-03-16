"use client";

import { ReportingDashboard } from "@/components/crm/ReportingDashboard";
import { 
  LayoutDashboard, Users, GraduationCap, 
  BarChart3, Settings, Search, Bell, Plus
} from "lucide-react";
import { NotificationCenter } from "@/components/crm/NotificationCenter";
import { GlobalSearch } from "@/components/crm/GlobalSearch";
import { useState } from "react";

export default function AdminReports() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      
      {/* LEFT SIDEBAR (Standard for all Admin pages) */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex h-screen sticky top-0 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="font-bold text-xl tracking-tight text-white">CollegeVision<span className="text-blue-500">.</span></div>
        </div>
        
        <div className="p-4 flex-1 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 mt-4 px-2">Counselor Desk</div>
          <Link href="/admin/overview" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </Link>
          <Link href="/admin/pipeline" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
            <Users className="w-4 h-4" /> Lead Pipeline
          </Link>
          <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600/10 text-blue-400 transition-colors text-sm font-medium">
            <BarChart3 className="w-4 h-4" /> Advanced Reports
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
            <GraduationCap className="w-4 h-4" /> Universities
          </button>
        </div>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs ring-4 ring-blue-500/10">PD</div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">Priya Desai</div>
              <div className="text-[10px] text-slate-500 uppercase font-black">Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-lg font-bold text-slate-900 line-clamp-1">Data Insights</h1>
            <div className="h-6 w-px bg-slate-200"></div>
            <button 
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 w-64 transition-all text-sm border border-transparent hover:border-slate-200"
            >
              <Search className="w-4 h-4" />
              <span className="font-medium">Search anything... (⌘K)</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter counselorId="c1" />
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> New Lead
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8 pt-6">
           <ReportingDashboard />
        </div>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

// Helper Link placeholder since next/link might not be fully configured in snippets
function Link({ href, children, className }: any) {
  return <a href={href} className={className}>{children}</a>;
}
