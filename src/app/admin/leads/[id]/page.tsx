import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChevronLeft, MoreVertical, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { LeadProfileSidebar } from "@/components/leads/LeadProfileSidebar";
import { ActivityFeed } from "@/components/leads/ActivityFeed";
import { LeadQuickActions } from "@/components/leads/LeadQuickActions";
import { NotificationCenter } from "@/components/crm/NotificationCenter";
import { DocumentCenter } from "@/components/crm/DocumentCenter";
import { MilestoneTracker } from "@/components/crm/MilestoneTracker";
import { ShortlistManager } from "@/components/crm/ShortlistManager";
import { ROIPanel } from "@/components/crm/ROIPanel";
import { AICopilot } from "@/components/crm/AICopilot";
import { StudentTimeline } from "@/components/crm/StudentTimeline";
import { OutcomePredictor } from "@/components/crm/OutcomePredictor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calculator, ListChecks, TrendingUp } from "lucide-react";

async function getLead(id: string) {
  const lead = await (prisma as any).lead.findUnique({
    where: { id },
    include: {
      university: true,
      ownerCounselor: true,
      notes: {
        include: { counselor: true },
        orderBy: { createdAt: "desc" }
      },
      activities: {
        include: { counselor: true },
        orderBy: { createdAt: "desc" }
      },
      applications: {
        include: { university: true },
        orderBy: { updatedAt: "desc" }
      }
    }
  });
  
  if (!lead) return null;
  return lead;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLead(id);

  if (!lead) {
    notFound();
  }

  // For this implementation, we'll assume a fixed counselor ID (legacy PD from earlier work)
  const ACTIVE_COUNSELOR_ID = lead.ownerCounselorId || 'c1'; 

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/admin/pipeline" 
              className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                <LayoutDashboard className="h-3 w-3" /> Lead Management / Profile
              </div>
              <h1 className="text-xl font-extrabold text-slate-900">{lead.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <LeadQuickActions 
                leadId={lead.id} 
                phone={lead.phone} 
                email={lead.email} 
                name={lead.name}
                counselorId={ACTIVE_COUNSELOR_ID}
             />
             <div className="h-10 w-px bg-slate-200 mx-2" />
             <NotificationCenter counselorId={ACTIVE_COUNSELOR_ID} />
             <div className="h-10 w-px bg-slate-200 mx-2" />
             <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900">
               <MoreVertical className="h-5 w-5" />
             </button>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-8 py-10">
        <div className="mb-10 p-8 bg-white border border-slate-200 rounded-[40px] shadow-sm">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                 <TrendingUp className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Student Enrollment Journey</h2>
           </div>
           <StudentTimeline currentStatus={lead.status} applications={lead.applications} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Profile & Journey */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-10">
            <LeadProfileSidebar lead={lead} />
            <MilestoneTracker leadId={lead.id} />
          </aside>

          {/* Main Column: Feed & Documents */}
          <section className="lg:col-span-8 xl:col-span-9 space-y-10">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <Suspense fallback={<Loader2 className="animate-spin" />}>
                <ActivityFeed 
                  leadId={lead.id} 
                  initialActivities={lead.activities} 
                  initialNotes={lead.notes}
                  counselorId={ACTIVE_COUNSELOR_ID}
                />
              </Suspense>
              
            </div>

            {/* Phase 10: Shortlist & ROI Section */}
            <div className="space-y-10">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <section className="space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                           <ListChecks className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Shortlist Management</h2>
                     </div>
                     <ShortlistManager leadId={lead.id} />
                  </section>

                  <section className="space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                           <Calculator className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Investment ROI Analysis</h2>
                     </div>
                     {lead.applications.length > 0 ? (
                        <div className="space-y-6">
                           <OutcomePredictor 
                             universityName={lead.applications[0].university.name} 
                             probability={65} // In real app, parse from enriched aiInsights
                           />
                           <ROIPanel application={lead.applications[0]} />
                        </div>
                     ) : (
                        <Card className="rounded-3xl border-2 border-dashed border-slate-100 p-12 text-center bg-white">
                           <p className="text-sm font-bold text-slate-400 italic">Shortlist a university to see financial ROI models.</p>
                        </Card>
                     )}
                  </section>
               </div>
            </div>
          </section>
        </div>
      </main>
      <AICopilot leadId={lead.id} universityId={lead.universityId || undefined} />
    </div>
  );
}
