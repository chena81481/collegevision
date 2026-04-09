import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { pillarPages } from "@/lib/content/pillars";

export const metadata: Metadata = {
  title: "Best Online Degree Rankings 2026",
  description:
    "Explore CollegeVision ranking pages for the best online MBA, MCA, BBA and BCA colleges in India for 2026.",
  alternates: {
    canonical: "/rankings",
  },
  openGraph: {
    title: "Best Online Degree Rankings 2026",
    description:
      "Explore CollegeVision ranking pages for the best online MBA, MCA, BBA and BCA colleges in India for 2026.",
    url: "https://collegevision.in/rankings",
    type: "website",
  },
};

export default function RankingsHubPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600">Rankings Hub</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            Best online degree rankings in India for 2026.
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            These pages exist as strong search-intent landing pages for students looking for “best online MBA”, “best
            online MCA”, “best online BBA” and “best online BCA” routes before they move into deeper comparison.
          </p>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pillarPages.map((page) => (
            <Link
              key={page.slug}
              href={`/rankings/${page.slug}`}
              className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                  {page.label}
                </span>
                <Trophy className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
              </div>
              <h2 className="mt-4 text-xl font-black leading-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                {page.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{page.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Open pillar page <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
