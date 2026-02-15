"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Bookmark, BookmarkInsert } from "@/lib/types/database";
import { getFaviconUrl } from "@/lib/utils";

export function useRealtimeBookmarks(initialBookmarks: Bookmark[]) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // Realtime subscription — runs once on mount
  useEffect(() => {
    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          const newBookmark = payload.new as Bookmark;
          setBookmarks((prev) => {
            if (prev.some((b) => b.id === newBookmark.id)) return prev;
            return [newBookmark, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          const deletedId = payload.old.id as string;
          setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          const updated = payload.new as Bookmark;
          setBookmarks((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const addBookmark = useCallback(
    async (data: BookmarkInsert) => {
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be signed in to add bookmarks");
        return false;
      }

      const favicon = getFaviconUrl(data.url);

      const { data: newBookmark, error: insertError } = await supabase
        .from("bookmarks")
        .insert({ ...data, favicon, user_id: user.id })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return false;
      }

      if (newBookmark) {
        setBookmarks((prev) => {
          if (prev.some((b) => b.id === newBookmark.id)) return prev;
          return [newBookmark as Bookmark, ...prev];
        });
      }

      return true;
    },
    [supabase]
  );

  const deleteBookmark = useCallback(
    async (id: string) => {
      setError(null);

      setBookmarks((prev) => {
        const previous = prev;
        const next = prev.filter((b) => b.id !== id);

        // Fire delete in background, rollback on error
        supabase
          .from("bookmarks")
          .delete()
          .eq("id", id)
          .then(({ error: deleteError }) => {
            if (deleteError) {
              setBookmarks(previous);
              setError(deleteError.message);
            }
          });

        return next;
      });
    },
    [supabase]
  );

  return { bookmarks, error, addBookmark, deleteBookmark };
}
