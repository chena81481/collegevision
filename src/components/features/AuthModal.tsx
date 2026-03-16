"use client";

import { useState } from 'react';
import { loginWithOTP, loginWithGoogle } from '@/app/actions/auth';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    const result = await loginWithOTP(email);
    
    if (result.error) {
      setErrorMessage(result.error);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  };

  const onGoogleLogin = async () => {
    setStatus('loading');
    const result = await loginWithGoogle();
    if (result?.error) {
      setErrorMessage(result.error);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors p-2"
        >
           ✕
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Welcome to CollegeVision</h2>
            <p className="text-sm text-slate-500">Save matches, compare ROI, and track applications.</p>
          </div>

          {/* Google Auth Button */}
          <button 
            type="button" 
            onClick={onGoogleLogin}
            disabled={status === 'loading'}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 mb-6 disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">or</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* OTP Auth Form */}
          {status === 'sent' ? (
             <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Check your email</h3>
                <p className="text-sm text-slate-600 leading-relaxed">We sent a secure magic link to {email}. Click it to log in instantly.</p>
             </div>
          ) : (
            <form onSubmit={handleOTP} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
              
              {status === 'error' && <p className="text-xs text-red-500 font-medium px-1">{errorMessage}</p>}

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
              >
                {status === 'loading' ? 'Sending Link...' : 'Send Magic Link'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
           <p className="text-[11px] text-slate-400 font-medium">By continuing, you agree to our Terms of Service and zero-spam Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
