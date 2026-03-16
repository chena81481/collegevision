"use client";

import { useState, useCallback } from "react";
import { Search, User, Phone, Mail, ChevronRight, Loader2, GraduationCap, BookOpen } from "lucide-react";
import { 
  Dialog, DialogContent, 
  DialogHeader, DialogTitle, DialogPortal, DialogOverlay 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function GlobalSearch({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search/universal?q=${val}`);
      const data = await res.json();
      // Combine results for the simple list view in GlobalSearch
      const combined = [
        ...data.leads.map((l: any) => ({ ...l, type: "lead" })),
        ...data.universities.map((u: any) => ({ ...u, type: "university" })),
        ...data.knowledge.map((k: any) => ({ ...k, type: "knowledge" })),
      ];
      setResults(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <Search className="h-5 w-5 text-blue-600" />
          <input 
            autoFocus
            placeholder="Search leads, universities, or internal guides..."
            className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-slate-900 placeholder:text-slate-400"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item) => (
                <Link 
                  key={item.id} 
                  href={
                    item.type === "lead" ? `/admin/leads/${item.id}` :
                    item.type === "university" ? `/admin/pipeline?uni=${item.id}` :
                    `/admin/knowledge?res=${item.id}`
                  }
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs ring-4 ring-slate-50 group-hover:bg-slate-900 group-hover:text-white group-hover:ring-slate-100 transition-all">
                      {item.type === "lead" ? item.name[0] : item.type === "university" ? <GraduationCap className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{item.type === "lead" ? item.name : item.type === "university" ? item.name : item.title}</div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                         {item.type === "lead" ? (
                           <>
                             <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {item.phone}</span>
                             <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {item.email}</span>
                           </>
                         ) : item.type === "university" ? (
                           <span>{item.location}, {item.country}</span>
                         ) : (
                           <span>{item.category}</span>
                         )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.type}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : query.length > 1 && !loading ? (
            <div className="p-10 text-center">
              <p className="text-slate-400 font-bold italic tracking-widest text-sm uppercase">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-10 text-center opacity-30 select-none">
               <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
               <p className="text-sm font-bold tracking-widest uppercase">Start typing to search...</p>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 p-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 flex justify-between">
           <span>ProTip: Search by phone or email for faster results</span>
           <span className="text-slate-300">ESC to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
