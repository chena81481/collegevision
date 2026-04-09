import { MetadataRoute } from "next";
import { createAdminClient } from "@/utils/supabase/admin";
import { blogArticles } from "@/lib/content/blog";
import { pillarPages } from "@/lib/content/pillars";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl =
  configuredSiteUrl && !configuredSiteUrl.includes("localhost")
    ? configuredSiteUrl
    : "https://collegevision.in";
const now = new Date();

const staticRoutes = [
  "",
  "/universities",
  "/explore",
  "/blog",
  "/faq",
  "/rankings",
  "/privacy",
  "/online-mba",
  "/online-mca",
  "/online-bba",
  "/online-bca",
  "/online-ba",
  "/online-bcom",
  "/online-mcom",
  "/online-ma",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries: MetadataRoute.Sitemap = staticRoutes.map((path, index) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: index === 0 ? 1 : path === "/universities" ? 0.95 : 0.85,
  }));

  try {
    const supabase = createAdminClient();

    const [{ data: universities }, { data: courses }] = await Promise.all([
      supabase.from("universities").select("id, slug"),
      supabase.from("courses").select("university_id, category"),
    ]);

    const universityList = universities ?? [];
    const courseList = courses ?? [];

    const categorySlugs = Array.from(
      new Set(
        courseList
          .map((course) => course.category)
          .filter(Boolean)
          .map((category) => String(category).toLowerCase().replace(/\s+/g, "-"))
      )
    );

    const categoryEntries: MetadataRoute.Sitemap = categorySlugs.map((category) => ({
      url: `${siteUrl}/${category}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    const genericUniversityEntries: MetadataRoute.Sitemap = universityList.map((university) => ({
      url: `${siteUrl}/universities/${university.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const courseCategoriesByUniversity = new Map<string, Set<string>>();
    for (const course of courseList) {
      if (!course.university_id || !course.category) continue;
      const categorySlug = String(course.category).toLowerCase().replace(/\s+/g, "-");
      if (!courseCategoriesByUniversity.has(course.university_id)) {
        courseCategoriesByUniversity.set(course.university_id, new Set());
      }
      courseCategoriesByUniversity.get(course.university_id)?.add(categorySlug);
    }

    const categoryUniversityEntries: MetadataRoute.Sitemap = universityList.flatMap((university) => {
      const categories = courseCategoriesByUniversity.get(university.id) ?? new Set(["online-degrees"]);
      return Array.from(categories).map((category) => ({
        url: `${siteUrl}/${category}/${university.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.78,
      }));
    });

    const allEntries = [
      ...baseEntries,
      ...blogArticles.map((article) => ({
        url: `${siteUrl}/blog/${article.slug}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.72,
      })),
      ...pillarPages.map((page) => ({
        url: `${siteUrl}/rankings/${page.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.74,
      })),
      ...categoryEntries,
      ...genericUniversityEntries,
      ...categoryUniversityEntries,
    ];

    const seen = new Set<string>();
    return allEntries.filter((entry) => {
      if (seen.has(entry.url)) return false;
      seen.add(entry.url);
      return true;
    });
  } catch (error) {
    console.error("[sitemap] Falling back to static routes:", error);
    return baseEntries;
  }
}
