import React from "react";
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";

function SettingRow({ icon, label, children, colors }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={colors.accent} />
        <Text style={[styles.settingLabel, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]}>
          {label}
        </Text>
      </View>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme, fontSize, setFontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const fontSizes = [
    { label: "छोटो", value: 15 },
    { label: "मदलो", value: 18 },
    { label: "व्हड", value: 22 },
    { label: "खूब व्हड", value: 26 },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + webTopInset + 8,
        paddingHorizontal: 16,
        paddingBottom: 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text, fontFamily: "NotoSansDevanagari_700Bold" }]}>
        सेटिंग्ज
      </Text>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: "NotoSansDevanagari_600SemiBold" }]}>
          दिसपट्टी
        </Text>

        <SettingRow icon="moon" label="काळखो मोड" colors={colors}>
          <Switch
            value={isDark}
            onValueChange={() => {
              toggleTheme();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </SettingRow>

        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={styles.settingLeft}>
            <Ionicons name="text" size={20} color={colors.accent} />
            <Text style={[styles.settingLabel, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]}>
              अक्षर आकार
            </Text>
          </View>
        </View>

        <View style={styles.fontSizeRow}>
          {fontSizes.map((fs) => (
            <Pressable
              key={fs.value}
              onPress={() => {
                setFontSize(fs.value);
                Haptics.selectionAsync();
              }}
              style={[
                styles.fontSizeBtn,
                { borderColor: colors.border },
                fontSize === fs.value && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <Text style={[
                styles.fontSizeBtnText,
                {
                  color: fontSize === fs.value ? '#fff' : colors.textSecondary,
                  fontFamily: "NotoSansDevanagari_500Medium",
                },
              ]}>
                {fs.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.previewBox, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={{
            fontSize: fontSize,
            color: colors.text,
            fontFamily: "NotoSansDevanagari_400Regular",
            lineHeight: fontSize * 1.6,
          }}>
            सर्वेस्पर म्हजो गोवळी; म्हाका कांयच उणें पडचें ना.
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary, fontFamily: "NotoSansDevanagari_400Regular", marginTop: 8 }}>
            स्तोत्र 23:1
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: "NotoSansDevanagari_600SemiBold" }]}>
          विशीं
        </Text>

        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
            नांव
          </Text>
          <Text style={[styles.aboutValue, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]}>
            कोंकणी बायबल
          </Text>
        </View>

        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
            आवृत्ती
          </Text>
          <Text style={[styles.aboutValue, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]}>
            1.0.0
          </Text>
        </View>

        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
            भास
          </Text>
          <Text style={[styles.aboutValue, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]}>
            कोंकणी (देवनागरी)
          </Text>
        </View>

        <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
            उद्देश
          </Text>
          <Text style={[styles.aboutValue, { color: colors.text, fontFamily: "NotoSansDevanagari_500Medium" }]}>
            इगर्ज आनी भक्तीसंगी वापर
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Ionicons name="heart" size={16} color={colors.accent} />
        <Text style={[styles.footerText, { color: colors.textTertiary, fontFamily: "NotoSansDevanagari_400Regular" }]}>
          देवाच्या म्हिमे खातीर
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, marginBottom: 20 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: { fontSize: 16 },
  fontSizeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  fontSizeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  fontSizeBtnText: { fontSize: 12 },
  previewBox: {
    padding: 16,
    borderRadius: 12,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  aboutLabel: { fontSize: 14 },
  aboutValue: { fontSize: 14 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    marginBottom: 32,
  },
  footerText: { fontSize: 13 },
});
