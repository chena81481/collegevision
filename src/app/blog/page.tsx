import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { blogArticles } from "@/lib/content/blog";

export const metadata: Metadata = {
  title: "Career Guides and Online Degree Advice",
  description:
    "Explore CollegeVision career guides on online MBA, MCA, UGC-DEB approved universities, ROI and choosing the right online degree in India.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "CollegeVision Career Guides and Online Degree Advice",
    description:
      "Read practical guides on comparing online degrees, university approvals, ROI and career-fit decisions.",
    url: "https://collegevision.in/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CollegeVision Career Guides and Online Degree Advice",
    description:
      "Read practical guides on comparing online degrees, university approvals, ROI and career-fit decisions.",
  },
};

export default function BlogHubPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://collegevision.in" },
      { "@type": "ListItem", position: 2, name: "Career Guides", item: "https://collegevision.in/blog" },
    ],
  };

  const blogListingJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "CollegeVision Career Guides",
    url: "https://collegevision.in/blog",
    hasPart: blogArticles.map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      url: `https://collegevision.in/blog/${article.slug}`,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListingJsonLd) }}
      />

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-32">
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600">Career Guides</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              Practical online degree guides for students who want better decisions.
            </h1>
            <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base">
              This content hub is built to answer high-intent questions around online MBA, MCA, approvals, ROI, and
              working-professional degree selection. It gives CollegeVision stronger topic pages and gives students
              cleaner answers than generic aggregator copy.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              "approval-first comparisons",
              "ROI and fee decision frameworks",
              "career outcome and role-fit guides",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {blogArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                  {article.category}
                </span>
                <BookOpen className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
              </div>
              <h2 className="mt-4 text-xl font-black leading-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{article.description}</p>
              <div className="mt-5 flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                <span>{article.readTime}</span>
                <span className="inline-flex items-center gap-2 text-blue-600">
                  Read guide <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-2xl font-black text-slate-900">Why this helps search visibility too</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Google generally needs clear destination pages before it can reward a site with richer branded search
                experiences. These guides give CollegeVision deeper topical pages that support both search discovery and
                user trust.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
