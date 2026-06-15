"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Programs",
    links: [
      ["Online MBA", "/online-mba"],
      ["Online MCA", "/online-mca"],
      ["Online BBA", "/online-bba"],
      ["Online BCA", "/online-bca"],
    ],
  },
  {
    title: "Universities",
    links: [
      ["All Universities", "/universities"],
      ["Amity Online", "/universities/amity-online"],
      ["Jain Online", "/universities/jain-online"],
      ["LPU Online", "/universities/lpu-online"],
    ],
  },
  {
    title: "Rankings",
    links: [
      ["Best Online MBA", "/rankings/best-online-mba-colleges-in-india-2026"],
      ["Best Online MCA", "/rankings/best-online-mca-colleges-in-india-2026"],
      ["Best Online BBA", "/rankings/best-online-bba-colleges-in-india-2026"],
      ["Best Online BCA", "/rankings/best-online-bca-colleges-in-india-2026"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["UGC-DEB Guide", "/blog/ugc-deb-approved-online-universities-guide"],
      ["Compare Tool", "/compare"],
      ["Career Blog", "/blog"],
      ["FAQs", "/faq"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Contact", "/faq"],
      ["Privacy", "/privacy"],
      ["Terms", "/privacy"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.2fr_3fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl shadow-sm">
              <img src="/icon.png" alt="CollegeVision Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-2xl font-black tracking-normal text-slate-900">
              College<span className="text-blue-600">Vision</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm font-medium leading-relaxed text-slate-600">
            Compare online universities with verified approvals, fees, ROI, scholarships, and placement support.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-blue-600 hover:text-blue-600">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-blue-600 hover:text-blue-600">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-black text-slate-900">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-4 border-t border-slate-200 pt-8 text-sm font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 CollegeVision. All rights reserved.</p>
        <p>UGC approval data | Verified university profiles | Student-first comparisons</p>
      </div>
    </footer>
  );
}
