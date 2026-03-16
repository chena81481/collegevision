"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, UserCircle, Settings, LogOut, ChevronRight } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Learning", href: "/dashboard/learning", icon: BookOpen },
    { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 glass-panel bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl border-r border-white/20">
        
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 drop-shadow-sm">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-violet-500/30">
              V
            </div>
            CollegeVision
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-1 flex-col overflow-y-auto pt-6 px-4">
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300
                    ${isActive 
                      ? "bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 shadow-sm shadow-violet-500/5" 
                      : "text-foreground/70 hover:bg-white/10 hover:text-foreground border border-transparent"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${isActive ? "text-violet-500" : "text-foreground/50 group-hover:text-foreground/80"}`} />
                    {item.name}
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-violet-500 opacity-50" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Action Area */}
        <div className="flex shrink-0 border-t border-white/10 p-4">
          <Link
            href="/login"
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5 opacity-80" />
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  );
}
