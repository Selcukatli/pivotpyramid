"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Eye,
  Key,
  Calendar,
  Users,
  Clock,
  Hash,
  Loader2,
} from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function AccessCodesPage() {
  const codes = useQuery(api.ebookAccessCodes.listAll);
  const createCode = useMutation(api.ebookAccessCodes.create);
  const toggleActive = useMutation(api.ebookAccessCodes.toggleActive);
  const removeCode = useMutation(api.ebookAccessCodes.remove);

  const [isCreating, setIsCreating] = useState(false);
  const [viewingRedemptions, setViewingRedemptions] =
    useState<Id<"ebookAccessCodes"> | null>(null);
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

  const handleToggle = async (id: Id<"ebookAccessCodes">) => {
    try {
      await toggleActive({ id });
    } catch (err) {
      console.error("Failed to toggle code:", err);
    }
  };

  const handleDelete = async (id: Id<"ebookAccessCodes">) => {
    if (!confirm("Are you sure you want to delete this code?")) return;
    try {
      await removeCode({ id });
    } catch (err) {
      console.error("Failed to delete code:", err);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading skeleton
  if (codes === undefined) {
    return (
      <div className="max-w-6xl">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-9 w-48 bg-stone-200 rounded-lg animate-pulse mb-2" />
            <div className="h-5 w-56 bg-stone-100 rounded animate-pulse" />
          </div>
          <div className="h-12 w-36 bg-stone-200 rounded-xl animate-pulse" />
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="border-b border-stone-100 bg-stone-50/50">
            <div className="flex items-center py-4 px-5 gap-4">
              <div className="h-4 w-16 bg-stone-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-stone-200 rounded animate-pulse flex-1" />
              <div className="h-4 w-12 bg-stone-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-stone-200 rounded animate-pulse" />
              <div className="h-4 w-14 bg-stone-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-stone-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="divide-y divide-stone-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center py-4 px-5 gap-4">
                <div className="h-7 w-24 bg-stone-100 rounded-lg animate-pulse" />
                <div className="h-4 w-40 bg-stone-100 rounded animate-pulse flex-1" />
                <div className="h-4 w-16 bg-stone-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-stone-100 rounded animate-pulse" />
                <div className="h-6 w-16 bg-stone-100 rounded-full animate-pulse" />
                <div className="flex gap-1">
                  <div className="h-8 w-8 bg-stone-100 rounded-lg animate-pulse" />
                  <div className="h-8 w-8 bg-stone-100 rounded-lg animate-pulse" />
                  <div className="h-8 w-8 bg-stone-100 rounded-lg animate-pulse" />
                </div>
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
          <h1 className="text-3xl font-bold text-stone-900 mb-1">Access Codes</h1>
          <p className="text-stone-600">Manage ebook access codes</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-5 rounded-xl transition-colors shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Create Code
        </button>
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

      {/* Redemptions Modal */}
      <AnimatePresence>
        {viewingRedemptions && (
          <RedemptionsModal
            codeId={viewingRedemptions}
            onClose={() => setViewingRedemptions(null)}
          />
        )}
      </AnimatePresence>

      {/* Codes Table */}
      {codes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">
            No access codes yet
          </h3>
          <p className="text-stone-600 mb-6">
            Create your first access code to get started.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create your first code
          </button>
        </div>
      ) : (
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
                  Expires
                </th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-4 px-5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {codes.map((code) => (
                <tr
                  key={code._id}
                  className="hover:bg-stone-50/50 transition-colors"
                >
                  <td className="py-4 px-5">
                    <span className="font-mono text-sm bg-stone-100 text-stone-700 px-2.5 py-1.5 rounded-lg">
                      {code.code}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-sm text-stone-600">
                    {code.description || (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-sm">
                    <span className="font-semibold text-stone-800">
                      {code.usedCount}
                    </span>
                    <span className="text-stone-400">
                      {code.maxUses ? ` / ${code.maxUses}` : " / ∞"}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-sm text-stone-600">
                    {code.expiresAt ? (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-stone-400" />
                        {formatDate(code.expiresAt)}
                      </span>
                    ) : (
                      <span className="text-stone-400">Never</span>
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
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingRedemptions(code._id)}
                        className="p-2 hover:bg-stone-100 rounded-lg transition-colors group"
                        title="View redemptions"
                      >
                        <Eye className="w-4 h-4 text-stone-400 group-hover:text-stone-600" />
                      </button>
                      <button
                        onClick={() => handleToggle(code._id)}
                        className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                        title={code.isActive ? "Deactivate" : "Activate"}
                      >
                        {code.isActive ? (
                          <ToggleRight className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-stone-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(code._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-stone-400 group-hover:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RedemptionsModal({
  codeId,
  onClose,
}: {
  codeId: Id<"ebookAccessCodes">;
  onClose: () => void;
}) {
  const redemptions = useQuery(api.ebookAccessCodes.getRedemptions, { codeId });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-b from-blue-50/80 to-white border-b border-stone-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-stone-900">
                Redemption History
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          {redemptions === undefined ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            </div>
          ) : redemptions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-stone-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-stone-400" />
              </div>
              <p className="text-stone-600">
                No redemptions yet for this code.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {redemptions.map((r, index) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-stone-50 rounded-xl border border-stone-100"
                >
                  <div className="flex items-center gap-2 text-sm text-stone-700 mb-1">
                    <Calendar className="w-4 h-4 text-stone-400" />
                    {formatDate(r.redeemedAt)}
                  </div>
                  {r.identifier && (
                    <p className="text-xs text-stone-500 mt-2">
                      ID: {r.identifier}
                    </p>
                  )}
                  {r.metadata?.referrer && (
                    <p className="text-xs text-stone-500">
                      Referrer: {r.metadata.referrer}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
