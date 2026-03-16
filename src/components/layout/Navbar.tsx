"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Bell, User, LogOut, Settings } from "lucide-react";

export function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel bg-white/40 dark:bg-zinc-950/40 backdrop-blur-2xl border-b border-white/20 px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      
      {/* Left section: Search */}
      <div className="flex flex-1">
        <div className="relative w-full max-w-md hidden md:block group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-foreground/50 transition-colors group-focus-within:text-violet-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-white/5 text-foreground placeholder-foreground/50 focus:outline-none focus:bg-white/10 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 sm:text-sm transition-all duration-300"
            placeholder="Search courses, instructors, lessons..."
          />
        </div>
      </div>

      {/* Right section: Icons and Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 rounded-full text-foreground/70 hover:bg-white/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">Jane Doe</span>
          </button>

          {/* Dropdown Menu (placeholder styles) */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl glass-panel bg-white/80 dark:bg-zinc-900/80 border border-white/20 shadow-lg py-1 ring-1 ring-black ring-opacity-5 animate-fade-in-up origin-top-right">
              <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-foreground/80 hover:bg-white/10 hover:text-foreground flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <Link href="/login" className="block px-4 py-2 text-sm text-red-500/90 hover:bg-red-500/10 hover:text-red-500 flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Sign out
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
