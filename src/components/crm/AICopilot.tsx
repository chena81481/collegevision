"use client";

import { useState } from "react";
import { 
  Sparkles, Send, Bot, User, 
  ChevronRight, BrainCircuit, RotateCcw,
  Maximize2, Minimize2, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AICopilot({ leadId, universityId }: { leadId?: string, universityId?: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, universityId, query: input }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-slate-900 shadow-2xl hover:scale-110 transition-all flex items-center justify-center group z-50 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
        <Sparkles className="h-6 w-6 text-white relative z-10" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-8 right-8 w-[400px] h-[600px] rounded-3xl shadow-2xl border-slate-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom duration-300">
      <CardHeader className="p-6 bg-slate-900 text-white flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="p-2 rounded-xl bg-white/10">
              <Sparkles className="h-4 w-4 text-emerald-400" />
           </div>
           <div>
              <CardTitle className="text-sm font-black tracking-tighter">AI Copilot</CardTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context Active</span>
              </div>
           </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
           <X className="h-5 w-5" />
        </button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-700 leading-relaxed flex gap-3">
           <BrainCircuit className="h-4 w-4 shrink-0" />
           I'm analyzing student data and university guides to assist you. Try asking "Draft a visa checklist" or "Summary of this student".
        </div>

        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm",
              m.role === "user" 
                ? "bg-slate-900 text-white rounded-tr-none" 
                : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
            )}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none animate-pulse">
               <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-slate-300 animate-bounce" />
                  <div className="w-1 h-1 rounded-full bg-slate-300 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 rounded-full bg-slate-300 animate-bounce [animation-delay:0.4s]" />
               </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 bg-white border-t border-slate-100">
        <div className="relative w-full">
           <Input 
             placeholder="Ask copilot..." 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
             className="pr-12 h-12 rounded-xl border-slate-200 bg-slate-50 transition-all focus:bg-white"
           />
           <Button 
             size="sm" 
             onClick={sendMessage}
             disabled={loading}
             className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 p-0 rounded-lg bg-slate-900 hover:bg-black"
           >
             <Send className="h-4 w-4" />
           </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
