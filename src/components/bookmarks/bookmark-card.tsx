"use client";

import { motion } from "framer-motion";
import { Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import type { Bookmark } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";

type BookmarkCardProps = {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
};

export function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3 transition-colors hover:border-gray-700 hover:bg-gray-900"
    >
      {/* Favicon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-800">
        {bookmark.favicon ? (
          <Image
            src={bookmark.favicon}
            alt=""
            width={20}
            height={20}
            className="rounded-sm"
            unoptimized
          />
        ) : (
          <ExternalLink className="h-4 w-4 text-gray-500" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-gray-100">
          {bookmark.title}
        </h3>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-indigo-400"
        >
          <span className="truncate">{bookmark.url}</span>
          <ExternalLink className="hidden h-3 w-3 shrink-0 group-hover/link:block" />
        </a>
      </div>

      {/* Date */}
      <span className="hidden shrink-0 text-xs text-gray-600 sm:block">
        {formatDate(bookmark.created_at)}
      </span>

      {/* Delete button */}
      <button
        onClick={() => onDelete(bookmark.id)}
        className="shrink-0 rounded-lg p-2 text-gray-600 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
        aria-label="Delete bookmark"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
