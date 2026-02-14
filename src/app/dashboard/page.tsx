import { createClient } from "@/lib/supabase/server";
import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import type { Bookmark } from "@/lib/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <BookmarkList initialBookmarks={(bookmarks as Bookmark[]) ?? []} />
  );
}
