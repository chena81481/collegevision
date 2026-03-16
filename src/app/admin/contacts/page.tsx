"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, 
  Search, Bell, Plus, Filter, Loader2,
  Building2, UserPlus, Download
} from 'lucide-react';
import { fetchContacts } from '@/app/actions/crm';
import ContactsTable from '@/components/crm/ContactsTable';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    setLoading(true);
    try {
      const data = await fetchContacts();
      setContacts(data as any);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      
      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex h-screen sticky top-0 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="font-bold text-xl tracking-tight text-white">CollegeVision<span className="text-blue-500">.</span></div>
        </div>
        
        <div className="p-4 flex-1 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 mt-4 px-2">Counselor Desk</div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
            <Users className="w-4 h-4" /> Lead Pipeline
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600/10 text-blue-400 transition-colors text-sm font-medium">
            <Users className="w-4 h-4" /> Contacts
          </button>
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
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-900">Contacts & Accounts</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200 uppercase">
              Live Database
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-all">
              <Download className="w-4 h-4" /> Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm shadow-blue-200">
              <UserPlus className="w-4 h-4" /> New Contact
            </button>
          </div>
        </div>

        {/* PAGE BODY */}
        <div className="flex-1 overflow-hidden p-8 flex flex-col">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Contacts</div>
              <div className="text-3xl font-black text-slate-900">{contacts.length}</div>
              <div className="mt-2 text-[10px] text-green-600 font-bold flex items-center gap-1">↑ 12% from last month</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Accounts</div>
              <div className="text-3xl font-black text-slate-900">42</div>
              <div className="mt-2 text-[10px] text-blue-600 font-bold flex items-center gap-1">8 New this week</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Lead Engagement</div>
              <div className="text-3xl font-black text-slate-900">84%</div>
              <div className="mt-2 text-[10px] text-purple-600 font-bold flex items-center gap-1">High capture rate</div>
            </div>
          </div>

          {/* TABLE AREA */}
          <div className="flex-1 relative overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl z-20">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-500">Retrieving records...</p>
                </div>
              </div>
            ) : null}
            
            <ContactsTable data={contacts} />
          </div>

        </div>
      </div>
    </div>
  );
}
