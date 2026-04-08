import React from "react";
import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { 
  GraduationCap, ShieldCheck, Star, 
  MapPin, ArrowRight, Filter, Search, CheckCircle2, Sparkles
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "University Directory | Compare Top Online Degrees in India",
  description: "Browse 100% verified UGC-DEB online and distance universities. Compare ROI, Fee, and Placements across India's top institutions.",
  alternates: {
    canonical: "/universities",
  },
  openGraph: {
    title: "India's Most Trusted Online University Directory",
    description: "Verified UGC-DEB partner universities for Online MBA, MCA, BBA and more.",
    url: "https://collegevision.in/universities",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "University Directory | Compare Top Online Degrees in India",
    description: "Browse verified online universities, fees, ROI and placements across India's top institutions.",
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
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://collegevision.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Universities",
        "item": "https://collegevision.in/universities"
      }
    ]
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What can I compare in the CollegeVision university directory?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Students can compare verified online universities, fees, approvals, ROI direction and profile detail pages from the directory."
        }
      },
      {
        "@type": "Question",
        "name": "Does the directory include only online universities?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The directory focuses on verified online and distance-friendly university options that are relevant to CollegeVision's comparison experience."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
        <section className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Why this directory matters</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Search engines and students both need clearer destinations than a generic homepage. This directory is where
                CollegeVision groups verified universities into a browsable research layer, so students can move from brand discovery
                to detailed ROI and admission evaluation without relying on marketing-heavy aggregator pages.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <p className="mt-3 text-sm font-black text-slate-900">Verified profile pages</p>
                <p className="mt-1 text-xs leading-6 text-slate-500">Each university card leads into a detailed profile with application context.</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <p className="mt-3 text-sm font-black text-slate-900">Better discovery paths</p>
                <p className="mt-1 text-xs leading-6 text-slate-500">This page creates more useful sitelink candidates for branded Google searches.</p>
              </div>
            </div>
          </div>
        </section>

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

        <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Common questions about online universities in India</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                q: "How do I judge if an online university is trustworthy?",
                a: "Start with approvals, then compare fee transparency, course outcomes and whether the profile page clearly explains the program.",
              },
              {
                q: "Should I begin with directory browsing or AI match search?",
                a: "Directory browsing is better for brand-led research, while AI matching is better when you already know your budget and goal.",
              },
              {
                q: "Can I move from a university page to application help directly?",
                a: "Yes. The detailed profile routes are designed to move students into guided shortlisting and application intent capture.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-900">{item.q}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/online-mba" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Online MBA pages
            </Link>
            <Link href="/online-mca" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Online MCA pages
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> AI search homepage
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
