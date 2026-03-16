import React from "react";
import { University } from "@/lib/mockData";

export default function UniversitySchema({ university }: { university: University }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: university.name,
    image: university.logo,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: university.rating,
      reviewCount: Math.floor(university.studentsCount * 0.1), // Mocking a review count
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
