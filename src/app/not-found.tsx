import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found | The Pivot Pyramid",
  description:
    "The page you're looking for doesn't exist. Explore the Pivot Pyramid framework or try the Pivot Canvas tool.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <Image
            src="/pivot-pyramid-logo.png"
            alt="Pivot Pyramid"
            width={200}
            height={50}
            className="h-12 w-auto mx-auto mb-8"
          />
          <h1 className="text-6xl font-bold text-stone-300 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-stone-800 mb-3">
            Page Not Found
          </h2>
          <p className="text-stone-600 mb-8">
            Looks like you've pivoted to a page that doesn't exist. Let's get
            you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                     border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/canvas"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                     bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            Try Pivot Canvas
          </Link>
        </div>

        <p className="mt-12 text-xs text-stone-400">
          Need help? Learn about the{" "}
          <Link href="/" className="text-amber-600 hover:underline">
            Pivot Pyramid framework
          </Link>
        </p>
      </div>
    </main>
  );
}
