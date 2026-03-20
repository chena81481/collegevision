"use client";

import React from 'react';

export default function GlobalSchema() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CollegeVision",
    "url": "https://collegevision.in",
    "logo": "https://collegevision.in/favicon.png",
    "sameAs": [
      "https://facebook.com/collegevision",
      "https://twitter.com/collegevision",
      "https://instagram.com/collegevision",
      "https://linkedin.com/company/collegevision"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-1234567890",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": "en"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CollegeVision",
    "url": "https://collegevision.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://collegevision.in/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const navigationSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Main Navigation",
    "itemListElement": [
      {
        "@type": "SiteNavigationElement",
        "position": 1,
        "name": "Online MBA",
        "url": "https://collegevision.in/online-mba"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 2,
        "name": "Online MCA",
        "url": "https://collegevision.in/online-mca"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 3,
        "name": "Online BBA",
        "url": "https://collegevision.in/online-bba"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 4,
        "name": "Online BCA",
        "url": "https://collegevision.in/online-bca"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 5,
        "name": "Universities",
        "url": "https://collegevision.in/universities"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationSchema) }}
      />
    </>
  );
}
