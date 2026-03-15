export interface BookMeta {
  id: string;
  name: string;
  englishName: string;
  chapters: number;
  testament: 'OT' | 'NT';
  category: string;
}

export const books: BookMeta[] = [
  { id: 'GEN', name: 'उत्पत्ती', englishName: 'Genesis', chapters: 50, testament: 'OT', category: 'पंचग्रंथ' },
  { id: 'EXO', name: 'निर्गम', englishName: 'Exodus', chapters: 40, testament: 'OT', category: 'पंचग्रंथ' },
  { id: 'LEV', name: 'लेवी', englishName: 'Leviticus', chapters: 27, testament: 'OT', category: 'पंचग्रंथ' },
  { id: 'NUM', name: 'गणना', englishName: 'Numbers', chapters: 36, testament: 'OT', category: 'पंचग्रंथ' },
  { id: 'DEU', name: 'अनुवाद', englishName: 'Deuteronomy', chapters: 34, testament: 'OT', category: 'पंचग्रंथ' },
  { id: 'JOS', name: 'यहोशवा', englishName: 'Joshua', chapters: 24, testament: 'OT', category: 'इतिहास' },
  { id: 'JDG', name: 'न्यायाधीश', englishName: 'Judges', chapters: 21, testament: 'OT', category: 'इतिहास' },
  { id: 'RUT', name: 'रूथ', englishName: 'Ruth', chapters: 4, testament: 'OT', category: 'इतिहास' },
  { id: '1SA', name: '१ शमुवेल', englishName: '1 Samuel', chapters: 31, testament: 'OT', category: 'इतिहास' },
  { id: '2SA', name: '२ शमुवेल', englishName: '2 Samuel', chapters: 24, testament: 'OT', category: 'इतिहास' },
  { id: '1KI', name: '१ राजा', englishName: '1 Kings', chapters: 22, testament: 'OT', category: 'इतिहास' },
  { id: '2KI', name: '२ राजा', englishName: '2 Kings', chapters: 25, testament: 'OT', category: 'इतिहास' },
  { id: '1CH', name: '१ इतिहास', englishName: '1 Chronicles', chapters: 29, testament: 'OT', category: 'इतिहास' },
  { id: '2CH', name: '२ इतिहास', englishName: '2 Chronicles', chapters: 36, testament: 'OT', category: 'इतिहास' },
  { id: 'EZR', name: 'एज्रा', englishName: 'Ezra', chapters: 10, testament: 'OT', category: 'इतिहास' },
  { id: 'NEH', name: 'नहेम्या', englishName: 'Nehemiah', chapters: 13, testament: 'OT', category: 'इतिहास' },
  { id: 'EST', name: 'एस्तेर', englishName: 'Esther', chapters: 10, testament: 'OT', category: 'इतिहास' },
  { id: 'JOB', name: 'ईयोब', englishName: 'Job', chapters: 42, testament: 'OT', category: 'काव्य' },
  { id: 'PSA', name: 'स्तोत्र', englishName: 'Psalms', chapters: 150, testament: 'OT', category: 'काव्य' },
  { id: 'PRO', name: 'नीतिसूत्रां', englishName: 'Proverbs', chapters: 31, testament: 'OT', category: 'काव्य' },
  { id: 'ECC', name: 'उपदेशक', englishName: 'Ecclesiastes', chapters: 12, testament: 'OT', category: 'काव्य' },
  { id: 'SNG', name: 'गीतरत्न', englishName: 'Song of Solomon', chapters: 8, testament: 'OT', category: 'काव्य' },
  { id: 'ISA', name: 'यशया', englishName: 'Isaiah', chapters: 66, testament: 'OT', category: 'प्रवादी' },
  { id: 'JER', name: 'यिर्मया', englishName: 'Jeremiah', chapters: 52, testament: 'OT', category: 'प्रवादी' },
  { id: 'LAM', name: 'विलाप', englishName: 'Lamentations', chapters: 5, testament: 'OT', category: 'प्रवादी' },
  { id: 'EZK', name: 'यहेज्केल', englishName: 'Ezekiel', chapters: 48, testament: 'OT', category: 'प्रवादी' },
  { id: 'DAN', name: 'दानीएल', englishName: 'Daniel', chapters: 12, testament: 'OT', category: 'प्रवादी' },
  { id: 'HOS', name: 'होशेय', englishName: 'Hosea', chapters: 14, testament: 'OT', category: 'प्रवादी' },
  { id: 'JOL', name: 'योएल', englishName: 'Joel', chapters: 3, testament: 'OT', category: 'प्रवादी' },
  { id: 'AMO', name: 'आमोस', englishName: 'Amos', chapters: 9, testament: 'OT', category: 'प्रवादी' },
  { id: 'OBA', name: 'ओबद्या', englishName: 'Obadiah', chapters: 1, testament: 'OT', category: 'प्रवादी' },
  { id: 'JON', name: 'योना', englishName: 'Jonah', chapters: 4, testament: 'OT', category: 'प्रवादी' },
  { id: 'MIC', name: 'मीखा', englishName: 'Micah', chapters: 7, testament: 'OT', category: 'प्रवादी' },
  { id: 'NAH', name: 'नाहूम', englishName: 'Nahum', chapters: 3, testament: 'OT', category: 'प्रवादी' },
  { id: 'HAB', name: 'हबक्कूक', englishName: 'Habakkuk', chapters: 3, testament: 'OT', category: 'प्रवादी' },
  { id: 'ZEP', name: 'सफन्या', englishName: 'Zephaniah', chapters: 3, testament: 'OT', category: 'प्रवादी' },
  { id: 'HAG', name: 'हाग्गय', englishName: 'Haggai', chapters: 2, testament: 'OT', category: 'प्रवादी' },
  { id: 'ZEC', name: 'जखऱ्या', englishName: 'Zechariah', chapters: 14, testament: 'OT', category: 'प्रवादी' },
  { id: 'MAL', name: 'मलाखी', englishName: 'Malachi', chapters: 4, testament: 'OT', category: 'प्रवादी' },
  { id: 'MAT', name: 'मत्तय', englishName: 'Matthew', chapters: 28, testament: 'NT', category: 'शुभवर्तमान' },
  { id: 'MRK', name: 'मार्क', englishName: 'Mark', chapters: 16, testament: 'NT', category: 'शुभवर्तमान' },
  { id: 'LUK', name: 'लूक', englishName: 'Luke', chapters: 24, testament: 'NT', category: 'शुभवर्तमान' },
  { id: 'JHN', name: 'योहान', englishName: 'John', chapters: 21, testament: 'NT', category: 'शुभवर्तमान' },
  { id: 'ACT', name: 'धर्मदूतांचीं कृत्यां', englishName: 'Acts', chapters: 28, testament: 'NT', category: 'इतिहास' },
  { id: 'ROM', name: 'रोमकारांक', englishName: 'Romans', chapters: 16, testament: 'NT', category: 'पत्रां' },
  { id: '1CO', name: '१ करिंथकारांक', englishName: '1 Corinthians', chapters: 16, testament: 'NT', category: 'पत्रां' },
  { id: '2CO', name: '२ करिंथकारांक', englishName: '2 Corinthians', chapters: 13, testament: 'NT', category: 'पत्रां' },
  { id: 'GAL', name: 'गलातियकारांक', englishName: 'Galatians', chapters: 6, testament: 'NT', category: 'पत्रां' },
  { id: 'EPH', name: 'एफेसकारांक', englishName: 'Ephesians', chapters: 6, testament: 'NT', category: 'पत्रां' },
  { id: 'PHP', name: 'फिलिप्पीकारांक', englishName: 'Philippians', chapters: 4, testament: 'NT', category: 'पत्रां' },
  { id: 'COL', name: 'कलस्सैकारांक', englishName: 'Colossians', chapters: 4, testament: 'NT', category: 'पत्रां' },
  { id: '1TH', name: '१ थेस्सलनीककारांक', englishName: '1 Thessalonians', chapters: 5, testament: 'NT', category: 'पत्रां' },
  { id: '2TH', name: '२ थेस्सलनीककारांक', englishName: '2 Thessalonians', chapters: 3, testament: 'NT', category: 'पत्रां' },
  { id: '1TI', name: '१ तीमथ्य', englishName: '1 Timothy', chapters: 6, testament: 'NT', category: 'पत्रां' },
  { id: '2TI', name: '२ तीमथ्य', englishName: '2 Timothy', chapters: 4, testament: 'NT', category: 'पत्रां' },
  { id: 'TIT', name: 'तीत', englishName: 'Titus', chapters: 3, testament: 'NT', category: 'पत्रां' },
  { id: 'PHM', name: 'फिलेमोन', englishName: 'Philemon', chapters: 1, testament: 'NT', category: 'पत्रां' },
  { id: 'HEB', name: 'इब्री', englishName: 'Hebrews', chapters: 13, testament: 'NT', category: 'पत्रां' },
  { id: 'JAS', name: 'याकोब', englishName: 'James', chapters: 5, testament: 'NT', category: 'सामान्य पत्रां' },
  { id: '1PE', name: '१ पेत्र', englishName: '1 Peter', chapters: 5, testament: 'NT', category: 'सामान्य पत्रां' },
  { id: '2PE', name: '२ पेत्र', englishName: '2 Peter', chapters: 3, testament: 'NT', category: 'सामान्य पत्रां' },
  { id: '1JN', name: '१ योहान', englishName: '1 John', chapters: 5, testament: 'NT', category: 'सामान्य पत्रां' },
  { id: '2JN', name: '२ योहान', englishName: '2 John', chapters: 1, testament: 'NT', category: 'सामान्य पत्रां' },
  { id: '3JN', name: '३ योहान', englishName: '3 John', chapters: 1, testament: 'NT', category: 'सामान्य पत्रां' },
  { id: 'JUD', name: 'यहूदा', englishName: 'Jude', chapters: 1, testament: 'NT', category: 'सामान्य पत्रां' },
  { id: 'REV', name: 'प्रकटीकरण', englishName: 'Revelation', chapters: 22, testament: 'NT', category: 'प्रकटीकरण' },
];

export const otBooks = books.filter(b => b.testament === 'OT');
export const ntBooks = books.filter(b => b.testament === 'NT');

export function getBook(id: string): BookMeta | undefined {
  return books.find(b => b.id === id);
}
