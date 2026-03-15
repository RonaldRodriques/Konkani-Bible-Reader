import React from "react";
import {
  StyleSheet, Text, View, Pressable, FlatList, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { getBook } from "@/data/bible-meta";
import { getAvailableChapters } from "@/data/bible-content";

export default function ChaptersScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const book = getBook(bookId || '');
  const availableChapters = getAvailableChapters(bookId || '');
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Book not found</Text>
      </View>
    );
  }

  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  const handleChapterPress = (chapter: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/reader",
      params: { bookId: book.id, chapter: chapter.toString() },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.bookName, { color: colors.text, fontFamily: "NotoSansDevanagari_700Bold" }]}>
            {book.name}
          </Text>
          <Text style={[styles.bookEnglish, { color: colors.textSecondary }]}>
            {book.englishName}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.categoryRow}>
        <Text style={[styles.categoryText, { color: colors.textTertiary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
          {book.testament === 'OT' ? 'जुनो करार' : 'नवो करार'} — {book.category}
        </Text>
        <Text style={[styles.chapterCountText, { color: colors.textTertiary }]}>
          {book.chapters} अध्याय
        </Text>
      </View>

      <FlatList
        data={chapters}
        numColumns={5}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const hasContent = availableChapters.includes(item);
          return (
            <Pressable
              onPress={() => handleChapterPress(item)}
              style={({ pressed }) => [
                styles.chapterBtn,
                {
                  backgroundColor: hasContent ? colors.surface : colors.surfaceSecondary,
                  borderColor: hasContent ? colors.border : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[
                styles.chapterNum,
                {
                  color: hasContent ? colors.text : colors.textTertiary,
                  fontFamily: hasContent ? "NotoSansDevanagari_600SemiBold" : "NotoSansDevanagari_400Regular",
                },
              ]}>
                {item}
              </Text>
              {hasContent && (
                <View style={[styles.dot, { backgroundColor: colors.accent }]} />
              )}
            </Pressable>
          );
        }}
      />
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
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  bookName: { fontSize: 22 },
  bookEnglish: { fontSize: 13, marginTop: 2 },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryText: { fontSize: 13 },
  chapterCountText: { fontSize: 13 },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  gridRow: {
    gap: 10,
    marginBottom: 10,
  },
  chapterBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "18%",
  },
  chapterNum: { fontSize: 18 },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: "absolute",
    bottom: 8,
  },
  errorText: { fontSize: 16, textAlign: "center", marginTop: 100 },
});
