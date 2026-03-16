/**
 * CollegeVision – Supabase Seed Script
 * Populates the `universities` and `courses` tables with real starter data.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requirements:
 *   - .env.local must contain NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local from the project root regardless of cwd
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// ─── University Data ──────────────────────────────────────────────────────────

const universities = [
  {
    name: 'Symbiosis SCDL',
    slug: 'symbiosis-scdl',
    logo_url: null,
    gradient_start: 'from-teal-50',
    gradient_end: 'to-white',
    is_premium: true,
  },
  {
    name: 'Amity Online University',
    slug: 'amity-online',
    logo_url: null,
    gradient_start: 'from-orange-50',
    gradient_end: 'to-white',
    is_premium: true,
  },
  {
    name: 'IIT Patna',
    slug: 'iit-patna',
    logo_url: null,
    gradient_start: 'from-purple-50',
    gradient_end: 'to-white',
    is_premium: true,
  },
  {
    name: 'Manipal Online',
    slug: 'manipal-online',
    logo_url: null,
    gradient_start: 'from-blue-50',
    gradient_end: 'to-white',
    is_premium: false,
  },
  {
    name: 'LPU Online',
    slug: 'lpu-online',
    logo_url: null,
    gradient_start: 'from-red-50',
    gradient_end: 'to-white',
    is_premium: false,
  },
  {
    name: 'NMIMS Global Access',
    slug: 'nmims-global',
    logo_url: null,
    gradient_start: 'from-rose-50',
    gradient_end: 'to-white',
    is_premium: true,
  },
  {
    name: 'Jain Online University',
    slug: 'jain-online',
    logo_url: null,
    gradient_start: 'from-indigo-50',
    gradient_end: 'to-white',
    is_premium: false,
  },
];

// ─── Course Data (keyed by university slug for easy lookup) ───────────────────

const coursesBySlug: Record<string, Omit<Course, 'university_id'>[]> = {
  'symbiosis-scdl': [
    {
      name: 'Online MBA',
      degree_level: 'Masters',
      duration_months: 24,
      total_fee_inr: 150_000,
      avg_ctc_inr: 750_000,
      has_zero_cost_emi: true,
      approvals: ['UGC-DEB', 'AICTE'],
      badge_label: 'Top ROI',
    },
    {
      name: 'Online PGDBA',
      degree_level: 'PG Diploma',
      duration_months: 12,
      total_fee_inr: 85_000,
      avg_ctc_inr: 550_000,
      has_zero_cost_emi: true,
      approvals: ['UGC-DEB'],
      badge_label: 'Budget Friendly',
    },
  ],
  'amity-online': [
    {
      name: 'Online MBA Finance',
      degree_level: 'Masters',
      duration_months: 24,
      total_fee_inr: 175_000,
      avg_ctc_inr: 850_000,
      has_zero_cost_emi: true,
      approvals: ['UGC', 'NAAC A+'],
      badge_label: 'High Placement',
    },
    {
      name: 'Online MBA Marketing',
      degree_level: 'Masters',
      duration_months: 24,
      total_fee_inr: 175_000,
      avg_ctc_inr: 780_000,
      has_zero_cost_emi: true,
      approvals: ['UGC', 'NAAC A+'],
      badge_label: null,
    },
    {
      name: 'Online BBA',
      degree_level: 'Bachelors',
      duration_months: 36,
      total_fee_inr: 130_000,
      avg_ctc_inr: 420_000,
      has_zero_cost_emi: true,
      approvals: ['UGC', 'NAAC A+'],
      badge_label: null,
    },
  ],
  'iit-patna': [
    {
      name: 'Online B.Sc Data Science',
      degree_level: 'Bachelors',
      duration_months: 36,
      total_fee_inr: 230_000,
      avg_ctc_inr: 1_050_000,
      has_zero_cost_emi: false,
      approvals: ['UGC', 'Institute of Excellence'],
      badge_label: 'Premium Data',
    },
  ],
  'manipal-online': [
    {
      name: 'Online MBA',
      degree_level: 'Masters',
      duration_months: 24,
      total_fee_inr: 175_000,
      avg_ctc_inr: 720_000,
      has_zero_cost_emi: true,
      approvals: ['UGC-DEB', 'AICTE', 'NAAC A+'],
      badge_label: null,
    },
    {
      name: 'Online MBA HR Management',
      degree_level: 'Masters',
      duration_months: 24,
      total_fee_inr: 175_000,
      avg_ctc_inr: 680_000,
      has_zero_cost_emi: true,
      approvals: ['UGC-DEB', 'AICTE', 'NAAC A+'],
      badge_label: null,
    },
    {
      name: 'Online MCA',
      degree_level: 'Masters',
      duration_months: 24,
      total_fee_inr: 160_000,
      avg_ctc_inr: 890_000,
      has_zero_cost_emi: true,
      approvals: ['UGC-DEB', 'AICTE'],
      badge_label: 'High Placement',
    },
  ],
  'lpu-online': [
    {
      name: 'Online BBA',
      degree_level: 'Bachelors',
      duration_months: 36,
      total_fee_inr: 90_000,
      avg_ctc_inr: 380_000,
      has_zero_cost_emi: true,
      approvals: ['UGC'],
      badge_label: 'Budget Friendly',
    },
    {
      name: 'Online MBA',
      degree_level: 'Masters',
      duration_months: 24,
      total_fee_inr: 120_000,
      avg_ctc_inr: 620_000,
      has_zero_cost_emi: true,
      approvals: ['UGC'],
      badge_label: null,
    },
    {
      name: 'Online BCA',
      degree_level: 'Bachelors',
      duration_months: 36,
      total_fee_inr: 80_000,
      avg_ctc_inr: 450_000,
      has_zero_cost_emi: true,
      approvals: ['UGC'],
      badge_label: null,
    },
  ],
  'nmims-global': [
    {
      name: 'Online MBA Marketing',
      degree_level: 'Masters',
      duration_months: 24,
      total_fee_inr: 240_000,
      avg_ctc_inr: 920_000,
      has_zero_cost_emi: false,
      approvals: ['UGC', 'AICTE'],
      badge_label: null,
    },
    {
      name: 'Online MBA Finance',
      degree_level: 'Masters',
      duration_months: 24,
      total_fee_inr: 240_000,
      avg_ctc_inr: 960_000,
      has_zero_cost_emi: false,
      approvals: ['UGC', 'AICTE'],
      badge_label: 'High Placement',
    },
  ],
  'jain-online': [
    {
      name: 'Online MBA',
      degree_level: 'Masters',
      duration_months: 24,
      total_fee_inr: 145_000,
      avg_ctc_inr: 640_000,
      has_zero_cost_emi: true,
      approvals: ['UGC-DEB', 'NAAC A'],
      badge_label: null,
    },
    {
      name: 'Online BBA',
      degree_level: 'Bachelors',
      duration_months: 36,
      total_fee_inr: 95_000,
      avg_ctc_inr: 390_000,
      has_zero_cost_emi: true,
      approvals: ['UGC-DEB', 'NAAC A'],
      badge_label: 'Budget Friendly',
    },
    {
      name: 'Online MCA',
      degree_level: 'Masters',
      duration_months: 24,
      total_fee_inr: 155_000,
      avg_ctc_inr: 820_000,
      has_zero_cost_emi: true,
      approvals: ['UGC-DEB', 'NAAC A', 'AICTE'],
      badge_label: null,
    },
  ],
};

// ─── Type helper ─────────────────────────────────────────────────────────────
interface Course {
  university_id: string;
  name: string;
  degree_level: string;
  duration_months: number;
  total_fee_inr: number;
  avg_ctc_inr: number | null;
  has_zero_cost_emi: boolean;
  approvals: string[];
  badge_label: string | null;
}

// ─── Seeding Logic ────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting CollegeVision seed...\n');

  // 1. Insert universities
  console.log('📚 Inserting universities...');
  const { data: insertedUniversities, error: uniError } = await supabase
    .from('universities')
    .upsert(universities, { onConflict: 'slug' })
    .select('id, slug, name');

  if (uniError) {
    console.error('❌ Failed to insert universities:', uniError.message);
    process.exit(1);
  }

  console.log(`   ✅ ${insertedUniversities!.length} universities upserted.\n`);

  // Build slug → id map
  const slugToId = Object.fromEntries(
    insertedUniversities!.map((u) => [u.slug, u.id])
  );

  // 2. Build flat courses array
  const allCourses: Course[] = [];
  for (const [slug, courses] of Object.entries(coursesBySlug)) {
    const universityId = slugToId[slug];
    if (!universityId) {
      console.warn(`   ⚠️  No ID found for slug: ${slug}, skipping.`);
      continue;
    }
    for (const course of courses) {
      allCourses.push({ university_id: universityId, ...course });
    }
  }

  // 3. Insert courses (upsert not possible without unique constraint — use insert + ignore duplicates)
  console.log('🎓 Inserting courses...');
  const { data: insertedCourses, error: courseError } = await supabase
    .from('courses')
    .insert(allCourses)
    .select('id, name');

  if (courseError) {
    // If courses already exist, this will fail — that's fine
    if (courseError.code === '23505') {
      console.log('   ⚠️  Courses already seeded, skipping duplicates.');
    } else {
      console.error('❌ Failed to insert courses:', courseError.message);
      process.exit(1);
    }
  } else {
    console.log(`   ✅ ${insertedCourses!.length} courses inserted.\n`);
  }

  console.log('🎉 Seed complete! Your Supabase database is ready.');
  console.log(`\n   Universities: ${insertedUniversities!.length}`);
  console.log(`   Courses:      ${allCourses.length}`);
}

seed().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
