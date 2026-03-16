"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, Bookmark, FileText, ChevronRight, CheckCircle2, 
  Clock, AlertCircle, ArrowRight, Download, UploadCloud,
  Star, TrendingUp, IndianRupee, Settings, ShieldAlert
} from 'lucide-react';
import { deleteStudentAccount } from '@/app/actions/delete-account';
import { createClient } from '@/utils/supabase/client';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('saved');
  const [user, setUser] = useState<{ name: string; email: string; profileCompletion: number } | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<{ studentName: string; board: string; year: string; score: string } | null>(null);
  const supabase = createClient();

  // Fetch real user data
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          name: authUser.user_metadata.full_name || authUser.email?.split('@')[0] || "Student",
          email: authUser.email || "",
          profileCompletion: 60, // Mocked for now as requested
        });
      }
    };
    fetchUser();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParsedData(null);

    // Convert to base64 for Gemini
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = reader.result as string;
      
      try {
        const response = await fetch('/api/parse-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Content }),
        });
        
        const data = await response.json();
        setParsedData(data);
      } catch (err) {
        console.error("Parsing failed:", err);
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Simulated Saved Matches (In production, fetch from 'saved_matches' table)
  const savedUniversities = [
    {
      id: 1,
      name: "Symbiosis SCDL",
      course: "Online BBA",
      fee: "1,50,000",
      roi: "433%",
      status: "ready_to_apply",
      logoColor: "bg-teal-900",
      badge: "Top Match"
    },
    {
      id: 2,
      name: "Amity Online",
      course: "Online MBA Finance",
      fee: "1,75,000",
      roi: "485%",
      status: "documents_pending",
      logoColor: "bg-orange-600",
      badge: "High Placement"
    }
  ];

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
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {user.name.split(' ')[0]}</h1>
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
            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full ml-1">{savedUniversities.length}</span>
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
              
              {savedUniversities.map((uni) => (
                <div key={uni.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  
                  {/* University Logo Thumbnail */}
                  <div className={`w-16 h-16 ${uni.logoColor} rounded-xl flex items-center justify-center text-white font-bold text-sm tracking-wider shrink-0`}>
                    {uni.name.substring(0, 3).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-slate-900 truncate">{uni.name}</h3>
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100 shrink-0">{uni.badge}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{uni.course}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                       <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-slate-400"/> ₹{uni.fee} Total</span>
                       <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                       <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded"><TrendingUp className="w-3.5 h-3.5"/> {uni.roi} ROI</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="w-full sm:w-auto flex flex-col gap-2 shrink-0 mt-4 sm:mt-0">
                    <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm text-center">
                      Apply Now
                    </button>
                    <button className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors text-center">
                      Compare ROI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CONTENT: APPLICATIONS (Tracking Pipeline) */}
          {activeTab === 'applications' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-xl font-bold text-slate-900 mb-2">Application Tracking</h2>
               
               <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                 {/* Progress Line */}
                 <div className="absolute left-10 top-12 bottom-12 w-0.5 bg-slate-100 z-0"></div>
                 
                 <div className="flex justify-between items-start mb-8 relative z-10 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Amity Online</h3>
                      <p className="text-sm text-slate-500">Online MBA Finance</p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-200">
                      Action Required
                    </span>
                 </div>

                 {/* Timeline Steps */}
                 <div className="space-y-8 relative z-10">
                    
                    {/* Step 1: Done */}
                    <div className="flex gap-4 items-start">
                       <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-sm z-10 border-4 border-white">
                         <CheckCircle2 className="w-4 h-4 text-white" />
                       </div>
                       <div className="pt-1">
                         <h4 className="text-sm font-bold text-slate-900 mb-1">Application Started</h4>
                         <p className="text-xs text-slate-500">You initiated the application on March 12, 2026.</p>
                       </div>
                    </div>

                    {/* Step 2: Current/Pending */}
                    <div className="flex gap-4 items-start">
                       <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-sm z-10 border-4 border-white">
                         <AlertCircle className="w-4 h-4 text-white" />
                       </div>
                       <div className="pt-1 w-full">
                         <h4 className="text-sm font-bold text-slate-900 mb-1">Upload Documents</h4>
                         <p className="text-xs text-slate-500 mb-3">Please upload your 12th marksheet to proceed to counselor review.</p>
                         <button className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
                           <UploadCloud className="w-3.5 h-3.5" /> Upload Now
                         </button>
                       </div>
                    </div>

                    {/* Step 3: Future */}
                    <div className="flex gap-4 items-start opacity-50">
                       <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 z-10 border-4 border-white">
                         <Clock className="w-4 h-4 text-slate-400" />
                       </div>
                       <div className="pt-1">
                         <h4 className="text-sm font-bold text-slate-500 mb-1">Counselor Review & Payment</h4>
                         <p className="text-xs text-slate-400">Waiting for document submission.</p>
                       </div>
                    </div>

                 </div>
               </div>
             </div>
          )}

          {/* CONTENT: DOCUMENT VAULT (OCR Setup) */}
          {activeTab === 'documents' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-between items-end mb-6">
                 <div>
                   <h2 className="text-xl font-bold text-slate-900 mb-1">Document Vault</h2>
                   <p className="text-sm text-slate-500">Upload once, apply everywhere. Securely stored.</p>
                 </div>
               </div>

               {/* Upload Dropzone */}
               {!parsedData && !isParsing ? (
                 <label className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-3xl p-10 text-center hover:bg-blue-50/50 transition-colors cursor-pointer group block">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-slate-900 font-bold mb-2">Drag & drop your documents</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Upload your 10th/12th marksheets, Degree certificate, or Aadhar card (PDF, JPG, PNG).</p>
                    <div className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors inline-block">
                      Browse Files
                    </div>
                 </label>
               ) : isParsing ? (
                 <div className="border-2 border-dashed border-blue-200 bg-blue-50/10 rounded-3xl p-16 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-slate-900 font-bold mb-2">Magic AI Parsing...</h3>
                    <p className="text-sm text-slate-500">Gemini is extracting data from your marksheet.</p>
                 </div>
               ) : (
                 <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl text-white animate-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg">Magic Extraction Complete</h3>
                      </div>
                      <button 
                        onClick={() => setParsedData(null)}
                        className="text-white/60 hover:text-white text-xs font-medium"
                      >
                        Re-upload
                      </button>
                    </div>
                    
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {parsedData && [
                        { label: 'Full Name', value: parsedData.studentName },
                        { label: 'Board', value: parsedData.board },
                        { label: 'Year', value: parsedData.year },
                        { label: 'Avg. Score', value: parsedData.score }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                          <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">{item.label}</div>
                          <div className="text-sm font-bold truncate">{item.value}</div>
                        </div>
                      ))}
                    </div>
                 </div>
               )}

               {/* Uploaded Files List */}
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pt-4">Uploaded Files</h3>
               <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
                  <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">PDF</div>
                       <div>
                         <div className="text-sm font-bold text-slate-900">12th_Marksheet_CBSE.pdf</div>
                         <div className="text-xs text-slate-500 flex items-center gap-2">
                           1.2 MB <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 
                           <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle2 className="w-3 h-3"/> Verified</span>
                         </div>
                       </div>
                     </div>
                     <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                       <Download className="w-4 h-4" />
                     </button>
                  </div>
               </div>
             </div>
          )}

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
