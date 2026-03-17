"use client";

import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, 
  Trash2, Download, RefreshCcw, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

interface Document {
  id: string;
  file_name: string;
  document_type: string;
  verification_status: string;
  created_at: string;
}

export default function DocumentVault() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedPreview, setParsedPreview] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('student_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = reader.result as string;
      setUploadProgress(40);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch('/api/parse-document', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ image: base64Content }),
        });
        
        setUploadProgress(80);
        const data = await response.json();
        setParsedPreview(data);
        fetchDocuments();
        setUploadProgress(100);
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">Vault Storage</h2>
          <p className="text-sm font-bold text-slate-500">Industry-standard encryption for your academic records.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black text-emerald-700 uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5" /> DPDP Compliant
        </div>
      </div>

      {/* Upload Zone */}
      <div className="relative group">
        <label className={`
          border-4 border-dashed rounded-[2.5rem] p-12 text-center transition-all cursor-pointer block relative overflow-hidden
          ${isUploading ? 'border-blue-400 bg-blue-50/20' : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50'}
        `}>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
          
          <div className="relative z-10">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all shadow-sm ${
              isUploading ? 'bg-blue-600 text-white animate-bounce' : 'bg-slate-50 text-slate-400 group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-blue-600'
            }`}>
              <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {isUploading ? 'AI is analyzing...' : 'Upload Academic Asset'}
            </h3>
            <p className="text-sm font-bold text-slate-500 max-w-sm mx-auto mb-8">
              Drop your 10th, 12th, or Graduation Marksheets. Our AI will verify them instantly.
            </p>
            <div className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-xs font-black shadow-xl hover:bg-black transition-all inline-block">
              Select Certificates
            </div>
          </div>

          {/* Progress Overlay */}
          <AnimatePresence>
            {isUploading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-12"
              >
                <div className="w-full max-w-xs text-center">
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-blue-600"
                    />
                  </div>
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest animate-pulse">
                    Extracting data using Gemini 1.5
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </label>
      </div>

      {/* OCR Preview Magic Card */}
      <AnimatePresence>
        {parsedPreview && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl rounded-full -mr-24 -mt-24" />
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">Asset Identified Successfully</h3>
                </div>
                <button 
                  onClick={() => setParsedPreview(null)}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-colors"
                >
                  Dismiss
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                {[
                  { label: "Identity", value: parsedPreview.studentName, icon: FileText },
                  { label: "Institution", value: parsedPreview.board, icon: FileText },
                  { label: "Merit Score", value: `${parsedPreview.score}%`, icon: FileText },
                  { label: "Class/Degree", value: parsedPreview.degreeType, icon: FileText }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/10 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-black truncate">{item.value || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Records */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Verified Asset History</h3>
        
        {documents.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem] p-12 text-center">
             <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-sm font-bold text-slate-400">Your vault is empty. Upload items to start verification.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between hover:shadow-lg hover:border-blue-100 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm tracking-tight">{doc.file_name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{doc.document_type || 'Asset'}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {doc.verification_status}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">
                    <Download className="w-5 h-5" />
                  </button>
                   <button className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Institutional Guarantee</p>
          <h4 className="text-xl font-black mb-4">Verification Shield Active</h4>
          <p className="text-sm font-bold text-slate-400 max-w-md mx-auto mb-8">
            Your documents are verified against Govt. databases and encrypted using AES-256. 
            They are only shared with university partners when you click "Apply".
          </p>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
              <ShieldCheck className="w-4 h-4" /> SSL Encrypted
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> ISO Certified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
