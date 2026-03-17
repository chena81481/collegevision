"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, Bookmark, FileText, ChevronRight, CheckCircle2, 
  Clock, AlertCircle, ArrowRight, Download, UploadCloud,
  Star, TrendingUp, IndianRupee, Settings, ShieldAlert,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { deleteStudentAccount } from '@/app/actions/delete-account';
import { createClient } from '@/utils/supabase/client';
import JourneyTimeline from '@/components/features/JourneyTimeline';
import DocumentVault from '@/components/features/DocumentVault';
import { getStudentDashboardData, submitApplication } from '@/app/actions/applications';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('saved');
  const [user, setUser] = useState<{ id: string; name: string; email: string; profileCompletion: number; score?: number } | null>(null);
  const [scholarshipCount, setScholarshipCount] = useState(0);
  const [savedMatches, setSavedMatches] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchDashboardData = async () => {
    setLoading(true);
    const data = await getStudentDashboardData();
    if (data) {
      setSavedMatches(data.savedMatches);
      setApplications(data.applications);
    }
    setLoading(false);
  };

  // Fetch real user data
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        // Fetch profile to get score
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('score_percentage')
          .eq('user_id', authUser.id)
          .single();

        setUser({
          id: authUser.id,
          name: authUser.user_metadata.full_name || authUser.email?.split('@')[0] || "Student",
          email: authUser.email || "",
          profileCompletion: profile ? 95 : 60,
          score: profile?.score_percentage,
        });

        if (profile?.score_percentage) {
          // Check how many scholarships they qualify for
          const { count } = await supabase
            .from('scholarships')
            .select('*', { count: 'exact', head: true })
            .lte('min_score', profile.score_percentage);
          setScholarshipCount(count || 0);
        }

        fetchDashboardData();
      }
    };
    fetchUser();
  }, []);

  const handleApply = async (courseId: string, universityId: string) => {
    setIsSubmitting(courseId);
    const result = await submitApplication(courseId, universityId);
    setIsSubmitting(null);

    if (result.success) {
      toast.success(result.isFeeWaived ? "Application Submitted! ₹500 Fee Waived." : "Application Initiated!");
      fetchDashboardData();
      setActiveTab('applications');
    } else {
      toast.error(result.error || "Failed to submit application");
    }
  };


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 selection:bg-blue-200 selection:text-blue-900">
      
      {/* 1. DASHBOARD HEADER & PROFILE SUMMARY */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {user.name.split(' ')[0]}</h1>
                  {scholarshipCount > 0 && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/20"
                    >
                      <Sparkles className="w-3 h-3" /> {scholarshipCount} Scholarships Unlocked
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium">{user.email}</p>
              </div>
            </div>

            {/* Gamified Profile Completion */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full md:w-80 shadow-sm flex items-center gap-4">
               <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="125" strokeDashoffset={125 - (125 * user.profileCompletion) / 100} className="text-blue-600 transition-all duration-1000 ease-out" />
                  </svg>
                  <span className="absolute text-xs font-bold text-slate-700">{user.profileCompletion}%</span>
               </div>
               <div>
                 <div className="text-sm font-bold text-slate-900 mb-0.5">Profile Status</div>
                 <div className="text-[11px] text-slate-500 leading-tight">Complete your profile to unlock the ₹500 application fee waiver.</div>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. DASHBOARD NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-px">
          <button 
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'saved' 
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-t-lg'
            }`}
          >
            <Bookmark className="w-4 h-4" /> Saved Matches
            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full ml-1">{savedMatches.length}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'applications' 
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-t-lg'
            }`}
          >
            <FileText className="w-4 h-4" /> My Applications
          </button>

          <button 
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'documents' 
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-t-lg'
            }`}
          >
            <UploadCloud className="w-4 h-4" /> Document Vault
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'settings' 
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-t-lg'
            }`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* 3. TAB CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CONTENT: SAVED MATCHES */}
          {activeTab === 'saved' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Your Shortlisted Programs</h2>
              
              {savedMatches.length > 0 ? (
                savedMatches.map((match) => (
                  <div key={match.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    
                    {/* University Logo Thumbnail */}
                    <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-sm tracking-wider shrink-0 overflow-hidden">
                      {match.course?.universities?.logo_url ? (
                        <img src={match.course.universities.logo_url} alt={match.course.universities.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        (match.course?.universities?.name || 'UNI').substring(0, 3).toUpperCase()
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-900 truncate">{match.course?.universities?.name}</h3>
                        {match.course?.badge_label && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100 shrink-0">{match.course.badge_label}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{match.course?.name}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                         <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-slate-400"/> ₹{match.course?.total_fee_inr?.toLocaleString()} Total</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full sm:w-auto flex flex-col gap-2 shrink-0 mt-4 sm:mt-0">
                      {applications.some(a => a.course_id === match.course_id) ? (
                        <button 
                          onClick={() => setActiveTab('applications')}
                          className="w-full sm:w-auto bg-green-50 text-green-700 border border-green-100 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors text-center flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Applied
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleApply(match.course_id, match.course.university_id)}
                          disabled={isSubmitting === match.course_id}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm text-center disabled:opacity-50"
                        >
                          {isSubmitting === match.course_id ? "Processing..." : "Apply Now"}
                        </button>
                      )}
                      <button className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors text-center">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">No saved matches yet. Use the explorer to find programs!</p>
                </div>
              )}
            </div>
          )}

          {/* CONTENT: APPLICATIONS (Tracking Pipeline) */}
          {activeTab === 'applications' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-xl font-bold text-slate-900 mb-2">Application Tracking</h2>
               
               {applications.length > 0 ? (
                 applications.map((app) => (
                   <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                     {/* Progress Line */}
                     <div className="absolute left-10 top-12 bottom-12 w-0.5 bg-slate-100 z-0"></div>
                     
                     <div className="flex justify-between items-start mb-8 relative z-10 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{app.university?.name}</h3>
                          <p className="text-sm text-slate-500">{app.course?.name}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                            app.status === 'WON' ? 'bg-green-100 text-green-800 border-green-200' :
                            app.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {app.status.replace('_', ' ')}
                          </span>
                          {app.is_fee_waived && (
                            <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> ₹500 Fee Waived
                            </span>
                          )}
                        </div>
                     </div>

                     {/* Timeline Steps (Dynamic-ish) */}
                     <div className="space-y-8 relative z-10">
                        {/* Step 1: Application Started */}
                        <div className="flex gap-4 items-start">
                           <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-sm z-10 border-4 border-white">
                             <CheckCircle2 className="w-4 h-4 text-white" />
                           </div>
                           <div className="pt-1">
                             <h4 className="text-sm font-bold text-slate-900 mb-1">Application Started</h4>
                             <p className="text-xs text-slate-500">Initiated on {new Date(app.created_at).toLocaleDateString()}.</p>
                           </div>
                        </div>

                        {/* Step 2: Documents */}
                        <div className="flex gap-4 items-start">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm z-10 border-4 border-white ${
                             app.status !== 'START_APPLICATION' ? 'bg-green-500' : 'bg-amber-500'
                           }`}>
                             {app.status !== 'START_APPLICATION' ? <CheckCircle2 className="w-4 h-4 text-white" /> : <AlertCircle className="w-4 h-4 text-white" />}
                           </div>
                           <div className="pt-1 w-full">
                             <h4 className="text-sm font-bold text-slate-900 mb-1">Verify Identity & Academic Docs</h4>
                             <p className="text-xs text-slate-500 mb-3">
                               {app.status === 'START_APPLICATION' ? "Required before submission." : "Documents verified via OCR."}
                             </p>
                             {app.status === 'START_APPLICATION' && (
                               <button 
                                 onClick={() => setActiveTab('documents')}
                                 className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                               >
                                 <UploadCloud className="w-3.5 h-3.5" /> Upload Now
                               </button>
                             )}
                           </div>
                        </div>

                        {/* Step 3: Review */}
                        <div className={`flex gap-4 items-start ${app.status === 'START_APPLICATION' || app.status === 'DOCUMENTS_PENDING' ? 'opacity-50' : ''}`}>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${
                             app.status === 'UNDER_REVIEW' || app.status === 'WON' || app.status === 'OFFER_RECEIVED' ? 'bg-blue-600' : 'bg-slate-200'
                           }`}>
                             <Clock className={`w-4 h-4 ${app.status === 'UNDER_REVIEW' ? 'text-white' : 'text-slate-400'}`} />
                           </div>
                           <div className="pt-1">
                             <h4 className="text-sm font-bold text-slate-900 mb-1">Counselor Portfolio Review</h4>
                             <p className="text-xs text-slate-500">
                               {app.status === 'WON' ? "Review successful." : "In progress by Priya Desai."}
                             </p>
                           </div>
                        </div>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-500 font-medium">No active applications. Start one today!</p>
                 </div>
               )}
             </div>
          )}

          {/* CONTENT: DOCUMENT VAULT (Managed Component) */}
          {activeTab === 'documents' && <DocumentVault />}

        </div>

        {/* Right Sidebar (Assigned Counselor & Actions) */}
        <div className="lg:col-span-1 space-y-6">
           
           {/* Counselor Card */}
           <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full"></div>
             
             <div className="text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-4">Your Dedicated Counselor</div>
             
             <div className="flex items-center gap-4 mb-6 relative z-10">
               <div className="w-14 h-14 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
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

           {/* Journey Timeline */}
           <JourneyTimeline 
             application={applications[0]} 
             programName={applications[0]?.course?.name} 
           />

           {/* Quick Actions / Tips */}
           <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
             <h3 className="font-bold text-slate-900 mb-4">Application Checklist</h3>
             <ul className="space-y-4">
               <li className="flex gap-3 items-start">
                 <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                 <div>
                   <p className="text-sm font-semibold text-slate-900 leading-tight mb-1">Verify Email & Phone</p>
                   <p className="text-xs text-slate-500">Completed on March 12.</p>
                 </div>
               </li>
               <li className="flex gap-3 items-start">
                 <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                 <div>
                   <p className="text-sm font-semibold text-slate-900 leading-tight mb-1">Upload Academic Docs</p>
                   <p className="text-xs text-slate-500">Required before counselor review.</p>
                 </div>
               </li>
               <li className="flex gap-3 items-start opacity-50">
                 <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0"></div>
                 <div>
                   <p className="text-sm font-semibold text-slate-900 leading-tight mb-1">Pay Application Fee</p>
                   <p className="text-xs text-slate-500">Pending university selection.</p>
                 </div>
               </li>
             </ul>
           </div>

        </div>

      </div>
    </div>
  );
}
