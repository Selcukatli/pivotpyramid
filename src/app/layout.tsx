import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://pivotpyramid.com"),
  verification: {
    google: "lwzVXiQ2xTd1AzRSVQ1edWdTy-UFK8akZlGDS6586hA",
  },
  title: "The Pivot Pyramid - A Framework for Startup Experimentation",
  description:
    "A visual framework for startup experimentation by Selçuk Atlı. Understand where to pivot and how changes cascade through your business.",
  keywords: [
    "pivot",
    "startup",
    "framework",
    "experimentation",
    "business model",
    "product-market fit",
    "entrepreneurship",
  ],
  authors: [{ name: "Selçuk Atlı", url: "https://selcukatli.com" }],
  creator: "Selçuk Atlı",
  alternates: {
    canonical: "https://pivotpyramid.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pivotpyramid.com",
    siteName: "The Pivot Pyramid",
    title: "The Pivot Pyramid - A Framework for Startup Experimentation",
    description:
      "A visual framework for startup experimentation. Understand where to pivot and how changes cascade through your business.",
    images: [
      {
        url: "/pivot-pyramid-og.png",
        width: 1200,
        height: 630,
        alt: "The Pivot Pyramid Framework",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Pivot Pyramid - A Framework for Startup Experimentation",
    description:
      "A visual framework for startup experimentation. Understand where to pivot and how changes cascade through your business.",
    images: ["/pivot-pyramid-og.png"],
    creator: "@selcukatli",
  },
  icons: {
    icon: "/pivot-pyramid-app-icon.png",
    apple: "/pivot-pyramid-app-icon.png",
  },
  manifest: "/manifest.json",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://pivotpyramid.com/#website",
      "url": "https://pivotpyramid.com",
      "name": "The Pivot Pyramid",
      "description": "A visual framework for startup experimentation",
      "publisher": { "@id": "https://pivotpyramid.com/#person" },
    },
    {
      "@type": "Person",
      "@id": "https://pivotpyramid.com/#person",
      "name": "Selçuk Atlı",
      "url": "https://selcukatli.com",
      "sameAs": [
        "https://twitter.com/selcukatli",
        "https://www.linkedin.com/in/selcukatli",
      ],
      "jobTitle": "Entrepreneur & Investor",
      "description": "Serial entrepreneur, investor, and former Venture Partner at 500 Startups. Creator of the Pivot Pyramid framework.",
    },
    {
      "@type": "WebApplication",
      "@id": "https://pivotpyramid.com/#canvas",
      "name": "Pivot Canvas",
      "url": "https://pivotpyramid.com/canvas",
      "description": "AI-powered canvas tool for documenting startup hypotheses using the Pivot Pyramid framework",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "creator": { "@id": "https://pivotpyramid.com/#person" },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
