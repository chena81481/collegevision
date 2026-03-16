"use client";

import { useState, useEffect } from "react";
import { 
  Bell, Check, Info, AlertTriangle, 
  X, ExternalLink 
} from "lucide-react";
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function NotificationCenter({ counselorId }: { counselorId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch(`/api/notifications?counselorId=${counselorId}`);
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      } catch (err) {
        console.error(err);
      }
    }
    fetchNotifications();
    
    // Simple polling every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [counselorId]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative group">
          <Bell className="w-5 h-5 group-hover:text-blue-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] font-black text-white flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-2xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-md overflow-hidden" align="end">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Notifications</h3>
          <button className="text-[10px] font-bold text-blue-600 hover:underline">Mark all read</button>
        </div>
        <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-50">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-4 flex gap-3 transition-colors hover:bg-white",
                  !n.read && "bg-blue-50/30"
                )}
                onClick={() => !n.read && markAsRead(n.id)}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  n.title.includes("WON") ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                )}>
                  {n.title.includes("WON") ? <Check className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900">{n.title}</div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                  <div className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No new alerts</p>
            </div>
          )}
        </div>
        <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
           <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">View All Updates</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
