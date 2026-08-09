"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "./Header";
import { UploadCard } from "./UploadCard";
import { SearchBar } from "./SearchBar";
import { NotesList } from "./NotesList";
import { DataManager } from "./DataManager";
import { api, type Note } from "@/lib/ui";
import type { SessionUser } from "@/lib/auth";

export default function HomePage({ user }: { user: SessionUser | null }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"words" | "phrase">("words");
  const [dataManagerOpen, setDataManagerOpen] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadNotes = useCallback(async () => {
    if (searchQuery.trim()) {
      const res = await api<{ notes: Note[]; q: string }>(
        `/api/search?q=${encodeURIComponent(searchQuery)}&mode=${searchMode}`
      );
      setNotes(res.notes || []);
    } else {
      const res = await api<Note[]>("/api/notes");
      setNotes(res);
    }
  }, [searchQuery, searchMode]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  async function handleNoteUpdate(id: number, content: string) {
    await api(`/api/notes/${id}`, "PATCH", { content });
    setRefreshKey((k) => k + 1);
  }

  async function handleNoteDelete(id: number) {
    await api(`/api/notes/${id}`, "DELETE");
    loadNotes();
  }

  function handleSearchChange(query: string) {
    setSearchQuery(query);
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        user={user}
        onToggleSearch={() => setSearchOpen((s) => !s)}
        searchOpen={searchOpen}
      />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Upload Card */}
        <section>
          <UploadCard
            onNoteAdded={() => { loadNotes(); setRefreshKey((k) => k + 1); }}
            onOpenDataManager={() => setDataManagerOpen(true)}
            onUploadSuccess={(msg) => { setUploadMsg(msg); setTimeout(() => setUploadMsg(""), 3000); }}
          />
          {uploadMsg && (
            <p className="mt-2 animate-fade-in text-center text-sm font-medium text-green-600">
              {uploadMsg}
            </p>
          )}
        </section>

        {/* Search Bar */}
        {searchOpen && (
          <section>
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              mode={searchMode}
              onModeChange={setSearchMode}
            />
          </section>
        )}

        {/* Notes List */}
        <section>
          <NotesList
            notes={notes}
            onUpdate={handleNoteUpdate}
            onDelete={handleNoteDelete}
            onRefresh={loadNotes}
          />
        </section>
      </main>

      {/* Data Manager Modal */}
      <DataManager
        open={dataManagerOpen}
        onClose={() => setDataManagerOpen(false)}
      />
    </div>
  );
}