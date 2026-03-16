"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Sparkles, FolderLock, Route, Video, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/app/actions/auth";

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<{ name: string; avatar: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const metadata = user.user_metadata;
        setProfile({
          name: metadata.full_name || user.email?.split("@")[0] || "User",
          avatar: `https://ui-avatars.com/api/?name=${metadata.full_name || user.email}&background=random`,
        });
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { name: "My Hub", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "AI Matches", href: "/student/matches", icon: Sparkles },
    { name: "Smart Vault (OCR)", href: "/student/documents", icon: FolderLock },
    { name: "Application Status", href: "/student/applications", icon: Route },
    { name: "Live Counseling", href: "/student/counseling", icon: Video },
  ];

  return (
    <aside className="w-64 h-screen hidden md:flex flex-col bg-background/50 backdrop-blur-3xl border-r border-white/5 pt-20 pb-8 px-4 fixed top-0 left-0">
      
      {/* Gamified Mini-Profile */}
      <div className="mb-8 p-4 rounded-3xl glass-panel bg-white/5 border border-white/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-violet-500 to-fuchsia-500">
            <img src={profile?.avatar || "https://ui-avatars.com/api/?name=User&background=random"} className="w-full h-full rounded-full border-2 border-background" alt="avatar"/>
          </div>
          <div>
            <h4 className="font-bold text-sm truncate max-w-[120px]">{profile?.name || "Loading..."}</h4>
            <p className="text-xs text-emerald-400 font-bold">Profile: 40%</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm group ${
                  isActive
                    ? "bg-violet-600/20 text-violet-400 border border-violet-500/20 shadow-lg shadow-violet-500/10"
                    : "text-foreground/70 hover:bg-white/5 hover:text-foreground border border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button 
        onClick={handleSignOut}
        className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium text-sm border border-transparent"
      >
        <LogOut className="w-5 h-5" />
        <span>Sign Out</span>
      </button>
    </aside>
  );
}
