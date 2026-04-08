"use client";

import React from 'react';

export default function GlobalSchema() {
  const siteUrl = "https://collegevision.in";
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "CollegeVision",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/favicon.png`,
        },
        description:
          "CollegeVision helps students compare verified online universities, fees, ROI and admission options in India.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "CollegeVision",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        inLanguage: "en-IN",
      },
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/#homepage`,
        url: siteUrl,
        name: "CollegeVision Homepage",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        about: {
          "@id": `${siteUrl}/#organization`,
        },
        description:
          "Compare online degrees, ROI, fees and approvals across India's leading universities.",
      },
      {
        "@type": "ItemList",
        name: "Main Navigation",
        itemListElement: [
          {
            "@type": "SiteNavigationElement",
            position: 1,
            name: "Online MBA",
            url: `${siteUrl}/online-mba`,
          },
          {
            "@type": "SiteNavigationElement",
            position: 2,
            name: "Online MCA",
            url: `${siteUrl}/online-mca`,
          },
          {
            "@type": "SiteNavigationElement",
            position: 3,
            name: "Online BBA",
            url: `${siteUrl}/online-bba`,
          },
          {
            "@type": "SiteNavigationElement",
            position: 4,
            name: "Online BCA",
            url: `${siteUrl}/online-bca`,
          },
          {
            "@type": "SiteNavigationElement",
            position: 5,
            name: "Universities",
            url: `${siteUrl}/universities`,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
    />
  );
}
