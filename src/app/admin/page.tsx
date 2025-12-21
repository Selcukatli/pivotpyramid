"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Users,
  TrendingUp,
  Calendar,
  ArrowRight,
  Plus,
  X,
  Hash,
} from "lucide-react";

export default function AdminDashboard() {
  const accessCodes = useQuery(api.ebookAccessCodes.listAll);
  const subscribers = useQuery(api.ebookSubscribers.listAll);
  const createCode = useMutation(api.ebookAccessCodes.create);

  const [isCreating, setIsCreating] = useState(false);
  const [newCode, setNewCode] = useState({
    code: "",
    description: "",
    maxUses: "",
    expiresAt: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCode({
        code: newCode.code,
        description: newCode.description || undefined,
        maxUses: newCode.maxUses ? parseInt(newCode.maxUses) : undefined,
        expiresAt: newCode.expiresAt
          ? new Date(newCode.expiresAt).getTime()
          : undefined,
      });
      setNewCode({ code: "", description: "", maxUses: "", expiresAt: "" });
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to create code:", err);
      alert(err instanceof Error ? err.message : "Failed to create code");
    }
  };

  const totalCodes = accessCodes?.length ?? 0;
  const activeCodes = accessCodes?.filter((c) => c.isActive).length ?? 0;
  const totalRedemptions =
    accessCodes?.reduce((sum, c) => sum + c.usedCount, 0) ?? 0;
  const totalSubscribers = subscribers?.length ?? 0;

  const isLoading = accessCodes === undefined || subscribers === undefined;

  const stats = [
    {
      label: "Total Access Codes",
      value: totalCodes,
      icon: Key,
      color: "from-amber-500 to-orange-500",
      bgColor: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200/50",
    },
    {
      label: "Active Codes",
      value: activeCodes,
      icon: TrendingUp,
      color: "from-emerald-500 to-green-500",
      bgColor: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-200/50",
    },
    {
      label: "Total Redemptions",
      value: totalRedemptions,
      icon: Calendar,
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200/50",
    },
    {
      label: "Subscribers",
      value: totalSubscribers,
      icon: Users,
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200/50",
    },
  ];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="h-9 w-48 bg-stone-200 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-72 bg-stone-100 rounded animate-pulse" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="relative bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl border border-stone-200/50 p-6 overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-stone-200 animate-pulse mb-4" />
              <div className="h-10 w-16 bg-stone-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-24 bg-stone-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Quick Links Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-stone-200 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-stone-100 animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 w-40 bg-stone-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-56 bg-stone-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <div className="h-5 w-40 bg-stone-200 rounded animate-pulse" />
          </div>
          <div className="divide-y divide-stone-100">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="h-7 w-24 bg-stone-100 rounded-lg animate-pulse" />
                <div className="h-4 w-40 bg-stone-100 rounded animate-pulse flex-1" />
                <div className="h-4 w-16 bg-stone-100 rounded animate-pulse" />
                <div className="h-6 w-16 bg-stone-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Dashboard</h1>
        <p className="text-stone-600">
          Welcome to the Pivot Pyramid admin panel.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`relative bg-gradient-to-br ${stat.bgColor} rounded-2xl border ${stat.borderColor} p-6 overflow-hidden`}
            >
              {/* Background decoration */}
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/30 blur-2xl" />

              <div
                className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-4xl font-bold text-stone-900 mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-stone-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <Link
          href="/admin/access-codes"
          className="group relative bg-white rounded-2xl border border-stone-200 p-6 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 overflow-hidden"
        >
          {/* Hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-orange-50/0 group-hover:from-amber-50/50 group-hover:to-orange-50/50 transition-all duration-300" />

          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Key className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-primary transition-colors">
                Manage Access Codes
              </h2>
              <p className="text-sm text-stone-500">
                Create, edit, and track ebook access codes
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          href="/admin/subscribers"
          className="group relative bg-white rounded-2xl border border-stone-200 p-6 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 overflow-hidden"
        >
          {/* Hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-violet-50/0 group-hover:from-purple-50/50 group-hover:to-violet-50/50 transition-all duration-300" />

          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-purple-600 transition-colors">
                View Subscribers
              </h2>
              <p className="text-sm text-stone-500">
                See who has subscribed for updates
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Create Code Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-b from-amber-50/80 to-white border-b border-stone-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                      <Key className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-stone-900">
                      Create Access Code
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-stone-500" />
                  </button>
                </div>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                    <Hash className="w-4 h-4" />
                    Code *
                  </label>
                  <input
                    type="text"
                    value={newCode.code}
                    onChange={(e) =>
                      setNewCode({ ...newCode, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g., LAUNCH2024"
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newCode.description}
                    onChange={(e) =>
                      setNewCode({ ...newCode, description: e.target.value })
                    }
                    placeholder="e.g., Product Hunt launch"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                    <Users className="w-4 h-4" />
                    Max Uses
                  </label>
                  <input
                    type="number"
                    value={newCode.maxUses}
                    onChange={(e) =>
                      setNewCode({ ...newCode, maxUses: e.target.value })
                    }
                    placeholder="Leave empty for unlimited"
                    min="1"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    value={newCode.expiresAt}
                    onChange={(e) =>
                      setNewCode({ ...newCode, expiresAt: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 px-4 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors font-medium text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-primary/20"
                  >
                    Create Code
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Activity */}
      {accessCodes && accessCodes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-stone-900">
                Recent Access Codes
              </h2>
              <button
                onClick={() => setIsCreating(true)}
                className="p-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors shadow-sm"
                title="Create new code"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Link
              href="/admin/access-codes"
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="text-left py-4 px-5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Uses
                  </th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {accessCodes.slice(0, 5).map((code) => (
                  <tr
                    key={code._id}
                    className="hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <span className="font-mono text-sm bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg">
                        {code.code}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-sm text-stone-600">
                      {code.description || (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-sm text-stone-600">
                      <span className="font-semibold text-stone-800">
                        {code.usedCount}
                      </span>
                      {code.maxUses && (
                        <span className="text-stone-400"> / {code.maxUses}</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          code.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            code.isActive ? "bg-emerald-500" : "bg-stone-400"
                          }`}
                        />
                        {code.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
