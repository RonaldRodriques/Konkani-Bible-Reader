const Colors = {
  light: {
    primary: '#7B2D26',
    accent: '#C4913D',
    background: '#FAF7F2',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F0E8',
    text: '#1C1917',
    textSecondary: '#78716C',
    textTertiary: '#A8A29E',
    border: '#E7E5E4',
    tint: '#7B2D26',
    tabIconDefault: '#A8A29E',
    tabIconSelected: '#7B2D26',
    verseNumber: '#C4913D',
    sectionHeader: '#7B2D26',
    highlight: {
      yellow: '#FEF3C7',
      green: '#D1FAE5',
      blue: '#DBEAFE',
      pink: '#FCE7F3',
      orange: '#FFEDD5',
    },
  },
  dark: {
    primary: '#D4816B',
    accent: '#C4913D',
    background: '#0C0A09',
    surface: '#1C1917',
    surfaceSecondary: '#292524',
    text: '#FAF7F2',
    textSecondary: '#A8A29E',
    textTertiary: '#78716C',
    border: '#44403C',
    tint: '#D4816B',
    tabIconDefault: '#78716C',
    tabIconSelected: '#D4816B',
    verseNumber: '#C4913D',
    sectionHeader: '#D4816B',
    highlight: {
      yellow: '#78350F',
      green: '#064E3B',
      blue: '#1E3A5F',
      pink: '#831843',
      orange: '#7C2D12',
    },
  },
};

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

export default Colors;
