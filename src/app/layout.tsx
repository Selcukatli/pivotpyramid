import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
