import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  CheckCircle2, XCircle, TrendingUp, 
  Briefcase, IndianRupee, ShieldCheck,
  ChevronRight, ArrowRight, Scale
} from 'lucide-react';
import { createAdminClient, getCachedUniversityData } from '@/utils/supabase/admin';
import { formatINR } from '@/app/[category]/[slug]/utils';
import Script from 'next/script';
import { calculateROI } from '@/lib/roi-calculator';
import { FALLBACK_COURSE_CATALOG } from '@/lib/course-catalog';

export const revalidate = 86400;

export async function generateStaticParams() {
  const slugs = FALLBACK_COURSE_CATALOG.map(c => c.university.slug);
  const params = [];
  
  for (let i = 0; i < slugs.length; i++) {
    for (let j = 0; j < slugs.length; j++) {
      if (i !== j) {
        params.push({ slug: `${slugs[i]}-vs-${slugs[j]}` });
      }
    }
  }
  
  return params;
}

// Fallback helper to get data from catalog or DB
async function getComparisonData(slug: string) {
  try {
    // Try DB first
    const data = await getCachedUniversityData(slug);
    if (data) return data;
  } catch (e) {
    // Fallback to catalog
    const catalogItem = FALLBACK_COURSE_CATALOG.find(c => c.university.slug === slug);
    if (catalogItem) {
      return {
        name: catalogItem.university.name,
        slug: catalogItem.university.slug,
        courses: [{
          id: catalogItem.id,
          name: catalogItem.name,
          total_fee_inr: catalogItem.totalFeeInr,
          avg_ctc_inr: catalogItem.avgCtcInr,
          has_zero_cost_emi: catalogItem.hasZeroCostEmi,
          approvals: catalogItem.approvals,
          duration_months: catalogItem.durationMonths,
          category: catalogItem.category
        }]
      };
    }
  }
  return null;
}

interface ComparePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [uni1Slug, uni2Slug] = slug.split('-vs-');
  
  if (!uni1Slug || !uni2Slug) return { title: 'Comparison' };

  const uni1 = await getComparisonData(uni1Slug.replace(/-online-.*/, ''));
  const uni2 = await getComparisonData(uni2Slug.replace(/-online-.*/, ''));

  if (!uni1 || !uni2) return { title: 'Compare Universities' };

  const title = `${uni1.name} vs ${uni2.name} - Detailed Fees, ROI & Placement Comparison`;
  const description = `Compare ${uni1.name} vs ${uni2.name} for online degrees. Side-by-side review of total fees, 3-year ROI, regulatory approvals, and top hiring partners. Which is better for your career?`;

  return {
    title,
    description,
    alternates: {
      canonical: `/compare/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://collegevision.in/compare/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CompareUniversities({ params }: ComparePageProps) {
  const { slug } = await params;
  const [uni1Raw, uni2Raw] = slug.split('-vs-');
  
  if (!uni1Raw || !uni2Raw) notFound();

  // Extract base slugs (ignoring course suffixes for simple lookup in this MVP)
  const uni1Slug = uni1Raw.split('-online-')[0];
  const uni2Slug = uni2Raw.split('-online-')[0];

  const uni1 = await getComparisonData(uni1Slug);
  const uni2 = await getComparisonData(uni2Slug);

  if (!uni1 || !uni2) notFound();

  const u1Course = uni1.courses?.[0];
  const u2Course = uni2.courses?.[0];

  if (!u1Course || !u2Course) notFound();

  const u1ROIModel = u1Course.avg_ctc_inr && u1Course.total_fee_inr
    ? calculateROI({
        totalFee: u1Course.total_fee_inr,
        avgCTC: u1Course.avg_ctc_inr,
        currentSalary: 0,
        durationMonths: u1Course.duration_months ?? 24,
        placementRate: 78,
        loanInterestRate: u1Course.has_zero_cost_emi ? 0 : 9,
        isOnline: true,
      })
    : null;
  const u2ROIModel = u2Course.avg_ctc_inr && u2Course.total_fee_inr
    ? calculateROI({
        totalFee: u2Course.total_fee_inr,
        avgCTC: u2Course.avg_ctc_inr,
        currentSalary: 0,
        durationMonths: u2Course.duration_months ?? 24,
        placementRate: 78,
        loanInterestRate: u2Course.has_zero_cost_emi ? 0 : 9,
        isOnline: true,
      })
    : null;
  const u1ROI = u1ROIModel ? Math.round((u1ROIModel.totalReturnsFiveYears / u1ROIModel.totalCost) * 100) : 0;
  const u2ROI = u2ROIModel ? Math.round((u2ROIModel.totalReturnsFiveYears / u2ROIModel.totalCost) * 100) : 0;

  const comparisonItems = [
    { label: 'UGC-DEB Approved', val1: u1Course.approvals?.includes('UGC-DEB'), val2: u2Course.approvals?.includes('UGC-DEB'), type: 'boolean' },
    { label: 'Total Fee', val1: u1Course.total_fee_inr, val2: u2Course.total_fee_inr, type: 'currency', better: 'lower' },
    { label: 'Pocket Savings', val1: Math.max(0, (u2Course.total_fee_inr || 0) - (u1Course.total_fee_inr || 0)), val2: Math.max(0, (u1Course.total_fee_inr || 0) - (u2Course.total_fee_inr || 0)), type: 'currency', better: 'higher' },
    { label: '5-Year ROI', val1: u1ROI, val2: u2ROI, type: 'percentage', better: 'higher' },
    { label: 'Avg. CTC', val1: u1Course.avg_ctc_inr, val2: u2Course.avg_ctc_inr, type: 'currency', better: 'higher' },
    { label: 'Break-even', val1: u1ROIModel?.breakEvenYear ?? 0, val2: u2ROIModel?.breakEvenYear ?? 0, type: 'years', better: 'lower' },
    { label: 'Zero-Cost EMI', val1: u1Course.has_zero_cost_emi, val2: u2Course.has_zero_cost_emi, type: 'boolean' },
    { label: 'NAAC A+ Grade', val1: u1Course.approvals?.includes('NAAC A+'), val2: u2Course.approvals?.includes('NAAC A+'), type: 'boolean' },
  ];
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
        "name": "Compare Universities",
        "item": `https://collegevision.in/compare/${slug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 font-sans">
      <Script
        id="compare-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
             <Scale className="w-3.5 h-3.5" /> Programmatic Side-by-Side Comparison
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            {uni1.name} <span className="text-slate-400 font-light italic">vs</span> {uni2.name}
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
            Based on verified database snapshots. Our algorithm ranks universities on ROI, placement success, and regulatory compliance.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          {/* Scrollable Container */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="min-w-[600px] md:min-w-full">
              {/* Table Header */}
              <div className="grid grid-cols-[160px_1fr_1fr] md:grid-cols-3 bg-slate-900 text-white p-6 md:p-8 sticky top-0 z-20">
                <div className="text-sm font-bold opacity-50 flex items-center">Category</div>
                <div className="text-center font-black text-lg md:text-xl truncate px-2">{uni1.name}</div>
                <div className="text-center font-black text-lg md:text-xl truncate px-2">{uni2.name}</div>
              </div>

              <div className="divide-y divide-slate-100">
                {comparisonItems.map((item, idx) => {
                  const u1Better = item.better === 'higher' ? (item.val1 > item.val2) : item.better === 'lower' ? (item.val1 < item.val2) : false;
                  const u2Better = item.better === 'higher' ? (item.val2 > item.val1) : item.better === 'lower' ? (item.val2 < item.val1) : false;

                  return (
                    <div key={idx} className="grid grid-cols-[160px_1fr_1fr] md:grid-cols-3 p-6 md:p-8 hover:bg-slate-50 transition-colors group">
                      <div className="text-xs md:text-base font-bold text-slate-500 flex items-center bg-white sticky left-0 z-10 md:static group-hover:bg-slate-50 transition-colors pr-4">
                        {item.label}
                      </div>
                      
                      <div className={`text-center ${u1Better ? 'font-black text-blue-600' : 'font-semibold text-slate-900'}`}>
                        {renderValue(item.val1, item.type)}
                        {u1Better && <span className="block text-[10px] text-blue-500 uppercase tracking-tighter mt-1">Winner</span>}
                      </div>
                      
                      <div className={`text-center ${u2Better ? 'font-black text-blue-600' : 'font-semibold text-slate-900'}`}>
                        {renderValue(item.val2, item.type)}
                        {u2Better && <span className="block text-[10px] text-blue-500 uppercase tracking-tighter mt-1">Winner</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-[160px_1fr_1fr] md:grid-cols-3 p-8 bg-slate-50 border-t border-slate-100">
                <div className="sticky left-0 bg-slate-50 z-10 md:static"></div>
                <div className="px-4">
                  <Link href={`/${u1Course.category?.toLowerCase() || 'online'}/${uni1.slug}`} className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all">
                    Full Profile
                  </Link>
                </div>
                <div className="px-4">
                  <Link href={`/${u2Course.category?.toLowerCase() || 'online'}/${uni2.slug}`} className="block w-full text-center bg-white text-slate-900 border border-slate-200 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                    Full Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Context Box */}
        <div className="mt-12 bg-blue-600 rounded-[32px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
           <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
           <h2 className="text-2xl font-bold mb-4 relative z-10">Why compare with CollegeVision?</h2>
           <p className="text-blue-100 mb-8 relative z-10 leading-relaxed max-w-3xl">
             Every university listed on our platform is personally verified by our "Trust Engine". We analyze UGC-DEB data, 
             NAAC grades, and real student placement outcomes to ensure you make the right choice for your career.
           </p>
           <div className="flex flex-wrap gap-4 relative z-10">
              <Link href="/" className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold text-sm">Return Home</Link>
              <Link href="/universities" className="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm border border-blue-400">View All Listing</Link>
           </div>
        </div>
      </div>
    </div>
  );
}

function renderValue(val: any, type: string) {
  if (type === 'boolean') {
    return val ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-slate-300 mx-auto" />;
  }
  if (type === 'currency') {
    return formatINR(val);
  }
  if (type === 'percentage') {
    return `${val}%`;
  }
  if (type === 'years') {
    return `${val} yrs`;
  }
  return val;
}
