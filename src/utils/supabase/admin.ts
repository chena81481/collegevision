import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache';

export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

/**
 * Enterprise-grade Cached Data Fetching
 * Reduces DB load and improves TTFB by caching university records on the Vercel Edge.
 */
export const getCachedUniversityData = (slug: string) => 
  unstable_cache(
    async () => {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('universities')
        .select('*, courses(*)')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    },
    [`university-${slug}`],
    {
      revalidate: 3600, // Cache for 1 hour
      tags: ['universities']
    }
  )();
