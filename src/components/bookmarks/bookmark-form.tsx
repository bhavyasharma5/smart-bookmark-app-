"use client";

import { useState } from "react";
import { Plus, Link as LinkIcon } from "lucide-react";
import { isValidUrl } from "@/lib/utils";
import type { BookmarkInsert } from "@/lib/types/database";

type BookmarkFormProps = {
  onAdd: (data: BookmarkInsert) => Promise<boolean>;
};

export function BookmarkForm({ onAdd }: BookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const trimmedUrl = url.trim();
    const trimmedTitle = title.trim();

    if (!trimmedUrl) {
      setValidationError("URL is required");
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      setValidationError("Please enter a valid URL (include https://)");
      return;
    }

    if (!trimmedTitle) {
      setValidationError("Title is required");
      return;
    }

    setLoading(true);
    const success = await onAdd({ url: trimmedUrl, title: trimmedTitle });
    setLoading(false);

    if (success) {
      setUrl("");
      setTitle("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* URL input */}
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setValidationError("");
            }}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 py-3 pl-10 pr-4 text-sm text-gray-100 placeholder-gray-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Title input */}
        <input
          type="text"
          placeholder="Bookmark title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setValidationError("");
          }}
          className="flex-1 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-400 active:scale-95 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {validationError && (
        <p className="text-xs text-red-400">{validationError}</p>
      )}
    </form>
  );
}
