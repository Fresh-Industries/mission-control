"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileData {
  name: string;
  content: string;
}

interface FileViewerProps {
  file: FileData | null;
  onClose: () => void;
}

export function FileViewer({ file, onClose }: FileViewerProps) {
  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{file.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {file.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

interface FileListProps {
  files: FileData[];
  onFileClick: (file: FileData) => void;
}

export function FileList({ files, onFileClick }: FileListProps) {
  if (!files || files.length === 0) return null;

  return (
    <div className="bg-accent/50 rounded-lg p-4">
      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Attached Files ({files.length})
      </h4>
      <div className="space-y-2">
        {files.map((file, index) => (
          <button
            key={index}
            onClick={() => onFileClick(file)}
            className="w-full flex items-center gap-2 p-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm truncate">{file.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
