"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, ShieldCheck, CheckCircle2, Lock, ArrowRight, Star, 
  GraduationCap, Info, Menu, X, Wallet, Target, Landmark, 
  ArrowDown, ChevronLeft, ChevronRight, Heart
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import AuthModal from '@/components/features/AuthModal';
import type { CourseMatch, MatchApiResponse, ParsedQuery } from '@/lib/types';
import MatchCard from '@/components/features/MatchCard';
import HeroSearch from '@/components/features/HeroSearch';
import PrimaryMatchButton from '@/components/features/PrimaryMatchButton';
import DynamicMatchSidebar from '@/components/features/DynamicMatchSidebar';
import RealDataMatches from '@/components/features/RealDataMatches';
import TopTrustRibbon from '@/components/layout/TopTrustRibbon';
import Navbar from '@/components/layout/Navbar';
import ContextualTrustBadges from '@/components/features/ContextualTrustBadges';
import PartnerLogos from '@/components/features/PartnerLogos';
import ExperienceJourney from '@/components/features/ExperienceJourney';
import FunnelBreadcrumbs from '@/components/features/FunnelBreadcrumbs';
import ComparisonBar from '@/components/features/ComparisonBar';
import PersistenceToast from '@/components/ui/PersistenceToast';
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
  },
  {
    id: 'c2', universityName: 'Amity Online', universitySlug: 'amity-online',
    logoUrl: null, gradientStart: 'from-orange-50', gradientEnd: 'to-white',
    courseName: 'Online MBA Finance', degreeLevel: 'Masters', durationMonths: 24,
    totalFeeInr: 175_000, avgCtcInr: 850_000, hasZeroCostEmi: true,
    approvals: ['UGC', 'NAAC A+'], badgeLabel: 'High Placement',
    roi: 1357, matchScore: 0, category: 'online-mba',
    confidenceScore: 100,
  },
  {
    id: 'c3', universityName: 'IIT Patna', universitySlug: 'iit-patna',
    logoUrl: null, gradientStart: 'from-purple-50', gradientEnd: 'to-white',
    courseName: 'Online B.Sc Data Science', degreeLevel: 'Bachelors', durationMonths: 36,
    totalFeeInr: 230_000, avgCtcInr: 1_050_000, hasZeroCostEmi: false,
    approvals: ['UGC', 'Institute of Excellence'], badgeLabel: 'Premium Data',
    roi: 1270, matchScore: 0, category: 'online-degrees',
    confidenceScore: 100,
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
  const [showPersistenceToast, setShowPersistenceToast] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Persistence: Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('college_vision_session');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.searchQuery) {
        setShowPersistenceToast(true);
      }
    }
  }, []);

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

  const handleResume = () => {
    const saved = localStorage.getItem('college_vision_session');
    if (saved) {
      const data = JSON.parse(saved);
      setSearchQuery(data.searchQuery || '');
      setMatchResults(data.matchResults || null);
      setCurrentStep(data.currentStep || 0);
      setSelectedForComparison(new Set(data.selectedForComparison || []));
      setParsedFilters(data.parsedFilters || null);
    }
    setShowPersistenceToast(false);
  };

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Track Funnel Start
    posthog.capture('AI_Match_Started', {
      query: searchQuery,
      is_logged_in: !!user
    });

    setIsLoading(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();

      if (data.success && data.matches) {
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
          careerGoal: data.parsedIntent?.careerGoal ?? null, // Added careerGoal
          requiredApprovals: data.parsedIntent?.requiredApproval
            ? [data.parsedIntent.requiredApproval]
            : [],
        });
        setTimeout(() => {
          document.getElementById('colleges')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
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
        <TopTrustRibbon />
        <Navbar />
      </div>
      
      <div className="pt-24 lg:pt-32">
        <FunnelBreadcrumbs currentStep={currentStep} />
      </div>
      

      {/* 1. HERO SECTION (Input Border Animation & Glows) */}
      <section className="max-w-7xl mx-auto px-6 pt-16 lg:pt-24 pb-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative">
        {/* Subtle Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 via-white to-white -z-20 pointer-events-none"></div>

        <div className="flex-1 w-full space-y-8 z-10">
          <div className="space-y-6">
            <div className="flex flex-col items-center mb-6 lg:items-start text-center">
              {/* The Rating Chip */}
              <div className="mb-4 flex items-center gap-2 bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 shadow-sm w-fit">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">4.8/5 (50K+ Users)</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-[68px] font-black tracking-tight text-slate-900 leading-[1.05] text-center lg:text-left">
                Find the right <br className="hidden sm:block" />
                online degree. <br />
                <span className="text-slate-400 font-medium">
                  Without the <span className="text-slate-900 font-black relative inline-block">bias.<div className="absolute bottom-1 left-0 w-full h-4 bg-blue-100/80 -z-10 rounded-sm"></div></span>
                </span>
              </h1>
            </div>
          </div>

          <div className="space-y-4 max-w-xl">
            <HeroSearch 
              query={searchQuery}
              setQuery={setSearchQuery}
              onSearch={handleSearch}
              isLoading={isLoading}
              parsedIntent={parsedFilters?.careerGoal || parsedFilters?.degreeKeyword}
            />
            <PrimaryMatchButton 
              onClick={(e) => handleSearch(e as any)}
              isLoading={isLoading}
            />
          </div>
            
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pl-1 sm:pl-5">
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Takes 2 mins. AI Powered.
            </p>
          </div>

          <ContextualTrustBadges />
          <PartnerLogos />
        </div>

        {/* Right: The Dynamic Results Sidebar */}
        <div className="w-full sm:w-[400px] lg:w-auto flex-1 relative group mt-8 lg:mt-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 to-slate-50 rounded-[4rem] -rotate-3 scale-105 -z-10 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-100 hidden lg:block"></div>
          <DynamicMatchSidebar 
            isSearching={isLoading}
            results={matchResults}
          />
        </div>
      </section>

      {/* 2. THE BRAINS (Staggered hover effects, colored borders) */}
      <section id="features" className="bg-slate-50 pt-20 pb-16 border-y border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-2">The Brains</h2>
            <p className="text-2xl font-semibold text-slate-900">Tell the AI what matters to you.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group bg-white border border-slate-200 border-l-4 border-l-teal-500 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-500/10 hover:bg-teal-50/30 transition-all duration-300 p-8 rounded-2xl cursor-pointer hover:-translate-y-2">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                <Wallet className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">What's your budget?</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Filter by total fees and highlight universities offering zero-cost EMI.</p>
            </div>
            
            <div className="group bg-white border border-slate-200 border-l-4 border-l-orange-500 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 hover:bg-orange-50/30 transition-all duration-300 p-8 rounded-2xl cursor-pointer hover:-translate-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">What's your dream role?</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Match with programs that have historical placement data in your target industry.</p>
            </div>
            
            <div className="group bg-white border border-slate-200 border-l-4 border-l-purple-500 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 hover:bg-purple-50/30 transition-all duration-300 p-8 rounded-2xl cursor-pointer hover:-translate-y-2 md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                <Landmark className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">What approvals matter?</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Strictly filter by UGC-DEB, AICTE, and NAAC A+ grades for safety.</p>
            </div>
          </div>

          <div className="flex justify-center mt-16 absolute -bottom-5 left-1/2 -translate-x-1/2 z-10">
            <a href="#colleges" className="bg-white px-6 py-2.5 rounded-full border border-slate-200 shadow-md text-sm text-blue-600 font-semibold flex items-center gap-2 hover:bg-slate-50 hover:text-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              See matches below <ArrowDown className="w-4 h-4 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. MATCHES — Outcome-Driven Redesign */}
      <RealDataMatches 
        results={matchResults || DEFAULT_COURSES}
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

      <ComparisonBar 
        selectedCount={selectedForComparison.size}
        onCompare={() => {
          setCurrentStep(2); // Advance to Comparison
          setIsCompareOpen(true);
        }}
        onClear={() => setSelectedForComparison(new Set())}
      />

      <PersistenceToast 
        isVisible={showPersistenceToast}
        onResume={handleResume}
        onDismiss={() => setShowPersistenceToast(false)}
      />

      <ExperienceJourney />

      {/* 5. HYPER-SPECIFIC TESTIMONIALS (Card styling & Stars added) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-slate-900 mb-16 tracking-tight">Verified decisions.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 border-l-4 border-l-blue-400 hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-slate-700 leading-relaxed mb-8 italic">"Saved ₹3 Lakhs by skipping 2 over-priced universities. The AI caught that the university I wanted didn't have NAAC A+ approval."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">R</div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Rahul M.</div>
                  <div className="text-xs text-slate-500 font-medium">Online MCA • Feb 2026 Batch</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 border-l-4 border-l-emerald-400 hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-slate-700 leading-relaxed mb-8 italic">"Found out about ROI break-even in 4 years versus the 8 years I thought. I just told it my EMI limit and it filtered out all the noise."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">S</div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Sneha K.</div>
                  <div className="text-xs text-slate-500 font-medium">Online BBA • Jan 2026 Batch</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 border-l-4 border-l-purple-400 hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-slate-700 leading-relaxed mb-8 italic">"Got 3 backup options within my ₹1.5L budget in exactly 10 minutes. Applied directly through the dashboard without talking to an agent."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">A</div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Arjun P.</div>
                  <div className="text-xs text-slate-500 font-medium">Online M.Com • Mar 2026 Batch</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SOFTENED PRO SECTION */}
      <section id="roi-calculator" className="py-12 bg-white pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden relative">
            <div className="absolute -right-20 -top-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="space-y-4 flex-1 z-10 text-center md:text-left">
              <div className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-2">Want deeper insights?</div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Advanced ROI analysis for parents & professionals.</h2>
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-slate-300 mt-6 justify-center md:justify-start">
                <span className="flex items-center justify-center md:justify-start gap-2 bg-white/10 px-4 py-2 rounded-lg"><CheckCircle2 className="w-4 h-4 text-green-400"/> Break-even graphs</span>
                <span className="flex items-center justify-center md:justify-start gap-2 bg-white/10 px-4 py-2 rounded-lg"><CheckCircle2 className="w-4 h-4 text-green-400"/> Historical placements</span>
              </div>
            </div>
            <button className="whitespace-nowrap bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-sm hover:bg-blue-50 transition-colors z-10 w-full md:w-auto hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Explore PRO Free
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
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="min-w-[800px] md:min-w-0"> {/* Forces scroll on mobile */}
            
            {/* Logic for Comparison */}
            {(() => {
              const comparisonSet = (matchResults ?? DEFAULT_COURSES).slice(0, 3);
              const maxROI = Math.max(...comparisonSet.map(c => c.roi ?? 0));
              const minFee = Math.min(...comparisonSet.map(c => c.totalFeeInr));
              const maxCTC = Math.max(...comparisonSet.map(c => c.avgCtcInr ?? 0));

              return (
                <>
                  {/* Table Headers (Universities) */}
                  <div className="grid grid-cols-4 gap-4 mb-6 sticky top-0 bg-white pt-2 pb-4 z-10 border-b border-slate-100">
                    <div className="font-semibold text-slate-400 text-sm uppercase tracking-wider flex items-end pb-2">Metrics</div>
                    
                    {comparisonSet.map((course, idx) => {
                      const isWinner = course.roi === maxROI && maxROI > 0;
                      return (
                        <div key={course.id} className={`${isWinner ? 'bg-blue-50/50 border-2 border-blue-500' : 'bg-slate-50 border border-slate-200'} p-4 rounded-2xl relative`}>
                          {isWinner && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Winner</div>
                          )}
                          <div className="font-bold text-lg text-slate-900 text-center truncate">{course.universityName}</div>
                        </div>
                      );
                    })}
                    
                    {/* Placeholder for less than 3 courses */}
                    {Array.from({ length: 3 - comparisonSet.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="bg-slate-50/30 p-4 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                        <span className="text-slate-300 text-sm italic">Add more to compare</span>
                      </div>
                    ))}
                  </div>

                  {/* Data Rows */}
                  <div className="space-y-2">
                    {/* Row 1: Fee */}
                    <div className="grid grid-cols-4 gap-4 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors rounded-lg px-2 items-center">
                      <div className="text-sm font-medium text-slate-500">Total Fee</div>
                      {comparisonSet.map(course => {
                        const isLowest = course.totalFeeInr === minFee;
                        return (
                          <div key={course.id} className={`text-center ${isLowest ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(course.totalFeeInr)}
                            {isLowest && <span className="text-[10px] text-green-600 ml-1 bg-green-50 px-2 py-0.5 rounded">Lowest</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Row 2: CTC */}
                    <div className="grid grid-cols-4 gap-4 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors rounded-lg px-2 items-center">
                      <div className="text-sm font-medium text-slate-500">Average CTC</div>
                      {comparisonSet.map(course => {
                        const isHighest = course.avgCtcInr === maxCTC && maxCTC > 0;
                        const ctcFormatted = course.avgCtcInr ? `₹${(course.avgCtcInr / 100_000).toFixed(1)} LPA` : 'N/A';
                        return (
                          <div key={course.id} className={`text-center ${isHighest ? 'font-bold text-green-600' : 'font-medium text-slate-700'}`}>
                            {ctcFormatted}
                            {isHighest && <span className="text-[10px] ml-1 bg-green-50 px-2 py-0.5 rounded">Highest</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Row 3: TRUE ROI */}
                    <div className="grid grid-cols-4 gap-4 py-4 border-b border-slate-50 bg-blue-50/30 rounded-lg px-2 items-center relative overflow-hidden group/roi">
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1">True ROI <Info className="w-3 h-3 text-blue-400"/></div>
                      
                      {comparisonSet.map(course => (
                        <div key={course.id} className={`text-center font-bold text-blue-600 text-lg transition-all duration-500 ${!user ? 'blur-md select-none' : ''}`}>
                          {course.roi ? `${course.roi}%` : 'N/A'}
                        </div>
                      ))}

                      {/* Locked Overlay for Unauthenticated Users */}
                      {!user && (
                        <div className="absolute inset-0 bg-blue-50/10 backdrop-blur-[2px] flex items-center justify-center z-20 cursor-pointer group-hover/roi:bg-blue-50/30 transition-all" onClick={() => setIsAuthModalOpen(true)}>
                          <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-blue-100 flex items-center gap-2 transform translate-y-1 group-hover/roi:translate-y-0 transition-transform">
                            <Lock className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-xs font-bold text-slate-900">Sign in to unlock ROI Analysis</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Row 4: EMI */}
                    <div className="grid grid-cols-4 gap-4 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors rounded-lg px-2 items-center">
                      <div className="text-sm font-medium text-slate-500">Zero Cost EMI</div>
                      {comparisonSet.map(course => (
                        <div key={course.id} className="text-center">
                          {course.hasZeroCostEmi ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto"/>
                          ) : (
                            <X className="w-5 h-5 text-slate-300 mx-auto"/>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Row 5: Approvals */}
                    <div className="grid grid-cols-4 gap-4 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors rounded-lg px-2 items-center">
                      <div className="text-sm font-medium text-slate-500">Approvals</div>
                      {comparisonSet.map(course => (
                        <div key={course.id} className="text-center text-xs font-medium text-slate-600 truncate px-1">
                          {course.approvals.join(', ')}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-between items-center">
          <button className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2">
             Share Comparison
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md">
            Download PDF Report
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
