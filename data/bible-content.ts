export interface BibleVerse {
  type: 'verse';
  num: number;
  text: string;
}

export interface BibleSection {
  type: 'section';
  text: string;
}

export type BibleItem = BibleVerse | BibleSection;

export type BookData = Record<string, BibleItem[]>;
export type BibleContent = Record<string, BookData>;

import { genesis } from './ot/genesis';
import { exodus } from './ot/exodus';
import { leviticus } from './ot/leviticus';
import { numbers } from './ot/numbers';
import { deuteronomy } from './ot/deuteronomy';
import { joshua } from './ot/joshua';
import { judges } from './ot/judges';
import { ruth } from './ot/ruth';
import { samuel1 } from './ot/samuel1';
import { samuel2 } from './ot/samuel2';
import { kings1 } from './ot/kings1';
import { kings2 } from './ot/kings2';
import { chronicles1 } from './ot/chronicles1';
import { chronicles2 } from './ot/chronicles2';
import { ezra } from './ot/ezra';
import { nehemiah } from './ot/nehemiah';
import { esther } from './ot/esther';
import { job } from './ot/job';
import { psalms } from './ot/psalms';
import { proverbs } from './ot/proverbs';
import { ecclesiastes } from './ot/ecclesiastes';
import { songOfSolomon } from './ot/song';
import { isaiah } from './ot/isaiah';
import { jeremiah } from './ot/jeremiah';
import { lamentations } from './ot/lamentations';
import { ezekiel } from './ot/ezekiel';
import { daniel } from './ot/daniel';
import { hosea } from './ot/hosea';
import { joel } from './ot/joel';
import { amos } from './ot/amos';
import { obadiah } from './ot/obadiah';
import { jonah } from './ot/jonah';
import { micah } from './ot/micah';
import { nahum } from './ot/nahum';
import { habakkuk } from './ot/habakkuk';
import { zephaniah } from './ot/zephaniah';
import { haggai } from './ot/haggai';
import { zechariah } from './ot/zechariah';
import { malachi } from './ot/malachi';
import { matthew } from './nt/matthew';
import { john } from './nt/john';
import { romans } from './nt/romans';
import { revelation } from './nt/revelation';

export const bibleContent: BibleContent = {
  GEN: genesis,
  EXO: exodus,
  LEV: leviticus,
  NUM: numbers,
  DEU: deuteronomy,
  JOS: joshua,
  JDG: judges,
  RUT: ruth,
  '1SA': samuel1,
  '2SA': samuel2,
  '1KI': kings1,
  '2KI': kings2,
  '1CH': chronicles1,
  '2CH': chronicles2,
  EZR: ezra,
  NEH: nehemiah,
  EST: esther,
  JOB: job,
  PSA: psalms,
  PRO: proverbs,
  ECC: ecclesiastes,
  SNG: songOfSolomon,
  ISA: isaiah,
  JER: jeremiah,
  LAM: lamentations,
  EZK: ezekiel,
  DAN: daniel,
  HOS: hosea,
  JOL: joel,
  AMO: amos,
  OBA: obadiah,
  JON: jonah,
  MIC: micah,
  NAH: nahum,
  HAB: habakkuk,
  ZEP: zephaniah,
  HAG: haggai,
  ZEC: zechariah,
  MAL: malachi,
  MAT: matthew,
  JHN: john,
  ROM: romans,
  REV: revelation,
};

export function getChapterContent(bookId: string, chapter: number): BibleItem[] | null {
  const book = bibleContent[bookId];
  if (!book) return null;
  return book[chapter.toString()] || null;
}

export function searchBible(query: string, bookId?: string): { bookId: string; chapter: number; verse: BibleVerse }[] {
  const results: { bookId: string; chapter: number; verse: BibleVerse }[] = [];
  const lowerQuery = query.toLowerCase();

  const booksToSearch = bookId ? { [bookId]: bibleContent[bookId] } : bibleContent;

  for (const [bId, chapters] of Object.entries(booksToSearch)) {
    if (!chapters) continue;
    for (const [chapterNum, items] of Object.entries(chapters)) {
      for (const item of items) {
        if (item.type === 'verse' && item.text.toLowerCase().includes(lowerQuery)) {
          results.push({
            bookId: bId,
            chapter: parseInt(chapterNum),
            verse: item,
          });
        }
      }
    }
  }

  return results;
}

export function getAvailableChapters(bookId: string): number[] {
  const book = bibleContent[bookId];
  if (!book) return [];
  return Object.keys(book).map(Number).sort((a, b) => a - b);
}
