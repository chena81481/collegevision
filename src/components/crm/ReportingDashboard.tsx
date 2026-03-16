"use client";

import { useState, useEffect } from "react";
import { 
  Download, Filter, Search, ChevronDown, 
  ArrowUpDown, ExternalLink, Users, Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function ReportingDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    source: "",
    search: ""
  });

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await fetch(`/api/leads?${query}`);
        const data = await res.json();
        setLeads(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, [filters]);

  const handleExport = () => {
    window.location.href = "/api/analytics/export";
  };

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Advanced Reporting</h1>
          <p className="text-slate-500 font-medium text-sm">Comprehensive lead data analysis and export tools.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 shrink-0"
        >
          <Download className="h-4 w-4" /> Export to CSV
        </button>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email..." 
              className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          
          <select 
            className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
            value={filters.status}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            <option value="NEW_LEAD">New Lead</option>
            <option value="CONTACTED">Contacted</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>

          <select 
            className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
            value={filters.source}
            onChange={(e) => setFilters(f => ({ ...f, source: e.target.value }))}
          >
            <option value="">All Sources</option>
            <option value="DIRECT">Direct</option>
            <option value="REFERRAL">Referral</option>
            <option value="ORGANIC">Organic</option>
            <option value="SOCIAL_MEDIA">Social Media</option>
          </select>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="rounded-3xl border-slate-200 bg-white shadow-xl overflow-hidden border-none ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 pl-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Counselor</th>
                <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">University</th>
                <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                <th className="p-4 pr-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="p-8">
                       <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                    </td>
                  </tr>
                ))
              ) : leads.map((lead) => (
                <tr key={lead.id} className="group hover:bg-blue-50/20 transition-colors">
                  <td className="p-4 pl-8">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                         {lead.name[0]}
                       </div>
                       <div>
                         <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{lead.name}</div>
                         <div className="text-[10px] text-slate-400 font-medium">{lead.email}</div>
                       </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-bold uppercase tracking-wider rounded-lg border-none",
                      lead.status === "WON" ? "bg-emerald-50 text-emerald-600" :
                      lead.status === "LOST" ? "bg-red-50 text-red-600" :
                      lead.status === "PROPOSAL" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {lead.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                       <Users className="h-3.3 w-3.5 text-slate-300" />
                       {lead.ownerCounselor?.name || "Unassigned"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-medium text-slate-600 line-clamp-1 max-w-[150px]">
                       {lead.university?.name || "NA"}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm font-black text-slate-900">₹{(lead.value || 0).toLocaleString()}</div>
                  </td>
                  <td className="p-4 pr-8 text-right">
                    <div className="text-[10px] font-bold text-slate-400">
                       {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && leads.length === 0 && (
            <div className="p-20 text-center space-y-4">
               <Filter className="h-12 w-12 text-slate-100 mx-auto" />
               <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">No matching leads found</p>
            </div>
          )}
        </div>
      </Card>
      
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4">
         <div>Showing {leads.length} clinical records</div>
         <div className="flex items-center gap-4">
            <button className="hover:text-blue-600 transition-colors">Previous</button>
            <div className="flex items-center gap-2">
               <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">1</span>
               <span>2</span>
               <span>3</span>
            </div>
            <button className="hover:text-blue-600 transition-colors">Next</button>
         </div>
      </div>
    </div>
  );
}
