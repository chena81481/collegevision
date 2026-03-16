"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Globe, GraduationCap, UserCircle, Sparkles, BrainCircuit, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessagingHub } from "@/components/crm/MessagingHub";

export function LeadProfileSidebar({ lead }: { lead: any }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-slate-200 overflow-hidden shadow-sm bg-white">
        <div className="h-24 bg-gradient-to-r from-slate-900 to-blue-900" />
        <CardContent className="p-6 -mt-12 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-white mx-auto flex items-center justify-center mb-4 shadow-sm">
            <span className="text-2xl font-bold text-slate-400">
              {lead.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{lead.name}</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 uppercase tracking-wider text-[10px] font-bold">
            {lead.status.replace('_', ' ')}
          </Badge>
          
          <div className="mt-6 space-y-4 text-left">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <span className="truncate">{lead.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-slate-400" />
              </div>
              <span>{lead.phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {lead.university && (
        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
          <CardHeader className="p-5 border-b border-slate-50">
            <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-blue-600" /> Target University
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="font-bold text-slate-800">{lead.university.name}</div>
            {lead.university.location && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {lead.university.location}
              </div>
            )}
            {lead.university.website && (
              <a href={lead.university.website} target="_blank" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                <Globe className="h-3.5 w-3.5" />
                Visit Website
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {lead.ownerCounselor && (
        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
          <CardHeader className="p-5 border-b border-slate-50">
            <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-emerald-600" /> Assigned Counselor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-xs ring-2 ring-white">
                {lead.ownerCounselor.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{lead.ownerCounselor.name}</div>
                <div className="text-[10px] text-slate-500">{lead.ownerCounselor.department || "Admissions"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Intelligence Section */}
      <Card className="rounded-3xl border-slate-200 bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-violet-600 transition-all duration-700" />
         <CardHeader className="p-6 relative z-10 border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
               <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" /> Lead Intelligence
            </CardTitle>
         </CardHeader>
         <CardContent className="p-6 relative z-10 space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <div className="text-4xl font-black text-white tracking-tighter">{lead.aiScore || 0}%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrollment Propensity</div>
               </div>
               <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="h-8 w-8 text-blue-400" />
               </div>
            </div>

            <div className="space-y-3">
               <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="h-3 w-3" /> Counselor Insights
               </div>
               <div className="space-y-2">
                  {lead.aiInsights ? JSON.parse(lead.aiInsights).map((insight: string, i: number) => (
                     <div key={i} className="text-xs font-medium text-slate-300 bg-white/5 p-2 rounded-xl border border-white/10">
                        {insight}
                     </div>
                  )) : (
                     <div className="text-xs font-medium text-slate-500 italic">No AI insights generated yet.</div>
                  )}
               </div>
            </div>
         </CardContent>
      </Card>

      <MessagingHub lead={lead} />
    </div>
  );
}
