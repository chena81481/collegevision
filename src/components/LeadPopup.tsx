"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function LeadPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    state: "",
  });

  useEffect(() => {
    // Mobile-only check (< 768px)
    if (typeof window !== "undefined" && window.innerWidth > 768) return;

    const shown = localStorage.getItem("leadPopupShown");
    if (!shown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500); // 2.5s delay for best UX
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("leadPopupShown", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: "MOBILE_POPUP",
          priority: "HIGH",
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        localStorage.setItem("leadPopupShown", "true");
        setTimeout(() => setIsOpen(false), 3000);
      } else {
        const error = await response.json();
        alert(error.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Lead submission error:", err);
      alert("Failed to connect. Please check your internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 z-10"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Thank You!</h2>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Our expert counselors will call you shortly to guide you to the best university.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="relative h-28 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex items-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Compare 100+ Universities</h2>
                    <p className="text-blue-100 text-sm">Find your perfect course today</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        required
                        type="text"
                        placeholder="Your Full Name"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <input
                        required
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                      <input
                        required
                        type="email"
                        placeholder="Your Email"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <select
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-600 dark:text-slate-300 appearance-none cursor-pointer"
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      >
                        <option value="" disabled>Select Course</option>
                        <option value="Online MBA">Online MBA</option>
                        <option value="Online BBA">Online BBA</option>
                        <option value="Online MCA">Online MCA</option>
                        <option value="Online BCA">Online BCA</option>
                      </select>

                      <select
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-600 dark:text-slate-300 appearance-none cursor-pointer"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      >
                        <option value="" disabled>Select State</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="UP">Uttar Pradesh</option>
                        <option value="Karnataka">Karnataka</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        FIND BEST UNIVERSITY
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>100% Secure & Data Privacy Guaranteed</span>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
