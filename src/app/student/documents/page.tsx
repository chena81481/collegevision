"use client";

import React, { useState } from "react";
import { UploadCloud, FileText, CheckCircle, Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function SmartVaultPage() {
  const [uploadState, setUploadState] = useState<"idle" | "scanning" | "success">("idle");

  const handleUpload = () => {
    setUploadState("scanning");
    // Simulate OCR Processing Delay
    setTimeout(() => {
      setUploadState("success");
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            Smart Vault OCR
          </h1>
          <p className="text-foreground/70 mt-1">
            Upload your documents once. Our AI automatically extracts your grades to autofill applications.
          </p>
        </div>
        <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> 1 Document Missing
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Zone */}
        <div className="glass-panel p-8 rounded-[32px] border border-white/10 flex flex-col items-center justify-center text-center min-h-[400px] relative overflow-hidden group">
          
          {uploadState === "idle" && (
            <>
              <div className="w-24 h-24 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform cursor-pointer" onClick={handleUpload}>
                <UploadCloud className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">Upload 12th Marksheet</h3>
              <p className="text-sm text-foreground/50 mb-6">PDF, JPEG, or PNG (Max 5MB)</p>
              <button onClick={handleUpload} className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Select File
              </button>
            </>
          )}

          {uploadState === "scanning" && (
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-40 bg-white/5 border border-white/20 rounded-xl mb-8 overflow-hidden flex items-center justify-center">
                <FileText className="w-12 h-12 text-foreground/30" />
                {/* AI Scan Line Animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-violet-500 shadow-[0_0_20px_#8b5cf6] animate-[scan_2s_ease-in-out_infinite]" />
              </div>
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
              <h3 className="text-xl font-bold text-violet-400 animate-pulse">Running OCR Analysis...</h3>
              <p className="text-sm text-foreground/50 mt-2">Extracting grades and verifying board...</p>
            </div>
          )}

          {uploadState === "success" && (
            <div className="flex flex-col items-center animate-fade-in-up">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-400 mb-2">Extraction Complete!</h3>
              <p className="text-foreground/70">Your application forms have been securely autofilled.</p>
              <button 
                onClick={() => setUploadState("idle")} 
                className="mt-8 text-sm font-bold text-foreground/50 hover:text-white underline underline-offset-4"
              >
                Upload Another Document
              </button>
            </div>
          )}

        </div>

        {/* Extracted Data View */}
        <div className="glass-panel p-8 rounded-[32px] border border-white/10 flex flex-col h-full bg-black/20">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" /> Extracted Data
          </h3>

          {uploadState === "success" ? (
            <div className="flex-1 space-y-6 animate-fade-in-up">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-xs font-bold uppercase text-foreground/50 tracking-wider">Board</p>
                     <p className="text-lg font-medium">CBSE</p>
                  </div>
                  <div>
                     <p className="text-xs font-bold uppercase text-foreground/50 tracking-wider">Passing Year</p>
                     <p className="text-lg font-medium">2023</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                   <p className="text-xs font-bold uppercase text-foreground/50 tracking-wider mb-2">Overall Percentage</p>
                   <div className="flex items-end gap-3">
                     <span className="text-4xl font-black text-emerald-400">92.4%</span>
                     <span className="text-sm text-emerald-400/70 font-bold mb-1 bg-emerald-500/10 px-2 py-0.5 rounded">Verified</span>
                   </div>
                </div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-violet-500/30 bg-violet-600/10">
                <p className="text-sm text-violet-200 font-medium">
                  <Sparkles className="inline w-4 h-4 mr-1 text-yellow-400" />
                  Based on this score, you are eligible for the <span className="font-bold underline">Amity Merit Scholarship (50%)</span>. We've auto-applied this to your profile!
                </p>
              </div>
            </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
               <FileText className="w-16 h-16 mb-4 text-foreground/20" />
               <p className="text-foreground/70 max-w-[200px]">Upload a document to see extracted data here.</p>
             </div>
          )}

        </div>

      </div>
    </div>
  );
}
