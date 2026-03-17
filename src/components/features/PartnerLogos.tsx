"use client";

import React from 'react';

const PARTNERS = [
  { name: "Manipal University", logo: "https://upload.wikimedia.org/wikipedia/en/3/3a/Manipal_University_logo.png" },
  { name: "Symbiosis", logo: "https://upload.wikimedia.org/wikipedia/en/b/b3/Symbiosis_International_University_logo.png" },
  { name: "Amity University", logo: "https://upload.wikimedia.org/wikipedia/en/e/e0/Amity_University_logo.png" },
  { name: "Jain University", logo: "https://upload.wikimedia.org/wikipedia/en/f/f6/Jain_University_logo.png" },
  { name: "LPU", logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Lovely_Professional_University_logo.png" }
];

export default function PartnerLogos() {
  return (
    <div className="mt-12 py-8 border-t border-slate-100">
      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
        Our Official University Partners
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:opacity-100 transition-all duration-500">
        {PARTNERS.map((partner, i) => (
          <div key={i} className="h-8 md:h-10 flex items-center">
            {/* Using text labels as fallback since exact logos might be broken or slow */}
            <span className="font-black text-slate-800 text-lg md:text-xl tracking-tighter">
              {partner.name.split(' ')[0].toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
