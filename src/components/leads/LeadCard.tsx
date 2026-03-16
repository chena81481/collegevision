"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, GraduationCap, Calendar } from "lucide-react";
import { LeadPriority } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LeadCardProps {
  lead: any;
  index: number;
}

const priorityColors = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-blue-50 text-blue-700",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  URGENT: "bg-red-50 text-red-700 border-red-200 animate-pulse",
};

export function LeadCard({ lead, index }: LeadCardProps) {
  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "mb-3 transition-all duration-200",
            snapshot.isDragging && "scale-[1.02] z-50 shadow-2xl"
          )}
        >
          <Card className="bg-white border-slate-200 hover:border-slate-300 shadow-sm rounded-xl overflow-hidden group">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {lead.name}
                </h4>
                <Badge variant="outline" className={cn("text-[10px] font-bold uppercase", priorityColors[lead.priority as keyof typeof LeadPriority])}>
                  {lead.priority}
                </Badge>
                {lead.aiScore > 0 && (
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-black border-2 transition-all",
                    lead.aiScore > 80 ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20" : 
                    lead.aiScore > 50 ? "bg-blue-500 text-white border-blue-400" :
                    "bg-slate-200 text-slate-500 border-slate-100"
                  )}>
                    {lead.aiScore}
                  </div>
                )}
              </div>

              {lead.university && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                  <span className="truncate">{lead.university.name}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-50 mt-2">
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Phone className="h-3 w-3" />
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Mail className="h-3 w-3" />
                  <span>{lead.email}</span>
                </div>
              </div>

              {lead.expectedDecisionDate && (
                <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 p-1 px-2 rounded-lg inline-block">
                  <Calendar className="h-3 w-3" />
                  <span>Decision: {new Date(lead.expectedDecisionDate).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
