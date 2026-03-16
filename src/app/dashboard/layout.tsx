"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex bg-background text-foreground overflow-hidden">
      
      {/* Decorative Global Background for Dashboard */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-background/95 border-r border-white/10 shadow-2xl z-50 animate-fade-in-up">
            <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
              <span className="font-bold text-lg text-white">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-foreground/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Render Sidebar content directly inside mobile menu for now */}
            <div className="flex-1 overflow-y-auto w-full [&>div]:w-full [&>div]:border-none [&>div]:bg-transparent [&>div]:backdrop-blur-none">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Mobile Header with Hamburger Menu */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-white/10 bg-background/50 backdrop-blur-md sticky top-0 z-30">
          <div className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
            CollegeVision
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg text-foreground/70 hover:bg-white/10 transition-colors focus:ring-2 focus:ring-violet-500/50"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Global Navbar (Desktop & Tablet) */}
        <div className="hidden lg:block w-full">
          <Navbar />
        </div>

        {/* Page Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-in-up">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}
