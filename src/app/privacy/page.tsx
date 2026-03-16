import React from 'react';
import { Shield, Lock, Eye, Trash2, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight">Privacy & Data Protection</h1>
              <p className="text-slate-500 font-medium">Compliance with DPDP Act 2023 & IT Act 2000</p>
            </div>
          </div>

          <div className="space-y-8 text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" /> 1. Encryption & Security
              </h2>
              <p>
                CollegeVision employs enterprise-grade **AES-256-GCM encryption** for all Personally Identifiable Information (PII). 
                Your phone number is encrypted at rest within our secure Supabase vault, ensuring that even in the event of unauthorized 
                access, your data remains unreadable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" /> 2. Zero-Spam Policy
              </h2>
              <p>
                We physically enforce a strict communication policy. Our system is programmatically restricted from contacting a 
                student more than **twice per week**. We do not sell your data to third-party aggregators. All communication 
                is mediated through our internal verified partner network.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" /> 3. Data Minimization
              </h2>
              <p>
                We only collect data that is strictly necessary for your educational journey:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>**Identity**: Name and email for account management.</li>
                <li>**Communication**: Phone number for verified university assistance.</li>
                <li>**Preference**: Target degree and budget for accurate matching.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" /> 4. Right to Deletion
              </h2>
              <p>
                Under the DPDP Act 2023, you have the absolute right to be forgotten. You can trigger a full deletion of your 
                account and all associated PII directly from your Student Dashboard settings. This action is irreversible 
                and removes all traces of your data from our active databases and backups.
              </p>
            </section>

            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-xs text-slate-400 font-medium">
                Last updated: March 2026 • Version 1.2
              </div>
              <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">
                <FileText className="w-4 h-4" /> Download PDF Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
