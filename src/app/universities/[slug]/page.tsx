import { Metadata } from 'next';
import { createAdminClient } from '@/utils/supabase/admin';
import UniversityProfile from '@/components/features/UniversityProfile';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { trackRoiCalculation, trackStudentActivity } from '@/lib/student-journey';
import { calculateROI } from '@/lib/roi-calculator';

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
        "description": `${c.name} program.`,
        "provider": { "@type": "EducationalOrganization", "name": uni.name }
      }))
    }
  };

  return {
    title: `${uni.name} | Online Degree ROI & Admission`,
    description: `Detailed analysis of ${uni.name} online programs. See break-even timeline, placement partners, and verified UGC-DEB status.`,
    alternates: {
        canonical: `https://collegevision.in/universities/${uni.slug}`
    }
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const supabase = createAdminClient();
  const sessionClient = await createClient();
  
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

  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  // Fetch 2 competitors for the "Competitive Comparison" section
  const { data: competitors } = await supabase
    .from('universities')
    .select('name, slug, logo_url, courses(avg_ctc_inr, total_fee_inr)')
    .neq('slug', params.slug)
    .limit(2);

  const primaryCourse = university.courses?.[0];

  await trackStudentActivity({
    user,
    eventType: 'UNIVERSITY',
    eventName: 'UNIVERSITY_PROFILE_VIEWED',
    pagePath: `/universities/${params.slug}`,
    metadata: {
      university_slug: params.slug,
      course_count: university.courses?.length ?? 0,
    },
  });

  if (primaryCourse?.total_fee_inr && primaryCourse?.avg_ctc_inr) {
    const roiInput = {
      totalFee: primaryCourse.total_fee_inr,
      avgCTC: primaryCourse.avg_ctc_inr,
      currentSalary: 0,
      durationMonths: primaryCourse.duration_months ?? 24,
      placementRate: 80,
      loanInterestRate: primaryCourse.has_zero_cost_emi ? 0 : 9,
      isOnline: true,
    };

    await trackRoiCalculation({
      user,
      universitySlug: university.slug,
      courseId: primaryCourse.id,
      roiInput,
      roiOutput: calculateROI(roiInput),
    });
  }

  return (
    <UniversityProfile 
      initialData={university} 
      competitors={competitors || []} 
    />
  );
}
