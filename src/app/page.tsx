"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Search,
  RefreshCw,
} from "lucide-react";
import { ItemDetailDrawer } from "@/components/ItemDetailDrawer";

// Types
type Status = "pending" | "in-progress" | "approved" | "rejected";
type Category = "feature" | "workflow" | "template" | "research" | "automation";

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
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MissionItem | null>(null);

  // Fetch items from API
  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
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

  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingItems = items.filter((i) => i.status === "pending");
  const inProgressItems = items.filter((i) => i.status === "in-progress");
  const approvedItems = items.filter((i) => i.status === "approved");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Mission Control
          </h1>
          <p className="text-muted-foreground">
            Fresh Industries — Review, Approve, Deploy
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
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
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

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
                <div className="grid gap-4">
                  {statusItems.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-start justify-between">
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
