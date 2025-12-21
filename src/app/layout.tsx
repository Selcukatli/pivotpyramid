import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { Analytics } from "@vercel/analytics/next";

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
      url: "https://pivotpyramid.com",
      name: "The Pivot Pyramid",
      description: "A visual framework for startup experimentation",
      publisher: { "@id": "https://pivotpyramid.com/#person" },
    },
    {
      "@type": "Person",
      "@id": "https://pivotpyramid.com/#person",
      name: "Selçuk Atlı",
      url: "https://selcukatli.com",
      sameAs: [
        "https://twitter.com/selcukatli",
        "https://www.linkedin.com/in/selcukatli",
      ],
      jobTitle: "Entrepreneur & Investor",
      description:
        "Serial entrepreneur, investor, and former Venture Partner at 500 Startups. Creator of the Pivot Pyramid framework.",
    },
    {
      "@type": "WebApplication",
      "@id": "https://pivotpyramid.com/#canvas",
      name: "Pivot Canvas",
      url: "https://pivotpyramid.com/canvas",
      description:
        "AI-powered canvas tool for documenting startup hypotheses using the Pivot Pyramid framework",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      creator: { "@id": "https://pivotpyramid.com/#person" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://pivotpyramid.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the Pivot Pyramid?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The Pivot Pyramid is a visual framework for startup experimentation created by Selçuk Atlı. It breaks down every startup into five layers: Customers, Problem, Solution, Technology, and Growth. The framework helps founders understand where to pivot and how changes cascade through their business.",
          },
        },
        {
          "@type": "Question",
          name: "What are the five layers of the Pivot Pyramid?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The five layers from bottom to top are: 1) Customers - who you're building for, 2) Problem - the pain point you're addressing, 3) Solution - your product or service, 4) Technology - what you build to deliver the solution, and 5) Growth - how you acquire and retain users.",
          },
        },
        {
          "@type": "Question",
          name: "Why does the order of layers matter in the Pivot Pyramid?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The lower in the pyramid you pivot, the more fundamental the change. When you change something at the bottom (like target customers), everything above needs to change too. But when you pivot at the top (like growth channels), the layers below remain stable. This helps founders understand the true cost of different types of pivots.",
          },
        },
        {
          "@type": "Question",
          name: "How do I use the Pivot Pyramid for my startup?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "First, map your startup onto the pyramid by identifying your customers, problem, solution, technology, and growth strategy. When something isn't working, diagnose which layer is broken. Before pivoting, understand what else needs to change - a customer pivot means reconsidering everything above it. Start experiments at the top where changes are cheaper.",
          },
        },
        {
          "@type": "Question",
          name: "What is the Pivot Canvas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The Pivot Canvas is a free AI-powered tool that helps you document your startup hypotheses using the Pivot Pyramid framework. It guides you through each layer, helps you articulate your assumptions, and provides insights on where to focus your experiments.",
          },
        },
      ],
    },
    {
      "@type": "VideoObject",
      "@id": "https://pivotpyramid.com/#video",
      name: "The Pivot Pyramid Framework Animation",
      description:
        "Animated illustration of the Pivot Pyramid framework showing the five layers of startup experimentation: Customers, Problem, Solution, Technology, and Growth.",
      thumbnailUrl: "https://pivotpyramid.com/pivot-pyramid-og.png",
      uploadDate: "2024-01-01",
      contentUrl: "https://pivotpyramid.com/pivot-pyramid-illustration.mp4",
      embedUrl: "https://pivotpyramid.com/pivot-pyramid-illustration.mp4",
      duration: "PT30S",
    },
    {
      "@type": "HowTo",
      "@id": "https://pivotpyramid.com/#howto",
      name: "How to Use the Pivot Pyramid",
      description:
        "A step-by-step guide to using the Pivot Pyramid framework for startup experimentation.",
      step: [
        {
          "@type": "HowToStep",
          name: "Identify Your Current State",
          text: "Map your startup onto the pyramid. Be clear about who your customers are, what problem you solve, and how you solve it.",
          position: 1,
        },
        {
          "@type": "HowToStep",
          name: "Diagnose the Issue",
          text: "When something isn't working, identify which layer is broken. Don't change your growth strategy if the real problem is your target customer.",
          position: 2,
        },
        {
          "@type": "HowToStep",
          name: "Understand the Cascade",
          text: "Before pivoting, understand what else needs to change. A customer pivot means reconsidering everything above it.",
          position: 3,
        },
        {
          "@type": "HowToStep",
          name: "Experiment Strategically",
          text: "Start experiments at the top of the pyramid where changes are cheaper. Only pivot lower layers when you have strong evidence.",
          position: 4,
        },
      ],
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
        <Analytics />
      </body>
    </html>
  );
}
