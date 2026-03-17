"use client";

import { 
  Phone, Mail, MessageCircle, 
  Trash2, UserPlus, FileEdit 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logLeadActivity } from "@/app/actions/crm";

export function LeadQuickActions({ leadId, phone, email, name, counselorId }: { leadId: string, phone: string, email: string, name: string, counselorId: string }) {
  
  const handleLogActivity = async (type: string, description: string) => {
    const result = await logLeadActivity({
      leadId,
      type,
      description,
      counselorId
    });

    if (result.success) {
      toast.success(`${type} logged`);
    } else {
      toast.error(result.error || "Failed to log activity");
    }
  };

  const generateWhatsAppMsg = () => {
    // Contextual messaging based on lead's likely interest
    return `Hi ${name}, I'm Priya from CollegeVision. I noticed you were exploring university programs on our platform. How can I help you with the admission process?`;
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button 
        variant="outline" 
        onClick={() => {
          window.location.href = `tel:${phone}`;
          handleLogActivity("CALL", `Initiated phone call to ${phone}`);
        }}
        className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-bold flex items-center gap-2"
      >
        <Phone className="h-4 w-4" /> Call
      </Button>

      <a 
        href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(generateWhatsAppMsg())}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleLogActivity("WHATSAPP", `Sent WhatsApp message to ${phone}`)}
        className="inline-flex items-center justify-center rounded-xl bg-[#25D366]/10 text-[#128C7E] px-4 py-2 text-sm font-bold transition-colors border border-[#25D366]/30 hover:bg-[#25D366]/20 gap-2"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>

      <Button 
        variant="outline" 
        onClick={() => {
          window.location.href = `mailto:${email}`;
          handleLogActivity("EMAIL", `Sent email to ${email}`);
        }}
        className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 font-bold flex items-center gap-2"
      >
        <Mail className="h-4 w-4" /> Email
      </Button>

      <div className="h-8 w-px bg-slate-200 mx-2" />

      <Button variant="ghost" className="rounded-xl text-slate-500 hover:text-slate-900 font-medium">
        <UserPlus className="h-4 w-4 mr-2" /> Reassign
      </Button>
      
      <Button variant="ghost" className="rounded-xl text-slate-500 hover:text-slate-900 font-medium">
        <FileEdit className="h-4 w-4 mr-2" /> Edit
      </Button>

      <Button variant="ghost" className="rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-medium">
        <Trash2 className="h-4 w-4 mr-2" /> Delete
      </Button>
    </div>
  );
}
