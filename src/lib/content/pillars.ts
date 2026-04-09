export interface PillarPage {
  slug: string;
  title: string;
  description: string;
  label: string;
  intro: string;
  bullets: string[];
  relatedLinks: Array<{
    href: string;
    label: string;
  }>;
}

export const pillarPages: PillarPage[] = [
  {
    slug: "best-online-mba-colleges-in-india-2026",
    title: "Best Online MBA Colleges in India 2026",
    description:
      "Compare the best online MBA colleges in India for 2026 using fees, ROI, approvals and career-fit signals.",
    label: "MBA Pillar",
    intro:
      "This pillar page exists for students who search for the best online MBA colleges in India and want a cleaner path into verified university, fee and ROI comparisons.",
    bullets: [
      "approval-first MBA shortlist logic",
      "fee versus ROI comparison guidance",
      "direct links into university profile pages",
    ],
    relatedLinks: [
      { href: "/online-mba", label: "Open Online MBA comparison page" },
      { href: "/blog/how-to-choose-an-online-mba-in-india", label: "Read the MBA selection guide" },
      { href: "/universities", label: "Browse all universities" },
    ],
  },
  {
    slug: "best-online-mca-colleges-in-india-2026",
    title: "Best Online MCA Colleges in India 2026",
    description:
      "Compare the best online MCA colleges in India for 2026 using technical career fit, fees, ROI and university trust cues.",
    label: "MCA Pillar",
    intro:
      "This page helps MCA-focused students move from broad search intent into a more trustworthy shortlist built on technical outcomes, affordability and approval visibility.",
    bullets: [
      "technical role and program-fit context",
      "MCA affordability and ROI logic",
      "links to guides and university pages",
    ],
    relatedLinks: [
      { href: "/online-mca", label: "Open Online MCA comparison page" },
      { href: "/blog/online-mca-vs-online-mba-career-outcomes", label: "Read MCA vs MBA guide" },
      { href: "/blog/best-online-bca-colleges-in-india-for-tech-careers", label: "Read the BCA tech guide" },
    ],
  },
  {
    slug: "best-online-bba-colleges-in-india-2026",
    title: "Best Online BBA Colleges in India 2026",
    description:
      "Compare the best online BBA colleges in India for 2026 using fee comfort, approvals, career flexibility and future ROI.",
    label: "BBA Pillar",
    intro:
      "This pillar page is built for students and parents searching for the best online BBA colleges and needing more than a generic directory list.",
    bullets: [
      "undergraduate-friendly selection framework",
      "fee comfort and flexibility context",
      "easy path into deeper university pages",
    ],
    relatedLinks: [
      { href: "/online-bba", label: "Open Online BBA comparison page" },
      { href: "/blog/best-online-bba-colleges-in-india-for-roi", label: "Read the BBA ROI guide" },
      { href: "/faq", label: "Visit CollegeVision FAQ" },
    ],
  },
  {
    slug: "best-online-bca-colleges-in-india-2026",
    title: "Best Online BCA Colleges in India 2026",
    description:
      "Compare the best online BCA colleges in India for 2026 using technical career momentum, fee clarity and safer university selection.",
    label: "BCA Pillar",
    intro:
      "Students often search for the best online BCA colleges when what they really need is a clearer technical-degree comparison framework. This page is built to bridge that gap.",
    bullets: [
      "technical skill-growth framing",
      "fee and flexibility decision support",
      "strong handoff into detailed university routes",
    ],
    relatedLinks: [
      { href: "/online-bca", label: "Open Online BCA comparison page" },
      { href: "/blog/best-online-bca-colleges-in-india-for-tech-careers", label: "Read the BCA tech-career guide" },
      { href: "/blog", label: "View all guides" },
    ],
  },
];

export function getPillarPage(slug: string) {
  return pillarPages.find((page) => page.slug === slug);
}
