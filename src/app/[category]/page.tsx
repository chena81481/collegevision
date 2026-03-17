import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { 
  ArrowRight, ShieldCheck, TrendingUp, 
  Users, Star, MapPin, Search
} from 'lucide-react';
import { createAdminClient } from '@/utils/supabase/admin';
import Navbar from '@/components/layout/Navbar';
import TopTrustRibbon from '@/components/layout/TopTrustRibbon';
import { Footer } from '@/components/layout/Footer';
import { formatINR } from './[slug]/utils';

export const revalidate = 86400; // ISR: 24 hours

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data: courses } = await supabase
    .from('courses')
    .select('category');

  const categories = Array.from(new Set((courses || []).map(c => c.category).filter(Boolean)));
  
  return categories.map(cat => ({
    category: cat!.toLowerCase().replace(/\s+/g, '-'),
  }));
}

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryName = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const title = `Top 10 ${categoryName} Colleges in India (2026) - Fees & ROI Compared`;
  const description = `Find and compare the best ${categoryName} programs from top universities in India. Verified UGC-DEB approvals, fee structure, placement data, and ROI analysis.`;

  return { title, description };
}

export default async function CategoryLandingPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryName = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const supabase = createAdminClient();
  
  // Fetch courses in this category with their university data
  // Note: We're matching by lowercase slug-style category
  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      *,
      universities (
        name,
        slug,
        logo_url,
        is_premium
      )
    `)
    .ilike('category', category.replace(/-/g, ' '))
    .order('avg_ctc_inr', { ascending: false });

  if (error || !courses || courses.length === 0) {
    // If no exact match, try a more flexible match or just 404
    const { data: fallbackCourses } = await supabase
        .from('courses')
        .select('*, universities(*)')
        .limit(10);
    
    if (!fallbackCourses) notFound();
    // For now, let's just 404 if the category is truly unknown
    // return notFound(); 
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": (courses || []).map((c, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Product",
        "name": `${c.universities?.name} ${c.name}`,
        "description": `Online degree program with ${c.approvals?.join(', ')} approvals.`,
        "url": `https://collegevision.in/${category}/${c.universities?.slug}`
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <TopTrustRibbon />
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Hero / Header */}
          <div className="mb-16">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">
               <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
               Category Cluster: {categoryName}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Best <span className="text-blue-600">{categoryName}</span> Programs <br className="hidden md:block" />
              in India for 2026.
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
              We've analyzed 50+ {categoryName} programs based on government data, 
              ROI break-even timelines, and placement authority. Compare and apply to 100% verified universities.
            </p>
          </div>

          {/* Filters Placeholder (For future implementation) */}
          <div className="flex flex-wrap gap-4 mb-12">
            <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3 text-sm font-bold text-slate-700">
               <ShieldCheck className="w-5 h-5 text-emerald-500" /> 100% UGC-DEB Verified
            </div>
            <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3 text-sm font-bold text-slate-700">
               <TrendingUp className="w-5 h-5 text-blue-500" /> High ROI Matches
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(courses || []).map((course: any) => (
              <div 
                key={course.id}
                className="group relative bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col"
              >
                {/* University Logo & Badge */}
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 p-2 overflow-hidden shadow-sm">
                    {course.universities?.logo_url ? (
                      <img src={course.universities.logo_url} alt={course.universities.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-black text-slate-300 text-xl">
                        {course.universities?.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  {course.universities?.is_premium && (
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-100">
                      Premium Partner
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                    {course.universities?.name}
                  </h3>
                  <p className="text-sm font-bold text-slate-400">{course.name}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Total Fee</p>
                    <p className="text-base font-black text-slate-900">₹{formatINR(course.total_fee_inr)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Avg. CTC</p>
                    <p className="text-base font-black text-emerald-600">₹{formatINR(course.avg_ctc_inr || 0)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-10">
                  {course.approvals?.slice(0, 2).map((a: string) => (
                    <span key={a} className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> {a}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <Link 
                  href={`/${category}/${course.universities?.slug}`}
                  className="mt-auto block w-full bg-slate-100 hover:bg-slate-900 hover:text-white py-4 rounded-2xl text-center text-xs font-black transition-all group-hover:shadow-xl"
                >
                  View Placement Data & ROI <ArrowRight className="inline-block w-4 h-4 ml-2" />
                </Link>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {(!courses || courses.length === 0) && (
            <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
               <Search className="w-12 h-12 text-slate-200 mx-auto mb-6" />
               <h2 className="text-2xl font-bold text-slate-400">No programs found in this category yet.</h2>
               <p className="text-slate-400 mt-2">Try searching our discovery engine for other options.</p>
               <Link href="/" className="inline-block mt-8 text-blue-600 font-bold hover:underline">Explore All Colleges</Link>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
