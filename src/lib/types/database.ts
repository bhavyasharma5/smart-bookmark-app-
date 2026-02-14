export type Bookmark = {
  id: string;
  user_id: string;
  url: string;
  title: string;
  favicon: string | null;
  created_at: string;
};

export type BookmarkInsert = {
  url: string;
  title: string;
  favicon?: string | null;
};
