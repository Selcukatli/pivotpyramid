import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pivot Canvas - AI-Powered Startup Hypothesis Tool",
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
  },
  twitter: {
    title: "Pivot Canvas - AI-Powered Startup Hypothesis Tool",
    description:
      "Document your startup hypotheses with our AI-powered canvas. Get guidance on where to pivot and how changes cascade through your business.",
  },
};

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
