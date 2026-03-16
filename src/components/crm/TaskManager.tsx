"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function TaskManager({ counselorId }: { counselorId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch(`/api/tasks?counselorId=${counselorId}`);
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [counselorId]);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));
      toast.success(currentStatus ? "Task reopened" : "Task completed!");
    } catch (err) {
      toast.error("Error updating task");
    }
  };

  if (loading) return null;

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> My Tasks
        </CardTitle>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
          {tasks.filter(t => !t.completed).length} Pending
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div 
                key={task.id} 
                className={cn(
                  "p-4 px-6 flex items-start gap-4 transition-colors hover:bg-slate-50/50",
                  task.completed && "opacity-50"
                )}
              >
                <button 
                  onClick={() => toggleTask(task.id, task.completed)}
                  className="mt-0.5 text-slate-300 hover:text-blue-600 transition-colors"
                >
                  {task.completed ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5" />}
                </button>
                <div className="flex-1">
                  <div className={cn("text-sm font-bold text-slate-900", task.completed && "line-through")}>
                    {task.title}
                  </div>
                  {task.description && <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>}
                  {task.dueDate && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-slate-400 uppercase">
                      <Clock className="h-3 w-3" /> Due {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center space-y-2">
               <AlertCircle className="h-8 w-8 text-slate-200 mx-auto" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">All caught up!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
