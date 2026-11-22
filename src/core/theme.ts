import { Platform } from 'react-native';

export const colors = {
  bg: '#FFF8EC',
  surface: '#FFF1DB',
  card: '#FFFFFF',
  primary: '#B4410B',
  primaryDark: '#7A1F1F',
  primaryBg: '#FCEEE6',
  heroBg: '#7A1F1F',
  heroSurface: '#631717',
  heroAccent: '#F5C469',
  heroText: '#FFF8EC',
  heroMuted: '#EDD4C6',
  text: '#2B1B10',
  muted: '#7B6A5A',
  border: '#EADBC4',
  good: '#2E7D32',
  goodBg: '#EAF5EB',
  ok: '#B7791F',
  okBg: '#FDF5E2',
  bad: '#C62828',
  badBg: '#FDECEC',
  neutral: '#8D7B68',
  neutralBg: '#F4EFE8',
};

export const fonts = {
  regular: 'NotoSansTamil_400Regular',
  bold: 'NotoSansTamil_700Bold',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24 };

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#4A2511',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
    },
    android: { elevation: 2 },
    default: {},
  }),
  hero: Platform.select({
    ios: {
      shadowColor: '#4A1212',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
    },
    android: { elevation: 4 },
    default: {},
  }),
};
