"use client";

import { useState } from "react";
import { 
  Mail, Send, Loader2, 
  MessageSquare, Layout, CheckCircle2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface MessagingHubProps {
  lead: any;
}

export function MessagingHub({ lead }: MessagingHubProps) {
  const [activeTab, setActiveTab] = useState("email");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/comms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          type: activeTab.toUpperCase(),
          content: message,
        }),
      });

      if (res.ok) {
        setSent(true);
        setMessage("");
        setTimeout(() => setSent(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const templates = {
    email: [
      { id: 1, name: "Intro", text: `Hi ${lead.name}, I'm following up on your application...` },
      { id: 2, name: "Docs Need", text: `Hi ${lead.name}, we need a few more documents to proceed...` },
    ],
    whatsapp: [
      { id: 1, name: "Quick Check", text: `Hey ${lead.name}, available for a quick call?` },
      { id: 2, name: "Reminder", text: `Hi ${lead.name}, don't forget to upload your transcripts!` },
    ]
  };

  return (
    <Card className="rounded-3xl border-slate-200 overflow-hidden shadow-xl bg-white/50 backdrop-blur-sm">
      <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
         <div>
            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
               <MessageSquare className="h-4 w-4 text-blue-600" /> Messaging Hub
            </CardTitle>
         </div>
         {sent && (
            <div className="flex items-center gap-1.5 text-emerald-600 animate-in fade-in slide-in-from-right-2">
               <CheckCircle2 className="h-4 w-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Sent Successfully</span>
            </div>
         )}
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="email" className="w-full" onValueChange={setActiveTab}>
          <div className="bg-slate-50/50 p-2 px-6 border-b border-slate-100">
            <TabsList className="bg-white/50 p-1 rounded-xl border border-slate-200 shadow-sm">
              <TabsTrigger value="email" className="rounded-lg px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Email</TabsTrigger>
              <TabsTrigger value="whatsapp" className="rounded-lg px-6 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">WhatsApp</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex gap-2 mb-2">
               {templates[activeTab as keyof typeof templates].map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setMessage(t.text)}
                    className="text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors uppercase tracking-widest"
                  >
                    {t.name}
                  </button>
               ))}
            </div>

            <Textarea 
              placeholder={activeTab === "email" ? "Write your email message..." : "Type a WhatsApp message..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white transition-all min-h-[120px] shadow-inner text-sm font-medium"
            />

            <div className="flex justify-between items-center pt-2">
               <div className="text-[10px] font-bold text-slate-400 italic">
                  Logging to activities automatically
               </div>
               <Button 
                 onClick={handleSend}
                 disabled={loading || !message.trim()}
                 className={cn(
                   "rounded-xl px-8 font-black uppercase tracking-widest shadow-lg transition-all active:scale-95",
                   activeTab === "email" ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20"
                 )}
               >
                 {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                 Send {activeTab}
               </Button>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
