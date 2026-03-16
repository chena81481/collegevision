"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, Plus, Search, 
  Trash2, ExternalLink, Calculator,
  TrendingUp, Award, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ShortlistManager({ leadId }: { leadId: string }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchApplications();
    fetchUniversities();
  }, []);

  const fetchApplications = async () => {
    const res = await fetch(`/api/applications?leadId=${leadId}`);
    const data = await res.json();
    setApplications(data);
    setLoading(false);
  };

  const fetchUniversities = async () => {
    const res = await fetch("/api/universities");
    const data = await res.json();
    setUniversities(data);
  };

  const addToShortlist = async (uniId: string) => {
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, universityId: uniId, status: "SHORTLISTED" }),
    });
    fetchApplications();
  };

  const updateStatus = async (uniId: string, status: string) => {
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, universityId: uniId, status }),
    });
    fetchApplications();
  };

  if (loading) return <div>Loading Shortlist...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Shortlist */}
        <div className="space-y-4">
          <div className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
             <Award className="h-4 w-4 text-emerald-600" /> Current Shortlist
          </div>
          {applications.map((app) => (
            <Card key={app.id} className="rounded-2xl border-slate-200 overflow-hidden hover:shadow-lg transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xs ring-4 ring-slate-50">
                    {app.university.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900">{app.university.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-2 bg-blue-50 text-blue-700">
                        {app.status}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-bold">₹{(app.scholarshipAmount || 0) / 1000}K Scholarship</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <select 
                     value={app.status}
                     onChange={(e) => updateStatus(app.university.id, e.target.value)}
                     className="text-[10px] font-bold border-slate-200 rounded-lg py-1 px-2 focus:ring-0"
                   >
                     <option value="SHORTLISTED">Shortlisted</option>
                     <option value="APPLIED">Applied</option>
                     <option value="OFFER_RECEIVED">Offer Received</option>
                     <option value="REJECTED">Rejected</option>
                   </select>
                </div>
              </CardContent>
            </Card>
          ))}
          {applications.length === 0 && (
            <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center">
              <p className="text-xs font-bold text-slate-400 italic">No universities shortlisted yet.</p>
            </div>
          )}
        </div>

        {/* Search & Add */}
        <div className="space-y-4">
          <div className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
             <Plus className="h-4 w-4 text-blue-600" /> Add to Shortlist
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <Input 
               placeholder="Search universities..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="pl-10 rounded-xl border-slate-200"
             />
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {universities.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).map(u => (
              <div key={u.id} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors">
                <span className="text-xs font-bold text-slate-700">{u.name}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => addToShortlist(u.id)}
                  disabled={applications.some(app => app.universityId === u.id)}
                  className="h-8 px-2 text-blue-600 font-bold"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
