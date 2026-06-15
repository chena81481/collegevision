"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Search, ShieldCheck, CheckCircle2, Lock, ArrowRight, Star, 
  GraduationCap, Info, Menu, X, Wallet, Target, Landmark, 
  ArrowDown, ChevronLeft, ChevronRight, Heart, Sparkles, MessageCircle,
  TrendingUp, Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import AuthModal from '@/components/features/AuthModal';
import type { CourseMatch, MatchApiResponse, ParsedQuery } from '@/lib/types';
import MatchCard from '@/components/features/MatchCard';
import HeroSearch from '@/components/features/HeroSearch';
import DynamicMatchSidebar from '@/components/features/DynamicMatchSidebar';
import RealDataMatches from '@/components/features/RealDataMatches';
import TopTrustRibbon from '@/components/layout/TopTrustRibbon';
import Navbar from '@/components/layout/Navbar';
import PartnerLogos from '@/components/features/PartnerLogos';
import FunnelBreadcrumbs from '@/components/features/FunnelBreadcrumbs';
import ComparisonBar from '@/components/features/ComparisonBar';
import { LeadCaptureModal } from '@/components/features/LeadCaptureModal';
import dynamic from 'next/dynamic';
import { usePostHog } from 'posthog-js/react';

const ROIChart = dynamic(() => import('@/components/ui/roi-chart'), {
  ssr: false,
  loading: () => <div className="h-40 w-full bg-slate-50 animate-pulse rounded-2xl" />
});

// Default cards shown before any AI search is performed
const DEFAULT_COURSES: CourseMatch[] = [
  {
    id: 'c1', universityName: 'Symbiosis SCDL', universitySlug: 'symbiosis-scdl',
    logoUrl: null, gradientStart: 'from-teal-50', gradientEnd: 'to-white',
    courseName: 'Online MBA', degreeLevel: 'Masters', durationMonths: 24,
    totalFeeInr: 150_000, avgCtcInr: 650_000, hasZeroCostEmi: true,
    approvals: ['UGC-DEB', 'AICTE'], badgeLabel: 'Top ROI',
    roi: 1200, matchScore: 0, category: 'online-mba',
    confidenceScore: 100,
    matchReasons: ['Fits a mid-budget MBA search.', 'Strong ROI profile for working professionals.', 'EMI support lowers entry friction.'],
    cautionFlags: ['Brand pull is moderate versus premium MBA alternatives.'],
    monthlyEmiEstimate: 6250,
    recommendedFor: 'ROI-focused MBA upskillers',
    decisionSummary: 'Symbiosis SCDL offers one of the cleaner ROI-led MBA paths for students prioritizing affordability and flexible payments.',
  },
  {
    id: 'c2', universityName: 'Amity Online', universitySlug: 'amity-online',
    logoUrl: null, gradientStart: 'from-orange-50', gradientEnd: 'to-white',
    courseName: 'Online MBA Finance', degreeLevel: 'Masters', durationMonths: 24,
    totalFeeInr: 175_000, avgCtcInr: 850_000, hasZeroCostEmi: true,
    approvals: ['UGC', 'NAAC A+'], badgeLabel: 'High Placement',
    roi: 1357, matchScore: 0, category: 'online-mba',
    confidenceScore: 100,
    matchReasons: ['Strong salary upside relative to fee.', 'Good fit for finance and management tracks.', 'EMI support keeps cash flow manageable.'],
    cautionFlags: ['Total fee is higher than strict budget-first options.'],
    monthlyEmiEstimate: 7292,
    recommendedFor: 'Career accelerators targeting stronger placements',
    decisionSummary: 'Amity Online balances brand familiarity, salary upside, and financing flexibility for students who can stretch slightly for better outcomes.',
  },
  {
    id: 'c3', universityName: 'IIT Patna', universitySlug: 'iit-patna',
    logoUrl: null, gradientStart: 'from-purple-50', gradientEnd: 'to-white',
    courseName: 'Online B.Sc Data Science', degreeLevel: 'Bachelors', durationMonths: 36,
    totalFeeInr: 230_000, avgCtcInr: 1_050_000, hasZeroCostEmi: false,
    approvals: ['UGC', 'Institute of Excellence'], badgeLabel: 'Premium Data',
    roi: 1270, matchScore: 0, category: 'online-degrees',
    confidenceScore: 100,
    matchReasons: ['Excellent upside for data-oriented careers.', 'Premium signaling can help outcome quality.', 'Strong salary potential versus general degrees.'],
    cautionFlags: ['No zero-cost EMI indicator surfaced.', 'Fee is on the premium side for budget-first applicants.'],
    monthlyEmiEstimate: null,
    recommendedFor: 'Students optimizing for data science upside',
    decisionSummary: 'IIT Patna is the premium upside play here, best when long-term salary growth matters more than near-term affordability.',
  },
];

export default function CollegeVision() {
  const [mockupPage, setMockupPage] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matchResults, setMatchResults] = useState<CourseMatch[] | null>(null);
  const [parsedFilters, setParsedFilters] = useState<ParsedQuery | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const router = useRouter();
  const supabase = createClient();
  const getJourneySessionId = () => {
    const existing = localStorage.getItem('college_vision_journey_id');
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem('college_vision_journey_id', created);
    return created;
  };

  // Save to localStorage
  useEffect(() => {
    const state = {
      searchQuery,
      matchResults,
      currentStep,
      selectedForComparison: Array.from(selectedForComparison),
      parsedFilters
    };
    localStorage.setItem('college_vision_session', JSON.stringify(state));
  }, [searchQuery, matchResults, currentStep, selectedForComparison, parsedFilters]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const posthog = usePostHog();

  const triggerSearch = async (queryToUse: string) => {
    if (!queryToUse.trim()) return;

    localStorage.removeItem('college_vision_lead_completed');
    
    // Track Funnel Start
    posthog.capture('AI_Match_Started', {
      query: queryToUse,
      is_logged_in: !!user
    });

    setIsLoading(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToUse, sessionId: getJourneySessionId() }),
      });
      const data = await res.json();

      if (data.success && data.matches?.length > 0) {
        setMatchResults(data.matches);
        setCurrentStep(1); // Advance to Matches
        
        // Track Results Performance
        posthog.capture('Match_Results_Viewed', {
          results_count: data.matches.length,
          top_match_university: data.matches[0]?.universityName,
          top_match_score: data.matches[0]?.matchScore,
          max_budget_parsed: data.parsedIntent?.maxBudgetINR
        });

        setParsedFilters({
          maxBudgetInr: data.parsedIntent?.maxBudgetINR ?? null,
          degreeKeyword: data.parsedIntent?.degreeType ?? null,
          requiresEmi: data.parsedIntent?.needsEMI ?? false,
          careerGoal: data.parsedIntent?.careerGoal ?? null,
          requiredApprovals: data.parsedIntent?.requiredApproval
            ? [data.parsedIntent.requiredApproval]
            : [],
        });
        setTimeout(() => {
          document.getElementById('colleges')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (data.success && data.source === "gemini_unavailable") {
        setMatchResults([]);
        alert(data.message || "Gemini search is unavailable right now. Please check the Gemini API key in production.");
      } else {
        alert(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Failed to match:', err);
      alert('Could not reach the AI counselor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerSearch(searchQuery);
  };

  // Handle scroll for sticky navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [savedCourseIds, setSavedCourseIds] = useState<Set<string>>(new Set());

  const handleSaveCourse = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Please sign in to save courses!");
        router.push("/login");
        return;
      }

      const { error: saveError } = await supabase
        .from('saved_matches')
        .insert({ user_id: user.id, course_id: courseId });

      if (saveError) {
        if (saveError.code === '23505') { // Unique violation
          alert("Course already saved!");
        } else {
          throw saveError;
        }
      } else {
        setSavedCourseIds(prev => new Set(prev).add(courseId));
        alert("Course saved to your dashboard!");
      }
    } catch (err: any) {
      console.error("Error saving course:", err);
      alert("Failed to save course. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden scroll-smooth transition-opacity duration-500">
      <div className="fixed top-0 w-full z-[100]">
        <Navbar />
      </div>

      <LeadCaptureModal
        autoOpen
        onSubmitted={() => {
          setSearchQuery('');
          setMatchResults(null);
          setParsedFilters(null);
          setSelectedForComparison(new Set());
          setCurrentStep(0);
        }}
      />
      
      <div className="pt-16 lg:pt-20">
        <FunnelBreadcrumbs currentStep={currentStep} />
      </div>
      

      {/* 1. HERO SECTION (Redesigned with beautiful glass card UI and clear value-focused copy) */}
      <section className="max-w-7xl mx-auto px-6 pt-16 lg:pt-28 pb-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-gradient-to-r from-blue-50/10 via-transparent to-blue-50/10 blur-3xl -z-10 pointer-events-none opacity-40" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/20 via-white to-white -z-20 pointer-events-none"></div>

        {/* Left Side: Headline, Subheading & CTAs */}
        <div className="flex-1 w-full space-y-8 z-10 text-center lg:text-left">
          <div className="space-y-6">
            <h1 className="text-h1 font-black tracking-tight text-slate-900 leading-[1.08] max-w-2xl mx-auto lg:mx-0">
              Find the Best <br className="hidden sm:block" />
              Online Degree <br />
              <span className="text-blue-600">in 2 Minutes</span>
            </h1>
            <p className="text-body text-slate-600 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Compare fees, ROI, placements, approvals and EMI options across 100+ universities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button 
              onClick={() => {
                const el = document.getElementById('search-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all active:scale-95 text-center cursor-pointer"
            >
              Find My Match
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('colleges');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto border-2 border-slate-900 hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all active:scale-95 text-center cursor-pointer"
            >
              Compare Universities
            </button>
          </div>
        </div>

        {/* Right Side: Premium Glass Card Mockup */}
        <div className="w-full max-w-md lg:max-w-none flex-1 flex justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/30 to-emerald-100/20 rounded-[3rem] -rotate-3 scale-105 -z-10" />
          
          <div className="w-full max-w-sm bg-white/70 backdrop-blur-md border border-white/60 shadow-2xl rounded-[2.5rem] p-6 relative overflow-hidden">
            {/* Glowing backdrop elements inside the mockup */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-4">
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Match Engine v2.4</p>
                  <h3 className="text-sm font-black text-slate-900">Your Fit Rankings</h3>
                </div>
                <div className="bg-emerald-500/10 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 94% Top Match
                </div>
              </div>

              {/* University Match 1 */}
              <div className="bg-white/95 border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center font-black text-orange-600 text-xs shrink-0">
                    AMITY
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xs">Amity Online</h4>
                    <p className="text-[10px] text-slate-500 font-bold">Online MBA • UGC-DEB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">94% Match</p>
                    <p className="text-[9px] text-emerald-600 font-black uppercase">Top ROI</p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              {/* University Match 2 */}
              <div className="bg-white/80 border border-slate-100/50 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center font-black text-blue-600 text-xs shrink-0">
                    JAIN
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xs">Jain University</h4>
                    <p className="text-[10px] text-slate-500 font-bold">Online MBA • NAAC A+</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">91% Match</p>
                    <p className="text-[9px] text-blue-600 font-black uppercase">0% EMI</p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                </div>
              </div>

              {/* University Match 3 */}
              <div className="bg-white/60 border border-slate-100/30 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center font-black text-red-600 text-xs shrink-0">
                    LPU
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xs">LPU Online</h4>
                    <p className="text-[10px] text-slate-500 font-bold">Online MBA • AICTE</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">89% Match</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase">Budget-safe</p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                </div>
              </div>

              {/* Mini analytics overlay chart mockup */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Salary Multiplier</p>
                    <p className="text-xs font-black">1.8L Fee → <span className="text-emerald-400">12.5x ROI</span></p>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-8 shrink-0">
                  <div className="w-1 h-3 bg-white/20 rounded-full" />
                  <div className="w-1 h-5 bg-white/40 rounded-full" />
                  <div className="w-1.5 h-7 bg-emerald-400 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PARTNERS LOGO STRIP & SOCIAL PROOF NUMBERS */}
      <section className="bg-slate-50/50 py-12 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 text-center mb-6">Trusted University Partners</p>
          <PartnerLogos />
          
          {/* Social Proof Stats Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-center">
              <p className="text-3xl font-black text-slate-900">52,000+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">Students Guided</p>
            </div>
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-center">
              <p className="text-3xl font-black text-slate-900">100+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">Universities</p>
            </div>
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-center">
              <p className="text-3xl font-black text-slate-900">₹12 Cr+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">Scholarships Tracked</p>
            </div>
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-center">
              <p className="text-3xl font-black text-slate-900">4.8 Rating</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">Verified Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AI SEARCH SECTION (Relocated below Hero/Logos for better UX conversion) */}
      <section id="search-section" className="bg-white section-spacing scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-h2 font-black text-slate-900 tracking-tight">
              Tell the AI counselor what you want
            </h2>
            <p className="text-body text-slate-600 font-medium mt-3">
              Type your degree level, target budget, and EMI preferences below to see immediate verified options.
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            <HeroSearch 
              setQuery={setSearchQuery}
              onSearch={handleSearch}
              parsedIntent={parsedFilters?.careerGoal || parsedFilters?.degreeKeyword}
            />
            
            {/* Visual Data Flow Beam */}
            <div className="hidden lg:block absolute right-[-40px] top-1/2 -translate-y-1/2 w-20 h-[2px] overflow-hidden">
              <motion.div 
                animate={{ 
                  x: searchQuery.length > 3 ? ["-100%", "100%"] : "0%",
                  opacity: searchQuery.length > 3 ? [0, 1, 0] : 0
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. POPULAR RESEARCH PATHS */}
      <section className="bg-slate-50/50 py-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-8">
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600 mb-3">Popular Research Paths</p>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Start from the page that matches your research intent.</h2>
            </div>
            <Link href="/universities" className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700">
              Open university directory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              {
                href: "/universities",
                title: "University Directory",
                body: "Browse verified university profile pages.",
              },
              {
                href: "/online-mba",
                title: "Online MBA Comparison",
                body: "Open high-intent program category pages.",
              },
              {
                href: "/online-mca",
                title: "Online MCA Programs",
                body: "Compare technical programs with fee context.",
              },
              {
                href: "/explore",
                title: "Explore More Matches",
                body: "Go beyond one category or budget view.",
              },
              {
                href: "/blog",
                title: "Career Guides",
                body: "Read decision guides on approvals and ROI.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <p className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.body}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-blue-600">
                  Open page <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MATCHES — Outcome-Driven Redesign */}
      <RealDataMatches 
        results={matchResults}
        parsedFilters={parsedFilters}
        onSelect={(id) => {
          setSelectedForComparison(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        } }
        selectedIds={selectedForComparison}
      />

      {/* 6. COMPARISON BAR */}
      <ComparisonBar 
        selectedCount={selectedForComparison.size}
        onCompare={async () => {
          const comparisonSet = (matchResults ?? DEFAULT_COURSES)
            .filter((course) => selectedForComparison.has(course.id))
            .slice(0, 2);

          if (comparisonSet.length === 2) {
            await fetch('/api/student/activity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'comparison',
                sessionId: getJourneySessionId(),
                primaryUniversitySlug: comparisonSet[0].universitySlug,
                comparedUniversitySlug: comparisonSet[1].universitySlug,
                queryContext: searchQuery,
                comparedCourseIds: comparisonSet.map((course) => course.id),
                metadata: {
                  source: 'homepage_compare_modal',
                },
              }),
            });
          }

          setCurrentStep(2); // Advance to Comparison
          setIsCompareOpen(true);
        }}
        onClear={() => setSelectedForComparison(new Set())}
      />

      {/* 7. HEAD-TO-HEAD COMPARISON PREVIEW */}
      <section className="bg-slate-50 border-y border-slate-100 section-spacing">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full">Compare Head-to-Head</span>
            <h2 className="text-h2 font-black text-slate-900 mt-6 tracking-tight">No Bias. Just Real Outcomes.</h2>
            <p className="text-body text-slate-600 font-medium mt-3">See how popular universities rank side-by-side. Transparent fees, approvals, and placement multiplier.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-8 shadow-xl max-w-4xl mx-auto overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="grid grid-cols-[140px_1fr_1fr] md:grid-cols-[180px_1fr_1fr] gap-4 items-center border-b border-slate-100 pb-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Metrics</div>
                <div className="font-black text-slate-900 text-center text-sm md:text-base">Amity University</div>
                <div className="font-black text-slate-900 text-center text-sm md:text-base">Jain University</div>
              </div>

              <div className="grid grid-cols-[140px_1fr_1fr] md:grid-cols-[180px_1fr_1fr] gap-4 items-center py-4 border-b border-slate-100">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Fee</div>
                <div className="text-center text-sm font-bold text-slate-900">₹1,75,000</div>
                <div className="text-center text-sm font-bold text-slate-900">₹1,50,000</div>
              </div>

              <div className="grid grid-cols-[140px_1fr_1fr] md:grid-cols-[180px_1fr_1fr] gap-4 items-center py-4 border-b border-slate-100">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Avg Salary</div>
                <div className="text-center text-sm font-bold text-emerald-600">₹8.5 LPA</div>
                <div className="text-center text-sm font-bold text-slate-700">₹6.5 LPA</div>
              </div>

              <div className="grid grid-cols-[140px_1fr_1fr] md:grid-cols-[180px_1fr_1fr] gap-4 items-center py-4 border-b border-slate-100">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Projected ROI</div>
                <div className="text-center text-sm font-black text-blue-600">13.5x Multiplier</div>
                <div className="text-center text-sm font-black text-blue-600">12.0x Multiplier</div>
              </div>

              <div className="grid grid-cols-[140px_1fr_1fr] md:grid-cols-[180px_1fr_1fr] gap-4 items-center py-4 border-b border-slate-100">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">EMI Plan</div>
                <div className="text-center text-sm text-emerald-600 font-bold">0% Interest</div>
                <div className="text-center text-sm text-emerald-600 font-bold">0% Interest</div>
              </div>

              <div className="grid grid-cols-[140px_1fr_1fr] md:grid-cols-[180px_1fr_1fr] gap-4 items-center pt-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Approvals</div>
                <div className="text-center text-xs font-bold text-slate-500 bg-slate-50 py-1 rounded">UGC, NAAC A+</div>
                <div className="text-center text-xs font-bold text-slate-500 bg-slate-50 py-1 rounded">UGC, AICTE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. REAL TESTIMONIALS (Replacing stock snippets and screenshots) */}
      <section className="bg-white section-spacing">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full">Student Stories</span>
            <h2 className="text-h2 font-black text-slate-900 mt-6 tracking-tight">Real Success, Real Savings</h2>
            <p className="text-body text-slate-600 font-medium mt-3">Read how other professionals used CollegeVision to bypass brokers, analyze fees, and save on admission costs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2rem] flex flex-col justify-between shadow-sm">
              <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                "Found my MBA in 3 days and saved ₹85,000. The ROI comparison tool made the decision extremely simple. No spam calls or sales pressure."
              </p>
              <div className="flex items-center gap-3 mt-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                  PS
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 leading-none">Priya Sharma</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Bangalore • Amity Online MBA</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2rem] flex flex-col justify-between shadow-sm">
              <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                "UGC credentials and approval checking is a lifesaver. I wanted to verify LPU Online approvals before signing up, and CollegeVision had live government data links updated."
              </p>
              <div className="flex items-center gap-3 mt-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                  RV
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 leading-none">Rohan Verma</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Mumbai • LPU Online MBA</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2rem] flex flex-col justify-between shadow-sm">
              <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                "Compared 3 universities side-by-side on total cost and monthly EMI. The zero-cost EMI plans let me pay without high upfront admission fee stress."
              </p>
              <div className="flex items-center gap-3 mt-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                  AR
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 leading-none">Aditi Rao</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Hyderabad • Jain Online MCA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. STANDARDIZED CALL TO ACTION SECTION (No explore pro or secondary spam tags) */}
      <section className="bg-slate-900 text-white relative overflow-hidden section-spacing">
        {/* Glow decorative overlays */}
        <div className="absolute -left-40 -top-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-40 -bottom-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
          <h2 className="text-h2 font-black leading-tight tracking-tight">Ready to take the next step?</h2>
          <p className="text-body text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Get matched with the perfect online degree program in 2 minutes. Free consultation, verified ROI data, and spam-free direct admission routes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto">
            <button 
              onClick={() => {
                const el = document.getElementById('search-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/20 active:scale-95 hover:shadow-emerald-500/30 cursor-pointer"
            >
              Find My Best Degree Match
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('colleges');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto border-2 border-white/20 hover:border-white/50 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              Compare Universities
            </button>
          </div>
        </div>
      </section>
      {/* 7. CLEAN SINGLE FOOTER */}
      {/* ... [Footer remains the same] ... */}

      {/* ========================================= */}
      {/* COMPARISON MODAL (The "Engine" UI)        */}
      {/* ========================================= */}
      
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isCompareOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsCompareOpen(false)}
      ></div>

      {/* The Modal Content (Bottom Sheet on Mobile, Centered Modal on Desktop) */}
      <div className={`fixed z-[70] bottom-0 left-0 w-full md:w-[90vw] md:max-w-6xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 bg-white rounded-t-3xl md:rounded-3xl shadow-2xl transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${isCompareOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-[150%]'}`}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Head-to-Head Comparison</h3>
            <p className="text-sm text-slate-500">
              Requirement: <span className="font-medium text-slate-700">{searchQuery || 'Top Recommended Courses'}</span>
            </p>
          </div>
          <button 
            onClick={() => setIsCompareOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body: The Data Table */}
        <div className="p-0 max-h-[75vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
          <div className="p-4 md:p-8 space-y-8 pb-32">
            
            {(() => {
              const manuallySelected = (matchResults ?? DEFAULT_COURSES).filter((course) =>
                selectedForComparison.has(course.id)
              );
              const comparisonSet = (manuallySelected.length >= 2
                ? manuallySelected
                : (matchResults ?? DEFAULT_COURSES)
              ).slice(0, 3);
              const maxROI = Math.max(...comparisonSet.map(c => c.roi ?? 0));
              const minFee = Math.min(...comparisonSet.map(c => c.totalFeeInr));
              const maxCTC = Math.max(...comparisonSet.map(c => c.avgCtcInr ?? 0));

              // Internal Row Component for perfect alignment
              const ComparisonRow = ({ label, values, highlight = false, isLocked = false }: any) => (
                <div className={`grid grid-cols-[100px_1fr_1fr] gap-3 items-center py-4 border-b border-slate-100 last:border-0 ${highlight ? 'bg-blue-50/30 -mx-4 px-4 rounded-xl' : ''}`}>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
                  {values.map((v: any, i: number) => (
                    <div key={i} className={`text-center transition-all duration-700 ${isLocked ? 'blur-md select-none opacity-50' : ''}`}>
                      {v}
                    </div>
                  ))}
                </div>
              );

              return (
                <div className="space-y-8">
                  {/* STEP 1: Side-by-side Header Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {comparisonSet.slice(0, 2).map((course, idx) => {
                      const isWinner = course.roi === maxROI && maxROI > 0;
                      return (
                        <div key={course.id} className={`relative p-5 rounded-3xl bg-white transition-all duration-500 shadow-sm border ${isWinner ? 'border-2 border-blue-500 shadow-blue-100' : 'border-slate-100'}`}>
                          {isWinner && (
                            <span className="absolute -top-3 left-4 bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg flex items-center gap-1 z-10">
                              🔥 Best ROI Match
                            </span>
                          )}
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{idx === 0 ? 'Option A' : 'Option B'}</div>
                          <div className="font-black text-slate-900 leading-tight line-clamp-2 min-h-[2.5rem] tracking-tight">{course.universityName}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* PRO-LEVEL UPGRADE: AI Insight */}
                  {comparisonSet.length >= 2 && (
                    <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-100 flex items-center gap-4 border border-blue-400">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-bold leading-snug">
                         🔥 {comparisonSet[0].roi! > comparisonSet[1].roi! ? comparisonSet[0].universityName : comparisonSet[1].universityName} provides a 
                         <span className="text-yellow-300 mx-1">significant financial edge</span> 
                         with better placement authority.
                      </p>
                    </div>
                  )}

                  {/* STEP 2: Structured Data Rows */}
                  <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                    <ComparisonRow 
                      label="Total Fee" 
                      values={comparisonSet.slice(0, 2).map(c => (
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-slate-900 tracking-tight">₹{(c.totalFeeInr/100000).toFixed(1)}L</span>
                          {c.totalFeeInr === minFee && <span className="text-[8px] font-black text-emerald-600 uppercase">Saving Pocket</span>}
                        </div>
                      ))} 
                    />

                    <ComparisonRow 
                      label="Avg. CTC" 
                      values={comparisonSet.slice(0, 2).map(c => (
                        <div className="flex flex-col">
                          <span className={`text-lg font-black tracking-tight ${c.avgCtcInr === maxCTC ? 'text-emerald-600' : 'text-slate-900'}`}>
                            ₹{(c.avgCtcInr!/100000).toFixed(1)}L
                          </span>
                          <span className="text-[8px] font-black text-slate-400 uppercase">Historical</span>
                        </div>
                      ))} 
                    />

                    <div className="relative group/roi">
                      <ComparisonRow 
                        label="True ROI" 
                        highlight={true}
                        isLocked={!user}
                        values={comparisonSet.slice(0, 2).map(c => (
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-blue-700 tracking-tight">{c.roi ? (c.roi/100).toFixed(1) : '0'}x</span>
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Multiplier</span>
                          </div>
                        ))} 
                      />
                      
                      {!user && (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-50/10 backdrop-blur-[2px] rounded-xl z-20 cursor-pointer" onClick={() => setIsAuthModalOpen(true)}>
                           <div className="bg-white px-5 py-2.5 rounded-full shadow-2xl border border-blue-100 flex items-center gap-2 transform transition-all hover:scale-105 active:scale-95">
                              <Lock className="w-4 h-4 text-blue-600" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Unlock ROI Data</span>
                           </div>
                        </div>
                      )}
                    </div>

                    <ComparisonRow 
                      label="EMI Plan" 
                      values={comparisonSet.slice(0, 2).map(c => (
                        <div className="flex flex-col items-center gap-1">
                          {c.hasZeroCostEmi ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                              <X className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <span className={`text-[8px] font-black uppercase ${c.hasZeroCostEmi ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {c.hasZeroCostEmi ? '0% Interest' : 'Standard'}
                          </span>
                        </div>
                      ))} 
                    />

                    <ComparisonRow 
                      label="Grants" 
                      values={comparisonSet.slice(0, 2).map(c => (
                        <div className="flex flex-wrap justify-center gap-1">
                          {c.approvals.slice(0, 2).map(a => (
                            <span key={a} className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{a}</span>
                          ))}
                        </div>
                      ))} 
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* STEP 5: Sticky Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-[80] flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => {
              const manuallySelected = (matchResults ?? DEFAULT_COURSES).filter((course) =>
                selectedForComparison.has(course.id)
              );
              const comparisonSet = (manuallySelected.length >= 2
                ? manuallySelected
                : (matchResults ?? DEFAULT_COURSES)
              ).slice(0, 3);
              const top = comparisonSet[0];
              const text = `Found a UGC-Approved ${top.courseName} at ${top.universityName}. Fee: ₹${(top.totalFeeInr/100000).toFixed(1)}L. ROI is ${(top.roi!/100).toFixed(1)}x. Check the breakdown here: https://collegevision.in/universities/${top.universitySlug}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="flex-1 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 py-4 rounded-[2rem] text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" /> Share ROI Report with Parent
          </button>

          <button 
            onClick={() => {
              setIsCompareOpen(false);
              setCurrentStep(3); // Advance to Application
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-[2rem] text-sm font-black transition-all shadow-xl shadow-blue-100 uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            🔥 Get Admission Help Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
