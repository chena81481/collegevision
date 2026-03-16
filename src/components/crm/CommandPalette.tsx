"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Search, Users, GraduationCap, BookOpen, 
  Plus, Sparkles, Command, ArrowRight,
  TrendingUp, Settings, HelpCircle, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({ leads: [], universities: [], knowledge: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Keyboard listener for ⌘K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search logic
  useEffect(() => {
    if (query.length < 2) {
      setResults({ leads: [], universities: [], knowledge: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/universal?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const onSelect = useCallback((type: string, id: string) => {
    setOpen(false);
    setQuery("");
    if (type === "lead") router.push(`/admin/leads/${id}`);
    if (type === "university") router.push(`/admin/pipeline?uni=${id}`);
    if (type === "knowledge") router.push(`/admin/knowledge?res=${id}`);
  }, [router]);

  // Combine all results for arrow key navigation
  const allResults = [
    ...results.leads.map((l: any) => ({ ...l, type: "lead" })),
    ...results.universities.map((u: any) => ({ ...u, type: "university" })),
    ...results.knowledge.map((k: any) => ({ ...k, type: "knowledge" })),
    { id: "new-lead", name: "Create New Lead", type: "action", icon: Plus },
    { id: "ai", name: "Ask AI Copilot", type: "action", icon: Sparkles },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => (prev + 1) % allResults.length);
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
    } else if (e.key === "Enter") {
      const selected = allResults[selectedIndex];
      if (selected) {
        if (selected.type === "action") {
           // Handle actions
           setOpen(false);
           if (selected.id === "new-lead") router.push("/admin/pipeline"); // Trigger modal logic
        } else {
           onSelect(selected.type, selected.id);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-slate-200 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] ring-1 ring-slate-900/5">
        <div className="flex flex-col h-[500px]">
          {/* Search Input Area */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100">
             <div className="p-2 rounded-xl bg-slate-900 text-white shadow-lg">
                <Command className="h-4 w-4" />
             </div>
             <Input 
               placeholder="Search students, universities, or internal guides..."
               autoFocus
               className="flex-1 bg-transparent border-none text-lg font-black placeholder:text-slate-400 focus:ring-0 h-auto p-0 text-slate-900"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onKeyDown={handleKeyDown}
             />
             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">
                Esc
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
            {query.length < 2 ? (
              <div className="p-4 space-y-4">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Instant Actions</div>
                 <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Plus, label: "Add Lead", color: "blue" },
                      { icon: Sparkles, label: "Ask AI", color: "emerald" },
                      { icon: TrendingUp, label: "Reports", color: "amber" },
                      { icon: Settings, label: "Settings", color: "indigo" }
                    ].map((act, i) => (
                      <button key={i} className="flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 text-left group">
                         <div className={cn("p-2 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 group-hover:scale-110 transition-transform", `text-${act.color}-600`)}>
                            <act.icon className="h-4 w-4" />
                         </div>
                         <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">{act.label}</span>
                      </button>
                    ))}
                 </div>
              </div>
            ) : (
              <div className="space-y-6 p-2">
                 {/* Lead Results */}
                 {results.leads.length > 0 && (
                   <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2">Students</div>
                      {results.leads.map((l: any, idx: number) => (
                        <ResultItem 
                          key={l.id} 
                          title={l.name} 
                          sub={l.email} 
                          badge={l.status}
                          icon={Users}
                          active={allResults[selectedIndex]?.id === l.id}
                          onClick={() => onSelect("lead", l.id)}
                        />
                      ))}
                   </div>
                 )}

                 {/* University Results */}
                 {results.universities.length > 0 && (
                   <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2">Universities</div>
                      {results.universities.map((u: any) => (
                        <ResultItem 
                          key={u.id} 
                          title={u.name} 
                          sub={`${u.location}, ${u.country}`} 
                          icon={GraduationCap}
                          active={allResults[selectedIndex]?.id === u.id}
                          onClick={() => onSelect("university", u.id)}
                        />
                      ))}
                   </div>
                 )}

                 {/* Knowledge Results */}
                 {results.knowledge.length > 0 && (
                   <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2">Admissions Wisdom</div>
                      {results.knowledge.map((k: any) => (
                        <ResultItem 
                          key={k.id} 
                          title={k.title} 
                          sub={k.category} 
                          icon={BookOpen}
                          active={allResults[selectedIndex]?.id === k.id}
                          onClick={() => onSelect("knowledge", k.id)}
                        />
                      ))}
                   </div>
                 )}

                 {loading && (
                    <div className="flex items-center justify-center py-10">
                       <div className="w-2 h-2 rounded-full bg-slate-900 animate-bounce" />
                       <div className="w-2 h-2 rounded-full bg-slate-900 animate-bounce [animation-delay:0.2s] mx-1" />
                       <div className="w-2 h-2 rounded-full bg-slate-900 animate-bounce [animation-delay:0.4s]" />
                    </div>
                 )}
              </div>
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3" /> Select</div>
                <div className="flex items-center gap-1.5"><HelpCircle className="h-3 w-3" /> Navigation</div>
             </div>
             <div className="flex items-center gap-1.5 underline decoration-emerald-500/50 underline-offset-4 text-slate-600">
                AI Intelligence Ready
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResultItem({ title, sub, icon: Icon, active, onClick, badge }: any) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-4 rounded-[20px] cursor-pointer transition-all",
        active ? "bg-slate-900 text-white shadow-xl scale-[1.02]" : "hover:bg-slate-50 text-slate-600"
      )}
    >
      <div className="flex items-center gap-4">
         <div className={cn("p-2 rounded-xl bg-white ring-1 ring-slate-200 shadow-sm transition-transform", active ? "text-slate-900 scale-110" : "text-slate-400")}>
            <Icon className="h-4 w-4" />
         </div>
         <div>
            <div className={cn("text-xs font-black uppercase tracking-tighter leading-none mb-1", active ? "text-white" : "text-slate-900")}>
               {title}
            </div>
            <div className={cn("text-[10px] font-bold", active ? "text-slate-400" : "text-slate-400")}>
               {sub}
            </div>
         </div>
      </div>
      {badge && (
        <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5", active ? "bg-white/10 text-white border-white/20" : "bg-blue-50 text-blue-600 border-blue-100")}>
           {badge}
        </Badge>
      )}
    </div>
  );
}
