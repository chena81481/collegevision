"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Settings, 
  Search, Bell, Plus, Loader2, BarChart3
} from 'lucide-react';
import { LeadKanbanBoard } from '@/components/leads/LeadKanbanBoard';
import { AddLeadModal } from '@/components/leads/AddLeadModal';
import { GlobalSearch } from '@/components/crm/GlobalSearch';
import { NotificationCenter } from '@/components/crm/NotificationCenter';

export default function AdminPipeline() {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [counselors, setCounselors] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);

  useEffect(() => {
    // Fetch counselors and universities for the modal
    // In a real app, these would be separate API calls or server actions
    const fetchData = async () => {
      try {
        // Mocking for now as Phase 1 didn't specify these APIs
        // But in Phase 2/3 we'll make them real
        setCounselors([
          { id: 'c1', name: 'Priya Desai' },
          { id: 'c2', name: 'Rahul Sharma' }
        ]);
        setUniversities([
          { id: 'u1', name: 'MIT World Peace University' },
          { id: 'u2', name: 'Symbiosis International' }
        ]);
      } catch (error) {
        console.error("Failed to fetch support data", error);
      }
    };
    fetchData();

    // Key shortcut for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      
      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="font-bold text-xl tracking-tight text-white">CollegeVision<span className="text-blue-500">.</span></div>
        </div>
        
        <div className="p-4 flex-1 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 mt-4 px-2">Counselor Desk</div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600/10 text-blue-400 transition-colors text-sm font-medium">
            <Users className="w-4 h-4" /> Lead Pipeline
          </button>
          <a href="/admin/reports" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
            <BarChart3 className="w-4 h-4" /> Advanced Reports
          </a>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
            <GraduationCap className="w-4 h-4" /> Universities
          </button>
        </div>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">PD</div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">Priya Desai</div>
              <div className="text-[10px] text-slate-500">Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-lg font-bold text-slate-900">Lead Pipeline</h1>
            <div className="h-6 w-px bg-slate-200"></div>
            <button 
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 w-64 transition-all text-sm border border-transparent hover:border-slate-200"
            >
              <Search className="w-4 h-4" />
              <span className="font-medium">Search leads... (⌘K)</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-6 w-px bg-slate-200"></div>
            <NotificationCenter counselorId="c1" />
            <button 
              onClick={() => setModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Lead
            </button>
          </div>
        </div>

        {/* KANBAN BOARD AREA */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-8">
          <LeadKanbanBoard />
        </div>
      </div>

      <AddLeadModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        counselors={counselors} 
        universities={universities} 
      />

      <GlobalSearch 
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </div>
  );
}
