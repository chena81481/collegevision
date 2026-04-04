import { Metadata } from 'next';
import { createAdminClient } from '@/utils/supabase/admin';
import UniversityProfile from './UniversityProfile';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: uni } = await supabase
    .from('universities')
    .select('*, courses(*)')
    .eq('slug', params.slug)
    .single();

  if (!uni) return { title: 'University Not Found' };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": uni.name,
    "description": `Compare and apply for 100% verified online degrees at ${uni.name}. Explore ROI, fees, and placements.`,
    "url": `https://collegevision.in/universities/${uni.slug}`,
    "logo": uni.logo_url,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Online Degree Programs",
      "itemListElement": uni.courses?.map((c: any) => ({
        "@type": "Course",
        "name": c.name,
        "description": `${c.name} program with ${c.avg_ctc_inr / 100000}LPA average placement.`,
        "provider": { "@type": "EducationalOrganization", "name": uni.name }
      }))
    }
  };

  return {
    title: `${uni.name} | Online Degree ROI & Admission`,
    description: `Detailed analysis of ${uni.name} online programs. See break-even timeline, placement partners, and verified UGC-DEB status.`,
    other: {
      'script:ld+json': JSON.stringify(jsonLd)
    }
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const supabase = createAdminClient();
  
  // Fetch primary university data
  const { data: university } = await supabase
    .from('universities')
    .select(`
      *,
      courses (
        *,
        scholarships (*)
      )
    `)
    .eq('slug', params.slug)
    .single();

  if (!university) {
    notFound();
  }

  // Fetch 2 competitors for the "Competitive Comparison" section
  const { data: competitors } = await supabase
    .from('universities')
    .select('name, slug, logo_url, courses(avg_ctc_inr, total_fee_inr)')
    .neq('slug', params.slug)
    .limit(2);

  return (
    <UniversityProfile 
      initialData={university} 
      competitors={competitors || []} 
    />
  );
}
