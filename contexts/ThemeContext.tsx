import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  colors: typeof Colors.light;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = 'bible_theme';
const FONT_SIZE_KEY = 'bible_font_size';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [fontSize, setFontSizeState] = useState(18);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      const savedFontSize = await AsyncStorage.getItem(FONT_SIZE_KEY);
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
      if (savedFontSize !== null) {
        setFontSizeState(parseInt(savedFontSize, 10));
      }
      setLoaded(true);
    })();
  }, []);

  const toggleTheme = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    AsyncStorage.setItem(THEME_KEY, newValue ? 'dark' : 'light');
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
    AsyncStorage.setItem(FONT_SIZE_KEY, size.toString());
  };

  const colors = isDark ? Colors.dark : Colors.light;

  const value = useMemo(
    () => ({ isDark, toggleTheme, fontSize, setFontSize, colors }),
    [isDark, fontSize, loaded]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
