import React from "react";
import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { 
  GraduationCap, ShieldCheck, Star, 
  MapPin, ArrowRight, Filter, Search 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "University Directory | Compare Top Online Degrees in India",
  description: "Browse 100% verified UGC-DEB online and distance universities. Compare ROI, Fee, and Placements across India's top institutions.",
  openGraph: {
    title: "India's Most Trusted Online University Directory",
    description: "Verified UGC-DEB partner universities for Online MBA, MCA, BBA and more.",
  }
};

async function getUniversities() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('universities')
    .select(`
      *,
      courses:courses (count)
    `)
    .order('name');
  
  if (error) return [];
  return data;
}

export default async function UniversityDirectoryPage() {
  const universities = await getUniversities();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-white/10 pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Partners
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                University <span className="text-blue-600">Directory</span>
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                Research and compare the ROI performance of India&apos;s leading online and distance education providers.
              </p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search university..." 
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-zinc-800 border-none rounded-xl font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <Button variant="outline" className="h-12 rounded-xl px-6 border-slate-200 dark:border-white/10 font-bold">
                <Filter className="w-4 h-4 mr-2" /> Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities.map((uni) => (
            <Link 
              key={uni.id} 
              href={`/universities/${uni.slug}`}
              className="group bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-zinc-800 p-3 flex items-center justify-center border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                  {uni.logo_url ? (
                    <img src={uni.logo_url} alt={uni.name} className="w-full h-full object-contain" />
                  ) : (
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                {uni.is_premium && (
                  <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-amber-500/20">
                    <Star className="w-3 h-3 fill-amber-600" /> Premier Partner
                  </div>
                )}
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                {uni.name}
              </h2>
              
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold mb-6">
                <MapPin className="w-3.5 h-3.5" /> India Based • {uni.courses[0]?.count || 0} PG/UG Programs
              </div>

              <div className="mt-auto pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg">
                  UGC-DEB VERIFIED
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
