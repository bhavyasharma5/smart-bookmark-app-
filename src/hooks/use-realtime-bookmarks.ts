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

  useEffect(() => {
    // Channel for postgres DELETE/UPDATE events
    const pgChannel = supabase
      .channel("bookmarks-pg")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newBookmark = payload.new as Bookmark;
            setBookmarks((prev) => {
              if (prev.some((b) => b.id === newBookmark.id)) return prev;
              return [newBookmark, ...prev];
            });
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id: string }).id;
            setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Bookmark;
            setBookmarks((prev) =>
              prev.map((b) => (b.id === updated.id ? updated : b))
            );
          }
        }
      )
      .subscribe();

    // Broadcast channel for reliable cross-tab INSERT sync
    const broadcastChannel = supabase
      .channel("bookmarks-broadcast")
      .on("broadcast", { event: "new-bookmark" }, (payload) => {
        const newBookmark = payload.payload as Bookmark;
        setBookmarks((prev) => {
          if (prev.some((b) => b.id === newBookmark.id)) return prev;
          return [newBookmark, ...prev];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(pgChannel);
      supabase.removeChannel(broadcastChannel);
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
        // Add to local state
        setBookmarks((prev) => {
          if (prev.some((b) => b.id === newBookmark.id)) return prev;
          return [newBookmark as Bookmark, ...prev];
        });

        // Broadcast to other tabs
        supabase.channel("bookmarks-broadcast").send({
          type: "broadcast",
          event: "new-bookmark",
          payload: newBookmark,
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
