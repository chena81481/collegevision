"use client";

import React from 'react';
import { ShieldCheck, Eye, PhoneOff, Award } from 'lucide-react';

export default function ContextualTrustBadges() {
  const badges = [
    {
      icon: <Award className="w-5 h-5 text-blue-600" />,
      title: "UGC-DEB Approved",
      desc: "Every degree is verified by India's official govt. regulator."
    },
    {
      icon: <Eye className="w-5 h-5 text-emerald-600" />,
      title: "100% Transparent",
      desc: "Real placement CTC, total costs, & no hidden charges."
    },
    {
      icon: <PhoneOff className="w-5 h-5 text-rose-600" />,
      title: "0 Spam Calls",
      desc: "No university contact without your explicit permission."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto px-6">
      {badges.map((badge, i) => (
        <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left group">
          <div className="mb-3 p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
            {badge.icon}
          </div>
          <h4 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
            {badge.title}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
            {badge.desc}
          </p>
        </div>
      ))}
    </div>
  );
}
