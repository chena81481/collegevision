"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, MessageCircle, TrendingUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import type { User } from "@supabase/supabase-js";
import AuthModal from "@/components/features/AuthModal";
import ComparisonBar from "@/components/features/ComparisonBar";
import HeroSearch from "@/components/features/HeroSearch";
import PartnerLogos from "@/components/features/PartnerLogos";
import RealDataMatches from "@/components/features/RealDataMatches";
import { Footer } from "@/components/layout/Footer";
import FunnelBreadcrumbs from "@/components/features/FunnelBreadcrumbs";
import Navbar from "@/components/layout/Navbar";
import type { CourseMatch, ParsedQuery } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";

const DEFAULT_COURSES: CourseMatch[] = [
  {
    id: "c1",
    universityName: "Jain Online",
    universitySlug: "jain-online",
    logoUrl: null,
    gradientStart: "from-blue-50",
    gradientEnd: "to-white",
    courseName: "Online MBA",
    degreeLevel: "Masters",
    durationMonths: 24,
    totalFeeInr: 196000,
    avgCtcInr: 820000,
    hasZeroCostEmi: true,
    approvals: ["UGC", "NAAC A++"],
    badgeLabel: "Best Match",
    roi: 420,
    matchScore: 94,
    category: "online-mba",
    confidenceScore: 94,
    matchReasons: ["Strong NAAC grade.", "Balanced fee and placement support.", "Good fit for MBA career switchers."],
    cautionFlags: ["Review specialization availability before applying."],
    monthlyEmiEstimate: 8167,
    recommendedFor: "Career-focused MBA applicants",
    decisionSummary: "Jain Online is a strong first shortlist choice for students who want approval strength, placement support, and a healthy ROI profile.",
  },
  {
    id: "c2",
    universityName: "Amity Online",
    universitySlug: "amity-online",
    logoUrl: null,
    gradientStart: "from-emerald-50",
    gradientEnd: "to-white",
    courseName: "Online MBA",
    degreeLevel: "Masters",
    durationMonths: 24,
    totalFeeInr: 199000,
    avgCtcInr: 850000,
    hasZeroCostEmi: true,
    approvals: ["UGC", "NAAC A+"],
    badgeLabel: "Placement Support",
    roi: 410,
    matchScore: 91,
    category: "online-mba",
    confidenceScore: 91,
    matchReasons: ["Recognizable online brand.", "Good support ecosystem.", "Clear fee-to-outcome story."],
    cautionFlags: ["Fee is slightly higher than some alternatives."],
    monthlyEmiEstimate: 8292,
    recommendedFor: "Students prioritizing brand familiarity",
    decisionSummary: "Amity Online is a practical option for students who want a familiar brand, structured support, and flexible payment options.",
  },
  {
    id: "c3",
    universityName: "LPU Online",
    universitySlug: "lpu-online",
    logoUrl: null,
    gradientStart: "from-slate-50",
    gradientEnd: "to-white",
    courseName: "Online MBA",
    degreeLevel: "Masters",
    durationMonths: 24,
    totalFeeInr: 180000,
    avgCtcInr: 760000,
    hasZeroCostEmi: true,
    approvals: ["UGC", "NAAC A++"],
    badgeLabel: "Value Pick",
    roi: 390,
    matchScore: 88,
    category: "online-mba",
    confidenceScore: 88,
    matchReasons: ["Lower fee base.", "Strong accreditation profile.", "Flexible EMI support."],
    cautionFlags: ["Compare specialization depth against Jain and Amity."],
    monthlyEmiEstimate: 7500,
    recommendedFor: "Budget-aware MBA applicants",
    decisionSummary: "LPU Online works well for students who want approval strength and fee control without losing placement support.",
  },
];

const UNIVERSITY_CARDS = [
  ["Amity Online", "NAAC A+", "INR 1,99,000", "Yes", "UGC Approved"],
  ["Jain Online", "NAAC A++", "INR 1,96,000", "Yes", "UGC Approved"],
  ["LPU Online", "NAAC A++", "INR 1,80,000", "Yes", "UGC Approved"],
];

const COMPARISON_ROWS = [
  ["Fee", "INR 1.99L", "INR 1.96L", "INR 1.80L"],
  ["NAAC", "A+", "A++", "A++"],
  ["Placement", "Yes", "Yes", "Yes"],
  ["EMI", "Yes", "Yes", "Yes"],
  ["Approval", "UGC", "UGC", "UGC"],
];

const TESTIMONIALS = [
  ["PS", "Priya Sharma", "Jaipur", "Jain MBA", "chose Jain MBA and received a scholarship worth INR 25,000."],
  ["RV", "Rohan Verma", "Mumbai", "LPU MBA", "used the approval and EMI comparison before finalizing LPU Online."],
  ["AR", "Aditi Rao", "Hyderabad", "Amity MBA", "shortlisted Amity after comparing total fee, placement support, and ROI."],
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function CollegeVision() {
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matchResults, setMatchResults] = useState<CourseMatch[] | null>(null);
  const [parsedFilters, setParsedFilters] = useState<ParsedQuery | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const router = useRouter();
  const supabase = createClient();
  const posthog = usePostHog();

  const getJourneySessionId = () => {
    const existing = localStorage.getItem("college_vision_journey_id");
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem("college_vision_journey_id", created);
    return created;
  };

  useEffect(() => {
    localStorage.setItem(
      "college_vision_session",
      JSON.stringify({
        searchQuery,
        matchResults,
        currentStep,
        selectedForComparison: Array.from(selectedForComparison),
        parsedFilters,
      })
    );
  }, [searchQuery, matchResults, currentStep, selectedForComparison, parsedFilters]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const triggerSearch = async (queryToUse: string) => {
    if (!queryToUse.trim()) return;

    localStorage.removeItem("college_vision_lead_completed");
    posthog.capture("AI_Match_Started", {
      query: queryToUse,
      is_logged_in: !!user,
    });

    setIsLoading(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryToUse, sessionId: getJourneySessionId() }),
      });
      const data = await res.json();

      if (data.success && data.matches?.length > 0) {
        setMatchResults(data.matches);
        setCurrentStep(1);
        posthog.capture("Match_Results_Viewed", {
          results_count: data.matches.length,
          top_match_university: data.matches[0]?.universityName,
          top_match_score: data.matches[0]?.matchScore,
          max_budget_parsed: data.parsedIntent?.maxBudgetINR,
        });

        setParsedFilters({
          maxBudgetInr: data.parsedIntent?.maxBudgetINR ?? null,
          degreeKeyword: data.parsedIntent?.degreeType ?? null,
          requiresEmi: data.parsedIntent?.needsEMI ?? false,
          careerGoal: data.parsedIntent?.careerGoal ?? null,
          requiredApprovals: data.parsedIntent?.requiredApproval ? [data.parsedIntent.requiredApproval] : [],
        });
        setTimeout(() => scrollToSection("colleges"), 100);
      } else if (data.success && data.source === "gemini_unavailable") {
        setMatchResults([]);
        alert(data.message || "Gemini search is unavailable right now. Please check the Gemini API key in production.");
      } else {
        alert(data.error ?? "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Failed to match:", err);
      alert("Could not reach the AI counselor. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerSearch(searchQuery);
  };

  const handleCompare = async () => {
    const comparisonSet = (matchResults ?? DEFAULT_COURSES)
      .filter((course) => selectedForComparison.has(course.id))
      .slice(0, 2);

    if (comparisonSet.length === 2) {
      await fetch("/api/student/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "comparison",
          sessionId: getJourneySessionId(),
          primaryUniversitySlug: comparisonSet[0].universitySlug,
          comparedUniversitySlug: comparisonSet[1].universitySlug,
          queryContext: searchQuery,
          comparedCourseIds: comparisonSet.map((course) => course.id),
          metadata: { source: "homepage_compare_modal" },
        }),
      });
    }

    setCurrentStep(2);
    setIsCompareOpen(true);
  };

  const displayedComparison = (() => {
    const selected = (matchResults ?? DEFAULT_COURSES).filter((course) => selectedForComparison.has(course.id));
    return (selected.length >= 2 ? selected : matchResults ?? DEFAULT_COURSES).slice(0, 3);
  })();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-900 selection:bg-blue-200 selection:text-blue-900">
      <div className="fixed top-0 z-[100] w-full">
        <Navbar />
      </div>

      <div className="hidden pt-16 sm:block lg:pt-20">
        <FunnelBreadcrumbs currentStep={currentStep} />
      </div>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-20 pt-16 lg:grid-cols-[1fr_480px] lg:pb-24 lg:pt-28">
          <div className="max-w-3xl text-center lg:text-left">
            <h1 className="text-[42px] font-black leading-[1.05] tracking-normal text-slate-900 sm:text-h1">
              Find the Best Online Degree for Your Career
            </h1>
            <p className="mt-6 max-w-2xl text-body font-medium leading-relaxed text-slate-600">
              Compare fees, placements, ROI, NAAC grades, approvals, and scholarships across top universities.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <button
                onClick={() => scrollToSection("search-section")}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-7 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
              >
                Find My Degree Match
              </button>
              <button
                onClick={() => scrollToSection("comparison-preview")}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-7 text-sm font-black text-slate-900 transition-all hover:border-blue-600 hover:text-blue-700 active:scale-95"
              >
                Compare Universities
              </button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <p className="text-sm font-black text-slate-900">Your Match Results</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Online MBA shortlist</p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">4.2x ROI</div>
            </div>

            <div className="space-y-4 py-6">
              {[
                ["Jain MBA", "94%", "bg-blue-600"],
                ["Amity MBA", "91%", "bg-emerald-500"],
                ["LPU MBA", "88%", "bg-slate-900"],
              ].map(([name, score, color]) => (
                <div key={name} className="grid grid-cols-[1fr_56px] items-center gap-4">
                  <div>
                    <div className="flex items-center justify-between text-sm font-black text-slate-900">
                      <span>{name}</span>
                      <span>{score}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: score }} />
                    </div>
                  </div>
                  <div className="text-right text-xs font-bold text-slate-500">Match</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400">Estimated ROI</p>
                  <p className="mt-1 text-3xl font-black">4.2x</p>
                </div>
                <TrendingUp className="h-10 w-10 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-8 text-center text-caption font-black text-slate-500">Trusted Universities</p>
          <PartnerLogos />
        </div>
      </section>

      <section id="search-section" className="section-spacing scroll-mt-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-h2 font-black tracking-normal text-slate-900">How Matching Works</h2>
            <p className="mt-4 text-body font-medium leading-relaxed text-slate-600">
              Share your goals once. CollegeVision turns budget, approvals, ROI, placements, and scholarships into a focused degree shortlist.
            </p>
          </div>

          <div className="mx-auto mb-16 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              ["1", "Tell us your goal", "Choose program, budget, career outcome, EMI needs, and preferred approvals."],
              ["2", "Compare verified data", "Fees, NAAC grade, UGC status, placement support, scholarships, and ROI are normalized."],
              ["3", "Pick the best match", "Shortlist universities and open a side-by-side comparison before applying."],
            ].map(([step, title, body]) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">{step}</div>
                <h3 className="text-h3 font-black tracking-normal text-slate-900">{title}</h3>
                <p className="mt-3 text-caption font-medium leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto max-w-4xl">
            <HeroSearch
              setQuery={setSearchQuery}
              onSearch={handleSearch}
              parsedIntent={parsedFilters?.careerGoal || parsedFilters?.degreeKeyword}
            />
            {isLoading && <p className="mt-6 text-center text-sm font-bold text-blue-600">Finding your best degree matches...</p>}
          </div>
        </div>
      </section>

      <RealDataMatches
        results={matchResults}
        parsedFilters={parsedFilters}
        onSelect={(id) => {
          setSelectedForComparison((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        }}
        selectedIds={selectedForComparison}
      />

      <ComparisonBar selectedCount={selectedForComparison.size} onCompare={handleCompare} onClear={() => setSelectedForComparison(new Set())} />

      <section className="section-spacing bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-h2 font-black tracking-normal text-slate-900">Real University Cards</h2>
            <p className="mt-4 text-body font-medium leading-relaxed text-slate-600">
              Key decision signals are visible immediately, so students can compare without opening five tabs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {UNIVERSITY_CARDS.map(([name, naac, fee, placement, approval]) => (
              <div key={name} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-h3 font-black tracking-normal text-slate-900">{name}</h3>
                <div className="mt-6 space-y-4 text-caption font-semibold text-slate-700">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">NAAC</span>
                    <span>{naac}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Fee</span>
                    <span>{fee}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Placement Support</span>
                    <span>{placement}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Approval</span>
                    <span>{approval}</span>
                  </div>
                </div>
                <button
                  onClick={() => scrollToSection("comparison-preview")}
                  className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white text-sm font-black text-slate-900 transition-all hover:border-blue-600 hover:text-blue-700"
                >
                  Compare
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="comparison-preview" className="section-spacing scroll-mt-20 border-y border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-h2 font-black tracking-normal text-slate-900">Compare Universities Preview</h2>
            <p className="mt-4 text-body font-medium leading-relaxed text-slate-600">
              The comparison table is the strongest product moment: fees, NAAC, placement support, EMI, and approvals in one scan.
            </p>
          </div>

          <div className="mx-auto max-w-5xl overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 md:p-8">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[140px_1fr_1fr_1fr] items-center gap-4 border-b border-slate-100 pb-4 md:grid-cols-[180px_1fr_1fr_1fr]">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">Feature</div>
                <div className="text-center text-sm font-black text-slate-900 md:text-base">Amity</div>
                <div className="text-center text-sm font-black text-slate-900 md:text-base">Jain</div>
                <div className="text-center text-sm font-black text-slate-900 md:text-base">LPU</div>
              </div>

              {COMPARISON_ROWS.map(([feature, amity, jain, lpu]) => (
                <div key={feature} className="grid grid-cols-[140px_1fr_1fr_1fr] items-center gap-4 border-b border-slate-100 py-4 last:border-b-0 md:grid-cols-[180px_1fr_1fr_1fr]">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400">{feature}</div>
                  {[amity, jain, lpu].map((value, index) => (
                    <div key={`${feature}-${index}`} className="rounded-lg bg-slate-50 py-2 text-center text-sm font-bold text-slate-800">
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-h2 font-black tracking-normal text-slate-900">Student Success Stories</h2>
            <p className="mt-4 text-body font-medium leading-relaxed text-slate-600">
              Outcome-focused stories create more trust than screenshots or informal proof.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {TESTIMONIALS.map(([initials, name, location, program, outcome]) => (
              <div key={name} className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-8">
                <p className="text-caption font-medium leading-relaxed text-slate-700">
                  {name} from {location} {outcome}
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">{initials}</div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{name}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {location} | {program}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing bg-slate-900 text-white">
        <div className="mx-auto max-w-4xl space-y-8 px-6 text-center">
          <h2 className="text-h2 font-black leading-tight tracking-normal">Find Your Best Degree Match</h2>
          <p className="mx-auto max-w-2xl text-body leading-relaxed text-slate-300">
            Build a verified shortlist around fees, outcomes, approvals, scholarships, and realistic ROI.
          </p>

          <button
            onClick={() => scrollToSection("search-section")}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-8 text-sm font-black text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
          >
            Find My Degree Match
          </button>
        </div>
      </section>

      <Footer />

      <div
        className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isCompareOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setIsCompareOpen(false)}
      />

      <div
        className={`fixed bottom-0 left-0 z-[70] w-full rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 md:left-1/2 md:top-1/2 md:bottom-auto md:max-w-5xl md:-translate-x-1/2 md:rounded-3xl ${isCompareOpen ? "translate-y-0 md:-translate-y-1/2" : "translate-y-full md:translate-y-[120%]"}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h3 className="text-xl font-black text-slate-900">Head-to-Head Comparison</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{searchQuery || "Top recommended universities"}</p>
          </div>
          <button onClick={() => setIsCompareOpen(false)} className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto bg-slate-50 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {displayedComparison.map((course) => (
              <div key={course.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h4 className="text-lg font-black text-slate-900">{course.universityName}</h4>
                <p className="mt-1 text-sm font-semibold text-slate-500">{course.courseName}</p>
                <div className="mt-6 space-y-3 text-sm font-semibold text-slate-700">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Fee</span>
                    <span>INR {(course.totalFeeInr / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">ROI</span>
                    <span className="text-blue-600">{course.roi ? (course.roi / 100).toFixed(1) : "4.0"}x</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">EMI</span>
                    <span>{course.hasZeroCostEmi ? "Yes" : "Standard"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Approvals</span>
                    <span>{course.approvals.slice(0, 2).join(", ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white p-4 sm:flex-row">
          <button
            onClick={() => {
              const top = displayedComparison[0];
              const text = `Found a UGC-approved ${top.courseName} at ${top.universityName}. Fee: INR ${(top.totalFeeInr / 100000).toFixed(1)}L. Check the breakdown: https://collegevision.in/universities/${top.universitySlug}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
            }}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-5 text-sm font-black text-emerald-700 transition-colors hover:bg-emerald-50"
          >
            <MessageCircle className="h-4 w-4" /> Share ROI Report
          </button>
          <button
            onClick={() => {
              setIsCompareOpen(false);
              setCurrentStep(3);
              router.push("/student/counseling");
            }}
            className="inline-flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition-colors hover:bg-blue-700"
          >
            Get Admission Help <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
