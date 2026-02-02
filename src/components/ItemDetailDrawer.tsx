"use client";

import { X, ExternalLink, Calendar, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionItem {
  id: string;
  title: string;
  description: string;
  category: "feature" | "workflow" | "template" | "research" | "automation";
  status: "pending" | "in-progress" | "approved" | "rejected";
  created: string;
  updated: string;
  link?: string;
  notes?: string;
}

interface ItemDetailDrawerProps {
  item: MissionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: MissionItem["status"]) => void;
}

const statusLabels = {
  pending: "Awaiting Approval",
  "in-progress": "In Progress",
  approved: "Approved",
  rejected: "Rejected",
};

const statusColors = {
  pending: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  "in-progress": "text-blue-500 bg-blue-500/10 border-blue-500/20",
  approved: "text-green-500 bg-green-500/10 border-green-500/20",
  rejected: "text-red-500 bg-red-500/10 border-red-500/20",
};

const categoryColors = {
  feature: "bg-purple-500/20 text-purple-400",
  workflow: "bg-blue-500/20 text-blue-400",
  template: "bg-yellow-500/20 text-yellow-400",
  research: "bg-emerald-500/20 text-emerald-400",
  automation: "bg-pink-500/20 text-pink-400",
};

export function ItemDetailDrawer({
  item,
  isOpen,
  onClose,
  onStatusChange,
}: ItemDetailDrawerProps) {
  if (!item) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 shadow-xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Item Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Category & Status */}
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  categoryColors[item.category]
                )}
              >
                {item.category}
              </span>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium border",
                  statusColors[item.status]
                )}
              >
                {statusLabels[item.status]}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold">{item.title}</h3>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {item.description}
            </p>

            {/* Notes */}
            {item.notes && (
              <div className="bg-accent/50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Notes
                </h4>
                <p className="text-sm text-muted-foreground">{item.notes}</p>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Created: {item.created}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Updated: {item.updated}</span>
              </div>
            </div>

            {/* Link */}
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                View Resource
              </a>
            )}
          </div>

          {/* Footer Actions */}
          {item.status === "pending" && (
            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => {
                  onStatusChange(item.id, "approved");
                  onClose();
                }}
                className="flex-1 bg-green-500/20 text-green-500 py-3 rounded-lg font-medium hover:bg-green-500/30 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  onStatusChange(item.id, "rejected");
                  onClose();
                }}
                className="flex-1 bg-red-500/20 text-red-500 py-3 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
