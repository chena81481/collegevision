"use client";

import React from 'react';

const PARTNERS = [
  {
    name: "Manipal University",
    color: "#F26F21",
    logo: (
      <svg className="h-8 w-auto" viewBox="0 0 220 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4L4 12V28L12 36L20 28V12L12 4Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12V28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M8 18H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <text x="32" y="32" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="18" fill="currentColor" letterSpacing="0.05em">MANIPAL</text>
        <text x="32" y="42" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="8" fill="currentColor" opacity="0.6" letterSpacing="0.1em">UNIVERSITY</text>
      </svg>
    )
  },
  {
    name: "Symbiosis",
    color: "#800000",
    logo: (
      <svg className="h-8 w-auto" viewBox="0 0 220 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="24" r="10" stroke="currentColor" strokeWidth="2.5" />
        <path d="M15 14C17.5 19 12.5 24 15 29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <text x="34" y="32" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="18" fill="currentColor" letterSpacing="0.05em">SYMBIOSIS</text>
        <text x="34" y="42" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="8" fill="currentColor" opacity="0.6" letterSpacing="0.15em">INTERNATIONAL</text>
      </svg>
    )
  },
  {
    name: "Amity University",
    color: "#F47A20",
    logo: (
      <svg className="h-8 w-auto" viewBox="0 0 220 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 34L15 8L24 34H6Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 24H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <text x="34" y="32" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="18" fill="currentColor" letterSpacing="0.05em">AMITY</text>
        <text x="34" y="42" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="8" fill="currentColor" opacity="0.6" letterSpacing="0.1em">UNIVERSITY</text>
      </svg>
    )
  },
  {
    name: "Jain University",
    color: "#0072BC",
    logo: (
      <svg className="h-8 w-auto" viewBox="0 0 220 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="14" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <path d="M15 19V29M12 29H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <text x="34" y="32" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="18" fill="currentColor" letterSpacing="0.05em">JAIN</text>
        <text x="34" y="42" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="8" fill="currentColor" opacity="0.6" letterSpacing="0.1em">ONLINE</text>
      </svg>
    )
  },
  {
    name: "LPU",
    color: "#E31E24",
    logo: (
      <svg className="h-8 w-auto" viewBox="0 0 220 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 6L25 24L15 42L5 24L15 6Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="15" cy="24" r="3" fill="currentColor" />
        <text x="34" y="32" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="18" fill="currentColor" letterSpacing="0.05em">LPU</text>
        <text x="34" y="42" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="8" fill="currentColor" opacity="0.6" letterSpacing="0.1em">UNIVERSITY</text>
      </svg>
    )
  }
];

export default function PartnerLogos() {
  return (
    <div className="w-full mt-6">
      <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 md:gap-x-16">
        {PARTNERS.map((partner, i) => (
          <div 
            key={i} 
            className="h-10 flex items-center transition-all duration-300 text-slate-400 hover:scale-105"
            style={{ 
              ['--hover-color' as any]: partner.color 
            }}
          >
            <div className="hover:text-[var(--hover-color)] transition-colors duration-300">
              {partner.logo}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
