import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { getPillarPage, pillarPages } from "@/lib/content/pillars";

export function generateStaticParams() {
  return pillarPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getPillarPage(slug);

  if (!page) {
    return { title: "Ranking Page Not Found" };
  }

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/rankings/${page.slug}`,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `https://collegevision.in/rankings/${page.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}

export default async function RankingPillarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getPillarPage(slug);

  if (!page) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://collegevision.in" },
      { "@type": "ListItem", position: 2, name: "Rankings", item: "https://collegevision.in/rankings" },
      { "@type": "ListItem", position: 3, name: page.title, item: `https://collegevision.in/rankings/${page.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" />
          Back to CollegeVision
        </Link>

        <section className="mt-6 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600">{page.label}</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">{page.title}</h1>
            <p className="mt-5 text-base leading-8 text-slate-600">{page.description}</p>
          </div>

          <div className="mt-8 rounded-[2rem] border border-blue-100 bg-blue-50/70 p-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-blue-600">
              <Sparkles className="h-4 w-4" />
              Why this page exists
            </div>
            <p className="mt-4 text-sm leading-8 text-slate-700">{page.intro}</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {page.bullets.map((bullet) => (
              <div key={bullet} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-start gap-2 text-sm font-black text-slate-900">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {bullet}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Best next links from this pillar page</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {page.relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-[2rem] border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-900">{link.label}</p>
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
