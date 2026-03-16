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

// Default cards shown before any AI search is performed
const DEFAULT_COURSES: CourseMatch[] = [
  {
    id: 'c1', universityName: 'Symbiosis SCDL', universitySlug: 'symbiosis-scdl',
    logoUrl: null, gradientStart: 'from-teal-50', gradientEnd: 'to-white',
    courseName: 'Online MBA', degreeLevel: 'Masters', durationMonths: 24,
    totalFeeInr: 150_000, avgCtcInr: 650_000, hasZeroCostEmi: true,
    approvals: ['UGC-DEB', 'AICTE'], badgeLabel: 'Top ROI',
    roi: 1200, matchScore: 0,
  },
  {
    id: 'c2', universityName: 'Amity Online', universitySlug: 'amity-online',
    logoUrl: null, gradientStart: 'from-orange-50', gradientEnd: 'to-white',
    courseName: 'Online MBA Finance', degreeLevel: 'Masters', durationMonths: 24,
    totalFeeInr: 175_000, avgCtcInr: 850_000, hasZeroCostEmi: true,
    approvals: ['UGC', 'NAAC A+'], badgeLabel: 'High Placement',
    roi: 1357, matchScore: 0,
  },
  {
    id: 'c3', universityName: 'IIT Patna', universitySlug: 'iit-patna',
    logoUrl: null, gradientStart: 'from-purple-50', gradientEnd: 'to-white',
    courseName: 'Online B.Sc Data Science', degreeLevel: 'Bachelors', durationMonths: 36,
    totalFeeInr: 230_000, avgCtcInr: 1_050_000, hasZeroCostEmi: false,
    approvals: ['UGC', 'Institute of Excellence'], badgeLabel: 'Premium Data',
    roi: 1270, matchScore: 0,
  },
];

export default function CollegeVision() {
  const [activeNav, setActiveNav] = useState('Features');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mockupPage, setMockupPage] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matchResults, setMatchResults] = useState<CourseMatch[] | null>(null);
  const [parsedFilters, setParsedFilters] = useState<ParsedQuery | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
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
        // Map the Gemini parsedIntent shape to our ParsedQuery UI type
        setParsedFilters({
          maxBudgetInr: data.parsedIntent?.maxBudgetINR ?? null,
          degreeKeyword: data.parsedIntent?.degreeType ?? null,
          requiresEmi: data.parsedIntent?.needsEMI ?? false,
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

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

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
      
      {/* 0. STICKY NAVBAR (With scroll shadow & hover states) */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.06)] py-1' : 'bg-white/80 backdrop-blur-sm py-2'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          
          <div className="font-bold text-xl tracking-tight text-slate-900 cursor-pointer hover:opacity-80 transition-opacity z-50 flex items-center">
            CollegeVision<span className="text-blue-600">.</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {['Features', 'Colleges', 'ROI Calculator'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={() => setActiveNav(item)}
                className={`py-4 border-b-2 transition-all duration-300 hover:text-blue-600 ${
                  activeNav === item 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500'
                }`}
              >
                {item}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium z-50">
            {/* Enhanced Sign In Hover */}
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden md:flex items-center justify-center px-4 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors duration-300"
            >
              Sign In
            </button>
            {/* Enhanced Start Free Hover (Glow) */}
            <button className="hidden md:block bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-500 shadow-md shadow-blue-600/20 hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all duration-300 transform hover:-translate-y-0.5">
              Start Free
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -mr-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden pt-24 px-6`}>
          <div className="flex flex-col gap-6 text-2xl font-semibold tracking-tight">
            {['Features', 'Colleges', 'ROI Calculator'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={() => { setActiveNav(item); setIsMobileMenuOpen(false); }}
                className="text-slate-900 hover:text-blue-600 transition-colors"
              >
                {item}
              </a>
            ))}
            <div className="h-px w-full bg-slate-100 my-4"></div>
            <a href="#signin" className="text-slate-600 hover:text-blue-600 text-lg transition-colors">Sign In</a>
            <button className="bg-blue-600 text-white w-full py-4 rounded-xl text-lg mt-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-transform">
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION (Input Border Animation & Glows) */}
      <section className="max-w-7xl mx-auto px-6 pt-32 lg:pt-40 pb-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative">
        {/* Subtle Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 via-white to-white -z-20 pointer-events-none"></div>

        <div className="flex-1 w-full space-y-8 z-10">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-[68px] font-black tracking-tight text-slate-900 leading-[1.05]">
              Find the right <br className="hidden sm:block" />
              online degree. <br />
              <span className="text-slate-400 font-medium">
                Without the <span className="text-slate-900 font-black relative inline-block">bias.<div className="absolute bottom-1 left-0 w-full h-4 bg-blue-100/80 -z-10 rounded-sm"></div></span>
              </span>
            </h1>
          </div>

          <div className="space-y-4 max-w-xl">
            {/* Interactive Search Input with growing bottom border effect */}
            <div className="relative group">
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row items-center bg-white border-2 border-slate-200 rounded-2xl sm:rounded-full p-1.5 sm:pl-5 shadow-lg shadow-slate-200/50 transition-all w-full gap-2 sm:gap-0 z-10 relative bg-clip-padding"
              >
                <div className="flex items-center w-full sm:w-auto px-4 sm:px-0 py-2 sm:py-0">
                  <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300 mr-3 sm:mr-0" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Try 'MBA under 1 Lakh with EMI'" 
                    className="w-full bg-transparent border-none outline-none sm:px-4 text-slate-900 placeholder:text-slate-400 text-base font-medium"
                  />
                </div>
                {/* Button Glow on Hover */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 disabled:opacity-70 text-white px-8 py-3.5 rounded-xl sm:rounded-full text-sm font-bold transition-all duration-300 shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.5)] transform hover:scale-[1.02] flex items-center justify-center"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Analyzing...</span>
                  ) : (
                    'AI Match Me'
                  )}
                </button>
              </form>
              {/* The growing border animation line */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[95%] h-1 bg-blue-500 rounded-b-full opacity-0 group-focus-within:opacity-100 group-focus-within:translate-y-1 transition-all duration-500 ease-out z-0"></div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pl-1 sm:pl-5">
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Takes 2 mins. Zero spam.
              </p>
              <span className="hidden sm:block text-slate-300">•</span>
              <a href="#browse" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all">
                Browse colleges instead &rarr;
              </a>
            </div>
          </div>

          <div className="pt-4 space-y-5 border-t border-slate-100/50 sm:border-none">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-slate-700 font-medium pt-4 sm:pt-0">
              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><ShieldCheck className="w-4 h-4 text-blue-600" /> UGC-DEB Approved</span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><CheckCircle2 className="w-4 h-4 text-green-600" /> 100% Transparent</span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><Lock className="w-4 h-4 text-slate-400" /> 0 Spam Calls</span>
            </div>
            
            {/* Mobile Stacked Social Proof */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-slate-600 bg-blue-50/40 inline-flex px-4 py-2.5 rounded-xl border border-blue-100/50">
              <div className="flex gap-0.5 mb-1 sm:mb-0">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span><strong className="text-slate-900">50,000+ students</strong> matched this year</span>
                <span className="hidden sm:inline text-slate-300 mx-2">•</span> 
                <span><strong className="text-slate-900">4.8/5</strong> rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: The Transformation Mockup */}
        <div className="w-full sm:w-[340px] lg:w-auto relative group mt-8 lg:mt-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 to-slate-50 rounded-[3rem] -rotate-3 scale-105 -z-10 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-100 hidden sm:block"></div>
          <div className="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-2 w-full sm:max-w-[340px] mx-auto overflow-hidden relative">
            
            <div className="bg-slate-50 px-5 pt-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] shadow-[0_0_10px_rgba(37,99,235,0.5)] animate-pulse">AI</div>
                <div className="text-xs font-medium text-slate-600">Analyzing your profile...</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 text-sm text-slate-700 shadow-sm font-medium">
                "MBA under 2L w/ EMI"
              </div>
            </div>

            <div className="bg-slate-50 p-5 h-[320px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-50 to-transparent z-10"></div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2 px-1">
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Top Match Found</div>
                  {/* Interactive Mockup Pagination */}
                  <div className="flex items-center gap-1 bg-white px-1.5 py-1 rounded-full border border-slate-200 shadow-sm">
                    <button 
                      onClick={() => setMockupPage(prev => Math.max(1, prev - 1))}
                      className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900 active:scale-90"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-600 w-6 text-center">{mockupPage}/3</span>
                    <button 
                      onClick={() => setMockupPage(prev => Math.min(3, prev + 1))}
                      className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900 active:scale-90"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group/card hover:border-blue-300 transition-all cursor-pointer transform hover:-translate-y-1 duration-300 hover:shadow-lg">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                  <div className="flex gap-3 items-center mb-3">
                    <div className="h-10 px-3 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xs tracking-wider">
                      {mockupPage === 1 ? 'MANIPAL' : mockupPage === 2 ? 'SYMBIOSIS' : 'AMITY'}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {mockupPage === 1 ? 'Manipal Online' : mockupPage === 2 ? 'Symbiosis SCDL' : 'Amity Online'}
                      </div>
                      <div className="text-[11px] text-slate-500">Online MBA</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Fee</div>
                      <div className="text-sm font-semibold">
                        {mockupPage === 1 ? '₹1,75,000' : mockupPage === 2 ? '₹1,50,000' : '₹1,80,000'} 
                        <span className="text-[10px] font-normal text-slate-400 ml-1">(EMI)</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Avg. CTC</div>
                      <div className="text-sm font-semibold text-green-600">
                        {mockupPage === 1 ? '₹8.5 LPA' : mockupPage === 2 ? '₹6.5 LPA' : '₹9.0 LPA'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Swipe Hint Animation */}
                <div className="flex flex-col items-center gap-2 mt-6 opacity-60">
                  <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 animate-pulse">
                    <ChevronLeft className="w-3 h-3"/> Swipe to see more <ChevronRight className="w-3 h-3"/>
                  </span>
                </div>
              </div>
            </div>
          </div>
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

      {/* 3. MATCHES — Dynamic from /api/match */}
      <section id="colleges" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">Matches built on real data.</h2>
              <p className="text-slate-500">{matchResults ? `${matchResults.length} courses ranked for you.` : 'Not just a list. A calculated ROI breakdown.'}</p>
            </div>
            <button
              onClick={() => setIsCompareOpen(true)}
              className="text-sm font-semibold text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 w-full md:w-auto shadow-sm"
            >
              Compare these 3 <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filter context banner */}
          {parsedFilters && (
            <div className="mb-8 flex flex-wrap items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Filtered by:</span>
              {parsedFilters.maxBudgetInr && (
                <span className="bg-white border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Budget ≤ ₹{(parsedFilters.maxBudgetInr / 100_000).toFixed(1)}L
                </span>
              )}
              {parsedFilters.degreeKeyword && (
                <span className="bg-white border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{parsedFilters.degreeKeyword}</span>
              )}
              {parsedFilters.requiresEmi && (
                <span className="bg-white border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">Zero-Cost EMI</span>
              )}
              {parsedFilters.requiredApprovals.map(a => (
                <span key={a} className="bg-white border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{a}</span>
              ))}
              <button
                onClick={() => { setMatchResults(null); setParsedFilters(null); setSearchQuery(''); }}
                className="ml-auto text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                Clear ×
              </button>
            </div>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(matchResults ?? DEFAULT_COURSES).slice(0, 3).map((course, idx) => {
              const isTop = idx === 0;
              const feeFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(course.totalFeeInr);
              const ctcFormatted = course.avgCtcInr ? `₹${(course.avgCtcInr / 100_000).toFixed(1)} LPA` : 'N/A';
              return (
                <div
                  key={course.id}
                  className={`relative bg-gradient-to-b ${course.gradientStart}/80 ${course.gradientEnd} rounded-3xl p-6 hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col h-full group
                    ${isTop ? 'border-2 border-blue-400 shadow-lg shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20' : 'border border-slate-200 hover:shadow-xl hover:border-slate-300'}
                    ${idx === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                >
                  {isTop && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-white" /> {matchResults ? 'Best Match' : 'Recommended'}
                    </div>
                  )}
                  {matchResults && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                       <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveCourse(course.id);
                        }}
                        className={`p-2 rounded-lg border transition-all ${
                          savedCourseIds.has(course.id)
                            ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20'
                            : 'bg-white/80 backdrop-blur-sm border-blue-100 text-blue-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500'
                        }`}
                        title="Save for later"
                      >
                        <Heart className={`w-4 h-4 ${savedCourseIds.has(course.id) ? 'fill-current' : ''}`} />
                      </button>
                      <div className="bg-white border border-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                        {course.matchScore}% match
                      </div>
                    </div>
                  )}
                  <div className={`flex justify-between items-start mb-8 ${isTop ? 'mt-3' : ''}`}>
                    <div className="h-12 px-4 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center font-bold text-sm tracking-widest text-slate-800 max-w-[160px] truncate">
                      {course.universityName.toUpperCase()}
                    </div>
                    {course.badgeLabel && (
                      <span className="bg-white border border-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap ml-2">
                        {course.badgeLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-1">{course.universityName}</h3>
                  <p className="text-sm text-slate-500 mb-2">{course.courseName} • {Math.round(course.durationMonths / 12)} Yrs</p>
                  {course.roi !== null && (
                    <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mb-6 w-max border ${isTop ? 'bg-green-100 text-green-800 border-green-200' : 'bg-green-50 text-green-700 border-green-100'}`}>
                      ROI: {course.roi}%
                    </div>
                  )}
                  <div className="mt-auto">
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 mb-6">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">Total Fee <Info className="w-3 h-3 text-slate-300" /></div>
                        <div className="text-base font-semibold text-slate-900">{feeFormatted}</div>
                        {course.hasZeroCostEmi && <div className="text-[10px] text-blue-500 font-semibold mt-0.5">EMI available</div>}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">Avg. CTC <Info className="w-3 h-3 text-slate-300" /></div>
                        <div className="text-base font-semibold text-green-600">{ctcFormatted}</div>
                      </div>
                    </div>
                    <Link
                      href={`/universities/${course.universitySlug}`}
                      className={`w-full font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md
                        ${isTop ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-50 text-slate-700 border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600'}`}
                    >
                      View Detailed ROI <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-14 text-center">
            <a href="#all" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-blue-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all w-full sm:w-auto">
              See all {matchResults ? matchResults.length : 15} matches <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. 3-STEP JOURNEY (Responsive Stacking & Arrow rotation) */}
      <section className="bg-slate-50 py-24 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-3 tracking-tight">3-step journey to your perfect university.</h2>
            <p className="text-lg text-slate-500">No agents. Just technology.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex-1 text-center space-y-4 group">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-blue-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
                <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 z-10">
                  <Search className="w-8 h-8 text-blue-600" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold border-4 border-slate-50">1</div>
                </div>
              </div>
              <h3 className="font-bold text-lg text-slate-900">Share your goals</h3>
              <p className="text-sm text-slate-500 max-w-[200px] mx-auto">Tell us your budget, time, and career aspirations.</p>
            </div>
            
            <ArrowRight className="hidden md:block w-8 h-8 text-slate-300" />
            <ArrowDown className="md:hidden w-8 h-8 text-slate-300 my-4" />
            
            {/* Step 2 */}
            <div className="flex-1 text-center space-y-4 group">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-blue-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
                <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 z-10">
                  <Star className="w-8 h-8 text-blue-600" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold border-4 border-slate-50">2</div>
                </div>
              </div>
              <h3 className="font-bold text-lg text-slate-900">See AI matches</h3>
              <p className="text-sm text-slate-500 max-w-[200px] mx-auto">Get a clear, unbiased list of universities that fit.</p>
            </div>

            <ArrowRight className="hidden md:block w-8 h-8 text-slate-300" />
            <ArrowDown className="md:hidden w-8 h-8 text-slate-300 my-4" />

            {/* Step 3 */}
            <div className="flex-1 text-center space-y-4 group">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-blue-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
                <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 z-10">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold border-4 border-slate-50">3</div>
                </div>
              </div>
              <h3 className="font-bold text-lg text-slate-900">Apply instantly</h3>
              <p className="text-sm text-slate-500 max-w-[200px] mx-auto">Zero paperwork. We handle the process start to finish.</p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Start your journey
            </button>
          </div>
        </div>
      </section>

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
