import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import * as storage from '@/lib/storage';
import type { Bookmark, Highlight, Note } from '@/lib/storage';
import type { HighlightColor } from '@/constants/colors';

interface UserDataContextValue {
  bookmarks: Bookmark[];
  highlights: Highlight[];
  notes: Note[];
  loading: boolean;
  addBookmark: (data: Omit<Bookmark, 'id' | 'createdAt'>) => Promise<void>;
  removeBookmark: (bookId: string, chapter: number, verse: number) => Promise<void>;
  isBookmarked: (bookId: string, chapter: number, verse: number) => boolean;
  addHighlight: (data: Omit<Highlight, 'id' | 'createdAt'>) => Promise<void>;
  removeHighlight: (bookId: string, chapter: number, verse: number) => Promise<void>;
  getHighlightColor: (bookId: string, chapter: number, verse: number) => HighlightColor | null;
  addNote: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (bookId: string, chapter: number, verse: number, noteText: string) => Promise<void>;
  removeNote: (bookId: string, chapter: number, verse: number) => Promise<void>;
  getNoteForVerse: (bookId: string, chapter: number, verse: number) => Note | undefined;
  refresh: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextValue | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [b, h, n] = await Promise.all([
      storage.getBookmarks(),
      storage.getHighlights(),
      storage.getNotes(),
    ]);
    setBookmarks(b);
    setHighlights(h);
    setNotes(n);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addBookmark = useCallback(async (data: Omit<Bookmark, 'id' | 'createdAt'>) => {
    await storage.addBookmark(data);
    await refresh();
  }, [refresh]);

  const removeBookmark = useCallback(async (bookId: string, chapter: number, verse: number) => {
    await storage.removeBookmark(bookId, chapter, verse);
    await refresh();
  }, [refresh]);

  const isBookmarked = useCallback((bookId: string, chapter: number, verse: number) => {
    return bookmarks.some(b => b.bookId === bookId && b.chapter === chapter && b.verse === verse);
  }, [bookmarks]);

  const addHighlight = useCallback(async (data: Omit<Highlight, 'id' | 'createdAt'>) => {
    await storage.addHighlight(data);
    await refresh();
  }, [refresh]);

  const removeHighlight = useCallback(async (bookId: string, chapter: number, verse: number) => {
    await storage.removeHighlight(bookId, chapter, verse);
    await refresh();
  }, [refresh]);

  const getHighlightColor = useCallback((bookId: string, chapter: number, verse: number): HighlightColor | null => {
    const h = highlights.find(hl => hl.bookId === bookId && hl.chapter === chapter && hl.verse === verse);
    return h ? h.color : null;
  }, [highlights]);

  const addNote = useCallback(async (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    await storage.addNote(data);
    await refresh();
  }, [refresh]);

  const updateNote = useCallback(async (bookId: string, chapter: number, verse: number, noteText: string) => {
    await storage.updateNote(bookId, chapter, verse, noteText);
    await refresh();
  }, [refresh]);

  const removeNote = useCallback(async (bookId: string, chapter: number, verse: number) => {
    await storage.removeNote(bookId, chapter, verse);
    await refresh();
  }, [refresh]);

  const getNoteForVerse = useCallback((bookId: string, chapter: number, verse: number) => {
    return notes.find(n => n.bookId === bookId && n.chapter === chapter && n.verse === verse);
  }, [notes]);

  const value = useMemo(() => ({
    bookmarks, highlights, notes, loading,
    addBookmark, removeBookmark, isBookmarked,
    addHighlight, removeHighlight, getHighlightColor,
    addNote, updateNote, removeNote, getNoteForVerse,
    refresh,
  }), [bookmarks, highlights, notes, loading, isBookmarked, getHighlightColor, getNoteForVerse]);

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
