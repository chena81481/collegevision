import { MetadataRoute } from 'next';
import { createAdminClient } from '@/utils/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();
  const baseUrl = 'https://collegevision.in';

  // 1. Fetch University & Course data for slugs
  const { data: universities } = await supabase
    .from('universities')
    .select('slug, courses(category)');

  // 2. Generate University Detail URLs (Programmatic)
  const universityUrls: any[] = [];
  (universities || []).forEach(uni => {
    const categories = uni.courses?.map((c: any) => c.category).filter(Boolean) || ['online-degrees'];
    const uniqueCategories = Array.from(new Set(categories));
    
    uniqueCategories.forEach((cat: any) => {
      universityUrls.push({
        url: `${baseUrl}/${cat.toLowerCase().replace(/\s+/g, '-')}/${uni.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  });

  // 3. Generate All Comparison URLs (Programmatic)
  const allUnis = (universities || []);
  const comparisonUrls: any[] = [];
  for (let i = 0; i < allUnis.length; i++) {
    for (let j = i + 1; j < allUnis.length; j++) {
      comparisonUrls.push({
        url: `${baseUrl}/compare/${allUnis[i].slug}-vs-${allUnis[j].slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  // 4. Generate Category Landing URLs
  const allCategories = new Set<string>();
  (universities || []).forEach(uni => {
    uni.courses?.forEach((c: any) => {
      if (c.category) allCategories.add(c.category.toLowerCase().replace(/\s+/g, '-'));
    });
  });
  
  const categoryUrls = Array.from(allCategories).map(cat => ({
    url: `${baseUrl}/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/universities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categoryUrls,
    ...universityUrls,
    ...comparisonUrls,
  ];
}
