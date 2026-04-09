import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "How does CollegeVision compare online universities?",
    answer:
      "CollegeVision compares universities using verified fee data, approval visibility, ROI direction, affordability cues and guided detail pages rather than only marketing claims.",
  },
  {
    question: "Does CollegeVision only show UGC-DEB approved options?",
    answer:
      "The platform is designed around safer online and distance degree comparison, with approval visibility treated as one of the most important trust filters.",
  },
  {
    question: "Can I apply after comparing universities?",
    answer:
      "Yes. Students can move from comparison and profile pages into a guided lead and application flow directly from the site.",
  },
  {
    question: "What makes CollegeVision different from a generic aggregator?",
    answer:
      "CollegeVision leans into transparent match logic, ROI context, affordability signals and cleaner decision paths instead of only listing universities.",
  },
  {
    question: "Which pages should I visit first on CollegeVision?",
    answer:
      "Most users start with the homepage AI flow, the university directory, category pages like online MBA or MCA, and the career guides hub.",
  },
];

export const metadata: Metadata = {
  title: "CollegeVision FAQ",
  description:
    "Frequently asked questions about CollegeVision, online university comparison, approvals, ROI and guided application flows.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "CollegeVision FAQ",
    description:
      "Frequently asked questions about CollegeVision, online university comparison, approvals, ROI and guided application flows.",
    url: "https://collegevision.in/faq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CollegeVision FAQ",
    description:
      "Frequently asked questions about CollegeVision, online university comparison, approvals, ROI and guided application flows.",
  },
};

export default function FaqPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://collegevision.in" },
      { "@type": "ListItem", position: 2, name: "FAQ", item: "https://collegevision.in/faq" },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600">FAQ</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              Questions students ask before trusting an online degree platform.
            </h1>
            <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base">
              This page helps students, parents and search engines understand what CollegeVision does, how it compares
              universities, and where to go next for deeper research.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-4">
          {faqItems.map((item) => (
            <div key={item.question} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">{item.question}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Next pages to visit</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { href: "/universities", label: "University Directory" },
              { href: "/blog", label: "Career Guides" },
              { href: "/online-mba", label: "Online MBA Pages" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-900">{item.label}</p>
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </div>
                <p className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Recommended next step
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
