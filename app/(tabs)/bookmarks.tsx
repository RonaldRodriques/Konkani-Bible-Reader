import React, { useState } from "react";
import {
  StyleSheet, Text, View, FlatList, Pressable, Platform, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserData } from "@/contexts/UserDataContext";
import Colors from "@/constants/colors";
import type { Bookmark, Highlight, Note } from "@/lib/storage";

type TabType = 'bookmarks' | 'highlights' | 'notes';

export default function BookmarksScreen() {
  const { colors, isDark } = useTheme();
  const { bookmarks, highlights, notes, removeBookmark, removeHighlight, removeNote } = useUserData();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('bookmarks');

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const highlightColorMap: Record<string, string> = isDark
    ? Colors.dark.highlight
    : Colors.light.highlight;

  const handleDelete = (type: TabType, item: Bookmark | Highlight | Note) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "काडूंक जाय?",
      "हें काडूंक खात्री आसा?",
      [
        { text: "ना", style: "cancel" },
        {
          text: "हय",
          style: "destructive",
          onPress: () => {
            if (type === 'bookmarks') removeBookmark(item.bookId, item.chapter, item.verse);
            else if (type === 'highlights') removeHighlight(item.bookId, item.chapter, item.verse);
            else removeNote(item.bookId, item.chapter, item.verse);
          }
        },
      ]
    );
  };

  const navigateToVerse = (bookId: string, chapter: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/reader",
      params: { bookId, chapter: chapter.toString() },
    });
  };

  const renderBookmark = ({ item }: { item: Bookmark }) => (
    <Pressable
      onPress={() => navigateToVerse(item.bookId, item.chapter)}
      onLongPress={() => handleDelete('bookmarks', item)}
      style={({ pressed }) => [
        styles.savedItem,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.savedIcon}>
        <Ionicons name="bookmark" size={18} color={colors.accent} />
      </View>
      <View style={styles.savedContent}>
        <Text style={[styles.savedRef, { color: colors.primary, fontFamily: "NotoSansDevanagari_600SemiBold" }]}>
          {item.bookName} {item.chapter}:{item.verse}
        </Text>
        <Text
          style={[styles.savedText, { color: colors.text, fontFamily: "NotoSansDevanagari_400Regular" }]}
          numberOfLines={2}
        >
          {item.text}
        </Text>
      </View>
      <Pressable onPress={() => handleDelete('bookmarks', item)} hitSlop={8}>
        <Ionicons name="close" size={18} color={colors.textTertiary} />
      </Pressable>
    </Pressable>
  );

  const renderHighlight = ({ item }: { item: Highlight }) => (
    <Pressable
      onPress={() => navigateToVerse(item.bookId, item.chapter)}
      onLongPress={() => handleDelete('highlights', item)}
      style={({ pressed }) => [
        styles.savedItem,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.colorDot, { backgroundColor: highlightColorMap[item.color] || colors.accent }]} />
      <View style={styles.savedContent}>
        <Text style={[styles.savedRef, { color: colors.primary, fontFamily: "NotoSansDevanagari_600SemiBold" }]}>
          {item.bookName} {item.chapter}:{item.verse}
        </Text>
        <Text
          style={[styles.savedText, { color: colors.text, fontFamily: "NotoSansDevanagari_400Regular" }]}
          numberOfLines={2}
        >
          {item.text}
        </Text>
      </View>
      <Pressable onPress={() => handleDelete('highlights', item)} hitSlop={8}>
        <Ionicons name="close" size={18} color={colors.textTertiary} />
      </Pressable>
    </Pressable>
  );

  const renderNote = ({ item }: { item: Note }) => (
    <Pressable
      onPress={() => navigateToVerse(item.bookId, item.chapter)}
      onLongPress={() => handleDelete('notes', item)}
      style={({ pressed }) => [
        styles.savedItem,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.savedIcon}>
        <Ionicons name="document-text" size={18} color={colors.accent} />
      </View>
      <View style={styles.savedContent}>
        <Text style={[styles.savedRef, { color: colors.primary, fontFamily: "NotoSansDevanagari_600SemiBold" }]}>
          {item.bookName} {item.chapter}:{item.verse}
        </Text>
        <Text
          style={[styles.noteText, { color: colors.text, fontFamily: "NotoSansDevanagari_400Regular" }]}
          numberOfLines={2}
        >
          {item.noteText}
        </Text>
        <Text
          style={[styles.versePreview, { color: colors.textTertiary, fontFamily: "NotoSansDevanagari_400Regular" }]}
          numberOfLines={1}
        >
          {item.verseText}
        </Text>
      </View>
      <Pressable onPress={() => handleDelete('notes', item)} hitSlop={8}>
        <Ionicons name="close" size={18} color={colors.textTertiary} />
      </Pressable>
    </Pressable>
  );

  const getActiveData = () => {
    if (activeTab === 'bookmarks') return bookmarks;
    if (activeTab === 'highlights') return highlights;
    return notes;
  };

  const getEmptyMessage = () => {
    if (activeTab === 'bookmarks') return "अजून बुकमार्क नात";
    if (activeTab === 'highlights') return "अजून हायलायट नात";
    return "अजून टिपणां नात";
  };

  const getEmptyIcon = (): keyof typeof Ionicons.glyphMap => {
    if (activeTab === 'bookmarks') return "bookmark-outline";
    if (activeTab === 'highlights') return "color-palette-outline";
    return "document-text-outline";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: insets.top + webTopInset + 8, paddingHorizontal: 16 }}>
        <Text style={[styles.title, { color: colors.text, fontFamily: "NotoSansDevanagari_700Bold" }]}>
          सांबाळिल्लें
        </Text>
        <View style={styles.tabRow}>
          {(['bookmarks', 'highlights', 'notes'] as TabType[]).map(tab => (
            <Pressable
              key={tab}
              onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[
                styles.tabText,
                {
                  color: activeTab === tab ? '#fff' : colors.textSecondary,
                  fontFamily: "NotoSansDevanagari_500Medium",
                },
              ]}>
                {tab === 'bookmarks' ? 'बुकमार्क' : tab === 'highlights' ? 'हायलायट' : 'टिपणां'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={getActiveData() as any[]}
        keyExtractor={(item: any) => item.id}
        renderItem={
          activeTab === 'bookmarks'
            ? renderBookmark as any
            : activeTab === 'highlights'
            ? renderHighlight as any
            : renderNote as any
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name={getEmptyIcon()} size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
              {getEmptyMessage()}
            </Text>
            <Text style={[styles.emptyHint, { color: colors.textTertiary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
              वाचतना वचनाचेर लांब दामून धरात
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, marginBottom: 16 },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabText: { fontSize: 13 },
  savedItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  savedIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginTop: 4,
  },
  savedContent: { flex: 1 },
  savedRef: { fontSize: 14, marginBottom: 4 },
  savedText: { fontSize: 14, lineHeight: 22 },
  noteText: { fontSize: 14, lineHeight: 22, marginBottom: 4 },
  versePreview: { fontSize: 12, lineHeight: 18 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: { fontSize: 16, textAlign: "center" },
  emptyHint: { fontSize: 13, textAlign: "center" },
});
