"use client";

import { useLayoutEffect, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, X, Maximize2, Users, ArrowUpDown, Target, MapPin, Search, GitBranch, FlaskConical, BookOpen } from "lucide-react";

const layers = [
  {
    name: "Customers",
    color: "bg-orange-100 border-orange-300",
    textColor: "text-orange-700",
    description:
      "Who are you building for? This is the foundation of your startup. Changing your target customer is the most fundamental pivot—it affects everything above it.",
    examples: [
      "Shopify started selling snowboards online, then pivoted to building tools for anyone selling online",
      "Slack started as Glitch, a multiplayer game, before pivoting to team communication",
    ],
    question: "Are you solving a real problem for people who will pay?",
  },
  {
    name: "Problem",
    color: "bg-red-100 border-red-300",
    textColor: "text-red-700",
    description:
      "What pain point are you addressing? If you change the problem you're solving, you need to reconsider your solution, technology, and growth strategy.",
    examples: [
      "Instagram kept the same young social users but pivoted from check-ins (Burbn) to photo sharing",
      "Twitter kept tech-savvy users but pivoted from podcast discovery (Odeo) to microblogging",
    ],
    question: "Is this problem painful enough that people actively seek solutions?",
  },
  {
    name: "Solution",
    color: "bg-teal-100 border-teal-300",
    textColor: "text-teal-700",
    description:
      "How do you solve the problem? This is your product or service. Changing your solution is less disruptive than changing customers or problems.",
    examples: [
      "Netflix solved home entertainment first with DVD-by-mail, then pivoted to streaming",
      "Duolingo kept language learners but pivoted from crowdsourced translation to gamified self-study",
    ],
    question: "Is your solution 10x better than alternatives?",
  },
  {
    name: "Technology",
    color: "bg-yellow-100 border-yellow-300",
    textColor: "text-yellow-700",
    description:
      "What do you build to deliver the solution? Technology changes are relatively easy pivots—you're just changing how you implement your solution.",
    examples: [
      "Facebook rewrote from PHP to Hack/HHVM to handle scale—users never noticed",
      "Harvey upgraded from GPT-3 to GPT-4—same legal AI product, but suddenly good enough for elite law firms",
    ],
    question: "Does your tech stack enable or constrain your solution?",
  },
  {
    name: "Growth",
    color: "bg-purple-100 border-purple-300",
    textColor: "text-purple-700",
    description:
      "How do you acquire and retain users? This is the easiest layer to pivot—changing your marketing channels or growth tactics doesn't affect your core product.",
    examples: [
      "Airbnb auto-posted listings to Craigslist for distribution—no product or tech changes needed",
      "Dropbox's referral program drove viral growth without changing the core product",
    ],
    question: "What's your unfair advantage in acquiring customers?",
  },
];

const publications = [
  {
    outlet: "Blog",
    title: "Introducing the Pivot Pyramid",
    link: "https://medium.com/@pivot_pyramid/introducing-the-pivot-pyramid-aa26d0255397",
  },
  {
    outlet: "VentureBeat",
    title: "The Pivot Pyramid: How to experiment with your startup",
    link: "https://venturebeat.com/2016/05/28/the-pivot-pyramid-how-to-experiment-with-your-startup/",
  },
  {
    outlet: "500 Startups",
    title: "The Startup Pivot Pyramid",
    link: "https://500.co/content/the-startup-pivot-pyramid",
  },
  {
    outlet: "Founder Institute",
    title: "What Pivoting Is, When to Pivot, and How to Pivot Effectively",
    link: "https://fi.co/insight/what-pivoting-is-when-to-pivot-and-how-to-pivot-effectively",
  },
  {
    outlet: "MaRS",
    title: "Pivots Part 6: Types of Pivots",
    link: "https://learn.marsdd.com/article/pivots-part-6-types-of-pivots/",
  },
];

export default function PivotPyramidPage() {
  // Scroll to top synchronously before paint to prevent scroll restoration issues
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track if the bottom CTA section is visible
  const [isBottomCtaVisible, setIsBottomCtaVisible] = useState(false);
  const bottomCtaRef = useRef<HTMLElement>(null);

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Close lightbox on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    if (isLightboxOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBottomCtaVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (bottomCtaRef.current) {
      observer.observe(bottomCtaRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-stone-50"
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-stone-50/80 backdrop-blur-xl border-b border-stone-200/50">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <nav className="flex items-center justify-between h-16 md:h-20">
            <div className="flex flex-col md:flex-row md:items-center md:gap-3">
              <Image
                src="/pivot-pyramid-logo.png"
                alt="Pivot Pyramid"
                width={330}
                height={82}
                className="h-10 md:h-16 w-auto transition-transform duration-200 hover:scale-105"
                priority
              />
              <div className="flex items-center gap-1.5 mt-0.5 md:mt-0">
                <span className="text-stone-400 text-xs md:text-base">by</span>
                <a
                  href="https://www.selcukatli.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-stone-600 hover:text-primary transition-colors text-xs md:text-base"
                >
                  Selçuk Atlı
                  <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Canvas CTA - commented out for now
              <Link
                href="/canvas"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                         text-stone-600 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span className="hidden sm:inline">Open Pivot Canvas</span>
              </Link>
              */}
              <Link
                href="/ebook"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isBottomCtaVisible
                    ? "bg-transparent border border-primary text-primary hover:bg-primary/10"
                    : "bg-primary text-primary-foreground hover:bg-primary-hover"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Get the Ebook
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 mb-4">
              Original Business Model Framework by Selçuk Atlı
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 mb-6">
              The Pivot Pyramid
            </h1>
            <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-8">
              A visual framework for startup experimentation. Understand where to pivot
              and how changes cascade through your business.
            </p>

            {/* Featured In - Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-stone-400">
                Featured In
              </span>
              {publications.map((pub) => (
                <a
                  key={pub.outlet}
                  href={pub.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                           bg-white border border-stone-200 hover:border-stone-300 hover:shadow-sm
                           text-stone-500 hover:text-stone-700 transition-all"
                >
                  {pub.outlet}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <div
            className="relative aspect-square max-w-lg mx-auto cursor-pointer group"
            onClick={() => setIsLightboxOpen(true)}
          >
            {/* Image container */}
            <div className="absolute inset-2 rounded-[2rem] overflow-hidden">
              <Image
                src="/pivot-pyramid.png"
                alt="The Pivot Pyramid Framework - 5 layers: Customers, Problem, Solution, Technology, Growth"
                fill
                className="object-contain scale-110 transition-transform duration-200 group-hover:scale-[1.12]"
                priority
              />
            </div>
            {/* Doodle border SVG */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 400 400"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M 40 8
                   Q 45 5, 60 6 L 120 4 Q 140 3, 160 5 L 220 4 Q 260 3, 300 6 L 340 5 Q 360 4, 370 8
                   Q 395 12, 394 40 L 396 100 Q 397 140, 395 180 L 396 240 Q 397 280, 394 320 L 395 360 Q 396 380, 392 392
                   Q 388 396, 360 394 L 300 396 Q 260 397, 220 395 L 160 396 Q 120 397, 80 395 L 40 396 Q 15 397, 8 392
                   Q 4 388, 5 360 L 4 300 Q 3 260, 5 220 L 4 160 Q 3 120, 5 80 L 6 40 Q 4 15, 8 8
                   Q 12 4, 40 8 Z"
                stroke="#E07D3B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white backdrop-blur-sm">
                <Maximize2 className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-stone-100 rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-stone-800/80 hover:bg-stone-800 text-white transition-colors shadow-lg"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image container */}
              <div className="relative aspect-square max-h-[85vh] w-full">
                <Image
                  src="/pivot-pyramid.png"
                  alt="The Pivot Pyramid Framework - 5 layers: Customers, Problem, Solution, Technology, Growth"
                  fill
                  className="object-contain p-4 md:p-8"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Origin Story */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-6">
            Why I Created This Framework
          </h2>
          <div className="prose prose-lg max-w-none text-stone-600 space-y-4">
            <p>
              In 2016, after my second startup, I joined 500 Startups as a Venture Partner.
              Having been through my own journey pivoting Socialwire from a product recommendation engine
              for online retailers to a product advertising platform, I recognized a familiar struggle
              in the founders I was working with: deciding <em>what</em> to change when things weren&apos;t working.
            </p>
            <p>
              Some would pivot their entire business when they just needed a new marketing channel.
              Others would tweak their landing page when the real problem was they were targeting the wrong customers.
              And some were building for multiple customer profiles with completely different problems—essentially
              running three startups at once without realizing it.
              The cost of getting this wrong was huge—wasted months, burned runway, demoralized teams.
            </p>
            <p>
              I created the Pivot Pyramid to give founders a simple mental model for these decisions.
              It was first published on the 500 Startups blog and has since been featured in VentureBeat
              and many other publications online.
            </p>
          </div>
        </div>
      </section>

      {/* The Five Layers */}
      <section className="py-16 md:py-24 bg-stone-100/50">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4 text-center">
            The Five Layers
          </h2>
          <p className="text-stone-600 text-center max-w-2xl mx-auto mb-12">
            Every startup can be broken down into five layers. Understanding these layers helps you
            identify where to focus your experiments and what the true cost of change will be.
          </p>

          <div className="space-y-6">
            {layers.map((layer, index) => (
              <div
                key={layer.name}
                className={`p-6 md:p-8 rounded-2xl border-2 ${layer.color}`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`text-4xl md:text-5xl font-bold ${layer.textColor} opacity-30`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className={`text-xl md:text-2xl font-bold ${layer.textColor} mb-3`}>
                      {layer.name}
                    </h3>
                    <p className="text-stone-600 mb-4">{layer.description}</p>
                    <p className="text-sm font-medium text-stone-800 mb-6 italic">
                      &ldquo;{layer.question}&rdquo;
                    </p>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                        Real-World Pivots:
                      </p>
                      <ul className="space-y-2">
                        {layer.examples.map((example, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className={`${layer.textColor} text-lg mt-0.5`}>→</span>
                            <span className="text-base text-stone-700">{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Insight */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-6">
            The Core Insight
          </h2>
          <div className="prose prose-lg max-w-none text-stone-600">
            <p>
              <strong className="text-stone-800">The lower in the pyramid you pivot, the more fundamental the change.</strong>
            </p>
            <p>
              When you change something at the bottom of the pyramid (like your target customers),
              everything above it needs to change too. But when you pivot at the top (like your
              growth channels), the layers below remain stable.
            </p>
            <p>
              This framework helps founders make informed decisions about where to experiment
              and understand the true cost of different types of pivots.
            </p>
          </div>
        </div>
      </section>

      {/* Key Lessons */}
      <section className="py-16 md:py-24 bg-stone-100/50">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-10 text-center">
            Key Takeaways
          </h2>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-stone-200/50 flex items-center justify-center">
                <Users className="w-5 h-5 text-stone-500" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-stone-800 text-lg mb-2">Start with customer and problem</h3>
                <p className="text-stone-600 leading-relaxed">
                  Y Combinator&apos;s &ldquo;Make Something People Want&rdquo; maps to the bottom three layers.
                  Talk to customers to validate them—conversations reveal which layer needs to change.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-stone-200/50 flex items-center justify-center">
                <ArrowUpDown className="w-5 h-5 text-stone-500" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-stone-800 text-lg mb-2">Pivoting below changes everything above</h3>
                <p className="text-stone-600 leading-relaxed">
                  Changes at the bottom of the pyramid impact all layers above. Changes at the top
                  don&apos;t require changes below. Your pace of experimentation should increase toward the top.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-stone-200/50 flex items-center justify-center">
                <Target className="w-5 h-5 text-stone-500" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-stone-800 text-lg mb-2">Focus on one customer type</h3>
                <p className="text-stone-600 leading-relaxed">
                  Targeting different customer types = building multiple startups at once.
                  Only mature businesses can successfully expand into multiple customer segments—Shopify focused exclusively on small merchants before adding enterprise years later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-10">
            How to Use the Pivot Pyramid
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-stone-200/50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-stone-500" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-stone-800 text-lg mb-2">Identify Your Current State</h3>
                <p className="text-stone-600 leading-relaxed">
                  Map your startup onto the pyramid. Be clear about who your customers are,
                  what problem you solve, and how you solve it.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-stone-200/50 flex items-center justify-center">
                <Search className="w-5 h-5 text-stone-500" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-stone-800 text-lg mb-2">Diagnose the Issue</h3>
                <p className="text-stone-600 leading-relaxed">
                  When something isn&apos;t working, identify which layer is broken.
                  Don&apos;t change your growth strategy if the real problem is your target customer.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-stone-200/50 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-stone-500" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-stone-800 text-lg mb-2">Understand the Cascade</h3>
                <p className="text-stone-600 leading-relaxed">
                  Before pivoting, understand what else needs to change.
                  A customer pivot means reconsidering everything above it.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-stone-200/50 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-stone-500" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-stone-800 text-lg mb-2">Experiment Strategically</h3>
                <p className="text-stone-600 leading-relaxed">
                  Start experiments at the top of the pyramid where changes are cheaper.
                  Only pivot lower layers when you have strong evidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ebook Section */}
      <section ref={bottomCtaRef} className="py-16 md:py-24 bg-stone-100/50">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Book Cover */}
            <div className="order-2 md:order-1 flex justify-center">
              <div className="relative w-64 md:w-72">
                <Image
                  src="/pivot-pyramid-ebook.png"
                  alt="The Pivot Pyramid Ebook"
                  width={288}
                  height={384}
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>
            </div>

            {/* CTA Content */}
            <div className="order-1 md:order-2">
              <p className="text-primary text-sm uppercase tracking-wide font-semibold mb-2">
                Early Access
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
                Get the Complete Guide
              </h2>
              <p className="text-stone-600 mb-6">
                The Pivot Pyramid Ebook includes detailed examples, worksheets, and exercises to help you systematically experiment with your startup.
              </p>

              <Link
                href="/ebook"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Read the Ebook
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Wrap Up / CTA - commented out for now
      <section ref={bottomCtaRef} className="py-16 md:py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
            Start Using the Framework
          </h2>
          <p className="text-stone-600 mb-8 max-w-xl mx-auto">
            Document your startup hypotheses with our AI-powered canvas. Get guidance on where to pivot
            and how changes cascade through your business.
          </p>

          <Link
            href="/canvas"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-base font-medium
                     bg-primary text-primary-foreground hover:bg-primary-hover transition-colors shadow-lg hover:shadow-xl"
          >
            <ArrowRight className="w-5 h-5" />
            Open Pivot Canvas
          </Link>
        </div>
      </section>
      */}

      {/* About the Author */}
      <section className="py-16 md:py-20 border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <Image
                src="/selcuk-photo.jpg"
                alt="Selçuk Atlı"
                width={120}
                height={120}
                className="rounded-2xl object-cover"
              />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500 mb-2">
                  About the Author
                </p>
                <h3 className="text-xl font-bold text-stone-800">Selçuk Atlı</h3>
              </div>
              <p className="text-stone-600 leading-relaxed">
                I&apos;m a serial entrepreneur, investor, and songwriter based in New York.
                Most recently, I founded{" "}
                <a href="https://bunch.live" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                  Bunch
                </a>
                , a group video chat app for playing games together, used by over 10 million players.
                Before that, I founded and sold two adtech companies: Manifest (acquired by Rakuten) and
                Boostable (acquired by Metric Collective).
              </p>
              <p className="text-stone-600 leading-relaxed">
                I conceptualized the Pivot Pyramid while serving as a Venture Partner at 500 Startups, where I worked
                with dozens of early-stage founders navigating the search for product-market fit.
              </p>
              <a
                href="https://selcukatli.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:underline"
              >
                Learn more about me
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} Selçuk Atlı. All rights reserved.
          </p>
        </div>
      </footer>
    </motion.main>
  );
}
