"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  History, MessageSquare, Phone, Mail, 
  CheckCircle2, Clock, StickyNote, User 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ActivityFeed({ leadId, initialActivities, initialNotes, counselorId }: { leadId: string, initialActivities: any[], initialNotes: any[], counselorId: string }) {
  const [activities, setActivities] = useState(initialActivities);
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmittingNote(true);
    try {
      const response = await fetch(`/api/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote, counselorId }),
      });

      if (!response.ok) throw new Error("Failed to add note");
      const note = await response.json();
      
      setNotes([note, ...notes]);
      setNewNote("");
      toast.success("Note added successfully");
    } catch (error) {
      toast.error("Error adding note");
    } finally {
      setSubmittingNote(false);
    }
  };

  const combinedItems = [
    ...activities.map(a => ({ ...a, itemType: 'activity' })),
    ...notes.map(n => ({ ...n, itemType: 'note', type: 'NOTE_ADDED', description: n.content }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-8">
      {/* Note Action */}
      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden border-l-4 border-l-blue-600">
        <CardContent className="p-0">
          <form onSubmit={handleAddNote}>
            <Textarea 
              placeholder="Type a new internal note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="border-none focus-visible:ring-0 min-h-[120px] p-6 text-slate-700 resize-none"
            />
            <div className="bg-slate-50 p-4 px-6 flex justify-between items-center border-t border-slate-100">
              <div className="flex items-center gap-4">
                 <button type="button" className="text-slate-400 hover:text-blue-600 transition-colors"><StickyNote className="h-4 w-4" /></button>
                 <button type="button" className="text-slate-400 hover:text-blue-600 transition-colors"><User className="h-4 w-4" /></button>
              </div>
              <Button disabled={submittingNote || !newNote.trim()} className="rounded-xl px-8 bg-blue-600 hover:bg-blue-700">
                Post Note
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
          <History className="h-4 w-4 text-slate-400" /> Interaction History
        </h3>

        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
          {combinedItems.map((item, idx) => (
            <div key={item.id} className="relative flex items-start gap-6 group">
              <div className={cn(
                "absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm z-10 transition-transform group-hover:scale-110",
                item.type === 'CREATED' ? "bg-emerald-500 text-white" :
                item.type === 'STATUS_CHANGED' ? "bg-amber-500 text-white" :
                item.type === 'NOTE_ADDED' ? "bg-blue-500 text-white" :
                "bg-slate-500 text-white"
              )}>
                {item.type === 'CREATED' && <CheckCircle2 className="h-5 w-5" />}
                {item.type === 'STATUS_CHANGED' && <Clock className="h-5 w-5" />}
                {item.type === 'NOTE_ADDED' && <MessageSquare className="h-5 w-5" />}
                {['CONTACTED', 'ASSIGNED', 'UPDATED'].includes(item.type) && <History className="h-5 w-5" />}
              </div>

              <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all group-hover:shadow-md group-hover:border-slate-300 ml-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {item.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                    {new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {item.description}
                </p>
                {item.counselor && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-600">
                      {item.counselor.name[0]}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Log by {item.counselor.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
