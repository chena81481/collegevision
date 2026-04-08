"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { Menu, X, Bell, Search, GraduationCap, LayoutDashboard, Sparkles, FolderLock, Route, Video } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [studentName, setStudentName] = React.useState("Student");
  const supabase = createClient();
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Matches", href: "/student/matches", icon: Sparkles },
    { name: "Documents", href: "/student/documents", icon: FolderLock },
    { name: "Applications", href: "/student/applications", icon: Route },
    { name: "Counseling", href: "/student/counseling", icon: Video },
  ];

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setStudentName(user.user_metadata.full_name?.split(" ")[0] || user.email?.split("@")[0] || "Student");
      }
    };
    fetchUser();
  }, [supabase]);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
        <div className="flex-1 p-4 pb-24 md:p-8 md:pb-8 overflow-y-auto">
          {children}
        </div>

      </main>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl pt-20 px-4 pb-6 flex flex-col">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 mb-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-400 mb-2">Student Space</p>
            <p className="text-lg font-black">Hi, {studentName}</p>
            <p className="text-sm text-foreground/60">Navigate your dashboard, documents, and counseling from here.</p>
          </div>
          <div className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-4 font-bold transition-all ${
                    isActive
                      ? "border-violet-500/30 bg-violet-600/20 text-violet-300"
                      : "border-white/10 bg-white/5 text-foreground/75"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-background/95 backdrop-blur-2xl px-2 py-2">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[10px] font-black transition-all ${
                  isActive ? "bg-violet-600/20 text-violet-400" : "text-foreground/60"
                }`}
              >
                <Icon className="mb-1 h-4 w-4" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
