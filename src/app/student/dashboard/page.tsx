"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Bookmark,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  UploadCloud,
  TrendingUp,
  IndianRupee,
  Settings,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { deleteStudentAccount } from "@/app/actions/delete-account";
import { createClient } from "@/utils/supabase/client";
import JourneyTimeline from "@/components/features/JourneyTimeline";
import DocumentVault from "@/components/features/DocumentVault";
import { getStudentDashboardData, submitApplication } from "@/app/actions/applications";
import { toast } from "sonner";

type ActiveTab = "saved" | "applications" | "documents" | "settings";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("saved");
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    profileCompletion: number;
    score?: number;
  } | null>(null);
  const [scholarshipCount, setScholarshipCount] = useState(0);
  const [savedMatches, setSavedMatches] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const supabase = createClient();

  const quickStats = [
    { label: "Saved", value: savedMatches.length, accent: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Applied", value: applications.length, accent: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Scholarships", value: scholarshipCount, accent: "text-amber-600 bg-amber-50 border-amber-100" },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    const data = await getStudentDashboardData();
    if (data) {
      setSavedMatches(data.savedMatches);
      setApplications(data.applications);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("student_profiles")
        .select("score_percentage")
        .eq("user_id", authUser.id)
        .single();

      setUser({
        id: authUser.id,
        name: authUser.user_metadata.full_name || authUser.email?.split("@")[0] || "Student",
        email: authUser.email || "",
        profileCompletion: profile ? 95 : 60,
        score: profile?.score_percentage,
      });

      if (profile?.score_percentage) {
        const { count } = await supabase
          .from("scholarships")
          .select("*", { count: "exact", head: true })
          .lte("min_score", profile.score_percentage);
        setScholarshipCount(count || 0);
      }

      await fetchDashboardData();
    };

    fetchUser();
  }, [supabase]);

  const handleApply = async (courseId: string, universityId: string) => {
    setIsSubmitting(courseId);
    const result = await submitApplication(courseId, universityId);
    setIsSubmitting(null);

    if (result.success) {
      toast.success(result.isFeeWaived ? "Application submitted. Fee waived." : "Application initiated.");
      await fetchDashboardData();
      setActiveTab("applications");
    } else {
      toast.error(result.error || "Failed to submit application");
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 selection:bg-blue-200 selection:text-blue-900">
      <div className="bg-white border-b border-slate-200 pt-20 md:pt-24 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 md:gap-6">
            <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold border-4 border-white shadow-sm shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                    Welcome back, {user.name.split(" ")[0]}
                  </h1>
                  {scholarshipCount > 0 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/20 w-fit"
                    >
                      <Sparkles className="w-3 h-3" /> {scholarshipCount} Scholarships Unlocked
                    </motion.div>
                  )}
                </div>
                <p className="text-xs md:text-sm text-slate-500 font-medium truncate">{user.email}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full md:w-80 shadow-sm flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="125"
                    strokeDashoffset={125 - (125 * user.profileCompletion) / 100}
                    className="text-blue-600 transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-slate-700">{user.profileCompletion}%</span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 mb-0.5">Profile Status</div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  Complete your profile to unlock the fee waiver and faster reviews.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 md:hidden">
            {quickStats.map((stat) => (
              <div key={stat.label} className={`rounded-2xl border p-3 ${stat.accent}`}>
                <p className="text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                <p className="mt-1 text-xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-5 md:mt-8">
        <div className="flex gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-px">
          {[
            { id: "saved", label: "Saved Matches", icon: Bookmark, count: savedMatches.length },
            { id: "applications", label: "My Applications", icon: FileText },
            { id: "documents", label: "Document Vault", icon: UploadCloud },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 text-xs md:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  active
                    ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-t-lg"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {typeof tab.count === "number" && (
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full ml-1">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1 space-y-6 order-first lg:order-none">
          <div className="bg-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full" />
            <div className="text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-4">Your Dedicated Counselor</div>

            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                <User className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Priya Desai</h3>
                <p className="text-xs text-slate-400">Senior Admissions Expert</p>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20">
                Schedule Video Call
              </button>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 font-medium py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                Chat on WhatsApp
              </button>
            </div>
          </div>

          <div className="hidden lg:block">
            <JourneyTimeline application={applications[0]} programName={applications[0]?.course?.name} />
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Application Checklist</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-tight mb-1">Verify Email & Phone</p>
                  <p className="text-xs text-slate-500">Completed for your account.</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-tight mb-1">Upload Academic Docs</p>
                  <p className="text-xs text-slate-500">Required before counselor review.</p>
                </div>
              </li>
              <li className="flex gap-3 items-start opacity-60">
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-tight mb-1">Submit Final Application</p>
                  <p className="text-xs text-slate-500">Becomes active after your shortlist is ready.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {activeTab === "saved" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6">Your Shortlisted Programs</h2>

              {savedMatches.length > 0 ? (
                savedMatches.map((match) => (
                  <div key={match.id} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 hover:shadow-md transition-shadow flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-sm tracking-wider shrink-0 overflow-hidden">
                        {match.course?.universities?.logo_url ? (
                          <img src={match.course.universities.logo_url} alt={match.course.universities.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          (match.course?.universities?.name || "UNI").substring(0, 3).toUpperCase()
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-base md:text-lg text-slate-900">{match.course?.universities?.name}</h3>
                          {match.course?.badge_label && (
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100 shrink-0">
                              {match.course.badge_label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{match.course?.name}</p>

                        <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-600">
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5 text-slate-400" /> INR {match.course?.total_fee_inr?.toLocaleString()} Total
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-slate-400" /> Ready to apply
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {applications.some((app) => app.course_id === match.course_id) ? (
                        <button
                          onClick={() => setActiveTab("applications")}
                          className="w-full bg-green-50 text-green-700 border border-green-100 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-center flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Applied
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApply(match.course_id, match.course.university_id)}
                          disabled={isSubmitting === match.course_id}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm text-center disabled:opacity-50"
                        >
                          {isSubmitting === match.course_id ? "Processing..." : "Apply Now"}
                        </button>
                      )}

                      <button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-center">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 md:py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">No saved matches yet. Use the explorer to find programs.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "applications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Application Tracking</h2>

              {applications.length > 0 ? (
                applications.map((app) => (
                  <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute left-8 md:left-10 top-12 bottom-12 w-0.5 bg-slate-100 z-0" />

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-6 relative z-10 border-b border-slate-100 pb-4">
                      <div className="min-w-0">
                        <h3 className="font-bold text-base md:text-lg text-slate-900">{app.university?.name}</h3>
                        <p className="text-sm text-slate-500">{app.course?.name}</p>
                      </div>
                      <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 flex-wrap">
                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                            app.status === "WON"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : app.status === "UNDER_REVIEW"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}
                        >
                          {app.status.replace("_", " ")}
                        </span>
                        {app.is_fee_waived && (
                          <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Fee Waived
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-8 relative z-10">
                      <div className="flex gap-3 md:gap-4 items-start">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-sm z-10 border-4 border-white">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="pt-1">
                          <h4 className="text-sm font-bold text-slate-900 mb-1">Application Started</h4>
                          <p className="text-xs text-slate-500">Initiated on {new Date(app.created_at).toLocaleDateString()}.</p>
                        </div>
                      </div>

                      <div className="flex gap-3 md:gap-4 items-start">
                        <div
                          className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm z-10 border-4 border-white ${
                            app.status !== "START_APPLICATION" ? "bg-green-500" : "bg-amber-500"
                          }`}
                        >
                          {app.status !== "START_APPLICATION" ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="pt-1 w-full">
                          <h4 className="text-sm font-bold text-slate-900 mb-1">Verify Identity & Academic Docs</h4>
                          <p className="text-xs text-slate-500 mb-3">
                            {app.status === "START_APPLICATION" ? "Required before submission." : "Documents verified via OCR."}
                          </p>
                          {app.status === "START_APPLICATION" && (
                            <button
                              onClick={() => setActiveTab("documents")}
                              className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                            >
                              <UploadCloud className="w-3.5 h-3.5" /> Upload Now
                            </button>
                          )}
                        </div>
                      </div>

                      <div
                        className={`flex gap-3 md:gap-4 items-start ${
                          app.status === "START_APPLICATION" || app.status === "DOCUMENTS_PENDING" ? "opacity-50" : ""
                        }`}
                      >
                        <div
                          className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${
                            app.status === "UNDER_REVIEW" || app.status === "WON" || app.status === "OFFER_RECEIVED"
                              ? "bg-blue-600"
                              : "bg-slate-200"
                          }`}
                        >
                          <Clock className={`w-4 h-4 ${app.status === "UNDER_REVIEW" ? "text-white" : "text-slate-400"}`} />
                        </div>
                        <div className="pt-1">
                          <h4 className="text-sm font-bold text-slate-900 mb-1">Counselor Portfolio Review</h4>
                          <p className="text-xs text-slate-500">
                            {app.status === "WON" ? "Review successful." : "In progress by Priya Desai."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 md:py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">No active applications. Start one today.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && <DocumentVault />}

          {activeTab === "settings" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg md:text-xl font-bold text-slate-900">Profile & Security</h2>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Account safety</p>
                    <p className="text-xs text-slate-500 mt-1">Your sign-in and application records stay linked to this account.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Email</p>
                    <p className="mt-2 text-sm font-bold text-slate-900 break-all">{user.email}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Completion</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{user.profileCompletion}% complete</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const confirmed = window.confirm("Delete your student account permanently?");
                    if (!confirmed) return;
                    const result = await deleteStudentAccount();
                    if (result?.error) {
                      toast.error(result.error);
                    } else {
                      toast.success("Account deleted successfully.");
                    }
                  }}
                  className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
