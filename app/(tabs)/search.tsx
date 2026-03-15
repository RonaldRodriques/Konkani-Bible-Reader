import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet, Text, View, FlatList, Pressable, TextInput, Platform,
  Modal, Animated, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useTheme } from "@/contexts/ThemeContext";
import { searchBible, type BibleVerse } from "@/data/bible-content";
import { books, getBook } from "@/data/bible-meta";

interface SearchResult {
  bookId: string;
  chapter: number;
  verse: BibleVerse;
}

const VOICE_COMMANDS = [
  { pattern: /उत्पत्ति.*अध्याय\s*(\d+)/i, bookId: 'GEN', extract: 'chapter' },
  { pattern: /genesis.*chapter\s*(\d+)/i, bookId: 'GEN', extract: 'chapter' },
  { pattern: /स्तोत्र\s*(\d+)/i, bookId: 'PSA', extract: 'chapter' },
  { pattern: /psalm\s*(\d+)/i, bookId: 'PSA', extract: 'chapter' },
  { pattern: /मात्तेव.*अध्याय\s*(\d+)/i, bookId: 'MAT', extract: 'chapter' },
  { pattern: /matthew.*chapter\s*(\d+)/i, bookId: 'MAT', extract: 'chapter' },
  { pattern: /जुवांव.*अध्याय\s*(\d+)/i, bookId: 'JHN', extract: 'chapter' },
  { pattern: /john.*chapter\s*(\d+)/i, bookId: 'JHN', extract: 'chapter' },
  { pattern: /रोमकारांक.*अध्याय\s*(\d+)/i, bookId: 'ROM', extract: 'chapter' },
  { pattern: /romans.*chapter\s*(\d+)/i, bookId: 'ROM', extract: 'chapter' },
  { pattern: /उजवाडणी.*अध्याय\s*(\d+)/i, bookId: 'REV', extract: 'chapter' },
  { pattern: /revelation.*chapter\s*(\d+)/i, bookId: 'REV', extract: 'chapter' },
];

function parseVoiceCommand(text: string): { type: 'navigate'; bookId: string; chapter: number } | { type: 'search'; query: string } | null {
  const cleaned = text.trim().toLowerCase();

  for (const cmd of VOICE_COMMANDS) {
    const match = cleaned.match(cmd.pattern);
    if (match) {
      const chapter = parseInt(match[1], 10);
      if (!isNaN(chapter) && chapter > 0) {
        return { type: 'navigate', bookId: cmd.bookId, chapter };
      }
    }
  }

  if (cleaned.length > 1) {
    return { type: 'search', query: text.trim() };
  }

  return null;
}

export default function SearchScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      const ring = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(ringAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
      pulse.start();
      ring.start();
      return () => { pulse.stop(); ring.stop(); };
    } else {
      pulseAnim.setValue(1);
      ringAnim.setValue(0);
    }
  }, [isListening]);

  const handleSearch = useCallback(() => {
    if (query.trim().length < 2) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const searchResults = searchBible(query.trim(), selectedBook);
    setResults(searchResults);
    setHasSearched(true);
  }, [query, selectedBook]);

  const processVoiceResult = useCallback((text: string) => {
    const result = parseVoiceCommand(text);
    if (!result) return;

    if (result.type === 'navigate') {
      setShowVoiceModal(false);
      setIsListening(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({
        pathname: "/reader",
        params: { bookId: result.bookId, chapter: result.chapter.toString() },
      });
    } else {
      setShowVoiceModal(false);
      setIsListening(false);
      setQuery(result.query);
      const searchResults = searchBible(result.query, selectedBook);
      setResults(searchResults);
      setHasSearched(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [selectedBook]);

  const startVoiceSearch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setVoiceText('');
    setShowVoiceModal(true);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsListening(true);
        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setVoiceText(transcript);
          if (event.results[0].isFinal) {
            setIsListening(false);
            processVoiceResult(transcript);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } else {
        setIsListening(false);
      }
    } else {
      setIsListening(false);
    }
  }, [processVoiceResult]);

  const handleVoiceSubmit = useCallback(() => {
    if (voiceText.trim().length > 0) {
      processVoiceResult(voiceText);
    }
  }, [voiceText, processVoiceResult]);

  const highlightText = (text: string, q: string) => {
    if (!q) return <Text>{text}</Text>;
    const lowerText = text.toLowerCase();
    const lowerQ = q.toLowerCase();
    const idx = lowerText.indexOf(lowerQ);
    if (idx === -1) return <Text>{text}</Text>;
    return (
      <Text>
        {text.substring(0, idx)}
        <Text style={{ backgroundColor: colors.highlight.yellow, fontFamily: "NotoSansDevanagari_600SemiBold" }}>
          {text.substring(idx, idx + q.length)}
        </Text>
        {text.substring(idx + q.length)}
      </Text>
    );
  };

  const renderResult = ({ item }: { item: SearchResult }) => {
    const book = getBook(item.bookId);
    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({
            pathname: "/reader",
            params: { bookId: item.bookId, chapter: item.chapter.toString() },
          });
        }}
        style={({ pressed }) => [
          styles.resultItem,
          { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <View style={styles.resultHeader}>
          <Text style={[styles.resultRef, { color: colors.primary, fontFamily: "NotoSansDevanagari_600SemiBold" }]}>
            {book?.name} {item.chapter}:{item.verse.num}
          </Text>
          <Text style={[styles.resultEnglish, { color: colors.textTertiary }]}>
            {book?.englishName}
          </Text>
        </View>
        <Text
          style={[styles.resultText, { color: colors.text, fontFamily: "NotoSansDevanagari_400Regular" }]}
          numberOfLines={3}
        >
          {highlightText(item.verse.text, query.trim())}
        </Text>
      </Pressable>
    );
  };

  const readAloudResult = (item: SearchResult) => {
    const book = getBook(item.bookId);
    Speech.speak(item.verse.text, {
      language: 'hi-IN',
      rate: 0.85,
      pitch: 1.0,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: insets.top + webTopInset + 8, paddingHorizontal: 16 }}>
        <Text style={[styles.title, { color: colors.text, fontFamily: "NotoSansDevanagari_700Bold" }]}>
          सोद
        </Text>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.text, fontFamily: "NotoSansDevanagari_400Regular" }]}
            placeholder="वचन सोदात..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(""); setResults([]); setHasSearched(false); }} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </Pressable>
          )}
          <Pressable
            onPress={startVoiceSearch}
            hitSlop={8}
            style={[styles.micBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="mic" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          <Pressable
            onPress={() => { setSelectedBook(undefined); Haptics.selectionAsync(); }}
            style={[
              styles.filterChip,
              { borderColor: colors.border },
              !selectedBook && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.filterText, {
              color: !selectedBook ? '#fff' : colors.textSecondary,
              fontFamily: "NotoSansDevanagari_500Medium",
            }]}>
              सगळें
            </Text>
          </Pressable>
          {['GEN', 'PSA', 'MAT', 'JHN', 'ROM'].map(bookId => {
            const book = getBook(bookId);
            if (!book) return null;
            return (
              <Pressable
                key={bookId}
                onPress={() => { setSelectedBook(bookId === selectedBook ? undefined : bookId); Haptics.selectionAsync(); }}
                style={[
                  styles.filterChip,
                  { borderColor: colors.border },
                  selectedBook === bookId && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.filterText, {
                  color: selectedBook === bookId ? '#fff' : colors.textSecondary,
                  fontFamily: "NotoSansDevanagari_500Medium",
                }]}>
                  {book.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.bookId}-${item.chapter}-${item.verse.num}-${index}`}
        renderItem={renderResult}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={hasSearched ? "document-text-outline" : "search"}
              size={48}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
              {hasSearched ? "कांयच मेळूंक ना" : "बायबलांत वचन सोदात"}
            </Text>
            <Text style={[styles.emptyHint, { color: colors.textTertiary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
              🎤 माइक दामून उलयात, देखीक: "उत्पत्ति अध्याय 1 वाच"
            </Text>
          </View>
        }
        ListHeaderComponent={
          hasSearched && results.length > 0 ? (
            <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
              {results.length} परिणाम
            </Text>
          ) : null
        }
      />

      <Modal visible={showVoiceModal} transparent animationType="fade" onRequestClose={() => { setShowVoiceModal(false); setIsListening(false); }}>
        <View style={styles.voiceOverlay}>
          <Pressable style={styles.voiceBackdrop} onPress={() => { setShowVoiceModal(false); setIsListening(false); }} />
          <View style={[styles.voiceSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.voiceHeader}>
              <Text style={[styles.voiceTitle, { color: colors.text, fontFamily: "NotoSansDevanagari_600SemiBold" }]}>
                आवाज सोद
              </Text>
              <Pressable onPress={() => { setShowVoiceModal(false); setIsListening(false); }} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.voiceMicArea}>
              <Animated.View style={[
                styles.voiceRing,
                {
                  borderColor: colors.primary,
                  opacity: ringAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                  transform: [{ scale: ringAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }) }],
                },
              ]} />
              <Animated.View style={[
                styles.voiceMicCircle,
                {
                  backgroundColor: isListening ? colors.primary : colors.surfaceSecondary,
                  transform: [{ scale: pulseAnim }],
                },
              ]}>
                <Ionicons
                  name={isListening ? "mic" : "mic-outline"}
                  size={40}
                  color={isListening ? '#FFFFFF' : colors.textSecondary}
                />
              </Animated.View>
            </View>

            <Text style={[styles.voiceStatusText, {
              color: isListening ? colors.primary : colors.textSecondary,
              fontFamily: "NotoSansDevanagari_500Medium",
            }]}>
              {isListening ? "आयकतां..." : "माइक दामात वा खाला बरयात"}
            </Text>

            {voiceText.length > 0 && (
              <View style={[styles.voiceResult, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.voiceResultText, { color: colors.text, fontFamily: "NotoSansDevanagari_400Regular" }]}>
                  "{voiceText}"
                </Text>
              </View>
            )}

            <View style={styles.voiceInputRow}>
              <TextInput
                style={[styles.voiceInput, {
                  color: colors.text,
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  fontFamily: "NotoSansDevanagari_400Regular",
                }]}
                placeholder="उत्पत्ति अध्याय 1 वाच..."
                placeholderTextColor={colors.textTertiary}
                value={voiceText}
                onChangeText={setVoiceText}
                onSubmitEditing={handleVoiceSubmit}
                returnKeyType="go"
              />
              <Pressable
                onPress={handleVoiceSubmit}
                disabled={voiceText.trim().length === 0}
                style={[
                  styles.voiceGoBtn,
                  { backgroundColor: voiceText.trim().length > 0 ? colors.primary : colors.surfaceSecondary },
                ]}
              >
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={voiceText.trim().length > 0 ? '#FFFFFF' : colors.textTertiary}
                />
              </Pressable>
            </View>

            <View style={styles.voiceExamples}>
              <Text style={[styles.voiceExampleTitle, { color: colors.textSecondary, fontFamily: "NotoSansDevanagari_500Medium" }]}>
                देखी:
              </Text>
              {[
                { text: "उत्पत्ति अध्याय 1 वाच", action: () => { setVoiceText("उत्पत्ति अध्याय 1 वाच"); } },
                { text: "स्तोत्र 23", action: () => { setVoiceText("स्तोत्र 23"); } },
                { text: "जुवांव अध्याय 3", action: () => { setVoiceText("जुवांव अध्याय 3"); } },
              ].map((example, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => { example.action(); Haptics.selectionAsync(); }}
                  style={[styles.voiceExampleChip, { borderColor: colors.border }]}
                >
                  <Text style={[styles.voiceExampleText, { color: colors.textSecondary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
                    "{example.text}"
                  </Text>
                </Pressable>
              ))}
            </View>

            {Platform.OS !== 'web' && (
              <Text style={[styles.voiceNote, { color: colors.textTertiary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
                आवाज ओळख हातूंत बरोवन करात वा वेब आवृत्तीत माइक वापरात
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, marginBottom: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  micBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13 },
  resultItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  resultRef: { fontSize: 14 },
  resultEnglish: { fontSize: 11 },
  resultText: { fontSize: 15, lineHeight: 24 },
  resultCount: { fontSize: 13, marginBottom: 12, fontFamily: "NotoSansDevanagari_400Regular" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: { fontSize: 15, textAlign: "center" },
  emptyHint: { fontSize: 13, textAlign: "center", maxWidth: 280 },
  voiceOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  voiceBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  voiceSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  voiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  voiceTitle: { fontSize: 20 },
  voiceMicArea: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    height: 100,
  },
  voiceRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  voiceMicCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceStatusText: {
    textAlign: "center",
    fontSize: 15,
    marginBottom: 16,
  },
  voiceResult: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  voiceResultText: {
    fontSize: 16,
    textAlign: "center",
  },
  voiceInputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  voiceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  voiceGoBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceExamples: {
    gap: 8,
    marginBottom: 16,
  },
  voiceExampleTitle: { fontSize: 13 },
  voiceExampleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  voiceExampleText: { fontSize: 14 },
  voiceNote: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
