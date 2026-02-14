"use client";

import { useRealtimeBookmarks } from "@/hooks/use-realtime-bookmarks";
import { BookmarkCard } from "./bookmark-card";
import { BookmarkForm } from "./bookmark-form";
import { EmptyState } from "./empty-state";
import { AnimatePresence, motion } from "framer-motion";
import type { Bookmark } from "@/lib/types/database";

type BookmarkListProps = {
  initialBookmarks: Bookmark[];
};

export function BookmarkList({ initialBookmarks }: BookmarkListProps) {
  const { bookmarks, error, addBookmark, deleteBookmark } =
    useRealtimeBookmarks(initialBookmarks);

  return (
    <div className="space-y-6">
      <BookmarkForm onAdd={addBookmark} />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </motion.div>
      )}

      {bookmarks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onDelete={deleteBookmark}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
