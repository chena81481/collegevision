export interface CatalogScholarship {
  name: string;
  minScore: number;
  discountPercentage: number;
  criteria: string;
}

export interface CatalogCourse {
  id: string;
  name: string;
  degreeLevel: "Bachelors" | "Masters" | "Other";
  durationMonths: number;
  totalFeeInr: number;
  avgCtcInr: number;
  hasZeroCostEmi: boolean;
  approvals: string[];
  category: string;
  badgeLabel: string | null;
  generatedByAi?: boolean;
  sourceNote?: string;
  university: {
    name: string;
    slug: string;
    logoUrl: string | null;
    gradientStart: string;
    gradientEnd: string;
    isPremium?: boolean;
  };
  scholarships?: CatalogScholarship[];
}

export const FALLBACK_COURSE_CATALOG: CatalogCourse[] = [
  {
    id: "amity-online-mba",
    name: "Online MBA",
    degreeLevel: "Masters",
    durationMonths: 24,
    totalFeeInr: 199000,
    avgCtcInr: 850000,
    hasZeroCostEmi: true,
    approvals: ["UGC-DEB", "NAAC A+"],
    category: "online-mba",
    badgeLabel: "Popular Choice",
    university: {
      name: "Amity Online",
      slug: "amity-online",
      logoUrl: null,
      gradientStart: "from-orange-50",
      gradientEnd: "to-white",
      isPremium: true,
    },
    scholarships: [
      {
        name: "Merit Scholarship",
        minScore: 75,
        discountPercentage: 15,
        criteria: "Available for students with 75% or above in qualifying exams.",
      },
    ],
  },
  {
    id: "manipal-online-mba",
    name: "Online MBA",
    degreeLevel: "Masters",
    durationMonths: 24,
    totalFeeInr: 175000,
    avgCtcInr: 780000,
    hasZeroCostEmi: true,
    approvals: ["UGC-DEB", "AICTE", "NAAC A+"],
    category: "online-mba",
    badgeLabel: "Strong Outcomes",
    university: {
      name: "Manipal University Jaipur",
      slug: "manipal-university-jaipur",
      logoUrl: null,
      gradientStart: "from-amber-50",
      gradientEnd: "to-white",
      isPremium: true,
    },
    scholarships: [
      {
        name: "Women in Leadership Grant",
        minScore: 70,
        discountPercentage: 10,
        criteria: "Available to eligible women candidates with 70% or above.",
      },
    ],
  },
  {
    id: "nmims-online-mba-finance",
    name: "Online MBA Finance",
    degreeLevel: "Masters",
    durationMonths: 24,
    totalFeeInr: 210000,
    avgCtcInr: 920000,
    hasZeroCostEmi: true,
    approvals: ["UGC-DEB", "AICTE"],
    category: "online-mba",
    badgeLabel: "Finance Track",
    university: {
      name: "NMIMS Global",
      slug: "nmims-global",
      logoUrl: null,
      gradientStart: "from-red-50",
      gradientEnd: "to-white",
    },
  },
  {
    id: "iit-patna-bsc-data-science",
    name: "Online BSc Data Science",
    degreeLevel: "Bachelors",
    durationMonths: 36,
    totalFeeInr: 230000,
    avgCtcInr: 1050000,
    hasZeroCostEmi: false,
    approvals: ["UGC-DEB", "Institute of Excellence"],
    category: "online-degrees",
    badgeLabel: "Premium Data",
    university: {
      name: "IIT Patna",
      slug: "iit-patna",
      logoUrl: null,
      gradientStart: "from-sky-50",
      gradientEnd: "to-white",
    },
  },
  {
    id: "lpu-online-bca",
    name: "Online BCA",
    degreeLevel: "Bachelors",
    durationMonths: 36,
    totalFeeInr: 120000,
    avgCtcInr: 540000,
    hasZeroCostEmi: true,
    approvals: ["UGC-DEB"],
    category: "online-degrees",
    badgeLabel: "Budget Tech",
    university: {
      name: "LPU Online",
      slug: "lpu-online",
      logoUrl: null,
      gradientStart: "from-orange-50",
      gradientEnd: "to-white",
    },
  },
  {
    id: "jain-online-mca",
    name: "Online MCA",
    degreeLevel: "Masters",
    durationMonths: 24,
    totalFeeInr: 168000,
    avgCtcInr: 760000,
    hasZeroCostEmi: true,
    approvals: ["UGC-DEB", "NAAC A+"],
    category: "online-degrees",
    badgeLabel: "Career Switch",
    university: {
      name: "Jain Online",
      slug: "jain-online",
      logoUrl: null,
      gradientStart: "from-indigo-50",
      gradientEnd: "to-white",
    },
    scholarships: [
      {
        name: "Academic Excellence Grant",
        minScore: 80,
        discountPercentage: 20,
        criteria: "Available for high-scoring graduates with 80% or above.",
      },
    ],
  },
];
