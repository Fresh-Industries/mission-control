"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Search,
  RefreshCw,
  X,
  Download,
  Keyboard,
  Zap,
  Trash2,
  CheckSquare,
  Square,
  Filter,
  TrendingUp,
  BarChart3,
  List,
} from "lucide-react";
import { ItemDetailDrawer } from "@/components/ItemDetailDrawer";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

// Types
type Status = "pending" | "in-progress" | "approved" | "rejected";
type Category = "feature" | "workflow" | "template" | "research" | "automation";

interface FileData {
  name: string;
  content: string;
}

interface MissionItem {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: Status;
  created: string;
  updated: string;
  link?: string;
  notes?: string;
  files?: FileData[];
}

interface NewItemForm {
  title: string;
  description: string;
  category: Category;
  notes: string;
}

const statusConfig = {
  pending: {
    label: "Awaiting Approval",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: AlertCircle,
  },
  "in-progress": {
    label: "In Progress",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: AlertCircle,
  },
};

const categoryColors = {
  feature: "bg-purple-500/20 text-purple-400",
  workflow: "bg-blue-500/20 text-blue-400",
  template: "bg-yellow-500/20 text-yellow-400",
  research: "bg-emerald-500/20 text-emerald-400",
  automation: "bg-pink-500/20 text-pink-400",
};

export default function MissionControl() {
  const [items, setItems] = useState<MissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MissionItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<NewItemForm>({
    title: "",
    description: "",
    category: "feature",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"items" | "analytics">("items");

  // Fetch items from API
  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling every 10 seconds
  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 10000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  // Handle status change
  const handleStatusChange = async (id: string, status: Status) => {
    try {
      const res = await fetch("/api/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchItems(); // Refresh after change
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewItem({ title: "", description: "", category: "feature", notes: "" });
        fetchItems();
      }
    } catch (error) {
      console.error("Failed to add item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle item selection
  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Select all visible items
  const selectAllVisible = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((i) => i.id)));
    }
  };

  // Bulk approve
  const handleBulkApprove = async () => {
    if (selectedItems.size === 0) return;
    setBulkActionLoading(true);
    try {
      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulkStatus",
          ids: Array.from(selectedItems),
          status: "approved",
        }),
      });
      setSelectedItems(new Set());
      fetchItems();
    } catch (error) {
      console.error("Failed to bulk approve:", error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Bulk reject
  const handleBulkReject = async () => {
    if (selectedItems.size === 0) return;
    setBulkActionLoading(true);
    try {
      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulkStatus",
          ids: Array.from(selectedItems),
          status: "rejected",
        }),
      });
      setSelectedItems(new Set());
      fetchItems();
    } catch (error) {
      console.error("Failed to bulk reject:", error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Delete selected
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    setBulkActionLoading(true);
    try {
      for (const id of selectedItems) {
        await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", id }),
        });
      }
      setSelectedItems(new Set());
      fetchItems();
    } catch (error) {
      console.error("Failed to bulk delete:", error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesCategory && matchesSearch;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Title", "Description", "Category", "Status", "Created", "Updated", "Notes", "Link"];
    const rows = filteredItems.map((item) => [
      item.title,
      item.description || "",
      item.category,
      item.status,
      item.created,
      item.updated,
      item.notes || "",
      item.link || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mission-items-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const allItems = filteredItems;
      const currentIndex = selectedIndex;

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(Math.min(currentIndex + 1, allItems.length - 1));
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(Math.max(currentIndex - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (allItems[currentIndex]) {
            setSelectedItem(allItems[currentIndex]);
          }
          break;
        case "n":
          e.preventDefault();
          setShowAddModal(true);
          break;
        case "Escape":
          e.preventDefault();
          setSelectedItem(null);
          setKeyboardHelpOpen(false);
          break;
        case "?":
          e.preventDefault();
          setKeyboardHelpOpen(true);
          break;
        case " ":
          e.preventDefault();
          if (allItems[currentIndex]) {
            toggleSelectItem(allItems[currentIndex].id);
          }
          break;
        case "a":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleBulkApprove();
          }
          break;
        case "r":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleBulkReject();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredItems, selectedIndex, selectedItems]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedId = filteredItems[selectedIndex]?.id;
    if (selectedId && itemRefs.current[selectedId]) {
      itemRefs.current[selectedId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex, filteredItems]);

  const pendingItems = items.filter((i) => i.status === "pending");
  const inProgressItems = items.filter((i) => i.status === "in-progress");
  const approvedItems = items.filter((i) => i.status === "approved");

  // Category stats
  const categoryStats = {
    feature: items.filter((i) => i.category === "feature").length,
    workflow: items.filter((i) => i.category === "workflow").length,
    template: items.filter((i) => i.category === "template").length,
    research: items.filter((i) => i.category === "research").length,
    automation: items.filter((i) => i.category === "automation").length,
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Mission Control
              </h1>
              <p className="text-muted-foreground">
                Fresh Industries — Review, Approve, Deploy
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Tab Switcher */}
              <div className="flex items-center bg-card border border-border rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("items")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "items"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="w-4 h-4" />
                  Items
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "analytics"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </button>
              </div>
              
              {activeTab === "items" && lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              {activeTab === "items" && (
                <button
                  onClick={() => setKeyboardHelpOpen(true)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Keyboard shortcuts (?)"
                >
                  <Keyboard className="w-5 h-5" />
                </button>
              )}
              {activeTab === "items" && (
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg hover:bg-accent"
                  title="Export to CSV"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <AnalyticsDashboard items={items} />
        )}

        {/* Items Tab */}
        {activeTab === "items" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-500">
              {pendingItems.length}
            </div>
            <div className="text-sm text-muted-foreground">Awaiting Approval</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-500">
              {inProgressItems.length}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-green-500">
              {approvedItems.length}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-500">
              {categoryStats.feature}
            </div>
            <div className="text-sm text-muted-foreground">Features</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {items.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Status | "all")}
            className="bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Awaiting Approval</option>
            <option value="in-progress">In Progress</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | "all")}
            className="bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            title="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="feature">Features</option>
            <option value="workflow">Workflows</option>
            <option value="template">Templates</option>
            <option value="research">Research</option>
            <option value="automation">Automation</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedItems.size > 0 && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
            <span className="text-sm text-foreground">
              <CheckSquare className="w-4 h-4 inline mr-2" />
              {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkApprove}
                disabled={bulkActionLoading}
                className="bg-green-500/20 text-green-500 px-3 py-1.5 rounded text-sm hover:bg-green-500/30 disabled:opacity-50 flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={handleBulkReject}
                disabled={bulkActionLoading}
                className="bg-red-500/20 text-red-500 px-3 py-1.5 rounded text-sm hover:bg-red-500/30 disabled:opacity-50 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="bg-muted text-muted-foreground px-3 py-1.5 rounded text-sm hover:bg-red-500/20 hover:text-red-500 disabled:opacity-50 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-4 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            Loading items...
          </div>
        )}

        {/* Items Grid */}
        <div className="grid gap-6">
          {["pending", "in-progress", "approved"].map((status) => {
            const statusItems = filteredItems.filter(
              (i) => i.status === status
            );
            if (statusItems.length === 0) return null;

            const config = statusConfig[status as Status];

            return (
              <div key={status}>
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <config.icon className={`w-5 h-5 ${config.color}`} />
                  <span className={config.color}>{config.label}</span>
                  <span className="text-muted-foreground text-sm font-normal">
                    ({statusItems.length})
                  </span>
                </h2>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={selectAllVisible}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {selectedItems.size === filteredItems.length ? (
                      <CheckSquare className="w-3 h-3" />
                    ) : (
                      <Square className="w-3 h-3" />
                    )}
                    Select all in section
                  </button>
                </div>
                <div className="grid gap-4">
                  {statusItems.map((item, index) => (
                    <div
                      key={item.id}
                      ref={(el: HTMLDivElement | null) => {
                        itemRefs.current[item.id] = el;
                      }}
                      className={`bg-card border border-border rounded-lg p-4 transition-all cursor-pointer ${
                        selectedItems.has(item.id)
                          ? "ring-2 ring-primary border-primary/50 bg-primary/5"
                          : filteredItems[selectedIndex]?.id === item.id
                          ? "ring-2 ring-primary/50 border-primary/30"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => {
                        setSelectedItem(item);
                        setSelectedIndex(filteredItems.findIndex((i) => i.id === item.id));
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectItem(item.id);
                            }}
                            className="mt-1 text-muted-foreground hover:text-foreground"
                          >
                            {selectedItems.has(item.id) ? (
                              <CheckSquare className="w-4 h-4 text-primary" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  categoryColors[item.category]
                                }`}
                              >
                                {item.category}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {item.updated}
                              </span>
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.description}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground italic">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {item.status === "pending" && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(item.id, "approved");
                                }}
                                className="bg-green-500/20 text-green-500 px-3 py-1 rounded text-sm hover:bg-green-500/30"
                              >
                                Approve
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(item.id, "rejected");
                                }}
                                className="bg-red-500/20 text-red-500 px-3 py-1 rounded text-sm hover:bg-red-500/30"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
          </>
        )}

        {/* Keyboard Shortcuts Modal */}
        {keyboardHelpOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setKeyboardHelpOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { key: "j / ↓", action: "Next item" },
                  { key: "k / ↑", action: "Previous item" },
                  { key: "Space", action: "Toggle selection" },
                  { key: "Enter", action: "View item details" },
                  { key: "a", action: "Bulk approve selected" },
                  { key: "r", action: "Bulk reject selected" },
                  { key: "n", action: "Add new item" },
                  { key: "Esc", action: "Close modal/drawer" },
                  { key: "?", action: "Show this help" },
                ].map(({ key, action }) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground">{action}</span>
                    <kbd className="px-2 py-1 bg-accent rounded text-sm font-mono">{key}</kbd>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground text-center">
                Press any key to dismiss
              </p>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Add New Item</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter title..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Enter description..."
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as Category })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="feature">Feature</option>
                    <option value="workflow">Workflow</option>
                    <option value="template">Template</option>
                    <option value="research">Research</option>
                    <option value="automation">Automation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Notes / Context
                  </label>
                  <textarea
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Add notes, context, research findings..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-background border border-border px-4 py-2 rounded-lg text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !newItem.title.trim()}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {submitting ? "Adding..." : "Add Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Drawer */}
        <ItemDetailDrawer
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
