"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { submitApplicationLead } from '@/app/actions/leads';
import { formatINR } from './utils';
import { usePostHog } from 'posthog-js/react';

const leadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
});

interface LeadCaptureFormProps {
  universityName: string;
  courseName: string;
  totalFee: number;
  durationMonths: number;
  hasZeroCostEmi: boolean;
  roi: number | null;
  user: any;
}

export default function LeadCaptureForm({ 
  universityName, 
  courseName, 
  totalFee, 
  durationMonths,
  hasZeroCostEmi,
  roi,
  user 
}: LeadCaptureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: '',
    }
  });

  const posthog = usePostHog();

  const onSubmit = async (data: any) => {
    if (!turnstileToken) {
      alert("Please complete the security check.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitApplicationLead({
        ...data,
        universityName,
        courseName,
        turnstileToken
      });
      if (res.success) {
        setSubmitted(true);
        posthog.capture('Lead_Captured', {
          university: universityName,
          course: courseName,
          fee: totalFee,
          roi_projected: roi
        });
      } else {
        alert(res.error || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Application Received!</h3>
        <p className="text-sm text-slate-500">
          Our senior counselor will call you within 24 hours to discuss your ROI analysis and admission steps.
        </p>
        <div className="pt-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Next Step</div>
          <div className="bg-slate-50 p-4 rounded-2xl text-sm font-medium text-slate-700">
            Check your email for the detailed brochure.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden sticky top-24">
      {/* Dynamic ROI Header */}
      <div className="bg-slate-900 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Exclusive Benefit</span>
        </div>
        <h3 className="text-lg font-bold leading-tight">Apply through CollegeVision</h3>
        <p className="text-xs text-slate-400 mt-1">Get 100% scholarship assistance & Zero-Cost EMI.</p>
        
        {roi && (
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Projected ROI</div>
            <div className="text-2xl font-black text-teal-400">+{roi}%</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Full Name</label>
            <input 
              {...register('name')}
              placeholder="Your Name"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {errors.name && <p className="text-red-500 text-[10px] mt-1 px-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Email Address</label>
            <input 
              {...register('email')}
              placeholder="email@example.com"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {errors.email && <p className="text-red-500 text-[10px] mt-1 px-1">{errors.email.message as string}</p>}
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Phone Number</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">+91</span>
              <input 
                {...register('phone')}
                placeholder="00000 00000"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-[10px] mt-1 px-1">{errors.phone.message as string}</p>}
          </div>
        </div>

        {/* Security / Bot Protection */}
        <div className="flex justify-center -mx-2">
          <Turnstile 
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || ""} 
            onSuccess={(token) => setTurnstileToken(token)}
          />
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-bold text-sm shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Now & Analysis"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3 text-green-500" /> Secure Application
        </div>
      </form>
    </div>
  );
}
