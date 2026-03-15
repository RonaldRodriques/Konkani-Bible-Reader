import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  StyleSheet, Text, View, FlatList, Pressable, Platform,
  Share, Modal, TextInput, Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserData } from "@/contexts/UserDataContext";
import { getBook } from "@/data/bible-meta";
import { getChapterContent, getAvailableChapters, type BibleItem, type BibleVerse } from "@/data/bible-content";
import Colors from "@/constants/colors";
import type { HighlightColor } from "@/constants/colors";

const HIGHLIGHT_COLORS: { color: HighlightColor; label: string }[] = [
  { color: 'yellow', label: 'पिवळो' },
  { color: 'green', label: 'हिरवो' },
  { color: 'blue', label: 'निळो' },
  { color: 'pink', label: 'गुलाबी' },
  { color: 'orange', label: 'नारिंगी' },
];

const TTS_LANG = 'hi-IN';

export default function ReaderScreen() {
  const { colors, isDark, fontSize } = useTheme();
  const { addBookmark, removeBookmark, isBookmarked, addHighlight, removeHighlight, getHighlightColor, addNote, getNoteForVerse, removeNote } = useUserData();
  const insets = useSafeAreaInsets();
  const { bookId, chapter: chapterStr } = useLocalSearchParams<{ bookId: string; chapter: string }>();
  const chapter = parseInt(chapterStr || '1', 10);
  const book = getBook(bookId || '');
  const content = getChapterContent(bookId || '', chapter);
  const availableChapters = getAvailableChapters(bookId || '');
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentReadingVerse, setCurrentReadingVerse] = useState<number | null>(null);
  const [showTtsControls, setShowTtsControls] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(0.85);
  const readingQueueRef = useRef<BibleVerse[]>([]);
  const readingIndexRef = useRef(0);
  const isStoppingRef = useRef(false);
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const highlightColorMap: Record<string, string> = isDark
    ? Colors.dark.highlight
    : Colors.light.highlight;

  useEffect(() => {
    if (isSpeaking && !isPaused) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSpeaking, isPaused]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, [bookId, chapter]);

  const getVerses = useCallback((): BibleVerse[] => {
    if (!content) return [];
    return content.filter((item): item is BibleVerse => item.type === 'verse');
  }, [content]);

  const speakVerse = useCallback((verse: BibleVerse, queue: BibleVerse[], index: number) => {
    if (isStoppingRef.current) return;
    setCurrentReadingVerse(verse.num);

    const verseIndex = content?.findIndex(
      item => item.type === 'verse' && (item as BibleVerse).num === verse.num
    );
    if (verseIndex !== undefined && verseIndex >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: verseIndex, animated: true, viewPosition: 0.3 });
    }

    Speech.speak(verse.text, {
      language: TTS_LANG,
      rate: ttsSpeed,
      pitch: 1.0,
      onDone: () => {
        if (isStoppingRef.current) return;
        const nextIndex = index + 1;
        if (nextIndex < queue.length) {
          readingIndexRef.current = nextIndex;
          speakVerse(queue[nextIndex], queue, nextIndex);
        } else {
          setIsSpeaking(false);
          setCurrentReadingVerse(null);
          setShowTtsControls(false);
          readingQueueRef.current = [];
          readingIndexRef.current = 0;
        }
      },
      onStopped: () => {
        if (isStoppingRef.current) {
          setIsSpeaking(false);
          setCurrentReadingVerse(null);
          isStoppingRef.current = false;
        }
      },
      onError: () => {
        setIsSpeaking(false);
        setCurrentReadingVerse(null);
      },
    });
  }, [content, ttsSpeed]);

  const startReadAloud = useCallback((fromVerse?: number) => {
    const verses = getVerses();
    if (verses.length === 0) return;

    Speech.stop();
    isStoppingRef.current = false;

    let startIdx = 0;
    if (fromVerse !== undefined) {
      const idx = verses.findIndex(v => v.num === fromVerse);
      if (idx >= 0) startIdx = idx;
    }

    readingQueueRef.current = verses;
    readingIndexRef.current = startIdx;
    setIsSpeaking(true);
    setIsPaused(false);
    setShowTtsControls(true);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    speakVerse(verses[startIdx], verses, startIdx);
  }, [getVerses, speakVerse]);

  const stopReadAloud = useCallback(() => {
    isStoppingRef.current = true;
    Speech.stop();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentReadingVerse(null);
    setShowTtsControls(false);
    readingQueueRef.current = [];
    readingIndexRef.current = 0;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const pauseResume = useCallback(async () => {
    if (isPaused) {
      setIsPaused(false);
      const queue = readingQueueRef.current;
      const idx = readingIndexRef.current;
      if (queue.length > 0 && idx < queue.length) {
        speakVerse(queue[idx], queue, idx);
      }
    } else {
      Speech.stop();
      setIsPaused(true);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isPaused, speakVerse]);

  const skipVerse = useCallback((dir: number) => {
    const queue = readingQueueRef.current;
    const newIdx = readingIndexRef.current + dir;
    if (newIdx >= 0 && newIdx < queue.length) {
      Speech.stop();
      isStoppingRef.current = false;
      readingIndexRef.current = newIdx;
      speakVerse(queue[newIdx], queue, newIdx);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [speakVerse]);

  const handleVerseLongPress = useCallback((verse: BibleVerse) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVerse(verse);
    setShowActions(true);
  }, []);

  const handleBookmarkToggle = async () => {
    if (!selectedVerse || !book) return;
    if (isBookmarked(bookId!, chapter, selectedVerse.num)) {
      await removeBookmark(bookId!, chapter, selectedVerse.num);
    } else {
      await addBookmark({
        bookId: bookId!,
        bookName: book.name,
        chapter,
        verse: selectedVerse.num,
        text: selectedVerse.text,
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowActions(false);
  };

  const handleHighlightSelect = async (color: HighlightColor) => {
    if (!selectedVerse || !book) return;
    const currentColor = getHighlightColor(bookId!, chapter, selectedVerse.num);
    if (currentColor === color) {
      await removeHighlight(bookId!, chapter, selectedVerse.num);
    } else {
      await addHighlight({
        bookId: bookId!,
        bookName: book.name,
        chapter,
        verse: selectedVerse.num,
        color,
        text: selectedVerse.text,
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowHighlightPicker(false);
    setShowActions(false);
  };

  const handleShare = async () => {
    if (!selectedVerse || !book) return;
    await Share.share({
      message: `"${selectedVerse.text}"\n\n— ${book.name} ${chapter}:${selectedVerse.num}\n\nकोंकणी बायबल`,
    });
    setShowActions(false);
  };

  const handleOpenNote = () => {
    if (!selectedVerse) return;
    const existingNote = getNoteForVerse(bookId!, chapter, selectedVerse.num);
    setNoteText(existingNote?.noteText || '');
    setShowActions(false);
    setShowNoteModal(true);
  };

  const handleSaveNote = async () => {
    if (!selectedVerse || !book) return;
    if (noteText.trim()) {
      await addNote({
        bookId: bookId!,
        bookName: book.name,
        chapter,
        verse: selectedVerse.num,
        noteText: noteText.trim(),
        verseText: selectedVerse.text,
      });
    } else {
      await removeNote(bookId!, chapter, selectedVerse.num);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowNoteModal(false);
  };

  const handleReadFromVerse = () => {
    if (!selectedVerse) return;
    setShowActions(false);
    startReadAloud(selectedVerse.num);
  };

  const navigateChapter = (dir: number) => {
    const newChapter = chapter + dir;
    if (book && newChapter >= 1 && newChapter <= book.chapters) {
      stopReadAloud();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.replace({
        pathname: "/reader",
        params: { bookId: bookId!, chapter: newChapter.toString() },
      });
    }
  };

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Book not found</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: BibleItem }) => {
    if (item.type === 'section') {
      return (
        <Text style={[styles.sectionHeader, {
          color: colors.sectionHeader,
          fontFamily: "NotoSansDevanagari_700Bold",
          fontSize: fontSize + 2,
        }]}>
          {item.text}
        </Text>
      );
    }

    const verseHighlight = getHighlightColor(bookId!, chapter, item.num);
    const verseBookmarked = isBookmarked(bookId!, chapter, item.num);
    const verseNote = getNoteForVerse(bookId!, chapter, item.num);
    const isBeingRead = currentReadingVerse === item.num;
    const bgColor = isBeingRead
      ? (isDark ? 'rgba(196, 145, 61, 0.2)' : 'rgba(196, 145, 61, 0.15)')
      : verseHighlight
        ? highlightColorMap[verseHighlight]
        : 'transparent';

    return (
      <Pressable
        onLongPress={() => handleVerseLongPress(item)}
        onPress={() => {
          if (isSpeaking) {
            const verses = getVerses();
            const idx = verses.findIndex(v => v.num === item.num);
            if (idx >= 0) {
              Speech.stop();
              isStoppingRef.current = false;
              readingQueueRef.current = verses;
              readingIndexRef.current = idx;
              setIsPaused(false);
              speakVerse(verses[idx], verses, idx);
            }
          }
        }}
        style={({ pressed }) => [
          styles.verseRow,
          { backgroundColor: bgColor, opacity: pressed ? 0.85 : 1 },
          (verseHighlight || isBeingRead) && styles.verseHighlighted,
          isBeingRead && { borderLeftWidth: 3, borderLeftColor: colors.accent },
        ]}
      >
        <Text style={[styles.verseNum, {
          color: isBeingRead ? colors.accent : colors.verseNumber,
          fontSize: fontSize - 4,
          fontFamily: isBeingRead ? "NotoSansDevanagari_700Bold" : "NotoSansDevanagari_600SemiBold",
        }]}>
          {item.num}
        </Text>
        <View style={styles.verseTextContainer}>
          <Text style={[styles.verseText, {
            color: colors.text,
            fontFamily: "NotoSansDevanagari_400Regular",
            fontSize,
            lineHeight: fontSize * 1.7,
          }]}>
            {item.text}
          </Text>
          {(verseBookmarked || verseNote) && (
            <View style={styles.verseIndicators}>
              {verseBookmarked && <Ionicons name="bookmark" size={12} color={colors.accent} />}
              {verseNote && <Ionicons name="document-text" size={12} color={colors.accent} />}
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 8 }]}>
        <Pressable onPress={() => { stopReadAloud(); router.back(); }} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={() => router.push({ pathname: "/chapters", params: { bookId: bookId! } })}
          style={styles.headerCenter}
        >
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "NotoSansDevanagari_600SemiBold" }]}>
            {book.name} {chapter}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {book.englishName}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if (isSpeaking) {
              stopReadAloud();
            } else {
              startReadAloud();
            }
          }}
          hitSlop={12}
          style={styles.headerBtn}
        >
          <Animated.View style={{ opacity: isSpeaking ? pulseAnim : 1 }}>
            <Ionicons
              name={isSpeaking ? "volume-high" : "volume-medium-outline"}
              size={24}
              color={isSpeaking ? colors.accent : colors.text}
            />
          </Animated.View>
        </Pressable>
      </View>

      {content ? (
        <FlatList
          ref={flatListRef}
          data={content}
          keyExtractor={(item, index) => `${item.type}-${item.type === 'verse' ? item.num : index}`}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: showTtsControls ? 180 : 120,
            paddingTop: 8,
          }}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={(info) => {
            flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
          }}
          ListFooterComponent={
            <View style={styles.navRow}>
              <Pressable
                onPress={() => navigateChapter(-1)}
                disabled={chapter <= 1}
                style={[styles.navBtn, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: chapter <= 1 ? 0.4 : 1,
                }]}
              >
                <Ionicons name="chevron-back" size={18} color={colors.text} />
                <Text style={[styles.navText, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]}>
                  आदलो
                </Text>
              </Pressable>
              <Text style={[styles.navChapter, { color: colors.textTertiary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
                {chapter} / {book.chapters}
              </Text>
              <Pressable
                onPress={() => navigateChapter(1)}
                disabled={chapter >= book.chapters}
                style={[styles.navBtn, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: chapter >= book.chapters ? 0.4 : 1,
                }]}
              >
                <Text style={[styles.navText, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]}>
                  फुडलो
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.text} />
              </Pressable>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
            ह्या अध्यायाचो मजकूर रेंदेर आसा
          </Text>
          <Text style={[styles.emptyHint, { color: colors.textTertiary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
            उपलब्ध अध्याय: {availableChapters.join(', ') || 'नात'}
          </Text>
        </View>
      )}

      {showTtsControls && (
        <View style={[styles.ttsBar, {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 8),
        }]}>
          <View style={styles.ttsInfo}>
            <Animated.View style={{ opacity: pulseAnim }}>
              <Ionicons name="volume-high" size={16} color={colors.accent} />
            </Animated.View>
            <Text style={[styles.ttsLabel, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]} numberOfLines={1}>
              {book.name} {chapter}:{currentReadingVerse || '—'}
            </Text>
          </View>

          <View style={styles.ttsSpeedRow}>
            {[0.6, 0.85, 1.0, 1.3].map(speed => (
              <Pressable
                key={speed}
                onPress={() => { setTtsSpeed(speed); Haptics.selectionAsync(); }}
                style={[
                  styles.speedBtn,
                  { borderColor: colors.border },
                  ttsSpeed === speed && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.speedText, {
                  color: ttsSpeed === speed ? '#fff' : colors.textSecondary,
                }]}>
                  {speed}x
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.ttsControls}>
            <Pressable onPress={() => skipVerse(-1)} hitSlop={12} style={styles.ttsControlBtn}>
              <Ionicons name="play-skip-back" size={22} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={pauseResume}
              style={[styles.ttsPlayBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name={isPaused ? "play" : "pause"} size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable onPress={() => skipVerse(1)} hitSlop={12} style={styles.ttsControlBtn}>
              <Ionicons name="play-skip-forward" size={22} color={colors.text} />
            </Pressable>
            <Pressable onPress={stopReadAloud} hitSlop={12} style={styles.ttsControlBtn}>
              <Ionicons name="stop" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      )}

      <Modal visible={showActions} transparent animationType="fade" onRequestClose={() => setShowActions(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowActions(false)}>
          <View style={[styles.actionSheet, { backgroundColor: colors.surface }]}>
            {selectedVerse && (
              <Text style={[styles.actionVerseRef, { color: colors.primary, fontFamily: "NotoSansDevanagari_600SemiBold" }]}>
                {book.name} {chapter}:{selectedVerse.num}
              </Text>
            )}

            <Pressable onPress={handleReadFromVerse} style={styles.actionRow}>
              <Ionicons name="volume-medium-outline" size={22} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]}>
                हांगासून वाच
              </Text>
            </Pressable>

            <Pressable onPress={handleBookmarkToggle} style={styles.actionRow}>
              <Ionicons
                name={selectedVerse && isBookmarked(bookId!, chapter, selectedVerse.num) ? "bookmark" : "bookmark-outline"}
                size={22}
                color={colors.accent}
              />
              <Text style={[styles.actionText, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]}>
                {selectedVerse && isBookmarked(bookId!, chapter, selectedVerse.num) ? "बुकमार्क काड" : "बुकमार्क कर"}
              </Text>
            </Pressable>

            <Pressable onPress={() => { setShowActions(false); setShowHighlightPicker(true); }} style={styles.actionRow}>
              <Ionicons name="color-palette-outline" size={22} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]}>
                हायलायट कर
              </Text>
            </Pressable>

            <Pressable onPress={handleOpenNote} style={styles.actionRow}>
              <Ionicons name="document-text-outline" size={22} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]}>
                टिपण बरय
              </Text>
            </Pressable>

            <Pressable onPress={handleShare} style={styles.actionRow}>
              <Ionicons name="share-outline" size={22} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]}>
                वांटून घे
              </Text>
            </Pressable>

            <Pressable onPress={() => setShowActions(false)} style={[styles.actionRow, styles.actionCancel]}>
              <Text style={[styles.cancelText, { color: colors.textSecondary, fontFamily: "NotoSansDevanagari_500Medium" }]}>
                बंद कर
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showHighlightPicker} transparent animationType="fade" onRequestClose={() => setShowHighlightPicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowHighlightPicker(false)}>
          <View style={[styles.actionSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.actionVerseRef, { color: colors.primary, fontFamily: "NotoSansDevanagari_600SemiBold" }]}>
              रंग निवडात
            </Text>
            <View style={styles.colorRow}>
              {HIGHLIGHT_COLORS.map(({ color }) => {
                const isActive = selectedVerse && getHighlightColor(bookId!, chapter, selectedVerse.num) === color;
                return (
                  <Pressable
                    key={color}
                    onPress={() => handleHighlightSelect(color)}
                    style={[
                      styles.colorBtn,
                      { backgroundColor: highlightColorMap[color] },
                      isActive && { borderWidth: 3, borderColor: colors.primary },
                    ]}
                  />
                );
              })}
            </View>
            {selectedVerse && getHighlightColor(bookId!, chapter, selectedVerse.num) && (
              <Pressable
                onPress={async () => {
                  await removeHighlight(bookId!, chapter, selectedVerse.num);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setShowHighlightPicker(false);
                }}
                style={styles.actionRow}
              >
                <Ionicons name="close-circle-outline" size={22} color={colors.textSecondary} />
                <Text style={[styles.actionText, { color: colors.textSecondary, fontFamily: "NotoSansDevanagari_500Medium" }]}>
                  हायलायट काड
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showNoteModal} transparent animationType="slide" onRequestClose={() => setShowNoteModal(false)}>
        <View style={styles.noteModalOverlay}>
          <View style={[styles.noteModal, { backgroundColor: colors.surface }]}>
            <View style={styles.noteHeader}>
              <Text style={[styles.noteTitle, { color: colors.text, fontFamily: "NotoSansDevanagari_600SemiBold" }]}>
                टिपण
              </Text>
              <Pressable onPress={() => setShowNoteModal(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            {selectedVerse && (
              <Text style={[styles.noteVerseRef, { color: colors.primary, fontFamily: "NotoSansDevanagari_500Medium" }]}>
                {book.name} {chapter}:{selectedVerse.num}
              </Text>
            )}
            <TextInput
              style={[styles.noteInput, {
                color: colors.text,
                backgroundColor: colors.surfaceSecondary,
                fontFamily: "NotoSansDevanagari_400Regular",
                borderColor: colors.border,
              }]}
              placeholder="तुमचें टिपण हांगा बरयात..."
              placeholderTextColor={colors.textTertiary}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              textAlignVertical="top"
            />
            <Pressable
              onPress={handleSaveNote}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.saveBtnText, { fontFamily: "NotoSansDevanagari_600SemiBold" }]}>
                सांबाळ
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18 },
  headerSub: { fontSize: 12, marginTop: 1 },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  verseRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginBottom: 2,
  },
  verseHighlighted: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginHorizontal: -4,
  },
  verseNum: {
    width: 28,
    textAlign: "right",
    marginRight: 8,
    marginTop: 4,
  },
  verseTextContainer: { flex: 1 },
  verseText: {},
  verseIndicators: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
    paddingVertical: 8,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  navText: { fontSize: 14 },
  navChapter: { fontSize: 13 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyText: { fontSize: 16, textAlign: "center" },
  emptyHint: { fontSize: 13, textAlign: "center" },
  errorText: { fontSize: 16, textAlign: "center", marginTop: 100 },
  ttsBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  ttsInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  ttsLabel: { fontSize: 14, flex: 1 },
  ttsSpeedRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    justifyContent: "center",
  },
  speedBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  speedText: { fontSize: 12, fontWeight: "600" },
  ttsControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  ttsControlBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ttsPlayBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  actionSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  actionVerseRef: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  actionText: { fontSize: 16 },
  actionCancel: {
    justifyContent: "center",
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 16,
  },
  cancelText: { fontSize: 16, textAlign: "center" },
  colorRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  colorBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  noteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  noteModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  noteTitle: { fontSize: 18 },
  noteVerseRef: { fontSize: 14, marginBottom: 12 },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
