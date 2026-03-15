import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HighlightColor } from '@/constants/colors';

export interface Bookmark {
  id: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: number;
}

export interface Highlight {
  id: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  color: HighlightColor;
  text: string;
  createdAt: number;
}

export interface Note {
  id: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  noteText: string;
  verseText: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  isDark: boolean;
  fontSize: number;
  lastReadBook?: string;
  lastReadChapter?: number;
}

const KEYS = {
  BOOKMARKS: 'bible_bookmarks',
  HIGHLIGHTS: 'bible_highlights',
  NOTES: 'bible_notes',
  SETTINGS: 'bible_settings',
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
  return data ? JSON.parse(data) : [];
}

export async function addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<Bookmark> {
  const bookmarks = await getBookmarks();
  const newBookmark: Bookmark = {
    ...bookmark,
    id: generateId(),
    createdAt: Date.now(),
  };
  bookmarks.unshift(newBookmark);
  await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  return newBookmark;
}

export async function removeBookmark(bookId: string, chapter: number, verse: number): Promise<void> {
  const bookmarks = await getBookmarks();
  const filtered = bookmarks.filter(
    b => !(b.bookId === bookId && b.chapter === chapter && b.verse === verse)
  );
  await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(filtered));
}

export async function isBookmarked(bookId: string, chapter: number, verse: number): Promise<boolean> {
  const bookmarks = await getBookmarks();
  return bookmarks.some(b => b.bookId === bookId && b.chapter === chapter && b.verse === verse);
}

export async function getHighlights(): Promise<Highlight[]> {
  const data = await AsyncStorage.getItem(KEYS.HIGHLIGHTS);
  return data ? JSON.parse(data) : [];
}

export async function addHighlight(highlight: Omit<Highlight, 'id' | 'createdAt'>): Promise<Highlight> {
  let highlights = await getHighlights();
  highlights = highlights.filter(
    h => !(h.bookId === highlight.bookId && h.chapter === highlight.chapter && h.verse === highlight.verse)
  );
  const newHighlight: Highlight = {
    ...highlight,
    id: generateId(),
    createdAt: Date.now(),
  };
  highlights.unshift(newHighlight);
  await AsyncStorage.setItem(KEYS.HIGHLIGHTS, JSON.stringify(highlights));
  return newHighlight;
}

export async function removeHighlight(bookId: string, chapter: number, verse: number): Promise<void> {
  const highlights = await getHighlights();
  const filtered = highlights.filter(
    h => !(h.bookId === bookId && h.chapter === chapter && h.verse === verse)
  );
  await AsyncStorage.setItem(KEYS.HIGHLIGHTS, JSON.stringify(filtered));
}

export async function getHighlightForVerse(bookId: string, chapter: number, verse: number): Promise<Highlight | undefined> {
  const highlights = await getHighlights();
  return highlights.find(h => h.bookId === bookId && h.chapter === chapter && h.verse === verse);
}

export async function getNotes(): Promise<Note[]> {
  const data = await AsyncStorage.getItem(KEYS.NOTES);
  return data ? JSON.parse(data) : [];
}

export async function addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  let notes = await getNotes();
  notes = notes.filter(
    n => !(n.bookId === note.bookId && n.chapter === note.chapter && n.verse === note.verse)
  );
  const newNote: Note = {
    ...note,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  notes.unshift(newNote);
  await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  return newNote;
}

export async function updateNote(bookId: string, chapter: number, verse: number, noteText: string): Promise<void> {
  const notes = await getNotes();
  const index = notes.findIndex(n => n.bookId === bookId && n.chapter === chapter && n.verse === verse);
  if (index >= 0) {
    notes[index].noteText = noteText;
    notes[index].updatedAt = Date.now();
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  }
}

export async function removeNote(bookId: string, chapter: number, verse: number): Promise<void> {
  const notes = await getNotes();
  const filtered = notes.filter(
    n => !(n.bookId === bookId && n.chapter === chapter && n.verse === verse)
  );
  await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(filtered));
}

export async function getNoteForVerse(bookId: string, chapter: number, verse: number): Promise<Note | undefined> {
  const notes = await getNotes();
  return notes.find(n => n.bookId === bookId && n.chapter === chapter && n.verse === verse);
}

export async function getSettings(): Promise<AppSettings> {
  const data = await AsyncStorage.getItem(KEYS.SETTINGS);
  return data ? JSON.parse(data) : { isDark: false, fontSize: 18 };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}
