import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pivot Canvas - AI-Powered Startup Hypothesis Tool | Pivot Pyramid",
  description:
    "Document your startup hypotheses with our AI-powered canvas. Get guidance on where to pivot and how changes cascade through your business using the Pivot Pyramid framework.",
  alternates: {
    canonical: "https://pivotpyramid.com/canvas",
  },
  openGraph: {
    title: "Pivot Canvas - AI-Powered Startup Hypothesis Tool",
    description:
      "Document your startup hypotheses with our AI-powered canvas. Get guidance on where to pivot and how changes cascade through your business.",
    url: "https://pivotpyramid.com/canvas",
    images: [
      {
        url: "/pivot-pyramid-og.png",
        width: 1200,
        height: 630,
        alt: "Pivot Canvas - Startup Hypothesis Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pivot Canvas - AI-Powered Startup Hypothesis Tool",
    description:
      "Document your startup hypotheses with our AI-powered canvas. Get guidance on where to pivot and how changes cascade through your business.",
    images: ["/pivot-pyramid-og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
