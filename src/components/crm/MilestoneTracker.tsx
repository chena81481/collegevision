"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, Circle, Clock, 
  MapPin, Plus, Loader2, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MilestoneTrackerProps {
  leadId: string;
}

export function MilestoneTracker({ leadId }: MilestoneTrackerProps) {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchMilestones() {
      try {
        const res = await fetch(`/api/leads/${leadId}/milestones`);
        const data = await res.json();
        setMilestones(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMilestones();
  }, [leadId]);

  const addMilestone = async () => {
    setAdding(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Application Submitted",
          status: "COMPLETED",
          date: new Date().toISOString()
        })
      });
      
      if (res.ok) {
        const newMile = await res.json();
        setMilestones([...milestones, newMile]);
        toast.success("Milestone recorded");
      }
    } catch (err) {
      toast.error("Failed to add milestone");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm overflow-hidden h-full">
      <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <MapPin className="h-4 w-4 text-purple-600" /> Application Journey
        </CardTitle>
        <button 
          onClick={addMilestone}
          disabled={adding}
          className="text-[10px] font-bold text-purple-600 py-1.5 px-3 bg-purple-50 hover:bg-purple-100 rounded-lg uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Next Stage
        </button>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-200" />
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-12 space-y-3">
             <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
               <Clock className="h-6 w-6 text-slate-200" />
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Journey hasn't started</p>
          </div>
        ) : (
          <div className="space-y-6 relative">
            {/* Timeline Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />

            {milestones.map((mile, i) => (
              <div key={mile.id} className="relative flex gap-4 pl-8 group">
                <div className={cn(
                  "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all",
                  mile.status === "COMPLETED" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white border-2 border-slate-200 text-slate-300"
                )}>
                  {mile.status === "COMPLETED" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                </div>
                
                <div className="flex-1 pb-2">
                  <div className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors leading-none">
                    {mile.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {new Date(mile.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                
                {i < milestones.length - 1 && (
                  <ArrowRight className="h-3.5 w-3.5 text-slate-200 mt-0.5" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
