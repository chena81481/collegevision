import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2, ShieldCheck, TrendingUp,
  Briefcase, Clock, IndianRupee,
  ChevronRight, ArrowLeft, Shield
} from 'lucide-react';
import { createAdminClient, getCachedUniversityData } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import BreakEvenChart from './BreakEvenChart';
import LeadCaptureForm from './LeadCaptureForm';
import CourseSelector from './CourseSelector';
import ShareButton from './ShareButton';
import TrustBadge from '@/components/features/TrustBadge';
import { formatINR } from './utils';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Metadata } from 'next';

export const revalidate = 86400; // ISR: Revalidate every 24 hours

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data: universities } = await supabase
    .from('universities')
    .select('slug, courses(category)');

  const params: any[] = [];
  
  (universities || []).forEach((uni: any) => {
    const categories = uni.courses?.map((c: any) => c.category).filter(Boolean) || ['online-degrees'];
    const uniqueCategories = Array.from(new Set(categories));
    
    uniqueCategories.forEach((cat: any) => {
      params.push({
        category: cat.toLowerCase().replace(/\s+/g, '-'),
        slug: uni.slug,
      });
    });
  });

  return params;
}

export async function generateMetadata({ params }: UniversityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const university = await getCachedUniversityData(slug);
  
  if (!university) return { title: 'University Not Found' };

  const primaryCourse = university.courses?.[0];
  const title = `${university.name} ${primaryCourse?.name || ''} - ₹${formatINR(primaryCourse?.total_fee_inr || 0)} Fees | ROI & Reviews`;
  const description = `Apply to ${university.name} for ${primaryCourse?.name || 'online degrees'}. Verified UGC-DEB approval, placement data, and ROI analysis. Start your application today with CollegeVision.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    }
  };
}

const PLACEMENT_PARTNERS = ['Deloitte', 'HDFC Bank', 'Amazon', 'TCS', 'KPMG', 'Accenture', 'Infosys', 'Wipro'];

interface UniversityPageProps {
  params: Promise<{ category: string; slug: string }>;
  searchParams: Promise<{ course?: string }>;
}

export default async function UniversityProfile({ params, searchParams }: UniversityPageProps) {
  const { slug } = await params;
  const { course: searchCourseId } = await searchParams;

  const supabaseAdmin = createAdminClient();
  const supabase = await createClient();

  const university = await getCachedUniversityData(slug);

  if (!university) {
    notFound();
  }

  const { data: { user } } = await supabase.auth.getUser();

  const selectedCourse = university.courses.find((c: any) => c.id === searchCourseId) || university.courses[0];
  const avgCtc = selectedCourse?.avg_ctc_inr ?? 0;
  const totalFee = selectedCourse?.total_fee_inr ?? 0;
  const roi = avgCtc && totalFee ? Math.round(((avgCtc * 3 - totalFee) / totalFee) * 100) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": university.name,
    "url": `https://collegevision.in/${selectedCourse?.category?.toLowerCase().replace(/\s+/g, '-') || 'online'}/${slug}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1200"
    },
    "description": university.description || `Explore ${university.name} online degree programs on CollegeVision.`,
    "offers": {
      "@type": "Offer",
      "price": totalFee.toString(),
      "priceCurrency": "INR"
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 selection:bg-teal-200 selection:text-teal-900">
      <Script
        id="university-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-white border-b border-slate-200 pt-20 pb-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/universities" className="hover:text-blue-600 transition-colors">Universities</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-semibold">{university.name}</span>
          </div>
          <ShareButton />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-1">
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-b-3xl md:rounded-3xl p-8 md:p-12 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-teal-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -left-20 bottom-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-teal-900 font-black text-xl text-center leading-tight shadow-lg border-4 border-white/10 shrink-0 px-2">
              {university.name.split(' ').filter(Boolean).map((w: string) => w[0]).slice(0, 3).join('')}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {university.is_premium && (
                  <span className="bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
                    Premium Partner
                  </span>
                )}
                {selectedCourse?.badge_label && (
                  <span className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    {selectedCourse.badge_label}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{university.name}</h1>
              <CourseSelector courses={university.courses} initialCourseId={selectedCourse.id} />

              {selectedCourse && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedCourse.approvals.map((a: string) => (
                    <span key={a} className="flex items-center gap-1 text-sm font-medium text-slate-200 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                      <ShieldCheck className="w-4 h-4 text-teal-400" /> {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            {[
              { icon: <Clock className="w-5 h-5 text-blue-600" />, label: 'Duration', value: `${Math.round((selectedCourse?.duration_months ?? 24) / 12)} Years`, bg: 'bg-slate-50', border: 'border-slate-100' },
              { icon: <IndianRupee className="w-5 h-5 text-blue-600" />, label: 'Total Fee', value: formatINR(totalFee), bg: 'bg-slate-50', border: 'border-slate-100' },
              { icon: <Briefcase className="w-5 h-5 text-green-600" />, label: 'Avg. CTC', value: avgCtc ? formatINR(avgCtc) : 'N/A', bg: 'bg-green-50', border: 'border-green-100', valueClass: 'text-green-700' },
              { icon: <TrendingUp className="w-5 h-5 text-purple-600" />, label: '3-Yr ROI', value: roi !== null ? `${roi}%` : 'N/A', bg: 'bg-purple-50', border: 'border-purple-100', valueClass: 'text-purple-700' },
            ].map(s => (
              <div key={s.label} className={`p-4 ${s.bg} rounded-xl border ${s.border}`}>
                {s.icon}
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 mt-2">{s.label}</div>
                <div className={`font-semibold text-slate-900 ${s.valueClass ?? ''}`}>{s.value}</div>
              </div>
            ))}
          </div>

          <TrustBadge />

          {avgCtc > 0 && (
            <BreakEvenChart totalFee={totalFee} avgCtc={avgCtc} />
          )}

          {selectedCourse && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Regulatory Approvals
              </h2>
              <div className="flex flex-wrap gap-3">
                {selectedCourse.approvals.map((a: string) => (
                  <div key={a} className="flex items-center gap-2 px-5 py-3 bg-green-50 border border-green-100 rounded-xl text-sm font-bold text-green-800">
                    <CheckCircle2 className="w-4 h-4 text-green-600" /> {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" /> Top Hiring Partners
            </h2>
            <div className="flex flex-wrap gap-3">
              {PLACEMENT_PARTNERS.map(company => (
                <div key={company} className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600 hover:border-blue-200 hover:shadow-sm hover:-translate-y-0.5 transition-all">
                  {company}
                </div>
              ))}
            </div>
          </div>

          {selectedCourse?.has_zero_cost_emi && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                  <IndianRupee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Zero-Cost EMI Available</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Pay {formatINR(Math.round(totalFee / (selectedCourse.duration_months)))} per month with{' '}
                    <strong>0% interest</strong>. No hidden charges.
                    Pre-approval takes less than 5 minutes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <LeadCaptureForm 
            universityName={university.name}
            courseName={selectedCourse.name}
            totalFee={totalFee}
            durationMonths={selectedCourse.duration_months}
            hasZeroCostEmi={selectedCourse.has_zero_cost_emi}
            roi={roi}
            user={user}
          />
        </div>
      </div>
    </div>
  );
}
