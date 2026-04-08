import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { blogArticles, getBlogArticle } from "@/lib/content/blog";

export function generateStaticParams() {
  return blogArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) {
    return { title: "Guide Not Found" };
  }

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://collegevision.in/blog/${article.slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://collegevision.in" },
      { "@type": "ListItem", position: 2, name: "Career Guides", item: "https://collegevision.in/blog" },
      { "@type": "ListItem", position: 3, name: article.title, item: `https://collegevision.in/blog/${article.slug}` },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    url: `https://collegevision.in/blog/${article.slug}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Organization",
      name: "CollegeVision",
    },
    publisher: {
      "@type": "Organization",
      name: "CollegeVision",
    },
  };

  const faqJsonLd = article.faq
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  const relatedArticles = blogArticles.filter((entry) => entry.slug !== article.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" />
          Back to career guides
        </Link>

        <article className="mt-6 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600">{article.heroKicker}</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">{article.title}</h1>
            <p className="mt-5 text-base leading-8 text-slate-600">{article.description}</p>

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {article.publishedAt}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {article.readTime}
              </span>
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-blue-100 bg-blue-50/70 p-6">
            <p className="text-sm leading-8 text-slate-700">{article.sectionIntro}</p>
          </div>

          <div className="mt-10 space-y-10">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">{section.heading}</h2>
                <div className="mt-4 space-y-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-8 text-slate-600 md:text-base">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>

        {article.faq?.length ? (
          <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Frequently asked questions</h2>
            <div className="mt-6 grid gap-4">
              {article.faq.map((item) => (
                <div key={item.question} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-sm font-black text-slate-900">{item.question}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">More guides from CollegeVision</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">Keep building a better shortlist with the next high-intent guide.</p>
            </div>
            <Link href="/blog" className="hidden text-sm font-black text-blue-600 md:inline-flex md:items-center md:gap-2">
              View all guides <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {relatedArticles.map((entry) => (
              <Link
                key={entry.slug}
                href={`/blog/${entry.slug}`}
                className="group rounded-[2rem] border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-lg"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">{entry.category}</p>
                <p className="mt-3 text-lg font-black leading-tight text-slate-900 group-hover:text-blue-600">{entry.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{entry.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
