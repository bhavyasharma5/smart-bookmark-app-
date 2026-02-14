import { Bookmark } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900">
        <Bookmark className="h-8 w-8 text-gray-600" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-400">
        No bookmarks yet
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        Add your first bookmark above to get started.
      </p>
    </div>
  );
}
