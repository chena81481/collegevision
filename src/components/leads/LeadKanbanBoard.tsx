"use client";

import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { LeadStatus } from "@/lib/constants";
import { LeadCard } from "./LeadCard";
import { useLeads } from "@/hooks/useLeads";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";

const COLUMNS = [
  { id: LeadStatus.NEW_LEAD, title: "New Leads", color: "bg-slate-50 border-slate-200" },
  { id: LeadStatus.CONTACTED, title: "Contacted", color: "bg-blue-50/30 border-blue-100" },
  { id: LeadStatus.PROPOSAL, title: "Proposal", color: "bg-purple-50/30 border-purple-100" },
  { id: LeadStatus.WON, title: "Won", color: "bg-emerald-50/30 border-emerald-100" },
  { id: LeadStatus.LOST, title: "Lost", color: "bg-rose-50/30 border-rose-100" },
];

export function LeadKanbanBoard() {
  const { leads, loading, updateLeadStatus } = useLeads();

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as LeadStatus;
    updateLeadStatus(draggableId, newStatus);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium italic">Assembling your pipeline...</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full min-h-[700px]">
        {COLUMNS.map((column) => (
          <div key={column.id} className="flex flex-col h-full">
            <Card className={cn("border-b-4 h-full bg-slate-50/50", column.color)}>
              <CardHeader className="p-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    {column.title}
                  </CardTitle>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {leads.filter((l) => l.status === column.id).length} Leads
                  </p>
                </div>
                <button className="text-slate-400 hover:text-blue-600 hover:bg-white p-1 rounded-md transition-all shadow-sm">
                  <Plus className="h-4 w-4" />
                </button>
              </CardHeader>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "flex-1 p-3 transition-colors duration-200 min-h-[500px]",
                      snapshot.isDraggingOver && "bg-slate-200/50"
                    )}
                  >
                    {leads
                      .filter((lead) => lead.status === column.id)
                      .map((lead, index) => (
                        <LeadCard key={lead.id} lead={lead} index={index} />
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Card>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
