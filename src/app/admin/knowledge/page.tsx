import { Suspense } from "react";
import { KnowledgeBase } from "@/components/crm/KnowledgeBase";
import { BookOpen, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KnowledgeBasePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
               <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Knowledge Base</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal Admission & Visa Guides</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="secondary" className="rounded-xl font-bold text-xs px-6 h-11 shadow-lg shadow-slate-900/10">
                <Plus className="h-4 w-4 mr-2" /> New Resource
             </Button>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-8 py-10">
        <section className="space-y-10">
           <div className="p-8 rounded-[40px] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                 <div className="max-w-xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                       <Sparkles className="h-3 w-3" /> AI Copilot Integrated
                    </div>
                    <h2 className="text-3xl font-black tracking-tight leading-tight">Empowering Counselors with Admission Intelligence.</h2>
                    <p className="text-sm font-bold text-slate-400 leading-relaxed">
                       Search through verified visa guides, university brochures, and internal notes. All resources here are used by the AI Copilot to assist you in drafting student communications.
                    </p>
                 </div>
                 <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                       <div key={i} className="w-14 h-14 rounded-2xl border-4 border-slate-800 bg-slate-700 flex items-center justify-center font-black text-white text-xl shadow-2xl">
                          {i}
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <Suspense fallback={<div>Loading Knowledge Base...</div>}>
              <KnowledgeBase />
           </Suspense>
        </section>
      </main>
    </div>
  );
}
