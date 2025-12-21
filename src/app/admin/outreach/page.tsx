"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  Users,
  Clock,
  CheckCircle2,
  ChevronDown,
  Copy,
  Check,
  Mail,
  X,
  Building2,
  Loader2,
  Save,
  FileText,
  Plus,
  LayoutDashboard,
  UserCircle,
  Trash2,
} from "lucide-react";
import type { Id, Doc } from "../../../../convex/_generated/dataModel";

type OutreachContact = Doc<"outreachContacts">;

const tierNames: Record<number, string> = {
  1: "Inner Circle",
  2: "Academic",
  3: "IDEO & Design",
  4: "Thought Leaders",
};

const tierColors: Record<number, { badge: string; bg: string }> = {
  1: { badge: "bg-primary text-white", bg: "from-amber-50 to-orange-50" },
  2: { badge: "bg-blue-500 text-white", bg: "from-blue-50 to-indigo-50" },
  3: { badge: "bg-purple-500 text-white", bg: "from-purple-50 to-violet-50" },
  4: { badge: "bg-stone-500 text-white", bg: "from-stone-100 to-stone-50" },
};

// Inline editable field component
function InlineEditField({
  value,
  onChange,
  onSave,
  type = "text",
  className = "",
  placeholder = "",
  rows,
}: {
  value: string;
  onChange: (value: string) => void;
  onSave: (value: string) => void;
  type?: "text" | "email" | "textarea";
  className?: string;
  placeholder?: string;
  rows?: number;
}) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (newValue: string) => {
    onChange(newValue);

    // Debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      onSave(newValue);
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={rows || 6}
        className={`w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none ${className}`}
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm ${className}`}
    />
  );
}

export default function OutreachPage() {
  const contacts = useQuery(api.outreach.list);
  const stats = useQuery(api.outreach.getStats);
  const toggleSent = useMutation(api.outreach.toggleSent);
  const updateContact = useMutation(api.outreach.update);
  const createContact = useMutation(api.outreach.create);
  const deleteContact = useMutation(api.outreach.remove);

  // View state: "dashboard" or "contacts"
  const [activeView, setActiveView] = useState<"dashboard" | "contacts">("dashboard");

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "sent">("all");
  const [collapsedTiers, setCollapsedTiers] = useState<Set<number>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Add contact modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    organization: "",
    tier: 1,
    background: "",
    relationship: "",
    context: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Context panel state (for background/relationship/context)
  const [selectedContact, setSelectedContact] = useState<OutreachContact | null>(null);
  const [editBackground, setEditBackground] = useState("");
  const [editRelationship, setEditRelationship] = useState("");
  const [editContext, setEditContext] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [savingField, setSavingField] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Local edit state for inline fields (keyed by contact ID)
  const [editingFields, setEditingFields] = useState<Record<string, {
    name: string;
    email: string;
    organization: string;
    emailSubject: string;
    emailBody: string;
  }>>({});
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set());

  // Initialize editing fields when contacts load
  useEffect(() => {
    if (contacts) {
      const newEditingFields: typeof editingFields = {};
      for (const contact of contacts) {
        if (!editingFields[contact._id]) {
          newEditingFields[contact._id] = {
            name: contact.name,
            email: contact.email,
            organization: contact.organization,
            emailSubject: contact.emailSubject,
            emailBody: contact.emailBody,
          };
        }
      }
      if (Object.keys(newEditingFields).length > 0) {
        setEditingFields(prev => ({ ...prev, ...newEditingFields }));
      }
    }
  }, [contacts]);

  // Sync context fields when selectedContact changes
  useEffect(() => {
    if (selectedContact) {
      setEditBackground(selectedContact.background || "");
      setEditRelationship(selectedContact.relationship || "");
      setEditContext(selectedContact.context || "");
      setEditEmail(selectedContact.email);
      setSavedField(null);
    }
  }, [selectedContact?._id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Auto-save a field with debouncing
  const autoSaveField = useCallback(
    (field: "email" | "background" | "relationship" | "context", value: string) => {
      if (!selectedContact) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        setSavingField(field);
        try {
          await updateContact({
            id: selectedContact._id,
            [field]: value,
          });
          setSavedField(field);
          // Clear saved indicator after 2 seconds
          setTimeout(() => setSavedField(null), 2000);
        } catch (err) {
          console.error(`Failed to save ${field}:`, err);
        } finally {
          setSavingField(null);
        }
      }, 800);
    },
    [selectedContact, updateContact]
  );

  const handleToggleSent = async (id: Id<"outreachContacts">) => {
    try {
      await toggleSent({ id });
    } catch (err) {
      console.error("Failed to toggle sent status:", err);
    }
  };

  const handleCreateContact = async () => {
    if (!newContact.name || !newContact.email || !newContact.organization) {
      return;
    }
    setIsCreating(true);
    try {
      await createContact({
        name: newContact.name,
        email: newContact.email,
        organization: newContact.organization,
        tier: newContact.tier,
        emailSubject: "", // Will be AI-generated later
        emailBody: "", // Will be AI-generated later
        background: newContact.background || undefined,
        relationship: newContact.relationship || undefined,
        context: newContact.context || undefined,
      });
      setShowAddModal(false);
      setNewContact({
        name: "",
        email: "",
        organization: "",
        tier: 1,
        background: "",
        relationship: "",
        context: "",
      });
    } catch (err) {
      console.error("Failed to create contact:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteContact = async (id: Id<"outreachContacts">) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await deleteContact({ id });
      if (selectedContact?._id === id) {
        setSelectedContact(null);
      }
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };

  const handleCopy = async (text: string, fieldId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleTier = (tier: number) => {
    setCollapsedTiers((prev) => {
      const next = new Set(prev);
      if (next.has(tier)) {
        next.delete(tier);
      } else {
        next.add(tier);
      }
      return next;
    });
  };

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleInlineSave = async (
    contactId: Id<"outreachContacts">,
    field: "name" | "email" | "organization" | "emailSubject" | "emailBody",
    value: string
  ) => {
    setSavingFields(prev => new Set(prev).add(`${contactId}-${field}`));
    try {
      await updateContact({
        id: contactId,
        [field]: value,
      });
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSavingFields(prev => {
        const next = new Set(prev);
        next.delete(`${contactId}-${field}`);
        return next;
      });
    }
  };

  const updateEditingField = (
    contactId: string,
    field: keyof typeof editingFields[string],
    value: string
  ) => {
    setEditingFields(prev => ({
      ...prev,
      [contactId]: {
        ...prev[contactId],
        [field]: value,
      },
    }));
  };

  const openMailto = (contact: OutreachContact) => {
    const fields = editingFields[contact._id];
    const subject = encodeURIComponent(fields?.emailSubject || contact.emailSubject);
    const body = encodeURIComponent(fields?.emailBody || contact.emailBody);
    const email = fields?.email || contact.email;
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  // Filter contacts
  const filteredContacts =
    contacts?.filter((c) => {
      // Status filter
      if (filter === "sent" && !c.isSent) return false;
      if (filter === "pending" && c.isSent) return false;

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(search) ||
          c.organization.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.emailSubject.toLowerCase().includes(search)
        );
      }
      return true;
    }) ?? [];

  // Group by tier
  const contactsByTier: Record<number, OutreachContact[]> = {};
  for (const contact of filteredContacts) {
    if (!contactsByTier[contact.tier]) {
      contactsByTier[contact.tier] = [];
    }
    contactsByTier[contact.tier].push(contact);
  }

  const isLoading = contacts === undefined || stats === undefined;

  const statCards = [
    {
      label: "Total Contacts",
      value: stats?.total ?? 0,
      icon: Users,
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200/50",
    },
    {
      label: "Sent",
      value: stats?.sent ?? 0,
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-500",
      bgColor: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-200/50",
    },
    {
      label: "Pending",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "from-amber-500 to-orange-500",
      bgColor: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200/50",
    },
  ];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-5xl">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-9 w-48 bg-stone-200 rounded-lg animate-pulse mb-2" />
            <div className="h-5 w-64 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[...Array(3)].map((_, i) => (
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

        {/* Search & Filter Skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-80 bg-stone-100 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-20 bg-stone-100 rounded-full animate-pulse" />
            ))}
          </div>
        </div>

        {/* Cards Skeleton */}
        <div className="space-y-6">
          {[...Array(2)].map((_, tierIdx) => (
            <div key={tierIdx}>
              <div className="h-8 w-40 bg-stone-200 rounded animate-pulse mb-3" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-stone-200 animate-pulse" />
                      <div className="flex-1">
                        <div className="h-5 w-32 bg-stone-200 rounded animate-pulse mb-2" />
                        <div className="h-4 w-48 bg-stone-100 rounded animate-pulse" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-9 w-24 bg-stone-100 rounded-lg animate-pulse" />
                        <div className="h-9 w-24 bg-stone-100 rounded-lg animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-1">GTM Outreach</h1>
          <p className="text-stone-600">Track and send your outreach campaign emails</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveView("dashboard")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeView === "dashboard"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveView("contacts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeView === "contacts"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <UserCircle className="w-4 h-4" />
          Contacts
        </button>
      </div>

      {/* Dashboard View */}
      {activeView === "dashboard" && (
        <>
          {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
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
              <p className="text-4xl font-bold text-stone-900 mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-stone-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "sent"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredContacts.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center">
            <Search className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-800 mb-2">
            {searchTerm ? "No results found" : "No contacts yet"}
          </h3>
          <p className="text-stone-500">
            {searchTerm
              ? `No contacts match "${searchTerm}"`
              : "Add contacts to start tracking your outreach"}
          </p>
        </div>
      )}

      {/* Tier Sections */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((tier) => {
          const tierContacts = contactsByTier[tier];
          if (!tierContacts || tierContacts.length === 0) return null;

          const isCollapsed = collapsedTiers.has(tier);
          const colors = tierColors[tier];

          return (
            <div key={tier}>
              {/* Tier Header */}
              <button
                onClick={() => toggleTier(tier)}
                className="flex items-center gap-3 w-full p-2 -ml-2 rounded-lg hover:bg-stone-100 transition-colors mb-3"
              >
                <span className={`text-xs font-bold px-2 py-1 rounded ${colors.badge}`}>
                  Tier {tier}
                </span>
                <h2 className="text-sm font-semibold text-stone-700">{tierNames[tier]}</h2>
                <span className="text-xs text-stone-400 font-medium">
                  {tierContacts.length} contact{tierContacts.length !== 1 ? "s" : ""}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 ml-auto transition-transform ${
                    isCollapsed ? "-rotate-90" : ""
                  }`}
                />
              </button>

              {/* Contact Cards */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {tierContacts.map((contact) => {
                      const isExpanded = expandedCards.has(contact._id);
                      const fields = editingFields[contact._id] || {
                        name: contact.name,
                        email: contact.email,
                        organization: contact.organization,
                        emailSubject: contact.emailSubject,
                        emailBody: contact.emailBody,
                      };

                      return (
                        <div
                          key={contact._id}
                          className={`bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all shadow-sm hover:border-stone-300 hover:shadow ${
                            contact.isSent ? "opacity-60" : ""
                          }`}
                        >
                          {/* Card Header */}
                          <div
                            onClick={() => toggleCard(contact._id)}
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {/* Status Dot */}
                              <div
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  contact.isSent ? "bg-emerald-500" : "bg-primary"
                                }`}
                              />
                              {/* Contact Info - Click name to open context panel */}
                              <div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedContact(contact);
                                  }}
                                  className="font-semibold text-stone-800 hover:text-primary transition-colors text-left"
                                >
                                  {contact.name}
                                </button>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-stone-500">{contact.organization}</span>
                                  <span className="text-primary">{contact.email}</span>
                                </div>
                              </div>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openMailto(contact);
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-colors"
                              >
                                <Mail className="w-4 h-4" />
                                Send
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSent(contact._id);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${
                                  contact.isSent
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300"
                                }`}
                              >
                                {contact.isSent ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Sent
                                  </>
                                ) : (
                                  "Mark Sent"
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedContact(contact);
                                }}
                                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                                title="View context & notes"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <ChevronDown
                                className={`w-4 h-4 text-stone-400 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </div>

                          {/* Expanded Content - Inline Editing */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.15 }}
                                className="border-t border-stone-100"
                              >
                                <div className="p-4 space-y-4">
                                  {/* Contact Details Row */}
                                  <div className="grid grid-cols-3 gap-3">
                                    <div>
                                      <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                                        Name
                                      </label>
                                      <InlineEditField
                                        value={fields.name}
                                        onChange={(v) => updateEditingField(contact._id, "name", v)}
                                        onSave={(v) => handleInlineSave(contact._id, "name", v)}
                                        className="font-medium text-stone-800"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                                        Organization
                                      </label>
                                      <InlineEditField
                                        value={fields.organization}
                                        onChange={(v) => updateEditingField(contact._id, "organization", v)}
                                        onSave={(v) => handleInlineSave(contact._id, "organization", v)}
                                        className="text-stone-600"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                                        Email
                                      </label>
                                      <InlineEditField
                                        value={fields.email}
                                        onChange={(v) => updateEditingField(contact._id, "email", v)}
                                        onSave={(v) => handleInlineSave(contact._id, "email", v)}
                                        type="email"
                                        className="text-primary"
                                      />
                                    </div>
                                  </div>

                                  {/* Subject */}
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                                        Subject
                                      </label>
                                      <button
                                        onClick={() =>
                                          handleCopy(fields.emailSubject, `subject-${contact._id}`)
                                        }
                                        className="flex items-center gap-1 text-xs text-stone-400 hover:text-primary transition-colors"
                                      >
                                        {copiedField === `subject-${contact._id}` ? (
                                          <>
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-emerald-500">Copied</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <InlineEditField
                                      value={fields.emailSubject}
                                      onChange={(v) => updateEditingField(contact._id, "emailSubject", v)}
                                      onSave={(v) => handleInlineSave(contact._id, "emailSubject", v)}
                                      className="font-medium text-stone-700"
                                    />
                                  </div>

                                  {/* Body */}
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                                        Body
                                      </label>
                                      <button
                                        onClick={() =>
                                          handleCopy(fields.emailBody, `body-${contact._id}`)
                                        }
                                        className="flex items-center gap-1 text-xs text-stone-400 hover:text-primary transition-colors"
                                      >
                                        {copiedField === `body-${contact._id}` ? (
                                          <>
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-emerald-500">Copied</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <InlineEditField
                                      value={fields.emailBody}
                                      onChange={(v) => updateEditingField(contact._id, "emailBody", v)}
                                      onSave={(v) => handleInlineSave(contact._id, "emailBody", v)}
                                      type="textarea"
                                      rows={8}
                                      className="text-stone-600"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
        </>
      )}

      {/* Contacts View */}
      {activeView === "contacts" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
            />
          </div>

          {/* Contacts Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wide px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wide px-4 py-3">Organization</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wide px-4 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wide px-4 py-3">Tier</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-stone-500 uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact._id}
                    onClick={() => setSelectedContact(contact)}
                    className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-stone-900">
                        {contact.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">{contact.organization}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${contact.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-primary hover:underline"
                      >
                        {contact.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${tierColors[contact.tier].badge}`}>
                        T{contact.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          contact.isSent
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {contact.isSent ? "Sent" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContact(contact._id);
                          }}
                          className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredContacts.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center">
                  <Users className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-2">
                  {searchTerm ? "No results found" : "No contacts yet"}
                </h3>
                <p className="text-stone-500 mb-4">
                  {searchTerm
                    ? `No contacts match "${searchTerm}"`
                    : "Add your first contact to get started"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Contact
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/40 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-900">Add New Contact</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">
                      Organization *
                    </label>
                    <input
                      type="text"
                      value={newContact.organization}
                      onChange={(e) => setNewContact({ ...newContact, organization: e.target.value })}
                      placeholder="Acme Inc"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">
                      Tier
                    </label>
                    <select
                      value={newContact.tier}
                      onChange={(e) => setNewContact({ ...newContact, tier: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-sm"
                    >
                      <option value={1}>Tier 1 - Inner Circle</option>
                      <option value={2}>Tier 2 - Academic</option>
                      <option value={3}>Tier 3 - IDEO & Design</option>
                      <option value={4}>Tier 4 - Thought Leaders</option>
                    </select>
                  </div>
                </div>
                {/* Background */}
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-0.5">
                    Background
                  </label>
                  <p className="text-xs text-stone-400 mb-1.5">Who they are, their work, books, focus areas</p>
                  <textarea
                    value={newContact.background}
                    onChange={(e) => setNewContact({ ...newContact, background: e.target.value })}
                    placeholder="e.g. Founder & CEO of Founders Institute — the world's largest pre-seed startup accelerator..."
                    rows={3}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-sm resize-none"
                  />
                </div>
                {/* Relationship */}
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-0.5">
                    Relationship
                  </label>
                  <p className="text-xs text-stone-400 mb-1.5">How you know them — warm intro, cold outreach, shared history</p>
                  <textarea
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    placeholder="e.g. Fellow FI mentor. Selcuk is part of the FI mentor network..."
                    rows={2}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-sm resize-none"
                  />
                </div>
                {/* Context */}
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-0.5">
                    Context
                  </label>
                  <p className="text-xs text-stone-400 mb-1.5">The angle, why it's relevant to them, what you're asking for</p>
                  <textarea
                    value={newContact.context}
                    onChange={(e) => setNewContact({ ...newContact, context: e.target.value })}
                    placeholder="e.g. Framework was cited on FI blog — ask for curriculum integration..."
                    rows={3}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateContact}
                  disabled={isCreating || !newContact.name || !newContact.email || !newContact.organization}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Contact
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Context Side Panel - for relationship notes */}
      <AnimatePresence>
        {selectedContact && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContact(null)}
              className="fixed inset-0 bg-black/20 z-40"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-stone-900">Context & Notes</h2>
                  {savingField && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </div>
                  )}
                  {!savingField && savedField && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <Save className="w-3.5 h-3.5" />
                      Saved
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Contact Header - Compact */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                      tierColors[selectedContact.tier].bg
                    } flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-base font-bold text-primary">
                      {selectedContact.name[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-stone-900 truncate">
                        {selectedContact.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tierColors[selectedContact.tier].badge}`}>
                        T{selectedContact.tier}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          selectedContact.isSent
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {selectedContact.isSent ? "Sent" : "Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 truncate">{selectedContact.organization}</p>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => {
                      setEditEmail(e.target.value);
                      autoSaveField("email", e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-sm text-primary"
                  />
                </div>

                {/* Background Section */}
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-0.5">
                    Background
                  </label>
                  <p className="text-xs text-stone-400 mb-1.5">Who they are, their work, books, focus areas</p>
                  <textarea
                    value={editBackground}
                    onChange={(e) => {
                      setEditBackground(e.target.value);
                      autoSaveField("background", e.target.value);
                    }}
                    placeholder="e.g. Founder & CEO of Founders Institute — the world's largest pre-seed startup accelerator..."
                    rows={4}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-sm text-stone-700 resize-none"
                  />
                </div>

                {/* Relationship Section */}
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-0.5">
                    Relationship
                  </label>
                  <p className="text-xs text-stone-400 mb-1.5">How you know them — warm intro, cold outreach, shared history</p>
                  <textarea
                    value={editRelationship}
                    onChange={(e) => {
                      setEditRelationship(e.target.value);
                      autoSaveField("relationship", e.target.value);
                    }}
                    placeholder="e.g. Fellow FI mentor. Selcuk is part of the FI mentor network..."
                    rows={3}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-sm text-stone-700 resize-none"
                  />
                </div>

                {/* Context Section */}
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-0.5">
                    Context
                  </label>
                  <p className="text-xs text-stone-400 mb-1.5">The angle, why it's relevant to them, what you're asking for</p>
                  <textarea
                    value={editContext}
                    onChange={(e) => {
                      setEditContext(e.target.value);
                      autoSaveField("context", e.target.value);
                    }}
                    placeholder="e.g. Framework was cited on FI blog — ask for curriculum integration..."
                    rows={5}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-sm text-stone-700 resize-none"
                  />
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
