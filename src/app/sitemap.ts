import { MetadataRoute } from 'next';
import { MOCK_UNIVERSITIES } from '@/lib/mockData';

export default function sitemap(): MetadataRoute.Sitemap {
  const universityUrls = MOCK_UNIVERSITIES.map((uni) => ({
    url: `https://www.collegevision.com/universities/${uni.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://www.collegevision.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const, // Next.js expects specific union string literals
      priority: 1.0,
    },
    {
      url: 'https://www.collegevision.com/universities',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    ...universityUrls,
  ];
}
