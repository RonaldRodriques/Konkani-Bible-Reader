import React, { useState } from "react";
import {
  StyleSheet, Text, View, FlatList, Pressable, Platform, Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { otBooks, ntBooks, type BookMeta } from "@/data/bible-meta";
import { getDailyVerse } from "@/data/daily-verses";
import { getAvailableChapters } from "@/data/bible-content";

function DailyVerseCard() {
  const { colors, isDark } = useTheme();
  const dailyVerse = getDailyVerse();

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({
      message: `"${dailyVerse.text}"\n\n— ${dailyVerse.reference}\n\nकोंकणी बायबल`,
    });
  };

  return (
    <LinearGradient
      colors={isDark ? ['#3D1A15', '#1C1917'] : ['#7B2D26', '#5C1F1B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.dailyCard}
    >
      <View style={styles.dailyCardHeader}>
        <View style={styles.dailyLabel}>
          <Ionicons name="sunny" size={14} color="#C4913D" />
          <Text style={styles.dailyLabelText}>आयचें वचन</Text>
        </View>
        <Pressable onPress={handleShare} hitSlop={12}>
          <Ionicons name="share-outline" size={20} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>
      <Text style={styles.dailyVerseText}>"{dailyVerse.text}"</Text>
      <Text style={styles.dailyReference}>— {dailyVerse.reference}</Text>
    </LinearGradient>
  );
}

function BookItem({ book }: { book: BookMeta }) {
  const { colors } = useTheme();
  const availableChapters = getAvailableChapters(book.id);
  const hasContent = availableChapters.length > 0;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/chapters", params: { bookId: book.id } });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.bookItem,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.bookItemLeft}>
        <Text
          style={[styles.bookName, { color: colors.text, fontFamily: "NotoSansDevanagari_600SemiBold" }]}
          numberOfLines={1}
        >
          {book.name}
        </Text>
        <Text style={[styles.bookEnglish, { color: colors.textSecondary }]} numberOfLines={1}>
          {book.englishName}
        </Text>
      </View>
      <View style={styles.bookItemRight}>
        <Text style={[styles.chapterCount, { color: colors.textTertiary }]}>
          {book.chapters} {book.chapters === 1 ? 'ch' : 'ch'}
        </Text>
        {hasContent && (
          <View style={[styles.contentDot, { backgroundColor: colors.accent }]} />
        )}
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'OT' | 'NT'>('OT');

  const books = activeTab === 'OT' ? otBooks : ntBooks;

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + webTopInset + 8,
          paddingBottom: 100,
          paddingHorizontal: 16,
        }}
        ListHeaderComponent={
          <>
            <Text style={[styles.appTitle, { color: colors.text, fontFamily: "NotoSansDevanagari_700Bold" }]}>
              कोंकणी बायबल
            </Text>
            <DailyVerseCard />
            <View style={styles.tabRow}>
              <Pressable
                onPress={() => { setActiveTab('OT'); Haptics.selectionAsync(); }}
                style={[
                  styles.tab,
                  activeTab === 'OT' && { backgroundColor: colors.primary },
                ]}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'OT' ? '#FFFFFF' : colors.textSecondary, fontFamily: "NotoSansDevanagari_500Medium" },
                ]}>
                  जुनो करार
                </Text>
                <Text style={[
                  styles.tabCount,
                  { color: activeTab === 'OT' ? 'rgba(255,255,255,0.7)' : colors.textTertiary },
                ]}>
                  39
                </Text>
              </Pressable>
              <Pressable
                onPress={() => { setActiveTab('NT'); Haptics.selectionAsync(); }}
                style={[
                  styles.tab,
                  activeTab === 'NT' && { backgroundColor: colors.primary },
                ]}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'NT' ? '#FFFFFF' : colors.textSecondary, fontFamily: "NotoSansDevanagari_500Medium" },
                ]}>
                  नवो करार
                </Text>
                <Text style={[
                  styles.tabCount,
                  { color: activeTab === 'NT' ? 'rgba(255,255,255,0.7)' : colors.textTertiary },
                ]}>
                  27
                </Text>
              </Pressable>
            </View>
          </>
        }
        renderItem={({ item }) => <BookItem book={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appTitle: {
    fontSize: 28,
    marginBottom: 16,
  },
  dailyCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  dailyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dailyLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dailyLabelText: {
    color: "#C4913D",
    fontSize: 13,
    fontFamily: "NotoSansDevanagari_500Medium",
    letterSpacing: 0.5,
  },
  dailyVerseText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "NotoSansDevanagari_400Regular",
    lineHeight: 26,
    marginBottom: 12,
  },
  dailyReference: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "NotoSansDevanagari_500Medium",
  },
  tabRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 15,
  },
  tabCount: {
    fontSize: 12,
  },
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  bookItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  bookName: {
    fontSize: 16,
  },
  bookEnglish: {
    fontSize: 12,
    marginTop: 2,
  },
  bookItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chapterCount: {
    fontSize: 12,
  },
  contentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
