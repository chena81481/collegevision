"use client";

import React, { useState, useEffect, use } from 'react';
import { 
  ArrowLeft, Phone, Mail, MessageCircle, 
  MapPin, Building, Calendar, Clock, 
  Plus, MoreVertical, Send, Loader2,
  FileText, CheckCircle2, AlertCircle, PhoneCall
} from 'lucide-react';
import { fetchContactDetails, createActivity } from '@/app/actions/crm';
import Link from 'next/link';

export default function ContactDetailView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [id]);

  async function loadDetails() {
    setLoading(true);
    try {
      const data = await fetchContactDetails(id);
      setContact(data);
    } catch (error) {
      console.error("Failed to load contact details:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      await createActivity({
        contact_id: id,
        type: 'Note',
        description: newNote,
      });
      setNewNote('');
      loadDetails();
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setSavingNote(false);
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Contact not found</h2>
        <Link href="/admin/pipeline" className="mt-4 text-blue-600 hover:underline text-sm font-medium">
          Return to Pipeline
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">
      
      {/* HEADERBAR */}
      <div className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/contacts" className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none">{contact.first_name} {contact.last_name}</h1>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1">
              Contact Record • ID: {id.slice(0,8)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-all">
            Edit Profile
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm shadow-blue-200">
            Apply to Course
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: STATIC INFO */}
        <div className="w-[380px] border-r border-slate-200 bg-white overflow-y-auto custom-scrollbar p-8 shrink-0">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-100 mb-4">
              {contact.first_name[0]}{contact.last_name?.[0]}
            </div>
            <h2 className="text-xl font-black text-slate-900">{contact.first_name} {contact.last_name}</h2>
            <div className="text-sm font-bold text-blue-600 mb-1">{contact.job_title}</div>
            {contact.companies && (
              <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                <Building className="w-3.5 h-3.5" /> {contact.companies.name}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Contact Information</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-medium text-slate-600">{contact.email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-medium text-slate-600">{contact.phone}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Associated Deals</div>
              {contact.deals?.length > 0 ? (
                <div className="space-y-3">
                  {contact.deals.map((deal: any) => (
                    <div key={deal.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="text-sm font-bold text-slate-900 mb-1">{deal.name}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">{deal.stage}</div>
                        <div className="text-sm font-black text-slate-700">₹{deal.amount?.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400 italic">No deals found</div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN COLUMN: ACTIVITY FEED */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Action Toolbar */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-bold transition-all border border-green-100">
              <PhoneCall className="w-3.5 h-3.5" /> Log Call
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all border border-blue-100">
              <Mail className="w-3.5 h-3.5" /> Send Email
            </button>
            <a 
              href={`https://wa.me/${contact.phone?.replace(/[^0-9]/g, '')}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-xl text-xs font-bold transition-all border border-[#25D366]/20"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <div className="ml-auto flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                <Plus className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feed Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 bg-slate-50/30">
            
            {/* Note Input */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
              <textarea 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type a note or log an internal update..."
                className="w-full h-24 p-0 bg-transparent border-none outline-none resize-none text-sm text-slate-600 placeholder:text-slate-400"
              />
              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><FileText className="w-4 h-4" /></button>
                </div>
                <button 
                  onClick={handleAddNote}
                  disabled={savingNote || !newNote.trim()}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Save Note
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Activity Stream</div>
              
              {contact.activities?.length > 0 ? (
                <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100">
                  {contact.activities.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((activity: any) => (
                    <div key={activity.id} className="relative pl-12">
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-[#F8FAFC] bg-white flex items-center justify-center shadow-sm z-10">
                        {activity.type === 'Note' && <FileText className="w-4 h-4 text-amber-500" />}
                        {activity.type === 'Call' && <Phone className="w-4 h-4 text-green-500" />}
                        {activity.type === 'Email' && <Mail className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-bold text-slate-900">{activity.type}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {new Date(activity.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No activity history yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
