"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useRef } from "react";
import { useClerk, useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Key,
  Users,
  LogOut,
  ArrowLeft,
  Shield,
  Loader2,
  ShieldX,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { isAuthenticated: convexAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const isAdmin = useQuery(api.users.isAdmin);
  const ensureUser = useMutation(api.users.ensureUser);
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const isCreatingUser = useRef(false);

  // Auto-create user on first visit (only when both Clerk and Convex are authenticated)
  useEffect(() => {
    if (!clerkLoaded || !isSignedIn || !convexAuthenticated) return;

    // Create user if doesn't exist yet
    if (user === null && !isCreatingUser.current) {
      isCreatingUser.current = true;
      ensureUser().finally(() => {
        isCreatingUser.current = false;
      });
    }
  }, [clerkLoaded, isSignedIn, convexAuthenticated, user, ensureUser]);

  // Redirect to login if not signed in
  useEffect(() => {
    if (clerkLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [clerkLoaded, isSignedIn, router]);

  // Compute loading state
  const isLoading = !clerkLoaded ||
    (isSignedIn && (!convexAuthenticated || user === undefined || isAdmin === undefined));

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="text-stone-600 font-medium">Loading admin panel...</p>
        </motion.div>
      </div>
    );
  }

  // Not signed in - show redirecting (useEffect will handle redirect)
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="text-stone-600 font-medium">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  // Not admin - show access denied page
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-100 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-amber-200/40 to-orange-300/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-amber-100/40 to-yellow-200/30 rounded-full blur-3xl" />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#E07D3B 1px, transparent 1px), linear-gradient(to right, #E07D3B 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
          {/* Back to home link */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="absolute top-6 left-6"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors text-sm font-medium group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Pivot Pyramid
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Card with doodle border effect */}
            <div className="relative">
              {/* Doodle border SVG */}
              <svg
                className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] pointer-events-none"
                viewBox="0 0 400 480"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M 30 8
                     Q 35 4, 60 6 L 140 5 Q 180 4, 220 6 L 300 5 Q 340 4, 360 6 L 380 8
                     Q 396 12, 395 35 L 397 120 Q 398 180, 396 240 L 397 320 Q 398 400, 395 440 L 394 460
                     Q 390 476, 360 474 L 280 475 Q 220 476, 160 474 L 80 475 Q 40 476, 20 474 L 8 470
                     Q 4 466, 5 440 L 4 360 Q 3 280, 5 200 L 4 120 Q 3 60, 5 30 L 6 12
                     Q 10 4, 30 8 Z"
                  stroke="#E07D3B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.6"
                />
              </svg>

              {/* Card content */}
              <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200/80 overflow-hidden">
                {/* Header with gradient */}
                <div className="relative px-8 pt-10 pb-6 text-center bg-gradient-to-b from-amber-50/80 to-white">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <Link href="/" className="inline-block mb-4">
                      <Image
                        src="/pivot-pyramid-logo.png"
                        alt="Pivot Pyramid"
                        width={200}
                        height={50}
                        className="h-10 w-auto mx-auto"
                        priority
                      />
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center">
                      <ShieldX className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-stone-900 mb-2">
                      Access Denied
                    </h1>
                    <p className="text-stone-600">
                      You don&apos;t have permission to access the admin area.
                    </p>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="px-8 pb-8">
                  <div className="p-4 bg-stone-50 rounded-xl mb-6">
                    <p className="text-sm text-stone-500 text-center">
                      Logged in as
                    </p>
                    <p className="text-sm font-semibold text-stone-800 text-center mt-1">
                      {user?.email || "Unknown"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Link
                      href="/"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Go to Homepage
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-xs text-stone-400 text-center"
          >
            Admin access is restricted to authorized users only
          </motion.p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/access-codes", label: "Access Codes", icon: Key },
    { href: "/admin/subscribers", label: "Subscribers", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-stone-200 flex flex-col shadow-sm">
        {/* Logo & Brand */}
        <div className="p-6 border-b border-stone-100">
          <Link
            href="/"
            className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors text-sm mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Site
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-900">Admin</h1>
              <p className="text-xs text-stone-500">Pivot Pyramid</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <p className="px-4 mb-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Management
          </p>
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-amber-50 to-orange-50 text-primary border border-amber-200/50 shadow-sm"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-primary" : ""}`}
                    />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* User info & Sign out */}
        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl mb-3">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-full ring-2 ring-white"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center ring-2 ring-white">
                <span className="text-primary font-semibold">
                  {user?.email?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-stone-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-72 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
