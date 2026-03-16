"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, 
  DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ArrowRightLeft, Users, Loader2, 
  CheckCircle2, AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReassignDialogProps {
  sourceCounselor: any;
  allCounselors: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ReassignDialog({ sourceCounselor, allCounselors, onClose, onSuccess }: ReassignDialogProps) {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingLeads, setFetchingLeads] = useState(true);

  useEffect(() => {
    async function fetchSourceLeads() {
      try {
        const res = await fetch(`/api/leads?counselorId=${sourceCounselor.id}`);
        const data = await res.json();
        setLeads(data.filter((l: any) => !["WON", "LOST"].includes(l.status)));
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingLeads(false);
      }
    }
    fetchSourceLeads();
  }, [sourceCounselor.id]);

  const handleReassign = async () => {
    if (selectedLeads.length === 0 || !targetId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/leads/reassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: selectedLeads,
          targetCounselorId: targetId
        })
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLead = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-2xl">
        <DialogHeader className="p-8 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
             <ArrowRightLeft className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Workload Rebalancing</DialogTitle>
          <p className="text-sm font-medium text-slate-500">Move active leads from <span className="text-blue-600 font-bold">{sourceCounselor.name}</span> to another team member.</p>
        </DialogHeader>

        <div className="p-8 py-4 space-y-6">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Select Leads to Move ({selectedLeads.length})</label>
              <div className="max-h-[200px] overflow-y-auto border border-slate-100 rounded-2xl bg-slate-50/50 divide-y divide-slate-100">
                 {fetchingLeads ? (
                    <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
                 ) : leads.length > 0 ? (
                    leads.map(lead => (
                       <label key={lead.id} className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white transition-colors">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-slate-200 text-blue-600"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => toggleLead(lead.id)}
                          />
                          <div>
                             <div className="text-sm font-bold text-slate-900">{lead.name}</div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{lead.status}</div>
                          </div>
                       </label>
                    ))
                 ) : (
                    <div className="p-8 text-center text-xs font-bold text-slate-400 italic uppercase">No active leads to move</div>
                 )}
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Select Target Counselor</label>
              <select 
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                 <option value="">Choose a counselor...</option>
                 {allCounselors.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.activeLeads} active leads)</option>
                 ))}
              </select>
           </div>
        </div>

        <DialogFooter className="p-8 pt-4 bg-slate-50/50 border-t border-slate-100 flex gap-3">
           <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-500">Cancel</Button>
           <Button 
             disabled={loading || selectedLeads.length === 0 || !targetId}
             onClick={handleReassign}
             className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-10 font-bold shadow-lg shadow-blue-600/20"
           >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Reassignment"}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
