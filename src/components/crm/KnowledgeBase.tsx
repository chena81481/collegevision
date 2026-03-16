"use client";

import { useState, useEffect } from "react";
import { 
  Search, BookOpen, FileText, 
  MapPin, Clock, Filter, Plus,
  Info, ExternalLink, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function KnowledgeBase() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const categories = [
    { id: "ALL", label: "All Resources" },
    { id: "UNIVERSITY_INFO", label: "University Info" },
    { id: "VISA", label: "Visa Guides" },
    { id: "SCHOLARSHIP", label: "Scholarships" },
    { id: "ADMISSION", label: "Admission Requirements" }
  ];

  useEffect(() => {
    fetchResources();
  }, [search, category]);

  const fetchResources = async () => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (category !== "ALL") query.set("category", category);
    
    const res = await fetch(`/api/knowledge?${query.toString()}`);
    const data = await res.json();
    setResources(data);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="relative w-full md:max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <Input 
             placeholder="Search knowledge base (visa, admission, uni)..." 
             className="pl-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-blue-500/20"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? "secondary" : "outline"}
              size="sm"
              onClick={() => setCategory(cat.id)}
              className={cn(
                "rounded-xl h-10 px-4 text-xs font-bold transition-all",
                category === cat.id ? "bg-slate-900 border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {resources.map((res) => (
          <Card key={res.id} className="rounded-3xl border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer overflow-hidden">
            <CardHeader className="p-6 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
              <Badge variant="outline" className="text-[10px] font-black uppercase py-0 px-2 bg-white text-blue-600 border-blue-100">
                {res.category.replace('_', ' ')}
              </Badge>
              <Clock className="h-3 w-3 text-slate-400" />
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                 <h3 className="text-sm font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{res.title}</h3>
                 {res.university && (
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <MapPin className="h-3 w-3" /> {res.university.name}
                   </div>
                 )}
              </div>
              
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {res.content}
              </p>

              <div className="pt-2 flex items-center justify-between">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                       <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200" />
                    ))}
                 </div>
                 <div className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Guide <ChevronRight className="h-3 w-3" />
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {resources.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-slate-100">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-slate-300" />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-black text-slate-900">No resources found</p>
                <p className="text-xs text-slate-400">Try adjusting your search or filters.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
