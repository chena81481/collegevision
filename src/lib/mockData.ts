export interface University {
  id: string;
  name: string;
  location: string;
  logo: string;
  rating: number;
  accreditations: string[];
  feesPerYear: number;
  emiAvailable: boolean;
  placementPercentage: number;
  durationYears: number;
  studentsCount: number;
  admissionStatus: "open" | "closing_soon" | "closed";
  brandColor: string;
}

export const MOCK_UNIVERSITIES: University[] = [
  {
    id: "u1",
    name: "Amity Online University",
    location: "Noida, India",
    logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=150&q=80",
    rating: 4.8,
    accreditations: ["UGC", "NAAC A+"],
    feesPerYear: 95000,
    emiAvailable: true,
    placementPercentage: 92,
    durationYears: 2,
    studentsCount: 15420,
    admissionStatus: "closing_soon",
    brandColor: "from-yellow-400 to-orange-500",
  },
  {
    id: "u2",
    name: "NMIMS Global Access",
    location: "Mumbai, India",
    logo: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=150&q=80",
    rating: 4.5,
    accreditations: ["UGC", "AICTE"],
    feesPerYear: 120000,
    emiAvailable: true,
    placementPercentage: 88,
    durationYears: 2,
    studentsCount: 22000,
    admissionStatus: "open",
    brandColor: "from-red-500 to-rose-600",
  },
  {
    id: "u3",
    name: "Jain Deemed-to-be University",
    location: "Bangalore, India",
    logo: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=150&q=80",
    rating: 4.3,
    accreditations: ["UGC", "NAAC A"],
    feesPerYear: 85000,
    emiAvailable: false,
    placementPercentage: 85,
    durationYears: 3,
    studentsCount: 12500,
    admissionStatus: "open",
    brandColor: "from-blue-500 to-cyan-500",
  },
  {
    id: "u4",
    name: "Manipal University Jaipur",
    location: "Jaipur, India",
    logo: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=150&q=80",
    rating: 4.6,
    accreditations: ["UGC", "AICTE", "NAAC A+"],
    feesPerYear: 110000,
    emiAvailable: true,
    placementPercentage: 90,
    durationYears: 3,
    studentsCount: 18000,
    admissionStatus: "closing_soon",
    brandColor: "from-orange-500 to-amber-600",
  },
  {
    id: "u5",
    name: "LPU Online",
    location: "Jalandhar, India",
    logo: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=150&q=80",
    rating: 4.2,
    accreditations: ["UGC"],
    feesPerYear: 60000,
    emiAvailable: true,
    placementPercentage: 80,
    durationYears: 2,
    studentsCount: 30000,
    admissionStatus: "open",
    brandColor: "from-orange-600 to-red-600",
  }
];
