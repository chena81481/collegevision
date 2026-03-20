"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ShieldCheck, ArrowRight, Loader2, Sparkles, 
  User, Mail, Phone, MapPin, GraduationCap, 
  CheckCircle2, Star
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogDescription 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitApplicationLead } from "@/app/actions/leads";
import { motion, AnimatePresence } from "framer-motion";

const leadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  course: z.string().min(1, "Please select a course"),
  state: z.string().min(1, "Please select your state"),
});

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const ONLINE_COURSES = [
  "Online MBA", "Online Executive MBA", "Online Dual MBA", "Online MCA",
  "Online M.Com", "Online MA", "Online BBA", "Online B.Com", "Online BA", "Online BCA"
];

const PARTNER_LOGOS = [
  { name: "JAIN", color: "text-blue-600" },
  { name: "LPU Online", color: "text-orange-600" },
  { name: "Online MANIPAL", color: "text-red-700" }
];

export function LeadCaptureModal({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("studentName", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("courseName", data.course);
      formData.append("state", data.state);
      formData.append("universityName", "General Interest"); 

      const res = await submitApplicationLead(formData);
      if (res.success) {
        setSubmitted(true);
        setTimeout(() => {
           setIsOpen(false);
           setSubmitted(false);
        }, 5000);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-6 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
            Find Best University <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-transparent shadow-none">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white dark:bg-zinc-950 rounded-[40px] shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="relative p-8 text-center bg-slate-50 dark:bg-zinc-900/50 border-b border-white/5">
                <div className="absolute top-0 right-0 p-4">
                   <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                </div>
                
                <DialogTitle className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                   Compare & Select from <span className="text-blue-600">100+</span>
                </DialogTitle>
                <DialogDescription className="font-bold text-slate-500 dark:text-slate-400">
                   Best University for your Top Online Course
                </DialogDescription>

                <div className="flex justify-center items-center gap-6 mt-6 opacity-80 group">
                   {PARTNER_LOGOS.map((logo) => (
                     <div key={logo.name} className="flex flex-col items-center">
                        <div className={`text-[10px] font-black tracking-tighter ${logo.color} bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm transition-transform hover:scale-110`}>
                           {logo.name}
                        </div>
                     </div>
                   ))}
                </div>

                <div className="flex justify-center gap-4 mt-6">
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> No-Cost EMI
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      <CheckCircle2 className="w-3 h-3" /> 100% Placement
                   </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                      {...register("name")}
                      placeholder="Your Name" 
                      className="pl-11 h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold focus-visible:ring-blue-500"
                    />
                    {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{errors.name.message as string}</p>}
                  </div>

                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                      {...register("email")}
                      placeholder="Your Email" 
                      className="pl-11 h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold focus-visible:ring-blue-500"
                    />
                    {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{errors.email.message as string}</p>}
                  </div>
                </div>

                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">+91</span>
                  <Input 
                    {...register("phone")}
                    placeholder="Contact Number" 
                    className="pl-20 h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold focus-visible:ring-blue-500"
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{errors.phone.message as string}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Select onValueChange={(val) => setValue("course", val)}>
                      <SelectTrigger className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold">
                         <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            <SelectValue placeholder="Course" />
                         </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/10 bg-slate-900 text-white max-h-[300px]">
                        {ONLINE_COURSES.map(course => (
                          <SelectItem key={course} value={course} className="font-bold py-3 transition-colors">
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.course && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{errors.course.message as string}</p>}
                  </div>

                  <div className="space-y-1">
                    <Select onValueChange={(val) => setValue("state", val)}>
                      <SelectTrigger className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold">
                         <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <SelectValue placeholder="State" />
                         </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/10 bg-slate-900 text-white max-h-[300px]">
                        {INDIAN_STATES.map(state => (
                          <SelectItem key={state} value={state} className="font-bold py-3 transition-colors">
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{errors.state.message as string}</p>}
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[24px] shadow-2xl shadow-blue-500/30 text-lg transition-transform active:scale-95 flex items-center justify-center gap-3 group"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        FIND BEST UNIVERSITY
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex flex-col items-center gap-4 py-4 border-t border-slate-100 dark:border-white/5">
                   <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                         {[11, 12, 13].map((i) => (
                           <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white dark:border-zinc-950 overflow-hidden ring-1 ring-slate-100">
                             <img src={`https://i.pravatar.cc/100?u=${i}`} alt="avatar" />
                           </div>
                         ))}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">
                         Connect with <span className="text-blue-500">Top Experts</span>
                         <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500 border-none" />)}
                         </div>
                      </div>
                   </div>
                   
                   <p className="text-[9px] font-bold text-emerald-600 flex items-center gap-1 opacity-80 uppercase tracking-tighter">
                      <ShieldCheck className="w-3 h-3" /> Your personal information is 100% secure with us
                   </p>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-950 rounded-[40px] p-12 text-center shadow-2xl border border-white/10"
            >
              <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-emerald-500/5">
                <ShieldCheck className="w-12 h-12 shadow-inner" />
              </div>
              <h2 className="text-3xl font-black mb-4">Application Received!</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                Our senior counselor will call you within 24 hours to discuss your ROI analysis and admission steps.
              </p>
              <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-white flex items-center gap-3 justify-center">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Preference saved successfully.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
