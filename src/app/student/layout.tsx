"use client";

import React from "react";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { Menu, X, Bell, Search, GraduationCap } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [studentName, setStudentName] = React.useState("Student");
  const supabase = createClient();

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setStudentName(user.user_metadata.full_name?.split(" ")[0] || user.email?.split("@")[0] || "Student");
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <StudentSidebar />

      {/* Mobile Header & Sidebar Toggle */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
          <GraduationCap className="h-6 w-6 text-violet-500" />
          <span>College<span className="text-violet-500">Vision</span></span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 relative min-h-screen flex flex-col pt-16 md:pt-0">
        
        {/* Top Navbar */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 border-b border-white/5 bg-background/30 backdrop-blur-md sticky top-0 z-40">
          
          <div className="relative w-96 group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-violet-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search universities, courses..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all font-medium placeholder:text-foreground/40"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-foreground/70" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-background animate-pulse" />
            </button>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <p className="text-sm font-bold">Hi, {studentName}! 👋</p>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </div>

      </main>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl pt-20 px-4 flex flex-col">
           {/* Re-use StudentSidebar logic slightly tweaked for mobile, or just placeholder links for now */}
           <div className="space-y-4">
              <div className="w-full p-4 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/20 font-bold text-center">My Hub</div>
              <div className="w-full p-4 rounded-xl bg-white/5 text-foreground/70 font-bold text-center">Smart Vault (OCR)</div>
              <div className="w-full p-4 rounded-xl bg-white/5 text-foreground/70 font-bold text-center">Live Counseling</div>
           </div>
        </div>
      )}
    </div>
  );
}
