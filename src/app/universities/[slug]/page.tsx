"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  CheckCircle2, ShieldCheck, TrendingUp,
  Briefcase, Clock, IndianRupee, ArrowRight, Share2,
  Check, ChevronRight, ArrowLeft, Loader2, AlertCircle, Sparkles
} from 'lucide-react';
import { createClient as createJSClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { submitApplicationLead } from '@/app/actions/leads';
import ScholarshipBadge from '@/components/features/ScholarshipBadge';

// Dynamically import recharts — MUST be ssr:false or it crashes on the server
const ROIChart = dynamic(() => import('@/components/ui/roi-chart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
    </div>
  ),
});

// ─── Supabase (public/read-only) ──────────────────────────────────────────────
const supabaseJS = createJSClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface Course {
  id: string;
  name: string;
  degree_level: string;
  duration_months: number;
  total_fee_inr: number;
  avg_ctc_inr: number | null;
  has_zero_cost_emi: boolean;
  approvals: string[];
  badge_label: string | null;
  scholarships?: any[];
}

interface University {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  gradient_start: string;
  gradient_end: string;
  is_premium: boolean;
  courses: Course[];
}

// ─── Placement partners (will come from DB in production) ────────────────────
const PLACEMENT_PARTNERS = ['Deloitte', 'HDFC Bank', 'Amazon', 'TCS', 'KPMG', 'Accenture', 'Infosys', 'Wipro'];

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);
}

// ─── Break-even chart data ────────────────────────────────────────────────────
function buildChartData(totalFee: number, avgCtcAnnual: number) {
  const monthly = Math.round(avgCtcAnnual / 12);
  const data = [];
  for (let i = 0; i <= 18; i++) {
    data.push({
      month: `Mo ${i}`,
      'Net Balance': Math.round(monthly * i - totalFee),
    });
  }
  return { data, monthly, breakEvenMonth: Math.ceil(totalFee / monthly) || 12 };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UniversityProfile() {
  const params = useParams();
  const slug = params?.slug as string;

  const [university, setUniversity] = useState<University | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [studentScore, setStudentScore] = useState<number | null>(null);
  const supabase = createClient();

  // ── Fetch from Supabase ───────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    async function load() {
      setLoading(true);
      const { data, error: err } = await supabaseJS
        .from('universities')
        .select(`
          *,
          courses (
            *,
            scholarships (*)
          )
        `)
        .eq('slug', slug)
        .single();

      if (err || !data) {
        setError('University not found.');
      } else {
        setUniversity(data as University);
        if (data.courses?.length) setSelectedCourse(data.courses[0]);
      }
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('score_percentage')
          .eq('user_id', authUser.id)
          .single();
        setStudentScore(profile?.score_percentage || null);
      }
      
      setLoading(false);
    }
    load();
  }, [slug]);

  // ── Lead submission ───────────────────────────────────────────────────────
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || phone.length < 10) return;
    setIsApplying(true);
    try {
      const formData = new FormData();
      formData.append('phone', `+91${phone}`);
      formData.append('courseName', selectedCourse?.name || 'General Inquiry');
      formData.append('universityName', university?.name || 'CollegeVision');
      
      if (user) {
        formData.append('email', user.email || '');
        formData.append('studentName', user.user_metadata?.full_name || '');
      }

      const result = await submitApplicationLead(formData);
      
      if (result.success) {
        setApplySuccess(true);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error("Lead submission error:", err);
      setApplySuccess(true);
    } finally {
      setIsApplying(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !university) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">University not found</h2>
          <p className="text-slate-500 text-sm">We couldn&apos;t find a university matching this URL.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ── Calculation logic ─────────────────────────────────────────────────────
  const course = selectedCourse ?? university.courses[0];
  const avgCtc = course?.avg_ctc_inr ?? 0;
  
  // Calculate specific course scholarship
  const qualifiedS = studentScore && course?.scholarships
    ? course.scholarships
        .filter((s: any) => studentScore >= s.min_score)
        .sort((a: any, b: any) => b.discount_percentage - a.discount_percentage)[0]
    : null;

  const savings = qualifiedS ? Math.round(course.total_fee_inr * (qualifiedS.discount_percentage / 100)) : 0;
  const finalFee = course ? course.total_fee_inr - savings : 0;

  const { data: chartData, monthly, breakEvenMonth } = buildChartData(finalFee, avgCtc);
  const baseRoi = avgCtc && (course?.total_fee_inr ?? 1) ? Math.round(((avgCtc * 3 - (course?.total_fee_inr ?? 1)) / (course?.total_fee_inr ?? 1)) * 100) : 0;
  const roi = qualifiedS ? Math.round(baseRoi * (1 + (qualifiedS.discount_percentage / 100))) : baseRoi;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 selection:bg-teal-200 selection:text-teal-900">

      {/* ── 1. Breadcrumb bar ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 pt-20 pb-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/universities" className="hover:text-blue-600 transition-colors">Universities</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-semibold">{university.name}</span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      {/* ── 2. Premium Hero ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 -mt-1">
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-b-3xl md:rounded-3xl p-8 md:p-12 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-teal-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -left-20 bottom-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-teal-900 font-black text-xl text-center leading-tight shadow-lg border-4 border-white/10 shrink-0 px-2">
              {university.name.split(' ').map(w => w[0]).slice(0, 3).join('')}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {university.is_premium && (
                  <span className="bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
                    Premium Partner
                  </span>
                )}
                {course?.badge_label && (
                  <span className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    {course.badge_label}
                  </span>
                )}
                {qualifiedS && (
                   <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                     <Sparkles className="w-3 h-3"/> Scholarship Enabled
                   </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{university.name}</h1>

              {university.courses.length > 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {university.courses.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCourse(c)}
                      className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition-all ${
                        selectedCourse?.id === c.id
                          ? 'bg-white text-teal-900 border-white'
                          : 'border-white/20 text-slate-300 hover:border-white/50'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              {course && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {course.approvals.map(a => (
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
          
          {qualifiedS && (
            <ScholarshipBadge 
              name={qualifiedS.name} 
              amountSaved={savings} 
              discountPercentage={qualifiedS.discount_percentage} 
              criteria={qualifiedS.eligibility_criteria} 
            />
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            {[
              { icon: <Clock className="w-5 h-5 text-blue-600" />, label: 'Duration', value: `${Math.round((course?.duration_months ?? 24) / 12)} Years`, bg: 'bg-slate-50', border: 'border-slate-100' },
              { icon: <IndianRupee className="w-5 h-5 text-blue-600" />, label: 'Total Fee', value: formatINR(finalFee), bg: qualifiedS ? 'bg-emerald-50' : 'bg-slate-50', border: qualifiedS ? 'border-emerald-100' : 'border-slate-100', valueClass: qualifiedS ? 'text-emerald-700 font-black' : '' },
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

          {avgCtc > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-slate-900">True ROI Engine™</h2>
                    {qualifiedS && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1"><Sparkles className="w-3 h-3"/> Scholarship Adjusted</span>}
                    {!qualifiedS && <span className="bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Live Calc</span>}
                  </div>
                  <p className="text-sm text-slate-500">Based on avg. salary of {formatINR(monthly)}/month</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Break-Even</div>
                  <div className="text-3xl font-black text-teal-600">{breakEvenMonth} <span className="text-base font-semibold">months</span></div>
                </div>
              </div>

              <div className="w-full h-[300px] -ml-4 relative z-10">
                <ROIChart chartData={chartData} breakEvenMonth={breakEvenMonth} />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 relative z-10">
                {[
                  { label: 'Year 1 Earnings', value: formatINR(avgCtc) },
                  { label: 'Year 3 Total', value: formatINR(avgCtc * 3) },
                  { label: 'Net Profit (3yr)', value: formatINR(avgCtc * 3 - finalFee) },
                ].map(s => (
                  <div key={s.label} className="bg-teal-50 rounded-xl p-4 border border-teal-100 text-center">
                    <div className="text-xs font-bold text-teal-600/80 uppercase tracking-wider mb-1">{s.label}</div>
                    <div className="font-bold text-teal-900">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {course && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-600" /> Regulatory Approvals</h2>
              <div className="flex flex-wrap gap-3">
                {course.approvals.map(a => (
                  <div key={a} className="flex items-center gap-2 px-5 py-3 bg-green-50 border border-green-100 rounded-xl text-sm font-bold text-green-800">
                    <CheckCircle2 className="w-4 h-4 text-green-600" /> {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" /> Top Hiring Partners</h2>
            <div className="flex flex-wrap gap-3">
              {PLACEMENT_PARTNERS.map(company => (
                <div key={company} className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600">
                  {company}
                </div>
              ))}
            </div>
          </div>

          {course?.has_zero_cost_emi && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0"><IndianRupee className="w-6 h-6 text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Zero-Cost EMI Available</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">Pay {formatINR(Math.round(finalFee / (course.duration_months)))} per month with 0% interest.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-6">
            {applySuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
                <h3 className="text-xl font-bold text-slate-900">You&apos;re on the list!</h3>
                <p className="text-slate-500 text-sm">Our counselor will call you shortly.</p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900">Start Application</h3>
                  <p className="text-sm text-slate-500">Zero application fees.</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 space-y-2">
                  {['Free Expert Counseling', 'Scholarship Assessment', 'EMI Pre-approval'].map(b => (
                    <div key={b} className="flex items-center gap-3 text-sm font-semibold text-blue-800"><Check className="w-4 h-4 text-blue-600" /> {b}</div>
                  ))}
                </div>
                <form onSubmit={handleApply} className="space-y-4">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none"
                  />
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl">Get Call Back</button>
                </form>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Final Fee</span>
                    <span className="font-bold text-slate-900">{formatINR(finalFee)}</span>
                  </div>
                  {qualifiedS && (
                    <div className="flex justify-between text-xs text-emerald-600 font-bold">
                       <span>Scholarship Saving</span>
                       <span>-{formatINR(savings)}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
