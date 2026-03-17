"use client";

import React, { useState } from 'react';
import { ChevronDown, Sparkles, BarChart3, BookOpen, GraduationCap, LifeBuoy, Users, Info, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_DATA = [
  {
    label: "Platform",
    links: [
      { label: "Features", href: "/#features", icon: <Sparkles className="w-4 h-4" /> },
      { label: "How It Works", href: "/how-it-works", icon: <Info className="w-4 h-4" /> },
      { label: "Pricing", href: "/pricing", icon: <GraduationCap className="w-4 h-4" /> },
      { label: "Success Stories", href: "/success-stories", icon: <Users className="w-4 h-4" /> },
    ]
  },
  {
    label: "Tools",
    links: [
      { label: "ROI Calculator", href: "/#roi-calculator", icon: <BarChart3 className="w-4 h-4" /> },
      { label: "Comparison Tool", href: "/compare", icon: <BookOpen className="w-4 h-4" /> },
      { label: "Career Guides", href: "/guides", icon: <LifeBuoy className="w-4 h-4" /> },
    ]
  },
  { label: "Universities", href: "/colleges" },
  { label: "Resources", href: "/blog" }
];

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 h-16 flex items-center">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-black tracking-tighter text-blue-600 flex items-center gap-1 group">
          COLLEGE<span className="text-slate-900 group-hover:text-blue-600 transition-colors">VISION</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_DATA.map((item) => (
            <div 
              key={item.label}
              className="relative group h-16 flex items-center"
              onMouseEnter={() => setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-blue-600 cursor-pointer transition-colors py-2">
                {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
                {item.links && <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />}
              </div>

              {/* Mega Dropdown */}
              <AnimatePresence>
                {item.links && activeDropdown === item.label && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-50"
                  >
                    {item.links.map((link) => (
                      <Link 
                        key={link.label} 
                        href={link.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all group/item"
                      >
                        <div className="p-2 bg-slate-50 group-hover/item:bg-white rounded-lg shadow-sm">
                          {link.icon}
                        </div>
                        <span className="text-xs font-bold">{link.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/signin" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-blue-600">
            Sign In
          </Link>
          <Link href="/match" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-95">
            Start Free
          </Link>
          <button 
            className="lg:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 top-16 bg-white z-[90] lg:hidden overflow-y-auto p-6"
          >
            <div className="flex flex-col gap-8">
              {NAV_DATA.map((item) => (
                <div key={item.label} className="space-y-4">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {item.label}
                  </div>
                  {item.links ? (
                    <div className="grid grid-cols-1 gap-2">
                      {item.links.map((link) => (
                        <Link 
                          key={link.label}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 text-slate-900 font-bold text-sm"
                        >
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            {link.icon}
                          </div>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link 
                      href={item.href || '#'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-lg font-black text-slate-900"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
