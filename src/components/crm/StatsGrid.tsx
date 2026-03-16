"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, CheckCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsGridProps {
  stats: {
    totalLeads: number;
    wonLeads: number;
    activeLeads: number;
    conversionRate: string;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  const cards = [
    { title: "Total Leads", value: stats.totalLeads, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Active Deals", value: stats.activeLeads, icon: Target, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Converted", value: stats.wonLeads, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <Card key={idx} className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
              <h3 className="text-2xl font-black text-slate-900">{card.value}</h3>
            </div>
            <div className={cn("p-4 rounded-2xl", card.bg)}>
              <card.icon className={cn("h-6 w-6", card.color)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
