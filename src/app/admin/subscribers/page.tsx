"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import {
  Trash2,
  Download,
  Search,
  Users,
  Clock,
  TrendingUp,
  Calendar,
  Mail,
  UserX,
} from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function SubscribersPage() {
  const subscribers = useQuery(api.ebookSubscribers.listAll);
  const stats = useQuery(api.ebookSubscribers.getStats);
  const removeSubscriber = useMutation(api.ebookSubscribers.remove);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: Id<"ebookSubscribers">) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
    try {
      await removeSubscriber({ id });
    } catch (err) {
      console.error("Failed to delete subscriber:", err);
    }
  };

  const handleExport = () => {
    if (!subscribers) return;

    const filtered = filteredSubscribers;
    const csv = [
      "Email,Subscribed At",
      ...filtered.map(
        (s) => `${s.email},${new Date(s.subscribedAt).toISOString()}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredSubscribers =
    subscribers?.filter((s) =>
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) ?? [];

  const isLoading = subscribers === undefined || stats === undefined;

  const statCards = [
    {
      label: "Total Subscribers",
      value: stats?.total ?? 0,
      icon: Users,
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200/50",
    },
    {
      label: "Last 24 Hours",
      value: stats?.last24h ?? 0,
      icon: Clock,
      color: "from-emerald-500 to-green-500",
      bgColor: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-200/50",
    },
    {
      label: "Last 7 Days",
      value: stats?.lastWeek ?? 0,
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200/50",
    },
    {
      label: "Last 30 Days",
      value: stats?.lastMonth ?? 0,
      icon: Calendar,
      color: "from-amber-500 to-orange-500",
      bgColor: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200/50",
    },
  ];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-6xl">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-9 w-40 bg-stone-200 rounded-lg animate-pulse mb-2" />
            <div className="h-5 w-56 bg-stone-100 rounded animate-pulse" />
          </div>
          <div className="h-11 w-32 bg-stone-200 rounded-xl animate-pulse" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
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

        {/* Search Skeleton */}
        <div className="mb-6">
          <div className="h-12 w-80 bg-stone-100 rounded-xl animate-pulse" />
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="border-b border-stone-100 bg-stone-50/50">
            <div className="flex items-center py-4 px-5 gap-4">
              <div className="h-4 w-16 bg-stone-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-stone-200 rounded animate-pulse flex-1" />
              <div className="h-4 w-16 bg-stone-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="divide-y divide-stone-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center py-4 px-5 gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-9 h-9 rounded-full bg-stone-100 animate-pulse" />
                  <div className="h-4 w-48 bg-stone-100 rounded animate-pulse" />
                </div>
                <div className="h-4 w-32 bg-stone-100 rounded animate-pulse" />
                <div className="h-8 w-8 bg-stone-100 rounded-lg animate-pulse" />
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-1">Subscribers</h1>
          <p className="text-stone-600">
            Ebook notification subscribers
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={!subscribers || subscribers.length === 0}
          className="flex items-center gap-2 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed text-stone-700 font-medium py-2.5 px-5 rounded-xl border border-stone-200 hover:border-stone-300 transition-all shadow-sm hover:shadow"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat) => {
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

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Subscribers Table */}
      {subscribers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center">
            <UserX className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-800 mb-2">
            No subscribers yet
          </h3>
          <p className="text-stone-500 max-w-sm mx-auto">
            Subscribers will appear here when visitors sign up for ebook
            notifications.
          </p>
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center">
            <Search className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-800 mb-2">
            No results found
          </h3>
          <p className="text-stone-500">
            No subscribers match &quot;{searchTerm}&quot;
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <th className="text-left py-4 px-5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Subscribed At
                  </div>
                </th>
                <th className="text-right py-4 px-5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSubscribers.map((subscriber) => (
                <tr
                  key={subscriber._id}
                  className="hover:bg-stone-50/50 transition-colors"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-purple-600">
                          {subscriber.email[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-stone-800">
                        {subscriber.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <Clock className="w-4 h-4 text-stone-400" />
                      {formatDate(subscriber.subscribedAt)}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleDelete(subscriber._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Delete subscriber"
                      >
                        <Trash2 className="w-4 h-4 text-stone-400 group-hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer with count */}
      {filteredSubscribers.length > 0 && (
        <p className="mt-4 text-sm text-stone-500 text-right">
          Showing{" "}
          <span className="font-semibold text-stone-700">
            {filteredSubscribers.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-stone-700">
            {subscribers?.length || 0}
          </span>{" "}
          subscribers
        </p>
      )}
    </div>
  );
}
